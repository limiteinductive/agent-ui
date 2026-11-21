// node run.ts — renders scene.ts through React, Solid and Vue in Chrome and compares each, state by state, with the
// same page written as plain HTML: computed styles and boxes of every [data-k] element, and what __ui.check() reports.
import { build, transform, type Plugin } from 'esbuild';
import { transformAsync } from '@babel/core';
import { chromium, type Page } from 'playwright';
import { readFileSync } from 'node:fs';

const here = new URL('.', import.meta.url).pathname;
const FRAMEWORKS = ['react', 'solid', 'vue'] as const;
const WIDTHS = [1280, 360];
const template = readFileSync(`${here}App.vue`, 'utf8').match(/<template>([\s\S]*)<\/template>/)![1];

// Solid's JSX needs its own compiler: strip types with esbuild, then babel-preset-solid.
const solid: Plugin = {
  name: 'solid',
  setup(b) {
    b.onLoad({ filter: /solid\.tsx$/ }, async ({ path }) => {
      const ts = await transform(readFileSync(path, 'utf8'), { loader: 'tsx', jsx: 'preserve' });
      const out = await transformAsync(ts.code, { filename: path, presets: ['babel-preset-solid'], babelrc: false, configFile: false });
      return { contents: out!.code!, loader: 'js' };
    });
  },
};

async function bundle(entry: string) {
  const r = await build({
    stdin: { contents: `export { mount } from './${entry}'; export { STATES } from './scene.ts';`, resolveDir: here, loader: 'ts' },
    bundle: true, write: false, format: 'iife', globalName: '__fw', target: 'es2022', jsx: 'automatic', logLevel: 'error',
    alias: { vue: 'vue/dist/vue.esm-bundler.js' }, plugins: [solid],
    define: {
      'process.env.NODE_ENV': '"development"', __APP_TEMPLATE__: JSON.stringify(template),
      __VUE_OPTIONS_API__: 'true', __VUE_PROD_DEVTOOLS__: 'false', __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
    },
  });
  return r.outputFiles[0].text;
}

const PAGE = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>framework smoke</title><style>.r { outline: 1px dashed currentColor }</style></head>
<body><ui-page id="root"></ui-page><script src="/fw.js"></script></body></html>`;

const PROPS = ['display', 'flex-direction', 'flex-wrap', 'flex-grow', 'flex-basis', 'row-gap', 'column-gap', 'grid-template-columns',
  'padding-top', 'padding-left', 'margin-left', 'margin-right', 'box-shadow', 'background-color', 'color', 'outline-style',
  'opacity', 'cursor', 'pointer-events', 'max-inline-size'];

interface Snap { check: string[]; els: Record<string, Record<string, string>> }

const snap = (page: Page) => page.evaluate(async (props): Promise<Snap> => {
  const rep = await (window as any).__ui.check();
  const els: Record<string, Record<string, string>> = {};
  for (const el of document.querySelectorAll<HTMLElement>('[data-k]')) {
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    const v: Record<string, string> = { tag: el.outerHTML.match(/^<[^>]*>/)![0], class: el.getAttribute('class') ?? '' };
    for (const p of props) v[p] = cs.getPropertyValue(p);
    v.box = [r.x, r.y, r.width, r.height].map(Math.round).join(',');
    if (el.localName === 'ui-button') { v[':disabled'] = String(el.matches(':disabled')); v.loading = String((el as any).loading); }
    els[el.dataset.k!] = v;
  }
  return { check: rep.diagnostics.filter((d: any) => !d.allowedBy).map((d: any) => `${d.severity} ${d.code}: ${d.got}`), els };
}, PROPS);

const browser = await chromium.launch({ channel: 'chrome' });

async function run(entry: string, width: number) {
  const js = await bundle(entry);
  const ctx = await browser.newContext({ viewport: { width, height: 900 } });
  await ctx.route('http://fw.test/**', (r) => r.fulfill(r.request().url().endsWith('.js')
    ? { body: js, contentType: 'text/javascript' } : { body: PAGE, contentType: 'text/html' }));
  const page = await ctx.newPage();
  const noise: string[] = [];
  page.on('pageerror', (e) => noise.push(`page error: ${e.message}`));
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !m.text().includes('ui-diag')) noise.push(`console.${m.type()}: ${m.text().slice(0, 300)}`); });
  await page.goto('http://fw.test/');
  await page.evaluate(() => (window as any).__uiReady);
  const snaps: Snap[] = [];
  await page.evaluate(() => { (window as any).__m = (window as any).__fw.mount(document.getElementById('root'), (window as any).__fw.STATES[0]); });
  snaps.push(await snap(page));
  await page.evaluate(() => (window as any).__m.set((window as any).__fw.STATES[1]));
  snaps.push(await snap(page));
  await ctx.close();
  return { snaps, noise };
}

let failed = 0;
for (const width of WIDTHS) {
  const ref = await run('ref.ts', width);
  for (const [i, s] of ref.snaps.entries()) if (s.check.length) { failed++; console.log(`reference state ${i} @${width} is not clean:\n  ${s.check.join('\n  ')}`); }
  for (const fw of FRAMEWORKS) {
    const got = await run(`${fw}.${fw === 'vue' ? 'ts' : 'tsx'}`, width);
    const problems: string[] = [...new Set(got.noise)];
    for (const [i, s] of got.snaps.entries()) {
      const want = ref.snaps[i];
      for (const c of s.check.filter((c) => !want.check.includes(c))) problems.push(`state ${i}: diagnostics: ${c}`);
      for (const [k, w] of Object.entries(want.els)) {
        const g = s.els[k];
        if (!g) { problems.push(`state ${i}: [data-k=${k}] missing`); continue; }
        const diff = Object.keys(w).filter((p) => p !== 'tag' && g[p] !== w[p]);
        if (diff.length) problems.push(`state ${i}: ${g.tag}  (html: ${w.tag})\n      ${diff.map((p) => `${p}: ${g[p]}  want ${w[p]}`).join('\n      ')}`);
      }
    }
    console.log(`${problems.length ? 'FAIL' : 'ok  '} ${fw} @${width}`);
    for (const p of problems) console.log(`    ${p}`);
    failed += problems.length;
  }
}
await browser.close();
process.exitCode = failed ? 1 : 0;
