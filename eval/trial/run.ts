// The trial: each (model, condition, task, sample) writes a page, gets scored, and gets up to N diagnostic-driven fix passes.
// Resumable: pages on disk and scores in results/scores.jsonl are reused.
// Usage: node run.ts [--models opus,gpt-6.2] [--conds skill,bare] [--tasks pricing] [--samples 2] [--passes 2] [--tag v2]
// --tag keeps a separate run: pages-<tag>/ and results-<tag>/ instead of pages/ and results/.
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { parseArgs } from 'node:util'
import { CLEAN, RUNNERS, type Runner } from './runners.ts'
import { diagText, Scorer, type Score } from './score.ts'
import { CDN, CONDITIONS, TASKS, extractHtml, firstPrompt, fixPrompt, type Condition, type Task } from './tasks.ts'

const { values: opt } = parseArgs({ options: {
  models: { type: 'string', default: Object.keys(RUNNERS).join(',') },
  conds: { type: 'string', default: CONDITIONS.join(',') },
  tasks: { type: 'string', default: TASKS.map(t => t.id).join(',') },
  samples: { type: 'string', default: '2' },
  passes: { type: 'string', default: '2' },
  tag: { type: 'string', default: '' },
} })

process.chdir(new URL('.', import.meta.url).pathname)
const PAGES = opt.tag ? `pages-${opt.tag}` : 'pages', RESULTS = opt.tag ? `results-${opt.tag}` : 'results'
mkdirSync(RESULTS, { recursive: true })
const SCORES = `${RESULTS}/scores.jsonl`, GEN = `${RESULTS}/gen.jsonl`
const scores = new Map<string, Score>()
if (existsSync(SCORES)) for (const l of readFileSync(SCORES, 'utf8').split('\n').filter(Boolean)) { const s = JSON.parse(l); scores.set(s.page, s) }

const tasks = TASKS.filter(t => opt.tasks!.split(',').includes(t.id))
const conds = opt.conds!.split(',') as Condition[]
const samples = Number(opt.samples), passes = Number(opt.passes)
const scorer = await Scorer.start()

interface Item { cond: Condition; task: Task; sample: number }
const items: Item[] = conds.flatMap(cond => tasks.flatMap(task => Array.from({ length: samples }, (_, sample) => ({ cond, task, sample }))))

async function pool<T>(xs: T[], n: number, fn: (x: T) => Promise<void>) {
  let i = 0
  await Promise.all(Array.from({ length: n }, async () => { while (i < xs.length) await fn(xs[i++]) }))
}

const tag = (s: Score) => s.clean ? 'clean' : `${s.errors}E ${s.warns}W`
let gens = 0, genFail = 0

async function runItem(model: string, runner: Runner, { cond, task, sample }: Item) {
  let prev: { html: string; score: Score } | null = null
  for (let pass = 0; pass <= passes; pass++) {
    const page = `${PAGES}/${cond}/${task.id}/${model}-s${sample}-p${pass}.html`
    if (!existsSync(page)) {
      const prompt = pass === 0 ? firstPrompt(task, cond) : fixPrompt(cond, prev!.html, diagText(prev!.score, CDN))
      const t0 = performance.now()
      const rec: Record<string, unknown> = { page, model, family: runner.family, cond, task: task.id, sample, pass, promptChars: prompt.length }
      try {
        const raw = await runner.call(prompt)
        const html = extractHtml(raw)
        mkdirSync(dirname(page), { recursive: true })
        writeFileSync(page, html)
        Object.assign(rec, { rawChars: raw.length, htmlChars: html.length, fenced: /```/.test(raw) })
        gens++
      } catch (e) {
        rec.error = String((e as Error).message)
        genFail++
      }
      rec.ms = Math.round(performance.now() - t0)
      appendFileSync(GEN, JSON.stringify(rec) + '\n')
      if (rec.error) { console.log(`${model} ${cond}/${task.id} s${sample} p${pass}: GEN FAILED ${String(rec.error).slice(0, 160)}`); return }
    }
    let score = scores.get(page)
    if (!score) {
      score = await scorer.score(page)
      scores.set(page, score)
      appendFileSync(SCORES, JSON.stringify(score) + '\n')
    }
    console.log(`${model} ${cond}/${task.id} s${sample} p${pass}: ${tag(score)}`)
    if (score.clean) return
    prev = { html: readFileSync(page, 'utf8'), score }
  }
}

try {
  await Promise.all(opt.models!.split(',').map(async model => {
    const runner = RUNNERS[model]?.()
    if (!runner) throw new Error(`unknown model ${model}; known: ${Object.keys(RUNNERS)}`)
    await pool(items, runner.concurrency, it => runItem(model, runner, it))
  }))
} finally {
  await scorer.close()
  rmSync(CLEAN, { recursive: true, force: true })
}
console.log(`done: ${gens} generated, ${genFail} failed`)
