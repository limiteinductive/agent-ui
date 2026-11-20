// Diagnostic records: identity (path, selector, snippet), fingerprints, and the one-line text form.
import { sprouted } from '../elements/button.ts';
import { RULES, docsRef, type Layer, type Severity } from './rules.ts';

export type Confidence = 'certain' | 'likely' | 'heuristic';

export interface Context { width: number; height: number; scheme: 'light' | 'dark'; engine: string }

/** What a rule produces. The engine adds identity, context and text. */
export interface Draft {
  code: string;
  el?: Element;
  got: string;
  cause: string;
  fix: string[];
  allowed?: string[];
  severity?: Severity;
  confidence?: Confidence;
  src?: string;
}

export interface Diagnostic {
  code: string;
  severity: Severity;
  confidence: Confidence;
  layer: Layer;
  path: string;
  selector: string;
  snippet: string;
  src?: string;
  got: string;
  allowed?: string[];
  context: Context;
  cause: string;
  fix: string[];
  docs: string;
  fingerprint: string;
  count: number;
  /** Paths of the other instances when count > 1 (first 5). */
  more?: string[];
  /** Path of the element whose data-ui-allow covers this. Allowed diagnostics never count. */
  allowedBy?: string;
  text: string;
}

/** Attributes the engine writes; never part of a snippet and never a reason to re-check. */
export const ENGINE_ATTRS = new Set(['data-ui-diag', 'data-ui-ready']);

export function fnv1a(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

/** The opening tag as written. */
export function snippet(el: Element): string {
  let s = '<' + el.localName;
  for (const a of el.attributes) {
    if (ENGINE_ATTRS.has(a.name)) continue;
    if (sprouted(el, a.name)) continue;
    s += a.value === '' ? ` ${a.name}` : ` ${a.name}="${trunc(a.value, 48)}"`;
  }
  return trunc(s, 160) + '>';
}

function segment(el: Element): string {
  const tag = el.localName;
  if (el.id) return `${tag}#${el.id}`;
  const p = el.parentElement;
  if (!p) return tag;
  let same = 0, idx = 0;
  for (const c of p.children) {
    if (c.localName === tag) { same++; if (c === el) idx = same; }
  }
  return same > 1 ? `${tag}[${idx}]` : tag;
}

const STOP = (e: Element) => e === document.body || e === document.documentElement;

/** Human path: `ui-container > ui-stack[2] > ui-card`, anchored at the nearest ancestor id. */
export function pathOf(el: Element): string {
  if (STOP(el)) return el.localName;
  const parts: string[] = [];
  for (let e: Element | null = el; e && !STOP(e); e = e.parentElement) {
    parts.unshift(segment(e));
    if (e.id && e !== el) break;
  }
  return parts.length > 7 ? [...parts.slice(0, 2), '…', ...parts.slice(-4)].join(' > ') : parts.join(' > ');
}

/** Machine selector: `document.querySelector(selector) === el`. */
export function selectorOf(el: Element): string {
  if (el === document.documentElement) return 'html';
  if (el === document.body) return 'body';
  const parts: string[] = [];
  for (let e: Element | null = el; e; e = e.parentElement) {
    if (e === document.body) { parts.unshift('body'); break; }
    if (e.id && document.querySelectorAll(`#${CSS.escape(e.id)}`).length === 1) {
      parts.unshift(`#${CSS.escape(e.id)}`);
      break;
    }
    const tag = CSS.escape(e.localName);
    const p = e.parentElement;
    if (!p) { parts.unshift(tag); break; }
    let same = 0, idx = 0;
    for (const c of p.children) {
      if (c.localName === e.localName) { same++; if (c === e) idx = same; }
    }
    parts.unshift(same > 1 ? `${tag}:nth-of-type(${idx})` : tag);
  }
  return parts.join(' > ');
}

export function context(): Context {
  const de = document.documentElement;
  const forced = de.getAttribute('data-scheme');
  const dark = forced ? forced === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const ua = navigator.userAgent;
  const m = /(Edg|Firefox|Chrome)\/(\d+)/.exec(ua) ?? /Version\/(\d+).*Safari/.exec(ua);
  const engine = m ? (m.length === 3 ? `${m[1] === 'Edg' ? 'Edge' : m[1]} ${m[2]}` : `Safari ${m[1]}`) : 'unknown';
  return { width: innerWidth, height: innerHeight, scheme: dark ? 'dark' : 'light', engine };
}

export function textOf(d: Omit<Diagnostic, 'text'>): string {
  let s = `${d.code} ${d.got}`;
  if (d.snippet) s += ` on ${d.snippet}`;
  if (d.path) s += ` (${d.path}${d.count > 1 ? `, ×${d.count}` : ''})`;
  else if (d.count > 1) s += ` ×${d.count}`;
  if (d.src) s += ` at ${d.src}`;
  s += ` — ${d.cause}`;
  if (d.allowed?.length) s += `; allowed ${d.allowed.join('|')}`;
  if (d.fix.length) s += `; fix: ${d.fix.join(' — or — ')}`;
  return `${s}; ${d.docs}`;
}

const allowList = (el: Element) => {
  const host = el.closest('[data-ui-allow]');
  if (!host) return null;
  const codes = host.getAttribute('data-ui-allow')!.toLowerCase().split(/[\s,]+/).filter(Boolean);
  return { host, codes };
};

const SEVERITY_ORDER: Record<Severity, number> = { error: 0, warn: 1, info: 2 };

export interface Finalized {
  diagnostics: Diagnostic[];
  /** Instance fingerprints (code + path + got) for diffing across checks. */
  instances: Set<string>;
  /** Element -> codes, for data-ui-diag. */
  marks: Map<Element, Set<string>>;
}

/** Drafts -> records: identity, data-ui-allow, collapse identical snippets, sort by severity. */
export function finalize(drafts: Draft[], ctx: Context): Finalized {
  const groups = new Map<string, Diagnostic & { _els: Element[] }>();
  const instances = new Set<string>();
  const marks = new Map<Element, Set<string>>();
  for (const dr of drafts) {
    const rule = RULES[dr.code];
    const el = dr.el && dr.el.isConnected ? dr.el : undefined;
    const path = el ? pathOf(el) : '';
    const snip = el ? snippet(el) : '';
    const fp = fnv1a(`${dr.code}|${path}|${dr.got}`);
    if (instances.has(fp)) continue; // the same instance reported twice (event + scan)
    instances.add(fp);
    let allowedBy: string | undefined;
    if (el) {
      const al = allowList(el);
      if (al && al.codes.includes(dr.code.toLowerCase())) allowedBy = pathOf(al.host);
    }
    const key = `${dr.code}|${snip}|${dr.got}|${dr.fix.join('|')}|${allowedBy ? 'a' : ''}`;
    const g = groups.get(key);
    if (g) {
      g.count++;
      if (el) g._els.push(el);
      if (path && (g.more ??= []).length < 5) g.more.push(path);
    } else {
      groups.set(key, {
        code: dr.code,
        severity: dr.severity ?? rule.severity,
        confidence: dr.confidence ?? (rule.layer === 'layout' ? 'likely' : 'certain'),
        layer: rule.layer,
        path, selector: el ? selectorOf(el) : '', snippet: snip,
        ...(dr.src ? { src: dr.src } : {}),
        got: dr.got,
        ...(dr.allowed ? { allowed: dr.allowed } : {}),
        context: ctx,
        cause: dr.cause, fix: dr.fix, docs: docsRef(dr.code),
        fingerprint: fp, count: 1,
        ...(allowedBy ? { allowedBy } : {}),
        text: '',
        _els: el ? [el] : [],
      });
    }
    if (el && !allowedBy) {
      let s = marks.get(el);
      if (!s) marks.set(el, (s = new Set()));
      s.add(dr.code);
    }
  }
  const diagnostics: Diagnostic[] = [];
  for (const g of groups.values()) {
    const { _els, ...d } = g;
    d.text = textOf(d);
    Object.defineProperty(d, 'elements', { value: _els, enumerable: false });
    diagnostics.push(d);
  }
  diagnostics.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  return { diagnostics, instances, marks };
}
