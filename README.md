# agent-ui

An agent-first UI library, at the research stage. The working name is a placeholder.

The library is framework-agnostic: CSS-first `<ui-*>` custom elements, plus tokens and themes. A DOM diagnostics engine emits precise, structured feedback when markup goes wrong. Solid 2.0 is planned as an adapter. Everything must also work in no-build CDN pages.

The goal is that agents write good UI on the first try and get loud, precise feedback when they don't.

- [`research/principles-catalog.md`](research/principles-catalog.md): principles P1–P10, a diagnostics shortlist and contested items, built from [`research/sections/`](research/sections).
- [`research/layout-vocabulary.md`](research/layout-vocabulary.md) and [`research/vocabulary.md`](research/vocabulary.md): canonical element, attribute and value names, chosen by what models guess without docs.
- [`eval/name-guess/`](eval/name-guess): the eval behind those names. Five models were given no docs, over 1,590 calls in total.
