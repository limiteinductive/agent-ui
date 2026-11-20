// Turns results/<run>.jsonl into results/<run>-report.md (+ -summary.json).
// Usage: node analyze.ts [run=pilot] [set: default = the set recorded in the rows, else pilot]
import { readFileSync, writeFileSync } from 'node:fs'
import { parseFragment } from 'parse5'
import { type Probe } from './probes.ts'
import { ALIASES, VOCAB } from './probes-followup.ts'
import { SETS } from './sets.ts'

const run = process.argv[2] ?? 'pilot'
const rows = readFileSync(`results/${run}.jsonl`, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l))
const ok = rows.filter(r => !r.error && r.raw)
const setName: string = process.argv[3] ?? rows.find(r => r.set)?.set ?? 'pilot'
const PROBES = SETS[setName]
const byId = new Map(Object.values(SETS).flat().map(p => [p.id, p]))
const models = [...new Set(rows.map(r => r.model))].sort()
// pilot: the catalog's candidates; later sets: the adopted vocabulary, with its aliases counted apart
const CATALOG = new Set(setName === 'pilot'
  ? [...PROBES.map(p => p.candidate).filter((c): c is string => !!c && /^ui-[a-z-]+$/.test(c)), 'ui-bar'] : VOCAB)
const ALIAS = new Set(setName === 'pilot' ? [] : ALIASES)

// ---------- parsing ----------
interface El { tag: string; attrs: { name: string; value: string }[] }

const unfence = (s: string) => s.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/, '').trim()

function elements(html: string): El[] {
  const out: El[] = []
  const walk = (n: any) => {
    if (n.tagName) out.push({ tag: n.tagName, attrs: n.attrs ?? [] })
    for (const c of n.childNodes ?? []) walk(c)
    if (n.content) walk(n.content) // <template>
  }
  walk(parseFragment(unfence(html)))
  return out
}

const firstEl = (raw: string) => elements(raw)[0]
const fmtAttr = (a: { name: string; value: string }) => (a.value === '' ? a.name : `${a.name}="${a.value}"`)

function value(raw: string): string {
  const s = unfence(raw)
  const q = s.match(/=\s*["']([^"']*)["']/) ?? s.match(/^["'`]?([^"'`\s]+)["'`]?$/)
  return (q ? q[1] : s).trim().toLowerCase()
}
const letter = (raw: string) => unfence(raw).match(/\b([A-F])\b/)?.[1] ?? '?'

// ---------- counting ----------
type Counts = Map<string, number>
const inc = (m: Counts, k: string, n = 1) => m.set(k, (m.get(k) ?? 0) + n)
const top = (m: Counts, n = 6) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n)
const fmt = (m: Counts, n = 6) => top(m, n).map(([k, v]) => `\`${k}\`×${v}`).join(', ') || '—'
const total = (m: Counts) => [...m.values()].reduce((a, b) => a + b, 0)
const pct = (a: number, b: number) => (b ? `${Math.round((100 * a) / b)}%` : '—')

function group(kind: string, key: (r: any, p: Probe) => string) {
  const g = new Map<string, any[]>()
  for (const r of ok.filter(r => r.kind === kind)) {
    const k = key(r, byId.get(r.probe)!)
    g.set(k, [...(g.get(k) ?? []), r])
  }
  return g
}

const md: string[] = []
const summary: Record<string, unknown> = { run, set: setName, models }
md.push(`# Name-guess eval: ${run}`, '',
  `Set: ${setName}. Models: ${models.join(', ')}. Calls: ${rows.length} (${rows.length - ok.length} failed). Probes: ${PROBES.length}.`, '')

// ---------- tag probes ----------
md.push('## 1. Element names (behavior described, no docs)', '',
  '(a) = pure behavior description, (b) = same behavior in a domain context.', '',
  '"models agree" = how many models\' own top (a) guess equals the overall top (a) guess; dissenters listed.', '',
  '| concept | candidate | hit | top guesses (a) | top guesses (b) | models agree (a) |', '|---|---|---|---|---|---|')
const tagSummary: Record<string, unknown> = {}
const volunteered: Counts = new Map()
const isNative = (r: any) => byId.get(r.probe)?.preamble === 'native'
for (const [concept, rs] of group('tag', r => r.concept)) {
  if (rs.some(isNative)) continue
  const names: Counts = new Map(), perModel = new Map<string, Counts>(), byPara = { a: new Map(), b: new Map() } as Record<string, Counts>
  for (const r of rs) {
    const el = firstEl(r.raw)
    const name = el?.tag ?? '(none)'
    inc(names, name)
    inc(byPara[r.probe.slice(-1)], name)
    if (r.probe.endsWith('.a')) {
      if (!perModel.has(r.model)) perModel.set(r.model, new Map())
      inc(perModel.get(r.model)!, name)
    }
    for (const a of el?.attrs ?? []) inc(volunteered, fmtAttr(a))
  }
  const cand = byId.get(rs[0].probe)!.candidate!
  tagSummary[concept] = { candidate: cand, guesses: Object.fromEntries(top(names, 99)) }
  const leader = top(byPara.a, 1)[0]?.[0]
  const tops = models.map(m => [m, top(perModel.get(m) ?? new Map(), 1)[0]?.[0] ?? '—'])
  const dissent = tops.filter(([, t]) => t !== leader).map(([m, t]) => `${m}: ${t}`)
  md.push(`| ${concept} | \`${cand}\` | ${pct(names.get(cand) ?? 0, total(names))} | ${fmt(byPara.a, 4)} | ${fmt(byPara.b, 4)} | ${
    tops.length - dissent.length}/${tops.length}${dissent.length ? ` (${dissent.join('; ')})` : ''} |`)
}
summary.tags = tagSummary
md.push('', `Attributes volunteered on those tags: ${fmt(volunteered, 25)}`, '')

// ---------- native-allowed tag probes ----------
const sig = (el?: El) => (el ? `<${[el.tag, ...el.attrs.map(fmtAttr)].join(' ')}>` : '(none)')
const nativeRows = ok.filter(r => r.kind === 'tag' && isNative(r))
if (nativeRows.length) {
  md.push('## 1b. Native allowed ("ordinary HTML elements are styled automatically")', '',
    '| concept | expected | native share | top elements (a) | top elements (b) | top full tags | models writing ui-* |', '|---|---|---|---|---|---|---|')
  const nativeSummary: Record<string, unknown> = {}
  for (const [concept, rs] of group('tag', r => r.concept)) {
    if (!rs.some(isNative)) continue
    const byPara = { a: new Map(), b: new Map() } as Record<string, Counts>, full: Counts = new Map(), uiBy: Counts = new Map()
    let nat = 0
    for (const r of rs) {
      const el = firstEl(r.raw), name = el?.tag ?? '(none)'
      inc(byPara[r.probe.slice(-1)], name)
      inc(full, sig(el))
      if (!name.startsWith('ui-')) nat++
      else inc(uiBy, r.model)
    }
    nativeSummary[concept] = { native: nat, n: rs.length, full: Object.fromEntries(top(full, 99)) }
    md.push(`| ${concept.replace('native.', '')} | \`${byId.get(rs[0].probe)!.candidate}\` | ${pct(nat, rs.length)} | ${fmt(byPara.a, 3)} | ${fmt(byPara.b, 3)} | ${
      top(full, 3).map(([k, v]) => `\`${k}\`×${v}`).join(', ')} | ${fmt(uiBy, 5)} |`)
  }
  summary.native = nativeSummary
  md.push('')
}

// ---------- attr probes ----------
md.push('## 2. Attribute names and values (element given)', '',
  '| probe | candidate | attributes written | element |', '|---|---|---|---|')
const attrSummary: Record<string, unknown> = {}
for (const [id, rs] of group('attr', r => r.probe)) {
  const attrs: Counts = new Map(), tags: Counts = new Map()
  for (const r of rs) {
    const el = firstEl(r.raw)
    inc(tags, el?.tag ?? '(none)')
    for (const a of el?.attrs ?? []) inc(attrs, fmtAttr(a))
  }
  const p = byId.get(id)!
  attrSummary[id] = { candidate: p.candidate, attrs: Object.fromEntries(top(attrs, 99)), tags: Object.fromEntries(tags) }
  md.push(`| ${id.replace('attr.', '')} | \`${p.candidate}\` | ${fmt(attrs, 5)} | ${fmt(tags, 3)} |`)
}
summary.attrs = attrSummary
md.push('')

// ---------- value probes ----------
md.push('## 3. Scale values (element + attribute given)', '', '| probe | candidate | values |', '|---|---|---|')
const valSummary: Record<string, unknown> = {}
for (const [id, rs] of group('value', r => r.probe)) {
  const vals: Counts = new Map()
  for (const r of rs) inc(vals, value(r.raw))
  valSummary[id] = Object.fromEntries(top(vals, 99))
  md.push(`| ${id.replace('value.', '')} | \`${byId.get(id)!.candidate}\` | ${fmt(vals)} |`)
}
summary.values = valSummary
md.push('')

// ---------- interpret probes ----------
md.push('## 4. Interpretation of candidate names (multiple choice)', '',
  `| markup | expected | answers | correct | ${models.join(' | ')} |`, `|---|---|---|---|${models.map(() => '---').join('|')}|`)
const interpSummary: Record<string, unknown> = {}
const modelScore = new Map(models.map(m => [m, [0, 0]]))
for (const [id, rs] of group('interpret', r => r.probe)) {
  const p = byId.get(id)!, ans: Counts = new Map()
  const perModel = new Map(models.map(m => [m, [0, 0]]))
  for (const r of rs) {
    const l = letter(r.raw)
    inc(ans, l)
    const hit = Number(l === p.expected)
    for (const s of [perModel.get(r.model)!, modelScore.get(r.model)!]) { s[0] += hit; s[1]++ }
  }
  const wrong = top(ans, 9).filter(([l]) => l !== p.expected)
    .map(([l, n]) => `${l}=${p.options![l.charCodeAt(0) - 65] ?? '?'} ×${n}`)
  interpSummary[id] = { expected: p.expected, answers: Object.fromEntries(ans) }
  md.push(`| \`${p.candidate!.split('\n')[0]}\` | ${p.expected} | ${fmt(ans, 4)}${wrong.length ? `<br>wrong: ${wrong.join('; ')}` : ''} | ${
    pct(ans.get(p.expected!) ?? 0, total(ans))} | ${models.map(m => pct(...(perModel.get(m) as [number, number]))).join(' | ')} |`)
}
md.push('', `Overall: ${models.map(m => `${m} ${pct(...(modelScore.get(m) as [number, number]))}`).join(', ')}`, '')
summary.interpret = interpSummary

// ---------- page probes ----------
const uiTags: Counts = new Map(), nativeTags: Counts = new Map(), uiAttrs: Counts = new Map(), uiAttrVals: Counts = new Map()
const invented: Counts = new Map(), aliased: Counts = new Map(), responsive: Counts = new Map()
let classN = 0, styleN = 0, elN = 0, pages = 0
const RESPONSIVE = /^(xs|sm|md|lg|xl)[:-]|[-:@](xs|sm|md|lg|xl|mobile|tablet|desktop)$|^(mobile|tablet|desktop|responsive|breakpoint)/
for (const r of ok.filter(r => r.kind === 'page')) {
  pages++
  for (const el of elements(r.raw)) {
    elN++
    const isUi = el.tag.startsWith('ui-')
    inc(isUi ? uiTags : nativeTags, el.tag)
    if (isUi && ALIAS.has(el.tag)) inc(aliased, el.tag)
    else if (isUi && !CATALOG.has(el.tag)) inc(invented, el.tag)
    for (const a of el.attrs) {
      if (a.name === 'class') classN++
      if (a.name === 'style') styleN++
      if (RESPONSIVE.test(a.name) || /\b(sm|md|lg|xl):/.test(a.value)) inc(responsive, fmtAttr(a))
      if (isUi) { inc(uiAttrs, a.name); if (a.value && a.value.length < 24) inc(uiAttrVals, fmtAttr(a)) }
    }
  }
}
md.push('## 5. Free-form pages (vocabulary in context)', '',
  `${pages} pages, ${elN} elements: ${total(uiTags)} \`ui-*\` (${pct(total(uiTags), elN)}), ${classN} \`class\` attrs, ${styleN} \`style\` attrs.`, '',
  `- **ui-* tags:** ${fmt(uiTags, 40)}`,
  `- **not in catalog (alias candidates):** ${fmt(invented, 40)}`,
  ...(ALIAS.size ? [`- **known aliases written:** ${fmt(aliased, 20)}`] : []),
  `- **ui-* attribute names:** ${fmt(uiAttrs, 30)}`,
  `- **ui-* attribute values:** ${fmt(uiAttrVals, 40)}`,
  `- **responsive-looking syntax:** ${fmt(responsive, 20)}`,
  `- **native tags:** ${fmt(nativeTags, 20)}`, '')
summary.pages = { uiTags: Object.fromEntries(uiTags), invented: Object.fromEntries(invented), aliased: Object.fromEntries(aliased), uiAttrs: Object.fromEntries(uiAttrs),
  uiAttrVals: Object.fromEntries(uiAttrVals), responsive: Object.fromEntries(responsive), classN, styleN, elN }

const errs = rows.filter(r => r.error)
if (errs.length) md.push('## Failures', '', ...errs.slice(0, 10).map(r => `- ${r.model} ${r.probe}: ${String(r.error).slice(0, 160)}`), '')

writeFileSync(`results/${run}-report.md`, md.join('\n'))
writeFileSync(`results/${run}-summary.json`, JSON.stringify(summary, null, 2))
console.log(`wrote results/${run}-report.md (${ok.length}/${rows.length} ok)`)
