// agent-ui 0.1.0: attribute types for each element. Generated from the manifest; do not edit.

export type CSSLength = `${number}${'px' | 'rem' | 'em' | 'ch' | 'ex' | 'lh' | 'vw' | 'vh' | 'vi' | 'vb' | 'svh' | 'lvh' | 'dvh' | 'svw' | 'lvw' | 'dvw' | 'cqi' | 'cqw' | 'cqh' | 'cqb' | '%'}` | `${'calc' | 'min' | 'max' | 'clamp'}(${string})`;

/** <ui-stack>: Vertical flow with consistent gaps. direction="horizontal" makes it exactly a ui-row. */
export interface UIStackAttributes {
  /** Space between children. Default md. */
  gap?: '0' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Cross-axis alignment of children. Default stretch. */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  /** Main-axis distribution. space-between with 2 children pushes them apart; with 3 it gives start / true center / end. Default start. */
  justify?: 'start' | 'center' | 'end' | 'space-between';
  /** Inner spacing. Default 0. */
  padding?: '0' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** horizontal = ui-row (all row attributes apply). Default vertical. */
  direction?: 'vertical' | 'horizontal';
  /** Children wrap onto new lines (tags, chips, button groups). Off by default. */
  wrap?: boolean;
  /** Horizontal rail: one line that scrolls, with snap. Pair with item-width for card carousels. */
  scroll?: boolean;
  /** Children share the row equally (flex: 1 1 0). */
  equal?: boolean;
  /** All-or-nothing switch: below this container width every child stacks; above it they share one line equally. Bare = md. */
  'stack-below'?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | CSSLength | boolean;
  /** With stack-below: stack anyway when there are more than N children. */
  limit?: number | `${number}`;
  /** With scroll: width of each item (capped at 85% of the rail). */
  'item-width'?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | CSSLength;
}

/** <ui-row>: Horizontal line of children. Content-sized, no wrap, vertically centered by default. */
export interface UIRowAttributes {
  /** Space between children. Default md. */
  gap?: '0' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Cross-axis alignment of children. Default center. */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  /** Main-axis distribution. space-between with 2 children pushes them apart; with 3 it gives start / true center / end. Default start. */
  justify?: 'start' | 'center' | 'end' | 'space-between';
  /** Inner spacing. Default 0. */
  padding?: '0' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Children wrap onto new lines (tags, chips, button groups). Off by default. */
  wrap?: boolean;
  /** Horizontal rail: one line that scrolls, with snap. Pair with item-width for card carousels. */
  scroll?: boolean;
  /** Children share the row equally (flex: 1 1 0). */
  equal?: boolean;
  /** All-or-nothing switch: below this container width every child stacks; above it they share one line equally. Bare = md. */
  'stack-below'?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | CSSLength | boolean;
  /** With stack-below: stack anyway when there are more than N children. */
  limit?: number | `${number}`;
  /** With scroll: width of each item (capped at 85% of the rail). */
  'item-width'?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | CSSLength;
}

/** <ui-grid>: Equal tiles that reflow: as many columns as fit min-item-width. columns = exact count, max-columns = responsive cap. */
export interface UIGridAttributes {
  /** Space between children. Default md. */
  gap?: '0' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Inner spacing. Default 0. */
  padding?: '0' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Smallest a tile may get before the grid drops a column. Default md. */
  'min-item-width'?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | CSSLength;
  /** Exact column count at every width (calendars, fixed tables). */
  columns?: number | `${number}`;
  /** Responsive: at most N columns, fewer when tiles would drop below min-item-width. */
  'max-columns'?: number | `${number}`;
}

/** <ui-overlay>: Children share one cell; later children paint on top (badge on image, caption over media). */
export interface UIOverlayAttributes {
  /** Vertical placement of children. Default stretch. */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Horizontal placement of children. Default stretch. */
  justify?: 'start' | 'center' | 'end' | 'stretch';
}

/** <ui-card>: Bounded surface. Owns its ink, borders and focus color for everything inside. */
export interface UICardAttributes {
  /** Inner spacing. Default lg. */
  padding?: '0' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Space between children. Default md. */
  gap?: '0' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Corner radius. Bare = md. */
  rounded?: '0' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | boolean;
  /** Raised above the page (shadow). */
  elevated?: boolean;
  /** Recessed below the page. */
  sunken?: boolean;
  /** Opposite color scheme (dark card on a light page). */
  inverse?: boolean;
  /** Meaning: tints the surface. */
  variant?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

/** <ui-button>: Button. Form-associated: type="submit" submits its form. Default type="button". */
export interface UIButtonAttributes {
  /** Emphasis. Default secondary. */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  /** Height and padding. Default md. */
  size?: 'sm' | 'md' | 'lg';
  /** Form behavior. Default button. */
  type?: 'button' | 'submit' | 'reset';
  /** Pending: shows a spinner and ignores clicks. */
  loading?: boolean;
  /** Disabled (stays focusable, announced as disabled). */
  disabled?: boolean;
  /** Corner radius; bare rounded = pill. Bare = full. */
  rounded?: '0' | 'sm' | 'md' | 'lg' | 'full' | boolean;
  /** Form field name. */
  name?: string;
  /** Form field value. */
  value?: string;
}

/** <ui-page>: Page root. layout="document" (default) scrolls the document; layout="app" is a full-height shell placed by tag: <header> on top, <nav> at the start side, <aside> at the end side, <footer> at the bottom, and one other child (usually <main>) as the main region, which scrolls. Each region takes one child: wrap the main content in a single <main>. */
export interface UIPageAttributes {
  /** Document flow or app shell. Default document. */
  layout?: 'document' | 'app';
}

/** <ui-container>: Centered max-width column with gutters. Children may break out with bleed="wide|full". */
export interface UIContainerAttributes {
  /** Content width. Default lg. */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/** Attributes a child reads from its parent (any element, ui-* or native). */
export interface UIChildAttributes {
  /** This child takes the leftover space. In a wrapping row it becomes the main column of a side + main layout. */
  grow?: boolean;
  /** Escape the container measure: wide or edge-to-edge full. Bare = full. */
  bleed?: 'wide' | 'full' | boolean;
}

/** React: on native elements it drops boolean values for attributes it does not know. Write grow="" or grow={cond ? '' : undefined}. */
export interface UIChildAttributeStrings {
  /** This child takes the leftover space. In a wrapping row it becomes the main column of a side + main layout. */
  grow?: '' | 'true' | 'false';
  /** Escape the container measure: wide or edge-to-edge full. Bare = full. */
  bleed?: 'wide' | 'full' | '' | 'true' | 'false';
}

/** Every element and its attribute interface. */
export interface UIElementAttributes {
  'ui-stack': UIStackAttributes;
  'ui-row': UIRowAttributes;
  'ui-grid': UIGridAttributes;
  'ui-overlay': UIOverlayAttributes;
  'ui-card': UICardAttributes;
  'ui-button': UIButtonAttributes;
  'ui-page': UIPageAttributes;
  'ui-container': UIContainerAttributes;
}

/** <ui-stack>. Each property mirrors its attribute. */
export interface UIStackElement extends HTMLElement {
  /** Space between children. Default md. */
  get gap(): string | null;
  set gap(v: UIStackAttributes['gap'] | null | undefined);
  /** Cross-axis alignment of children. Default stretch. */
  get align(): string | null;
  set align(v: UIStackAttributes['align'] | null | undefined);
  /** Main-axis distribution. space-between with 2 children pushes them apart; with 3 it gives start / true center / end. Default start. */
  get justify(): string | null;
  set justify(v: UIStackAttributes['justify'] | null | undefined);
  /** Inner spacing. Default 0. */
  get padding(): string | null;
  set padding(v: UIStackAttributes['padding'] | null | undefined);
  /** horizontal = ui-row (all row attributes apply). Default vertical. */
  get direction(): string | null;
  set direction(v: UIStackAttributes['direction'] | null | undefined);
  /** Children wrap onto new lines (tags, chips, button groups). Off by default. */
  get wrap(): boolean;
  set wrap(v: UIStackAttributes['wrap'] | null | undefined);
  /** Children share the row equally (flex: 1 1 0). */
  get equal(): boolean;
  set equal(v: UIStackAttributes['equal'] | null | undefined);
  /** All-or-nothing switch: below this container width every child stacks; above it they share one line equally. Bare = md. */
  get stackBelow(): string | null;
  set stackBelow(v: UIStackAttributes['stack-below'] | null | undefined);
  /** With stack-below: stack anyway when there are more than N children. */
  get limit(): string | null;
  set limit(v: UIStackAttributes['limit'] | null | undefined);
  /** With scroll: width of each item (capped at 85% of the rail). */
  get itemWidth(): string | null;
  set itemWidth(v: UIStackAttributes['item-width'] | null | undefined);
}

/** <ui-row>. Each property mirrors its attribute. */
export interface UIRowElement extends HTMLElement {
  /** Space between children. Default md. */
  get gap(): string | null;
  set gap(v: UIRowAttributes['gap'] | null | undefined);
  /** Cross-axis alignment of children. Default center. */
  get align(): string | null;
  set align(v: UIRowAttributes['align'] | null | undefined);
  /** Main-axis distribution. space-between with 2 children pushes them apart; with 3 it gives start / true center / end. Default start. */
  get justify(): string | null;
  set justify(v: UIRowAttributes['justify'] | null | undefined);
  /** Inner spacing. Default 0. */
  get padding(): string | null;
  set padding(v: UIRowAttributes['padding'] | null | undefined);
  /** Children wrap onto new lines (tags, chips, button groups). Off by default. */
  get wrap(): boolean;
  set wrap(v: UIRowAttributes['wrap'] | null | undefined);
  /** Children share the row equally (flex: 1 1 0). */
  get equal(): boolean;
  set equal(v: UIRowAttributes['equal'] | null | undefined);
  /** All-or-nothing switch: below this container width every child stacks; above it they share one line equally. Bare = md. */
  get stackBelow(): string | null;
  set stackBelow(v: UIRowAttributes['stack-below'] | null | undefined);
  /** With stack-below: stack anyway when there are more than N children. */
  get limit(): string | null;
  set limit(v: UIRowAttributes['limit'] | null | undefined);
  /** With scroll: width of each item (capped at 85% of the rail). */
  get itemWidth(): string | null;
  set itemWidth(v: UIRowAttributes['item-width'] | null | undefined);
}

/** <ui-grid>. Each property mirrors its attribute. */
export interface UIGridElement extends HTMLElement {
  /** Space between children. Default md. */
  get gap(): string | null;
  set gap(v: UIGridAttributes['gap'] | null | undefined);
  /** Inner spacing. Default 0. */
  get padding(): string | null;
  set padding(v: UIGridAttributes['padding'] | null | undefined);
  /** Smallest a tile may get before the grid drops a column. Default md. */
  get minItemWidth(): string | null;
  set minItemWidth(v: UIGridAttributes['min-item-width'] | null | undefined);
  /** Exact column count at every width (calendars, fixed tables). */
  get columns(): string | null;
  set columns(v: UIGridAttributes['columns'] | null | undefined);
  /** Responsive: at most N columns, fewer when tiles would drop below min-item-width. */
  get maxColumns(): string | null;
  set maxColumns(v: UIGridAttributes['max-columns'] | null | undefined);
}

/** <ui-overlay>. Each property mirrors its attribute. */
export interface UIOverlayElement extends HTMLElement {
  /** Vertical placement of children. Default stretch. */
  get align(): string | null;
  set align(v: UIOverlayAttributes['align'] | null | undefined);
  /** Horizontal placement of children. Default stretch. */
  get justify(): string | null;
  set justify(v: UIOverlayAttributes['justify'] | null | undefined);
}

/** <ui-card>. Each property mirrors its attribute. */
export interface UICardElement extends HTMLElement {
  /** Inner spacing. Default lg. */
  get padding(): string | null;
  set padding(v: UICardAttributes['padding'] | null | undefined);
  /** Space between children. Default md. */
  get gap(): string | null;
  set gap(v: UICardAttributes['gap'] | null | undefined);
  /** Corner radius. Bare = md. */
  get rounded(): string | null;
  set rounded(v: UICardAttributes['rounded'] | null | undefined);
  /** Raised above the page (shadow). */
  get elevated(): boolean;
  set elevated(v: UICardAttributes['elevated'] | null | undefined);
  /** Recessed below the page. */
  get sunken(): boolean;
  set sunken(v: UICardAttributes['sunken'] | null | undefined);
  /** Opposite color scheme (dark card on a light page). */
  get inverse(): boolean;
  set inverse(v: UICardAttributes['inverse'] | null | undefined);
  /** Meaning: tints the surface. */
  get variant(): string | null;
  set variant(v: UICardAttributes['variant'] | null | undefined);
}

/** <ui-button>: form-associated, focusable, inert while disabled or loading. Each property mirrors its attribute. */
export interface UIButtonElement extends HTMLElement {
  /** Emphasis. Default secondary. */
  get variant(): string | null;
  set variant(v: UIButtonAttributes['variant'] | null | undefined);
  /** Height and padding. Default md. */
  get size(): string | null;
  set size(v: UIButtonAttributes['size'] | null | undefined);
  /** Form behavior. Default button. */
  get type(): 'button' | 'submit' | 'reset';
  set type(v: UIButtonAttributes['type'] | null | undefined);
  /** Pending: shows a spinner and ignores clicks. */
  loading: boolean;
  /** Disabled (stays focusable, announced as disabled). */
  disabled: boolean;
  /** Corner radius; bare rounded = pill. Bare = full. */
  get rounded(): string | null;
  set rounded(v: UIButtonAttributes['rounded'] | null | undefined);
  /** Form field name. */
  get name(): string | null;
  set name(v: UIButtonAttributes['name'] | null | undefined);
  /** Form field value. */
  get value(): string | null;
  set value(v: UIButtonAttributes['value'] | null | undefined);
  readonly form: HTMLFormElement | null;
  readonly labels: NodeList;
}

/** <ui-page>. Each property mirrors its attribute. */
export interface UIPageElement extends HTMLElement {
  /** Document flow or app shell. Default document. */
  get layout(): string | null;
  set layout(v: UIPageAttributes['layout'] | null | undefined);
}

/** <ui-container>. Each property mirrors its attribute. */
export interface UIContainerElement extends HTMLElement {
  /** Content width. Default lg. */
  get size(): string | null;
  set size(v: UIContainerAttributes['size'] | null | undefined);
}

/** Every element and its DOM interface. */
export interface UIElements {
  'ui-stack': UIStackElement;
  'ui-row': UIRowElement;
  'ui-grid': UIGridElement;
  'ui-overlay': UIOverlayElement;
  'ui-card': UICardElement;
  'ui-button': UIButtonElement;
  'ui-page': UIPageElement;
  'ui-container': UIContainerElement;
}

export type Severity = 'error' | 'warn' | 'info';
export type Layer = 'static' | 'dom' | 'layout';
export interface Diagnostic {
  code: string; severity: Severity; confidence: 'certain' | 'likely' | 'heuristic'; layer: Layer;
  path: string; selector: string; snippet: string; src?: string; got: string; allowed?: string[];
  context: { width: number; height: number; scheme: 'light' | 'dark'; engine: string };
  cause: string; fix: string[]; docs: string; fingerprint: string; count: number; more?: string[];
  /** Path of the element whose data-ui-allow covers this. Allowed diagnostics never count. */
  allowedBy?: string;
  /** The one-line form printed to the console. */
  text: string;
}
export interface Report {
  version: string; ok: boolean; summary: string;
  counts: { error: number; warn: number; info: number; allowed: number };
  checked: { elements: number; rules: number; layers: Layer[] };
  context: Diagnostic['context'];
  diff: { fixed: number; new: number; remain: number } | null;
  diagnostics: Diagnostic[];
}
export interface UIApi {
  version: string;
  /** The latest report, null before the first check finishes. */
  readonly report: Report | null;
  readonly diagnostics: Diagnostic[];
  /** The first check. */
  ready: Promise<Report>;
  /** Re-run every check. settle (default true) waits for fonts, images and animations first. */
  check(opts?: { settle?: boolean }): Promise<Report>;
  manifest: unknown;
}
export declare const VERSION: string;
/** The element reference SKILL.md is generated from. */
export declare const manifest: unknown;
export declare const UIButton: { new (): UIButtonElement; prototype: UIButtonElement; readonly formAssociated: true };

declare global {
  interface HTMLElementTagNameMap extends UIElements {}
  /** The diagnostics API (also `ui` when that name is free). */
  var __ui: UIApi;
  var __uiReady: Promise<Report>;
}
