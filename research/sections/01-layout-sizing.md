# Layout, sizing, overflow, positioning and overlays

> **Names superseded 2026-11-20** by the name-guess eval. See [../vocabulary.md](../vocabulary.md) and [../layout-vocabulary.md](../layout-vocabulary.md). The cases below still hold. Old spellings that remain here are pre-eval: `tone=` → `variant` on components / `color` on text; `accent` → `primary`; `positive|caution|critical` → `success|warning|danger`; `pad` → `padding`; `busy` → `loading`; `none` → `0`; `ui-surface` → `ui-card` (`elevated`/`sunken`/`inverse`); `ui-callout` → `ui-alert`; `ui-time` (relative) → `ui-relative-time`; `ui-cluster|split|bar|reel|switcher|sidebar` → `ui-row` modifiers. Round 2 (same day): `scrollable` → `scroll`; `threshold` → `stack-below`; `ui-layers` → `ui-overlay`; `ui-layout`/`ui-shell` → `<ui-page layout="app">`; absolute `ui-time` → `ui-date`/`ui-datetime`; `ui-modal` → `ui-dialog`; `ui-metric` → `ui-stat`; `ui-grid columns` is now exact, and `max-columns` is the cap.

> Built from 60 raw cases from two explorers: `layout` (raw IDs **L1–L30**, in input order) and `sizing-overlays` (**S1–S30**). Result: **32 kept cases** in 6 sub-topics plus one nesting case (G1). **11 cases go to other sections** as one-line pointers (§H). No whole case was dropped as wrong. 13 sub-claims were corrected or cut (Appendix B).
>
> **Tiers:**
> - **CORE**: enforced by primitives, tokens and types.
> - **DIAGNOSTIC**: the main defense is a runtime or static check.
> - **GUIDANCE**: SKILL.md only.
> - **CONTESTED**: the encoding is disputed.
>
> Most CORE cases also ship a backing diagnostic for author-written CSS outside the primitives.
>
> **Diagnostic codes** use the form `area/kebab-name`, with severity (error/warn/info) in parentheses. *exact* means a deterministic computed-style or geometry test with low false-positive risk.

---

## 0. What this domain says about the principles

### Proposed additions

| | Principle | Statement | Strongest evidence |
|---|---|---|---|
| N1 | **Split ownership: parent places, leaf sizes** | The parent primitive owns tracks, gap, alignment slot and flow. The leaf owns its sizing intent (`fit` / `fill` / token). Neither reaches into the other's job. | B1–B3: centered stacks shrink inputs, grid stacks stretch buttons into slabs, flex shrink turns avatars oval. |
| N2 | **One-directional size flow** | On each axis a box is sized either from outside (definite) or from its content (intrinsic), never both. Anything that inverts that flow must sit on a size a primitive guarantees: `%` heights, `container-type`, `fr` rows, chart and canvas frames, inner scrollers. | D1–D5: panes grow instead of scrolling, `height:100%` is ignored, `container-type` collapses a box to 0, ResizeObserver charts grow forever, 1fr columns blow out. |
| N3 | **Fail toward reachable** | Content that exceeds its space wraps, scrolls, or overflows at the end edge. It never clips silently, overflows at the start edge, or vanishes. | C1 safe center, C2 overflow owners, C3 clip vs hidden, F6 bounded overlays. |
| N4 | **One source of order** | DOM, visual, focus, reading and top-layer stacking order agree, or the library owns the difference. Reordering happens in the DOM. | A6, A9, F4. `order` / `row-reverse` / `dense` are handed to semantics. Screenshots never reveal a mismatch. |
| N5 | **Stable under N±1 and re-parenting** | Adding or removing one item, or moving a component under a different primitive, never changes how the others read or are sized. | A2 orphans and auto-fit, A3 spans, A4 2+1 wrap, A5 space-between, B5 blockified text, D4 container collapse. Testable as a fixture matrix: 0, 1, 2, N and N+1 children under every parent primitive. |
| N6 | **Non-local effects are owned and verified** | Some properties resolve against the ancestor chain (definite size, containing block, stacking context, scroll container, clipping) or by name (anchors, invokers). Only designated primitives may create them. The runtime checks the chain and names the element that causes the problem. | C2, D2, E1, F2, F5. |
| N7 | **Platform-owned state machines** | Where the browser ships the state machine (dialog, popover, top layer, invokers, scroll-snap, details), the library delegates to it and offers no way to rebuild it. | F1, A8. |

### The draft principles under load

- **P1 Owned by one place.** Holds, but layout has two legitimate owners (N1). Reword as "each property of the visual result has exactly one owner". Grid is not purely parent-owned either: each item's min-content size feeds back into `auto` and `fr` tracks (C2).
- **P2 Locally readable.** This domain breaks P2 by design: sticky, fixed, `%` heights, z-index, overflow and anchors all depend on elements elsewhere in the tree.
  - Make it operational: the result must be predictable from the element plus its direct parent primitive (one hop).
  - Anything that needs more hops is allowed only through a designated primitive, which must ship a runtime check that names the distant cause (N6).
  - This also explains why flex is risky: in flex the siblings matter, which is a hop sideways.
- **P3 Free of hidden defaults.** Cannot be met literally, because the worst defaults are in the CSS spec:
  - `min-size:auto`, stretch, `flex-shrink:1`, `align-content:normal`;
  - `auto` tracks absorbing free space;
  - overscroll chaining, and `overflow:hidden` silently creating a scroll container;
  - undefined custom elements defaulting to inline display.

  Reword as "every primitive restates the spec defaults it depends on and picks the safe value explicitly". Split the work into what the library sets (reset and primitives) and what the agent must not rely on (lint).
- **P4 Robust to variation.** Name the axes: content length, locale, **cardinality**, **container size (not viewport)**, state, **parent context**, and environment (classic scrollbars, mobile browser chrome, zoom). The bold axes cause most failures here. Agent mock data (3 items of similar length, a desktop width, macOS) never exercises them.
- **P5 + P6 Closed set, one canonical way.** These overlap: merge them as "a closed set of intents, each with one canonical encoding".
  - Closing values is not enough. The failures here are combinations of individually valid values: wrap + space-between, span + auto-fill, center + form controls, container-type + shrink-to-fit. Close over combinations in the types.
  - Benefit for the no-build target: `var()` is not allowed in `@container` or `@media` conditions, and typed `attr()` is not yet Baseline. Only closed token sets let the library ship pre-generated container-query thresholds and `:has(:nth-child())` limits (A2, A3, A4, A6) without a build step on the user's side.
- **P7 Loud when wrong.** Extend it to two more kinds of failure:
  - silent no-ops, such as `justify-self` on a flex item;
  - silently created structure, such as implicit tracks and anonymous items made from bare text.

  Warnings must name the cause, not the symptom. A warning that only says "page overflows" is how agents end up adding `overflow-x:hidden` to the body. Preference order: make it unrepresentable (no `z-index`, `height` or `position:fixed` props), then correct it by construction, then warn.

### Corrections to the seed cases

- **"Grid over flex"** becomes **"parent-owned size over sibling negotiation"**.
  - Grid has hidden defaults of its own (A3, B2, C2).
  - Flex is the right tool for content-sized flows (A1), all-or-nothing switching (A4) and query-free sidebars (A6).
  - Ship intent-named primitives, and no generic flex or grid primitive.
- **"Container queries over media queries"** needs two caveats:
  - `container-type` belongs only on boxes sized from outside (D4);
  - it turns that box into the containing block for `position:fixed` descendants, and into a stacking context (F2).
- **"isolation:isolate over z-index wars"**: isolate only components that own an internal z-order. Anything that floats goes in the top layer (F1, F3).
- **"Gap over margin"** becomes **"parent-owned spacing"**. Prose needs asymmetric sibling margins, and gap plus UA margins double the spacing. Typography and fundamentals own this one.
- **"minmax(0,1fr)"** is only half the fix. Zeroing the min-size with no overflow owner turns blowout into overlap (C2).

---

## Index

| ID | Case | Tier | Detect |
|---|---|---|---|
| A1 | Pick the primitive by who owns size | CORE | both |
| A2 | Equal-item grids: auto-fill, 100% guard, column cap | CORE | both |
| A3 | Grid's implicit tracks: gated spans, checked area names | CORE | both |
| A4 | Comparison sets switch all-or-nothing | CORE | both |
| A5 | Bars: three grid slots, auto-margin push, no space-between | CORE | both |
| A6 | Sidebar: fit side, minmax(0,1fr) main, container collapse | CORE | both |
| A7 | Equal-to-widest groups via inline-grid | CORE | static |
| A8 | Rails and carousels: grid auto-flow column + snap | CORE | both |
| A9 | Column-major multicol; masonry only as an enhancement | GUIDANCE | both |
| A10 | Cross-sibling alignment: one parent template, subgrid | CORE | both |
| B1 | Leaf sizing intent: fit / fill / token, declared by the leaf | CORE | both |
| B2 | Grid stacks state align-content:start | CORE | both |
| B3 | Center the box, not the items | CORE | both |
| B4 | Growth is one boolean on one child | CORE | both |
| B5 | Don't make a run of text a flex container | DIAGNOSTIC | runtime |
| C1 | Every center is safe center | CORE | both |
| C2 | min-size 0 by default, plus an overflow owner for every wide atom | CORE | runtime |
| C3 | overflow:clip, never hidden, for clipping | CORE | both |
| C4 | Page overflow: breakout grid, no 100vw, culprit finder | CORE | both |
| D1 | The app shell owns viewport units and rows | CORE | runtime |
| D2 | Percentage heights are replaced by parent-owned stretch | CORE | both |
| D3 | ui-scroll-area is the only scroller and carries the full contract | CORE | both |
| D4 | container-type only on boxes sized from outside | CORE | runtime |
| D5 | Size-reactive content goes in a size-contained frame | CORE | runtime |
| E1 | The sticky contract and published chrome offsets | CORE | runtime |
| F1 | Anything that floats lives in the top layer | CORE | both |
| F2 | Ancestors silently capture fixed descendants and z-index | DIAGNOSTIC | runtime |
| F3 | z-index is a closed set, with no negatives | CORE | both |
| F4 | Top-layer order is open order (toast under modal) | CONTESTED | hard |
| F5 | Anchor positioning: logical placement, per-instance anchors | CORE | both |
| F6 | Overlays are bounded by the viewport and scroll inside | CORE | runtime |
| G1 | Nesting hygiene | DIAGNOSTIC | runtime |

---

## A. Choosing the primitive: who owns size

### A1 Pick the primitive by who owns size · CORE
> **Naming superseded 2026-11-20.** The ownership rule below still holds, but it is now expressed with `ui-stack`/`ui-row` modifiers rather than intent-named primitives. See [../layout-vocabulary.md](../layout-vocabulary.md).

- **Prefer** parent-sized primitives (`ui-grid`, `ui-columns`, `ui-sidebar`, `ui-layout`) when peers must be equal or aligned, and content-sized `ui-cluster` / `ui-bar` when each item's content sets its width, **over** the rule "flex for 1D, grid for 2D" and over any generic `ui-flex` or `ui-row`.
- **P:** 1, 5, 6, N1 · **Detect:** both · **Merged:** L1, L13
- **Agent failure:**
  - A KPI row built with `display:flex` renders the "$1,204,332" tile about twice as wide as the "12%" tile.
  - Tags or breadcrumbs built with `repeat(auto-fill, minmax(8rem,1fr))` float in equal-width cells with dead space.
  - An agent primed with "grid good, flex bad" puts a tag list or a chip input into tracks.
- **Encoding:**
  - The SKILL.md decision table starts from one question: "must peers be equal, or aligned across rows?"
  - `<ui-cluster gap justify="start|center|end" align="center|baseline">` covers tags, chips, breadcrumbs, button groups, meta lines, and a logo wall whose partial last line is centered (grid cannot center a partial row).
  - Cluster children never grow, except one `grow` child with a min-basis token (a chip input's text field).
  - Diagnostics:
    - `layout/unequal-peers` (info): 3 or more same-type siblings in an *author-written* flex row whose widths differ by more than 25%.
    - `grid/content-in-tracks` (info): *atom* components (tag, badge, link) consistently narrower than 50% of their track. Suggests a cluster.

### A2 Equal-item grids: auto-fill, a 100% guard and a column cap · CORE
- **Prefer** `repeat(auto-fill, minmax(min(100%, max(var(--min), (100% - (var(--cols) - 1) * var(--gap)) / var(--cols))), 1fr))` **over** these alternatives:
  - `flex-wrap` with `flex: 1 1 300px`: the orphaned last item stretches.
  - `width: calc(33.333% - 1rem)`: drops to 2-up when the gap token changes.
  - `auto-fit` by default: one item becomes one giant card.
  - `repeat(3, 1fr)` plus viewport breakpoints.
- **P:** 4, 5, 6, N5 · **Detect:** both · **Merged:** L2
- **Agent failure:**
  - A dashboard with 1 of 3 widgets loaded shows one full-width card.
  - The 7th search result renders at triple width.
  - A 300px track minimum inside a 280px phone container scrolls sideways.
  - Without a cap, a 2560px monitor shows 9 columns.
- **Encoding:**
  - `<ui-grid min="16rem" max-cols="4">`. `min` is a SizeToken and always compiles with the `min(…,100%)` guard.
  - `max-cols` (1–6) maps to `--cols` through pre-generated attribute selectors, since typed `attr()` is not Baseline.
  - `auto-fill` is the default; `auto-fit` exists only as `fill="stretch"`.
  - Diagnostic `grid/last-row-orphan` (warn): in an author-written flex-wrap container, last-line items are more than 1.5× the width of first-line items.
  - New relative to the seed: the cap, auto-fill as the default, and the orphan check.

### A3 Grid's own hidden defaults: implicit tracks, ungated spans, mistyped area names · CORE
- **Prefer** spans that apply only when the container can fit them, `1 / -1` for full rows, and type-checked area names, **over** raw `grid-column: span 2` in an auto-fill grid, a misspelled `grid-area`, or a fixed template with more children than cells.
- **P:** 3, 4, 7, N5 · **Detect:** both · **Merged:** L3
- **Agent failure:**
  - At a 1-column width, one "featured" tile creates an implicit second column and the page scrolls sideways.
  - After a rename, `grid-area: sidebar` no longer matches the template's `side`, so the sidebar lands below the footer at full width.
  - Neither case reports an error, and the agent's desktop screenshot looks fine.
- **Encoding:**
  - Child prop `span={2|3}` compiles to an `@container` rule that applies only when `min × span + gap × (span − 1)` fits. These rules are pre-generated per (min token × span) pair, because `var()` is not allowed in container conditions.
  - `span="row"` compiles to `1 / -1`.
  - In the Solid adapter, area names are a string-literal union inferred from the `template` prop, so a typo is a type error. In plain HTML they are checked at runtime.
  - Diagnostic `grid/implicit-track` (warn, exact): the computed grid has more tracks than the explicit template, or a child is placed beyond the explicit lines. Reports the child's path.
  - Spans declared by role (feature, wide, tall) for bento layouts are owned by Expressive range.

### A4 Comparison sets switch all-or-nothing · CORE
- **Prefer** `<ui-switcher threshold="40rem" limit="4">`, which puts every item in one row at or above the threshold and stacks them all below it, **over** flex-wrap or auto-fill for pricing tiers, process steps or plan comparisons.
- **P:** 4, 5, N5 · **Detect:** both · **Merged:** L14
- **Agent failure:** at tablet width, Pro and Team sit side by side and Enterprise sits alone underneath at double width. Readers take Enterprise for a different kind of offer.
- **Encoding:**
  - Query-free `flex-basis: calc((var(--threshold) - 100%) * 999)`, which works without a build step. This is a place where flex's negotiation is the feature.
  - More than `limit` children always stack, via pre-generated `:has(> :nth-child(n+5))` rules for limits 2–6.
  - SKILL.md: "is this a comparison set?" leads to the switcher.
  - Diagnostic `layout/partial-wrap` (info): a wrapping container with 2–4 same-type children ends up with lines holding different counts.

### A5 Bars: three grid slots, push with an auto margin, never space-between · CORE
- **Prefer** `ui-bar`, a grid with `minmax(0,1fr) auto minmax(0,1fr)` start, center and end slots for true centering, or for two groups an end group pushed with `margin-inline-start:auto`, **over** `justify-content: space-between`.
- **P:** 4, 5, 6, N5 · **Detect:** both · **Merged:** L12 (+ contrarian "auto margins over space-between")
- **Agent failure:**
  - A mobile header title sits off-center: space-between centers it in the leftover space, and the left side has one icon while the right has three.
  - Wrapped filter chips leave the last two glued to opposite edges.
  - With three spaced items, adding a fourth breaks the grouping.
- **Encoding:**
  - `justify` on any wrapping primitive accepts only `start | center | end`. This closes over the wrap + between combination.
  - Side slots that outgrow their `minmax(0,1fr)` track must collapse into an overflow menu or wrap. Otherwise they overlap the center slot (see C2).
  - Diagnostics:
    - `flex/wrap-space-between` (warn, exact).
    - `bar/off-center` (info): the midpoint of a centered child is more than 8px from its container's midpoint.

### A6 Sidebar: fit side, minmax(0,1fr) main, collapse on container width · CORE
- **Prefer** `grid-template-columns: fit-content(var(--side-max)) minmax(0,1fr)` collapsing on container width, with the sidebar's DOM position matching its side, **over** `250px 1fr` plus `@media (max-width:768px)` and `order:-1`.
- **P:** 1, 2, 4, N4 · **Detect:** both · **Merged:** L15 (+ contrarian "intrinsic wrap layouts")
- **Agent failure:**
  - In a 500px embedded artifact on a wide monitor, the two-column desktop layout persists and main is 200px wide.
  - A code block in main makes the whole page scroll, because a bare `1fr` is `minmax(auto,1fr)`.
  - A fixed 250px clips long nav labels.
- **Encoding:**
  - `<ui-sidebar side="start" width="18rem" content-min="60%">` declares its own named container.
  - A container cannot query itself, so collapse is expressed on the children (`grid-column: 1 / -1`), not on the template.
  - `side` must agree with DOM order (start = first child). A mismatch triggers a diagnostic; the layout is never silently reordered.
  - Diagnostic `sidebar/main-starved` (warn): main's inline size is below `content-min` while the layout has not collapsed.
  - *Contested:* which encoding is canonical (see §Contested).

### A7 Groups as wide as their widest member: inline-grid · CORE
- **Prefer** `display:inline-grid; grid-auto-flow:column; grid-auto-columns:1fr` **over** fixed segment widths, `flex:1` in a full-width container, or content-sized flex.
- In a shrink-to-fit grid, every `1fr` track resolves to the widest item's max-content width.
- **P:** 4, 6 · **Detect:** static · **Merged:** L21
- **Agent failure:**
  - "Day / Week / Month / Quarter" renders with uneven segments.
  - "Cancel" and "Delete permanently" differ in size, or the second is truncated by a fixed 100px width.
- **Encoding:**
  - `<ui-segmented>` and `<ui-actions equal>` compile to this mechanism.
  - They stack via a query on the nearest *region* container: the group itself is shrink-to-fit and must not carry `container-type` (D4).
  - SKILL.md: a case where grid beats flex even for a content-sized group.

### A8 Rails and carousels: a grid with auto-flow column, plus scroll-snap · CORE
- **Prefer** `ui-reel` **over** `display:flex; overflow-x:auto` with `width:300px` items, and over translateX JS sliders. `ui-reel` is:

  ```css
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: min(var(--item), 85%);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: var(--gutter);
  overscroll-behavior-inline: contain;
  ```

  The 85% cap lets the next item peek into view.
- **P:** 3, 4, 6, N7 · **Detect:** both · **Merged:** L22, S23
- **Agent failure:**
  - Flex shrink squeezes items to their min-content size before anything overflows: kanban columns at about 80px, 12 unreadable cards that "work" because nothing overflows.
  - JS sliders break on resize, ignore inertia and trap keyboard users.
- **Encoding:**
  - `item` is a size token.
  - Snap is `mandatory` only for inline reels whose items are capped below the snapport (the 85% cap guarantees this), and `proximity` otherwise.
  - `::scroll-button` / `::scroll-marker` are a progressive enhancement.
  - Diagnostics:
    - `reel/no-overflow` (warn): a reel with more than 3 children renders them narrower than the declared item size.
    - `scroll/snap-oversized` (warn): mandatory snap where an item is larger than the snapport on the snap axis, leaving content unreachable.
  - Focus and name requirements come from D3.

### A9 Column-major flows use multicol; masonry only as an enhancement · GUIDANCE
- **Prefer** multicol (`columns: var(--col-min)` with `break-inside:avoid`) only for column-major content (link lists, glossaries, footers), and `display: grid-lanes` masonry only behind `@supports` over an aligned `ui-grid` with `align-items:start`, **over** `flex-flow: column wrap` with a guessed height, `column-count` for ordered feeds, or JS masonry.
- **P:** 4, 5, N4 · **Detect:** both · **Merged:** L23 · **Confidence:** medium
- **Agent failure:**
  - Footer link columns overflow the footer at narrow widths.
  - A "latest posts" masonry built with CSS columns reads out of chronological order, and tab order snakes down each column.
  - Agents reach for `column-count` because it is the most common "CSS masonry" answer online.
- **Encoding:**
  - A multicol primitive separate from `ui-grid`, and `<ui-masonry>`, which feature-detects grid-lanes.
  - Diagnostic `layout/column-wrap-overflow` (warn): a column-wrap flex container whose children's rects extend past its own.
  - Verify grid-lanes engine support at release.
  - Naming collision: the explorers proposed `ui-columns` for both equal grid columns (L1) and multicol (L23). It must be resolved (§Contested).

### A10 Cross-sibling alignment: one parent template, rows and cards join via subgrid · CORE
- **Prefer** a parent that owns one track template, with children joining it through subgrid, **over** per-row `display:flex` with fixed label widths or `flex:1` cells, per-card flex with `margin-top:auto`, fixed heights or clamped titles to fake alignment, or `display:contents` rows. The two subgrid forms:
  - list rows: `grid-column: 1 / -1; display: grid; grid-template-columns: subgrid`, which keeps the row box for hover, selection and borders;
  - cards: `grid-row: span N; grid-template-rows: subgrid`.
- **P:** 1, 4 · **Detect:** both · **Merged:** L19, L20
- **Agent failure:**
  - Settings inputs start at three different x positions, and transaction amounts don't line up.
  - "Notification email address" wraps to 3 lines in a 120px label column.
  - Card prices zigzag when titles wrap to 1 line in one card and 2 in the next. This only shows with real copy, never with lorem ipsum.
- **Encoding:**
  - `<ui-list columns="fit(14rem) fill auto">`.
  - `<ui-form layout="aligned">`: one label column (`fit-content(limit)`), stacked by container query.
  - `<ui-grid regions="media title body footer">`, with `ui-card` slots mapped onto the regions through subgrid. Outside such a parent, a card falls back to an internal `auto 1fr auto` grid.
  - Diagnostics:
    - `layout/pseudo-table` (info): 3 or more sibling flex rows with equal child counts whose nth children start at inline offsets more than 2px apart. Suggests ui-list or ui-table.
    - `cards/misaligned-regions` (info): same-slot children in one visual row differ in top offset by more than 2px.
  - Data tables use `<table>`, owned by semantics and media.

## B. Leaf sizing and alignment (split ownership)

### B1 Leaf sizing intent is a closed set the leaf declares: fit / fill / token · CORE
- **Prefer** each leaf declaring `fit | fill | <size token>` **over** letting the parent's defaults decide its size, `width:max-content` / `nowrap` on labels, and bare `auto auto` tracks.
  - Buttons, badges and links default to `fit`; inputs and cards to `fill`.
  - Fixed atoms (avatar, icon, thumbnail, button) carry `flex:none` and their own `align-self`.
- **P:** 3, 4, 5, N1 · **Detect:** both · **Merged:** L4, L5 (leaf half), L8 (+ contrarian "default stretch inflates controls")
- **Agent failure:**
  - Grid stretch turns a status badge into a full-width bar and a Save button into a card-wide slab.
  - `flex-shrink:1` squeezes a 40px avatar into a 28px oval, only for long usernames.
  - `align-items:stretch` distorts an `<img>`, or makes a button 3 lines tall next to a paragraph.
  - `auto auto` tracks split the free space, so values sit mid-card, far from their keys.
  - A German "Einstellungen speichern" button overflows its card.
  - The agent then patches with ad hoc `width:fit-content` in some places and not others.
- **Encoding:**
  - Size props are typed `'fit' | 'fill' | SizeToken`.
  - Track tokens are `fit(limit)`, `fill` (= `minmax(0,1fr)`) and fixed tokens. Bare `auto` is rejected in templates.
  - `fill` compiles to alignment stretch, not `width: stretch`, which is not Baseline (Firefox only has `-moz-available`).
  - `fill` on a button is an explicit opt-in.
  - Diagnostics:
    - `media/aspect-distorted` (warn, exact): the rendered ratio differs from the natural ratio by more than 2% with `object-fit:fill`.
    - `layout/fixed-size-shrunk` (warn): an explicit width or height renders smaller than specified inside a flex container.
    - `size/max-content-overflow` (warn): an element whose inline size equals its max-content width and exceeds its containing block.
    - `size/inline-stretched` (info): a button, badge or link rendered at 100% of a container 480px or wider without `fill`.

### B2 Grid stacks state align-content:start · CORE
- **Prefer** `ui-stack` = `display:grid; gap; align-content:start; justify-items:stretch`, all stated explicitly, **over** `display:grid; gap:1rem` as a quick stack inside a fixed-height or 100dvh panel, where `align-content:normal` stretches the auto rows.
- **P:** 3 · **Detect:** both · **Merged:** L5 (row half)
- **Agent failure:** four nav links in a full-height sidebar render about 200px apart, and drift further apart as the panel grows.
- **Encoding:** built into ui-stack. Diagnostic `stack/row-stretch` (warn): a grid container whose row tracks are taller than their items' content while `align-content` is `normal`.

### B3 Center the box, not the items · CORE
- **Prefer** `<ui-center max="measure">` (`margin-inline:auto` plus `max-inline-size`, children stay stretched) **over** `align-items:center` or `place-items:center` on a container of forms or cards, which turns every child into fit-content.
- **P:** 2, 3, N1 · **Detect:** both · **Merged:** L6
- **Agent failure:**
  - On a login form the email field is 180px wide, and the password field's width jumps when validation text appears.
  - "Center the page" collapses a dashboard to the width of its longest heading.
- **Encoding:**
  - The cross-axis `align` on ui-stack accepts only `stretch | start`; centering exists only as `ui-center`, which emits safe centering (C1).
  - Diagnostic `align/shrink-wrapped-field` (warn): a form control or ui-card narrower than 60% of a parent whose `align-items`/`justify-items` is not stretch.
  - SKILL.md rule: "center the box, not the items".

### B4 Growth is one boolean on one child · CORE
- **Prefer** grid for equal division, and "this child takes the rest" as `grow` on one child of a bar or cluster (compiled to `flex: 1 1 0; min-inline-size: 0`), **over** mixing `flex:1`, `flex-grow:1`, `flex:auto` and `flex: 1 1 33%`.
- **P:** 2, 5, 6 · **Detect:** both · **Merged:** L9
- **Agent failure:**
  - Three "equal" columns where the one with a long heading is 40% wider, because `flex-grow:1` keeps basis `auto`.
  - A toolbar search input won't fill because a sibling also got `flex:1`.
- **Encoding:**
  - The Solid types allow `grow?: boolean` only on direct children of ui-bar and ui-cluster, with no basis or shrink props.
  - Diagnostic `flex/multiple-growers` (warn): more than one growing child in a bar.

### B5 Don't make a run of text a flex container · DIAGNOSTIC
- **Prefer** `align-content:center` on a plain block for vertical centering (Baseline 2024), and `text-align` or `margin-inline:auto` for horizontal, **over** `display:flex; align-items:center` on a `<p>`, `<td>`, `<label>`, `<a>` or `<button>` with mixed inline content.
- **P:** 2, 3, 7, N5 · **Detect:** runtime · **Merged:** L25
- **Agent failure:**
  - Each text run becomes its own anonymous flex item, so "Read our Terms of Service" renders as "Read ourTerms of Service".
  - The link stops wrapping, and `::before`/`::after` become items.
- **Encoding:**
  - Primitives place element children only, and ui-text never uses flex.
  - Diagnostic `layout/blockified-text` (warn, exact): a flex or grid container with a non-whitespace direct text node and at least one inline-level element child.
  - The rule for children of primitives is owned by llm-api ("Bare text inside layout primitives").

## C. Overflow and minimum size

### C1 Every center is safe center · CORE
- **Prefer** `safe center`, or `margin:auto` on the child inside a scroll container, for every centering the library emits, **over** `align-items:center; justify-content:center` on overlays, full-height empty states and centered tab bars, and `place-items:center; height:100vh` wrappers.
- **P:** 4, 7, N3 · **Detect:** both · **Merged:** L7, S11
- **Agent failure:**
  - A modal taller than a 640px laptop viewport loses its title and close button above the top edge, where they cannot be scrolled to.
  - A centered mobile tab bar loses its first tab off the start edge.
  - A 1440×900 screenshot shows nothing wrong.
- **Encoding:**
  - All primitive centering compiles to `safe center` (Safari 17.6+, Chrome, Firefox). ui-dialog uses `margin:auto` with a bounded size (F6).
  - Diagnostic `align/unsafe-overflow` (error, exact): a child's rect starts before its scroll container's scrollable origin while the parent centers it.

### C2 min-size 0 by default, plus an overflow owner for every wide atom · CORE
- **Prefer** primitives that give children `min-inline-size:0` (tracks as `minmax(0,1fr)`) *and* route every incompressible atom to an explicit owner, **over** leaving `min-width:auto` (1fr blowout) or zeroing the min-size with no owner (blowout turns into overlap).
  - Incompressible atoms: tables, `pre`, charts, long URLs, wide images.
  - Owners: wrapping, `ui-scroll-area axis="inline"`, or declared truncation.
- **P:** 2, 4, 7, N3, N6 · **Detect:** runtime · **Merged:** L10, S24 (layout half), S22 (overflow half) (+ contrarian "minmax(0,1fr) turns overflow into overlap")
- **Agent failure:**
  - A long filename in a file-list row pushes the size column and buttons out of the card.
  - The agent adds `overflow:hidden` to the card, and now the buttons are clipped instead of the name truncating.
  - With min-size zeroed and no owner, a wide table paints over the sidebar.
- **Encoding:**
  - `ui-text truncate | lines={n}` sets the whole bundle, including `min-inline-size:0`.
  - `ui-table` and `ui-code` wrap themselves in ui-scroll-area.
  - Diagnostics:
    - `text/truncation-ineffective` (warn): an ellipsis element with scrollWidth ≤ clientWidth while an ancestor overflows. The check walks up the ancestors and reports the first flex or grid item with `min-width:auto`, with its path and a repair anchor.
    - `layout/overflow-unowned` (warn): a child's border box extends past a zero-min track and no ancestor up to that track is a scroll owner or clip.
  - The full-text affordance and truncation policy are owned by typography and variation.
  - *Contested:* zeroing the min-size by default (see §Contested).

### C3 Clip with overflow:clip; scroll containers only via ui-scroll-area · CORE
- **Prefer** `overflow:clip` for rounded-corner masks, decorative bleed and blobs, and `overflow:auto` only inside ui-scroll-area, **over** `overflow:hidden` on wrappers and `overflow-x:hidden` as the fix for sideways scroll.
- **P:** 3, 5, 7, N3 · **Detect:** both · **Merged:** S17, L16 (overflow half) (+ contrarian, variation)
- **Agent failure:** `overflow:hidden` creates a scroll container. As a result:
  - sticky descendants stop sticking;
  - `focus()` and `scrollIntoView` can scroll it and leave it shifted;
  - setting one axis to hidden turns the other axis from `visible` into `auto`;
  - menus and focus rings get clipped.

  `overflow-x:hidden` on a wrapper, or on both html and body, kills a sticky header that used to work.
- **Encoding:**
  - The reset never uses `hidden`; `<ui-surface clip>` compiles to `overflow:clip`.
  - Static lint flags `overflow:hidden` / `overflow-x:hidden` in authored CSS, with a repair anchor.
  - The runtime `sticky/ineffective` check (E1) names the clipping ancestor.
  - `overflow-clip-margin` support is incomplete (verify Safari). Don't rely on it to rescue focus rings; use an inset `outline-offset` inside clipped surfaces.

### C4 Page overflow: breakout grid and no 100vw by construction; report the culprit · CORE
- **Prefer** a breakout page grid, with children opting in through `bleed="wide|full"` and blocks filling by default (`width:auto`), **over** `width:100vw; margin-inline:calc(50% - 50vw)`, `width:100%` on blocks with margins or on flex items, and `overflow-x:hidden` on the body. The page grid:

  ```css
  grid-template-columns:
    [full-start] minmax(var(--gutter), 1fr)
    [content-start] min(var(--measure), 100% - 2 * var(--gutter))
    [content-end] minmax(var(--gutter), 1fr)
    [full-end];
  ```

  An optional `wide` band sits between content and full.
- **P:** 3, 4, 7 · **Detect:** both · **Merged:** L18, S16
- **Agent failure:**
  - `100vw` includes a classic scrollbar, so about 15px of horizontal scroll appears only on Windows and Linux. macOS overlay scrollbars hide it from the agent's screenshots.
  - A single `pre`, table or URL makes the page pan sideways on mobile.
- **Encoding:**
  - `<ui-container>`, whose children take `bleed: 'content' | 'wide' | 'full'`.
  - Diagnostic `layout/horizontal-overflow` (error): when root scrollWidth > clientWidth, report the deepest elements whose inline-end edge passes the viewport (inline-start in RTL), with their paths: the culprit, not the symptom.
  - Lint flags `100vw` widths and `width:100%` combined with an inline margin.
  - The culprit engine is owned by diagnostics; named page lines by fundamentals.

## D. Size flow, heights and scroll ownership

### D1 The app shell owns viewport units and rows · CORE
- **Prefer** `<ui-layout>` **over** `height:100vh` with a flex column and `overflow:auto` several wrappers deep, `min-height:100vh` on nested sections, and fixed bottom bars. `ui-layout`:
  - `block-size:100dvh` for app shells, `min-block-size:100svh` for document pages;
  - `grid-template-rows: auto minmax(0,1fr) auto`;
  - the middle row is a ui-scroll-area, and bottom composers sit in the last row rather than `position:fixed`.
- **P:** 1, 3, 4, 7, N2 · **Detect:** runtime · **Merged:** L17, S13, S15 (+ S26 composer placement)
- **Agent failure:**
  - Every intermediate flex item keeps `min-height:auto`, so the inner pane grows instead of scrolling. The document scrolls, the header leaves, and the chat composer is pushed off-screen.
  - `100vh` is the large viewport on mobile, so the footer hides under the browser UI.
  - A short-content screenshot looks correct.
- **Encoding:**
  - Tokens `--ui-vh-stable` (100svh) and `--ui-vh-live` (100dvh) are used only by shell variants. Lint rejects `vh` in authored CSS.
  - Decision table: hero → svh, app shell → dvh, full-bleed background → lvh.
  - Diagnostics:
    - `scroll/unconstrained` (error): a ui-scroll-area with scrollHeight == clientHeight whose end edge lies beyond the shell or viewport.
    - `scroll/document-and-shell` (warn): the document scrolls while a filled shell exists.
  - Owned elsewhere: keyboard and safe areas (variation), viewport meta (semantics), auto-height embeds dropping viewport units (Host and delivery).

### D2 Percentage heights are replaced by parent-owned stretch · CORE
- **Prefer** grid rows, default stretch, or a `fill` attribute that compiles to the right thing for the parent kind, with `min-block-size` for anything holding content, **over** `height:100%` under an auto-height parent (it silently computes to auto) and px heights on text containers. For the parent kind, `fill` means stretch in a grid and `flex:1` plus `min-block-size:0` in flex.
- **P:** 1, 2, 3, 4, N2 · **Detect:** both · **Merged:** S14, L17 (% height half)
- **Agent failure:**
  - A chart gets 0 height, or a panel collapses.
  - The agent adds `height:100%` to every ancestor up to html, then px heights that break with longer copy and at 200% zoom.
- **Encoding:**
  - No ui-* element has a height or block-size prop, only `fill`, `min-rows` and size tokens.
  - Lint flags `height:N%` and px heights on text-bearing elements.
  - Diagnostic `size/percent-height-ignored` (warn, heuristic): an authored % block-size whose containing block has auto height, so the used height equals the content height.

### D3 ui-scroll-area is the only scroller and carries the whole scroll contract · CORE
- **Prefer** `<ui-scroll-area axis>`, placed in a definite track, **over** raw `overflow:auto` at several levels, default scroll chaining, and JS wheel/touchmove scroll locks. `ui-scroll-area` bundles:
  - `overflow:auto` with a min-size of 0 on its axis;
  - `overscroll-behavior:contain` and `scrollbar-gutter:stable`;
  - a tab stop and an accessible name when it holds no focusable content.
- **P:** 1, 3, 7, N7 · **Detect:** both · **Merged:** S15 (scroller half), S20, S21, S22 (wrapper half)
- **Agent failure:**
  - Nested same-axis scrollers produce double scrollbars.
  - Scrolling to the end of a menu drags the page, or triggers pull-to-refresh on mobile.
  - Keyboard users cannot scroll a region that can't take focus.
  - Content shifts when a list grows, but only with classic scrollbars, never on macOS.
- **Encoding:**
  - `chain` (boolean, default false) is the only way to opt out of containment.
  - Root `html { scrollbar-gutter: stable }`. The modal scroll lock is CSS-only, `html:has(dialog:modal) { overflow: hidden }`, and the reserved gutter keeps the page from jumping.
  - Lint flags `overflow:auto|scroll` outside ui-scroll-area, and `::-webkit-scrollbar`.
  - Diagnostics:
    - `scroll/nested-same-axis` (warn).
    - `scroll/unnamed` (warn): a scroll container with no focusable descendant and no name.
  - A dev toggle forces classic scrollbars so gutter bugs show up in the agent's preview.
  - Owned elsewhere: keyboard reachability (semantics), gutter policy (variation), sticky table header and first column (media).

### D4 container-type only on boxes sized from outside · CORE
- **Prefer** named query containers declared only by region primitives, with components querying the nearest named container, **over** `container-type:inline-size` on every component root.
  - Region primitives: shell areas, sidebar main and side, stretched blocks, grid cells.
- **P:** 3, 4, 7, N2, N6 · **Detect:** runtime · **Merged:** L26 (+ variation, contrarian and diagnostics found the same case)
- **Agent failure:**
  - Inline-size containment makes a shrink-to-fit box ignore its content. A card inside a cluster, an inline-flex, a popover, a fit-content box or a table cell collapses to 0 (or to its padding), and its text overflows.
  - The agent then "fixes" it with `width:300px`.
  - A container cannot query itself.
  - Containment also turns the box into the containing block for fixed descendants, and into a stacking context (F2).
- **Encoding:**
  - Only regions set `container-type`, always together with `container-name`.
  - Component CSS uses named `@container` queries.
  - Top-layer content never declares a container.
  - Diagnostic `container/collapsed` (error, exact): an element with `container-type` whose inline size is at most its padding plus border while it has rendered descendants.

### D5 Size-reactive content goes in a size-contained frame · CORE
- **Prefer** `<ui-aspect-ratio ratio="16/9">`, or a block-size token, with `contain:size` (or `container-type:size`) and `min-inline-size:0` in its track, **over** a ResizeObserver-driven chart, canvas, iframe or virtual list placed directly in a `1fr` or `auto` cell or a flex item, and over `height:100%` charts in auto-height parents.
- **P:** 4, N2 · **Detect:** runtime · **Merged:** L30
- **Agent failure:**
  - The canvas width becomes a min-content contribution, so dashboard charts widen with the window and never shrink back.
  - Chart height creeps upward.
  - The console shows "ResizeObserver loop completed with undelivered notifications".
- **Encoding:**
  - SKILL.md requires ui-aspect-ratio for chart, canvas and embed slots.
  - Diagnostic `layout/resize-feedback` (warn): an element whose size changes in the same direction over N consecutive observations.
  - The runtime attaches the component path to the ResizeObserver loop error.
  - The chart and embed side is owned by media and contrarian.

## E. Sticky

### E1 Sticky: the primitive encodes the full contract and publishes its size · CORE
- **Prefer** `<ui-sticky>` (`position:sticky` + an inset from a token + `align-self:start`), with sticky chrome publishing its block size for other layers to read, **over** sticky with no inset, sticky inside a stretched grid or flex item, sticky under an `overflow:hidden` ancestor, a magic `top:64px`, `scrollTo(offsetTop - 80)`, and IntersectionObserver sentinels.
  - The header publishes `--ui-header-h` through a ResizeObserver.
  - Consumers: stacked sticky offsets, the root `scroll-padding-block-start`, and `scroll-margin` on in-page targets.
- **P:** 1, 2, 3, 7, N6 · **Detect:** runtime · **Merged:** L16 (sticky half), S18, S19
- **Agent failure:**
  - A TOC sidebar scrolls away because it was stretched to the full row height.
  - A sticky table header dies after an unrelated `overflow-x:hidden` fix.
  - Two sticky headers overlap because each assumes `top:0`.
  - `#anchor` links and find-in-page land under the header.
  - The cause is an ancestor away, so the agent keeps editing the sticky element.
- **Encoding:**
  - Sticky exists only as `ui-sticky`.
  - `@container scroll-state(stuck: top)` drives "stuck" styling where supported (progressive).
  - Diagnostic `sticky/ineffective` (warn), run at mount and on resize, reports which condition failed:
    - (a) the element is at least as tall as its containing block's content;
    - (b) the nearest scroll-container ancestor is not the document or a ui-scroll-area, and the check names that ancestor;
    - (c) no inset is set.
  - "Focus not obscured" (WCAG 2.4.11) is owned by semantics and variation.

## F. Overlays, stacking and positioning

### F1 Anything that floats lives in the top layer · CORE
- **Prefer** native `<dialog>` opened with `showModal()` (or `commandfor` + `command="show-modal"`) and the `popover` attribute (`popovertarget`) **over** `div.modal {position:fixed; inset:0; z-index:9999}`, and over `<dialog open>`, JSX `open={signal}` or `dialog.show()` when a modal was meant.
- **P:** 1, 3, 4, 7, N7 · **Detect:** both · **Merged:** S1, S2, S3
- **Agent failure:**
  - A modal rendered inside a card or header that has a transform, filter or containment is positioned relative to that ancestor and clipped by it.
  - z-index climbs to 99999, Tab escapes into the page, Esc does nothing, and the page scrolls behind.
  - `open={isOpen()}` produces a non-modal dialog: no `::backdrop`, no inert background, not in the top layer, sometimes under sibling content.
- **Encoding:**
  - `<ui-dialog variant="modal|drawer|sheet">` wraps `<dialog>` and has no z-index prop.
  - The Solid adapter routes `open` to `showModal()` / `close()`, syncs state from the `close` event, and passes no `open` attribute through.
  - Overlays are never conditionally unmounted.
  - Diagnostics:
    - `overlay/not-top-layer` (warn): a `position:fixed` element with z-index > 0 that is neither `:popover-open` nor `:modal`, or a `role=dialog` element that is not a `<dialog>`.
    - `dialog/not-modal` (error, exact): `dialog[open]:not(:modal)` inside ui-dialog.
  - Invoker id integrity is owned by diagnostics; focus, naming and popover modes by semantics; enter and exit motion by media.

### F2 Ancestors silently capture fixed descendants and z-index · DIAGNOSTIC
- **Prefer** keeping anything that must escape its context in the top layer, putting transforms and filters on leaf visuals only, and writing no `position:fixed` in authored code, **over** fade or slide animations on page wrappers, a blurred sticky header that contains a dropdown, and fixed bars inside a container-query region.
- **P:** 2, 4, 7, N6 · **Detect:** runtime · **Merged:** S8
- **Agent failure:** each of these makes the ancestor the containing block for `position:fixed` descendants and creates a stacking context:
  - `transform`, `filter`, `backdrop-filter`, `perspective`;
  - `will-change: transform | filter`;
  - `contain: layout | paint`, and **`container-type`**.

  The fixed child is then clipped by that ancestor, and its z-index cannot beat anything outside. Library-specific risk: every region primitive with `container-type` does this.
- **Encoding:**
  - No `position:fixed` in the component API (top layer or sticky only), and lint warns on authored `position:fixed`.
  - Diagnostic `overlay/fixed-trapped` (error): a fixed element whose containing block is not the viewport. The check names the first ancestor with a trapping property, by component path.
  - SKILL.md lists the trapping properties in one line.
  - Glass and backdrop-filter are owned by color.

### F3 z-index is a closed set, with no negatives · CORE
- **Prefer** in-flow values `0` (base) and `1` (raised: sticky chrome and in-flow overlap), local `0–2` only inside a component that sets `isolation:isolate` because it owns an internal z-order, and the top layer for everything that floats, **over** literal 1000 / 9999 / 2147483647, negative z-index to tuck decoration behind a parent, and isolation on every primitive.
- **P:** 1, 5, 6 · **Detect:** both · **Merged:** S9 (+ contrarian "isolation everywhere breaks blend-mode")
- **Agent failure:**
  - A z-index arms race between the sticky header, dropdown and image badge.
  - A negative z-index slides behind an ancestor's opaque background and vanishes.
  - An unexpected stacking context (opacity < 1, filter, mix-blend-mode, will-change) makes 9999 lose to 2.
- **Encoding:**
  - Tokens are the only legal z-index values.
  - `z-index/untokened` (warn, static plus computed); negative values are always flagged.
  - A dev "why is this behind?" helper prints the stacking-context chain: which ancestor and which property.
  - The decoration channel opts out of isolation so blend modes work.
  - New relative to the seed: closed values, the ban on negatives, and isolation only where a component owns its z-order.

### F4 Top-layer order is open order: toasts under modals · CONTESTED
- **Prefer** a library-owned toaster that renders into the topmost open modal (every ui-dialog has a toast outlet), with tooltips and menus opened from a dialog kept as its DOM descendants, **over** raising z-index on toasts or expecting an earlier-opened popover to sit above a later modal.
- **P:** 3, 7, N4 · **Detect:** hard · **Merged:** S7
- **Agent failure:**
  - The top layer stacks in insertion order and ignores z-index.
  - A toast opened before `showModal()` sits under the backdrop.
  - A modal makes everything outside its subtree inert, so even a visible toast cannot be dismissed.
  - The agent raises z-index, which does nothing.
- **Encoding:**
  - ui-toaster watches dialog open and close events and targets the topmost modal's outlet.
  - Diagnostic `z-index/in-top-layer` (warn): z-index set on a `:popover-open` or `:modal` element.
  - SKILL.md: "overlay order is open order".
  - *Contested:* the raw case proposed re-promotion (`hidePopover()` + `showPopover()`), which restores visibility but not interactivity under modal inertness. The outlet approach needs every dialog to cooperate.

### F5 Anchor positioning with logical placement and per-instance anchors · CORE
- **Prefer** anchor positioning, with the anchor taken from the invoker or generated per instance, **over** `position:absolute; top:100%` in a relative wrapper, `getBoundingClientRect` math, and a hand-written `anchor-name:--menu` on a class that every row shares. The positioning properties:
  - `position-area` with logical values;
  - `position-try-fallbacks: flip-block, flip-inline`;
  - `position-visibility: anchors-visible`;
  - `anchor-size()` to match the trigger's width.
- **P:** 1, 2, 4, 5, N6 · **Detect:** both · **Merged:** S5, S6 · **Confidence:** medium
- **Agent failure:**
  - Absolute dropdowns are clipped by overflow ancestors, run off the edge on narrow screens, and keep floating after the anchor scrolls away.
  - In a 20-row table, every row's menu anchors to the last row that has the shared name, and the agent nudges pixels.
- **Encoding:**
  - `placement` is a closed enum (`block-start | block-end | inline-start | inline-end` × `start | center | end`) mapped to logical `position-area`, so it is RTL-safe.
  - Fallbacks are always on.
  - Anchor names are generated by a counter into an inline custom property, or come from the invoker implicitly (`anchor-scope` covers repeated items).
  - `@supports not (anchor-name: --a)` falls back to a small JS shim, or to a centered sheet on narrow screens. Check engine support before removing it.
  - Diagnostic `anchor/ambiguous` (warn, on open): more than one element in scope computes the popover's `position-anchor` name.
  - Reference integrity is owned by diagnostics.

### F6 Overlays are bounded by the viewport and scroll inside · CORE
- **Prefer** viewport-bounded overlays that scroll internally, **over** fixed-height modals, dialogs whose whole body scrolls actions away, and unbounded 50-item menus.
  - ui-dialog is a grid `auto minmax(0,1fr) auto` (header, ui-scroll-area body, footer) with `max-block-size: calc(100dvh - 2 * var(--ui-space-viewport-gutter))`.
  - Dialog sizes are closed: `sm | md | lg | fullscreen`, and narrow viewports get a bottom sheet.
  - ui-menu and ui-popover cap themselves with `min(var(--ui-popover-max), 100dvh - 2 * gutter)` and an inner ui-scroll-area.
- **P:** 1, 4, N3 · **Detect:** runtime · **Merged:** S12, S30
- **Agent failure:**
  - A tall form pushes its actions below the fold on mobile.
  - A country or timezone list runs off-screen and both flip placements fail.
  - The agent tests at desktop height with 3 items.
- **Encoding:**
  - Overlays have no height prop.
  - Never size top-layer content in `cqi`, which resolves against the DOM ancestor's container rather than the viewport.
  - Be careful with `%` in anchored elements: with `position-area` it resolves against the area cell.
  - Diagnostic `overlay/offscreen` (warn): on open, after fallbacks, the dialog or popover rect is not inside `visualViewport`.

## G. Nesting

### G1 Nesting hygiene · DIAGNOSTIC
- **Prefer** primitives with 2 or more children or one purposeful role (center, scroll, surface, frame, sticky), spacing owned by the nearest primitive, and surfaces that nest only when they look different, **over** 5–7 nested flex wrappers each adding padding, gap or alignment, a stack directly inside a same-axis stack, and padding inside padding inside padding.
- **P:** 2, 7 · **Detect:** runtime · **Merged:** L28 · **Confidence:** medium
- **Agent failure:**
  - Accumulated padding shrinks the mobile reading width to about 240px.
  - Alignment depends on which wrapper got `align-items`, so later edits land on the wrong layer and fixes don't stick.
- **Encoding:**
  - A nested ui-surface with the same tone defaults to `padding="flush"`.
  - Diagnostics (info):
    - `layout/single-child-primitive`, exempting single-role primitives;
    - `layout/redundant-nesting`;
    - `layout/inset-accumulation`: ancestor inline padding adds up to more than 15% of the container width;
    - `layout/depth`.
  - Thresholds need tuning. The card-soup and step-down rules are owned by fundamentals.

---

## H. Pointers to other sections

| Raw | Case | Owner | Layout hook kept here |
|---|---|---|---|
| L11 | Baselines for text pairs; 1lh box for icons beside wrapping text | typography, variation, fundamentals, media | `ui-cluster align="baseline"`; ui-icon sizes into a 1lh box |
| L24 | Visual order = DOM order (no `order`, `row-reverse`, `dense`) | semantics, fundamentals, diagnostics | No layout primitive has order, reverse or dense props; A6 side must match DOM order |
| L27 | Silent no-op layout declarations | diagnostics ("inactive CSS") | Typed props expose only the properties that take effect under each parent |
| L29 | Prose flow spacing via sibling selectors; gap + UA margins double up | typography, fundamentals, contrarian | The reset strips UA block margins outside ui-prose; `spacing/double` check |
| S4 | Popover modes auto / hint / manual per component | semantics | Each overlay hard-codes its mode; there is no `mode` prop |
| S10 | Enter and exit via `@starting-style` + `allow-discrete` | media-data-motion | Overlays are never unmounted (F1) |
| S25 | field-sizing, interpolate-size, details accordions | media-data-motion, semantics | n/a |
| S26 | Viewport meta, safe-area insets, interactive-widget, keyboard | variation, semantics | The composer sits in the shell's last row (D1) |
| S27 | Undefined or misspelled `ui-*` tags render inline; FOUC | llm-api, Host and delivery | Every ui-* gets its `display` from `:where()` CSS, never from JS |
| S28 | Overlay focus and naming: autofocus on the safe action, labelledby | semantics | The ui-dialog title slot generates `aria-labelledby` |
| S29 | Tooltips are supplementary, text-only, `popover=hint` | semantics | The tooltip slot is text-only |

## Contested

1. **F4 toast under modal.** Re-promoting the toast fixes visibility but not modal inertness. The topmost-modal outlet fixes both, but every dialog must cooperate. Undecided.
2. **C2 default `min-inline-size:0`.** It prevents 1fr blowout, but turns overflow into overlap or clipping unless an overflow owner is required. Proposed resolution: zero by default, plus `layout/overflow-unowned`, plus ui-table and ui-code self-wrapping.
3. **A6 canonical sidebar.** A container-query collapse (deterministic threshold; the container can't query itself, so collapse goes on the children) versus the query-free intrinsic flex sidebar (`flex-grow:999`, `min-inline-size:50%`). P6 requires picking one.
4. **A8 snap.** The layout explorer used `mandatory`, the sizing explorer `proximity`. Resolved as `mandatory` only when items are capped below the snapport; reviewers may disagree.
5. **F3 z-index tokens versus no z-index at all.** The contrarian basin argues that floaters belong in the top layer and isolation-everywhere breaks blend modes. Resolved as two in-flow values plus local isolation only for components with an internal z-order.
6. **F2 banning `position:fixed`.** Lint warning or error? There are legitimate fixed decoration layers.
7. **D3 `scrollbar-gutter: stable` on the root.** It gives an asymmetric gutter on centered layouts (`both-edges` is the trade-off) and does nothing in auto-height embeds.
8. **A9 naming and support.** `ui-columns` is proposed both for equal grid columns and for multicol. grid-lanes support should be verified before shipping `ui-masonry`.
9. **G1 nesting heuristics.** Useful, but they will fire on legitimate wrappers until thresholds are tuned.

## Best diagnostics in this section (signal over false positives)

**Exact or near-exact. Ship these as warn or error:**

`container/collapsed`, `dialog/not-modal`, `grid/implicit-track`, `align/unsafe-overflow`, `sticky/ineffective` (with condition and ancestor), `layout/horizontal-overflow` (culprit list), `overlay/fixed-trapped` (names the ancestor), `text/truncation-ineffective` (names the min-width:auto ancestor), `scroll/unconstrained`, `media/aspect-distorted`, `flex/wrap-space-between`, `layout/blockified-text`, `z-index/untokened` and `z-index/in-top-layer`, `anchor/ambiguous`, `overlay/offscreen`.

**Heuristic. Ship as info:**

`layout/unequal-peers`, `grid/content-in-tracks`, `layout/partial-wrap`, `cards/misaligned-regions`, `layout/pseudo-table`, `bar/off-center`, `size/inline-stretched`, `layout/resize-feedback`, and the G1 nesting set.

---

## Appendix A: merge map

| Kept | Raw cases |
|---|---|
| A1 | L1, L13 |
| A2 | L2 |
| A3 | L3 |
| A4 | L14 |
| A5 | L12 |
| A6 | L15 |
| A7 | L21 |
| A8 | L22, S23 |
| A9 | L23 |
| A10 | L19, L20 |
| B1 | L4, L5 (leaf half), L8 |
| B2 | L5 (row half) |
| B3 | L6 |
| B4 | L9 |
| B5 | L25 |
| C1 | L7, S11 |
| C2 | L10, S24 (layout half), S22 (overflow half) |
| C3 | S17, L16 (overflow half) |
| C4 | L18, S16 |
| D1 | L17, S13, S15, S26 (composer placement) |
| D2 | S14, L17 (% height half) |
| D3 | S15 (scroller half), S20, S21, S22 (wrapper half) |
| D4 | L26 |
| D5 | L30 |
| E1 | L16 (sticky half), S18, S19 |
| F1 | S1, S2, S3 |
| F2 | S8 |
| F3 | S9 |
| F4 | S7 |
| F5 | S5, S6 |
| F6 | S12, S30 |
| G1 | L28 |

## Appendix B: sub-claims dropped or corrected

| Source | Claim | Reason |
|---|---|---|
| L1 | `layout/unequal-peers` on any flex row | It fires on legitimate clusters. Narrowed to author-written flex outside primitives. |
| L13 | `grid/content-in-tracks` on any grid child | Cards with short text trigger it falsely. Narrowed to atom components. |
| L22 vs S23 | Snap `mandatory` by default vs `proximity` by default | Contradictory. Resolved in A8. |
| S7 | Re-promote the toast as the fix | Modal inertness still blocks interaction. Moved to F4 as contested. |
| S9 | Separate `raised` and `sticky` z tokens | Collapsed into one in-flow `raised` value. |
| S30 | `max-inline-size: calc(100cqi - 2*gutter)` on popovers | Wrong: cqi resolves against the DOM ancestor's container, not the viewport. |
| S17, L16 | `overflow-clip-margin` "so focus rings survive" | Support is incomplete. Use inset outline offsets instead. |
| L4 | `fill` via `width: stretch` | Not Baseline. Alignment stretch only, as the raw case itself concluded. |
| L23 | "Column-wrap flex containers never grow to fit" | Engine-dependent. The *avoid* stays; the claim is softened. |
| L16, S17 | `overflow-x:hidden` on body kills sticky | True for wrappers, or when both html and body set it. Body alone propagates to the viewport. Reworded. |
| S21 | Lint "overflow:auto without overscroll-behavior" | Subsumed by "overflow:auto outside ui-scroll-area". |
| S15 | `DOUBLE_SCROLLBAR` | Merged into `scroll/document-and-shell`. |
| L1, L23 | `ui-columns` for both grid columns and multicol | Naming collision. Flagged in §Contested. |
