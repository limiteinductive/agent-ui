// Static rules: what the markup says, before layout. Also builds the canonical view
// (tag + canonical attributes) of every ui-* element, which the layout rules reuse.
import { elements, childAttrs, VERSION, type AttrSpec } from '../manifest.ts';
import { resolveTag, canonAttr, canonValue, type AttrResult } from '../vocab.ts';
import type { Draft } from './record.ts';

export interface Canon {
  tag: string;
  /** canonical attribute -> canonical value ('on' | 'off' for toggles, '' for flags; 'off' wherever "false" was written) */
  attrs: Map<string, string>;
}

const CANONICAL_TAGS = Object.keys(elements);

const written = (n: string, v: string) => (v === '' ? n : `${n}="${v}"`);

/** How the canonical form of (attr, value) is written. */
function canonicalSpelling(spec: AttrSpec, attr: string, value: string): string {
  if (value === 'off') return `${attr}="false"`;
  if (spec.kind === 'flag' || spec.kind === 'toggle') return attr;
  if (spec.presence && value === spec.presence) return attr;
  return `${attr}="${value}"`;
}

function kindCause(spec: AttrSpec, name: string): string {
  switch (spec.kind) {
    case 'flag': return spec.native ? `${name} is a flag: present or absent (the browser reads ${name}="false" as present)`
      : `${name} is a flag: present, or absent (or ${name}="false")`;
    case 'toggle': return `${name} is on when present; ${name}="false" turns it off`;
    case 'int': return `${name} takes a whole number`;
    case 'scale': return `${name} takes a ${spec.tokens ?? 'space'} token${spec.length ? ' or a CSS length with a unit' : ''}`;
    default: return `${name} takes one of a fixed set of values`;
  }
}

function badValue(el: Element, name: string, raw: string, spec: AttrSpec, canonName: string,
  v: Extract<ReturnType<typeof canonValue>, { ok: false }>): Draft {
  const fix = v.remove ? [`remove ${name}`]
    : v.suggestion === '' ? [`write bare ${canonName}`]
    : v.suggestion !== undefined ? [`change ${written(name, raw)} to ${canonName}="${v.suggestion}"`]
    : [];
  return { code: 'UI-BAD-VALUE', el, got: written(name, raw), cause: kindCause(spec, name), allowed: v.allowed, fix };
}

/** Canonical tag of a parent, or null if it isn't one of ours. */
const canonTag = (el: Element | null) => {
  if (!el) return null;
  const r = resolveTag(el.localName);
  return r.type === 'element' ? r.canonical : null;
};

function checkChildAttr(el: Element, name: string, raw: string, out: Draft[]) {
  const spec = childAttrs[name];
  const parent = canonTag(el.parentElement);
  if (!parent || !spec.parents.includes(parent)) {
    out.push({
      code: 'UI-MISPLACED-ATTR', el, severity: 'warn', got: written(name, raw),
      cause: `${name} is read by the parent; it only works on direct children of ${spec.parents.map((p) => `<${p}>`).join(', ')}`
        + (el.parentElement ? `, and this element's parent is <${el.parentElement.localName}>` : ''),
      fix: [`remove ${name}`, `make this a direct child of <${spec.parents[0]}>`],
    });
    return;
  }
  const v = canonValue(spec, name, raw);
  if (!v.ok) out.push(badValue(el, name, raw, spec, name, v));
}

const TRACK_LIST = /[\s(]|fr\b|px|rem|%|auto|min|max/i;

function gridTrackList(el: Element, raw: string, out: Draft[]) {
  const rep = /^repeat\(\s*(\d+)\s*,/i.exec(raw.trim());
  const parts = raw.trim().split(/\s+/);
  const allFr = parts.every((p) => p.toLowerCase() === '1fr');
  const fix = rep ? [`change columns="${raw}" to columns="${rep[1]}" (or max-columns="${rep[1]}" to reflow on small screens)`]
    : allFr ? [`change columns="${raw}" to columns="${parts.length}"`]
    : [
      'for side + main, use <ui-row wrap> with grow on the main child: <ui-row wrap><aside>…</aside><main grow>…</main></ui-row>',
      `for ${parts.length} equal tracks, columns="${parts.length}"`,
    ];
  out.push({
    code: 'UI-BAD-VALUE', el, got: `columns="${raw}"`,
    cause: 'columns is a count of equal tracks, not a track list',
    allowed: ['1–12'], fix,
  });
}

/**
 * Walk the body once. Returns the number of elements checked.
 * `foreign(tag)` is true for ui-* names another library defined; those are left alone.
 */
export function staticCheck(out: Draft[], canon: Map<Element, Canon>, foreign: (tag: string) => boolean): number {
  const all = document.body?.querySelectorAll('*') ?? [];
  for (const el of all) {
    const tag = el.localName;
    if (!tag.startsWith('ui-')) {
      if (el.hasAttribute('grow')) checkChildAttr(el, 'grow', el.getAttribute('grow')!, out);
      if (el.hasAttribute('bleed')) checkChildAttr(el, 'bleed', el.getAttribute('bleed')!, out);
      continue;
    }
    if (foreign(tag)) continue;
    const c = checkElement(el, tag, out);
    if (c) canon.set(el, c);
    if (c?.tag === 'ui-page' && el.parentElement?.closest(pageSelector)) {
      out.push({
        code: 'UI-NESTED-ROOT', el, got: `<${tag}> inside <${el.parentElement.closest(pageSelector)!.localName}>`,
        cause: 'a page has exactly one root',
        fix: [`replace the inner <${tag}> with <ui-container> or <ui-stack>`],
      });
    }
  }
  return all.length;
}

const pageSelector = ['ui-page', 'ui-app', 'ui-layout', 'ui-shell', 'ui-app-shell'].join(',');

function checkElement(el: Element, tag: string, out: Draft[]): Canon | null {
  const r = resolveTag(tag);
  if (r.type === 'unknown') {
    out.push({
      code: 'UI-UNKNOWN-ELEMENT', el, got: `<${tag}>`,
      cause: `${tag} is not an agent-ui element` + (r.suggestion ? `; closest is <${r.suggestion}>` : ''),
      allowed: CANONICAL_TAGS,
      fix: r.suggestion ? [`rename <${tag}> to <${r.suggestion}>`] : ['use one of the listed elements or a native element'],
    });
    return null;
  }
  if (r.type === 'planned') {
    out.push({
      code: 'UI-UNKNOWN-ELEMENT', el, got: `<${tag}>`,
      cause: `<${r.target}> is planned but not in ${VERSION}` + (r.via ? ` (<${r.via}> will be its alias)` : ''),
      fix: [`use ${r.fallback}`],
    });
    return null;
  }
  if (r.type === 'prefer-native') {
    out.push({
      code: 'UI-PREFER-NATIVE', el, got: `<${tag}>`,
      cause: 'the native element already does this and is styled; this tag renders as a plain box',
      fix: [`replace <${tag}> with ${r.use}`],
    });
    return null;
  }

  const ctag = r.canonical;
  const spec = elements[ctag];
  const attrs = new Map<string, string>();
  const writers = new Map<string, string>(); // canonical attr -> how it was written (for conflicts)
  if (r.alias) {
    const extra = Object.entries(r.alias.attrs ?? {}).map(([k, v]) => ` ${k}="${v}"`).join('');
    out.push({
      code: 'UI-ALIAS', el, got: `<${tag}>`,
      cause: `<${tag}> is an alias of <${ctag}${extra}>`,
      fix: [`rename <${tag}> to <${ctag}${extra}>`],
    });
    for (const [k, v] of Object.entries(r.alias.attrs ?? {})) { attrs.set(k, v); writers.set(k, `<${tag}>`); }
  }

  const isGrid = ctag === 'ui-grid';
  const breakpointCols: Array<[string, string]> = [];
  const needsHorizontal: Array<[string, string, AttrSpec, string]> = [];

  for (const a of el.attributes) {
    const name = a.name, raw = a.value;
    if (isGrid && name === 'responsive') continue;
    if (isGrid && name === 'columns' && !/^\s*\d+\s*$/.test(raw) && TRACK_LIST.test(raw)) {
      gridTrackList(el, raw, out);
      continue;
    }
    const res: AttrResult = canonAttr(ctag, name, raw);
    if (res.type === 'global') continue;
    if (res.type === 'child') { checkChildAttr(el, name, raw, out); continue; }
    if (res.type === 'unknown') {
      const where = res.elsewhere?.length ? ` (${name} exists on ${res.elsewhere.map((t) => `<${t}>`).join(', ')})` : '';
      out.push({
        code: 'UI-UNKNOWN-ATTR', el, got: written(name, raw),
        cause: `<${ctag}> has no ${name} attribute${where}${res.hint ? `: ${res.hint}` : ''}`,
        allowed: Object.keys(spec.attrs),
        fix: res.suggestion ? [`rename ${name} to ${res.suggestion}`] : [`remove ${name}`],
      });
      continue;
    }
    if (!res.value.ok) {
      out.push(badValue(el, name, raw, res.spec, res.attr, res.value));
      continue;
    }
    const value = res.value.value;
    if (isGrid && /^columns-/.test(name)) { breakpointCols.push([name, value]); continue; }
    if (res.aliasOf || res.value.aliased) {
      const canonical = canonicalSpelling(res.spec, res.attr, value);
      out.push({
        code: 'UI-ALIAS', el, got: written(name, raw),
        cause: `${written(name, raw)} is an alias of ${canonical}`,
        fix: [`change ${written(name, raw)} to ${canonical}`],
      });
    }
    if (res.spec.requires && value !== 'off') needsHorizontal.push([name, raw, res.spec, res.attr]);
    const prev = attrs.get(res.attr);
    if (prev !== undefined && prev !== value) {
      out.push({
        code: 'UI-CONFLICT', el, got: `${writers.get(res.attr)} and ${written(name, raw)}`,
        cause: `both set ${res.attr}, to different values`,
        fix: [`keep one of ${writers.get(res.attr)}, ${written(name, raw)}`],
      });
    }
    attrs.set(res.attr, value);
    writers.set(res.attr, written(name, raw));
  }

  // grid: breakpoint-style columns-* collapse into one max-columns
  if (breakpointCols.length) {
    const max = String(Math.max(...breakpointCols.map(([, v]) => +v)));
    const got = breakpointCols.map(([n, v]) => `${n}="${v}"`).join(' ');
    out.push({
      code: 'UI-ALIAS', el, got,
      cause: 'ui-grid reflows on its own; breakpoint column counts mean a cap',
      fix: [`replace ${got} with max-columns="${max}"`],
    });
    if (!attrs.has('max-columns')) { attrs.set('max-columns', max); writers.set('max-columns', got); }
  }

  // grid: `responsive` — with columns it means max-columns, alone it is the default
  if (isGrid && el.hasAttribute('responsive')) {
    const cols = attrs.get('columns');
    if (cols !== undefined) {
      out.push({
        code: 'UI-ALIAS', el, got: `responsive columns="${cols}"`,
        cause: `responsive columns="${cols}" is an alias of max-columns="${cols}"`,
        fix: [`replace responsive columns="${cols}" with max-columns="${cols}"`],
      });
      attrs.delete('columns');
      attrs.set('max-columns', cols);
    } else {
      out.push({
        code: 'UI-ALIAS', el, got: 'responsive',
        cause: 'ui-grid is responsive by default',
        fix: ['remove responsive'],
      });
    }
  }

  // row attributes on a vertical stack
  const horizontal = ctag === 'ui-row' || attrs.get('direction') === 'horizontal';
  if (!horizontal) {
    for (const [name, raw, s, attr] of needsHorizontal) {
      out.push({
        code: 'UI-MISPLACED-ATTR', el, got: written(name, raw),
        cause: `${s.requires!.hint}: it only applies when the stack is horizontal`,
        fix: ['change <ui-stack> to <ui-row>', 'add direction="horizontal"'],
      });
      attrs.delete(attr);
    }
  }

  // mutually exclusive attributes
  const on = (k: string) => { const v = attrs.get(k); return v !== undefined && v !== 'off'; };
  for (const group of spec.conflicts ?? []) {
    const present = group.filter(on);
    if (present.length > 1) {
      const ws = present.map((k) => writers.get(k) ?? k);
      out.push({
        code: 'UI-CONFLICT', el, got: ws.join(' + '),
        cause: `${present.join(', ')} are mutually exclusive`,
        fix: [`keep one of ${ws.join(', ')}`],
      });
    }
  }

  // space-between with many children
  if (horizontal && attrs.get('justify') === 'space-between' && el.children.length >= 4) {
    out.push({
      code: 'row/space-between-many', el, got: `justify="space-between" with ${el.children.length} children`,
      cause: 'gaps will depend on content widths',
      fix: ['use gap and put grow on the flexible child', 'use <ui-grid> for equal tiles'],
    });
  }

  return { tag: ctag, attrs };
}
