---
name: agent-ui
description: Build web pages and artifacts with agent-ui 0.1.0, a CSS-first set of <ui-*> layout elements plus diagnostics that report layout and markup mistakes with exact fixes. Use when writing HTML that loads agent-ui.js.
---

# agent-ui 0.1.0

One tag gives you the stylesheet, the elements, and the diagnostics:

```html
<script src="https://cdn.jsdelivr.net/npm/@agent-ui/core@0.1.0/dist/agent-ui.js"></script>
```

## How to write a page

- **Native HTML is already styled.** Write `<h1>`–`<h6>`, `<p>`, `<a href>`, `<ul>`, `<table>`, `<form>`, `<label>Name <input name="n"></label>`, `<select>`, `<textarea>`, `<dialog>`, `<hr>`, `<code>`. Do not wrap them in ui-* elements.
- **Layout is ui-* elements.** `ui-stack` = vertical with gaps. `ui-row` = one horizontal line. `ui-grid` = equal tiles that reflow. `ui-overlay` = children stacked on top of each other. `ui-container` = centered max-width column. `ui-page` = the page root.
- **Rows don't wrap unless asked.** For a row that may not fit, choose: `wrap` (tags, chips, buttons), `scroll` (a horizontal rail), or `stack-below="40rem"` (side by side when wide, stacked when narrow).
- **Side + main** is `<ui-row wrap>` with `grow` on the main child, not a grid track list.
- **Card grids**: `<ui-grid max-columns="3">` caps at 3 and drops columns on small screens. `columns="3"` means exactly 3 at every width (calendars).
- **Spacing** is a token: `0 xs sm md lg xl 2xl`. Never put margins between ui-* children; use `gap`.
- **Color** comes from the theme (light and dark automatically). `<html data-scheme="dark">` forces a scheme; a card can flip with `inverse`.

```html
<ui-page>
  <header><ui-row justify="space-between"><strong>Acme</strong><nav><a href="#">Docs</a></nav></ui-row></header>
  <main>
    <ui-container>
      <ui-stack gap="lg">
        <h1>Plans</h1>
        <ui-grid max-columns="3">
          <ui-card><h3>Free</h3><p>For trying it out.</p><ui-button>Start</ui-button></ui-card>
          <ui-card elevated><h3>Pro</h3><p>For teams.</p><ui-button variant="primary">Buy</ui-button></ui-card>
        </ui-grid>
      </ui-stack>
    </ui-container>
  </main>
</ui-page>
```

## In React, Solid or Vue

No adapter: render the tags directly. For typed attributes, element properties and editor completion:

```ts
import '@agent-ui/core';                    // registers the elements and injects the CSS
import type {} from '@agent-ui/core/react'; // or /solid, /vue
```

- **Booleans just work on ui-* elements**: `elevated={on}` writes the bare attribute or removes it, and `="false"` also means off. The exception is `disabled` written as plain HTML: like on a native `<button>`, `disabled="false"` is still disabled.
- **React**: on native elements React drops boolean values, so write child attributes as strings: `<main grow="">`, `grow={isMain ? '' : undefined}`.
- **Vue**: set `compilerOptions.isCustomElement: (tag) => tag.startsWith('ui-')`, and write attribute names in kebab-case (`stack-below`, not `stackBelow`).
- Every attribute is also a property: `el.stackBelow = '40rem'`, `el.elevated = false`.

## Elements

### ui-stack

Vertical flow with consistent gaps. `direction="horizontal"` makes it exactly a `ui-row`.

| attribute | values | default | |
|---|---|---|---|
| `gap` | `0` · `xs` · `sm` · `md` · `lg` · `xl` · `2xl` | `md` | Space between children. |
| `align` | `start` · `center` · `end` · `stretch` · `baseline` | `stretch` | Cross-axis alignment of children. |
| `justify` | `start` · `center` · `end` · `space-between` | `start` | Main-axis distribution. `space-between` with 2 children pushes them apart; with 3 it gives start / true center / end. |
| `padding` | `0` · `xs` · `sm` · `md` · `lg` · `xl` · `2xl` | `0` | Inner spacing. |
| `direction` | `vertical` · `horizontal` | `vertical` | `horizontal` = `ui-row` (all row attributes apply). |
| `wrap` | (bare) · `="false"` |  | Children wrap onto new lines (tags, chips, button groups). Off by default. (horizontal only) |
| `scroll` | (bare) · `="false"` |  | Horizontal rail: one line that scrolls, with snap. Pair with `item-width` for card carousels. (horizontal only) |
| `equal` | (bare) · `="false"` |  | Children share the row equally (`flex: 1 1 0`). (horizontal only) |
| `stack-below` | `xs` · `sm` · `md` · `lg` · `xl` · `2xl` · any CSS length | bare = `md` | All-or-nothing switch: below this container width every child stacks; above it they share one line equally. (horizontal only) |
| `limit` | 2–6 |  | With `stack-below`: stack anyway when there are more than N children. (horizontal only) |
| `item-width` | `xs` · `sm` · `md` · `lg` · `xl` · `2xl` · any CSS length |  | With `scroll`: width of each item (capped at 85% of the rail). (horizontal only) |

Mutually exclusive: `scroll` / `wrap`; `scroll` / `stack-below`.

Children may carry: `grow`.

### ui-row

Horizontal line of children. Content-sized, no wrap, vertically centered by default.

| attribute | values | default | |
|---|---|---|---|
| `gap` | `0` · `xs` · `sm` · `md` · `lg` · `xl` · `2xl` | `md` | Space between children. |
| `align` | `start` · `center` · `end` · `stretch` · `baseline` | `center` | Cross-axis alignment of children. |
| `justify` | `start` · `center` · `end` · `space-between` | `start` | Main-axis distribution. `space-between` with 2 children pushes them apart; with 3 it gives start / true center / end. |
| `padding` | `0` · `xs` · `sm` · `md` · `lg` · `xl` · `2xl` | `0` | Inner spacing. |
| `wrap` | (bare) · `="false"` |  | Children wrap onto new lines (tags, chips, button groups). Off by default. |
| `scroll` | (bare) · `="false"` |  | Horizontal rail: one line that scrolls, with snap. Pair with `item-width` for card carousels. |
| `equal` | (bare) · `="false"` |  | Children share the row equally (`flex: 1 1 0`). |
| `stack-below` | `xs` · `sm` · `md` · `lg` · `xl` · `2xl` · any CSS length | bare = `md` | All-or-nothing switch: below this container width every child stacks; above it they share one line equally. |
| `limit` | 2–6 |  | With `stack-below`: stack anyway when there are more than N children. |
| `item-width` | `xs` · `sm` · `md` · `lg` · `xl` · `2xl` · any CSS length |  | With `scroll`: width of each item (capped at 85% of the rail). |

Mutually exclusive: `scroll` / `wrap`; `scroll` / `stack-below`.

Children may carry: `grow`.

### ui-grid

Equal tiles that reflow: as many columns as fit `min-item-width`. `columns` = exact count, `max-columns` = responsive cap.

| attribute | values | default | |
|---|---|---|---|
| `gap` | `0` · `xs` · `sm` · `md` · `lg` · `xl` · `2xl` | `md` | Space between children. |
| `padding` | `0` · `xs` · `sm` · `md` · `lg` · `xl` · `2xl` | `0` | Inner spacing. |
| `min-item-width` | `xs` · `sm` · `md` · `lg` · `xl` · `2xl` · any CSS length | `md` | Smallest a tile may get before the grid drops a column. |
| `columns` | 1–12 |  | Exact column count at every width (calendars, fixed tables). |
| `max-columns` | 1–12 |  | Responsive: at most N columns, fewer when tiles would drop below `min-item-width`. |

Mutually exclusive: `columns` / `max-columns`.

### ui-overlay

Children share one cell; later children paint on top (badge on image, caption over media).

| attribute | values | default | |
|---|---|---|---|
| `align` | `start` · `center` · `end` · `stretch` | `stretch` | Vertical placement of children. |
| `justify` | `start` · `center` · `end` · `stretch` | `stretch` | Horizontal placement of children. |

### ui-card

Bounded surface. Owns its ink, borders and focus color for everything inside.

| attribute | values | default | |
|---|---|---|---|
| `padding` | `0` · `xs` · `sm` · `md` · `lg` · `xl` · `2xl` | `lg` | Inner spacing. |
| `gap` | `0` · `xs` · `sm` · `md` · `lg` · `xl` · `2xl` | `md` | Space between children. |
| `rounded` | `0` · `sm` · `md` · `lg` · `xl` · `full` | bare = `md` | Corner radius. |
| `elevated` | (bare) · `="false"` |  | Raised above the page (shadow). |
| `sunken` | (bare) · `="false"` |  | Recessed below the page. |
| `inverse` | (bare) · `="false"` |  | Opposite color scheme (dark card on a light page). |
| `variant` | `neutral` · `primary` · `success` · `warning` · `danger` · `info` |  | Meaning: tints the surface. |

Mutually exclusive: `elevated` / `sunken` / `inverse`.

Children may carry: `grow`.

### ui-button

Button. Form-associated: `type="submit"` submits its form. Default `type="button"`.

| attribute | values | default | |
|---|---|---|---|
| `variant` | `primary` · `secondary` · `outline` · `ghost` · `danger` | `secondary` | Emphasis. |
| `size` | `sm` · `md` · `lg` | `md` | Height and padding. |
| `type` | `button` · `submit` · `reset` | `button` | Form behavior. |
| `loading` | (bare) · `="false"` |  | Pending: shows a spinner and ignores clicks. |
| `disabled` | (bare) |  | Disabled (stays focusable, announced as disabled). |
| `rounded` | `0` · `sm` · `md` · `lg` · `full` | bare = `full` | Corner radius; bare `rounded` = pill. |
| `name` | text |  | Form field name. |
| `value` | text |  | Form field value. |

### ui-page

Page root. `layout="document"` (default) scrolls the document; `layout="app"` is a full-height shell placed by tag: `<header>` on top, `<nav>` at the start side, `<aside>` at the end side, `<footer>` at the bottom, and one other child (usually `<main>`) as the main region, which scrolls. Each region takes one child: wrap the main content in a single `<main>`.

| attribute | values | default | |
|---|---|---|---|
| `layout` | `document` · `app` | `document` | Document flow or app shell. |

### ui-container

Centered max-width column with gutters. Children may break out with `bleed="wide|full"`.

| attribute | values | default | |
|---|---|---|---|
| `size` | `sm` · `md` · `lg` · `xl` · `full` | `lg` | Content width. |

Children may carry: `bleed`.

## Child attributes

Written on a child, read by its parent.

| attribute | values | on children of | |
|---|---|---|---|
| `grow` | (bare) · `="false"` | `ui-stack`, `ui-row`, `ui-card` | This child takes the leftover space. In a wrapping row it becomes the main column of a side + main layout. |
| `bleed` | `wide` · `full` | `ui-container` | Escape the container measure: `wide` or edge-to-edge `full`. |

## Use the native element

- not `<ui-link>`: write `<a href="…">`
- not `<ui-list>`: write `<ul> or <ol>`
- not `<ui-list-item>`: write `<li>`

## Not in 0.1.0 yet

Write the native equivalent today.

| planned | write today |
|---|---|
| `<ui-heading>` | `<h1>…<h6> (styled automatically)` |
| `<ui-text>` | `<p> or <span>; <small> for fine print` |
| `<ui-table>` | `<table> with <thead>/<tbody> (styled automatically)` |
| `<ui-input>` | `<label>Label <input name="…"></label>` |
| `<ui-switch>` | `<input type="checkbox" role="switch">` |
| `<ui-checkbox>` | `<input type="checkbox">` |
| `<ui-select>` | `<select>` |
| `<ui-field>` | `<label> wrapping the control` |
| `<ui-dialog>` | `<dialog>` |
| `<ui-alert>` | `<ui-card variant="warning\|danger\|info\|success" role="status">` |
| `<ui-divider>` | `<hr>` |
| `<ui-badge>` | `<span> (or <mark>)` |
| `<ui-icon>` | `inline <svg>` |
| `<ui-prose>` | `plain <div> (native text is styled)` |
| `<ui-aspect-ratio>` | `<div style="aspect-ratio: 16 / 9">` |
| `<ui-scroll-area>` | `<div style="overflow: auto">` |
| `<ui-relative-time>` | `<time datetime="…">` |
| `<ui-date>` | `<time datetime="…">` |
| `<ui-datetime>` | `<time datetime="…">` |
| `<ui-number>` | `the formatted number as text` |
| `<ui-stat>` | `<ui-card> with <ui-stack gap="xs"> (label, value, change)` |
| `<ui-avatar>` | `<img alt="…">` |
| `<ui-skeleton>` | `nothing (render the content)` |

## Tokens

- **space**: `0` 0 · `xs` 0.25rem · `sm` 0.5rem · `md` 1rem · `lg` 1.5rem · `xl` 2rem · `2xl` 3rem
- **item**: `xs` 8rem · `sm` 12rem · `md` 16rem · `lg` 20rem · `xl` 24rem · `2xl` 30rem
- **measure**: `xs` 20rem · `sm` 30rem · `md` 40rem · `lg` 50rem · `xl` 60rem · `2xl` 72rem
- **container**: `sm` 40rem · `md` 56rem · `lg` 72rem · `xl` 90rem · `full` 100%
- **radius**: `0` 0 · `sm` 0.25rem · `md` 0.5rem · `lg` 0.75rem · `xl` 1rem · `full` 999px

CSS custom properties: `--ui-space-*`, `--ui-radius-*`, `--ui-canvas`, `--ui-surface`, `--ui-ink`, `--ui-ink-muted`, `--ui-primary`, `--ui-danger`, … (light and dark through `light-dark()`).

## Diagnostics

After the page settles (fonts, images, one frame), agent-ui checks the markup and the measured layout, then reports on every channel:

- **console**: a `[ui-diag]` summary line, then one line per problem: `CODE got on <tag as written> (path) — cause; allowed …; fix: …; SKILL.md#code`.
- **`await window.__uiReady`** resolves to the report; `window.__ui.report` is the latest, `window.__ui.check()` re-runs it.
- **`<script type="application/json" id="ui-diagnostics">`** holds the same report as JSON.
- **`data-ui-diag="CODE"`** marks each offending element; `<html data-ui-debug>` outlines them and opens a panel.

It re-checks on DOM changes and resizes, and the summary says what changed since the last check (`3 fixed, 0 new, 1 remain`), including across reloads in the same tab.

**Contract:** errors must reach 0. Warnings deserve a look. Info never blocks.
A deliberate deviation is written down, not hidden: `data-ui-allow="row/overflow"` on the element (or an ancestor) moves matching diagnostics to the `allowed` count.
`<html data-ui-diagnostics="quiet">` keeps the report but skips the console; `="off"` disables checks.

### Codes

<a id="ui-unknown-element"></a>
#### UI-UNKNOWN-ELEMENT · error

**Unknown ui-* element.** The tag is not in this build, so it renders as an unstyled inline box. The fix names the closest element; for vocabulary that is planned but not shipped yet, it names the native element to write today.

`<ui-hstack>` → `<ui-row>`

<a id="ui-alias"></a>
#### UI-ALIAS · warn

**Alias spelling.** Renders exactly like the canonical spelling. Rename it so the page matches the reference.

`<ui-panel padding="large">` → `<ui-card padding="lg">`

<a id="ui-prefer-native"></a>
#### UI-PREFER-NATIVE · warn

**Use the native element.** The native element already has the semantics, keyboard behavior and styling. The ui- version renders as a plain box and loses them.

`<ui-link href="/docs">` → `<a href="/docs">`

<a id="ui-unknown-attr"></a>
#### UI-UNKNOWN-ATTR · error

**Unknown attribute.** The attribute does nothing on this element. The fix names the closest attribute; the cause says which elements do have it.

`<ui-row spacing="md">` → `<ui-row gap="md">`

<a id="ui-bad-value"></a>
#### UI-BAD-VALUE · error

**Value not allowed.** The value is not one this attribute accepts, so the attribute falls back to its default. Numbers on a scale map to the nearest token; unitless lengths need a unit.

`<ui-stack gap="4">` → `<ui-stack gap="md">`

<a id="ui-conflict"></a>
#### UI-CONFLICT · error

**Conflicting attributes.** The attributes are mutually exclusive (or one attribute is written twice with different values). Keep one.

`<ui-row wrap scroll>` → `<ui-row scroll>`

<a id="ui-misplaced-attr"></a>
#### UI-MISPLACED-ATTR · error

**Attribute in the wrong place.** Row attributes (wrap, scroll, equal, stack-below, limit, item-width) only work on ui-row or ui-stack direction="horizontal" (error). Child attributes (grow, bleed) only work on direct children of the element that reads them (warn).

`<ui-stack wrap>` → `<ui-row wrap>`

<a id="ui-nested-root"></a>
#### UI-NESTED-ROOT · error

**ui-page inside ui-page.** A page has one root. Use ui-container, ui-stack or ui-card for inner regions.

<a id="row-space-between-many"></a>
#### row/space-between-many · info

**space-between with 4+ children.** With four or more children, space-between makes the gaps depend on content widths. For a toolbar use gap (and grow on the flexible child); for equal tiles use ui-grid.

<a id="row-overflow"></a>
#### row/overflow · warn

**Row content does not fit.** A row is one line and does not wrap unless asked. Its children are wider than the row at this viewport. Pick the behavior: wrap onto new lines, scroll as a rail, or stack-below a width. A row that already wraps is reported when one child is wider than the row even on a line of its own (unbreakable text, a fixed width); the diagnostic names it.

`<ui-row> (8 tags)` → `<ui-row wrap>`

<a id="grid-cramped"></a>
#### grid/cramped · warn

**Exact columns are too narrow.** columns="N" keeps N columns at every width, so tiles get squeezed on small screens. max-columns="N" caps at N and drops columns when tiles would fall below min-item-width. Also reported when a tile box (padding, a fixed width) is wider than its track and covers its neighbor; if the count must stay (a calendar), make the tiles fit.

`<ui-grid columns="4">` → `<ui-grid max-columns="4">`

<a id="layout-horizontal-overflow"></a>
#### layout/horizontal-overflow · error

**Page scrolls sideways.** The document is wider than the viewport, or, in <ui-page layout="app">, a region scrolls sideways or the shell cuts content off. The diagnostic points at the element that breaks out of a parent that fits and names the widest thing inside it; other clipping or scrolling containers are left alone.

<a id="page-shared-area"></a>
#### page/shared-area · error

**Two children in one app-shell region.** In <ui-page layout="app">, header, nav, aside and footer each take a region, and every other child goes in main. Children that land in the same region are drawn on top of each other. Wrap the main content in one <main>, put a sidebar in <nav> (start side) or <aside> (end side), and merge duplicate landmarks.

`<ui-page layout="app"><header>…</header><ui-stack>filters</ui-stack><ui-container>…</ui-container>` → `<ui-page layout="app"><header>…</header><nav>filters</nav><main>…</main>`

<a id="ui-runtime-error"></a>
#### UI-RUNTIME-ERROR · error

**Uncaught script error.** An uncaught exception or unhandled promise rejection. The page may be partly rendered.

<a id="ui-resource-failed"></a>
#### UI-RESOURCE-FAILED · error

**Resource failed to load.** A script, stylesheet, image, font or media file failed to load or was blocked by Content-Security-Policy. Images and fonts are warnings; scripts and stylesheets are errors.

<a id="ui-css-missing"></a>
#### UI-CSS-MISSING · error

**Stylesheet not applied.** agent-ui.js ran but its styles are not in effect, so every ui-* element is unstyled.

<a id="ui-version-skew"></a>
#### UI-VERSION-SKEW · error

**Mixed versions.** The stylesheet and the script (or two scripts) are different versions. Load one version of both.

<a id="ui-duplicate"></a>
#### UI-DUPLICATE · warn

**Loaded twice.** agent-ui.js was loaded more than once. The second copy did nothing; remove it.
