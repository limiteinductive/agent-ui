import '@agent-ui/core';
import type {} from '@agent-ui/core/react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import type { Mount, State } from './scene.ts';

function App({ s }: { s: State }) {
  return (
    <ui-container size="md" data-k="container">
      {/* on native elements React drops true, so child attributes are strings */}
      <div bleed={s.bleed === true ? '' : s.bleed} data-k="bleed">Bleed</div>
      <ui-stack gap={s.gap} data-k="stack">
        <ui-row wrap={s.wrap} gap="sm" className="r" data-k="row">
          <span grow={s.grow ? '' : undefined} data-k="grow">Alpha</span><span>Beta</span><span>Gamma</span>
        </ui-row>
        <ui-row stack-below={s.stackBelow} data-k="sb"><div>One</div><div>Two</div></ui-row>
        <ui-grid columns={s.columns} data-k="grid"><div>1</div><div>2</div><div>3</div><div>4</div></ui-grid>
        <ui-card elevated={s.elevated} variant={s.variant} padding="md" data-k="card"><p>Card</p></ui-card>
        <form data-k="form">
          <ui-button variant={s.variant} type="submit" disabled={s.disabled} loading={s.loading} data-k="btn">Save</ui-button>
        </form>
      </ui-stack>
    </ui-container>
  );
}

export const mount: Mount = (el, s) => {
  const root = createRoot(el);
  const render = (s: State) => flushSync(() => root.render(<App s={s} />));
  render(s);
  return { set: render };
};

// Type checks only (never rendered): what the typings must accept and reject.
export const _types = (b: HTMLElement | null) => <>
  <ui-row stack-below="40rem" item-width="calc(100% - 2rem)" gap="0" limit={3} />
  <ui-grid min-item-width="12rem" max-columns="4" />
  <ui-button ref={(el) => { el?.form; b = el; }} onClick={(e) => e.currentTarget.disabled} />
  <section grow="" bleed="full" />
  <ui-card grow="true" ref={(el) => { if (el) { el.elevated = true; el.padding = 'md'; el.gap = null; } }} />
  {/* @ts-expect-error React drops a bare (true) attribute on native elements */}
  <section grow />
  {/* @ts-expect-error not a gap step */}
  <ui-row gap="huge" />
  {/* @ts-expect-error columns takes a number */}
  <ui-grid columns="three" />
  {/* @ts-expect-error flags are booleans */}
  <ui-card elevated="yes" />
  {/* @ts-expect-error not a length */}
  <ui-row stack-below="12parsecs" />
  {/* @ts-expect-error not a button size */}
  <ui-button size="xl" />
  {/* @ts-expect-error not an element */}
  <ui-rowz />
</>;
