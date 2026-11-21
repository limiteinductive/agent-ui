// One page, two states. Each framework renders it from state; the reference is the same page written as plain HTML.
// State 0 -> 1 flips every boolean, so each attribute is seen added, removed and changed after mount.
export interface State {
  gap: 'sm' | 'lg';
  wrap: boolean;
  grow: boolean;
  stackBelow: true | 'lg';
  columns: number;
  elevated: boolean;
  variant: 'primary' | 'danger';
  disabled: boolean;
  loading: boolean;
  bleed: true | 'wide';
}

export const STATES: State[] = [
  { gap: 'sm', wrap: true, grow: true, stackBelow: true, columns: 3, elevated: true, variant: 'primary', disabled: false, loading: false, bleed: true },
  { gap: 'lg', wrap: false, grow: false, stackBelow: 'lg', columns: 2, elevated: false, variant: 'danger', disabled: true, loading: true, bleed: 'wide' },
];

const a = (name: string, v: boolean | string | number) => (v === false ? '' : v === true ? ` ${name}` : ` ${name}="${v}"`);

export const html = (s: State) => `
<ui-container size="md" data-k="container">
  <div${a('bleed', s.bleed)} data-k="bleed">Bleed</div>
  <ui-stack${a('gap', s.gap)} data-k="stack">
    <ui-row${a('wrap', s.wrap)} gap="sm" class="r" data-k="row"><span${a('grow', s.grow)} data-k="grow">Alpha</span><span>Beta</span><span>Gamma</span></ui-row>
    <ui-row${a('stack-below', s.stackBelow)} data-k="sb"><div>One</div><div>Two</div></ui-row>
    <ui-grid${a('columns', s.columns)} data-k="grid"><div>1</div><div>2</div><div>3</div><div>4</div></ui-grid>
    <ui-card${a('elevated', s.elevated)}${a('variant', s.variant)} padding="md" data-k="card"><p>Card</p></ui-card>
    <form data-k="form"><ui-button${a('variant', s.variant)} type="submit"${a('disabled', s.disabled)}${a('loading', s.loading)} data-k="btn">Save</ui-button></form>
  </ui-stack>
</ui-container>`;

export interface Mounted { set(s: State): void | Promise<void> }
export type Mount = (root: HTMLElement, s: State) => Mounted;
