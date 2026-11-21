# agent-ui

An agent-first UI library, at the research stage. The working name is a placeholder.

The library is framework-agnostic: CSS-first `<ui-*>` custom elements, plus tokens and themes. A DOM diagnostics engine emits precise, structured feedback when markup goes wrong. It needs no framework adapter: React, Solid and Vue render the elements directly, and typings ship for each. Everything also works in no-build CDN pages.

The goal is that agents write good UI on the first try and get loud, precise feedback when they don't.

## Use

In a plain page, one tag loads the stylesheet, the elements and the diagnostics:

```html
<script src="https://cdn.jsdelivr.net/npm/@agent-ui/core/dist/agent-ui.js"></script>
```

In a bundled app, `npm i @agent-ui/core`, then:

```ts
import '@agent-ui/core';
import type {} from '@agent-ui/core/react'; // or /solid, /vue: typed attributes and element properties
```

- **React** drops boolean values on native elements, so write child attributes as strings there: `grow=""`, `grow={isMain ? '' : undefined}`. On `ui-*` elements, booleans work.
- **Vue** needs `compilerOptions.isCustomElement: (tag) => tag.startsWith('ui-')`. Write attribute names in kebab-case (`stack-below`).
- **Editors**: `dist/custom-elements.json` is the standard manifest. For VS Code HTML completion, add `"html.customData": ["./node_modules/@agent-ui/core/dist/vscode.html-data.json"]` to `.vscode/settings.json`.
- **Agents**: `dist/SKILL.md` is the reference to give them.

`test/frameworks` renders the same page through React 19, Solid 1.9 and Vue 3.5 and checks that the layout matches plain HTML.

## Research

- [`research/principles-catalog.md`](research/principles-catalog.md): principles P1–P10, a diagnostics shortlist and contested items, built from [`research/sections/`](research/sections).
- [`research/layout-vocabulary.md`](research/layout-vocabulary.md) and [`research/vocabulary.md`](research/vocabulary.md): canonical element, attribute and value names, chosen by what models guess without docs.
- [`eval/name-guess/`](eval/name-guess): the eval behind those names. Five models were given no docs, over 1,590 calls in total.
