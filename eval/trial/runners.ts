// Model runners: Codex CLI for GPT, Claude CLI for Claude. Each call runs in an empty directory with tools off.
import { spawn } from 'node:child_process'
import { mkdtempSync, readFileSync, realpathSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { SYSTEM } from './tasks.ts'

const tmp = (prefix: string) => realpathSync(mkdtempSync(join(tmpdir(), prefix))) // codex ≥0.17x rejects symlinked paths
export const CLEAN = tmp('agent-trial-') // empty cwd: nothing to read
const CODEX = new URL('./node_modules/.bin/codex', import.meta.url).pathname

export interface Runner { family: string; concurrency: number; call(prompt: string): Promise<string> }

function exec(cmd: string, args: string[], env: NodeJS.ProcessEnv, timeoutMs = 900_000): Promise<string> {
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

function codex(model: string, effort = 'medium'): Runner {
  return { family: 'openai', concurrency: 3, async call(prompt) {
    const dir = tmp('trial-out-'), file = join(dir, 'out.txt')
    try {
      await exec(CODEX, ['exec', '--skip-git-repo-check', '-C', CLEAN, '--ephemeral', '-s', 'read-only',
        '-m', model, '-c', `model_reasoning_effort=${effort}`, '-o', file,
        `${SYSTEM} Do NOT use any tools and do not read or write any files; reply with the answer only.\n\n${prompt}`],
        { ...process.env, NODE_OPTIONS: '' })
      return readFileSync(file, 'utf8')
    } finally { rmSync(dir, { recursive: true, force: true }) }
  } }
}

function claude(model: string): Runner {
  // strip the desktop-host env so the CLI uses its own login
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(CLAUDE|ANTHROPIC|AI_AGENT)/.test(k)))
  return { family: 'anthropic', concurrency: 4, call: prompt => exec('claude', ['-p', '--model', model, '--system-prompt', SYSTEM,
    '--tools', '', '--strict-mcp-config', '--no-session-persistence', '--setting-sources', '', prompt], env) }
}

export const RUNNERS: Record<string, () => Runner> = {
  'gpt-5.6': () => codex('gpt-5.6-luna'),
  'gpt-6.2': () => codex('gpt-6.2-sol'),
  opus: () => claude('opus'),
  sonnet: () => claude('sonnet'),
  haiku: () => claude('haiku'),
}
