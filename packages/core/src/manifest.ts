// Single source of truth for the vocabulary. The CSS generator, the static
// diagnostics, dist/manifest.json and the generated reference docs all read this.
// Spec: research/vocabulary.md, research/layout-vocabulary.md.

export const VERSION = '0.1.0';

export type Kind = 'enum' | 'flag' | 'toggle' | 'scale' | 'int' | 'string';

/** A value alias either renames the value, or turns into another attribute (variant="sunken" -> sunken). */
export type ValueAlias = string | { attr: string; value?: string };

export interface AttrSpec {
  kind: Kind;
  description: string;
  values?: readonly string[];
  valueAliases?: Record<string, ValueAlias>;
  /** Value meant by the bare attribute (`rounded` = `rounded="md"`). */
  presence?: string;
  default?: string;
  min?: number;
  max?: number;
  /** scale: also accepts a CSS length; `cssVar` receives it. */
  length?: boolean;
  cssVar?: string;
  /** scale: token family the scale steps resolve to (default `space`). */
  tokens?: 'space' | 'item' | 'measure' | 'container' | 'radius';
  /** toggle: extra on-spellings besides "", "true" and the attribute's own name. */
  on?: readonly string[];
  /** Only meaningful when another attribute has this value (row attributes on ui-stack). */
  requires?: { attr: string; value: string; hint: string };
}

export interface AttrAlias {
  to: string;
  /** Fixed canonical value regardless of what was written (`horizontal` -> direction="horizontal"). */
  value?: string;
  /** Only these written values map; the key's canonical value is given. */
  values?: Record<string, string>;
}

export interface ElementSpec {
  description: string;
  attrs: Record<string, AttrSpec>;
  attrAliases?: Record<string, AttrAlias>;
  /** Mutually exclusive canonical attributes. */
  conflicts?: string[][];
  /** Children may carry these child attributes. */
  childAttrs?: string[];
}

// ---------------------------------------------------------------- value sets

export const SCALE = ['0', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
export const SCALE_ALIASES: Record<string, string> = {
  none: '0',
  small: 'sm',
  medium: 'md',
  large: 'lg',
  xxl: '2xl',
};
export const MEANING = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const;
export const MEANING_ALIASES: Record<string, string> = {
  accent: 'primary',
  error: 'danger',
  critical: 'danger',
  caution: 'warning',
  positive: 'success',
};
export const TOGGLE_OFF = ['false', 'nowrap', 'none'] as const;

// ---------------------------------------------------------------- shared attrs

const gap = (def = 'md'): AttrSpec => ({
  kind: 'scale', values: SCALE, valueAliases: SCALE_ALIASES, default: def,
  description: 'Space between children.',
});
const padding = (def = '0'): AttrSpec => ({
  kind: 'scale', values: SCALE, valueAliases: SCALE_ALIASES, default: def,
  description: 'Inner spacing.',
});
const align = (def: string): AttrSpec => ({
  kind: 'enum', values: ['start', 'center', 'end', 'stretch', 'baseline'], default: def,
  valueAliases: { left: 'start', right: 'end', 'flex-start': 'start', 'flex-end': 'end' },
  description: 'Cross-axis alignment of children.',
});
const justify: AttrSpec = {
  kind: 'enum', values: ['start', 'center', 'end', 'space-between'], default: 'start',
  valueAliases: { between: 'space-between', 'flex-start': 'start', 'flex-end': 'end', left: 'start', right: 'end' },
  description: 'Main-axis distribution. `space-between` with 2 children pushes them apart; with 3 it gives start / true center / end.',
};

const ROW_ONLY = (hint: string) => ({ attr: 'direction', value: 'horizontal', hint });

function rowAttrs(onStack: boolean): Record<string, AttrSpec> {
  const req = onStack ? ROW_ONLY('row attribute on a vertical ui-stack') : undefined;
  const r = (s: AttrSpec): AttrSpec => (req ? { ...s, requires: req } : s);
  return {
    wrap: r({ kind: 'toggle', description: 'Children wrap onto new lines (tags, chips, button groups). Off by default.' }),
    scroll: r({
      kind: 'toggle', on: ['x', 'horizontal'],
      description: 'Horizontal rail: one line that scrolls, with snap. Pair with `item-width` for card carousels.',
    }),
    equal: r({ kind: 'toggle', description: 'Children share the row equally (`flex: 1 1 0`).' }),
    'stack-below': r({
      kind: 'scale', values: SCALE.slice(1), valueAliases: SCALE_ALIASES, presence: 'md',
      length: true, cssVar: '--_threshold', tokens: 'measure',
      description: 'All-or-nothing switch: below this container width every child stacks; above it they share one line equally.',
    }),
    limit: r({
      kind: 'int', min: 2, max: 6,
      description: 'With `stack-below`: stack anyway when there are more than N children.',
    }),
    'item-width': r({
      kind: 'scale', values: SCALE.slice(1), valueAliases: SCALE_ALIASES,
      length: true, cssVar: '--_item', tokens: 'item',
      description: 'With `scroll`: width of each item (capped at 85% of the rail).',
    }),
  };
}

const ROW_ALIASES: Record<string, AttrAlias> = {
  scrollable: { to: 'scroll' },
  overflow: { to: 'scroll', values: { scroll: '', auto: '' } },
  threshold: { to: 'stack-below' },
  breakpoint: { to: 'stack-below' },
  'collapse-at': { to: 'stack-below' },
  'stack-at': { to: 'stack-below' },
  'wrap-below': { to: 'stack-below' },
  collapse: { to: 'stack-below' },
  'equal-width': { to: 'equal' },
  'max-items': { to: 'limit' },
  'card-width': { to: 'item-width' },
};

const ROW_CONFLICTS = [['scroll', 'wrap'], ['scroll', 'stack-below']];

const variantMeaning = (extra: Record<string, ValueAlias> = {}): AttrSpec => ({
  kind: 'enum', values: MEANING, valueAliases: { ...MEANING_ALIASES, ...extra },
  description: 'Meaning: tints the surface.',
});

const COMPONENT_VARIANT_ALIASES: Record<string, AttrAlias> = {
  tone: { to: 'variant' },
  intent: { to: 'variant' },
  color: { to: 'variant' },
};

// ---------------------------------------------------------------- elements

export const elements: Record<string, ElementSpec> = {
  'ui-stack': {
    description: 'Vertical flow with consistent gaps. `direction="horizontal"` makes it exactly a `ui-row`.',
    attrs: {
      gap: gap(),
      align: align('stretch'),
      justify,
      padding: padding(),
      direction: {
        kind: 'enum', values: ['vertical', 'horizontal'], default: 'vertical',
        valueAliases: { row: 'horizontal', column: 'vertical' },
        description: '`horizontal` = `ui-row` (all row attributes apply).',
      },
      ...rowAttrs(true),
    },
    attrAliases: {
      horizontal: { to: 'direction', value: 'horizontal' },
      vertical: { to: 'direction', value: 'vertical' },
      ...ROW_ALIASES,
    },
    conflicts: ROW_CONFLICTS,
    childAttrs: ['grow'],
  },
  'ui-row': {
    description: 'Horizontal line of children. Content-sized, no wrap, vertically centered by default.',
    attrs: {
      gap: gap(),
      align: align('center'),
      justify,
      padding: padding(),
      ...rowAttrs(false),
    },
    attrAliases: ROW_ALIASES,
    conflicts: ROW_CONFLICTS,
    childAttrs: ['grow'],
  },
  'ui-grid': {
    description: 'Equal tiles that reflow: as many columns as fit `min-item-width`. `columns` = exact count, `max-columns` = responsive cap.',
    attrs: {
      gap: gap(),
      padding: padding(),
      'min-item-width': {
        kind: 'scale', values: SCALE.slice(1), valueAliases: SCALE_ALIASES, default: 'md',
        length: true, cssVar: '--_min', tokens: 'item',
        description: 'Smallest a tile may get before the grid drops a column.',
      },
      columns: { kind: 'int', min: 1, max: 12, description: 'Exact column count at every width (calendars, fixed tables).' },
      'max-columns': { kind: 'int', min: 1, max: 12, description: 'Responsive: at most N columns, fewer when tiles would drop below `min-item-width`.' },
    },
    attrAliases: {
      min: { to: 'min-item-width' },
      'min-width': { to: 'min-item-width' },
      'min-column-width': { to: 'min-item-width' },
      'columns-sm': { to: 'max-columns' },
      'columns-md': { to: 'max-columns' },
      'columns-lg': { to: 'max-columns' },
      'columns-xl': { to: 'max-columns' },
    },
    conflicts: [['columns', 'max-columns']],
  },
  'ui-overlay': {
    description: 'Children share one cell; later children paint on top (badge on image, caption over media).',
    attrs: {
      align: { ...align('stretch'), values: ['start', 'center', 'end', 'stretch'], description: 'Vertical placement of children.' },
      justify: {
        kind: 'enum', values: ['start', 'center', 'end', 'stretch'], default: 'stretch',
        valueAliases: { left: 'start', right: 'end', 'flex-start': 'start', 'flex-end': 'end' },
        description: 'Horizontal placement of children.',
      },
    },
  },
  'ui-card': {
    description: 'Bounded surface. Owns its ink, borders and focus color for everything inside.',
    attrs: {
      padding: padding('lg'),
      gap: gap(),
      rounded: {
        kind: 'scale', values: ['0', 'sm', 'md', 'lg', 'xl', 'full'], presence: 'md', default: 'lg', tokens: 'radius',
        valueAliases: { ...SCALE_ALIASES, pill: 'full', round: 'full' },
        description: 'Corner radius.',
      },
      elevated: { kind: 'flag', description: 'Raised above the page (shadow).' },
      sunken: { kind: 'flag', description: 'Recessed below the page.' },
      inverse: { kind: 'flag', description: 'Opposite color scheme (dark card on a light page).' },
      variant: variantMeaning({ sunken: { attr: 'sunken' }, elevated: { attr: 'elevated' }, inverse: { attr: 'inverse' } }),
    },
    attrAliases: { pad: { to: 'padding' }, radius: { to: 'rounded' }, ...COMPONENT_VARIANT_ALIASES },
    conflicts: [['elevated', 'sunken', 'inverse']],
    childAttrs: ['grow'],
  },
  'ui-button': {
    description: 'Button. Form-associated: `type="submit"` submits its form. Default `type="button"`.',
    attrs: {
      variant: {
        kind: 'enum', values: ['primary', 'secondary', 'outline', 'ghost', 'danger'], default: 'secondary',
        valueAliases: { destructive: 'danger', accent: 'primary', error: 'danger' },
        description: 'Emphasis.',
      },
      size: {
        kind: 'enum', values: ['sm', 'md', 'lg'], default: 'md',
        valueAliases: { small: 'sm', medium: 'md', large: 'lg' },
        description: 'Height and padding.',
      },
      type: { kind: 'enum', values: ['button', 'submit', 'reset'], default: 'button', description: 'Form behavior.' },
      loading: { kind: 'flag', description: 'Pending: shows a spinner and ignores clicks.' },
      disabled: { kind: 'flag', description: 'Disabled (stays focusable, announced as disabled).' },
      rounded: {
        kind: 'scale', values: ['0', 'sm', 'md', 'lg', 'full'], presence: 'full', tokens: 'radius',
        valueAliases: { ...SCALE_ALIASES, pill: 'full', round: 'full' },
        description: 'Corner radius; bare `rounded` = pill.',
      },
      name: { kind: 'string', description: 'Form field name.' },
      value: { kind: 'string', description: 'Form field value.' },
    },
    attrAliases: { busy: { to: 'loading' }, pending: { to: 'loading' }, ...COMPONENT_VARIANT_ALIASES },
  },
  'ui-page': {
    description: 'Page root. `layout="document"` (default) scrolls the document; `layout="app"` is a full-height shell placed by tag: `<header>` on top, `<nav>` at the start side, `<aside>` at the end side, `<footer>` at the bottom, and one other child (usually `<main>`) as the main region, which scrolls. Each region takes one child: wrap the main content in a single `<main>`.',
    attrs: {
      layout: { kind: 'enum', values: ['document', 'app'], default: 'document', description: 'Document flow or app shell.' },
    },
  },
  'ui-container': {
    description: 'Centered max-width column with gutters. Children may break out with `bleed="wide|full"`.',
    attrs: {
      size: {
        kind: 'scale', values: ['sm', 'md', 'lg', 'xl', 'full'], default: 'lg', tokens: 'container',
        valueAliases: { ...SCALE_ALIASES, narrow: 'sm', wide: 'xl' },
        description: 'Content width.',
      },
    },
    attrAliases: { width: { to: 'size' }, 'max-width': { to: 'size' } },
    childAttrs: ['bleed'],
  },
};

/** Attributes that live on children and are read by the parent. */
export const childAttrs: Record<string, AttrSpec & { parents: string[] }> = {
  grow: {
    kind: 'toggle', parents: ['ui-stack', 'ui-row', 'ui-card'],
    description: 'This child takes the leftover space. In a wrapping row it becomes the main column of a side + main layout.',
  },
  bleed: {
    kind: 'enum', values: ['wide', 'full'], presence: 'full', parents: ['ui-container'],
    description: 'Escape the container measure: `wide` or edge-to-edge `full`.',
  },
};

export interface TagAlias { to: string; attrs?: Record<string, string> }

export const tagAliases: Record<string, TagAlias> = {
  'ui-panel': { to: 'ui-card' },
  'ui-surface': { to: 'ui-card' },
  'ui-layers': { to: 'ui-overlay' },
  'ui-app': { to: 'ui-page' },
  'ui-layout': { to: 'ui-page', attrs: { layout: 'app' } },
  'ui-shell': { to: 'ui-page', attrs: { layout: 'app' } },
  'ui-app-shell': { to: 'ui-page', attrs: { layout: 'app' } },
};

/** Concepts whose native element is the right answer. Rendered as plain boxes, `UI-PREFER-NATIVE`. */
export const preferNative: Record<string, { use: string; display: 'inline' | 'block' }> = {
  'ui-link': { use: '<a href="…">', display: 'inline' },
  'ui-list': { use: '<ul> or <ol>', display: 'block' },
  'ui-list-item': { use: '<li>', display: 'block' },
};

/** Adopted vocabulary that is not in this build yet, with what to write today. */
export const planned: Record<string, string> = {
  'ui-heading': '<h1>…<h6> (styled automatically)',
  'ui-text': '<p> or <span>; <small> for fine print',
  'ui-table': '<table> with <thead>/<tbody> (styled automatically)',
  'ui-input': '<label>Label <input name="…"></label>',
  'ui-switch': '<input type="checkbox" role="switch">',
  'ui-checkbox': '<input type="checkbox">',
  'ui-select': '<select>',
  'ui-field': '<label> wrapping the control',
  'ui-dialog': '<dialog>',
  'ui-alert': '<ui-card variant="warning|danger|info|success" role="status">',
  'ui-divider': '<hr>',
  'ui-badge': '<span> (or <mark>)',
  'ui-icon': 'inline <svg>',
  'ui-prose': 'plain <div> (native text is styled)',
  'ui-aspect-ratio': '<div style="aspect-ratio: 16 / 9">',
  'ui-scroll-area': '<div style="overflow: auto">',
  'ui-relative-time': '<time datetime="…">',
  'ui-date': '<time datetime="…">',
  'ui-datetime': '<time datetime="…">',
  'ui-number': 'the formatted number as text',
  'ui-stat': '<ui-card> with <ui-stack gap="xs"> (label, value, change)',
  'ui-avatar': '<img alt="…">',
  'ui-skeleton': 'nothing (render the content)',
};

export const plannedAliases: Record<string, string> = {
  'ui-modal': 'ui-dialog',
  'ui-callout': 'ui-alert',
  'ui-frame': 'ui-aspect-ratio',
  'ui-scroll': 'ui-scroll-area',
  'ui-num': 'ui-number',
  'ui-format-number': 'ui-number',
  'ui-currency': 'ui-number',
  'ui-separator': 'ui-divider',
  'ui-toggle': 'ui-switch',
  'ui-data-table': 'ui-table',
  'ui-metric': 'ui-stat',
  'ui-stat-card': 'ui-stat',
  'ui-tile': 'ui-stat',
  'ui-format-date': 'ui-date',
  'ui-time': 'ui-datetime',
  'ui-date-time': 'ui-datetime',
};

/** Hints for attributes agents reach for that we deliberately don't have. */
export const attrHints: Record<string, Record<string, string>> = {
  'ui-button': { href: 'ui-button is not a link: use <a href="…">' },
  'ui-grid': { rows: 'rows size to content; set block sizes on the children if needed' },
  '*': {
    width: 'size comes from the layout: use ui-grid min-item-width, ui-row item-width/equal, or ui-container size',
    height: 'heights come from content; for a full-height app shell use <ui-page layout="app">',
  },
};

export const globalAttrs = new Set([
  'id', 'class', 'style', 'hidden', 'title', 'lang', 'dir', 'tabindex', 'slot', 'role', 'part', 'exportparts',
  'inert', 'draggable', 'contenteditable', 'spellcheck', 'translate', 'accesskey', 'autofocus', 'enterkeyhint',
  'inputmode', 'is', 'nonce', 'popover', 'autocapitalize', 'writingsuggestions', 'itemscope', 'itemprop',
  'itemtype', 'itemid', 'itemref', 'anchor', 'popovertarget', 'popovertargetaction', 'xmlns',
]);
export const globalPrefixes = ['aria-', 'data-', 'on'];

/** Token scales (rem). Reused by the CSS and the docs. */
export const tokens = {
  space: { '0': '0', xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem', '2xl': '3rem' },
  item: { xs: '8rem', sm: '12rem', md: '16rem', lg: '20rem', xl: '24rem', '2xl': '30rem' },
  measure: { xs: '20rem', sm: '30rem', md: '40rem', lg: '50rem', xl: '60rem', '2xl': '72rem' },
  container: { sm: '40rem', md: '56rem', lg: '72rem', xl: '90rem', full: '100%' },
  radius: { '0': '0', sm: '0.25rem', md: '0.5rem', lg: '0.75rem', xl: '1rem', full: '999px' },
} as const;

export const manifest = {
  version: VERSION,
  elements,
  childAttrs,
  tagAliases,
  preferNative,
  planned,
  plannedAliases,
  attrHints,
  globalAttrs: [...globalAttrs],
  globalPrefixes,
  tokens,
};
export type Manifest = typeof manifest;
