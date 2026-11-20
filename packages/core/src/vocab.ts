// Canonicalization: written tag/attribute/value -> canonical meaning.
// Shared by the CSS generator (to expand aliases into selectors) and the static rules.
import {
  elements, childAttrs, tagAliases, preferNative, planned, plannedAliases, attrHints,
  globalAttrs, globalPrefixes, tokens, TOGGLE_OFF,
  type AttrSpec, type TagAlias,
} from './manifest.ts';

// ---------------------------------------------------------------- tags

export type TagResult =
  | { type: 'element'; canonical: string; alias?: TagAlias }
  | { type: 'prefer-native'; use: string }
  | { type: 'planned'; target: string; fallback: string; via?: string }
  | { type: 'unknown'; suggestion?: string };

/** Misnamings we never accept as aliases but can point at. */
const TAG_GUESSES: Record<string, string> = {
  'ui-hstack': 'ui-row', 'ui-horizontal': 'ui-row', 'ui-flex-row': 'ui-row', 'ui-inline': 'ui-row',
  'ui-cluster': 'ui-row', 'ui-split': 'ui-row', 'ui-bar': 'ui-row', 'ui-reel': 'ui-row', 'ui-switcher': 'ui-row',
  'ui-vstack': 'ui-stack', 'ui-column': 'ui-stack', 'ui-col': 'ui-stack', 'ui-flex': 'ui-stack', 'ui-flex-col': 'ui-stack',
  'ui-btn': 'ui-button', 'ui-wrapper': 'ui-container', 'ui-center': 'ui-container', 'ui-box': 'ui-card',
  'ui-tiles': 'ui-grid', 'ui-columns': 'ui-grid', 'ui-sidebar': 'ui-row',
};

export const KNOWN_TAGS = [
  ...Object.keys(elements), ...Object.keys(tagAliases), ...Object.keys(planned),
  ...Object.keys(plannedAliases), ...Object.keys(preferNative),
];

export function resolveTag(tag: string): TagResult {
  if (elements[tag]) return { type: 'element', canonical: tag };
  const a = tagAliases[tag];
  if (a) return { type: 'element', canonical: a.to, alias: a };
  const pn = preferNative[tag];
  if (pn) return { type: 'prefer-native', use: pn.use };
  if (planned[tag]) return { type: 'planned', target: tag, fallback: planned[tag] };
  const pa = plannedAliases[tag];
  if (pa) return { type: 'planned', target: pa, fallback: planned[pa], via: tag };
  return { type: 'unknown', suggestion: TAG_GUESSES[tag] ?? nearest(tag, KNOWN_TAGS) };
}

// ---------------------------------------------------------------- values

export type ValueResult =
  | { ok: true; value: string; aliased: boolean; attr?: string }
  | { ok: false; allowed: string[]; suggestion?: string; remove?: boolean };

const LENGTH_RE = /^-?(\d+\.?\d*|\.\d+)(px|rem|em|ch|ex|lh|vw|vh|vi|vb|svh|lvh|dvh|svw|lvw|dvw|cqi|cqw|cqh|cqb|%)$/i;
export const isLength = (v: string) => LENGTH_RE.test(v) || /^(calc|min|max|clamp)\(.+\)$/i.test(v);
const NUM_RE = /^-?(\d+\.?\d*|\.\d+)$/;

function toRem(v: string, bareStep: number): number | null {
  const m = /^(-?\d*\.?\d+)(px|rem|em)?$/i.exec(v);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const unit = (m[2] ?? '').toLowerCase();
  return unit === 'px' ? n / 16 : unit === '' ? n * bareStep : n;
}

/** Nearest scale step to a numeric or px/rem value: gap="4" -> md, gap="24px" -> lg. */
function nearestToken(spec: AttrSpec, v: string): string | undefined {
  const fam = tokens[spec.tokens ?? 'space'] as Record<string, string>;
  const rem = toRem(v, (spec.tokens ?? 'space') === 'space' ? 0.25 : 1 / 16);
  if (rem == null) return undefined;
  let best: string | undefined, bestD = Infinity;
  for (const step of spec.values ?? []) {
    const t = fam[step];
    if (t == null || t.endsWith('%')) continue;
    const d = Math.abs(parseFloat(t) - rem);
    if (d < bestD) { bestD = d; best = step; }
  }
  return best;
}

export function canonValue(spec: AttrSpec, name: string, raw: string): ValueResult {
  const v = raw.trim();
  const lv = v.toLowerCase();
  switch (spec.kind) {
    case 'string':
      return { ok: true, value: raw, aliased: false };
    case 'flag':
      if (lv === '' || lv === 'true' || lv === name) return { ok: true, value: '', aliased: false };
      return { ok: false, allowed: [`${name} (bare)`], remove: lv === 'false' || lv === 'none', suggestion: '' };
    case 'toggle': {
      const on = ['', 'true', name, ...(spec.on ?? [])];
      if (on.includes(lv)) return { ok: true, value: 'on', aliased: false };
      if ((TOGGLE_OFF as readonly string[]).includes(lv)) return { ok: true, value: 'off', aliased: false };
      return { ok: false, allowed: [`${name} (bare)`, `${name}="false"`], suggestion: '' };
    }
    case 'enum':
    case 'scale': {
      const values = spec.values ?? [];
      if (v === '' && spec.presence) return { ok: true, value: spec.presence, aliased: false };
      if (values.includes(v)) return { ok: true, value: v, aliased: false };
      if (values.includes(lv)) return { ok: true, value: lv, aliased: true };
      const al = spec.valueAliases?.[lv];
      if (typeof al === 'string') return { ok: true, value: al, aliased: true };
      if (al) return { ok: true, value: al.value ?? '', aliased: true, attr: al.attr };
      if (spec.kind === 'scale' && spec.length && isLength(v)) return { ok: true, value: v, aliased: false };
      const allowed = [...values, ...(spec.length ? ['<length>'] : [])];
      let suggestion: string | undefined;
      if (spec.kind === 'scale') {
        if (spec.length && NUM_RE.test(v)) suggestion = `${v}px`;
        else suggestion = nearestToken(spec, v);
      }
      suggestion ??= nearest(lv, [...values, ...Object.keys(spec.valueAliases ?? {})]);
      if (suggestion && spec.valueAliases?.[suggestion]) {
        const t = spec.valueAliases[suggestion];
        suggestion = typeof t === 'string' ? t : suggestion;
      }
      return { ok: false, allowed, suggestion };
    }
    case 'int': {
      const min = spec.min ?? 0, max = spec.max ?? Infinity;
      if (/^\d+$/.test(v)) {
        const n = parseInt(v, 10);
        if (n >= min && n <= max) return { ok: true, value: String(n), aliased: false };
        return { ok: false, allowed: [`${min}–${max}`], suggestion: String(Math.min(max, Math.max(min, n))) };
      }
      return { ok: false, allowed: [`${min}–${max}`] };
    }
  }
}

// ---------------------------------------------------------------- attributes

export type AttrResult =
  | { type: 'global' }
  | { type: 'child'; attr: string; spec: AttrSpec & { parents: string[] }; value: ValueResult }
  | { type: 'attr'; written: string; attr: string; aliasOf: boolean; spec: AttrSpec; value: ValueResult }
  | { type: 'unknown'; suggestion?: string; elsewhere?: string[]; hint?: string };

export const isGlobalAttr = (name: string) =>
  globalAttrs.has(name) || globalPrefixes.some((p) => name.startsWith(p));

/** Canonicalize one attribute on a known (canonical) element. */
export function canonAttr(tag: string, name: string, raw: string): AttrResult {
  const el = elements[tag];
  const spec = el.attrs[name];
  if (spec) {
    const value = canonValue(spec, name, raw);
    if (value.ok && value.attr) return { type: 'attr', written: name, attr: value.attr, aliasOf: false, spec: el.attrs[value.attr], value };
    return { type: 'attr', written: name, attr: name, aliasOf: false, spec, value };
  }
  const alias = el.attrAliases?.[name];
  if (alias) {
    const target = el.attrs[alias.to];
    if (alias.value !== undefined) {
      return { type: 'attr', written: name, attr: alias.to, aliasOf: true, spec: target, value: { ok: true, value: alias.value, aliased: true } };
    }
    if (alias.values) {
      const mapped = alias.values[raw.trim().toLowerCase()];
      if (mapped === undefined) {
        return { type: 'unknown', hint: `${name}="${Object.keys(alias.values).join('|')}" means ${alias.to}; other values have no effect here` };
      }
      return { type: 'attr', written: name, attr: alias.to, aliasOf: true, spec: target, value: canonValue(target, alias.to, mapped) };
    }
    const value = canonValue(target, name, raw);
    return { type: 'attr', written: name, attr: value.ok && value.attr ? value.attr : alias.to, aliasOf: true, spec: target, value };
  }
  const child = childAttrs[name];
  if (child) return { type: 'child', attr: name, spec: child, value: canonValue(child, name, raw) };
  if (isGlobalAttr(name)) return { type: 'global' };

  const own = [...Object.keys(el.attrs), ...Object.keys(el.attrAliases ?? {})];
  const elsewhere = Object.entries(elements)
    .filter(([t, s]) => t !== tag && (s.attrs[name] || s.attrAliases?.[name]))
    .map(([t]) => t);
  const hint = attrHints[tag]?.[name] ?? attrHints['*']?.[name];
  let suggestion = nearest(name, own);
  if (suggestion && el.attrAliases?.[suggestion]) suggestion = el.attrAliases[suggestion].to;
  return { type: 'unknown', suggestion, elsewhere, hint };
}

// ---------------------------------------------------------------- selector spellings (CSS generator)

/**
 * Every written [name, value] pair on `tag` that canonicalizes to (attr, value).
 * value === null in the output means a presence selector `[name]`.
 * Lengths are open-ended and are handled separately with attr().
 */
export function spellings(tag: string, attr: string, value: string): Array<[string, string | null]> {
  const el = elements[tag];
  const out: Array<[string, string | null]> = [];
  const names = [...Object.keys(el.attrs), ...Object.keys(el.attrAliases ?? {})];
  for (const n of names) {
    const alias = el.attrAliases?.[n];
    let cands: Array<string | null>;
    if (alias?.value !== undefined) cands = [null];
    else if (alias?.values) cands = Object.keys(alias.values);
    else cands = finiteValues(el.attrs[alias ? alias.to : n], n);
    for (const c of cands) {
      const r = canonAttr(tag, n, c ?? '');
      if (r.type === 'attr' && r.value.ok && r.attr === attr && r.value.value === value) out.push([n, c]);
    }
  }
  return out;
}

function finiteValues(spec: AttrSpec, name: string): Array<string | null> {
  switch (spec.kind) {
    case 'flag': return [null];
    case 'toggle': return ['', 'true', name, ...(spec.on ?? [])];
    case 'enum':
    case 'scale': return [...(spec.values ?? []), ...Object.keys(spec.valueAliases ?? {}), ...(spec.presence ? [''] : [])];
    case 'int': {
      const r: string[] = [];
      for (let i = spec.min ?? 0; i <= (spec.max ?? 0); i++) r.push(String(i));
      return r;
    }
    default: return [];
  }
}

/** Child-attribute spellings (grow, bleed) — no aliases. */
export function childSpellings(attr: string, value: string): Array<[string, string | null]> {
  const spec = childAttrs[attr];
  return finiteValues(spec, attr)
    .filter((c) => { const r = canonValue(spec, attr, c ?? ''); return r.ok && r.value === value; })
    .map((c) => [attr, c] as [string, string | null]);
}

// ---------------------------------------------------------------- helpers

export function lev(a: string, b: string): number {
  const m = a.length, n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

export function nearest(word: string, cands: readonly string[]): string | undefined {
  // compare stems: the shared ui- prefix would make every short tag look close ("ui-foo" ~ "ui-row")
  const stem = (s: string) => (s.startsWith('ui-') ? s.slice(3) : s);
  let best: string | undefined, bestD = Infinity;
  for (const c of cands) {
    const d = lev(stem(word), stem(c));
    if (d < bestD) { bestD = d; best = c; }
  }
  const n = stem(word).length;
  const limit = n >= 4 ? Math.max(2, Math.floor(n / 3)) : 1;
  if (bestD <= limit) return best;
  // containment: "min-col-width" vs "min-column-width", "ui-panel-card" vs "ui-card"
  return cands.find((c) => c.length > 3 && (word.includes(c) || c.includes(word)));
}
