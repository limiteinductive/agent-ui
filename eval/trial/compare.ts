// Before/after of a re-score: node compare.ts [old scores] [new scores] [old probe] [new probe]
// A chain is clean by pass N if any of its pages p0..pN is clean. "Real" also needs the probe to find nothing at either width.
import { readFileSync } from 'node:fs'
import type { Score } from './score.ts'

process.chdir(new URL('.', import.meta.url).pathname)
const [so = 'results/scores.jsonl', sn = 'results/scores-v2.jsonl', po = 'results/probe.jsonl', pn = 'results/probe-v2.jsonl'] = process.argv.slice(2)
const jsonl = <T>(f: string): T[] => readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l))
const broken = (f: string) => { const s = new Set<string>(); for (const r of jsonl<{ page: string; findings: unknown[] }>(f)) if (r.findings.length) s.add(r.page); return s }

function table(scores: Score[], probe: Set<string>) {
  const chains = new Map<string, Score[]>()
  for (const s of scores) { const k = s.page.replace(/-p\d+\.html$/, ''); (chains.get(k) ?? chains.set(k, []).get(k)!).push(s) }
  const rows: Record<string, { n: number; by: number[]; real: number[] }> = {}
  for (const [k, c] of chains) {
    c.sort((a, b) => a.page.localeCompare(b.page))
    const cond = k.split('/')[1]
    const r = rows[cond] ??= { n: 0, by: [0, 0, 0], real: [0, 0, 0] }
    r.n++
    for (let pass = 0; pass < 3; pass++) {
      const upto = c.slice(0, pass + 1)
      if (upto.some(s => s.clean)) r.by[pass]++
      if (upto.some(s => s.clean && !probe.has(s.page))) r.real[pass]++
    }
  }
  return rows
}
const pct = (a: number, n: number) => `${Math.round(100 * a / n)}%`
const oldS = jsonl<Score>(so), newS = jsonl<Score>(sn), oldP = broken(po), newP = broken(pn)
const A = table(oldS, oldP), B = table(newS, newP)
console.log('| condition | first shot | ≤ fix 1 | ≤ fix 2 | first shot, probe-clean | ≤ fix 2, probe-clean |\n|---|---|---|---|---|---|')
for (const c of Object.keys(A)) {
  const a = A[c], b = B[c]
  console.log(`| ${c} (${a.n}) | ${pct(a.by[0], a.n)} → ${pct(b.by[0], b.n)} | ${pct(a.by[1], a.n)} → ${pct(b.by[1], b.n)} | ${pct(a.by[2], a.n)} → ${pct(b.by[2], b.n)} | ${pct(a.real[0], a.n)} → ${pct(b.real[0], b.n)} | ${pct(a.real[2], a.n)} → ${pct(b.real[2], b.n)} |`)
}
const old = new Map(oldS.map(s => [s.page, s]))
const fn = (S: Score[], P: Set<string>) => S.filter(s => s.clean && P.has(s.page)).map(s => s.page)
console.log(`\nfalse clean (diagnostics clean, probe flags): ${fn(oldS, oldP).length} → ${fn(newS, newP).length}`)
for (const p of fn(newS, newP)) console.log('  still:', p)
console.log(`probe-flagged pages: ${oldP.size} → ${newP.size}`)
const flips = newS.filter(s => old.has(s.page) && old.get(s.page)!.clean !== s.clean) // only for a re-score of the same pages
console.log(`\nclean flips: ${flips.filter(s => s.clean).length} became clean, ${flips.filter(s => !s.clean).length} became unclean`)
for (const s of flips.filter(s => !s.clean)) {
  const codes = [...new Set(s.widths.flatMap(w => w.diagnostics.filter(d => !d.allowedBy).map(d => `${d.code}@${w.width}`)))]
  console.log(`  unclean: ${s.page}  probe:${newP.has(s.page) ? 'broken' : 'ok'}  ${codes.join(' ')}`)
}
const count = (S: Score[]) => { const m = new Map<string, number>(); for (const s of S) for (const c of new Set(s.widths.flatMap(w => w.diagnostics.filter(d => !d.allowedBy).map(d => d.code)))) m.set(c, (m.get(c) ?? 0) + 1); return m }
const co = count(oldS), cn = count(newS)
console.log('\npages per layout code (old → new):')
for (const c of new Set([...co.keys(), ...cn.keys()])) if (/row|grid|layout/.test(c)) console.log(`  ${c}: ${co.get(c) ?? 0} → ${cn.get(c) ?? 0}`)
