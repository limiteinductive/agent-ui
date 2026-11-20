// Entry: one script tag gives you the stylesheet, the elements and the diagnostics.
//   <script src="https://cdn.jsdelivr.net/npm/@agent-ui/core/dist/agent-ui.js"></script>
import { VERSION, manifest, elements } from './manifest.ts';
import { UIButton, define } from './elements/button.ts';
import { Engine } from './diagnostics/engine.ts';
import type { Draft } from './diagnostics/record.ts';

declare const __UI_CSS__: string;

const KEY = Symbol.for('ui.core');

/** Layout elements need no behavior; defining them claims the names and makes :defined true. */
const plain = (): CustomElementConstructor => class extends HTMLElement {};

function cssVersion(): string {
  return getComputedStyle(document.documentElement).getPropertyValue('--ui-version').trim().replace(/^["']|["']$/g, '');
}

function boot() {
  const g = globalThis as Record<PropertyKey, unknown>;
  const existing = g[KEY] as Engine | undefined;
  if (existing) { existing.secondLoad(VERSION); return existing; }

  const notes: Draft[] = [];
  const de = document.documentElement;

  // stylesheet: inject unless a <link> already provides it
  const linked = cssVersion();
  if (!linked) {
    try {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(__UI_CSS__);
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    } catch { /* reported below */ }
    if (!cssVersion()) {
      notes.push({
        code: 'UI-CSS-MISSING', got: 'agent-ui.js ran but --ui-version is unset',
        cause: 'the browser rejected the injected stylesheet (constructable stylesheets unsupported or blocked)',
        fix: ['add <link rel="stylesheet" href="…/agent-ui.css"> next to the script'],
      });
    }
  } else if (linked !== VERSION) {
    notes.push({
      code: 'UI-VERSION-SKEW', got: `agent-ui.css ${linked} with agent-ui.js ${VERSION}`,
      cause: 'the stylesheet and the script come from different versions',
      fix: [`load agent-ui.css and agent-ui.js from the same version (${VERSION})`],
    });
  }

  // elements
  const ours: CustomElementConstructor[] = [];
  for (const tag of Object.keys(elements)) {
    const ctor = tag === 'ui-button' ? UIButton : plain();
    if (define(tag, ctor) !== 'foreign') ours.push(customElements.get(tag)!);
  }

  de.setAttribute('data-ui-ready', '');
  const engine = new Engine(notes, ours);
  g[KEY] = engine;
  const api = Object.assign(engine.api, { manifest });
  Object.assign(globalThis, { __ui: api, __uiReady: engine.ready });
  if (!('ui' in globalThis)) Object.assign(globalThis, { ui: api });
  return engine;
}

if (typeof document !== 'undefined' && typeof customElements !== 'undefined') boot();

export { VERSION, manifest, UIButton };
export type { Report } from './diagnostics/engine.ts';
export type { Diagnostic } from './diagnostics/record.ts';
