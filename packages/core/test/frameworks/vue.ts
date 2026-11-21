import '@agent-ui/core';
import { createApp, h, nextTick, reactive } from 'vue';
import type { Mount, State } from './scene.ts';

// The template of App.vue, inlined at bundle time and compiled in the browser.
declare const __APP_TEMPLATE__: string;

export const mount: Mount = (el, s0) => {
  const s = reactive({ ...s0 });
  const App = { props: ['s'], template: __APP_TEMPLATE__ };
  const app = createApp({ setup: () => () => h(App, { s }) });
  app.config.compilerOptions.isCustomElement = (t) => t.startsWith('ui-');
  app.mount(el);
  return { set: async (n: State) => { Object.assign(s, n); await nextTick(); } };
};
