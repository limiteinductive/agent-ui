# Vocabulary: canonical element, attribute and value names

**Decided 2026-11-20; round 2 applied and its proposals adopted the same day.** These are the eval's consensus picks from [`eval/name-guess`](../eval/name-guess/README.md): the pilot (1,030 calls) and round 2 (560 calls), both on 5 models. Layout primitives are covered separately in [layout-vocabulary.md](layout-vocabulary.md).

The rule is P4: the most common no-docs guess becomes canonical. Measured runner-ups become aliases. Aliases render normally, raise `UI-ALIAS` at warn level, and never appear in types or docs (`07 B10`, contested #2). Counts are written as hits/answers.

## Elements

| intent | canonical | aliases | evidence |
|---|---|---|---|
| centered max-width column | `ui-container` | — | 20/20, 5/5 models |
| box with a fixed aspect ratio | `ui-aspect-ratio` | `ui-frame` | 18/20 |
| alert / callout | `ui-alert` | `ui-callout` | 15/20 |
| button | `ui-button` | — | 20/20; native `<button>` is also styled |
| bounded panel / surface | `ui-card` | `ui-panel`, `ui-surface` | tied 5/5 on pure; `ui-card` 8/10 in context, `ui-surface` 2/20 |
| scroll region | `ui-scroll-area` | `ui-scroll` | 8/10 |
| relative time | `ui-relative-time` | — | 8/10 |
| formatted number | `ui-number` | `ui-num`, `ui-format-number`; `ui-currency` → `format="currency"` | tied 4/4 |
| divider | `ui-divider` | `ui-separator` | 9/10 |
| modal | `ui-dialog` | `ui-modal` | round 2: 9 vs 8 (pure `ui-modal` 8/10, context `ui-dialog` 7/10) |
| absolute date | `ui-date` | `ui-format-date` | round 2: 10/10 in context |
| absolute date + time | `ui-datetime` | `ui-time`, `ui-date-time` | round 2: 5/10 (Opus, Sonnet, GPT-5.6) |
| page root and app shell (merged) | `ui-page`, plus `layout="app"` for a shell | `ui-app`; `ui-layout`, `ui-shell`, `ui-app-shell` (these three imply `layout="app"`) | root: tied 4/4 with `ui-app`, `ui-layout` 2; shell: `ui-layout` 7/10 |
| metric / KPI | `ui-stat` | `ui-metric`, `ui-stat-card`, `ui-tile` | round 2: 16/20 |
| avatar | `ui-avatar` | — | round 2: 20/20 |
| heading | `ui-heading level="1-6"` | — | round 2, native allowed: 15/20 |
| styled text run | `ui-text` | — | 18/20 |
| data table | `ui-table` | `ui-data-table` | 18/20 |
| text input | `ui-input` | — | 15/20; pages 26 |
| on/off toggle | `ui-switch` | `ui-toggle` | 18/20 |
| checkbox | `ui-checkbox` | — | pages 23 |
| select | `ui-select` | — | pages 17 |
| *kept as-is* | `ui-stack`, `ui-grid`, `ui-prose`, `ui-icon`, `ui-badge`, `ui-skeleton`, `ui-field` | | 5/5 or 4/5 models; `ui-field` 10/10 in round 2 around a native input |

Notes on specific elements:

- **`ui-button`** is a form-associated custom element.
  - `ElementInternals` gives it `role=button`, focus, Enter and Space activation, `type` (default `button`), and submit/reset. Pages wrote `type="submit"` 19 times. Pending state uses `loading`, and disabled state uses `aria-disabled` (contested #15).
  - It needs JS for keyboard and focus, so if JS doesn't load, the CSS tripwire (`04 G2`) reports it.
  - A native `<button variant=…>` gets the same styles. The safe-default rules in `05 A1` apply to both.
- **`ui-container` is the breakout grid from `01 C4`.**
  - Its children sit in the content track by default, and a child with `bleed="wide|full"` escapes it.
  - `ui-page` is the document root (`05 B4` landmarks and skip link, `04` embed mode). Round 2 measured it as tied with `ui-app`, and agents volunteered `skip-link`.
- **`ui-aspect-ratio`** covers the ratio mode of the `01 D5` frame. Fixed block-size slots (charts, embeds) were not measured.
- **`ui-date` and `ui-datetime` are presets of one absolute formatter** (`02`), never aliases of `ui-relative-time`.
  - The pilot's `ui-date` hits for relative time came from a paraphrase that actually described absolute formatting.
  - Attributes: `value` plus Intl's `date-style`/`time-style`; `format="short|medium|long"` is an alias of `date-style`.
  - `ui-time` is an alias of `ui-datetime`; a time-only display is `ui-datetime date-style="none"`.
- **`ui-dialog`** mirrors native `<dialog>`: agents volunteered `open` and `modal`. It renders in the top layer (`F1`), and `tone="overlay"` applies automatically.
- **`ui-page` absorbs the app shell (`01 D1`).** It already has named slots for header, nav, main and footer.
  - The default, `layout="document"`, uses `min-block-size:100svh`, and the document scrolls.
  - `layout="app"` adds `block-size:100dvh`, rows `auto minmax(0,1fr) auto`, and a `ui-scroll-area` main.
  - `ui-layout`, `ui-shell` and `ui-app-shell` are aliases that imply `layout="app"`. The `layout` attribute name was not measured.
  - A nested `ui-page` raises `UI-NESTED-ROOT` (error). This catches agents who write a `ui-layout` shell inside a `ui-page` root.
- **`ui-stat`** takes `label`, `value`, `change` and `trend="up|down|flat"`, which is the exact shape agents wrote. `ui-avatar` takes `src`, `alt` and `size`.
- **`ui-card` carries the surface mechanism from `03 A1`.** It re-declares inks, borders, focus and scheme for its subtree. See [Surfaces](#surfaces-and-color).

## Attributes

| intent | canonical | aliases | evidence |
|---|---|---|---|
| inner spacing | `padding` | `pad` | 10/10 |
| pending / async | `loading` | `busy`, `pending` | 10/10 |
| corner radius | `rounded` (presence = `md`, or `rounded="sm\|lg\|full"`) | `radius` | 7 vs 3; pill = `full` 9/10 |
| component meaning / emphasis | `variant` | `tone`, `intent`, `color` on components | 41/60; `tone` 0/60 |
| text and icon ink | `color` | `tone`; on text also `variant`, presence `muted`/`subtle` | Claude pages: 44 vs 31 |
| line clamp | `max-lines` | `lines`, `line-clamp`, `clamp` | 4 / 4 / 2 |
| reading measure (`ui-prose`) | `width="narrow\|normal\|wide"` | presence `narrow` | 5 / 5 |
| grid item minimum | `min-item-width` | `min`, `min-width`, `min-column-width` | 6/10 |
| unchanged | `gap`, `align`, `justify`, `truncate`, `ratio="16:9"`, icon `name` | | ≥8/10 |
| number format | `value` + `format="currency\|percent\|compact"` + `currency="USD"` | | 8/10 |

`max-lines` wins the tie because `lines` is ambiguous: a skeleton would read it as a line count.

## Values

| axis | canonical set | aliases | evidence |
|---|---|---|---|
| scale (gap, padding, size, radius) | `0 \| xs \| sm \| md \| lg \| xl \| 2xl` | `none`→`0`, `small\|medium\|large`→`sm\|md\|lg`, `xxl`→`2xl` | none → `0` 8/10; `2xl` (Claude) vs `xxl` (GPT) |
| radius extra | `full` | `pill`, `round` | 9/10 |
| meaning (`variant` on badge, alert, card; `color` on text, icon) | `neutral \| primary \| success \| warning \| danger \| info` | `accent`→`primary`, `error\|critical`→`danger`, `caution`→`warning`, `positive`→`success` | `primary` 10/10, `accent` 0 |
| button emphasis (`variant` on `ui-button`) | `primary \| secondary \| outline \| ghost \| danger` | `destructive`→`danger` | 29/30; pages also wrote `outline` and `danger` |
| ink role (`color` on text) | `muted \| subtle` plus the meaning set | `muted`, `variant="muted\|secondary"`, `tone="muted"` → `color="muted"` | split. Pilot pages: `color="muted"` 32, `variant="secondary"` 21, `tone="muted"` 20. Round 2 isolated: presence `muted` 6, `variant="muted"` 4, `color="muted"` 2. Round 2 pages: `variant="muted"` 11. `color` keeps the largest single count (34). |

## Surfaces and color

The model in section 03 survives, but its spelling changes:

| old (section 03) | new |
|---|---|
| `<ui-surface tone="raised">` | `<ui-card elevated>` (9/10) |
| `tone="sunken"` | `<ui-card sunken>`; `variant="sunken"` (5/10) is an alias |
| `tone="inverse"` | `inverse` presence attribute (not measured) |
| `tone="overlay"` | automatic on `ui-dialog` and `ui-popover` (`03 B5`); never written |
| `tone="accent"` / `intent-*` | `variant="primary\|success\|…"` |
| `<ui-text tone="muted">` | `<ui-text color="muted">` |
| intents `{neutral, accent, info, positive, caution, critical}` | `{neutral, primary, success, warning, danger, info}` |
| theme seed `<ui-theme accent=…>` | `<ui-theme primary=…>` (renamed for consistency; not measured) |

Two consequences:

- **`elevated`, `sunken` and `inverse` are mutually exclusive.** Setting two of them raises `UI-CONFLICT`.
- **The theme matrix (`03 C4`) enumerates the same space** under the new names: levels × inks × meanings × states × schemes. "Accent budget" stays the name of the *concept* (`06`); it just counts `primary`.

**P4 tension:** `variant` carries meaning on badges and emphasis on buttons, which bends "meaning and appearance on separate axes". Agents wrote `variant` for both (70/90), so splitting the axes would cost guessability on every component. The per-element closed sets keep it checkable: `variant="ghost"` on a badge is `UI-BAD-VALUE`.

## Round 2 decisions (adopted 2026-11-20)

**Invented elements persist even when native HTML is allowed.** Round 2 told models that "ordinary HTML elements are styled automatically", and they still wrote `ui-*` for most concepts:

| concept | native share | what agents wrote |
|---|---|---|
| heading | 20% | `<ui-heading level="2">` 15/20. Only GPT-6.2 wrote `<h2>`. |
| muted text | 10% | `ui-text` 18/20 |
| table | 5% | `ui-table` 18/20, often with `columns="a,b,c"` or `striped` |
| text input | 20% | `ui-input` 15/20 (`type`, `name`, `label`, `required`) |
| toggle | 0% | `ui-switch` 18/20 (`name`, `checked`, `label`) |
| button | 0% | `ui-button` 20/20 |
| link | 35% | `ui-link` 13/20 |
| list | 35% | `ui-list` 5/20, plus domain names (`ui-feature-list`) |

In the two native pages, 54% of elements were `ui-*`. The most common invented elements were `ui-input` 26, `ui-heading` 25, `ui-stat` 24, `ui-switch` 23, `ui-checkbox` 23, `ui-menu-item` 22, `ui-text` 17 and `ui-select` 17. GPT-6.2 leaned most native.

**Decided: ship thin wrappers for every concept at or above 80%** (P4).
- Each wrapper renders the native semantics, so styling and behavior stay native-equivalent. Native elements stay fully styled either way.
- `ui-heading` sets `role=heading` and `aria-level` from `level`.
- `ui-text` is a styled inline/block run (`color`, `size`, `weight`, `max-lines`); its `as` attribute picks `p`/`span`/`small` semantics.
- `ui-input`, `ui-switch`, `ui-checkbox` and `ui-select` are form-associated (`ElementInternals`), like `ui-button`. They take `name`, `value`/`checked`, `required`, `disabled` and an optional `label` that renders a real `<label>`. `ui-switch` uses `role=switch`.
- `ui-table` styles a native `<table>` child. Without one, it falls back to ARIA table roles on `ui-table-row`/`ui-table-cell`. Its `columns="a,b,c"` header shorthand (written 6/20) is a later feature, not v1.
- **`ui-link` and `ui-list` (65%) are not shipped.** They render as plain inline/block boxes and raise `UI-PREFER-NATIVE` (warn), whose fix is `<a href>` or `<ul>`. Native wins here because the concept *is* the native element, with nothing for a wrapper to add.

**Decided: the page root and the app shell are one element, `ui-page`.** See the note under [Elements](#elements).

**Overlap** is `ui-overlay` (alias `ui-layers`); see [layout-vocabulary](layout-vocabulary.md#round-2-decisions-adopted-2026-11-20).

**Also seen in round 2:** `tone` came back in native pages (20 uses, `tone="success"` 12) despite 0/60 in the pilot's attribute probes. It stays an alias of `variant`. `gap="medium"` 12 vs `md` 14 shows that both spellings must keep working.
