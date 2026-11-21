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
  const flagged = new Map<Element, Draft>(); // rows and grids whose own diagnostic already explains an overflow
  for (const [el, c] of canon) {
    if (!el.isConnected || !hasBox(el)) continue;
    const d = isRow(c) ? rowOverflow(el, c, out, canon) : c.tag === 'ui-grid' && c.attrs.has('columns') ? gridCramped(el, c, out) : undefined;
    if (d) flagged.set(el, d);
  }
  for (const [el, c] of canon) if (c.tag === 'ui-page' && c.attrs.get('layout') === 'app' && el.isConnected) sharedArea(el, out);
  boxOverflow(canon, out, owned, flagged);
  brokenImages(out);
}

const SHELL = ['header', 'nav', 'aside', 'footer'];

/** App-shell children placed in the same grid area are drawn over each other. */
function sharedArea(page: Element, out: Draft[]) {
  const byArea = new Map<string, Element[]>();
  for (const k of page.children) {
    if (!hasBox(k)) continue;
    const cs = getComputedStyle(k);
    if (cs.position === 'absolute' || cs.position === 'fixed') continue;
    const area = cs.gridRowStart;
    if (!area || area === 'auto' || /^-?\d/.test(area)) continue;
    (byArea.get(area) ?? byArea.set(area, []).get(area)!).push(k);
  }
  for (const [area, ks] of byArea) {
    if (ks.length < 2) continue;
    const landmark = SHELL.includes(area);
    out.push({
      code: 'page/shared-area', el: ks[1],
      got: `${ks.map((k) => snippet(k)).join(' and ')} ${ks.length === 2 ? 'both' : 'all'} go in the ${area} region`,
      cause: `in <ui-page layout="app"> each region takes one child (header, nav, aside and footer by tag; every other child goes in main), so these are drawn on top of each other`,
      fix: landmark ? [`merge them into one <${area}>`]
        : ['wrap the main content in one <main>', 'put a sidebar in <nav> (start side) or <aside> (end side)'],
    });
  }
}

type Past = (r: { left: number; right: number }) => number;

/** How far a rect reaches past a box's inline-end edge: the content edge for scroll containers, else the padding edge. */
function edgePast(box: Element, content: boolean): Past {
  const b = box.getBoundingClientRect(), cs = getComputedStyle(box);
  if (cs.direction === 'rtl') {
    const edge = b.right - parseFloat(cs.borderRightWidth) - box.clientWidth + (content ? parseFloat(cs.paddingLeft) : 0);
    return (r) => edge - r.left;
  }
  const edge = b.left + box.clientLeft + box.clientWidth - (content ? parseFloat(cs.paddingRight) : 0);
  return (r) => r.right - edge;
}

/** The extent of an element's own text, which can stick out of a box that fits (unbreakable or nowrap text). */
function textRect(el: Element) {
  let left = Infinity, right = -Infinity;
  const range = document.createRange();
  for (const n of el.childNodes) {
    if (n.nodeType !== 3 || !n.textContent!.trim()) continue;
    range.selectNodeContents(n);
    const r = range.getBoundingClientRect();
    if (r.width) { left = Math.min(left, r.left); right = Math.max(right, r.right); }
  }
  return right > left ? { left, right } : null;
}

/** The deepest element reaching furthest past the edge, by its box or its own text, from start down (outside clipping, scrolling or fixed boxes). */
function culpritIn(start: Element, past: Past, owned: (n: Node) => boolean = () => false): { el: Element; px: number } | null {
  let best: Element | null = null, most = 1;
  const skip = new WeakSet<Element>();
  const look = (el: Element, cs: CSSStyleDeclaration) => {
    if (!hasBox(el)) return;
    let p = past(el.getBoundingClientRect());
    if (el.scrollWidth > el.clientWidth + 1 && cs.display !== 'inline') { const t = textRect(el); if (t) p = Math.max(p, past(t)); }
    if (p > 1 && p >= most - 0.5) { best = el; most = Math.max(most, p); }
  };
  look(start, getComputedStyle(start));
  for (const el of start.querySelectorAll('*')) {
    if (skip.has(el.parentElement!) || owned(el)) { skip.add(el); continue; }
    const cs = getComputedStyle(el);
    if (cs.display === 'none') { skip.add(el); continue; }
    look(el, cs);
    if (cs.position === 'fixed' || CLIPS.has(cs.overflowX)) skip.add(el);
  }
  return best ? { el: best, px: Math.round(most) } : null;
}

const FIELD = new Set(['input', 'select', 'textarea', 'button']);
const fixedWidth = (el: Element) => {
  const s = (el as HTMLElement).style;
  const w = s?.width && !/%$|^auto$/.test(s.width) ? `width: ${s.width}` : s?.minWidth && !/%$|^0/.test(s.minWidth) ? `min-width: ${s.minWidth}` : '';
  return w;
};

/** The fix for what sticks out, from the culprit up to top: a library attribute first, then the smallest CSS change. */
function fixFor(culprit: Element, top: Element, canon: Map<Element, Canon>): string[] {
  const chain: Element[] = [];
  for (let a: Element | null = culprit; a; a = a.parentElement) { chain.push(a); if (a === top) break; }
  for (const a of chain) {
    const p = a.parentElement && canon.get(a.parentElement);
    if (p && isRow(p) && !isOn(p, 'wrap') && !isOn(p, 'scroll') && !isOn(p, 'stack-below')) return [`add wrap (or scroll) to the ${snippet(a.parentElement!)} around it`];
  }
  const fixed = chain.find(fixedWidth);
  if (fixed) return [`remove the fixed ${fixedWidth(fixed)} from ${snippet(fixed)}`];
  const pre = [...chain].reverse().find((a) => PRE.has(a.localName));
  if (pre) return [`wrap the <${pre.localName}> in <div style="overflow-x: auto"> (agent-ui has no scroll container; this style is expected)`];
  const tag = culprit.localName;
  if (MEDIA.has(tag)) return [`add style="max-inline-size: 100%" to ${snippet(culprit)}`];
  if (FIELD.has(tag)) return [`add style="max-inline-size: 100%" to ${snippet(culprit)}`];
  if (/^(nowrap|pre)$/.test(getComputedStyle(culprit).whiteSpace)) return [`let the text in ${snippet(culprit)} wrap (remove white-space: ${getComputedStyle(culprit).whiteSpace}) or shorten it`];
  return [`make ${snippet(culprit)} narrower: max-inline-size: 100%, or shorter content`, 'wrap it in <div style="overflow-x: auto">'];
}

function rowOverflow(el: Element, c: Canon, out: Draft[], canon: Map<Element, Canon>): Draft | undefined {
  if (isOn(c, 'scroll') || isOn(c, 'stack-below')) return;
  const over = el.scrollWidth - el.clientWidth;
  if (over <= 1) return;
  if (isOn(c, 'wrap')) {
    // wrapping already gives each child a line of its own if needed: something in one is still wider than the row
    const hit = culpritIn(el, edgePast(el, false));
    if (!hit || hit.el === el) return;
    let kid = hit.el;
    while (kid.parentElement !== el) kid = kid.parentElement!;
    const d: Draft = {
      code: 'row/overflow', el, got: `content ${el.scrollWidth}px wide in a ${el.clientWidth}px row`,
      cause: `the row wraps, but ${snippet(hit.el)}${kid !== hit.el ? ` (in ${snippet(kid)})` : ''} is wider than the row even on a line of its own`,
      fix: fixFor(hit.el, kid, canon),
    };
    out.push(d);
    return d;
  }
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

function gridCramped(el: Element, c: Canon, out: Draft[]): Draft | undefined {
  const cols = c.attrs.get('columns')!;
  const kids = [...el.children].filter(hasBox);
  if (!kids.length) return;
  const tracks = getComputedStyle(el).gridTemplateColumns.split(/\s+/).map(parseFloat).filter((n) => n >= 0);
  const tile = Math.round(tracks.length ? Math.min(...tracks) : kids[0].getBoundingClientRect().width);
  // content wider than its tile, or a tile box (padding, border, a fixed width) wider than its track, covering the next one
  const squeezed = kids.find((k) => k.scrollWidth > k.clientWidth + 1 && getComputedStyle(k).overflowX === 'visible');
  let wide: Element | undefined;
  for (let i = 0; i + 1 < kids.length && !wide; i++) {
    const a = kids[i].getBoundingClientRect(), b = kids[i + 1].getBoundingClientRect();
    if (Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1 && Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1) wide = kids[i];
  }
  if (!wide && el.scrollWidth > el.clientWidth + 1) wide = kids.find((k) => k.getBoundingClientRect().width > tile + 1);
  let minPx: number | null = null;
  const min = c.attrs.get('min-item-width');
  if (min !== undefined) {
    const tok = (tokens.item as Record<string, string>)[min];
    minPx = tok ? toPx(tok) : isLength(min) ? toPx(min) : null;
  }
  const tooNarrow = minPx !== null && tile < minPx - 1;
  if (!squeezed && !wide && !tooNarrow) return;
  const d: Draft = {
    code: 'grid/cramped', el, got: `columns="${cols}" makes ${tile}px tiles in ${el.clientWidth}px`,
    cause: wide ? `${snippet(wide)} is ${Math.round(wide.getBoundingClientRect().width)}px wide in a ${tile}px track and covers its neighbor`
      : squeezed ? `${snippet(squeezed)} is wider than its tile` : `tiles are below min-item-width (${Math.round(minPx!)}px)`,
    fix: [`change columns="${cols}" to max-columns="${cols}"`, ...(wide || squeezed ? [`if the count must stay (a calendar), make each tile fit ${tile}px: less padding (padding="xs" on a ui-card) or shorter content`] : [])],
  };
  out.push(d);
  return d;
}

const CLIPS = new Set(['hidden', 'clip', 'auto', 'scroll']);
const MEDIA = new Set(['img', 'video', 'svg', 'canvas', 'iframe', 'picture', 'embed', 'object']);
const PRE = new Set(['pre', 'table', 'code']);

/** A box content must fit in: the viewport, and the app shell with its scrolling regions (they clip or scroll instead of widening the page). */
interface Root { start: Element; past: Past; where: string; effect: string; viewport?: boolean }

function roots(canon: Map<Element, Canon>): Root[] {
  const out: Root[] = [];
  const de = document.documentElement, vw = de.clientWidth;
  if (de.scrollWidth > vw + 1 && document.body) {
    const rtl = getComputedStyle(de).direction === 'rtl';
    out.push({ start: document.body, past: (r) => (rtl ? -(r.left + scrollX) : r.right + scrollX - vw), where: `the ${vw}px viewport`, effect: 'the whole page scrolls sideways', viewport: true });
  }
  for (const [el, c] of canon) {
    if (c.tag !== 'ui-page' || c.attrs.get('layout') !== 'app' || !el.isConnected || !hasBox(el)) continue;
    if (el.scrollWidth > el.clientWidth + 1) out.push({ start: el, past: edgePast(el, true), where: `the ${el.clientWidth}px app shell`, effect: 'the app shell cuts it off' });
    for (const region of el.children) {
      if (!hasBox(region) || !CLIPS.has(getComputedStyle(region).overflowX) || region.scrollWidth <= region.clientWidth + 1) continue;
      out.push({ start: region, past: edgePast(region, true), where: `its ${region.clientWidth}px <${region.localName}> region`, effect: 'the region scrolls sideways' });
    }
  }
  return out;
}

/** One problem, one diagnostic: when a reported row or grid is what sticks out, its diagnostic becomes an error instead. */
function boxOverflow(canon: Map<Element, Canon>, out: Draft[], owned: (n: Node) => boolean, flagged: Map<Element, Draft>) {
  for (const root of roots(canon)) {
    const skip = new WeakSet<Element>(); // inside a clipping/scrolling/fixed box
    const over = new WeakSet<Element>();
    const found: Element[] = [];
    for (const el of root.start.querySelectorAll('*')) {
      const p = el.parentElement!;
      if (skip.has(p) || owned(el)) { skip.add(el); continue; }
      const cs = getComputedStyle(el);
      if (cs.display === 'none') { skip.add(el); continue; }
      const r = el.getBoundingClientRect();
      if (root.past(r) > 1 && (r.width > 0 || r.height > 0)) {
        over.add(el);
        if (!over.has(p) && found.length < 5) found.push(el);
      }
      if (cs.position === 'fixed' || CLIPS.has(cs.overflowX)) skip.add(el);
    }
    // no box sticks out: text that cannot wrap may
    const hits = found.length ? found.map((el) => ({ top: el, hit: culpritIn(el, root.past, owned) ?? { el, px: Math.round(root.past(el.getBoundingClientRect())) } }))
      : [culpritIn(root.start, root.past, owned)].filter((h) => h && h.el !== root.start).map((h) => ({ top: h!.el, hit: h! }));
    if (!hits.length) {
      if (root.viewport) out.push({
        code: 'layout/horizontal-overflow', el: document.documentElement, got: `page is ${document.documentElement.scrollWidth}px wide in a ${document.documentElement.clientWidth}px viewport`,
        cause: 'no single element breaks out; likely a pseudo-element or a negative margin',
        fix: ['find the wide element in devtools and constrain it'],
      });
      continue;
    }
    for (const { top, hit } of hits) {
      let owner: Draft | undefined;
      for (let a: Element | null = hit.el; a && !owner; a = a === top.parentElement ? null : a.parentElement) owner = flagged.get(a);
      if (owner) {
        if (owner.severity !== 'error') { owner.severity = 'error'; owner.cause += `; ${root.effect}`; }
        continue;
      }
      const inner = hit.el !== top && !PRE.has(top.localName) ? `, because of ${snippet(hit.el)} inside it` : '';
      out.push({
        code: 'layout/horizontal-overflow', el: top, got: `extends ${hit.px}px past ${root.where}`,
        cause: found.length ? `it is wider than its parent, which fits${inner}; ${root.effect}` : `its text does not wrap and sticks out; ${root.effect}`,
        fix: fixFor(hit.el, top, canon),
      });
    }
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
