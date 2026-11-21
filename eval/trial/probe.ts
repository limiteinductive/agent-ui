// Independent breakage probes, to find what the diagnostics miss. Not part of the library.
// node probe.ts [--pass first|final|all] -> results/probe.jsonl, prints pages the diagnostics call clean but a probe flags.
import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { parseArgs } from 'node:util'
import type { Score } from './score.ts'

const { values: opt } = parseArgs({ options: { pass: { type: 'string', default: 'all' }, filter: { type: 'string' }, page: { type: 'string' }, scores: { type: 'string', default: 'results/scores.jsonl' }, out: { type: 'string', default: 'results/probe.jsonl' } } })
const ROOT = new URL('.', import.meta.url).pathname
process.chdir(ROOT)
const DIST = new URL('../../packages/core/dist/', import.meta.url).pathname
const scores: Score[] = process.argv.includes('--page') ? [] : readFileSync(opt.scores!, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l))

// first = p0 of each chain; final = last page of each chain
const byItem = new Map<string, Score[]>()
for (const s of scores) { const k = s.page.replace(/-p\d+\.html$/, ''); (byItem.get(k) ?? byItem.set(k, []).get(k)!).push(s) }
let pages: Score[] = []
for (const c of byItem.values()) {
  c.sort((a, b) => a.page.localeCompare(b.page))
  if (opt.pass === 'first') pages.push(c[0])
  else if (opt.pass === 'final') pages.push(c[c.length - 1])
  else pages.push(...c)
}
if (opt.filter) pages = pages.filter(p => p.page.includes(opt.filter!))
if (opt.page) pages = [{ page: opt.page, clean: true } as Score]

const server = createServer((req, res) => {
  const file = join(ROOT, normalize(decodeURIComponent(new URL(req.url!, 'http://x').pathname)))
  if (!file.startsWith(ROOT) || !existsSync(file)) { res.writeHead(404).end(); return }
  res.writeHead(200, { 'content-type': extname(file) === '.html' ? 'text/html' : 'application/octet-stream' }).end(readFileSync(file))
})
await new Promise<void>(r => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`
const browser = await chromium.launch({ channel: 'chrome' })

interface Finding { kind: 'overlap' | 'clipped' | 'offscreen'; a: string; b?: string; px: number }

async function probe(rel: string, width: number): Promise<Finding[]> {
  const ctx = await browser.newContext({ viewport: { width, height: 800 } })
  await ctx.route(/\/agent-ui(\.min)?\.m?js(\?|#|$)/, r => r.fulfill({ path: DIST + 'agent-ui.js', contentType: 'text/javascript' }))
  const page = await ctx.newPage()
  try {
    await page.goto(`${base}/${rel}`, { waitUntil: 'load', timeout: 30_000 }).catch(() => {})
    await page.evaluate(() => Promise.race([(window as any).__uiReady, new Promise(r => setTimeout(r, 5000))])).catch(() => {})
    return await page.evaluate(() => {
      const out: { kind: string; a: string; b?: string; px: number }[] = []
      const tag = (el: Element) => {
        let s = '<' + el.localName
        for (const a of el.attributes) if (!a.name.startsWith('data-ui') && a.name !== 'tabindex' && a.name !== 'role') s += a.value === '' ? ` ${a.name}` : ` ${a.name}="${a.value.slice(0, 30)}"`
        return s.slice(0, 100) + '>' + ((el as HTMLElement).innerText ?? '').trim().slice(0, 30).replace(/\s+/g, ' ')
      }
      const visible = (el: Element) => { const r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2 }
      const inFlow = (el: Element) => { const cs = getComputedStyle(el), p = cs.position; return (p === 'static' || p === 'relative' || p === 'sticky') && cs.display !== 'inline' }
      const hasContent = (el: Element) => !!((el as HTMLElement).innerText?.trim()) || /^(img|svg|video|canvas|input|select|textarea|button|iframe|picture)$/.test(el.localName)
      // 1. overlapping in-flow siblings (outside ui-overlay and outside grids that place items in the same area on purpose)
      for (const parent of document.body.querySelectorAll('*')) {
        if (parent.localName === 'ui-overlay') continue
        const cs = getComputedStyle(parent)
        if (cs.display === 'none' || cs.display === 'contents') continue
        const kids = [...parent.children].filter(k => visible(k) && inFlow(k) && hasContent(k))
        for (let i = 0; i < kids.length; i++) for (let j = i + 1; j < kids.length; j++) {
          const a = kids[i].getBoundingClientRect(), b = kids[j].getBoundingClientRect()
          const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left)
          const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
          if (ox > 4 && oy > 4) out.push({ kind: 'overlap', a: tag(kids[i]), b: tag(kids[j]), px: Math.round(Math.min(ox, oy)) })
        }
      }
      // 2. content cut off by a clipping (hidden/clip) ancestor, or past the viewport's right edge
      const vw = document.documentElement.clientWidth
      const clipped = new Set<Element>()
      for (const el of document.body.querySelectorAll('*')) {
        if (!visible(el) || !hasContent(el) || el.children.length > 0 && !/^(button|a|ui-button|label)$/.test(el.localName) && el.querySelector('*') && [...el.children].some(visible)) continue // leaves (and small controls) only
        const r = el.getBoundingClientRect()
        let anc = el.parentElement, scrolled = false
        while (anc && anc !== document.documentElement) {
          const cs = getComputedStyle(anc)
          if (cs.overflowX === 'auto' || cs.overflowX === 'scroll') { scrolled = true; break }
          if ((cs.overflowX === 'hidden' || cs.overflowX === 'clip') && !/^(img|picture|video|svg)$/.test(el.localName)) {
            const ar = anc.getBoundingClientRect()
            const past = Math.round(Math.max(r.right - ar.right, ar.left - r.left))
            if (past > 4 && !clipped.has(anc)) { clipped.add(anc); out.push({ kind: 'clipped', a: tag(el), b: tag(anc), px: past }) }
            break
          }
          anc = anc.parentElement
        }
        if (!scrolled && r.right > vw + 4 && !clipped.size) out.push({ kind: 'offscreen', a: tag(el), px: Math.round(r.right - vw) })
      }
      return out.slice(0, 40)
    }) as Finding[]
  } finally { await ctx.close() }
}

const results: { page: string; clean: boolean; width: number; findings: Finding[] }[] = []
let i = 0
await Promise.all(Array.from({ length: 4 }, async () => {
  while (i < pages.length) {
    const s = pages[i++]
    for (const w of [360, 1280]) results.push({ page: s.page, clean: s.clean, width: w, findings: await probe(s.page, w) })
  }
}))
await browser.close(); server.close()
if (!opt.page) writeFileSync(opt.out!, results.map(r => JSON.stringify(r)).join('\n') + '\n')

const flagged = results.filter(r => r.findings.length)
console.log(`${pages.length} pages probed; ${new Set(flagged.map(r => r.page)).size} flagged; flagged but diagnostics-clean: ${new Set(flagged.filter(r => r.clean).map(r => r.page)).size}`)
for (const r of flagged.filter(r => r.clean)) {
  console.log(`\n${r.page} @${r.width}`)
  for (const f of r.findings.slice(0, 6)) console.log(`  ${f.kind} ${f.px}px  ${f.a}${f.b ? `  ×  ${f.b}` : ''}`)
}
