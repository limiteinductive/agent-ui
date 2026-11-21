// node test/run.ts — fixtures at 360 and 1280 in Chrome, plus behavior checks. Screenshots go to test/out/.
import { chromium, type Browser, type Page } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const outDir = join(root, 'test/out');
mkdirSync(outDir, { recursive: true });

const TYPES: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const server = createServer((req, res) => {
  const file = join(root, normalize(decodeURIComponent(new URL(req.url!, 'http://x').pathname)));
  if (!file.startsWith(root) || !existsSync(file)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file));
});
await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;

let failures = 0, passes = 0;
function check(name: string, ok: boolean, detail = '') {
  if (ok) passes++; else failures++;
  console.log(`${ok ? '  ok ' : 'FAIL '} ${name}${ok || !detail ? '' : `\n       ${detail}`}`);
}
const eq = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);
const uniq = (xs: string[]) => [...new Set(xs)].sort();

interface Diag { code: string; severity: string; allowedBy?: string; text: string; count: number }
interface Rep { ok: boolean; summary: string; counts: Record<string, number>; diff: { fixed: number; new: number; remain: number } | null; diagnostics: Diag[] }

async function open(browser: Browser, path: string, width: number, scheme: 'light' | 'dark' = 'light') {
  const ctx = await browser.newContext({ viewport: { width, height: 800 }, colorScheme: scheme });
  const page = await ctx.newPage();
  const logs: string[] = [];
  page.on('console', (m) => logs.push(`${m.type()}: ${m.text()}`));
  page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
  await page.goto(`${base}/${path}`);
  const report = await ready(page);
  return { ctx, page, logs, report };
}
const ready = (page: Page) => page.evaluate(async () => {
  await (window as any).__uiReady;
  return JSON.parse(JSON.stringify((window as any).__ui.report)) as unknown;
}) as Promise<Rep>;
const latest = (page: Page) => page.evaluate(() => JSON.parse(JSON.stringify((window as any).__ui.report))) as Promise<Rep>;

const browser = await chromium.launch({ channel: 'chrome' });
try {
  // ---------------------------------------------------------------- fixtures
  console.log('fixtures');
  const fixtures = readdirSync(join(root, 'test/fixtures')).filter((f) => f.endsWith('.html')).sort();
  for (const f of fixtures) {
    for (const width of [360, 1280]) {
      const { ctx, page, logs, report } = await open(browser, `test/fixtures/${f}`, width);
      const expect = await page.evaluate(() => JSON.parse(document.getElementById('expect')!.textContent!));
      const want = uniq([...(expect.all ?? []), ...(expect[width] ?? [])]);
      const wantAllowed = uniq([...(expect.allowed ?? []), ...(expect[`${width}allowed`] ?? [])]);
      const got = uniq(report.diagnostics.filter((d) => !d.allowedBy).map((d) => d.code));
      const gotAllowed = uniq(report.diagnostics.filter((d) => d.allowedBy).map((d) => d.code));
      const texts = report.diagnostics.map((d) => `[${d.severity}] ${d.text}`).join('\n       ');
      check(`${f} @${width}: codes`, eq(got, want), `want ${want.join(' ') || '∅'}, got ${got.join(' ') || '∅'}\n       ${texts}`);
      if (wantAllowed.length || gotAllowed.length) check(`${f} @${width}: allowed`, eq(gotAllowed, wantAllowed), `want ${wantAllowed}, got ${gotAllowed}`);
      check(`${f} @${width}: console summary`, logs.some((l) => l.includes('[ui-diag]') && l.includes('checked')), logs.slice(0, 3).join(' | '));
      const channels = await page.evaluate(() => {
        const json = document.getElementById('ui-diagnostics');
        const parsed = json ? JSON.parse(json.textContent!) : null;
        return { json: !!parsed, jsonCount: parsed?.diagnostics.length, marked: document.querySelectorAll('[data-ui-diag]').length };
      });
      check(`${f} @${width}: JSON channel`, channels.json && channels.jsonCount === report.diagnostics.length);
      const needMark = report.diagnostics.some((d) => !d.allowedBy && !['UI-RUNTIME-ERROR', 'UI-VERSION-SKEW', 'UI-DUPLICATE', 'UI-CSS-MISSING'].includes(d.code));
      if (needMark) check(`${f} @${width}: elements marked`, channels.marked > 0);
      if (f === 'errors.html' && width === 1280) {
        console.log('       sample:\n       ' + report.diagnostics.slice(0, 6).map((d) => d.text).join('\n       '));
      }
      await ctx.close();
    }
  }

  // ---------------------------------------------------------------- demo
  console.log('demo');
  for (const width of [360, 1280]) {
    for (const scheme of ['light', 'dark'] as const) {
      const { ctx, page, logs, report } = await open(browser, 'demo/index.html', width, scheme);
      const issues = report.diagnostics.map((d) => `[${d.severity}] ${d.text}`).join('\n       ');
      check(`demo @${width} ${scheme}: no diagnostics`, report.diagnostics.length === 0, issues);
      check(`demo @${width} ${scheme}: no page errors`, !logs.some((l) => l.startsWith('pageerror')), logs.filter((l) => l.startsWith('pageerror')).join(' | '));
      await page.screenshot({ path: join(outDir, `demo-${width}-${scheme}.png`), fullPage: true });
      await ctx.close();
    }
  }

  // ---------------------------------------------------------------- CSS features
  console.log('css');
  for (const width of [360, 1280]) {
    const { ctx, page } = await open(browser, 'test/fixtures/clean.html', width);
    const m = await page.evaluate(() => {
      const top = (el: Element) => Math.round(el.getBoundingClientRect().top);
      const grid = document.querySelector('ui-grid')!.children;
      const sb = document.querySelector('ui-row[stack-below]')!.children;
      const stack = document.querySelector('ui-stack[gap="lg"]')!;
      const btn = document.querySelector('ui-button')!;
      const de = document.documentElement;
      const light = getComputedStyle(de).backgroundColor;
      document.documentElement.setAttribute('data-scheme', 'dark');
      const dark = getComputedStyle(de).backgroundColor;
      document.documentElement.removeAttribute('data-scheme');
      const inverse = getComputedStyle(document.querySelector('ui-card[inverse]')!).backgroundColor;
      return {
        gridSameRow: top(grid[0]) === top(grid[2]), gridStacked: top(grid[1]) > top(grid[0]),
        sbSameRow: top(sb[0]) === top(sb[1]),
        gap: getComputedStyle(stack).rowGap, light, dark, inverse,
        btnDisplay: getComputedStyle(btn).display, btnCursor: getComputedStyle(btn).cursor,
        layers: [...document.adoptedStyleSheets].some((s) => [...s.cssRules].some((r) => r.constructor.name === 'CSSLayerStatementRule')),
      };
    });
    if (width === 1280) {
      check('max-columns=3 is 3 across at 1280', m.gridSameRow);
      check('stack-below side by side at 1280', m.sbSameRow);
      check('stack gap lg = 24px', m.gap === '24px', m.gap);
      check('light-dark(): data-scheme flips canvas', m.light !== m.dark, `${m.light} / ${m.dark}`);
      check('inverse card differs from canvas', m.inverse !== m.light, m.inverse);
      check('ui-button is (inline-)flex', /flex/.test(m.btnDisplay), m.btnDisplay);
      check('stylesheet injected with @layer', m.layers);
    } else {
      check('max-columns grid stacks at 360', m.gridStacked);
      check('stack-below stacks at 360', !m.sbSameRow);
    }
    await ctx.close();
  }

  // ---------------------------------------------------------------- framework values and properties
  console.log('values');
  {
    const { ctx, page } = await open(browser, 'test/fixtures/values.html', 360);
    const m = await page.evaluate(() => {
      const $ = (s: string) => document.querySelector(s) as any;
      const top = (el: Element) => Math.round(el.getBoundingClientRect().top);
      const shadow = (s: string) => getComputedStyle($(s)).boxShadow;
      const sb = $('#sb-false').children;
      const row = document.createElement('ui-row') as any;
      document.body.append(row);
      row.stackBelow = 'lg'; const sbAttr = row.getAttribute('stack-below');
      row.wrap = true; const wrapOn = row.getAttribute('wrap');
      row.wrap = false; const wrapOff = row.hasAttribute('wrap');
      row.columns = 3;
      row.scroll = true; const scrollAttr = row.getAttribute('scroll'); const scrollFn = typeof row.scroll;
      row.setAttribute('wrap', 'false'); const wrapRead = row.wrap;
      // set before upgrade: Solid sets properties on clones made in an inert document
      const early = document.implementation.createHTMLDocument('').createElement('ui-card') as any;
      early.elevated = true; early.padding = 'sm';
      document.body.append(early);
      return {
        bleedTrue: Math.round($('#bleed-true').getBoundingClientRect().width), viewport: document.documentElement.clientWidth,
        bleedFalse: Math.round($('#bleed-false').getBoundingClientRect().width),
        cardTrue: shadow('#card-true'), cardFalse: shadow('#card-false'), cardFalseProp: $('#card-false').elevated,
        sbSameRow: top(sb[0]) === top(sb[1]),
        loading: $('#btn-loading').loading, loadingCursor: getComputedStyle($('#btn-loading')).cursor,
        sbAttr, wrapOn, wrapOff, scrollAttr, scrollFn, wrapRead,
        early: [early.getAttribute('elevated'), early.getAttribute('padding'), Object.prototype.hasOwnProperty.call(early, 'elevated')],
      };
    });
    check('bleed="true" bleeds', m.bleedTrue === m.viewport, `${m.bleedTrue} vs ${m.viewport}`);
    check('bleed="false" does not', m.bleedFalse < m.viewport, String(m.bleedFalse));
    check('elevated="true" has a shadow', m.cardTrue !== 'none', m.cardTrue);
    check('elevated="false" has none', m.cardFalse === 'none' && m.cardFalseProp === false, `${m.cardFalse} ${m.cardFalseProp}`);
    check('stack-below="false" does not stack', m.sbSameRow);
    check('loading="false" is not loading', m.loading === false && m.loadingCursor !== 'progress', `${m.loading} ${m.loadingCursor}`);
    check('properties reflect to attributes', m.sbAttr === 'lg' && m.wrapOn === '' && m.wrapOff === false, JSON.stringify(m));
    check('el.scroll = true sets the attribute, el.scroll stays the method', m.scrollAttr === '' && m.scrollFn === 'function', `${m.scrollAttr} ${m.scrollFn}`);
    check('flag property reads "false" as false', m.wrapRead === false);
    check('properties set before upgrade are replayed', m.early[0] === '' && m.early[1] === 'sm' && m.early[2] === false, JSON.stringify(m.early));
    await ctx.close();
  }

  // ---------------------------------------------------------------- behavior
  console.log('behavior');
  {
    const { ctx, page, report } = await open(browser, 'test/fixtures/clean.html', 1280);
    await page.evaluate(() => { (window as any).__before = (window as any).__ui.report; });
    await page.waitForTimeout(800);
    const same = await page.evaluate(() => (window as any).__ui.report === (window as any).__before);
    check('no re-check loop after settle (engine writes ignored)', same && report.diagnostics.length === 0);

    await page.evaluate(() => {
      const s = document.createElement('ui-stack');
      s.setAttribute('gap', 'huge');
      s.id = 'injected';
      document.querySelector('main ui-stack')!.append(s);
    });
    await page.waitForFunction(() => (window as any).__ui.report.diagnostics.some((d: Diag) => d.code === 'UI-BAD-VALUE'), null, { timeout: 3000 }).catch(() => {});
    let r = await latest(page);
    check('mutation triggers re-check', r.diagnostics.some((d) => d.code === 'UI-BAD-VALUE'), r.summary);
    check('diff reports 1 new', r.diff?.new === 1, JSON.stringify(r.diff));
    const marked = await page.evaluate(() => document.getElementById('injected')!.getAttribute('data-ui-diag'));
    check('offending element marked', marked === 'UI-BAD-VALUE', String(marked));
    await page.evaluate(() => document.getElementById('injected')!.setAttribute('gap', 'lg'));
    await page.waitForFunction(() => (window as any).__ui.report.ok, null, { timeout: 3000 }).catch(() => {});
    r = await latest(page);
    check('fix is seen: 1 fixed, ok', r.ok && r.diff?.fixed === 1, `${r.summary}`);
    check('mark removed after fix', await page.evaluate(() => !document.getElementById('injected')!.hasAttribute('data-ui-diag')));
    await ctx.close();
  }
  {
    const { ctx, page } = await open(browser, 'test/fixtures/layout.html', 360);
    await page.reload();
    const r = await ready(page);
    check('reload diff in same tab (sessionStorage)', !!r.diff && r.diff.remain > 0 && r.diff.new === 0, JSON.stringify(r.diff));
    await page.evaluate(() => { document.documentElement.setAttribute('data-ui-debug', ''); return (window as any).__ui.check(); });
    const panel = await page.evaluate(() => !!document.querySelector('agent-ui-debug')?.shadowRoot?.querySelector('li'));
    check('debug panel renders', panel);
    await page.screenshot({ path: join(outDir, 'debug-panel-360.png') });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForFunction(() => (window as any).__ui.report.context.width === 1280, null, { timeout: 3000 }).catch(() => {});
    const r2 = await latest(page);
    check('resize re-checks: clean at 1280', r2.context?.width === 1280 && r2.diagnostics.length === 0, r2.summary);
    await ctx.close();
  }
  {
    const { ctx, page, logs } = await open(browser, 'demo/index.html', 1280);
    await page.fill('input[name=name]', 'Ada');
    await page.click('ui-button[type=submit]');
    await page.waitForTimeout(100);
    check('ui-button type=submit submits the form', logs.some((l) => l.includes('submitted') && l.includes('Ada')), logs.filter((l) => l.startsWith('log')).join(' | '));
    const disabled = await page.evaluate(() => {
      let clicked = false;
      const b = document.querySelector('ui-button[disabled]')!;
      b.addEventListener('click', () => { clicked = true; });
      (b as HTMLElement).click();
      return { clicked, aria: (b as any).ariaDisabled ?? null, tab: (b as HTMLElement).tabIndex };
    });
    check('disabled ui-button swallows clicks', !disabled.clicked);
    check('disabled ui-button stays focusable', disabled.tab === 0);
    await page.focus('#scheme');
    await page.keyboard.press('Enter');
    check('Enter activates ui-button', await page.evaluate(() => document.documentElement.dataset.scheme === 'dark' || document.documentElement.dataset.scheme === 'light'));
    const role = await page.evaluate(() => {
      const b = document.querySelector('ui-button')!;
      return (b as any).computedRole ?? null;
    });
    const snap = await page.locator('ui-button').first().ariaSnapshot();
    check('ui-button exposes role=button', snap.includes('button'), `${snap} (computedRole ${role})`);
    check('getByRole finds ui-button', await page.getByRole('button', { name: 'Submit' }).count() === 1);
    const snippetClean = await page.evaluate(() => !(window as any).__ui.report.diagnostics.length);
    check('sprouted attrs never trigger diagnostics', snippetClean);
    await ctx.close();
  }
} finally {
  await browser.close();
  server.close();
}
console.log(`\n${passes} passed, ${failures} failed — screenshots in test/out/`);
process.exit(failures ? 1 : 0);
