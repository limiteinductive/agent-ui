// node report.ts [tag] — results[-tag]/report.md + results/summary.json from scores.jsonl, gen.jsonl and the pages; out/sheet.html for visual review.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import type { Score } from './score.ts'

process.chdir(new URL('.', import.meta.url).pathname)
const TAG = process.argv[2], RES = TAG ? `results-${TAG}` : 'results'
const lines = (f: string) => existsSync(f) ? readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)) : []
const scores = new Map<string, Score>(lines(`${RES}/scores.jsonl`).map((s: Score) => [s.page, s]))
const gen = lines(`${RES}/gen.jsonl`)

const MODELS = ['gpt-5.6', 'gpt-6.2', 'opus', 'sonnet', 'haiku']
const CONDS = ['skill', 'bare']
const KEY = /^pages(?:-\w+)?\/(\w+)\/(\w+)\/(.+)-s(\d+)-p(\d+)\.html$/
interface Row { page: string; cond: string; task: string; model: string; sample: number; pass: number; score: Score; html: string }
const rows: Row[] = [...scores.values()].map(score => {
  const [, cond, task, model, sample, pass] = KEY.exec(score.page)!
  return { page: score.page, cond, task, model, sample: +sample, pass: +pass, score, html: readFileSync(score.page, 'utf8') }
})
const item = (r: Row) => `${r.cond}/${r.task}/${r.model}/${r.sample}`
const chains = new Map<string, Row[]>()
for (const r of rows) (chains.get(item(r)) ?? chains.set(item(r), []).get(item(r))!).push(r)
for (const c of chains.values()) c.sort((a, b) => a.pass - b.pass)
const failed = gen.filter(g => g.error)

const pct = (a: number, b: number) => b ? `${Math.round(100 * a / b)}%` : '–'
const mean = (xs: number[]) => xs.length ? (xs.reduce((a, b) => a + b, 0) / xs.length) : 0
const f1 = (x: number) => x.toFixed(1)
const table = (head: string[], body: (string | number)[][]) =>
  [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...body.map(r => `| ${r.join(' | ')} |`)].join('\n')

/** Clean by pass k: the chain reached a clean page at or before pass k. */
const cleanBy = (c: Row[], k: number) => c.some(r => r.pass <= k && r.score.clean)

function adoption(html: string) {
  const body = html.replace(/<script[\s\S]*?<\/script>/gi, '')
  const ui = body.match(/<ui-[a-z0-9-]+/g) ?? []
  const styleCss = [...body.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].reduce((n, m) => n + m[1].trim().length, 0)
  return {
    ui: ui.length, uiKinds: new Set(ui).size,
    styleCss, styleAttrs: (body.match(/\sstyle="/g) ?? []).length, classes: (body.match(/\sclass="/g) ?? []).length,
    allow: (body.match(/data-ui-allow/g) ?? []).length, off: /data-ui-diagnostics\s*=\s*["']?off/.test(body),
  }
}

const md: string[] = ['# Agent trial results', '']
const summary: Record<string, unknown> = {}

// ---------------------------------------------------------------- headline
const head = ['model', 'cond', 'n', 'first-shot clean', 'clean ≤ fix 1', 'clean ≤ fix 2', 'p0 errors', 'p0 warns', 'gen failures']
const body: (string | number)[][] = []
for (const cond of CONDS) {
  for (const model of [...MODELS, 'all']) {
    const cs = [...chains.values()].filter(c => c[0].cond === cond && (model === 'all' || c[0].model === model) && c[0].pass === 0)
    if (!cs.length) continue
    const fails = failed.filter(g => g.cond === cond && (model === 'all' || g.model === model)).length
    body.push([model === 'all' ? '**all**' : model, cond, cs.length,
      pct(cs.filter(c => cleanBy(c, 0)).length, cs.length), pct(cs.filter(c => cleanBy(c, 1)).length, cs.length), pct(cs.filter(c => cleanBy(c, 2)).length, cs.length),
      f1(mean(cs.map(c => c[0].score.errors))), f1(mean(cs.map(c => c[0].score.warns))), fails])
  }
}
md.push('## Convergence', '', '"Clean" means 0 errors and 0 warnings at both 360 and 1280 (light), counting each (code, element) once. "Clean ≤ fix k" means the page became clean by the k-th diagnostic-driven fix pass.', '', table(head, body), '')

// ---------------------------------------------------------------- per task
const tbody: (string | number)[][] = []
for (const cond of CONDS) for (const task of [...new Set(rows.map(r => r.task))]) {
  const cs = [...chains.values()].filter(c => c[0].cond === cond && c[0].task === task && c[0].pass === 0)
  tbody.push([task, cond, cs.length, pct(cs.filter(c => cleanBy(c, 0)).length, cs.length), pct(cs.filter(c => cleanBy(c, 2)).length, cs.length)])
}
md.push('## By task', '', table(['task', 'cond', 'n', 'first-shot clean', 'clean ≤ fix 2'], tbody), '')

// ---------------------------------------------------------------- codes
const codeRows: (string | number)[][] = []
const codeStats: Record<string, Record<string, { pages: number; instances: number }>> = {}
for (const cond of CONDS) {
  const p0 = rows.filter(r => r.cond === cond && r.pass === 0)
  const by = new Map<string, { pages: Set<string>; instances: number }>()
  for (const r of p0) {
    const seen = new Set<string>()
    for (const w of r.score.widths) for (const d of w.diagnostics) {
      if (d.allowedBy) continue
      const k = `${d.code}|${d.path}`
      if (seen.has(k)) continue
      seen.add(k)
      const e = by.get(d.code) ?? by.set(d.code, { pages: new Set(), instances: 0 }).get(d.code)!
      e.pages.add(r.page); e.instances += d.count
    }
  }
  codeStats[cond] = Object.fromEntries([...by].map(([c, e]) => [c, { pages: e.pages.size, instances: e.instances }]))
  for (const [code, e] of [...by].sort((a, b) => b[1].pages.size - a[1].pages.size)) codeRows.push([code, cond, `${e.pages.size}/${p0.length}`, e.instances])
}
summary.codes = codeStats
md.push('## Diagnostics on first shots', '', table(['code', 'cond', 'pages', 'instances'], codeRows), '')

// ---------------------------------------------------------------- fix passes
const fixRows: (string | number)[][] = []
for (const cond of CONDS) for (const k of [1, 2]) {
  const pairs = [...chains.values()].filter(c => c[0].cond === cond).map(c => [c.find(r => r.pass === k - 1), c.find(r => r.pass === k)]).filter(([a, b]) => a && b) as Row[][]
  if (!pairs.length) continue
  let fixed = 0, introduced = 0, regressed = 0
  for (const [a, b] of pairs) {
    const ka = new Set(a.score.widths.flatMap(w => w.diagnostics.filter(d => !d.allowedBy && d.severity !== 'info').map(d => `${d.code}|${d.snippet}`)))
    const kb = new Set(b.score.widths.flatMap(w => w.diagnostics.filter(d => !d.allowedBy && d.severity !== 'info').map(d => `${d.code}|${d.snippet}`)))
    fixed += [...ka].filter(x => !kb.has(x)).length
    const fresh = [...kb].filter(x => !ka.has(x)).length
    introduced += fresh
    if (fresh) regressed++
  }
  fixRows.push([cond, `fix ${k}`, pairs.length, pct(pairs.filter(([, b]) => b.score.clean).length, pairs.length),
    f1(mean(pairs.map(([a]) => a.score.errors + a.score.warns))), f1(mean(pairs.map(([, b]) => b.score.errors + b.score.warns))), fixed, introduced, regressed])
}
md.push('## Fix passes', '', 'Problems keyed by (code, opening tag), errors and warnings only. "Introduced" are problems absent before the pass.', '',
  table(['cond', 'pass', 'pages fixed', 'now clean', 'E+W before', 'E+W after', 'resolved', 'introduced', 'pages with new problems'], fixRows), '')

// ---------------------------------------------------------------- invented vocabulary
const vocab = (codes: string[], pick: (d: { snippet: string; got: string }) => string) => {
  const m = new Map<string, { n: number; models: Set<string> }>()
  for (const r of rows.filter(r => r.pass === 0)) {
    const seen = new Set<string>()
    for (const w of r.score.widths) for (const d of w.diagnostics) {
      if (!codes.includes(d.code)) continue
      const k = pick(d)
      if (seen.has(k)) continue
      seen.add(k)
      const e = m.get(k) ?? m.set(k, { n: 0, models: new Set() }).get(k)!
      e.n++; e.models.add(r.model)
    }
  }
  return [...m].sort((a, b) => b[1].n - a[1].n || b[1].models.size - a[1].models.size)
}
const tagOf = (d: { snippet: string }) => /^<([a-z0-9-]+)/.exec(d.snippet)?.[1] ?? d.snippet
const els = vocab(['UI-UNKNOWN-ELEMENT'], tagOf)
const attrs = vocab(['UI-UNKNOWN-ATTR'], d => `${tagOf(d)} ${d.got}`)
const aliases = vocab(['UI-ALIAS'], d => `${tagOf(d)} ${d.got}`)
const vt = (xs: typeof els) => table(['spelling', 'pages', 'models'], xs.slice(0, 25).map(([k, e]) => [`\`${k.replace(/\|/g, '\\|')}\``, e.n, e.models.size]))
summary.vocab = { elements: els.map(([k, e]) => [k, e.n, e.models.size]), attrs: attrs.map(([k, e]) => [k, e.n, e.models.size]), aliases: aliases.map(([k, e]) => [k, e.n, e.models.size]) }
md.push('## Invented vocabulary (first shots, both conditions)', '', 'Counted once per page. These are candidates for aliases or new elements.', '',
  '### Unknown elements', '', vt(els), '', '### Unknown attributes', '', vt(attrs), '', '### Aliases used', '', vt(aliases), '')

// ---------------------------------------------------------------- adoption
const adRows: (string | number)[][] = []
for (const cond of CONDS) for (const which of ['first', 'final'] as const) {
  const rs = [...chains.values()].filter(c => c[0].cond === cond && c[0].pass === 0).map(c => which === 'first' ? c[0] : c[c.length - 1])
  const a = rs.map(r => adoption(r.html))
  adRows.push([cond, which, rs.length, f1(mean(a.map(x => x.ui))), f1(mean(a.map(x => x.uiKinds))), pct(a.filter(x => x.styleCss > 0).length, a.length),
    Math.round(mean(a.map(x => x.styleCss))), f1(mean(a.map(x => x.styleAttrs))), f1(mean(a.map(x => x.classes))), a.reduce((n, x) => n + x.allow, 0), a.filter(x => x.off).length])
}
md.push('## Library adoption', '', '"Final" is the last page in each chain (the clean one, or fix 2).', '',
  table(['cond', 'page', 'n', 'ui-* elements', 'distinct ui-*', 'has <style>', 'mean CSS chars', 'style attrs', 'class attrs', 'data-ui-allow', 'diagnostics off'], adRows), '')

// ---------------------------------------------------------------- load problems
const notLoaded = rows.filter(r => r.score.widths.some(w => !w.loaded || w.evalError))
if (notLoaded.length) md.push('## Pages where agent-ui did not load or settle', '', ...notLoaded.map(r => `- ${r.page}: ${r.score.widths.map(w => w.evalError ?? (w.loaded ? 'ok' : 'not loaded')).join(' / ')}`), '')
if (failed.length) md.push('## Generation failures', '', ...failed.map(g => `- ${g.page}: ${String(g.error).slice(0, 200)}`), '')

writeFileSync(`${RES}/report.md`, md.join('\n'))
writeFileSync(`${RES}/summary.json`, JSON.stringify(summary, null, 1) + '\n')

// ---------------------------------------------------------------- contact sheet
mkdirSync('out', { recursive: true })
const cell = (r: Row) => `<figure><figcaption>${r.page.replace(/^pages(?:-\w+)?\//, '')} — ${r.score.clean ? 'clean' : `${r.score.errors}E ${r.score.warns}W`}</figcaption>`
  + r.score.widths.map(w => `<a href="../${w.shot.replace(/^out\//, 'out/')}"><img loading="lazy" src="${w.shot.replace(/^out\//, '')}" width="${w.width === 360 ? 180 : 480}"></a>`).join('') + '</figure>'
const order = [...chains.values()].sort((a, b) => item(a[0]).localeCompare(item(b[0])))
writeFileSync(TAG ? `out/sheet-${TAG}.html` : 'out/sheet.html', `<!doctype html><meta charset="utf-8"><title>trial sheet</title><style>body{font:12px system-ui;margin:12px}figure{display:inline-block;vertical-align:top;margin:6px;border:1px solid #ccc;padding:4px}img{vertical-align:top;margin:2px;max-height:600px;object-fit:cover;object-position:top}</style>`
  + order.map(c => `<div>${c.map(cell).join('')}</div>`).join('\n'))
console.log(md.slice(0, 40).join('\n'))
