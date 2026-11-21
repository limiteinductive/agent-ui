// Generates SKILL.md: the reference an agent reads. Canonical names only (aliases are never documented).
import { VERSION, elements, childAttrs, planned, preferNative, tokens, type AttrSpec } from './manifest.ts';
import { RULES, anchor } from './diagnostics/rules.ts';

function values(s: AttrSpec): string {
  switch (s.kind) {
    case 'flag': return s.native ? '(bare)' : '(bare) · `="false"`';
    case 'toggle': return '(bare) · `="false"`';
    case 'int': return `${s.min}–${s.max}`;
    case 'string': return 'text';
    default: {
      const v = (s.values ?? []).map((x) => `\`${x}\``).join(' · ');
      return s.length ? `${v} · any CSS length` : v;
    }
  }
}

const def = (s: AttrSpec) => (s.presence ? `bare = \`${s.presence}\`` : s.default ? `\`${s.default}\`` : '');
const esc = (t: string) => t.replace(/\|/g, '\\|');

function table(attrs: Record<string, AttrSpec>): string {
  const rows = Object.entries(attrs).map(([n, s]) =>
    `| \`${n}\` | ${esc(values(s))} | ${def(s)} | ${esc(s.description)}${s.requires ? ' (horizontal only)' : ''} |`);
  return ['| attribute | values | default | |', '|---|---|---|---|', ...rows].join('\n');
}

export function skill(): string {
  const out: string[] = [];
  out.push(`---
name: agent-ui
description: Build web pages and artifacts with agent-ui ${VERSION}, a CSS-first set of <ui-*> layout elements plus diagnostics that report layout and markup mistakes with exact fixes. Use when writing HTML that loads agent-ui.js.
---

# agent-ui ${VERSION}

One tag gives you the stylesheet, the elements, and the diagnostics:

\`\`\`html
<script src="https://cdn.jsdelivr.net/npm/@agent-ui/core@${VERSION}/dist/agent-ui.js"></script>
\`\`\`

## How to write a page

- **Native HTML is already styled.** Write \`<h1>\`–\`<h6>\`, \`<p>\`, \`<a href>\`, \`<ul>\`, \`<table>\`, \`<form>\`, \`<label>Name <input name="n"></label>\`, \`<select>\`, \`<textarea>\`, \`<dialog>\`, \`<hr>\`, \`<code>\`. Do not wrap them in ui-* elements.
- **Layout is ui-* elements.** \`ui-stack\` = vertical with gaps. \`ui-row\` = one horizontal line. \`ui-grid\` = equal tiles that reflow. \`ui-overlay\` = children stacked on top of each other. \`ui-container\` = centered max-width column. \`ui-page\` = the page root.
- **Rows don't wrap unless asked.** For a row that may not fit, choose: \`wrap\` (tags, chips, buttons), \`scroll\` (a horizontal rail), or \`stack-below="40rem"\` (side by side when wide, stacked when narrow).
- **Side + main** is \`<ui-row wrap>\` with \`grow\` on the main child, not a grid track list.
- **Card grids**: \`<ui-grid max-columns="3">\` caps at 3 and drops columns on small screens. \`columns="3"\` means exactly 3 at every width (calendars).
- **Spacing** is a token: \`0 xs sm md lg xl 2xl\`. Never put margins between ui-* children; use \`gap\`.
- **Color** comes from the theme (light and dark automatically). \`<html data-scheme="dark">\` forces a scheme; a card can flip with \`inverse\`.

\`\`\`html
<ui-page>
  <header><ui-row justify="space-between"><strong>Acme</strong><nav><a href="#">Docs</a></nav></ui-row></header>
  <main>
    <ui-container>
      <ui-stack gap="lg">
        <h1>Plans</h1>
        <ui-grid max-columns="3">
          <ui-card><h3>Free</h3><p>For trying it out.</p><ui-button>Start</ui-button></ui-card>
          <ui-card elevated><h3>Pro</h3><p>For teams.</p><ui-button variant="primary">Buy</ui-button></ui-card>
        </ui-grid>
      </ui-stack>
    </ui-container>
  </main>
</ui-page>
\`\`\`

## In React, Solid or Vue

No adapter: render the tags directly. For typed attributes, element properties and editor completion:

\`\`\`ts
import '@agent-ui/core';                    // registers the elements and injects the CSS
import type {} from '@agent-ui/core/react'; // or /solid, /vue
\`\`\`

- **Booleans just work on ui-* elements**: \`elevated={on}\` writes the bare attribute or removes it, and \`="false"\` also means off. The exception is \`disabled\` written as plain HTML: like on a native \`<button>\`, \`disabled="false"\` is still disabled.
- **React**: on native elements React drops boolean values, so write child attributes as strings: \`<main grow="">\`, \`grow={isMain ? '' : undefined}\`.
- **Vue**: set \`compilerOptions.isCustomElement: (tag) => tag.startsWith('ui-')\`, and write attribute names in kebab-case (\`stack-below\`, not \`stackBelow\`).
- Every attribute is also a property: \`el.stackBelow = '40rem'\`, \`el.elevated = false\`.

## Elements
`);
  for (const [tag, spec] of Object.entries(elements)) {
    out.push(`### ${tag}\n\n${spec.description}\n\n${table(spec.attrs)}\n`);
    if (spec.conflicts?.length) out.push(`Mutually exclusive: ${spec.conflicts.map((g) => g.map((a) => `\`${a}\``).join(' / ')).join('; ')}.\n`);
    if (spec.childAttrs?.length) out.push(`Children may carry: ${spec.childAttrs.map((a) => `\`${a}\``).join(', ')}.\n`);
  }
  out.push('## Child attributes\n\nWritten on a child, read by its parent.\n');
  out.push(['| attribute | values | on children of | |', '|---|---|---|---|',
    ...Object.entries(childAttrs).map(([n, s]) => `| \`${n}\` | ${esc(values(s))} | ${s.parents.map((p) => `\`${p}\``).join(', ')} | ${esc(s.description)} |`),
  ].join('\n') + '\n');
  out.push('## Use the native element\n');
  out.push(Object.entries(preferNative).map(([t, p]) => `- not \`<${t}>\`: write \`${p.use}\``).join('\n') + '\n');
  out.push(`## Not in ${VERSION} yet\n\nWrite the native equivalent today.\n`);
  out.push(['| planned | write today |', '|---|---|', ...Object.entries(planned).map(([t, f]) => `| \`<${t}>\` | \`${esc(f)}\` |`)].join('\n') + '\n');
  out.push('## Tokens\n');
  for (const [fam, steps] of Object.entries(tokens)) {
    out.push(`- **${fam}**: ${Object.entries(steps).map(([k, v]) => `\`${k}\` ${v}`).join(' · ')}`);
  }
  out.push(`
CSS custom properties: \`--ui-space-*\`, \`--ui-radius-*\`, \`--ui-canvas\`, \`--ui-surface\`, \`--ui-ink\`, \`--ui-ink-muted\`, \`--ui-primary\`, \`--ui-danger\`, … (light and dark through \`light-dark()\`).

## Diagnostics

After the page settles (fonts, images, one frame), agent-ui checks the markup and the measured layout, then reports on every channel:

- **console**: a \`[ui-diag]\` summary line, then one line per problem: \`CODE got on <tag as written> (path) — cause; allowed …; fix: …; SKILL.md#code\`.
- **\`await window.__uiReady\`** resolves to the report; \`window.__ui.report\` is the latest, \`window.__ui.check()\` re-runs it.
- **\`<script type="application/json" id="ui-diagnostics">\`** holds the same report as JSON.
- **\`data-ui-diag="CODE"\`** marks each offending element; \`<html data-ui-debug>\` outlines them and opens a panel.

It re-checks on DOM changes and resizes, and the summary says what changed since the last check (\`3 fixed, 0 new, 1 remain\`), including across reloads in the same tab.

**Contract:** errors must reach 0. Warnings deserve a look. Info never blocks.
A deliberate deviation is written down, not hidden: \`data-ui-allow="row/overflow"\` on the element (or an ancestor) moves matching diagnostics to the \`allowed\` count.
\`<html data-ui-diagnostics="quiet">\` keeps the report but skips the console; \`="off"\` disables checks.

### Codes
`);
  for (const [code, r] of Object.entries(RULES)) {
    out.push(`<a id="${anchor(code)}"></a>\n#### ${code} · ${r.severity}\n\n**${r.title}.** ${r.detail}\n`);
    if (r.example) out.push(`\`${r.example.bad}\` → \`${r.example.good}\`\n`);
  }
  return out.join('\n');
}
