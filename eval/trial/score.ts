// Renders a page in Chrome at 360 and 1280 (light), with any agent-ui URL served from the local dist, and reads window.__ui.
import { chromium, type Browser } from 'playwright'
import { createServer, type Server } from 'node:http'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, extname, join, normalize } from 'node:path'

const ROOT = new URL('.', import.meta.url).pathname
const DIST = new URL('../../packages/core/dist/', import.meta.url).pathname
const LIB = /\/agent-ui(\.min)?\.m?js(\?|#|$)/
export const WIDTHS = [360, 1280]

export interface Diag { code: string; severity: string; count: number; path: string; snippet: string; got: string; text: string; allowedBy?: string }
export interface WidthScore {
  width: number; loaded: boolean; off: boolean; navError?: string; evalError?: string
  summary?: string; diagnostics: Diag[]; pageErrors: string[]; shot: string
}
export interface Score { page: string; widths: WidthScore[]; errors: number; warns: number; infos: number; allowed: number; clean: boolean }

const TYPES: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' }

const within = <T>(p: Promise<T>, ms: number, what: string) =>
  Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error(`${what} timed out after ${ms}ms`)), ms))])

export class Scorer {
  #slots = 4
  #waiting: (() => void)[] = []
  private browser: Browser; private server: Server; private base: string
  private constructor(browser: Browser, server: Server, base: string) { this.browser = browser; this.server = server; this.base = base }

  static async start() {
    const server = createServer((req, res) => {
      const file = join(ROOT, normalize(decodeURIComponent(new URL(req.url!, 'http://x').pathname)))
      if (!file.startsWith(ROOT) || !existsSync(file)) { res.writeHead(404).end(); return }
      res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file))
    })
    await new Promise<void>(r => server.listen(0, '127.0.0.1', r))
    const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`
    return new Scorer(await chromium.launch({ channel: 'chrome' }), server, base)
  }

  async close() { await this.browser.close(); this.server.close() }

  async score(page: string): Promise<Score> {
    if (this.#slots === 0) await new Promise<void>(r => this.#waiting.push(r))
    this.#slots--
    try {
      const widths: WidthScore[] = []
      for (const w of WIDTHS) widths.push(await this.#one(page, w))
      return summarize(page, widths)
    } finally {
      this.#slots++
      this.#waiting.shift()?.()
    }
  }

  async #one(rel: string, width: number): Promise<WidthScore> {
    const ctx = await this.browser.newContext({ viewport: { width, height: 800 }, colorScheme: 'light' })
    await ctx.route(LIB, r => r.fulfill({ path: DIST + (/\.mjs/.test(r.request().url()) ? 'agent-ui.mjs' : 'agent-ui.js'), contentType: 'text/javascript' }))
    const page = await ctx.newPage()
    const shot = join('out', 'shots', rel.replace(/^pages(?:-([^/]+))?\//, (_, t) => t ? `${t}/` : '').replace(/\.html$/, `-${width}.jpg`))
    const s: WidthScore = { width, loaded: false, off: false, diagnostics: [], pageErrors: [], shot }
    page.on('pageerror', e => s.pageErrors.push(e.message.slice(0, 300)))
    page.on('dialog', d => { d.dismiss().catch(() => {}) })
    try {
      try { await page.goto(`${this.base}/${rel}`, { waitUntil: 'load', timeout: 30_000 }) }
      catch (e) { s.navError = String((e as Error).message).split('\n')[0] }
      s.loaded = await page.evaluate(() => !!(window as any).__uiReady).catch(() => false)
      if (s.loaded) {
        try {
          const rep = await within(page.evaluate(async () => {
            await (window as any).__uiReady
            return JSON.parse(JSON.stringify(await (window as any).__ui.check()))
          }), 20_000, 'check')
          s.summary = rep.summary
          s.off = /\] off \(/.test(rep.summary)
          s.diagnostics = rep.diagnostics.map((d: any) => ({
            code: d.code, severity: d.severity, count: d.count, path: d.path, snippet: d.snippet, got: d.got, text: d.text,
            ...(d.allowedBy ? { allowedBy: d.allowedBy } : {}),
          }))
        } catch (e) { s.evalError = String((e as Error).message).split('\n')[0] }
      }
      mkdirSync(dirname(join(ROOT, shot)), { recursive: true })
      await page.screenshot({ path: join(ROOT, shot), fullPage: true, type: 'jpeg', quality: 70, timeout: 20_000 }).catch(() => {})
    } finally { await ctx.close() }
    return s
  }
}

function summarize(page: string, widths: WidthScore[]): Score {
  // one problem per (code, path) across both widths
  const seen = new Map<string, string>()
  let allowed = 0
  for (const w of widths) for (const d of w.diagnostics) {
    if (d.allowedBy) { allowed++; continue }
    seen.set(`${d.code}|${d.path}`, d.severity)
  }
  const n = (sev: string) => [...seen.values()].filter(s => s === sev).length
  const errors = n('error') + widths.filter(w => !w.loaded || w.off || w.evalError).length
  const warns = n('warn')
  return { page, widths, errors, warns, infos: n('info'), allowed, clean: errors === 0 && warns === 0 }
}

/** What the agent is shown for a fix pass: the console output at each width, without repeats. */
export function diagText(score: Score, cdn: string): string {
  const lines: string[] = []
  const shown = new Set<string>()
  for (const w of score.widths) {
    lines.push(`At ${w.width}px wide:`)
    if (!w.loaded) { lines.push(`agent-ui did not load (window.__ui is undefined). Load it with <script src="${cdn}"></script>.`); continue }
    if (w.off) { lines.push('Diagnostics are switched off (data-ui-diagnostics="off"). Remove that attribute so the page can be checked.'); continue }
    if (w.evalError) { lines.push(`the page did not settle: ${w.evalError}`); continue }
    lines.push(w.summary!)
    let fresh = 0
    for (const d of w.diagnostics) {
      if (d.allowedBy) continue
      const line = `[${d.severity}] ${d.text}`
      if (shown.has(line)) continue
      shown.add(line); fresh++
      lines.push(line)
    }
    if (!fresh && w.diagnostics.some(d => !d.allowedBy)) lines.push('(same as above)')
  }
  return lines.join('\n')
}
