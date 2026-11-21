import '@agent-ui/core';
import type {} from '@agent-ui/core/solid';
import { render } from 'solid-js/web';
import { createSignal } from 'solid-js';
import type { Mount } from './scene.ts';

export const mount: Mount = (el, s0) => {
  const [s, set] = createSignal(s0);
  render(() => (
    <ui-container size="md" data-k="container">
      <div bleed={s().bleed} data-k="bleed">Bleed</div>
      <ui-stack gap={s().gap} data-k="stack">
        <ui-row wrap={s().wrap} gap="sm" class="r" data-k="row">
          <span grow={s().grow} data-k="grow">Alpha</span><span>Beta</span><span>Gamma</span>
        </ui-row>
        <ui-row stack-below={s().stackBelow} data-k="sb"><div>One</div><div>Two</div></ui-row>
        <ui-grid columns={s().columns} data-k="grid"><div>1</div><div>2</div><div>3</div><div>4</div></ui-grid>
        <ui-card elevated={s().elevated} variant={s().variant} padding="md" data-k="card"><p>Card</p></ui-card>
        <form data-k="form">
          <ui-button variant={s().variant} type="submit" disabled={s().disabled} loading={s().loading} data-k="btn">Save</ui-button>
        </form>
      </ui-stack>
    </ui-container>
  ), el);
  return { set };
};

export const _types = () => <>
  <ui-row stack-below="40rem" item-width="calc(100% - 2rem)" gap="0" limit={3} />
  <ui-button ref={(el) => el.form} onClick={(e) => e.currentTarget.disabled} />
  <section grow bleed="full" />
  {/* @ts-expect-error not a gap step */}
  <ui-row gap="huge" />
  {/* @ts-expect-error columns takes a number */}
  <ui-grid columns="three" />
  {/* @ts-expect-error flags are booleans */}
  <ui-card elevated="yes" />
  {/* @ts-expect-error not an element */}
  <ui-rowz />
</>;
