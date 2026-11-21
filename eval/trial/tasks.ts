// Page briefs, conditions, and the prompts for the first shot and each fix pass.
import { readFileSync } from 'node:fs'

/** The build under test, pinned. score.ts serves the local dist for any agent-ui URL, so a model's own URL guess still loads it. */
export const CDN = 'https://cdn.jsdelivr.net/gh/limiteinductive/agent-ui@12c1c47/packages/core/dist/agent-ui.js'
const SKILL = readFileSync(new URL('../../packages/core/dist/SKILL.md', import.meta.url), 'utf8')
  .replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/@agent-ui\/core@[^/]+\/dist\/agent-ui\.js/g, CDN)

export const SYSTEM = 'You are an expert frontend engineer.'

export interface Task { id: string; brief: string }

/** General-purpose pages; none names a ui-* element or a layout technique. */
export const TASKS: Task[] = [
  { id: 'pricing', brief: 'A pricing page for a project-management SaaS: a header with the logo and navigation, a short hero, three plan cards (the middle one highlighted), a feature comparison table, an FAQ, and a footer.' },
  { id: 'dashboard', brief: 'An analytics dashboard for an online store: a top bar with search and a user menu, a sidebar of filters, four stat tiles (revenue, orders, conversion, refunds) each with a trend, a recent-orders table, and a list of top products.' },
  { id: 'settings', brief: 'An account settings page: a profile form (name, email, avatar upload, bio), notification preferences with on/off toggles, a billing summary with the current plan, and a danger zone to delete the account.' },
  { id: 'article', brief: 'A blog article page: title, author byline with avatar and date, a cover image, a long body with subheadings, a pull quote and a code sample, tags, and a "related posts" rail of cards that scrolls horizontally.' },
  { id: 'calendar', brief: 'A team calendar: a month header with previous/next buttons, a month grid (Monday to Sunday) with a few events on some days, and a list of upcoming events next to it.' },
  { id: 'shop', brief: 'A product listing page for a shoe store: a header with a cart, a filter bar (size chips, price range, sort), a grid of 12 product cards with image, name, price and an add-to-cart button, and pagination.' },
]

export const CONDITIONS = ['skill', 'bare'] as const
export type Condition = typeof CONDITIONS[number]

const COMMON = 'Build the layout and styling with agent-ui: do not write a <style> block or style attributes unless agent-ui cannot express something. The page must work on a 360px-wide phone and a 1280px desktop. Use realistic placeholder content; for images use https://picsum.photos URLs. Reply with only the complete HTML file in one ```html code block.'

function library(cond: Condition) {
  return cond === 'skill'
    ? `Use the agent-ui library. Load it with:\n<script src="${CDN}"></script>\nIts documentation:\n\n<skill>\n${SKILL}\n</skill>`
    : `Use the agent-ui library. Load it with one tag:\n<script src="${CDN}"></script>\nIt provides custom elements named ui-* for layout and common components (for example ui-stack and ui-card) and styles native HTML automatically. No documentation is available: use the element names and attributes that seem most natural.`
}

export function firstPrompt(task: Task, cond: Condition) {
  return `Write a single self-contained HTML page: ${task.brief}\n\n${COMMON}\n\n${library(cond)}`
}

export function fixPrompt(cond: Condition, html: string, diagnostics: string) {
  return `You wrote the HTML page below. It was rendered in Chrome at 360px and 1280px wide, and agent-ui's diagnostics reported the problems listed after it. Fix them and reply with only the complete corrected HTML file in one \`\`\`html code block. As before, build the layout and styling with agent-ui: no <style> block or style attributes unless agent-ui cannot express something.

<page>
${html}
</page>

<diagnostics>
${diagnostics}
</diagnostics>${cond === 'skill' ? `\n\n${library(cond)}` : ''}`
}

/** The HTML out of a model reply: the largest ```html block, else <!doctype…</html>, else the reply. */
export function extractHtml(raw: string): string {
  const blocks = [...raw.matchAll(/```(?:html|HTML)?\s*\n([\s\S]*?)```/g)].map(m => m[1])
  if (blocks.length) return blocks.sort((a, b) => b.length - a.length)[0].trim() + '\n'
  const m = /<!doctype html[\s\S]*<\/html>|<html[\s\S]*<\/html>/i.exec(raw)
  return (m ? m[0] : raw).trim() + '\n'
}
