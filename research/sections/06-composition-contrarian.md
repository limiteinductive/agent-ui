# Composition, design fundamentals, and where the principles break

> **Names superseded 2026-11-20** by the name-guess eval. See [../vocabulary.md](../vocabulary.md) and [../layout-vocabulary.md](../layout-vocabulary.md). The cases below still hold. Old spellings that remain here are pre-eval: `tone=` → `variant` on components / `color` on text; `accent` → `primary`; `positive|caution|critical` → `success|warning|danger`; `pad` → `padding`; `busy` → `loading`; `none` → `0`; `ui-surface` → `ui-card` (`elevated`/`sunken`/`inverse`); `ui-callout` → `ui-alert`; `ui-time` (relative) → `ui-relative-time`; `ui-cluster|split|bar|reel|switcher|sidebar` → `ui-row` modifiers. Round 2 (same day): `scrollable` → `scroll`; `threshold` → `stack-below`; `ui-layers` → `ui-overlay`; `ui-layout`/`ui-shell` → `<ui-page layout="app">`; absolute `ui-time` → `ui-date`/`ui-datetime`; `ui-modal` → `ui-dialog`; `ui-metric` → `ui-stat`; `ui-grid columns` is now exact, and `max-columns` is the cap.

**Scope.** This section covers four things:

- how primitives compose into a page that reads well: proximity, hierarchy, emphasis, edges and consistency;
- which seed fixes fail when they are applied as blanket rules;
- where the strict grammar has to give way;
- how much of taste can be enforced, and how much cannot.

**Sources.** Two explorers fed this section: fundamentals (F1–F30) and contrarian (C1–C32). The 62 raw cases became:

- **25 cases**;
- 29 pointer rows covering 32 raw cases that other sections own (Appendix A);
- 7 dropped or corrected claims (Appendix B).

**Tiers.**

| Tier | Meaning |
|---|---|
| CORE | Enforced by primitives, tokens or types. |
| DIAGNOSTIC | A runtime or static check. |
| GUIDANCE | SKILL.md only. |
| CONTESTED | An unresolved conflict. |

A tier written "+diag" or "+hint" is a CORE encoding that also has a check. Check severities are error, warn and hint.

**Principle tags.** P1–P7 are the draft principles. New tags proposed here:

| Tag | Proposed principle |
|---|---|
| REL | Encode relationships, not magnitudes |
| SAME | Same or clearly different |
| BUDGET | Emphasis is a budget |
| ROLE | Role-addressed, not position-addressed |
| LOSS | No silent information loss |
| DEV | Declared deviation |
| CASC | The library loses the cascade |
| COST | Zero cost by default |
| COMP | Verify the composed result |

## Index

| # | Case | Tier | Detect |
|---|---|---|---|
| 1 | Spacing names relationships; nested gaps step down | CORE+diag | runtime |
| 2 | Headings and labels bind to what follows; spacing that depends on the neighbour uses sibling rules | CORE+diag | runtime |
| 3 | UA default margins add to gap | CORE+diag | runtime |
| 4 | Gap stops at component wrappers; empty items still get it | DIAGNOSTIC | runtime |
| 5 | Proximity survives container width; push, don't distribute | CORE+diag | runtime |
| 6 | Visual rank follows structural rank | DIAGNOSTIC | runtime |
| 7 | One primary action per region; ui-actions owns order | CORE+diag | runtime |
| 8 | Accent is a scarce budget | CORE+hint | runtime |
| 9 | No card soup | CORE+diag | runtime |
| 10 | Edges are owned at two scales (surface inset, page lines) | CORE+diag | runtime |
| 11 | Rows with optional parts: role slots, not track positions | CORE+diag | runtime |
| 12 | Same or clearly different: token and near-miss audit | CORE+diag | runtime |
| 13 | Interactivity is declared; no inert hover | CORE+diag | runtime |
| 14 | Emoji are content, not icons | DIAGNOSTIC | both |
| 15 | One capitalization convention | GUIDANCE+hint | runtime |
| 16 | Input width signals expected length | CONTESTED | runtime |
| 17 | minmax(0,1fr) turns overflow into overlap | DIAGNOSTIC | runtime |
| 18 | Layer stacks: content sizes the box, decoration doesn't | CORE+diag | runtime |
| 19 | Isolate only at composition roots; blend modes need a shared backdrop | CONTESTED | runtime |
| 20 | Closed sets for decisions; a typed channel for data | CORE | both |
| 21 | Art-direction zone (ui-compose) | CORE+diag | runtime |
| 22 | The library loses every cascade fight | CONTESTED | static |
| 23 | Expensive effects are opt-in and budgeted | CORE+hint | runtime |
| 24 | Diagnostics are tiered, check outcomes and resist gaming | DIAGNOSTIC | both |
| 25 | Taste: curated presets and a review ritual | GUIDANCE | hard |

---

## 1. Proximity and spacing relationships

The typical failure in this group: every value is legal on its own, and only the relationship between two values is wrong.

### 1. Spacing names relationships; nested gaps step down
CORE (+diag) · runtime · P5, P1, REL · F1
- **Prefer** ordinal relationship tokens (`gap="tight|related|group|section"`), where an unenclosed child stack's gap is strictly smaller than its parent's, **over** `gap="base"` at every level, or a child gap larger than its parent's.
- **Failure.** A settings page built as stack(md) > sections(md) > fields(md) > label+input(md) has nothing that reads as a group. Later the agent bumps one field's gap "for breathing room", and that inverts proximity. Every value is in the closed set, so P5 alone can't catch either problem.
- **Encoding.**
  - Relationship tokens, plus an optional `gap="auto"`.
  - CSS can resolve `auto` one step below an explicit parent: each token sets `--ui-gap-next`.
  - CSS can't decrement a chain of `auto`s, because that needs a self-referencing custom property. Deeper chains need a style query (not yet in every engine) or the runtime, so explicit tokens stay canonical.
- **Checks.**
  - `spacing/proximity-inverted` (warn) fires when an unenclosed child's gap is ≥ its parent's gap. It reports both values in px and the next step down. A child `ui-surface` with a visible fill or border is exempt, because a common region overrides proximity. The cheapest way to silence the check is therefore to enclose deliberately or to step the gap down.
  - `spacing/proximity-flat` (hint) fires when 3 or more nested levels share one gap.

### 2. Headings and labels bind to what follows; spacing that depends on the neighbour uses sibling rules
CORE (+diag) · runtime · P1, P2, P6, REL · F2, C5
- **Prefer:**
  - space above a heading at least 2× the space below it, owned by `<ui-section>` (heading slot) and `<ui-field>` (label, hint and error slots);
  - `<ui-prose>` as the single sanctioned margin-flow zone (`> * + *` flow plus em-based heading pair rules);
  - `<ui-stack divided>`, drawn as `> * + * { border-block-start: …; padding-block-start: var(--gap) }`, with CSS gap decorations (`row-rule`) where supported.

  **Over:**
  - h2/p/h2/p siblings in one uniform-gap stack;
  - `<hr>` siblings inside a gap stack;
  - the `gap: 1px; background: var(--border)` grid-line hack.
- **Failure.**
  - Each heading floats halfway between the previous block and its own, so the eye attaches it to the wrong block.
  - Helper text reads as belonging to the next field.
  - An `<hr>` gets gap on both sides, which doubles the space.
  - The 1px hack paints solid blocks into an incomplete last row.
  - Agents then patch these with margins that add to the gap.
- **Checks.**
  - `spacing/heading-floats` (warn): for h1–h6, label and legend, the distance from the previous sibling's bottom is ≤ the distance to the next sibling's top. It reports both distances.
  - `layout/prose-in-stack` (hint): a gap container holds h2–h6 plus 3 or more `p` elements. It suggests `ui-prose`.
  - `spacing/divider-double-gap`.
  - Margin diagnostics are muted inside `ui-prose`.
- The prose flow mechanics belong to typography ("Vertical rhythm…") and layout ("Editorial and markdown content…").

### 3. UA default margins add to gap
CORE (+diag) · runtime · P3, P1 · F3
- **Prefer** a lowest-priority reset, `@layer ui.reset { :where(ui-stack, ui-grid, ui-cluster, ui-section) > * { margin-block: 0 } }`, together with resets for figure, blockquote and list indents and explicit role-based heading sizes, **over** raw `h1/p/ul/figure/blockquote` in gap containers that rely on gap alone.
- **Failure.**
  - `gap=md` between an h2 and a p renders as 16px + 0.83em + 1em. The extra differs by element type, so stack spacing looks random.
  - `<figure>` brings 40px inline margins nobody wrote.
  - UA heading sizes aren't a stable base either: the h1-in-section rules were removed in 2025.
- **Encoding.** Reset only block margins, never inline ones: `margin-inline: auto` is the push mechanism (case 5).
- **Check.** `spacing/margin-in-gap-container` (warn) fires when a child of a flex or grid container with non-zero gap has a non-zero computed block margin. It names the element and says whether the margin comes from the UA or from author CSS. It whitelists `auto` margins and `ui-prose`.

### 4. Gap stops at component wrappers, and empty items still get it
DIAGNOSTIC (+core) · runtime · P2, P4, ROLE · C6
- **Prefer:**
  - Solid list components that return fragments or arrays, or render their own `ui-stack`;
  - conditional parts that render nothing (`<Show>` with no wrapper);
  - `display: contents` only on non-semantic wrappers.

  **Over:**
  - `<ui-stack gap><TodoList/></ui-stack>` where TodoList returns `<div>{items}</div>`;
  - components that return an empty `<div class="error">`;
  - a library-wide `> :empty { display: none }`.
- **Failure.**
  - The stack spaces the wrapper once, and the items inside sit flush. The agent adds margins and now has two spacing systems.
  - An empty div is still a flex or grid item and gets gap on both sides. The result is a double-width hole that appears only in that state (for example, no validation error), which fixture screenshots never reach.
  - The `:empty` fix is wrong because `img`, `input`, `canvas`, icon `<i>` elements and spacers all match `:empty`.
- **Checks.**
  - `gap/swallowed` (warn): a gap container whose only child is a non-primitive with 2 or more block children and no spacing of its own.
  - `gap/empty-item` (warn): a non-replaced, zero-size, in-flow item inside a gap container.
  - `display: contents` on button, ul, table or headings is covered under semantics.
- The variation section shares the empty-child half ("gap still applies to empty children").

### 5. Proximity survives container width: bounded pairs, and push instead of distribute
CORE (+diag) · runtime · REL, P4, P6 · F24, C4
- **Prefer:**
  - `<ui-keyvalue>` / `<dl>` as a grid with `max-content minmax(0,1fr)`, switching to label-above-value at narrow container widths;
  - title-plus-actions headers as a bounded cluster;
  - `push` / `<ui-spacer>` (`margin-inline-start: auto`) when one item belongs at the end.

  **Over** `justify-content: space-between` across wide rows.
- **Failure.**
  - On a 1200px panel, "Status" and "Active" sit 1000px apart and the eye loses the row. Page actions drift away from the title they act on.
  - With 3 or more items, the middle one lands mid-row. When a conditional item disappears, the remaining two jump to opposite edges.
  - Agents check at narrow widths and never see any of this.
- **Encoding.**
  - Push and distribute are different intents, and each has one canonical form (P6 applied per intent).
  - Every margin diagnostic whitelists `auto` margins. A blanket gap-over-margin lint would flag the correct fix.
- **Checks.**
  - `proximity/stretched-pair` (hint): a two-child text row whose inter-child space is greater than max(8× font-size, 40% of the row width). It suggests `ui-keyvalue` or a cluster.
  - `layout/space-between-n` (hint): a space-between row with 3 or more children.
  - True-centered header bars belong to layout.

## 2. Hierarchy and emphasis budgets

These properties are global by nature: each use is locally valid, and only the aggregate erases hierarchy.

### 6. Visual rank follows structural rank
DIAGNOSTIC · runtime · P2, P7, BUDGET · F6
- **Prefer** `<ui-heading>` with a default size derived from its section depth, overrides that are allowed but checked for monotonicity, and one dominant element per landmark **over** card titles that outrank their section heading, or flat pages whose largest text is about 1.2× body.
- **Failure.** An h3 card title at 20px bold next to an h2 section heading at 18px semibold inverts the hierarchy. KPI dashboards with equal-weight tiles give the eye nothing to anchor on.
- **Checks.**
  - `hierarchy/inverted` (warn): a descendant section's heading is larger than its ancestor's heading, or the same size with greater or equal weight.
  - `hierarchy/flat` (hint): largest heading / body < 1.5 within a landmark.
- Inferring the level from nesting belongs to semantics ("Heading outline…"). Page-scale advisories belong to expressive.

### 7. One primary action per region; `<ui-actions>` owns order and placement
CORE (+diag) · runtime · P1, P6, BUDGET · F15
- **Prefer** `<ui-actions>` in dialog, form and card footers and in toolbars, with at most one `intent="primary"` per region (dialog, form, card or landmark). Its layout, all in DOM order:
  - primary at inline-end;
  - secondaries before it;
  - destructive actions separated at inline-start.

  **Over:**
  - three filled brand buttons side by side;
  - primary on the left in one dialog and on the right in the next;
  - Cancel or Delete styled as primary;
  - CSS `order` to rearrange buttons.
- **Failure.**
  - "Save", "Publish" and "Export" all shout, so there is no clear next step.
  - Inconsistent placement across dialogs trains misclicks.
  - `order` desyncs focus order from visual order.
- **Encoding.** A typed `intent` union. What matters is consistency, not which side the primary sits on (platform conventions differ). The library picks one side and owns it.
- **Checks.**
  - `emphasis/multiple-primary` (warn), counted per nearest region ancestor.
  - `actions/order`: the primary is not last in DOM order within `ui-actions`.
  - `actions/destructive-primary`: danger tone plus primary intent outside a confirm dialog.

### 8. Accent is a scarce budget
CORE (+hint) · runtime · BUDGET, P5 · F16
- **Prefer** accent fill only through semantic roles, with neutrals carrying the structure. The roles:
  - primary intent;
  - selected state;
  - the key data highlight;
  - `tone="accent"` on a few surfaces.

  **Over** accent headings, icons, borders, section backgrounds, badges and buttons all at once.
- **Failure.** When everything is brand purple, the CTA disappears: the generic "AI-generated" look. Each use was locally reasonable, so no per-element rule catches it.
- **Encoding.** No raw `--accent` in the public token surface, only role tokens.
- **Check.** `emphasis/accent-overuse` (hint only) fires when either:
  - accent-like fill (within ΔE of the accent, or chroma above a threshold) covers more than about 10–15% of the viewport; or
  - more than N accent-filled elements appear above the fold.

  Declared accent bands on landing pages count against the band-rhythm budget (expressive, "Section rhythm"), not this one. The threshold is contested (§10).

### 9. No card soup: shallow enclosure, one separator per boundary
CORE (+diag) · runtime · P1, BUDGET · F17
- **Prefer:**
  - at most two levels of visibly enclosed surfaces;
  - groupings inside a surface made with space or a divider;
  - a nested `ui-surface` stepping automatically to inset or borderless (via descendant selectors such as `ui-surface ui-surface`);
  - one separation mechanism per boundary: space, line or fill.

  **Over** a card inside a card inside a card, each with border, shadow and radius, or tables with zebra stripes plus row borders plus cell borders.
- **Failure.** Agents wrap every group in a surface "to be safe". The result is visual noise, unclear grouping, and padding that compounds: 3 levels × 24px × 2 sides is 144px of a 375px phone.
- **Checks.**
  - `surface/nesting-depth` (warn): more than 2 visibly enclosed ancestors.
  - `surface/padding-stack` (warn): cumulative inline padding above 15% of the viewport at the narrowest tested width.
  - `surface/redundant-separation` (hint): border, shadow and fill all differ from the parent.
- The surface treatment axis belongs to expressive; padding inside padding belongs to layout.

## 3. Edges and placement

### 10. Edges are owned at two scales: one inset per surface, one set of column lines per page
CORE (+diag) · runtime · P1, P2, P4, REL · F21, F22, C17
- **Prefer:**
  - a surface-owned content inset (`--ui-pad`) that every child shares;
  - intentional breakouts through `<ui-bleed>`, whose negative margin equals the inherited `--ui-pad`;
  - a `<ui-container>` grid with named lines (full, wide, content) and a clamp() gutter;
  - sections that choose `width="content|wide|full"`.

  **Over:**
  - children adding their own inline padding;
  - hardcoded `margin: -16px` bleeds;
  - per-section `max-width`, `margin: auto` and `padding: 0 20px`.
- **Failure.**
  - Three or four distinct left edges inside one card. This is the most common amateur tell, and it is invisible when you look at one component at a time.
  - Hero, features and footer on different left edges, so the page wobbles while scrolling.
  - Some sections with a 0px mobile gutter. Sections are often written in separate agent turns.
  - Hardcoded bleeds break as soon as density changes the inset.
- **Checks.**
  - `align/edge-sprawl` (warn): within each surface or section, take the inline-start x of each text-bearing descendant's first line (`Range.getClientRects`), cluster within ±2px in logical direction, and warn above 3 clusters. Centered text and library-marked indentation (nested lists, quotes, the key-value value column) are excluded.
  - `layout/section-edge-mismatch` (warn): a top-level section's content start doesn't land on a named line.
  - `layout/no-gutter` (error): a text box sits within 12px of the viewport edge at any tested width.
- The breakout-grid mechanics and the 100vw scrollbar overflow belong to layout ("Full-bleed and 'fill'…").

### 11. Rows with optional parts place children by role, not track position
CORE (+diag) · runtime · ROLE, P4, P2 · C1
- **Prefer** `<ui-row>` children with `slot="start|main|meta|end"` mapped to named areas (`"start main meta end" / auto minmax(0,1fr) auto auto`), or flex with exactly one `grow` child, **over** `grid-template-columns: auto 1fr auto auto` with children auto-placed in DOM order.
- **Failure.**
  - When `<Show when={item.ts}>` drops the timestamp, the menu button auto-places into the `1fr` track and stretches to full width.
  - A missing avatar puts the title into the 40px `auto` track, where it truncates.
  - The fixture data has every field, so the screenshot passes.

  Grid is parent-owned but positional; flex survives missing children.
- **Correction.** An empty named area still has gutters on both sides (only `auto-fit` collapses tracks), so a missing middle role leaves a double gap. Two fixes:
  - drop the track with `:has()`: `ui-row:not(:has(> [slot=meta]))` switches the template (`:has()` has been Baseline since December 2023);
  - or move the spacing into the slots.
- **Checks.**
  - `grid/positional` (warn): an explicit `grid-template-columns` whose in-flow child count differs from its track count, or an interactive control auto-placed into an `fr` track.
  - The Solid adapter types `slot` as a union.

## 4. Consistency: same or clearly different

### 12. Same or clearly different: token conformance and near-miss audit
CORE (+diag) · runtime · SAME, P5 · F20, F5 (step size)
- **Prefer** every authored spacing, radius, font size, color and shadow resolving to a theme token. Token sets have few, perceptibly separated steps: for type, 6–8 steps at a ratio of at least 1.2, wider at the display end.

  **Over:**
  - one-off `padding: 14px`;
  - `#333`, `#374151` and `#2d2d2d` all meaning "dark text";
  - radii of 6, 8 and 10 in one view;
  - 14px headings next to 15px headings;
  - fine linear scales (12 steps of 4px) that make 12-vs-16 an arbitrary pick.
- **Failure.** Across iterations, agents invent a fresh value for each edit. The aggregate looks "slightly off" and no single element explains it. Near-duplicates read as mistakes rather than intent.
- **Encoding.**
  - Solid props make raw values unrepresentable.
  - The escape is `data-ui-allow="off-token: <reason>"`, so the deviation is itself visible.
  - The near-miss threshold and the theme's minimum step (surface ΔL ≥ 0.03) are the same rule seen from two sides.
- **Checks.**
  - `consistency/off-token` (warn): an *authored* declaration (an inline style or a CSSOM rule) whose value isn't in the resolved token set. It reports the nearest token. It runs on authored values only; running it on every computed value floods it with UA defaults, auto sizes and derived line-heights.
  - `consistency/near-miss` (warn): per property and per view, it suggests a merge when two value clusters are closer than a perceptible step: ΔE_OK below 0.02 for colors, a size ratio below 1.15 (1.125 for type), or radii less than 3px apart.
- The fluid, zoom-safe scale mechanics belong to typography.

### 13. Same look, same behavior: interactivity is declared, and only interactive things react
CORE (+diag) · runtime · P2, P7, SAME · F14
- **Prefer** `<ui-surface interactive href=…>` or `<ui-card href>` (a stretched primary link) with distinct hover, press and focus states, where hover and lift styling exist only under `[interactive]`, **over** static cards with decorative hover-lift and clickable cards that look identical to static ones.
- **Failure.** Users click things that do nothing and miss things that act. Agents add `hover:shadow` to every card as decoration.
- **Encoding.** A typed API: `interactive` requires an `href` or a handler, and the library's state tokens only resolve on interactive surfaces.
- **Check.** `affordance/inert-hover` (warn) fires on a CSSOM `:hover` rule that changes paint on a `ui-surface` or `ui-card` without `interactive`. It is scoped to library surfaces because event listeners on arbitrary elements can't be inspected.
- Underlined links and color-only status belong to color and semantics. Nested interactive cards belong to semantics.

### 14. Emoji are content, not icons
DIAGNOSTIC · both · SAME, P5 · F10 (emoji part)
- **Prefer** `<ui-icon name>` from the theme's single icon family **over** emoji (rocket, chart, check mark) in headings, nav, buttons, labels and KPI tiles.
- **Failure.** Emoji are one of the strongest "generated" tells:
  - they render differently per OS (Apple, Noto, Segoe);
  - they carry their own colors, which ignore the palette and dark mode;
  - screen readers announce them ("rocket");
  - they end up next to outline icons.
- **Check.** `icon/emoji` (warn) runs on heading, button, link, label and nav text, excluding prose bodies and user data. It matches `\p{Emoji_Presentation}` or `\p{Extended_Pictographic}️`. Bare `\p{Extended_Pictographic}` would also match ©, ®, ™, ‼ and ↔, which are text-presentation characters.
- Sizing and alignment belong to typography and media, family and stroke weight to expressive, and closed icon names to llm-api.

### 15. One capitalization convention
GUIDANCE (+hint) · runtime · SAME, P6 · F28
- **Prefer** sentence case for buttons, headings, tabs and menu items, declared once in the theme and in SKILL.md, with uppercase only through the `overline` role (`text-transform`, so a theme can undo it) **over** "Save Changes" next to "Cancel order" next to "DELETE".
- **Failure.** Conventions mix across iterations and pasted snippets, and nobody audits labels globally. Capitals typed into the source can't be undone by a theme.
- **Check.** `consistency/text-case` (hint): classify each label, per element kind, as title case, sentence case or all caps (skipping the first word and stopwords), and report when one kind mixes classes. It stays a hint because proper nouns and acronyms cause false positives.

### 16. Input width signals expected length
CONTESTED · runtime · P5, P4 · F29
- **Prefer:**
  - field widths from a content-keyed closed set (`width="4ch|10ch|20ch|full"`), defaulting from `autocomplete` or type (postal-code about 10ch, cc-csc 4ch);
  - single-column forms capped at about 40–60ch;
  - `field-sizing: content` on textareas (progressive).

  **Over** every input at 100% of a 1000px card.
- **Failure.** The form reads as a wall of identical bars. Short values sit in vast fields, and users misjudge the expected format. Agents set `width: 100%` globally because it "is responsive".
- **Conflict.** Semantics ("Form control sizing: controls fill the grid cell") makes the parent grid the single owner of width. Proposed resolution: the form grid owns the column and its cap, and the field's `width` is only a maximum inside it (`inline-size: min(100%, <n>ch + padding)`). Both rules then hold.
- **Checks.**
  - `form/wide-field` (hint): a text input wider than 70ch.
  - `form/multi-column` (hint): side-by-side fields outside `<ui-field-group>`.

## 5. Seed fixes that break or go quiet

Several seed fixes don't remove a failure; they make it quieter. So for every proposed fix, ask: what failure remains, and is it still loud?

### 17. `minmax(0,1fr)` turns overflow into overlap unless something owns the overflow
DIAGNOSTIC (+core) · runtime · P7, P4, LOSS · C9
- **Prefer** a zero-minimum track paired with an owner for wide content:
  - `<ui-scroll-area axis="x">` around tables, code and charts;
  - `max-inline-size: 100%` on media;
  - `overflow-wrap: break-word` on text.

  **Over** `minmax(0,1fr)` or `min-width: 0` sprinkled everywhere as "the overflow fix".
- **Failure.** A wide `<pre>` or `<table>` in a zero-minimum track paints over the neighbouring column, because its overflow is visible. The page has no horizontal scrollbar, so the agent's "no horizontal scroll" check passes while the screenshot shows overlapping text.
- **Check.** `overflow/bleed` (error): an element with `scrollWidth > clientWidth` and visible overflow, whose overflow extent intersects a sibling's box.
- Other fixes in the same family of quieter failures:

  | Fix | Remaining failure |
  |---|---|
  | `overflow: hidden` | Kills sticky; clips focus rings and menus. |
  | Ellipsis on data | Hides the data (truncation, see pointers). |
  | `overflow-wrap: anywhere` | Collapses columns to one character. |
  | `font-synthesis: none` | A missing italic silently drops emphasis. |
  | Opacity-muted text | Contrast loss nobody sees. |

### 18. Stacking with `grid-area: 1/1`: content layers size the box, decoration must not
CORE (+diag) · runtime · P1, P4 · C15
- **Prefer** `<ui-layers>`, whose children declare `layer="content|decor"`:
  - Content layers stack in one cell, and all of them contribute to size. That is right for hero text over an image, where the text can grow.
  - Decor layers are `position: absolute; inset: 0; pointer-events: none` and hidden from assistive technology, or anchor-positioned for corner dots.

  **Over** grid-stacking every layer as a rule.
- **Failure.** A 600px decorative SVG in a grid stack makes the card 600px tall. A notification dot enlarges the avatar's box and misaligns the list. The opposite also happens: an absolutely positioned caption overflows its hero on mobile.
- **Checks.**
  - `layers/decor-sizes-box` (hint): an aria-hidden or pointer-events:none layer in a one-cell stack extends beyond the union of the content layers.
  - `layers/absolute-text-overflow` (warn): an absolutely positioned element containing text overflows its containing block.
- The inert decoration channel (`<ui-decor>`) belongs to expressive.

### 19. Isolate only at composition roots; blend modes need a shared backdrop
CONTESTED · runtime · P2, DEV · C16
- **Prefer** `isolation: isolate` only on roots that own a z-order (`ui-layers`, `ui-compose`, a surface with `layered`), with overlays in the top layer (`popover`, `<dialog>`), **over** `isolation: isolate` on every primitive plus a numeric z-index ladder.
- **Failure.** An editorial heading with `mix-blend-mode: difference` is meant to blend with a hero photo. If the photo sits outside the heading's isolated surface, the heading blends only with that surface's flat background, and the effect silently does nothing.
- **Check.** `blend/noop` (hint): `mix-blend-mode` other than normal, where the nearest isolation group paints only a flat opaque background behind the element.
- **Conflict.**
  - Sizing-overlays proposes named layer tokens plus component-owned isolation.
  - The contrarian view ships no z-index scale at all, because overlays in the top layer need none.
  - Likely resolution: no tokens for overlays, and at most a 2–3 step ladder for in-flow layering (raised, sticky).
- Containing-block traps from transform and filter belong to sizing-overlays.

### Seed critiques owned elsewhere

| Seed rule | Where it breaks | Owner |
|---|---|---|
| gap over margin | prose rhythm, auto-margin push, dividers, wrappers that swallow gap, UA margins | cases 2–5 |
| grid-area 1/1 over absolute | decoration sizes the box | case 18 |
| isolation over z-index wars | kills cross-surface blending; doesn't stop transformed ancestors from capturing fixed descendants | case 19; sizing-overlays |
| container over media queries | zero-width collapse in shrink-to-fit boxes; no self-query; a cost per container; hover, pointer, motion and print are device axes and stay media queries | layout, variation, diagnostics |
| minmax(0,1fr) | overflow becomes overlap | case 17 |
| clamp() | fluid type built only on vw ignores 200% zoom | typography, variation |
| overflow-wrap | `anywhere` collapses min-content to about 1ch; use `break-word` | typography |
| logical properties | not everything flips: media controls, check marks, code, URLs, phone numbers and IDs need LTR isolation | variation |
| button over div onClick | an implicit `type=submit`; a whole-card button nests interactive content | semantics |
| OKLCH pairs | out-of-gamut chroma clips with a hue shift; ΔL is not WCAG contrast; ship verified pairs | color |
| grid over flex (seed insight) | grid is positional (case 11) and has hidden defaults (stretch, implicit tracks, auto-fit collapse, % tracks plus gap). Flex is the right engine when the negotiation is the feature (cluster, switcher, sidebar), as long as a primitive owns the formula | layout |

## 6. Exits: where the grammar must give way

Without sanctioned exits, agents smuggle raw values into unmarked inline styles, or abandon the library for the whole page. Exits are explicit, local and labelled, and they are counted rather than flagged.

### 20. Closed sets are for decisions; data gets a typed channel
CORE · both · P5, DEV · C25 (data part)
- **Prefer** a data channel, consumed by primitives, for values that are data rather than design decisions. Examples are `<ui-bar value=".37">` or `style="--data-x: 37%"` for bar lengths, chart heights, coordinates, progress and gauge angles.

  **Over** forcing data through tokens (impossible), or a raw `style="width:37%"`, which can't be told apart from a smuggled design override.
- **Failure.** Without a channel, legitimate data styles and design escapes look identical. Off-token checks then either spam and get disabled, or get loosened for everyone.
- **Encoding.**
  - The `--data-*` namespace is exempt from the raw-value lint.
  - Solid types it as a number or percentage, and the runtime checks that values are finite and in range.
  - Validation matters because `--data-x: NaN%` is a valid custom property, but it makes `width: var(--data-x)` invalid at computed-value time. The property then silently falls back to its initial value, which is exactly the silent failure P7 forbids.

### 21. Art direction gets a sanctioned zone: a coordinate-grid composition
CORE (+diag) · runtime · DEV, P4, P1 · C26, C25 (region part)
- **Prefer** `<ui-compose cols="12">`:
  - children are placed with `at="row / col / span r / span c"`, which sets `grid-area` and is validated against `cols`;
  - overlap comes from overlapping areas;
  - z-order is DOM order inside the isolated composition;
  - `transform: rotate()` is allowed, since it only affects paint;
  - below a container-width threshold, it collapses to a one-column flow in DOM order.

  Also allow `data-ui-escape="optical|art-direction|third-party"` regions, where any CSS is legal.

  **Over** absolutely positioned collages with px offsets and negative margins, or a grammar that has no answer for this kind of work.
- **Failure.** At 375px, the headline sits under the image and the overlapping text is unreadable; the layout only works at the agent's 1440px screenshot width. Or the agent decides the library can't do creative work and writes 300 lines of raw CSS for the whole page.
- **Checks.** Inside the zone, only three checks apply: text-on-text overlap, contrast, and order mismatch in the collapsed flow. Structural codes drop to info. The report counts escapes (the ratio of escapes to primitives) instead of flagging them.
- Named asymmetric compositions and role-spanned bento grids are stricter tiers above this one and belong to expressive. Per-element suppression with a reason belongs to llm-api.

### 22. The library loses every cascade fight
CONTESTED · static · CASC, P2 · C22
- **Prefer** all library CSS in `@layer ui.reset, ui.tokens, ui.primitives, ui.theme` (layer order declared up front), selectors wrapped in `:where()`, no `!important`, and documented custom properties as the knobs. Unlayered author and utility CSS (for example the Tailwind CDN) then always wins.

  **Over** unlayered attribute selectors (`ui-stack[gap=base]` has specificity 0,1,1) or any library `!important`.
- **Failure.** The escalation goes like this:
  1. `.my-stack { gap: 2rem }` silently loses.
  2. The agent escalates to `!important`.
  3. A layered `!important` beats an unlayered author `!important`, because important declarations invert layer order. So that loses too.
  4. The agent inline-styles everything or drops the library.
- **Conflict.** llm-api ("Protect owned properties: layered !important for invariants") uses that inversion on purpose, so authors can't break structural invariants. Proposed synthesis:
  - lose by default;
  - keep layered `!important` for a short, audited list of invariants;
  - whenever the library wins over an author rule, emit a diagnostic naming that rule.

  Neither winning nor losing is then silent.

### 23. Expensive effects are opt-in and budgeted
CORE (+hint) · runtime · COST, P4 · C29
- **Prefer:**
  - composited properties (opacity, transform) by default;
  - `backdrop-filter`, large blurred shadows, `filter` animation and `mix-blend-mode` as opt-in tones that honour `prefers-reduced-transparency` and `prefers-reduced-motion`;
  - height animation only on single disclosures;
  - containment and `text-wrap: pretty` only where scoped.

  **Over** `tone="glass"` on every card, or animating box-shadow, height or filter across a list.
- **Failure.** Scrolling janks on mid-range Android phones and integrated GPUs, which the agent's machine never shows. Sixty cards transitioning to `height: auto` stutter. None of P1–P7 rules out a construct that is correct but expensive.
- **Encoding.** Effect tokens are tagged with a cost tier.
- **Check.** `effect/budget` (hint) reports:
  - backdrop-filter area as a share of the viewport;
  - the number of layout-property transitions;
  - the number of size containers.
- Glass legibility belongs to color; transition rules belong to media-data-motion.

## 7. Diagnostics and taste

### 24. Design diagnostics are tiered by objectivity, check outcomes, and are cheapest to silence by fixing
DIAGNOSTIC (meta) · both · P7, COMP · C27, explorer critiques
- **Prefer** three tiers, each finding carrying measured values and the token that fixes it:

  | Tier | Covers | Examples |
  |---|---|---|
  | error | objective defects | contrast, overlapping leading, overflow overlap, clipped focus, reading-order inversion |
  | warn | strong conventions | heading floats, proximity inversion, multiple primaries, edge sprawl |
  | hint | taste-adjacent heuristics | accent area, text case, stretched pairs |

  **Over** idiom lints ("margin used", "flex used", "inline style") and flat severity.
- **Failure.**
  - False positives (prose margins, auto margins, overflow in mid-transition, metrics measured before fonts load) train agents to blanket-ignore findings or delete the script.
  - A flat list buries contrast errors among hints.
  - Checks that police taste get gamed: the agent nudges a color just under the ΔE threshold instead of rethinking emphasis.
- **Encoding.**
  - Design every check so the cheapest way to silence it is the correct fix. The proximity check exempts real enclosures; edge-sprawl exempts library-marked indentation.
  - Suppression is only possible as `data-ui-allow="code: reason"`.
  - Each code has a precision target, and a code that misfires is demoted to hint.
  - Diagnostics are loud to the agent (console, JSON report, events) and silent to end users.
- Scheduling (after `fonts.ready`, outside transitions, batched in idle time) belongs to diagnostics.

### 25. Taste gets curated presets and a review ritual, not rules
GUIDANCE · hard · COMP, P7 · F30
- **Prefer** a SKILL.md ritual:
  1. Before layout, write a ranked content-priority list that names the single most important thing on the view.
  2. Pick a curated preset by mood (editorial, utilitarian or playful) instead of inventing values.
  3. After building, check at about 375, 768 and 1280px and under at least two presets. Then run the squint test: does the most salient blob match priority #1?

  The debug modes `<html ui-debug="squint|edges|spacing|baseline">` help: blur plus grayscale, edge guides, and gap overlays.

  **Over:**
  - treating zero diagnostics as "good design";
  - composing in template order (hero, three features, testimonials, CTA) regardless of the content;
  - centering everything.
- **Failure.** Pages that pass every check can still be bland or emphasize the wrong thing. Nothing mechanical judges focal-point choice, typeface mood, imagery, editorial asymmetry, or whitespace as a brand signal.
- **Encoding.**
  - Presets carry taste so that structure never has to.
  - Checks stay silent on taste, which keeps them trustworthy.
  - An optional text version of the squint test serves agents without vision: the report lists the top 5 elements by salience (area × contrast × size), to compare against the priority list.
- Preset diversity, exemplar anchoring and the brief-to-theme compile step belong to expressive.

---

## 8. Principle verdicts from this domain

| Principle | What this domain shows | Proposed restatement |
|---|---|---|
| P1 Owned by one place | Holds for magnitudes (gap, inset, gutter, density). Breaks for relationships, because heading space, nested radii and edges are correct or wrong only as a pair. Too strong for two-ended constructs (sticky plus scroller, container plus querier, label plus control, anchor plus target). The owner can also be a tested formula (switcher), not only the parent. | "Every relationship is owned by its nearest common ancestor." The section owns heading space, the surface owns inset and inner radius, the page owns column lines, and the collection owns cross-item alignment. Two-ended constructs are declared at both ends and validated. |
| P2 Locally readable | Hierarchy, emphasis, edge alignment and consistency are global by nature (cases 6–10, 12). Context (theme, density, dir, lang) is deliberately action at a distance. | Structure is local. Context is inherited only through declared boundaries, which the component path prints. Global properties get region-scoped checks. Consider merging P1 and P2. |
| P3 Free of hidden defaults | Load-bearing for type and spacing (UA margins, half-leading, `line-height: normal`, faux weights; case 3). Literally unattainable, and grid has its own defaults (stretch, implicit tracks). | "Defaults are safe by construction and inspectable." Omitting an attribute gives a good result, UA defaults are neutralized in `@layer ui.reset`, and `ui.explain(el)` prints each resolved value and where it came from. |
| P4 Robust to variation | Can be satisfied by destroying information or by turning overflow into overlap (case 17). Conditional children are variation too (cases 4, 11). | Add "without information loss", in the order wrap, then owned scroll, then clip with disclosure, then clip. Variation includes missing data, theme presets and environments the agent can't see. |
| P5 Chosen from a closed set | Necessary but not sufficient. Relational errors use legal values (cases 1, 6). Fine-grained sets recreate near-misses (case 12). Data is not a decision (case 20). Closed sets enforced only by attribute selectors fail silently. | "A small set of perceptibly separated steps, chosen by relationship where possible. Decisions are closed; data is typed." Consider merging with P6 into one closed vocabulary of values and mechanisms. |
| P6 One canonical way | Spacing needs two canonical models (component gap and prose flow). Push and distribute are different intents (case 5). | "One canonical way per intent", with named exception zones (`ui-prose`, `ui-compose`) and forms an agent would guess from its CSS knowledge. |
| P7 Loud when wrong | Several seed fixes make failures quieter (case 17). Loudness without precision ends as silence (case 24). | Tiered severity, measured values plus the fixing token, cheapest silence equals the correct fix, loud to the agent and silent to users, escapes counted. Corollary: verify the composed DOM, not the declared props. |
| Seed: grid over flex | Grid is parent-owned but positional, has its own hidden defaults, and its placement power scrambles reading order. | The real axes are who owns the negotiation and whether children are addressed by role. The agent-facing rule is "use primitives", not "use grid". |

## 9. New principles proposed by this domain

| Principle | Statement | Evidence | Recommendation |
|---|---|---|---|
| Encode relationships, not magnitudes (REL) | The agent declares a relationship (related, group or section; parent or child heading; inner or outer surface), and the system derives the magnitudes. | Cases 1, 2, 5, 6, 10; concentric radii (pointer) | Adopt. The strongest result of this domain. |
| Same or clearly different (SAME) | Any two values in a view are either identical or a perceptible step apart. Near-misses are defects. | Cases 12, 14, 15; the theme's ΔL floor | Fold into P5. |
| Emphasis is a budget (BUDGET) | Constructs whose meaning comes from rarity are counted per region. | Cases 6–9 | Adopt as a named, deliberate exception to P2. |
| Role-addressed, not position-addressed (ROLE) | Children declare what they are, and the parent maps roles to geometry. | Cases 4, 11 | Adopt. |
| No silent information loss (LOSS) | When content doesn't fit: wrap, then owned scroll, then clip with disclosure, then clip. Never clip data. | Case 17; truncation pointers | Fold into P4. |
| Declared deviation (DEV) | Escapes are explicit, local, labelled with an intent, always legal, and counted. | Cases 20, 21 | Adopt. It is the missing exit axis. |
| Zero cost by default (COST) | A primitive costs O(1) per instance with no JS by default. Containment, effects and intrinsic sizing over large sets are opt-in and budgeted. | Case 23; container-type and div-table pointers | Adopt as a constraint. |
| Verify the composed result (COMP) | Checks measure the rendered, composed DOM. | Cases 2, 10, 17, 24 | Fold into P7. |
| Perceptual over geometric | Specify values in perceptual units: OKLCH L, APCA, cap and lh units, text-box trim, concentric radii. | Pointers (typography, color, expressive) | Guidance; mostly owned elsewhere. |
| The library loses the cascade (CASC) | Zero specificity, lowest-priority layers, no `!important`. | Case 22 | Contested with llm-api. |

## 10. Contested

| Issue | View A | View B | Leaning |
|---|---|---|---|
| Cascade | The library always loses (C22) | Layered `!important` protects invariants (llm-api) | Lose by default; keep a small audited invariant list; report every library win. |
| Stacking | No z-index scale; overlays in the top layer; isolate only at roots (C16) | Named layer tokens plus component-owned isolation (sizing-overlays) | Top layer for overlays; at most a tiny ladder for in-flow layering. |
| Input width | Width signals expected length (F29) | Controls fill their grid cell (semantics) | The cell owns the cap; the field's width is a maximum inside it. |
| Accent budget | An area and count hint (F16) | Brand-led landing pages legitimately exceed it, and expressive themes want bold accent bands | Hint only; declared bands are exempt and counted by band rhythm instead. |
| Checking taste at all | Hints for accent area, text case and stretched pairs | Any taste check gets gamed and erodes trust (F30, C27) | Keep them as hints with precision targets; demote or delete on misfire. |
| P2 locality | "Locally readable" is a principle | Emphasis, hierarchy and edges are global by nature | Keep structure local; name BUDGET as the sanctioned global. |
| Escape scope | Per-element suppression with a reason (llm-api) | Whole regions where structural checks drop to info (C25, C26) | Both: per element for one-offs, regions only for declared art direction. |
| Near-miss vs subtle themes | Values closer than a perceptible step are defects | Editorial themes use deliberately subtle tonal steps | The theme validator sets the minimum step and the near-miss threshold sits below it, so a validated theme can't trip the check. |
| Gap over margin | Seed: gap everywhere | Prose flow, push and dividers need margins or sibling rules | Resolved by named zones. Still open: whether `ui-prose`-style flow is allowed outside prose. |

---

## Appendix A. Pointers (owned by other sections)

| Raw | Owner | What this section adds |
|---|---|---|
| F4 Typographic roles, not knobs | typography: closed semantic roles; unitless role-bound line-height | Roles prevent knob-stacking (smaller + muted + light + italic). Checks `type/leading-overlap` and `type/uppercase-untracked`. |
| F5 fluid/zoom part; C18 vw-only clamp | typography: fluid type with container units and a rem floor; variation: honour user font-size and zoom | Static lint: font-size containing vw or cqi with no rem term, or a max/min ratio above 2.5. The step-size part is merged into case 12. |
| F7 Line length | typography: prose measure | `type/measure-short` (under 25ch); `type/justify-narrow`. |
| F8; C19 Balance, centering, text-wrap | typography: text-wrap defaults; text-align policy | `type/manual-break` (`<br>` or `&nbsp;` in a heading, button, label or link). `balance` doesn't shrink fit-content boxes, so balanced pill text looks off-center. |
| F9 Ink and baseline alignment | typography: text-box trim; layout: baselines | `align/mixed-baseline` hint. |
| F10 Icon sizing and family | typography and media: 1lh icon boxes; expressive: icon family; llm-api: closed icon names | The emoji part is kept as case 14. |
| F11 x-height and loaded weights | typography: fallback metrics; emphasis and weight | `font/unloaded-weight`. Avoid a blanket `font-synthesis: none` (Appendix B). |
| F12; C32 Effective backdrop, scrim | color: text over non-solid backgrounds, contrast gate; diagnostics: contrast with honest uncertainty | `color/opacity-text`: text muted through ancestor opacity. |
| F13 Control boundaries at 3:1 | color: two border roles | Nothing new. |
| F18 Concentric radii | expressive: shape language | `shape/corner-poke`: a full-bleed child's square corners poking out of a rounded parent with visible overflow. Key evidence for REL. |
| F19 Theme invariants | color: verify the closed color matrix; expressive: theme axes | Invariants: dark-mode raised surfaces are lighter than base; accent hue ≥ 30° from danger. Checks also fire on inline overrides on `:root` or `<ui-theme>`. |
| F23 Cross-item subgrid | layout: subgrid across sibling cards | `align/cross-item-misaligned` hint: title or actions top y differs by more than 4px. |
| F25 Numbers | typography: tabular numerals; media: numeric columns | `data/inconsistent-precision`. |
| F26 Density scope, control heights | expressive: density axis; semantics: form control sizing | `controls/height-mismatch` among sibling controls in a row. |
| F27; C14 Placement and reading order | semantics: focus order equals DOM order; layout: visual order equals DOM order; diagnostics: visual vs DOM order | `ui-grid` `areas` validated so area names appear in DOM order. |
| C2 Cluster for content-sized siblings | layout: where flex wins (1) | `grid/content-sized` hint: at least 70% of auto-fill items fill less than half their track. |
| C3 Sidebar and switcher | layout: where flex wins (2); sidebars | Evidence that P1's owner can be a formula. |
| C7 container-type cost | layout, variation, diagnostics: container-type collapse | Static lint: `@container` rules whose subject is the container itself never match (no self-query). |
| C8 Device axes stay media queries | variation: hover gating; coarse pointers | A seed critique: container width is not a stand-in for the device. |
| C10 overflow-wrap: anywhere | typography: long unbreakable strings | Nothing new. |
| C11; C12 Sticky killed by overflow: hidden or stretch | sizing-overlays: sticky contract; layout: sticky and align-self; diagnostics: sticky fails silently | `sticky/stretched`: sticky element height within 1px of its containing block. |
| C13 Grid's hidden defaults | layout: equal-item grids; implicit grid tracks | Percentage tracks plus gap overflow by the gap width. |
| C20 Truncation loses data | sizing-overlays, typography, variation, media: truncation cases | Becomes the LOSS principle; `truncated/data` fires on numeric or ID-like ellipsized text. |
| C21 Button submit default, nested card button | semantics | Nothing new. |
| C23 Light DOM, zero per-instance JS | semantics: light DOM and form association; diagnostics | Nothing new. |
| C24 Closed sets fail silently in CSS | llm-api: unknown attributes, loud closed sets; diagnostics: enum typos | A debug CSS layer (`:not([gap=…])` outline) stays loud without JS. |
| C28 Size-contained embeds | layout: size-reactive content | `layout/feedback-growth`: an element grows on N consecutive resize observations. |
| C30 `<table>` for large data | semantics: tabular data; media: long lists | Cost angle: intrinsic track sizing visits every cell. |
| C31 Multicol and masonry | layout: column-major flows | Use `column-width`, not `column-count`. |

## Appendix B. Dropped or corrected claims

| Claim (source) | Reason |
|---|---|
| `hierarchy/fake-heading` hint (F6) | Low precision: bold lead-ins, eyebrows, KPI labels and table headers all match. |
| "Inverted if size **or** weight ≥" (F6) | Fires on every pair of same-weight headings. Replaced by: size greater, or equal size and greater or equal weight (case 6). |
| Blanket `font-synthesis: none` (F11) | Trades a visible faux style for silently lost emphasis. |
| `consistency/off-token` over all computed values (F20) | Noisy (UA defaults, auto sizes, derived line-heights). Restricted to authored declarations (case 12). |
| `type/scale-sprawl` above 7 sizes (F5) | A legitimate display register inflates the count; near-miss and off-token cover the real defect. |
| "An absent role collapses its auto track to 0" (C1) | Gutters remain. Replaced by `:has()` template switching (case 11). |
| "At most 2 sticky glass surfaces" (C29) | An arbitrary count. Replaced by area share of the viewport (case 23). |
