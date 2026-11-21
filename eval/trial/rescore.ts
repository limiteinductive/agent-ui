// Re-score existing pages with the current dist, without regenerating: node rescore.ts [--out results/scores-v2.jsonl]
// Measures what the library and diagnostics changes do to the same pages, not new model behavior.
import { readFileSync, writeFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import { Scorer, type Score } from './score.ts'

const { values: opt } = parseArgs({ options: { in: { type: 'string', default: 'results/scores.jsonl' }, out: { type: 'string', default: 'results/scores-v2.jsonl' } } })
process.chdir(new URL('.', import.meta.url).pathname)
const old: Score[] = readFileSync(opt.in!, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l))
const scorer = await Scorer.start()
let done = 0
const fresh = await Promise.all(old.map(async (s) => {
  const r = await scorer.score(s.page)
  if (++done % 25 === 0) console.log(`${done}/${old.length}`)
  return r
}))
await scorer.close()
writeFileSync(opt.out!, fresh.map(r => JSON.stringify(r)).join('\n') + '\n')
console.log(`wrote ${opt.out}: ${fresh.filter(r => r.clean).length}/${fresh.length} clean (was ${old.filter(r => r.clean).length})`)
