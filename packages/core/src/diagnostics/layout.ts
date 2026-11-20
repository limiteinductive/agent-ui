// Layout rules: measured after the page settles. Each reads only the boxes it needs.
import { tokens } from '../manifest.ts';
import { isLength } from '../vocab.ts';
import { snippet, type Draft } from './record.ts';
import type { Canon } from './static.ts';

const hasBox = (el: Element) => el.getClientRects().length > 0;
const rootPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
const isOn = (c: Canon, a: string) => { const v = c.attrs.get(a); return v !== undefined && v !== 'off'; };
const isRow = (c: Canon) => c.tag === 'ui-row' || (c.tag === 'ui-stack' && c.attrs.get('direction') === 'horizontal');

function toPx(v: string): number | null {
  const m = /^(-?\d*\.?\d+)(px|rem|em)$/i.exec(v.trim());
  if (!m) return null;
  return m[2].toLowerCase() === 'px' ? +m[1] : +m[1] * rootPx();
}

export function layoutCheck(canon: Map<Element, Canon>, out: Draft[], owned: (n: Node) => boolean) {
  const rows = new Map<Element, Draft>();
  for (const [el, c] of canon) {
    if (!el.isConnected || !hasBox(el)) continue;
    if (isRow(c)) { const d = rowOverflow(el, c, out); if (d) rows.set(el, d); }
    else if (c.tag === 'ui-grid' && c.attrs.has('columns')) gridCramped(el, c, out);
  }
  pageOverflow(canon, out, owned, rows);
  brokenImages(out);
}

function rowOverflow(el: Element, c: Canon, out: Draft[]): Draft | undefined {
  if (isOn(c, 'wrap') || isOn(c, 'scroll') || isOn(c, 'stack-below')) return;
  const over = el.scrollWidth - el.clientWidth;
  if (over <= 1) return;
  // the child whose content overflows its own box the most (equal / grow children shrink below content)
  let culprit: Element | null = null, worst = 1;
  for (const k of el.children) {
    const o = k.scrollWidth - k.clientWidth;
    if (o > worst && getComputedStyle(k).overflowX === 'visible') { worst = o; culprit = k; }
  }
  const rem = Math.ceil(el.scrollWidth / rootPx());
  const d: Draft = {
    code: 'row/overflow', el, got: `content ${el.scrollWidth}px wide in a ${el.clientWidth}px row`,
    cause: 'the children do not fit on one line and the row neither wraps nor scrolls'
      + (culprit ? `; ${snippet(culprit)} is squeezed below its content` : ''),
    fix: ['add wrap', 'add scroll', `add stack-below="${rem}rem"`],
  };
  out.push(d);
  return d;
}

function gridCramped(el: Element, c: Canon, out: Draft[]) {
  const cols = c.attrs.get('columns')!;
  const kids = [...el.children].filter(hasBox);
  if (!kids.length) return;
  const tile = Math.round(kids[0].getBoundingClientRect().width);
  const squeezed = kids.find((k) => k.scrollWidth > k.clientWidth + 1 && getComputedStyle(k).overflowX === 'visible');
  let minPx: number | null = null;
  const min = c.attrs.get('min-item-width');
  if (min !== undefined) {
    const tok = (tokens.item as Record<string, string>)[min];
    minPx = tok ? toPx(tok) : isLength(min) ? toPx(min) : null;
  }
  const tooNarrow = minPx !== null && tile < minPx - 1;
  if (!squeezed && !tooNarrow) return;
  out.push({
    code: 'grid/cramped', el, got: `columns="${cols}" makes ${tile}px tiles in ${el.clientWidth}px`,
    cause: squeezed ? `${snippet(squeezed)} is wider than its tile` : `tiles are below min-item-width (${Math.round(minPx!)}px)`,
    fix: [`change columns="${cols}" to max-columns="${cols}"`],
  });
}

const CLIPS = new Set(['hidden', 'clip', 'auto', 'scroll']);
const MEDIA = new Set(['img', 'video', 'svg', 'canvas', 'iframe', 'picture', 'embed', 'object']);
const PRE = new Set(['pre', 'table', 'code']);

/** One problem, one diagnostic: when an overflowing row is what widens the page, its row/overflow becomes an error. */
function pageOverflow(canon: Map<Element, Canon>, out: Draft[], owned: (n: Node) => boolean, rows: Map<Element, Draft>) {
  const de = document.documentElement;
  const vw = de.clientWidth;
  if (de.scrollWidth <= vw + 1 || !document.body) return;
  const rtl = getComputedStyle(de).direction === 'rtl';
  const skip = new WeakSet<Element>(); // inside a clipping/scrolling/fixed box
  const over = new WeakSet<Element>();
  const found: Element[] = [];
  for (const el of document.body.querySelectorAll('*')) {
    const p = el.parentElement!;
    if (skip.has(p) || owned(el)) { skip.add(el); continue; }
    const cs = getComputedStyle(el);
    if (cs.display === 'none') { skip.add(el); continue; }
    const r = el.getBoundingClientRect();
    const past = rtl ? -(r.left + scrollX) : r.right + scrollX - vw;
    const breaks = past > 1 && (r.width > 0 || r.height > 0);
    if (breaks) {
      over.add(el);
      if (!over.has(p) && found.length < 5) found.push(el);
    }
    if (cs.position === 'fixed' || CLIPS.has(cs.overflowX)) skip.add(el);
  }
  if (!found.length) {
    out.push({
      code: 'layout/horizontal-overflow', el: de, got: `page is ${de.scrollWidth}px wide in a ${vw}px viewport`,
      cause: 'no single element breaks out; likely a pseudo-element or a negative margin',
      fix: ['find the wide element in devtools and constrain it'],
    });
    return;
  }
  for (const el of found) {
    const row = el.parentElement && rows.get(el.parentElement);
    if (row) {
      if (row.severity !== 'error') { row.severity = 'error'; row.cause += '; the whole page scrolls sideways'; }
      continue;
    }
    const r = el.getBoundingClientRect();
    const past = Math.round(rtl ? -(r.left + scrollX) : r.right + scrollX - vw);
    const tag = el.localName;
    const style = (el as HTMLElement).style;
    const parent = el.parentElement && canon.get(el.parentElement);
    let fix: string[];
    if (parent && isRow(parent) && !isOn(parent, 'wrap') && !isOn(parent, 'scroll')) fix = [`add wrap (or scroll) to the parent <${el.parentElement!.localName}>`];
    else if (style?.width || style?.minWidth) fix = [`remove the fixed ${style.width ? `width: ${style.width}` : `min-width: ${style.minWidth}`}`];
    else if (MEDIA.has(tag)) fix = ['add max-inline-size: 100%'];
    else if (PRE.has(tag)) fix = [`wrap it in <div style="overflow-x: auto">`];
    else fix = ['constrain it with max-inline-size: 100%', 'wrap it in <div style="overflow-x: auto">'];
    out.push({
      code: 'layout/horizontal-overflow', el, got: `extends ${past}px past the ${vw}px viewport`,
      cause: 'it is wider than its parent, which fits; the whole page scrolls sideways',
      fix,
    });
  }
}

function brokenImages(out: Draft[]) {
  for (const img of document.images) {
    const src = img.currentSrc || img.src;
    if (!src || !img.complete || img.naturalWidth || img.naturalHeight) continue;
    if (/\.svg(\?|#|$)|^data:image\/svg/i.test(src)) continue; // SVGs may have no intrinsic size
    out.push(resourceDraft(img, src));
  }
}

export function resourceDraft(el: Element, url: string): Draft {
  const tag = el.localName;
  const blocking = tag === 'script' || tag === 'link';
  return {
    code: 'UI-RESOURCE-FAILED', el, severity: blocking ? 'error' : 'warn',
    got: `failed to load ${url.length > 120 ? url.slice(0, 119) + '…' : url}`,
    cause: blocking ? 'a script or stylesheet did not load; part of the page is missing' : 'the resource did not load (404, network, or blocked)',
    fix: ['check the URL', tag === 'img' ? 'give the <img> a working src or remove it' : 'remove the reference'],
  };
}
