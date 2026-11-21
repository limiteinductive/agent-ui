// node build.ts — dist/agent-ui.js (IIFE, CSS inlined), agent-ui.mjs, agent-ui.css, manifest.json, SKILL.md,
// custom-elements.json, vscode.html-data.json, types/*.d.ts
import { build, transform } from 'esbuild';
import { mkdirSync, writeFileSync, statSync } from 'node:fs';
import { dirname } from 'node:path';
import { css } from './src/css.ts';
import { manifest, VERSION } from './src/manifest.ts';
import { skill } from './src/skill.ts';
import { metaFiles } from './src/meta.ts';

const dist = new URL('./dist/', import.meta.url).pathname;
mkdirSync(dist, { recursive: true });

const minCss = (await transform(css, { loader: 'css', minify: true })).code;
// esbuild must not rewrite the features the design depends on
for (const needle of ['light-dark(', '@layer ui-base', 'type(<length>)', ':where(']) {
  if (!minCss.includes(needle)) throw new Error(`minified CSS lost "${needle}"`);
}

const banner = `/*! agent-ui ${VERSION} | MIT | https://github.com/limiteinductive/agent-ui */`;
const common = {
  entryPoints: ['src/index.ts'], bundle: true, minify: true, target: 'es2022',
  define: { __UI_CSS__: JSON.stringify(minCss) }, banner: { js: banner }, legalComments: 'none' as const,
};
await build({ ...common, format: 'iife', outfile: `${dist}agent-ui.js` });
await build({ ...common, format: 'esm', outfile: `${dist}agent-ui.mjs` });

writeFileSync(`${dist}agent-ui.css`, `${banner}\n${minCss}`);
writeFileSync(`${dist}manifest.json`, JSON.stringify(manifest, null, 2) + '\n');
writeFileSync(`${dist}SKILL.md`, skill());
const meta = metaFiles();
for (const [f, text] of Object.entries(meta)) {
  mkdirSync(dirname(`${dist}${f}`), { recursive: true });
  writeFileSync(`${dist}${f}`, text);
}

for (const f of ['agent-ui.js', 'agent-ui.mjs', 'agent-ui.css', 'manifest.json', 'SKILL.md', ...Object.keys(meta)]) {
  console.log(`${f.padEnd(22)} ${(statSync(`${dist}${f}`).size / 1024).toFixed(1)} KB`);
}
