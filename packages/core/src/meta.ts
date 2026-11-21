// Generates editor and type metadata from the manifest: custom-elements.json (the community standard most tools read),
// VS Code HTML custom data, and TypeScript declarations for plain DOM, React, Solid and Vue. Canonical names only, as in SKILL.md.
import { VERSION, elements, childAttrs, type AttrSpec } from './manifest.ts';
import { camel } from './elements/reflect.ts';

const REPO = 'https://github.com/limiteinductive/agent-ui';
const DOCS = `${REPO}/blob/main/packages/core/dist/SKILL.md`;
const UNITS = ['px', 'rem', 'em', 'ch', 'ex', 'lh', 'vw', 'vh', 'vi', 'vb', 'svh', 'lvh', 'dvh', 'svw', 'lvw', 'dvw', 'cqi', 'cqw', 'cqh', 'cqb', '%'];

const pascal = (tag: string) => tag.split('-').map((p) => (p === 'ui' ? 'UI' : p[0].toUpperCase() + p.slice(1))).join('');
const iface = (tag: string) => `${pascal(tag)}Attributes`;
const q = (s: string) => `'${s}'`;
const plain = (md: string) => md.replace(/`/g, '');

/** The value a framework passes for this attribute, as a TS type. true is the bare attribute; false (written "false") is off. */
function tsType(s: AttrSpec): string {
  switch (s.kind) {
    case 'flag': case 'toggle': return 'boolean';
    case 'int': return 'number | `${number}`';
    case 'string': return 'string';
    default: {
      const t = (s.values ?? []).map(q);
      if (s.length) t.push('CSSLength');
      if (s.presence) t.push('boolean');
      return t.join(' | ');
    }
  }
}

/** React drops boolean values for attributes it doesn't know on native elements, so there child attributes are strings. */
function reactChildType(s: AttrSpec): string {
  return [...(s.values ?? []).map(q), "''", "'true'", "'false'"].join(' | ');
}

/** What the mirroring property reads back (src/elements/reflect.ts). */
const propGet = (s: AttrSpec) => (s.kind === 'flag' || s.kind === 'toggle' ? 'boolean' : 'string | null');

/** The same, as written in HTML (custom-elements.json `type.text`). */
function htmlType(s: AttrSpec): string {
  switch (s.kind) {
    case 'flag': return s.native ? 'boolean' : 'boolean | "false"';
    case 'toggle': return 'boolean | "false"';
    case 'int': return `number (${s.min}–${s.max})`;
    case 'string': return 'string';
    default: return [...(s.values ?? []).map((v) => `"${v}"`), ...(s.length ? ['CSS length'] : [])].join(' | ');
  }
}

const doc = (s: AttrSpec) => {
  const extra = s.presence ? ` Bare = \`${s.presence}\`.` : s.default ? ` Default \`${s.default}\`.` : '';
  return `${s.description}${extra}`;
};

// ---------------------------------------------------------------- custom-elements.json

export function customElementsJson() {
  const module = 'dist/agent-ui.mjs';
  const declarations = Object.entries(elements).map(([tag, el]) => ({
    kind: 'class', customElement: true, tagName: tag, name: pascal(tag), description: el.description,
    attributes: Object.entries(el.attrs).map(([name, s]) => ({
      name, description: doc(s), type: { text: htmlType(s) }, ...(s.default !== undefined ? { default: JSON.stringify(s.default) } : {}),
    })),
    ...(el.childAttrs?.length ? { slots: [{ name: '', description: `Children may carry: ${el.childAttrs.join(', ')}.` }] } : {}),
  }));
  return {
    schemaVersion: '2.0.0',
    readme: DOCS,
    modules: [{
      kind: 'javascript-module', path: module, declarations,
      exports: declarations.map((d) => ({ kind: 'custom-element-definition', name: d.tagName, declaration: { name: d.name, module } })),
    }],
  };
}

// ---------------------------------------------------------------- VS Code HTML custom data

export function vscodeData() {
  const md = (value: string) => ({ kind: 'markdown', value });
  const attr = (name: string, s: AttrSpec) => ({
    name, description: md(doc(s)),
    ...(s.kind === 'flag' || s.kind === 'toggle' ? { valueSet: 'v' } : {}),
    ...(s.values ? { values: s.values.map((v) => ({ name: v })) } : {}),
  });
  return {
    version: 1.1,
    tags: Object.entries(elements).map(([tag, el]) => ({
      name: tag, description: md(el.description),
      attributes: Object.entries(el.attrs).map(([n, s]) => attr(n, s)),
      references: [{ name: 'agent-ui reference', url: DOCS }],
    })),
    globalAttributes: Object.entries(childAttrs).map(([n, s]) =>
      ({ ...attr(n, s), description: md(`${doc(s)} On a child of ${s.parents.join(', ')}.`) })),
  };
}

// ---------------------------------------------------------------- TypeScript

const header = (what: string) => `// agent-ui ${VERSION}: ${what}. Generated from the manifest; do not edit.\n`;

function props(attrs: Record<string, AttrSpec>, type = tsType, indent = '  ') {
  return Object.entries(attrs).map(([n, s]) => `${indent}/** ${plain(doc(s))} */\n${indent}${/^[a-z]+$/.test(n) ? n : q(n)}?: ${type(s)};`).join('\n');
}

const elName = (tag: string) => `${pascal(tag)}Element`;
/** Built in on HTMLElement already (scroll() is a method; assigning el.scroll still sets the attribute). */
const BUILT_IN = new Set(['scroll']);
const BUTTON_OWN: Record<string, string> = {
  disabled: '  disabled: boolean;', loading: '  loading: boolean;',
  type: "  get type(): 'button' | 'submit' | 'reset';\n  set type(v: UIButtonAttributes['type'] | null | undefined);",
};

/** The DOM interface: a property per attribute that mirrors it (true = bare, false/null = removed). */
function elementInterface(tag: string): string[] {
  const el = elements[tag];
  const note = tag === 'ui-button' ? ': form-associated, focusable, inert while disabled or loading' : '';
  const lines = [`/** <${tag}>${note}. Each property mirrors its attribute. */`, `export interface ${elName(tag)} extends HTMLElement {`];
  for (const [n, s] of Object.entries(el.attrs)) {
    const p = camel(n);
    if (BUILT_IN.has(p)) continue;
    lines.push(`  /** ${plain(doc(s))} */`);
    if (tag === 'ui-button' && BUTTON_OWN[n]) { lines.push(BUTTON_OWN[n]); continue; }
    lines.push(`  get ${p}(): ${propGet(s)};`, `  set ${p}(v: ${iface(tag)}[${q(n)}] | null | undefined);`);
  }
  if (tag === 'ui-button') lines.push('  readonly form: HTMLFormElement | null;', '  readonly labels: NodeList;');
  lines.push('}', '');
  return lines;
}

/** Framework-neutral: one interface per element, and the DOM tag map. */
export function typesIndex(): string {
  const lines = [header('attribute types for each element'),
    `export type CSSLength = \`\${number}\${${UNITS.map(q).join(' | ')}}\` | \`\${'calc' | 'min' | 'max' | 'clamp'}(\${string})\`;`, ''];
  for (const [tag, el] of Object.entries(elements)) {
    lines.push(`/** <${tag}>: ${plain(el.description)} */`, `export interface ${iface(tag)} {`, props(el.attrs), '}', '');
  }
  lines.push('/** Attributes a child reads from its parent (any element, ui-* or native). */', 'export interface UIChildAttributes {', props(childAttrs), '}', '');
  lines.push('/** React: on native elements it drops boolean values for attributes it does not know. Write grow="" or grow={cond ? \'\' : undefined}. */',
    'export interface UIChildAttributeStrings {', props(childAttrs, reactChildType), '}', '');
  lines.push('/** Every element and its attribute interface. */', 'export interface UIElementAttributes {',
    ...Object.keys(elements).map((t) => `  ${q(t)}: ${iface(t)};`), '}', '');
  for (const t of Object.keys(elements)) lines.push(...elementInterface(t));
  lines.push('/** Every element and its DOM interface. */', 'export interface UIElements {',
    ...Object.keys(elements).map((t) => `  ${q(t)}: ${elName(t)};`), '}', '');
  lines.push(API, 'declare global {', '  interface HTMLElementTagNameMap extends UIElements {}',
    '  /** The diagnostics API (also `ui` when that name is free). */', '  var __ui: UIApi;', '  var __uiReady: Promise<Report>;', '}', '');
  return lines.join('\n');
}

// Mirrors src/index.ts exports and src/diagnostics/{engine,record}.ts; test/frameworks type-checks a use of each.
const API = `export type Severity = 'error' | 'warn' | 'info';
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
`;

const tagEntries = (wrap: (tag: string) => string) => Object.keys(elements).map((t) => `      ${q(t)}: ${wrap(t)};`);

/** React 18.3+ / 19 (react-jsx). Attribute names the library also uses are replaced, not intersected. */
export function typesReact(): string {
  return [header('React JSX typings'),
    "import type { DetailedHTMLProps, HTMLAttributes } from 'react';",
    "import type { UIElementAttributes, UIChildAttributeStrings, UIElements } from './index.js';", '',
    'type El<T extends keyof UIElementAttributes, E extends HTMLElement> =',
    '  Omit<DetailedHTMLProps<HTMLAttributes<E>, E>, keyof UIElementAttributes[T]> & UIElementAttributes[T];', '',
    "declare module 'react' {",
    '  namespace JSX {', '    interface IntrinsicElements {',
    ...tagEntries((t) => `El<${q(t)}, UIElements[${q(t)}]>`), '    }', '  }',
    '  // grow and bleed go on any child; strings, since React drops true/false on native elements',
    '  interface HTMLAttributes<T> extends UIChildAttributeStrings {}', '}', ''].join('\n');
}

/** Solid 1.x. */
export function typesSolid(): string {
  return [header('Solid JSX typings'),
    "import type { JSX } from 'solid-js';",
    "import type { UIElementAttributes, UIChildAttributes, UIElements } from './index.js';", '',
    'type El<T extends keyof UIElementAttributes, E extends HTMLElement> = Omit<JSX.HTMLAttributes<E>, keyof UIElementAttributes[T]> & UIElementAttributes[T];', '',
    "declare module 'solid-js' {",
    '  namespace JSX {', '    interface IntrinsicElements {',
    ...tagEntries((t) => `El<${q(t)}, UIElements[${q(t)}]>`), '    }',
    '    // grow and bleed go on any child', '    interface HTMLAttributes<T> extends UIChildAttributes {}', '  }', '}', ''].join('\n');
}

/** Vue 3.3+ templates (vue-tsc / Volar), the way the Vue docs type custom elements. */
export function typesVue(): string {
  return [header('Vue template typings'),
    "import type { HTMLAttributes, PublicProps } from 'vue';",
    "import type { UIElementAttributes, UIElements } from './index.js';", '',
    'type El<T extends keyof UIElementAttributes, E extends HTMLElement> =',
    '  new () => E & { $props: Omit<HTMLAttributes, keyof UIElementAttributes[T]> & UIElementAttributes[T] & PublicProps };', '',
    "declare module 'vue' {", '  interface GlobalComponents {',
    ...tagEntries((t) => `El<${q(t)}, UIElements[${q(t)}]>`).map((l) => l.slice(2)), '  }', '}', ''].join('\n');
}

export function metaFiles(): Record<string, string> {
  const json = (v: unknown) => JSON.stringify(v, null, 2) + '\n';
  return {
    'custom-elements.json': json(customElementsJson()),
    'vscode.html-data.json': json(vscodeData()),
    'types/index.d.ts': typesIndex(),
    'types/react.d.ts': typesReact(),
    'types/solid.d.ts': typesSolid(),
    'types/vue.d.ts': typesVue(),
  };
}
