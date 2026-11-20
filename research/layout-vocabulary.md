# Layout vocabulary: row/stack + modifiers

**Decided 2026-11-20. Spellings re-measured in round 2 the same day, and its five proposals adopted.** Evidence comes from the name-guess eval in [`eval/name-guess`](../eval/name-guess/README.md): the pilot (1,030 calls) and round 2 (560 calls, element given), both on 5 models.

Agents read intent names (cluster, split, switcher, reel, bar) correctly 100% of the time but wrote them about 0% of the time. Instead, they wrote `ui-row`, or `ui-stack direction="horizontal"` plus `wrap`/`justify`/`scroll`.

The library therefore keeps **two 1-D primitives and `ui-grid`**, and intent moves into **modifiers**. Each modifier compiles to the mechanism that `01 A1–A8` chose, so only the names change; the size-ownership behavior stays the same. This supersedes the naming in the catalog's "grid over flex" verdict and in `01 A1`.

## Elements

| element | axis | attributes | default |
|---|---|---|---|
| `ui-stack` | vertical | `gap`, `align` | `align="stretch"` |
| `ui-row` | horizontal | `gap`, `align`, `justify`, `wrap`, `scroll`, `equal`, `stack-below`, `limit`, `item-width` | content-sized, no wrap, `align="center"` |
| `ui-grid` | 2-D, equal peers | `gap`, `min-item-width`, `columns`, `max-columns` | auto-fill, `min-item-width="md"` |
| `ui-overlay` | z-axis | `align`, `justify` | every child shares one grid cell (`grid-area:1/1`), stretched; later children paint on top |

The child attribute `grow` marks the one child that takes the leftover space (`01 B4`).

**`ui-stack direction="horizontal"` is an exact equivalent of `ui-row`.** It is not an alias and raises no diagnostic. All row modifiers apply to it. Agents write it for most horizontal containers in pages (9 of 9 in round 2, 14 of 15 in the pilot), so warning on it would fire on almost every page. Docs lead with `ui-row` and state the equivalence once.

`ui-row` does not wrap by default. Agents add `wrap` when they want it (21 volunteered uses; 10/10 with the element given). In round 2, 7 of 10 readers expected an unmodified row to stay on one line when narrow. `row/overflow` catches the case where wrapping was needed but left out.

## Intent → what to write

| intent | write | compiles to | replaces |
|---|---|---|---|
| vertical flow | `<ui-stack>` | column flow, `align-content:start` (`B2`) | — |
| group that wraps (tags, chips, buttons) | `<ui-row wrap>` | content-sized `flex-wrap` | `ui-cluster` |
| two groups pushed apart | `<ui-row justify="space-between">`, 2 children | last child gets `margin-inline-start:auto`; never real `space-between` (`A5`) | `ui-split` |
| start / center / end bar | the same row with 3 children | grid `minmax(0,1fr) auto minmax(0,1fr)` for a true center (`A5`) | `ui-bar` |
| horizontal rail or carousel | `<ui-row scroll item-width="md">` | grid `auto-flow:column` with snap and an 85% cap (`A8`), plus the scroll contract (`D3`) | `ui-reel` |
| equal-width children in one line | `<ui-row equal>` | `flex: 1 1 0` with `min-inline-size:0` | — |
| all-or-nothing row↔column | `<ui-row stack-below="40rem">`, optional `limit="4"` | query-free `flex-basis` switch (`A4`); children share the row equally, so `equal` is implied | `ui-switcher` |
| side + main | `<ui-row wrap>` with `grow` on main | intrinsic sidebar: main `flex-grow:999` with a content minimum (`A6`) | `ui-sidebar`; this resolves contested #6 toward the intrinsic version |
| equal tiles, responsive | `<ui-grid min-item-width="md">`, or `max-columns="4"` to cap them | auto-fill with a 100% guard (`A2`) | — |
| exact column count (calendar, fixed table-like grid) | `<ui-grid columns="7">` | `repeat(7, minmax(0,1fr))` | — |
| children in the same spot (badge on image, caption over media) | `<ui-overlay>` | single-cell grid; local z-order uses `01` stacking values `0–1` | `ui-layers` |

The `justify="space-between"` branches select on child count with `:has(> :nth-child(n):last-child)` and need no JS.

`stack-below` takes a length or a scale token (`md`).

**`columns` is exact, and `max-columns` is the responsive cap.** This reverses the earlier rule, which honored `columns` as a maximum. Round 2 showed agents write and read `columns` as an exact count:
- A calendar got `columns="7"` 10/10.
- For `<ui-grid columns="4">` at 360px, 6 of 10 readers expected 4 columns, and 2 expected fewer.
- Asked for a cap, writers wrote `max-columns` or `columns` + `responsive`.

The count-prop trap from insight 8 is now caught at runtime by `grid/cramped`, rather than prevented by construction.

**True center: write-side and read-side intents differ.** Writers asked for a centered middle item wrote `justify="space-between"` (9/10). Readers shown that markup expected it to land off-center (8/10), which is the real CSS behavior. The true-center rendering matches what writers intend, and a reader's surprise only goes in a harmless direction. Keep it.

## Aliases

Aliases render normally and emit `UI-ALIAS` at warn level (`07 B10`, contested #2). They are never documented.

| written | means |
|---|---|
| `ui-stack horizontal`, `ui-stack direction="row"` | `ui-stack direction="horizontal"`, which is `ui-row`. Round 2 with the element given: `direction="horizontal"` 5, presence `horizontal` 4, `direction="row"` 1. |
| `direction="vertical\|column"` on `ui-stack` | no-op |
| `justify="between"`, `"flex-end"`, `"flex-start"` | `space-between`, `end`, `start` |
| `align="left\|right"` on `ui-row`/`ui-stack` | `start` / `end` |
| `scrollable`, `scroll="x\|horizontal"`, `overflow="scroll\|auto"` | `scroll` |
| `threshold`, `breakpoint`, `collapse-at`, `stack-at`, `wrap-below`, `collapse` | `stack-below` |
| `equal-width` | `equal` |
| `max-items` | `limit` |
| `card-width` | `item-width` |
| `columns="N" responsive`, `columns-sm`/`-md` sets on `ui-grid` | `max-columns="N"` |
| `ui-layers` | `ui-overlay` |
| `gap="small\|medium\|large"` | `sm` / `md` / `lg` |

`columns` given as a track list (for example `"1fr 280px"`, 4 uses) is `UI-BAD-VALUE`, and its fix points to the side + main row.

## Presence-boolean trap

Agents wrote `wrap="nowrap"` 5 times. Under plain presence semantics that would turn wrapping **on**.

The manifest therefore treats `wrap`, `scroll`, `equal` and `grow` as enumerated rather than as presence booleans:
- on: `""`, `true`, or the attribute's own name (`scroll` also accepts `x` and `horizontal`)
- off: `false`, `nowrap`, `none`
- anything else: `UI-BAD-VALUE`

## Diagnostics this decision requires

The element name no longer carries the intent. A wrong choice now shows up as a missing modifier rather than a wrong primitive, and that can only be detected at runtime.

| code | level | fires when | suggests |
|---|---|---|---|
| `row/overflow` | warn | a row that neither wraps nor scrolls has content overflowing it | `wrap`, `scroll` or `stack-below` |
| `row/unequal-peers` | info | a non-wrapping row without `equal` has 3 or more same-tag children whose widths differ by more than 1.5× (the KPI-row failure in `A1`) | `equal` or `ui-grid` |
| `layout/partial-wrap` | info | a wrapping row has 2–4 same-type children, and its lines hold different counts (`A4`) | `stack-below` |
| `row/space-between-many` | info | `justify="space-between"` has 4 or more children; it renders as push-last | group the children |
| `reel/no-overflow`, `scroll/snap-oversized` | warn | unchanged from `A8`; they now apply to `ui-row scroll` | — |
| `grid/cramped` | warn | a `ui-grid` with exact `columns` renders tracks narrower than `min-item-width`, or its items overflow their tracks | `max-columns` |
| `stack/overlap-intent` | warn | a `ui-stack` or `ui-row` has children that are absolutely positioned, or that use negative margins to overlap a sibling | `ui-overlay` |
| `overlay/modal-like` | warn | a `ui-overlay` is fixed-position and covers the viewport, or holds a backdrop | `ui-dialog` (top layer, `F1`) |

## Round 2 evidence (element given, n=10 per probe)

| behavior | result | change |
|---|---|---|
| wrap | `wrap` 10/10 | confirmed |
| push apart | `justify="space-between"` 9/10, `between` 1 | confirmed |
| child takes the rest | `grow` 9/10 | confirmed |
| horizontal rail | **`scroll` 7/10**, `scrollable` 3 (Haiku) | `scrollable` → `scroll` |
| row↔column switch | **`stack-below` 6/10** (GPT-6.2, Haiku, Opus); `collapse-at`, `stack-at`, `wrap-below`, `collapse`; `threshold` 0 | `threshold` → `stack-below` |
| equal children | **`equal` 8/10**, `equal-width` 2 | new modifier on `ui-row` |
| rail item width | `card-width` 6, `item-width` 4 | kept `item-width`: the prompt said "cards", so the result is biased; re-measure with neutral wording |
| max per row | `limit` 5, `max-items` 3, `max-panels` 2 (the prompt said "panels") | confirmed |
| exact grid (calendar) | `columns="7"` 10/10 | — |
| grid with at most 4 columns | `max-columns="4"` 5; `columns="4"` 5, four of those with `responsive` or `columns-sm` | adopted: `max-columns` |

Interpretation was 100% for `scroll` + `item-width`, `stack-below`, child `grow`, `bleed="full"` and `max-lines`.

## Round 2 decisions (adopted 2026-11-20)

1. **`columns` is exact, and `max-columns` is the cap.** See above.
2. **`ui-stack direction="horizontal"` is accepted without a diagnostic** as an exact equivalent of `ui-row`.
3. **The overlap primitive is `ui-overlay`; `ui-layers` is an alias.**
   - Round 2 reworded the prompt without "on top", and `ui-stack` still got 8/10 (all Claude models, plus one answer each from the GPT models). `ui-overlay` got 2, and `ui-layers` was never written.
   - By P4, the first name that doesn't collide wins.
   - The risk that `ui-overlay` gets used for modals is handled by `overlay/modal-like`, not by the name.
   - Agents who write `ui-stack` for overlap are caught by `stack/overlap-intent` once the children are positioned.

The other two decisions (shipping the invented elements, and merging the page root with the app shell) are in [vocabulary.md](vocabulary.md#round-2-decisions-adopted-2026-11-20).
