// Debug panel, shown while <html data-ui-debug> is set. Lives in a shadow root on a
// non-ui host outside <body>, so it never affects page layout or the checks.
import type { Diagnostic } from './record.ts';
import type { Report } from './engine.ts';

const CSS = `
:host { all: initial; position: fixed; inset-block-end: 12px; inset-inline-end: 12px; z-index: 2147483647;
  font: 12px/1.45 ui-monospace, SFMono-Regular, Menlo, monospace; color-scheme: light dark; }
.box { inline-size: min(560px, calc(100vw - 24px)); max-block-size: min(60vh, 520px); display: flex; flex-direction: column;
  background: light-dark(#fff, #18181b); color: light-dark(#18181b, #f4f4f5); border: 1px solid light-dark(#d4d4d8, #3f3f46);
  border-radius: 10px; box-shadow: 0 8px 30px rgb(0 0 0 / .25); overflow: hidden; }
header { display: flex; gap: 8px; align-items: center; padding: 8px 10px; border-block-end: 1px solid light-dark(#e4e4e7, #27272a); cursor: pointer; }
header b { flex: 1; font-weight: 600; }
.n { padding: 1px 6px; border-radius: 999px; font-weight: 600; }
.error { background: light-dark(#fee2e2, #450a0a); color: light-dark(#991b1b, #fca5a5); }
.warn { background: light-dark(#fef3c7, #422006); color: light-dark(#92400e, #fcd34d); }
.info { background: light-dark(#e0f2fe, #082f49); color: light-dark(#075985, #7dd3fc); }
ol { list-style: none; margin: 0; padding: 0; overflow: auto; }
li { padding: 8px 10px; border-block-end: 1px solid light-dark(#f4f4f5, #27272a); cursor: pointer; }
li:hover { background: light-dark(#fafafa, #1f1f23); }
.code { font-weight: 700; }
.path, .fix { color: light-dark(#52525b, #a1a1aa); overflow-wrap: anywhere; }
.fix::before { content: "fix: "; font-weight: 600; }
.box.min ol { display: none; }
`;

let host: HTMLElement | null = null;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

export function renderPanel(report: Report, own: (n: Node) => void) {
  if (!document.documentElement.hasAttribute('data-ui-debug')) {
    host?.remove();
    host = null;
    return;
  }
  if (!host) {
    host = document.createElement('agent-ui-debug');
    own(host);
    const root = host.attachShadow({ mode: 'open' });
    const style = el('style');
    style.textContent = CSS;
    root.append(style, el('div', 'box'));
    document.documentElement.append(host);
  }
  const box = host.shadowRoot!.querySelector('.box')!;
  const header = el('header');
  header.append(el('b', '', 'ui-diag'));
  for (const s of ['error', 'warn', 'info'] as const) {
    const n = report.counts[s];
    if (n) header.append(el('span', `n ${s}`, `${n} ${s}`));
  }
  if (!report.counts.error && !report.counts.warn && !report.counts.info) header.append(el('span', 'n info', 'ok'));
  header.onclick = () => box.classList.toggle('min');
  const list = el('ol');
  for (const d of report.diagnostics) {
    if (d.allowedBy) continue;
    const li = el('li');
    const top = el('div');
    top.append(el('span', `code n ${d.severity}`, d.code), ` ${d.got}${d.count > 1 ? ` ×${d.count}` : ''}`);
    li.append(top);
    if (d.path) li.append(el('div', 'path', d.path));
    li.append(el('div', '', d.cause));
    if (d.fix.length) li.append(el('div', 'fix', d.fix.join(' — or — ')));
    li.onclick = () => focusElement(d);
    list.append(li);
  }
  box.replaceChildren(header, list);
}

function focusElement(d: Diagnostic) {
  const target = (d as Diagnostic & { elements?: Element[] }).elements?.[0];
  if (!target?.isConnected) return;
  target.scrollIntoView({ block: 'center', behavior: 'smooth' });
  (target as HTMLElement).animate?.(
    [{ outline: '3px solid oklch(0.62 0.24 25)', outlineOffset: '2px' }, { outline: '3px solid transparent', outlineOffset: '2px' }],
    { duration: 1200 },
  );
}
