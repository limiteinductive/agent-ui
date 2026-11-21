import '@agent-ui/core';
import { html, type Mount } from './scene.ts';

export const mount: Mount = (el, s) => {
  el.innerHTML = html(s);
  return { set: (s) => { el.innerHTML = html(s); } };
};
