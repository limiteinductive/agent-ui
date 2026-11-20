import { PROBES, leakCheck, type Probe } from './probes.ts'
import { FOLLOWUP } from './probes-followup.ts'

export const SETS: Record<string, Probe[]> = { pilot: PROBES, followup: FOLLOWUP }

export function check() {
  for (const [name, probes] of Object.entries(SETS)) {
    const ids = probes.map(p => p.id), dup = ids.filter((id, i) => ids.indexOf(id) !== i)
    const leaks = leakCheck(probes)
    console.log(`${name}: ${probes.length} probes; leaks: ${leaks.length ? leaks.join(', ') : 'none'}; duplicate ids: ${dup.length ? dup : 'none'}`)
  }
}
