// Runs every probe against every model, appending one JSON line per call to results/<run>.jsonl.
// Resumable: calls already present (probe|model|sample, no error) are skipped.
// Usage: node run.ts --run pilot [--set pilot|followup] --models gpt-5.6,haiku --samples 2 [--kinds tag,attr] [--limit 5]
import { spawn } from 'node:child_process'
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { buildPrompt, type Probe } from './probes.ts'
import { SETS } from './sets.ts'

const { values: opt } = parseArgs({ options: {
  run: { type: 'string', default: 'pilot' },
  set: { type: 'string', default: 'pilot' },
  models: { type: 'string', default: 'gpt-5.6' },
  samples: { type: 'string', default: '2' },
  kinds: { type: 'string' },
  limit: { type: 'string' },
} })

const SYSTEM = 'You are an expert frontend engineer.'
const tmp = (prefix: string) => realpathSync(mkdtempSync(join(tmpdir(), prefix))) // codex ≥0.17x rejects symlinked paths
const CLEAN = tmp('name-guess-') // empty cwd: nothing to read
const CODEX_LOCAL = new URL('./node_modules/.bin/codex', import.meta.url).pathname

interface Runner { family: string; concurrency: number; call(prompt: string): Promise<string> }

function exec(cmd: string, args: string[], env: NodeJS.ProcessEnv = process.env, timeoutMs = 240_000): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: CLEAN, env, stdio: ['ignore', 'pipe', 'pipe'] })
    let out = '', err = ''
    child.stdout.on('data', d => (out += d))
    child.stderr.on('data', d => (err += d))
    const timer = setTimeout(() => child.kill('SIGKILL'), timeoutMs)
    child.on('close', code => {
      clearTimeout(timer)
      code === 0 ? resolve(out) : reject(new Error(`${cmd} exit ${code}: ${(err || out).slice(-400)}`))
    })
  })
}

function codex(model: string, bin = '/opt/homebrew/bin/codex', effort = 'low'): Runner {
  return { family: 'openai', concurrency: 4, async call(prompt) {
    const file = join(tmp('ng-out-'), 'out.txt')
    await exec(bin, ['exec', '--skip-git-repo-check', '-C', CLEAN, '--ephemeral', '-s', 'read-only',
      '-m', model, '-c', `model_reasoning_effort=${effort}`, '-o', file,
      `${SYSTEM} Do NOT use any tools and do not read any files; answer from your own knowledge.\n\n${prompt}`],
      { ...process.env, NODE_OPTIONS: '' })
    const text = readFileSync(file, 'utf8')
    rmSync(file, { force: true })
    return text
  } }
}

function claude(model: string): Runner {
  // strip the desktop-host env so the CLI uses its own login
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(CLAUDE|ANTHROPIC|AI_AGENT)/.test(k)))
  return { family: 'anthropic', concurrency: 6, call: prompt => exec('claude', ['-p', '--model', model, '--system-prompt', SYSTEM,
    '--tools', '', '--strict-mcp-config', '--no-session-persistence', '--setting-sources', '', prompt], env) }
}

const RUNNERS: Record<string, () => Runner> = {
  'gpt-5.6': () => codex('gpt-5.6-luna'),
  'gpt-6.2': () => codex('gpt-6.2-sol', CODEX_LOCAL), // local codex 0.171; only the -sol slug works on a ChatGPT account
  opus: () => claude('opus'),
  sonnet: () => claude('sonnet'),
  haiku: () => claude('haiku'),
}

const out = join('results', `${opt.run}.jsonl`)
mkdirSync('results', { recursive: true })
const done = new Set<string>()
if (existsSync(out)) for (const line of readFileSync(out, 'utf8').split('\n').filter(Boolean)) {
  const r = JSON.parse(line)
  if (!r.error) done.add(`${r.probe}|${r.model}|${r.sample}`)
}

const kinds = opt.kinds?.split(',')
if (!SETS[opt.set!]) throw new Error(`unknown set ${opt.set}; known: ${Object.keys(SETS)}`)
let probes: Probe[] = SETS[opt.set!].filter(p => !kinds || kinds.includes(p.kind))
if (opt.limit) probes = probes.slice(0, Number(opt.limit))
const samples = Number(opt.samples)

async function pool<T>(items: T[], n: number, fn: (t: T) => Promise<void>) {
  let i = 0
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) await fn(items[i++]) }))
}

let ok = 0, failed = 0
await Promise.all(opt.models!.split(',').map(async model => {
  const runner = RUNNERS[model]?.()
  if (!runner) throw new Error(`unknown model ${model}; known: ${Object.keys(RUNNERS)}`)
  const jobs = probes.flatMap(p => Array.from({ length: samples }, (_, s) => ({ p, s })))
    .filter(({ p, s }) => !done.has(`${p.id}|${model}|${s}`))
  console.log(`${model}: ${jobs.length} calls`)
  await pool(jobs, runner.concurrency, async ({ p, s }) => {
    const t0 = performance.now()
    const rec: Record<string, unknown> = { set: opt.set, probe: p.id, kind: p.kind, concept: p.concept, model, family: runner.family, sample: s }
    try { rec.raw = (await runner.call(buildPrompt(p))).trim(); ok++ }
    catch (e) { rec.error = String((e as Error).message); failed++ }
    rec.ms = Math.round(performance.now() - t0)
    appendFileSync(out, JSON.stringify(rec) + '\n')
    if ((ok + failed) % 20 === 0) console.log(`  ${ok} ok, ${failed} failed`)
  })
}))
rmSync(CLEAN, { recursive: true, force: true })
console.log(`done: ${ok} ok, ${failed} failed -> ${out}`)
