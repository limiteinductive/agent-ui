// The engine: settle, run every layer, deliver on all channels, re-check on change.
import { VERSION } from '../manifest.ts';
import { sprouted } from '../elements/button.ts';
import { RULES, type Layer } from './rules.ts';
import { context, finalize, ENGINE_ATTRS, type Context, type Diagnostic, type Draft } from './record.ts';
import { staticCheck, type Canon } from './static.ts';
import { layoutCheck } from './layout.ts';
import { captureRuntime } from './runtime.ts';
import { renderPanel } from './panel.ts';

export interface Report {
  version: string;
  ok: boolean;
  summary: string;
  counts: { error: number; warn: number; info: number; allowed: number };
  checked: { elements: number; rules: number; layers: Layer[] };
  context: Context;
  /** Against the previous check (or the previous page load in this tab). */
  diff: { fixed: number; new: number; remain: number } | null;
  diagnostics: Diagnostic[];
}

export interface CheckOptions { settle?: boolean }

const CONSOLE_TOP = 15;
const STORE_KEY = () => `ui-diag:${location.pathname}`;

const timeout = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const race = (p: Promise<unknown>, ms: number) => Promise.race([p.then(() => {}, () => {}), timeout(ms)]);

/** Wait until what the user would see is stable: fonts, eager images, a painted frame, finite animations. */
export async function settle() {
  if (document.readyState === 'loading') {
    await new Promise<void>((r) => document.addEventListener('DOMContentLoaded', () => r(), { once: true }));
  }
  if (document.fonts?.ready) await race(document.fonts.ready, 2000);
  const imgs = [...document.images].filter((i) => !i.complete && i.loading !== 'lazy');
  if (imgs.length) await race(Promise.allSettled(imgs.map((i) => i.decode())), 2000);
  await race(new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))), 50);
  const finite = (document.getAnimations?.() ?? []).filter((a) => {
    const t = a.effect?.getComputedTiming();
    return a.playState === 'running' && t && Number.isFinite(t.endTime as number);
  });
  if (finite.length) await race(Promise.allSettled(finite.map((a) => a.finished)), 1000);
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export class Engine {
  readonly version = VERSION;
  report: Report | null = null;
  readonly ready: Promise<Report>;
  /** Persistent drafts from boot (CSS missing, version skew, duplicate load). */
  readonly notes: Draft[];
  readonly runtime: Draft[] = [];
  readonly mode: 'on' | 'quiet' | 'off';

  #owned = new WeakSet<Node>();
  #ownedTags = new WeakSet<CustomElementConstructor>();
  #queue: Promise<unknown> = Promise.resolve();
  #prev: Set<string> | null = null;
  #marked = new Set<Element>();
  #json: HTMLScriptElement | null = null;
  #timer = 0;
  #observing = false;

  constructor(notes: Draft[], ours: CustomElementConstructor[]) {
    this.notes = notes;
    for (const c of ours) this.#ownedTags.add(c);
    const m = document.documentElement.getAttribute('data-ui-diagnostics');
    this.mode = m === 'off' ? 'off' : m === 'quiet' ? 'quiet' : 'on';
    try { const s = sessionStorage.getItem(STORE_KEY()); if (s) this.#prev = new Set(JSON.parse(s)); } catch { /* storage blocked */ }
    if (this.mode !== 'off') {
      captureRuntime(this.runtime, () => this.schedule(50), (file) => !!file && /agent-ui/.test(file));
    }
    this.ready = this.check();
    this.ready.then(() => this.#observe());
  }

  own = (n: Node) => { this.#owned.add(n); };
  isOwned = (n: Node): boolean => {
    for (let e: Node | null = n; e; e = e.parentNode) if (this.#owned.has(e)) return true;
    return false;
  };
  #foreign = (tag: string) => {
    const c = customElements.get(tag);
    return !!c && !this.#ownedTags.has(c);
  };

  /** Called by a second copy of the script. */
  secondLoad(version: string) {
    this.notes.push(version === VERSION
      ? { code: 'UI-DUPLICATE', got: `agent-ui ${version} loaded twice`, cause: 'the second copy did nothing', fix: ['remove the second <script>'] }
      : { code: 'UI-VERSION-SKEW', got: `agent-ui ${version} loaded after ${VERSION}`, cause: `the first copy (${VERSION}) owns the page`, fix: [`load only one version`] });
    this.schedule(0);
  }

  check(opts: CheckOptions = {}): Promise<Report> {
    const run = this.#queue.then(() => this.#run(opts.settle !== false));
    this.#queue = run.catch(() => {});
    return run;
  }

  schedule(ms: number) {
    if (this.mode === 'off') return;
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => { this.check(); }, ms) as unknown as number;
  }

  async #run(doSettle: boolean): Promise<Report> {
    if (doSettle) await settle();
    const ctx = context();
    const drafts: Draft[] = [];
    const canon = new Map<Element, Canon>();
    const layers: Layer[] = [];
    let checked = 0;
    if (this.mode !== 'off') {
      try {
        checked = staticCheck(drafts, canon, this.#foreign);
        layers.push('static', 'dom');
        layoutCheck(canon, drafts, this.isOwned);
        layers.push('layout');
      } catch (err) {
        drafts.push({
          code: 'UI-RUNTIME-ERROR', got: `agent-ui engine: ${(err as Error)?.message ?? err}`,
          cause: 'the diagnostics engine crashed; the report is incomplete', fix: ['please report this with the page'],
        });
      }
    }
    drafts.push(...this.notes, ...this.runtime);
    const { diagnostics, instances, marks } = finalize(drafts, ctx);

    const counts = { error: 0, warn: 0, info: 0, allowed: 0 };
    for (const d of diagnostics) {
      if (d.allowedBy) counts.allowed += d.count;
      else counts[d.severity] += d.count;
    }
    let diff: Report['diff'] = null;
    if (this.#prev) {
      let remain = 0;
      for (const f of instances) if (this.#prev.has(f)) remain++;
      diff = { fixed: this.#prev.size - remain, new: instances.size - remain, remain };
    }
    const ruleCount = Object.values(RULES).filter((r) => layers.includes(r.layer)).length;
    const summary = this.mode === 'off'
      ? '[ui-diag] off (data-ui-diagnostics="off")'
      : `[ui-diag] ${plural(counts.error, 'error')}, ${plural(counts.warn, 'warning')}, ${counts.info} info`
        + (counts.allowed ? ` (${counts.allowed} allowed)` : '')
        + ` — checked ${plural(checked, 'element')}, ${ruleCount} rules (${layers.join('+')}) at ${ctx.width}×${ctx.height} ${ctx.scheme}`
        + (diff ? `; since last check: ${diff.fixed} fixed, ${diff.new} new, ${diff.remain} remain` : '')
        + (counts.error ? '; errors must reach 0' : '');
    const report: Report = {
      version: VERSION, ok: counts.error === 0, summary, counts,
      checked: { elements: checked, rules: ruleCount, layers }, context: ctx, diff, diagnostics,
    };

    const first = !this.report;
    const prev = this.#prev;
    this.report = report;
    this.#prev = instances;
    try { sessionStorage.setItem(STORE_KEY(), JSON.stringify([...instances])); } catch { /* storage blocked */ }

    this.#mark(marks);
    this.#writeJson(report);
    if (this.mode === 'on') this.#log(report, first, prev);
    renderPanel(report, this.own);
    return report;
  }

  #mark(marks: Map<Element, Set<string>>) {
    for (const el of this.#marked) if (!marks.has(el) && el.hasAttribute('data-ui-diag')) el.removeAttribute('data-ui-diag');
    for (const [el, codes] of marks) {
      const v = [...codes].join(' ');
      if (el.getAttribute('data-ui-diag') !== v) el.setAttribute('data-ui-diag', v);
    }
    this.#marked = new Set(marks.keys());
  }

  #writeJson(report: Report) {
    if (!this.#json || !this.#json.isConnected) {
      this.#json = document.getElementById('ui-diagnostics') as HTMLScriptElement | null;
      if (!this.#json || this.#json.localName !== 'script') {
        this.#json = document.createElement('script');
        this.#json.type = 'application/json';
        this.#json.id = 'ui-diagnostics';
        (document.head ?? document.documentElement).append(this.#json);
      }
      this.own(this.#json);
    }
    this.#json.textContent = JSON.stringify(report).replace(/</g, '\\u003c');
  }

  #log(report: Report, first: boolean, prev: Set<string> | null) {
    const changed = !report.diff || report.diff.new > 0 || report.diff.fixed > 0;
    if (!first && !changed) return;
    const level = report.counts.error ? 'error' : report.counts.warn ? 'warn' : 'info';
    console[level](report.summary);
    const visible = report.diagnostics.filter((d) => !d.allowedBy && (first || !prev?.has(d.fingerprint)));
    for (const d of visible.slice(0, CONSOLE_TOP)) {
      console[d.severity === 'error' ? 'error' : d.severity === 'warn' ? 'warn' : 'info'](`[ui-diag] ${d.text}`);
    }
    if (visible.length > CONSOLE_TOP) console.info(`[ui-diag] … ${visible.length - CONSOLE_TOP} more in window.__ui.diagnostics`);
  }

  #observe() {
    if (this.#observing || this.mode === 'off') return;
    this.#observing = true;
    new MutationObserver((records) => {
      for (const r of records) {
        if (this.isOwned(r.target)) continue;
        if (r.type === 'attributes') {
          if (ENGINE_ATTRS.has(r.attributeName!)) continue;
          if (sprouted(r.target as Element, r.attributeName!)) continue;
        }
        if (r.type === 'childList' && [...r.addedNodes, ...r.removedNodes].every((n) => this.#owned.has(n))) continue;
        this.schedule(100);
        return;
      }
    }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true });
    addEventListener('resize', () => this.schedule(150));
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => this.schedule(0));
  }

  /** The public object: window.__ui */
  get api() {
    const self = this;
    return {
      version: VERSION,
      get report() { return self.report; },
      get diagnostics() { return self.report?.diagnostics ?? []; },
      ready: this.ready,
      check: (opts?: CheckOptions) => self.check(opts),
    };
  }
}
