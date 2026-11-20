// Build-time CSS generator. Every selector is derived from the manifest so that
// aliases render exactly like the canonical spelling (P4) and stay at zero
// specificity inside :where() (P10).
import { elements, tagAliases, preferNative, tokens, VERSION } from './manifest.ts';
import { spellings, childSpellings } from './vocab.ts';

type Cond = [attr: string, value: string]; // value '*' = attribute present under any spelling

const out: string[] = [];
const rule = (sel: string | string[], decls: string) => {
  const s = Array.isArray(sel) ? sel.join(', ') : sel;
  out.push(`:where(${s}) { ${decls} }`);
};
const raw = (css: string) => out.push(css);
/** Split a selector list on top-level commas only (not inside :is()/:not()). */
export function splitTop(sel: string): string[] {
  const parts: string[] = []; let depth = 0, cur = '';
  for (const ch of sel) {
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    if (ch === ',' && depth === 0) { parts.push(cur.trim()); cur = ''; } else cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

// ---------------------------------------------------------------- selector helpers

const plainAliases = (tag: string) =>
  Object.entries(tagAliases).filter(([, a]) => a.to === tag && !a.attrs).map(([t]) => t);
const fixedAliases = (tag: string) =>
  Object.entries(tagAliases).filter(([, a]) => a.to === tag && a.attrs) as Array<[string, { to: string; attrs: Record<string, string> }]>;
export const tagsOf = (tag: string) => [tag, ...plainAliases(tag), ...fixedAliases(tag).map(([t]) => t)];

const esc = (v: string) => v.replace(/"/g, '\\"');
function attrSel(n: string, v: string | null) {
  if (v === null) return `[${n}]`;
  if (v === '' || !/[a-z]/i.test(v)) return `[${n}="${esc(v)}"]`;
  return `[${n}="${esc(v)}" i]`;
}

/** `:is(...)` of every written spelling of a condition on `tag`. */
function condSel(tag: string, [attr, value]: Cond): string {
  if (value === '*') {
    const el = elements[tag];
    const parts = [`[${attr}]`];
    for (const [n, a] of Object.entries(el.attrAliases ?? {})) {
      if (a.to !== attr || a.value !== undefined) continue;
      if (a.values) for (const v of Object.keys(a.values)) parts.push(attrSel(n, v));
      else parts.push(`[${n}]`);
    }
    return `:is(${parts.join(', ')})`;
  }
  const sp = spellings(tag, attr, value);
  if (!sp.length) throw new Error(`no spelling for ${tag} ${attr}=${value}`);
  return `:is(${sp.map(([n, v]) => attrSel(n, v)).join(', ')})`;
}

/** Selector list for `tag` (and its aliases) satisfying all conditions. */
function S(tag: string, conds: Cond[] = []): string {
  const parts: string[] = [];
  const plain = [tag, ...plainAliases(tag)];
  const tagPart = plain.length > 1 ? `:is(${plain.join(', ')})` : tag;
  parts.push(tagPart + conds.map((c) => condSel(tag, c)).join(''));
  for (const [t, al] of fixedAliases(tag)) {
    if (conds.some(([a, v]) => a in al.attrs && al.attrs[a] !== v)) continue;
    parts.push(t + conds.filter(([a]) => !(a in al.attrs)).map((c) => condSel(tag, c)).join(''));
  }
  return parts.join(', ');
}

const HORIZONTAL: Cond = ['direction', 'horizontal'];
/** Row = ui-row ∪ ui-stack direction="horizontal" (exact equivalent). */
const R = (conds: Cond[] = []) => `${S('ui-row', conds)}, ${S('ui-stack', [HORIZONTAL, ...conds])}`;
const VSTACK = `ui-stack:not(${condSel('ui-stack', HORIZONTAL)})`;
const kids = (sel: string) => `:where(${sel}) > *`;
const GROW = `:is(${childSpellings('grow', 'on').map(([n, v]) => attrSel(n, v)).join(', ')})`;
const bleed = (v: string) => `:is(${childSpellings('bleed', v).map(([n, val]) => attrSel(n, val)).join(', ')})`;

const T = (tag: string) => tagsOf(tag).join(', ');
const BTN = `${T('ui-button')}, button, input:is([type="button"], [type="submit"], [type="reset"])`;
const BTN_S = (conds: Cond[]) => S('ui-button', conds);

const PAGE_APP = S('ui-page', [['layout', 'app']]);
const PAGE_DOC = `:is(${T('ui-page')}):not(${PAGE_APP})`;
const LANDMARK = 'header, main, footer, nav, aside, section, article';

/** attr() with a typed length, for scale attributes that also accept CSS lengths. */
function lengthRules(tagSel: (c: Cond[]) => string, tag: string, attr: string, cssVar: string, fallback: string) {
  const el = elements[tag];
  const names = [attr, ...Object.entries(el.attrAliases ?? {}).filter(([, a]) => a.to === attr && !a.value && !a.values).map(([n]) => n)];
  const lines = names.map((n) => {
    const base = splitTop(tagSel([])).map((s) => `${s}[${n}]`).join(', ');
    return `  :where(${base}) { ${cssVar}: attr(${n} type(<length>), ${fallback}); }`;
  });
  raw(`@supports (width: attr(x type(<length>), 0px)) {\n${lines.join('\n')}\n}`);
}

/** Per-value rules for a scale/enum attribute shared by several elements. */
function valueRules(tagList: string[], attr: string, values: readonly string[], decl: (v: string) => string, sel = S) {
  for (const v of values) {
    const sels = tagList.filter((t) => elements[t].attrs[attr]).map((t) => sel(t, [[attr, v]]));
    rule(sels, decl(v));
  }
}

// ---------------------------------------------------------------- tokens + theme (ui-base)

const space = Object.entries(tokens.space).map(([k, v]) => `--ui-space-${k}: ${v};`).join(' ');
const item = Object.entries(tokens.item).map(([k, v]) => `--ui-item-${k}: ${v};`).join(' ');
const measure = Object.entries(tokens.measure).map(([k, v]) => `--ui-measure-${k}: ${v};`).join(' ');
const container = Object.entries(tokens.container).map(([k, v]) => `--ui-container-${k}: ${v};`).join(' ');
const radius = Object.entries(tokens.radius).map(([k, v]) => `--ui-radius-${k}: ${v};`).join(' ');

const ld = (l: string, d: string) => `light-dark(${l}, ${d})`;
const MEANINGS: Record<string, { solid: [string, string]; on: [string, string]; ink: [string, string] }> = {
  neutral: { solid: ['oklch(0.45 0.01 260)', 'oklch(0.75 0.01 260)'], on: ['#fff', 'oklch(0.17 0.005 260)'], ink: ['oklch(0.35 0.01 260)', 'oklch(0.85 0.01 260)'] },
  primary: { solid: ['oklch(0.55 0.2 260)', 'oklch(0.7 0.16 260)'], on: ['#fff', 'oklch(0.17 0.02 260)'], ink: ['oklch(0.48 0.2 260)', 'oklch(0.8 0.12 260)'] },
  success: { solid: ['oklch(0.52 0.14 150)', 'oklch(0.72 0.15 150)'], on: ['#fff', 'oklch(0.17 0.02 150)'], ink: ['oklch(0.45 0.12 150)', 'oklch(0.82 0.13 150)'] },
  warning: { solid: ['oklch(0.78 0.16 75)', 'oklch(0.8 0.15 75)'], on: ['oklch(0.2 0.03 75)', 'oklch(0.2 0.03 75)'], ink: ['oklch(0.48 0.11 65)', 'oklch(0.85 0.13 80)'] },
  danger: { solid: ['oklch(0.55 0.21 25)', 'oklch(0.68 0.19 25)'], on: ['#fff', 'oklch(0.17 0.02 25)'], ink: ['oklch(0.5 0.2 25)', 'oklch(0.8 0.12 25)'] },
  info: { solid: ['oklch(0.55 0.14 230)', 'oklch(0.72 0.12 230)'], on: ['#fff', 'oklch(0.17 0.02 230)'], ink: ['oklch(0.48 0.13 230)', 'oklch(0.82 0.1 230)'] },
};
const meaningTokens = Object.entries(MEANINGS).map(([m, c]) => [
  `--ui-${m}: ${ld(...c.solid)};`,
  `--ui-on-${m}: ${ld(...c.on)};`,
  `--ui-${m}-ink: ${ld(...c.ink)};`,
  m === 'neutral' ? `--ui-${m}-tint: var(--ui-sunken);` : `--ui-${m}-tint: color-mix(in oklab, var(--ui-${m}) 12%, var(--ui-surface));`,
  `--ui-${m}-border: color-mix(in oklab, var(--ui-${m}) 35%, var(--ui-surface));`,
].join(' ')).join('\n    ');

const SCHEME_PAINT = 'color: var(--ui-ink); background-color: var(--ui-canvas);';

raw(`@layer ui-base, ui-core;

@layer ui-base {
  :root {
    --ui-version: "${VERSION}";
    color-scheme: light dark;
    --ui-opposite: dark;
    ${space}
    ${item}
    ${measure}
    ${container}
    ${radius}
    --ui-gutter: clamp(1rem, 4vw, 2rem);
    --ui-bleed: 8rem;
    --ui-flow: 1rem;
    --ui-font: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    --ui-font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
    --ui-canvas: ${ld('oklch(0.985 0.002 260)', 'oklch(0.17 0.005 260)')};
    --ui-surface: ${ld('oklch(1 0 0)', 'oklch(0.21 0.006 260)')};
    --ui-raised: ${ld('oklch(1 0 0)', 'oklch(0.25 0.007 260)')};
    --ui-sunken: ${ld('oklch(0.96 0.003 260)', 'oklch(0.15 0.005 260)')};
    --ui-ink: ${ld('oklch(0.21 0.01 260)', 'oklch(0.95 0.005 260)')};
    --ui-ink-muted: ${ld('oklch(0.5 0.01 260)', 'oklch(0.75 0.01 260)')};
    --ui-ink-subtle: ${ld('oklch(0.6 0.01 260)', 'oklch(0.6 0.01 260)')};
    --ui-border-subtle: color-mix(in oklab, var(--ui-ink) 12%, transparent);
    --ui-border-control: color-mix(in oklab, var(--ui-ink) 45%, transparent);
    --ui-focus: ${ld('oklch(0.55 0.2 260)', 'oklch(0.75 0.15 260)')};
    --ui-link: var(--ui-primary-ink);
    --ui-shadow-sm: 0 1px 2px ${ld('oklch(0 0 0 / 0.08)', 'oklch(0 0 0 / 0.4)')};
    --ui-shadow-md: 0 1px 2px ${ld('oklch(0 0 0 / 0.06)', 'oklch(0 0 0 / 0.3)')}, 0 4px 16px ${ld('oklch(0 0 0 / 0.1)', 'oklch(0 0 0 / 0.5)')};
    ${meaningTokens}
    ${SCHEME_PAINT}
    font-family: var(--ui-font);
    line-height: 1.5;
    accent-color: var(--ui-primary);
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
    overflow-wrap: break-word;
  }
  @media (prefers-color-scheme: dark) { :root { --ui-opposite: light; } }
  [data-scheme="light"] { color-scheme: light; --ui-opposite: dark; ${SCHEME_PAINT} }
  [data-scheme="dark"] { color-scheme: dark; --ui-opposite: light; ${SCHEME_PAINT} }

  *, *::before, *::after { box-sizing: border-box; }
  [hidden]:not([hidden="until-found"]) { display: none !important; }
  body { line-height: inherit; }
  body:has(> :is(${T('ui-page')}, ${T('ui-container')})) { margin: 0; }

  h1, h2, h3, h4, h5, h6, p, ul, ol, dl, figure, blockquote, pre, table, hr, fieldset { margin-block: 0; }
  h1, h2, h3, h4, h5, h6 { line-height: 1.2; font-weight: 650; text-wrap: balance; letter-spacing: -0.01em; }
  h1 { font-size: 2rem; } h2 { font-size: 1.5rem; } h3 { font-size: 1.25rem; }
  h4 { font-size: 1.125rem; } h5 { font-size: 1rem; } h6 { font-size: 0.875rem; }
  p { text-wrap: pretty; }
  small { font-size: 0.875em; }
  a { color: var(--ui-link); text-underline-offset: 0.15em; }
  ul, ol { padding-inline-start: 1.25em; }
  li + li { margin-block-start: 0.25em; }
  blockquote { margin-inline: 0; padding-inline-start: var(--ui-space-md); border-inline-start: 3px solid var(--ui-border-subtle); color: var(--ui-ink-muted); }
  hr { border: 0; border-block-start: 1px solid var(--ui-border-subtle); block-size: 0; inline-size: 100%; }
  code, kbd, samp, pre { font-family: var(--ui-font-mono); font-size: 0.9em; }
  :not(pre) > code, kbd { padding: 0.1em 0.3em; border-radius: var(--ui-radius-sm); background-color: var(--ui-sunken); }
  pre { padding: var(--ui-space-md); border-radius: var(--ui-radius-md); background-color: var(--ui-sunken); overflow-x: auto; }
  mark { background-color: var(--ui-warning-tint); color: inherit; }
  img, picture, video, canvas { display: block; max-inline-size: 100%; }
  img, video { block-size: auto; }
  table { border-collapse: collapse; inline-size: 100%; font-variant-numeric: tabular-nums; }
  th, td { padding: 0.5rem 0.75rem; text-align: start; vertical-align: top; border-block-end: 1px solid var(--ui-border-subtle); }
  th { font-weight: 600; font-size: 0.875rem; color: var(--ui-ink-muted); }
  input, select, textarea, button { font: inherit; color: inherit; }
  input:not([type="checkbox"], [type="radio"], [type="range"], [type="color"], [type="file"], [type="button"], [type="submit"], [type="reset"], [type="image"], [type="hidden"]), select, textarea {
    min-block-size: 2.5rem; padding: 0.5rem 0.75rem; border: 1px solid var(--ui-border-control);
    border-radius: var(--ui-radius-md); background-color: var(--ui-surface); color: var(--ui-ink); max-inline-size: 100%;
  }
  textarea { resize: vertical; min-block-size: 5rem; }
  ::placeholder { color: var(--ui-ink-subtle); opacity: 1; }
  label:has(> :is(input:not([type="checkbox"], [type="radio"], [type="hidden"]), select, textarea)) { display: flex; flex-direction: column; gap: 0.375rem; font-weight: 500; }
  label > :is(input, select, textarea) { font-weight: 400; }
  label:has(> input:is([type="checkbox"], [type="radio"])) { display: inline-flex; align-items: center; gap: 0.5rem; }
  fieldset { border: 1px solid var(--ui-border-subtle); border-radius: var(--ui-radius-md); padding: var(--ui-space-md); min-inline-size: 0; }
  legend { padding-inline: 0.25rem; font-weight: 600; }
  :is(input, select, textarea):disabled { opacity: 0.55; cursor: not-allowed; }
  summary { cursor: pointer; }
  dialog { color: var(--ui-ink); background-color: var(--ui-raised); border: 1px solid var(--ui-border-subtle); border-radius: var(--ui-radius-lg); padding: var(--ui-space-lg); max-inline-size: min(100vw - 2rem, 32rem); box-shadow: var(--ui-shadow-md); }
  dialog::backdrop { background-color: oklch(0 0 0 / 0.45); }
  :focus-visible { outline: 2px solid var(--ui-focus); outline-offset: 2px; }
  ::selection { background-color: color-mix(in oklab, var(--ui-primary) 25%, transparent); color: var(--ui-ink); }

  /* flow spacing for document content */
  :where(body, main, section, article, aside, form, fieldset, blockquote, details, ${T('ui-container')}) > * + * { margin-block-start: var(--ui-flow); }
  :where(h1, h2, h3, h4, h5, h6) + * { margin-block-start: 0.5em; }
  * + :where(h1, h2, h3) { margin-block-start: 2rem; }
}

@keyframes ui-spin { to { transform: rotate(1turn); } }
@keyframes ui-reveal { to { visibility: visible; } }
`);

// ---------------------------------------------------------------- ui-core

raw('@layer ui-core {');

// preferred-native tags render as plain boxes (UI-PREFER-NATIVE explains)
for (const [t, p] of Object.entries(preferNative)) rule(t, `display: ${p.display};`);
rule('ui-link', 'color: var(--ui-link); text-decoration: underline; cursor: pointer;');

// layout children never carry flow margins
rule([T('ui-stack'), T('ui-row'), T('ui-grid'), T('ui-card'), T('ui-overlay')].join(', ').split(', ').map((t) => `${t} > *`), 'margin: 0;');

// --- base rules (defaults live on the element itself so nothing leaks into nested elements)
rule(T('ui-stack'), 'display: flex; flex-direction: column; align-items: stretch; justify-content: flex-start; --_gap: var(--ui-space-md); --_pad: 0; gap: var(--_gap); padding: var(--_pad);');
rule(T('ui-row'), 'display: flex; --_gap: var(--ui-space-md); --_pad: 0; gap: var(--_gap); padding: var(--_pad);');
rule(R(), 'flex-direction: row; flex-wrap: nowrap; align-items: center; justify-content: flex-start;');
out.push(`${kids(R())} { flex: 0 1 auto; }`);

rule(T('ui-grid'), 'display: grid; --_gap: var(--ui-space-md); --_pad: 0; --_min: var(--ui-item-md); gap: var(--_gap); padding: var(--_pad); grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--_min)), 1fr));');

rule(T('ui-overlay'), 'display: grid; align-items: stretch; justify-items: stretch;');
out.push(`${kids(T('ui-overlay'))} { grid-area: 1 / 1; }`);

rule(T('ui-card'), 'display: flex; flex-direction: column; --_gap: var(--ui-space-md); --_pad: var(--ui-space-lg); --_radius: var(--ui-radius-lg); gap: var(--_gap); padding: var(--_pad); border-radius: var(--_radius); background-color: var(--ui-surface); color: var(--ui-ink); border: 1px solid var(--ui-border-subtle); min-inline-size: 0;');

rule(BTN, [
  'display: inline-flex; align-items: center; justify-content: center; gap: 0.5em; position: relative;',
  '--_bg: color-mix(in oklab, var(--ui-ink) 7%, var(--ui-surface)); --_fg: var(--ui-ink); --_bd: transparent; --_radius: var(--ui-radius-md);',
  'min-block-size: 2.5rem; padding: 0.375rem 1rem; font: inherit; font-weight: 550; line-height: 1.2; white-space: nowrap; text-decoration: none; vertical-align: middle;',
  'background-color: var(--_bg); color: var(--_fg); border: 1px solid var(--_bd); border-radius: var(--_radius);',
  'cursor: pointer; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; transition: background-color 0.15s, border-color 0.15s, color 0.15s;',
].join(' '));
raw(`@media (hover: hover) { :where(${BTN}):hover { background-color: color-mix(in oklab, var(--_bg), var(--ui-ink) 9%); } }`);
raw(`:where(${BTN}):active { background-color: color-mix(in oklab, var(--_bg), var(--ui-ink) 15%); }`);

rule(T('ui-page'), `display: flex; flex-direction: column; min-block-size: 100svh; ${SCHEME_PAINT}`);
raw(`:where(${PAGE_DOC}) > :where(${LANDMARK}):where(:not(:has(${T('ui-container')}))) { padding-inline: max(var(--ui-gutter), (100% - var(--ui-container-lg)) / 2); }`);
raw(`:where(${PAGE_DOC}) > :where(:not(${LANDMARK}, ${T('ui-container')}, script, style, template)) { inline-size: min(100% - 2 * var(--ui-gutter), var(--ui-container-lg)); margin-inline: auto; }`);
raw(`:where(${PAGE_DOC}) > :where(header, footer) { padding-block: var(--ui-space-md); }`);
raw(`:where(${PAGE_DOC}) > :where(header) { border-block-end: 1px solid var(--ui-border-subtle); }`);
raw(`:where(${PAGE_DOC}) > :where(footer) { border-block-start: 1px solid var(--ui-border-subtle); color: var(--ui-ink-muted); font-size: 0.875rem; margin-block-start: auto; }`);
raw(`:where(${PAGE_DOC}) > :where(main) { flex: 1 0 auto; padding-block: var(--ui-space-xl); }`);

rule(T('ui-container'), `display: grid; --_measure: var(--ui-container-lg); grid-template-columns: [full-start] minmax(var(--ui-gutter), 1fr) [wide-start] minmax(0, var(--ui-bleed)) [content-start] min(var(--_measure), 100% - 2 * var(--ui-gutter)) [content-end] minmax(0, var(--ui-bleed)) [wide-end] minmax(var(--ui-gutter), 1fr) [full-end];`);
out.push(`${kids(T('ui-container'))} { grid-column: content; min-inline-size: 0; }`);

// --- shared gap / padding
const SPACED = ['ui-stack', 'ui-row', 'ui-grid', 'ui-card'];
const SCALE_STEPS = Object.keys(tokens.space);
valueRules(SPACED, 'gap', SCALE_STEPS, (v) => `--_gap: var(--ui-space-${v});`);
valueRules(SPACED, 'padding', SCALE_STEPS, (v) => `--_pad: var(--ui-space-${v});`);

// --- ui-stack / ui-row: align, justify
const ALIGN: Record<string, string> = { start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch', baseline: 'baseline' };
valueRules(['ui-stack', 'ui-row'], 'align', Object.keys(ALIGN), (v) => `align-items: ${ALIGN[v]};`);
const JUSTIFY: Record<string, string> = { start: 'flex-start', center: 'center', end: 'flex-end' };
valueRules(['ui-stack', 'ui-row'], 'justify', Object.keys(JUSTIFY), (v) => `justify-content: ${JUSTIFY[v]};`);
// space-between: push the last child (never real space-between); exactly 3 children = true center
const SB: Cond = ['justify', 'space-between'];
out.push(`:where(${S('ui-stack', [SB])}) > :last-child:not(:first-child) { margin-block-start: auto; }`);
out.push(`:where(${R([SB])}) > :last-child:not(:first-child) { margin-block-start: 0; margin-inline-start: auto; }`);
const SB3 = splitTop(R([SB])).map((s) => `${s}:has(> :nth-child(3):last-child)`).join(', ');
rule(SB3, 'display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); grid-auto-flow: column;');
out.push(`:where(${SB3}) > :nth-child(1) { justify-self: start; }`);
out.push(`:where(${SB3}) > :nth-child(2) { justify-self: center; }`);
out.push(`:where(${SB3}) > :nth-child(3) { justify-self: end; margin-inline-start: 0; }`);

// --- row modifiers
rule(R([['wrap', 'on']]), 'flex-wrap: wrap;');

rule(R([['scroll', 'on']]), '--_item: var(--ui-item-md); display: grid; grid-auto-flow: column; grid-auto-columns: max-content; justify-content: start; overflow-x: auto; overscroll-behavior-inline: contain; scrollbar-width: thin; padding-block-end: max(var(--_pad), var(--ui-space-xs));');
lengthRules(R, 'ui-row', 'item-width', '--_item', 'var(--ui-item-md)');
lengthRules((c) => S('ui-stack', [HORIZONTAL, ...c]), 'ui-stack', 'item-width', '--_item', 'var(--ui-item-md)');
valueRules(['ui-row', 'ui-stack'], 'item-width', Object.keys(tokens.item), (v) => `--_item: var(--ui-item-${v});`, (t, c) => (t === 'ui-row' ? S(t, c) : S(t, [HORIZONTAL, ...c])));
const SCROLL_ITEM = `${S('ui-row', [['scroll', 'on'], ['item-width', '*']])}, ${S('ui-stack', [HORIZONTAL, ['scroll', 'on'], ['item-width', '*']])}`;
rule(SCROLL_ITEM, 'grid-auto-columns: min(var(--_item, var(--ui-item-md)), 85%); scroll-snap-type: x mandatory;');
out.push(`${kids(SCROLL_ITEM)} { scroll-snap-align: start; }`);

out.push(`${kids(R([['equal', 'on']]))} { flex: 1 1 0; min-inline-size: 0; }`);

const SBELOW = R([['stack-below', '*']]);
rule(SBELOW, 'flex-wrap: wrap; --_threshold: var(--ui-measure-md);');
out.push(`${kids(SBELOW)} { flex-grow: 1; flex-basis: calc((var(--_threshold, var(--ui-measure-md)) - 100%) * 999); }`);
lengthRules(R, 'ui-row', 'stack-below', '--_threshold', 'var(--ui-measure-md)');
lengthRules((c) => S('ui-stack', [HORIZONTAL, ...c]), 'ui-stack', 'stack-below', '--_threshold', 'var(--ui-measure-md)');
valueRules(['ui-row', 'ui-stack'], 'stack-below', Object.keys(tokens.measure), (v) => `--_threshold: var(--ui-measure-${v});`, (t, c) => (t === 'ui-row' ? S(t, c) : S(t, [HORIZONTAL, ...c])));
for (let n = 2; n <= 6; n++) {
  const sel = splitTop(R([['stack-below', '*'], ['limit', String(n)]])).map((s) => `${s}:has(> :nth-child(${n + 1}))`).join(', ');
  out.push(`${kids(sel)} { flex-basis: 100%; }`);
}

// --- ui-grid
lengthRules((c) => S('ui-grid', c), 'ui-grid', 'min-item-width', '--_min', 'var(--ui-item-md)');
valueRules(['ui-grid'], 'min-item-width', Object.keys(tokens.item), (v) => `--_min: var(--ui-item-${v});`);
for (let n = 1; n <= 12; n++) rule(S('ui-grid', [['columns', String(n)]]), `grid-template-columns: repeat(${n}, minmax(0, 1fr));`);
for (let n = 1; n <= 12; n++) {
  const sels = [S('ui-grid', [['max-columns', String(n)]]), `${T('ui-grid')}`.split(', ').map((t) => `${t}[responsive]${condSel('ui-grid', ['columns', String(n)])}`).join(', ')];
  rule(sels, `--_max: ${n}; grid-template-columns: repeat(auto-fill, minmax(min(100%, max(var(--_min), (100% - (var(--_max) - 1) * var(--_gap)) / var(--_max))), 1fr));`);
}

// --- ui-overlay
const OV_ALIGN: Record<string, string> = { start: 'start', center: 'center', end: 'end', stretch: 'stretch' };
valueRules(['ui-overlay'], 'align', Object.keys(OV_ALIGN), (v) => `align-items: ${OV_ALIGN[v]};`);
valueRules(['ui-overlay'], 'justify', Object.keys(OV_ALIGN), (v) => `justify-items: ${OV_ALIGN[v]};`);

// --- ui-card
valueRules(['ui-card'], 'rounded', ['0', 'sm', 'md', 'lg', 'xl', 'full'], (v) => `--_radius: var(--ui-radius-${v});`);
for (const m of ['neutral', 'primary', 'success', 'warning', 'danger', 'info']) {
  rule(S('ui-card', [['variant', m]]), `background-color: var(--ui-${m}-tint); border-color: var(--ui-${m}-border);`);
}
rule(S('ui-card', [['elevated', '']]), 'background-color: var(--ui-raised); box-shadow: var(--ui-shadow-md);');
rule(S('ui-card', [['sunken', '']]), 'background-color: var(--ui-sunken);');
rule(S('ui-card', [['inverse', '']]), 'color-scheme: var(--ui-opposite); background-color: var(--ui-surface); color: var(--ui-ink);');

// --- ui-button (variant/size/rounded also apply to native <button variant=…>)
const BTN_X = (conds: Cond[]) => { const s = BTN_S(conds); return `${s}, ${s.replace(/^ui-button/, 'button')}`; };
rule(BTN_X([['variant', 'primary']]), '--_bg: var(--ui-primary); --_fg: var(--ui-on-primary); --_bd: transparent;');
rule(BTN_X([['variant', 'danger']]), '--_bg: var(--ui-danger); --_fg: var(--ui-on-danger); --_bd: transparent;');
rule(BTN_X([['variant', 'outline']]), '--_bg: transparent; --_fg: var(--ui-ink); --_bd: var(--ui-border-control);');
rule(BTN_X([['variant', 'ghost']]), '--_bg: transparent; --_fg: var(--ui-ink); --_bd: transparent;');
rule(BTN_X([['size', 'sm']]), 'min-block-size: 2rem; padding: 0.25rem 0.75rem; font-size: 0.875rem;');
rule(BTN_X([['size', 'lg']]), 'min-block-size: 3rem; padding: 0.5rem 1.25rem; font-size: 1.0625rem;');
valueRules(['ui-button'], 'rounded', ['0', 'sm', 'md', 'lg', 'full'], (v) => `--_radius: var(--ui-radius-${v});`, (t, c) => BTN_X(c));
const BTN_OFF = `${BTN_X([['disabled', '']])}, :is(${BTN}):is(:disabled, [aria-disabled="true"])`;
rule(BTN_OFF, 'opacity: 0.55; cursor: not-allowed;');
raw(`@media (hover: hover) { :where(${BTN_OFF}):hover { background-color: var(--_bg); } }`);
const BTN_LOADING = BTN_X([['loading', '']]);
rule(BTN_LOADING, 'color: transparent; cursor: progress;');
out.push(`:where(${BTN_LOADING})::after { content: ""; position: absolute; inset: 0; margin: auto; inline-size: 1em; block-size: 1em; border: 2px solid var(--_fg); border-inline-end-color: transparent; border-radius: 50%; animation: ui-spin 0.7s linear infinite; }`);

// --- ui-page layout="app"
rule(PAGE_APP, 'display: grid; block-size: 100dvh; min-block-size: 0; overflow: hidden; grid-template: "header header header" auto "nav main aside" minmax(0, 1fr) "footer footer footer" auto / auto minmax(0, 1fr) auto;');
raw(`:where(${PAGE_APP}) > :where(:not(header, nav, aside, footer, script, style, template)) { grid-area: main; overflow: auto; min-block-size: 0; overscroll-behavior: contain; scrollbar-gutter: stable; padding: var(--ui-space-lg); }`);
raw(`:where(${PAGE_APP}) > :where(header) { grid-area: header; padding: var(--ui-space-sm) var(--ui-space-lg); border-block-end: 1px solid var(--ui-border-subtle); }`);
raw(`:where(${PAGE_APP}) > :where(nav) { grid-area: nav; overflow: auto; padding: var(--ui-space-md); border-inline-end: 1px solid var(--ui-border-subtle); background-color: var(--ui-surface); }`);
raw(`:where(${PAGE_APP}) > :where(aside) { grid-area: aside; overflow: auto; padding: var(--ui-space-md); border-inline-start: 1px solid var(--ui-border-subtle); }`);
raw(`:where(${PAGE_APP}) > :where(footer) { grid-area: footer; padding: var(--ui-space-sm) var(--ui-space-lg); border-block-start: 1px solid var(--ui-border-subtle); color: var(--ui-ink-muted); font-size: 0.875rem; }`);
raw(`@media (width < 40rem) { :where(${PAGE_APP}) { grid-template: "header" auto "nav" auto "main" minmax(0, 1fr) "aside" auto "footer" auto / 100%; } :where(${PAGE_APP}) > :where(nav) { border-inline-end: 0; border-block-end: 1px solid var(--ui-border-subtle); } }`);

// --- ui-container
valueRules(['ui-container'], 'size', Object.keys(tokens.container), (v) => `--_measure: var(--ui-container-${v});`);

// --- child attributes (last: they override the parent's child rules)
out.push(`:where(${VSTACK}, ${T('ui-card')}) > :where(${GROW}) { flex-grow: 1; }`);
out.push(`:where(${R()}) > :where(${GROW}) { flex-grow: 1; min-inline-size: 0; }`);
const RWRAP = R([['wrap', 'on']]);
out.push(`:where(${splitTop(RWRAP).map((s) => `${s}:has(> ${GROW})`).join(', ')}) > * { flex-grow: 1; }`);
out.push(`:where(${RWRAP}) > :where(${GROW}) { flex: 999 1 0; min-inline-size: max(50%, min(100%, var(--ui-measure-xs))); }`);
out.push(`${kids(T('ui-container'))}:where(${bleed('wide')}) { grid-column: wide; }`);
out.push(`${kids(T('ui-container'))}:where(${bleed('full')}) { grid-column: full; }`);

raw('}'); // @layer ui-core

// ---------------------------------------------------------------- engine-owned (unlayered on purpose: must win)
raw(`html:not([data-ui-ready]):not([data-ui-css-only]) body::before {
  content: "agent-ui: the stylesheet loaded but agent-ui.js did not run — ui-button behavior and diagnostics are off. Check the <script> URL or the console.";
  position: fixed; inset-inline: 0; inset-block-end: 0; z-index: 2147483647; padding: 6px 10px;
  font: 12px/1.4 ui-monospace, Menlo, monospace; background: oklch(0.5 0.2 25); color: #fff;
  visibility: hidden; animation: ui-reveal 0s 3s forwards;
}
html[data-ui-debug] [data-ui-diag] { outline: 2px dashed oklch(0.62 0.24 25) !important; outline-offset: -2px !important; }`);

export const css = out.join('\n');
