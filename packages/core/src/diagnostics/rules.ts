// Every diagnostic code, its default severity, and the reference text that SKILL.md is generated from.

export type Severity = 'error' | 'warn' | 'info';
export type Layer = 'static' | 'dom' | 'layout';

export interface RuleDoc {
  severity: Severity;
  layer: Layer;
  title: string;
  detail: string;
  example?: { bad: string; good: string };
}

export const RULES: Record<string, RuleDoc> = {
  'UI-UNKNOWN-ELEMENT': {
    severity: 'error', layer: 'static', title: 'Unknown ui-* element',
    detail: 'The tag is not in this build, so it renders as an unstyled inline box. The fix names the closest element; for vocabulary that is planned but not shipped yet, it names the native element to write today.',
    example: { bad: '<ui-hstack>', good: '<ui-row>' },
  },
  'UI-ALIAS': {
    severity: 'warn', layer: 'static', title: 'Alias spelling',
    detail: 'Renders exactly like the canonical spelling. Rename it so the page matches the reference.',
    example: { bad: '<ui-panel padding="large">', good: '<ui-card padding="lg">' },
  },
  'UI-PREFER-NATIVE': {
    severity: 'warn', layer: 'static', title: 'Use the native element',
    detail: 'The native element already has the semantics, keyboard behavior and styling. The ui- version renders as a plain box and loses them.',
    example: { bad: '<ui-link href="/docs">', good: '<a href="/docs">' },
  },
  'UI-UNKNOWN-ATTR': {
    severity: 'error', layer: 'static', title: 'Unknown attribute',
    detail: 'The attribute does nothing on this element. The fix names the closest attribute; the cause says which elements do have it.',
    example: { bad: '<ui-row spacing="md">', good: '<ui-row gap="md">' },
  },
  'UI-BAD-VALUE': {
    severity: 'error', layer: 'static', title: 'Value not allowed',
    detail: 'The value is not one this attribute accepts, so the attribute falls back to its default. Numbers on a scale map to the nearest token; unitless lengths need a unit.',
    example: { bad: '<ui-stack gap="4">', good: '<ui-stack gap="md">' },
  },
  'UI-CONFLICT': {
    severity: 'error', layer: 'static', title: 'Conflicting attributes',
    detail: 'The attributes are mutually exclusive (or one attribute is written twice with different values). Keep one.',
    example: { bad: '<ui-row wrap scroll>', good: '<ui-row scroll>' },
  },
  'UI-MISPLACED-ATTR': {
    severity: 'error', layer: 'static', title: 'Attribute in the wrong place',
    detail: 'Row attributes (wrap, scroll, equal, stack-below, limit, item-width) only work on ui-row or ui-stack direction="horizontal" (error). Child attributes (grow, bleed) only work on direct children of the element that reads them (warn).',
    example: { bad: '<ui-stack wrap>', good: '<ui-row wrap>' },
  },
  'UI-NESTED-ROOT': {
    severity: 'error', layer: 'static', title: 'ui-page inside ui-page',
    detail: 'A page has one root. Use ui-container, ui-stack or ui-card for inner regions.',
  },
  'row/space-between-many': {
    severity: 'info', layer: 'dom', title: 'space-between with 4+ children',
    detail: 'With four or more children, space-between makes the gaps depend on content widths. For a toolbar use gap (and grow on the flexible child); for equal tiles use ui-grid.',
  },
  'row/overflow': {
    severity: 'warn', layer: 'layout', title: 'Row content does not fit',
    detail: 'A row is one line and does not wrap unless asked. Its children are wider than the row at this viewport. Pick the behavior: wrap onto new lines, scroll as a rail, or stack-below a width. A row that already wraps is reported when one child is wider than the row even on a line of its own (unbreakable text, a fixed width); the diagnostic names it.',
    example: { bad: '<ui-row> (8 tags)', good: '<ui-row wrap>' },
  },
  'grid/cramped': {
    severity: 'warn', layer: 'layout', title: 'Exact columns are too narrow',
    detail: 'columns="N" keeps N columns at every width, so tiles get squeezed on small screens. max-columns="N" caps at N and drops columns when tiles would fall below min-item-width. Also reported when a tile box (padding, a fixed width) is wider than its track and covers its neighbor; if the count must stay (a calendar), make the tiles fit.',
    example: { bad: '<ui-grid columns="4">', good: '<ui-grid max-columns="4">' },
  },
  'layout/horizontal-overflow': {
    severity: 'error', layer: 'layout', title: 'Page scrolls sideways',
    detail: 'The document is wider than the viewport, or, in <ui-page layout="app">, a region scrolls sideways or the shell cuts content off. The diagnostic points at the element that breaks out of a parent that fits and names the widest thing inside it; other clipping or scrolling containers are left alone.',
  },
  'page/shared-area': {
    severity: 'error', layer: 'layout', title: 'Two children in one app-shell region',
    detail: 'In <ui-page layout="app">, header, nav, aside and footer each take a region, and every other child goes in main. Children that land in the same region are drawn on top of each other. Wrap the main content in one <main>, put a sidebar in <nav> (start side) or <aside> (end side), and merge duplicate landmarks.',
    example: { bad: '<ui-page layout="app"><header>…</header><ui-stack>filters</ui-stack><ui-container>…</ui-container>', good: '<ui-page layout="app"><header>…</header><nav>filters</nav><main>…</main>' },
  },
  'UI-RUNTIME-ERROR': {
    severity: 'error', layer: 'dom', title: 'Uncaught script error',
    detail: 'An uncaught exception or unhandled promise rejection. The page may be partly rendered.',
  },
  'UI-RESOURCE-FAILED': {
    severity: 'error', layer: 'dom', title: 'Resource failed to load',
    detail: 'A script, stylesheet, image, font or media file failed to load or was blocked by Content-Security-Policy. Images and fonts are warnings; scripts and stylesheets are errors.',
  },
  'UI-CSS-MISSING': {
    severity: 'error', layer: 'dom', title: 'Stylesheet not applied',
    detail: 'agent-ui.js ran but its styles are not in effect, so every ui-* element is unstyled.',
  },
  'UI-VERSION-SKEW': {
    severity: 'error', layer: 'dom', title: 'Mixed versions',
    detail: 'The stylesheet and the script (or two scripts) are different versions. Load one version of both.',
  },
  'UI-DUPLICATE': {
    severity: 'warn', layer: 'dom', title: 'Loaded twice',
    detail: 'agent-ui.js was loaded more than once. The second copy did nothing; remove it.',
  },
};

export const anchor = (code: string) => code.toLowerCase().replace(/[^a-z0-9]+/g, '-');
export const docsRef = (code: string) => `SKILL.md#${anchor(code)}`;
