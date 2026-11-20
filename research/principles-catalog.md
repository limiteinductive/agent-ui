# Agent-first UI library: principles catalog

Seed design doc for a framework-agnostic, CSS-first custom-element library (`<ui-stack>`, `<ui-card>`, tokens, themes), with a DOM-level design-diagnostics engine and a Solid 2.0 adapter. It targets single-file, no-build CDN artifacts and full apps.

This file holds the decisions. The evidence lives in the seven section files, which hold **239 kept cases** distilled from 431 raw ones (see [§7 Index](#7-index)). Case references read `01 C2`, meaning section 01, case C2. Canonical names are in [vocabulary.md](vocabulary.md) and [layout-vocabulary.md](layout-vocabulary.md) (name-guess eval, 2026-11-20); they override older spellings in the sections.

**Stem.** A construct is agent-friendly when its *outcome* (how it renders, behaves, is perceived and operated, and exports to print, capture and clipboard) satisfies the principles below. The draft stem said "visual result", but most failures in semantics and delivery are absences, such as no handler, no name or no focus target, and a visual stem can't see them.

---

## 1. Final principle set

Ten entries: nine principles and one cost constraint. Each entry gives the rule, a one-line rationale, canonical cases, and the labels it absorbs. §2 maps the old labels to the new ones.

### P1 · One owner
**Every value, relationship, piece of state and behavior has exactly one declared owner.**
*Why:* an agent can only fix what it can locate, and anything owned in one declared place can be checked statically and exactly.
- **Layout:** the parent places (tracks, gap, alignment, flow). The leaf sizes itself from a closed intent: `fit`, `fill` or a token.
- **Color:** the surface owns its background, its inks and its focus ring, so a pair is one unit.
- **Relationships:** a two-ended relationship belongs to the nearest common ancestor.
- **State:** the runtime is the only writer, and the ARIA state attribute is also the styling hook.
- **Behavior:** the browser owns the state machines it ships: dialog, popover, details, constraint validation and FormData.
- **Order:** the DOM owns order.
- **The library itself:** one manifest generates the types, validator, lint, debug CSS and SKILL.md.

Cases: `01 A1`/`B1` (pick the primitive by who owns size; leaf intent fit/fill/token) · `03 A1`/`A5` (the surface owns its ink and focus ring) · `05 D2` (one async-action primitive, with the runtime as the only writer) · `07 §4` (one manifest for every target).
Absorbs: draft P1, 01:N1, 01:N4, 01:N7, 03 PAIR/SEM/INERT, 05:N1/N4/N5, 07 SD.

### P2 · Declared reach
**A construct reads correctly from itself, its parent primitive and a named ambient set. Anything farther reaches it only through a declared channel that the engine verifies.**
*Why:* agents write linearly and can't see distant ancestors. Ancestor effects (containing block, stacking context, definite size, scroll container, inherited scheme) are the main source of correct-looking code that renders wrong.
- **Ambient set:** closed (lang, dir, scheme, text scale, motion, contrast, pointer, host capabilities, medium). It is resolved once at the root and mirrored as attributes.
- **Non-local CSS effects** only go through designated primitives, which check the ancestor chain and name the culprit.
- **Linear-writable structure:** containment rather than id pairs, and `min=` rather than `cols=`.
- **Children:** addressed by role, not by position.
- **The one sanctioned global:** the emphasis budget (primary actions, accent, rank), counted per region.

Cases: `01 F2`/`D4` (a `position:fixed` element trapped by a transform or `container-type` ancestor; `container-type` only on boxes sized from outside) · `07 E1–E2` (linear-writable structure) · `06 11` (rows place children by role) · `04 A2` (root resolver with attribute mirrors).
Absorbs: draft P2, 01:N6, 04 AMB, 06 ROLE/BUDGET, 07 LW.

### P3 · No hidden quirks
**Defaults are constant, documented and safe. Parser, engine and UA quirks are neutralized by construction, and the stylesheet alone renders correctly.**
*Why:* the worst hidden defaults live in the HTML parser, the UA stylesheet and the environment, not in CSS initial values, and they leave no trace in the output.
- **Neutralize:** restate grid's own defaults (`align-content:start`, no implicit tracks), default `<button>` to `type=button`, zero UA margins inside primitives, paint the root canvas, declare `color-scheme`, and remap system colors.
- **Make it safe or required:** defaults that cause navigation, data loss or no-ops.
- **Preferences are inputs, never pinned:** text size, zoom, motion and contrast. Protective defaults stay.
- **The stylesheet is the contract:** CSS is the correct tier and JS only enhances. Nothing stays hidden waiting for a ready flag.
- **Defaults are attractors:** the default theme and the SKILL.md examples are design decisions in their own right.

Cases: `07 A1–A5` (self-closing custom elements, foster parenting, `"false"` that means true) · `05 A1` (safe button defaults) · `03 B4`/`B5` (unpainted root, UA system colors leaking) · `04 G1` (graceful tiering).
Absorbs: draft P3, 03 ATTR, 04 PREF/TIER.

### P4 · Closed, guessable vocabulary
**Decisions come from small, closed, uniform and guessable sets of named intents, with one encoding per intent. Data comes through typed channels.**
*Why:* an open set gives agents endless near-misses, and a closed set they can't guess gets missed just as often. A single encoding is what makes examples transfer.
- **Guessability is measured** with a no-docs eval, and the most common guess becomes canonical. Every prop uses the same scale names.
- **Encode relationships, not magnitudes.** Values are either the same or a perceptible step apart.
- **Closed roles, open values.**
- **Raw value in, named format out** (`ui-number`, `ui-relative-time`, Intl).
- **Meaning and appearance live on separate axes.**
- **Widget contracts are atomic:** authors supply content and intent, never role, state or keyboard handling.
- **Tie-breaks are written down:** details vs tabs, select vs datalist vs combobox, link vs button.
- **Meaning is stable** across versions, targets (vanilla and Solid) and binding paths.
- **Honest by omission:** the API leaves out dishonest encodings such as dual axes and truncated baselines.

Cases: `07 B1–B5` (vocabulary eval, uniform scales, `UI-BAD-VALUE`) · `06 1`/`12` (spacing names relationships; near-miss audit) · `02 3.1` (raw value in) · `05 C2` (input `kind` expands to the full attribute bundle).
Absorbs: draft P5 and P6, 03 AXES, 06 REL/SAME, 07 GU/TR/SM, 02 NEW-B, 05:N2/N3.

### P5 · Total over declared variation
**Correct for every member of the declared input space, not only for the preview.**
*Why:* the preview is a privileged view. Agents test their own happy-path data at one width, one locale and one host.

The axes:
- content length and long tokens
- count: 0, 1, N±1 and many
- container width and height
- data state: loading, empty, empty-filtered, partial, error, refreshing and refresh-error, with null distinct from 0
- interaction state, which is metric-neutral: it changes paint, never geometry
- locale, script and direction
- modality: keyboard, coarse pointer, screen reader
- preferences: 200% text, text spacing, zoom, motion, contrast, forced colors
- host: sandbox, storage, iframe embed
- medium: print, a t=0 capture, the clipboard
- theme axes
- time and order: double submit, latest-wins, upgrade order

Two rules cut across the axes. Size flows one way, including across the iframe boundary. Dimensions coupled to text use text-relative units.

Cases: `04 B6`/`C1` (data regions total over a closed state set; metric-neutral state) · `01 A2`/`A4` (N±1, orphans, all-or-nothing switching) · `05 D3` (latest-wins) · `04 H1`/`I5` (one-directional embed sizing; a complete t=0 frame).
Absorbs: draft P4, 01:N2/N5, 02 NEW-E, 03 UAO, 04 TOT/MNS/HOST/MED/P1+, 05:N7.

### P6 · Fail visible, never silently lossy or misleading
**When content doesn't fit, a resource fails or a capability is missing, the result stays visible and honest.**
*Why:* robustness is easy to fake by destroying information (`overflow:hidden`, ellipsis everywhere, `body{overflow-x:hidden}`). A visible failure gets fixed; a hidden one ships.
- **Declared limit policy:** where open content meets a bounded box, the behavior at the limit is one declared policy. Preference order: wrap, then owned scroll, then clip with disclosure, then clip. Data is never clipped.
- **Overflow:** centering is always safe centering. Clip with `overflow:clip`, not `hidden`. A zero minimum size requires an overflow owner.
- **Enhancements and late resources are polish only:** fallback parity, reveals only inside `@supports`, and reduced motion means 1ms, not 0.
- **Claims match capabilities:** "Saved" and "Copied" come from typed results. Encodings are honest.
- **Orders agree:** visual, DOM, focus and accessibility order match.

Cases: `06 17` (`minmax(0,1fr)` turns overflow into overlap) · `01 C1–C3` (safe center, overflow owner, clip vs hidden) · `02 8.2` (reveals fail toward visible) · `04 F2` (storage states its real durability).
Absorbs: 01:N3, 02 NEW-A/NEW-C, 04 BND/HON, 06 LOSS.

### P7 · Intent declared, so outcomes are checkable
**Behavior and geometry that must happen are declared in markup, and every claimed variation axis can be driven from the DOM.**
*Why:* a check cannot fire on an absence or on ambiguous geometry. Declared intent turns silent failures (a dead control, lost focus, an unintended clip) into exact checks.
- **At the actuator:** `commandfor`/`command`, `consequence` and `focus-after`.
- **Geometry:** `truncate`, `clip` and `scroll` are declared, so any other clipping is a finding.
- **A non-visual twin is required:** alt text or an explicit `decorative`; a chart name plus a data table; values reachable without hover.
- **A stress harness with a closed axis catalog** switches every axis on deterministically.

Cases: `05 A2`/`E4` (dead-control sweep; post-action focus belongs to the action) · `04 A1` (stress harness) · `02 5.3`/`6.3` (chart data-table twin; alt required) · `07 F5` (`UI-CLIPPED` becomes precise only with declared intent).
Absorbs: 05:N6, 07 ID/PB, 04 SIM, 02 NEW-D.

### P8 · Loud, precise, convergent
**Every failure reaches the agent through a channel that doesn't depend on what failed. Each one is a structured record with the cause, measured values, a literal fix and a SKILL.md anchor. Results are pass, fail or unknown, and fixes converge.**
*Why:* loudness without precision ends in silence, because agents delete noisy checks.
- **Record fields:** code, severity, confidence, path, snippet, src, got/allowed, context, cause, fix, docs, fingerprint.
- **Channels:** console JSON, data attributes, `window.ui.diagnostics`, and CSS-only tripwires.
- **Severity:** tiers with precision targets; a check that misfires gets demoted.
- **Unknown is not pass:** unverifiable means unknown, never pass. The closed theme matrix is verified at registration.
- **Scope:** checks measure the composed DOM after settle and report "checked N elements".
- **Convergence:** the cheapest way to silence a check is the fix itself, and a fixpoint fuzz guarantees the fixes converge.
- **Taste:** a soft, rate-limited tier.
- **End users:** never see output. Outlines appear only behind a debug attribute.

Cases: `07 F1–F6` (record format, multi-channel emitter) · `04 G2`/`G4` (tripwires independent of the runtime) · `03 C2`/`C4` (worst-case bound or UNVERIFIABLE; matrix at registration) · `06 24` (tiered by objectivity).
Absorbs: draft P7, 03 BOUND/TASTE, 04 IND, 06 COMP, 07 CF/3V.

### P9 · Explicit, counted deviation
**Leaving the system is always possible, always local, labeled with an intent, and counted. There is no global off switch.**
*Why:* if agents can't find an exit, they reach for hacks that disable the whole system. A silent exit erodes the grammar.
- a typed data channel (`--data-*`, registered custom values, `gap="custom"`)
- sanctioned zones: `ui-prose`, `ui-compose` and `ui-decor`
- `data-ui-allow="CODE: reason"`
- theme scopes with a declared deviation budget
- the library loses the cascade (lowest layer, `:where`), except for an audited list of invariants. Every library win and every override of an owned property is reported.

Cases: `06 20`/`21`/`22` (data channel, coordinate-grid composition zone, losing the cascade) · `07 D5` (`data-ui-allow`, `UI-UNUSED-ALLOW`) · `03 F2` (theme-scope deviation budget).
Absorbs: 06 DEV/CASC, 07 ED.

### P10 · Zero cost by default (constraint)
**A primitive costs O(1) per instance and runs no per-instance JS. Containment, expensive effects and measurement-based behavior are opt-in and budgeted.**
*Why:* `container-type`, `backdrop-filter`, intrinsic sizing over large sets and per-instance JS each carry side effects and costs that compound in generated pages.
Cases: `06 23` (expensive effects opt-in) · `01 D4` (side effects of `container-type`) · `04 B3` plus Contested #4 (middle truncation as a Tier 1 behavior with a CSS fallback).
Absorbs: 06 COST.

---

## 2. Label mapping (old -> new)

The section files keep their original labels. Read them through this table. **Label collision:** section 01 and section 05 both use N1–N7 with different meanings, so they appear below as `01:Nx` and `05:Nx`.

| Old label | Meaning | New |
|---|---|---|
| Draft P1 | Owned by one place | P1 |
| Draft P2 | Locally readable | P2 (rewritten as declared reach) |
| Draft P3 | Free of hidden defaults | P3 |
| Draft P4 | Robust to variation | P5, plus the information-loss clause in P6 |
| Draft P5 | Chosen from a closed set | P4 |
| Draft P6 | One canonical way | P4 (one encoding per intent) |
| Draft P7 | Loud when wrong | P8; intent clause in P7 |
| 01:N1 | Split ownership | P1 |
| 01:N2 | One-directional size flow | P5 |
| 01:N3 | Fail toward reachable | P6 |
| 01:N4 | One source of order | P1 (the DOM owns order), checked by P6 |
| 01:N5 | Stable under N±1 and re-parenting | P5 |
| 01:N6 | Non-local effects owned and verified | P2 |
| 01:N7 | Platform-owned state machines | P1 |
| 02 NEW-A | Fallback parity | P6 |
| 02 NEW-B | Raw value in, named format out | P4 |
| 02 NEW-C | Semantic honesty | P6 (mechanism: API omission, P4) |
| 02 NEW-D | Non-visual twin | P7 |
| 02 NEW-E | Metric coupling | P5 |
| 03 PAIR / SEM / INERT | Paired by construction / semantics drive style / inert decoration | P1 (INERT's zone is in P9) |
| 03 BOUND / TASTE | Decidable or bounded / soft taste tier | P8 |
| 03 UAO | Survives UA overrides | P5 |
| 03 AXES | Orthogonal declared variation | P4 |
| 03 ATTR | Defaults are attractors | P3 |
| 04 BND / HON | Boundary policy / claims match capabilities | P6 |
| 04 TOT / MNS / HOST / MED / P1+ | Total inputs / metric-neutral / host / medium / one-way iframe sizing | P5 |
| 04 PREF / TIER | Preference-transparent / graceful tiering | P3 |
| 04 AMB | Explicit ambient context | P2 |
| 04 SIM | Fragility is simulable | P7 |
| 04 IND | Loudness independent of failure | P8 |
| 05:N1 / N4 / N5 | Browser-owned / parity / single writer | P1 (the parity check is in P6) |
| 05:N2 / N3 | Atomic widget / meaning and appearance on separate axes | P4 |
| 05:N6 | Declared intent | P7 |
| 05:N7 | Time-independence | P5 |
| 06 REL / SAME | Relationships, not magnitudes / same or clearly different | P4 |
| 06 ROLE / BUDGET | Role-addressed / emphasis budget | P2 |
| 06 LOSS | No silent information loss | P6 |
| 06 DEV / CASC | Declared deviation / library loses the cascade | P9 |
| 06 COST | Zero cost by default | P10 |
| 06 COMP | Verify the composed result | P8 |
| 07 GU / TR / SM | Guessable / transferable / stable meaning | P4 |
| 07 LW | Linear-writable | P2 |
| 07 ED | Explicit deviation | P9 |
| 07 ID / PB | Intent declared / probeable | P7 |
| 07 CF / 3V | Convergent fixes / three-valued results | P8 |
| 07 SD | One manifest | P1 |

### Seed-case verdicts

The seed cases were the brief's starting examples. Each one survives only in amended form.

| Seed | Verdict | Where |
|---|---|---|
| grid over flex | Replaced. The real axis is who owns the size negotiation (parent-owned vs sibling negotiation). **Names revised 2026-11-20:** that ownership is encoded as modifiers on `ui-stack`/`ui-row` plus `ui-grid` (`wrap`, `justify`, `scrollable`, `threshold`, `grow`), not as intent-named primitives. Agents read the intent names but never wrote them. See [layout-vocabulary.md](layout-vocabulary.md). | `01 A1`, `06 §8`, name-guess eval |
| gap over margin | Holds for components. Prose flow, push and dividers need margins or sibling rules, so they live in the named `ui-prose` zone. | `06 3`/`4`, `02 2.1` |
| `grid-area:1/1` over absolute | Holds only when content layers size the box and decoration doesn't. | `06 18` |
| `isolation:isolate` | Only at composition roots, because it breaks blend modes that need a shared backdrop. | `06 19`, `01 F3` |
| container queries | `container-type` only on boxes sized from outside. Otherwise the box collapses, traps fixed descendants and creates a stacking context. | `01 D4`/`D5` |
| `minmax(0,1fr)` / clamp / `overflow-wrap` | A zero minimum needs an overflow owner, or overflow becomes overlap. The `overflow-wrap` default is contested. | `01 C2`, `06 17`, `02 2.3` |
| logical properties | Hold. Direction-aware transforms, gradients and icons also need care. | `04 D4` |
| aspect-ratio | Holds inside `ui-image`/`ui-aspect-ratio`, which reserves the box. | `02 6.1`, `01 D5` |
| `<button>` | `type=button` by default. Pending state never uses `disabled`. Canonical tag is now `<ui-button>` (form-associated, 20/20 guessed), and native `<button>` is styled the same. | `05 A1`/`D1` |
| OKLCH pairs | The pair is the unit. L picks the step and the checker decides the pair. Mixing happens in oklab. | `03 A1`/`C5` |
| `:focus-visible` | The surface owns the ring color, measured against the backdrop beyond the offset. | `03 A5`, `05` |

---

## 3. Top insights

These are the findings that most change the design.

1. **Most silent failures happen before CSS runs.** They come from the HTML parser (self-closing custom elements swallow their siblings, foster parenting in tables, attribute lowercasing, presence booleans where `"false"` means true) and from attribute selectors that miss: an unknown tag renders `display:inline` and an unknown value silently falls back to the default. A manifest-driven checker catches all of these with almost no false positives, which makes it the highest-return diagnostics investment. (`07 A1–A6`, `B3–B5`)
2. **Precision follows ownership.** Anything owned in one declared place can be linted exactly. Emergent geometry needs runtime probes, and those only become precise once intent is declared. A stricter grammar therefore buys a larger exact layer. (`07 §0`, `§11`)
3. **A check cannot fire on an absence.** A dead control, a missing focus destination, an unhandled command or an unannounced result can only be detected when the intent is declared at the actuator. Detectability is decided when the API is designed, not when the checker is written. (`05 A2`/`A3`/`D4`/`E4`)
4. **Several seed fixes make failures quieter.** `minmax(0,1fr)` and `min-inline-size:0` turn overflow into overlap. `overflow:hidden`, ellipsis everywhere and `body{overflow-x:hidden}` hide failures. Blanket isolation breaks blend modes. A decor layer at `grid-area:1/1` can size the box. Robustness has to mean "without information loss". (`06 17–19`, `01 C2`, `04 B3`)
5. **Closed is not enough; the set must be guessable.** The brief's own `gap="base"` and `tone="raised"` were misses: the eval found `tone` 0/60 and `accent` 0/10. Scales must be uniform across props. **Measured:** `0|xs|sm|md|lg|xl|2xl` and `variant="neutral|primary|success|warning|danger|info"` ([vocabulary.md](vocabulary.md)). (`07 B1–B10`)
6. **Closed roles make exhaustive verification possible.** A theme has about 4,000 surface/ink pairs, all checkable when the theme is registered, including states and schemes that are never rendered. Translucent backdrops get a worst-case bound over black and white, or are reported UNVERIFIABLE, but never pass. Because `var()` is illegal in `@container` conditions, closed tokens also let breakpoints be generated ahead of time. (`03 C2`/`C4`, `01 D4`)
7. **Many composition errors use legal values.** A heading can sit closer to the previous section than to its own content, or a nested gap can exceed its parent's, with every token valid. Agents should declare relationships (related, group or section; parent or child) and let the system derive magnitudes, because closed sets alone can't catch relational errors. (`06 1`/`2`/`6`)
8. **The non-locality agents actually hit is temporal.** Agents write top to bottom. Forward id references (`for=`, `aria-labelledby`) and count props such as `cols="3"`, chosen before the children exist, break first. Prefer containment (`ui-field` wraps the label and the control). For grids, agents write `columns=` anyway (48 times in eval pages), so `columns` is honored as a cap over `min-item-width` ([layout-vocabulary.md](layout-vocabulary.md)). (`07 E1–E2`, `05 C1`)
9. **Inheritance has timing traps.** `light-dark()` resolves where it is declared and freezes when inherited. Registering color roles with `@property` freezes or hides them. Top-layer elements inherit from their DOM parent, not from where they appear on screen. UA system colors (Canvas, Field) leak into dialogs and inputs. The fixes: redeclare inks at every scheme boundary, and never register role colors. (`03 B1–B5`)
10. **The top layer has its own traps.** A dialog opened without `showModal()` isn't modal. A toast opened before a modal sits under it. Transform, filter and `container-type` ancestors trap fixed descendants. Overlays therefore belong in the top layer, and z-index shrinks to a tiny closed ladder with no negative values. (`01 F1–F4`)
11. **The reporting channel must not depend on what failed.** A JS reporter can't report its own failure to load. CSS-only tripwires (`--ui-version` and a `body::before` banner), plus a stylesheet that produces a correct layout on its own, cover that case. (`04 G1`/`G2`/`G4`)
12. **The preview is a privileged run.** Failures that only appear at another width, at 200% text, in RTL, under a sandbox, in print, in a t=0 thumbnail capture or in an iframe that feeds `vh` back into its own height are invisible unless a stress harness can drive those axes from the DOM. (`04 A1`/`H1`/`I5`)
13. **The default theme is an attractor.** Most artifacts will look like the default. The expressive layer needs about 10 orthogonal theme axes, a brief-to-axes table and mutually distant exemplars, while taste checks stay in a soft, rate-limited tier. (`03 F1`/`F4`/`F5`/`H8`, `06 25`)
14. **The library must lose the cascade to compose with pasted CSS.** That leaves structural invariants exposed to resets and preflight CSS. The resolution is an audited invariant list, plus reporting every library win and every override of an owned property. (`06 22`, `07 D4`, `03 F3`)

---

## 4. Where the principles break down, and what the escape hatch must allow

| Principle under load | Where it breaks | What resolves it |
|---|---|---|
| P1 one owner | Two-ended constructs (heading spacing, nested radii, shared edges) are only correct or wrong as a pair. | The nearest common ancestor or a relationship primitive owns them; never a single-element prop. (`06 2`/`10`) |
| P2 declared reach | Hierarchy, accent, edge alignment and consistency are global by nature. Theme, density, dir and lang are deliberate action at a distance. | BUDGET is the named global exception, counted per region. AMB is a closed ambient set resolved at the root. Theme scopes are declared. (`06 6–10`, `04 A2`) |
| P3 no hidden quirks | Literally unattainable: grid stretch and implicit tracks, half-leading, UA margins. | "Constant and documented", not "none": restate the default inside the primitive and lint the rest. (`01 A3`, `06 3`) |
| P4 closed vocabulary | Data isn't a decision: chart heights, coordinates, brand hues, user values. Fine-grained sets recreate near-misses, and subtle editorial themes need small steps. | A typed data channel. The theme validator sets the minimum step, and the near-miss threshold sits below it. (`06 12`/`20`) |
| P4 one encoding | Spacing needs two models (component gap and prose flow). Push and distribute are different intents. | "One way per intent", with named zones (`ui-prose`). (`06 3–5`) |
| P5 total | It can be satisfied by destroying information. Some axes are hard to simulate faithfully (sandbox, host sizing). | The P6 loss ordering. Dev-mode simulation stays opt-in per run and never ships. (`04` Contested #5) |
| P6 fail visible | A visible failure is ugly for end users. | Content stays visible and the diagnostic goes to the agent; humans only see outlines behind a debug attribute. (`07` X1) |
| P8 loud | Loud without precise turns into silence, because agents delete the checks. Taste checks get gamed. | Precision targets per tier, demotion on misfire, the cheapest silence is the fix, and no global off switch. (`06 24`/`25`) |
| P10 zero cost | Middle truncation, `fit` measurement and stress probes need JS per instance. | Tier 1 behavior with a CSS Tier 0 fallback, run only when declared. (`04 B3`) |
| Grammar overall | Art direction (posters, bento, editorial openers) and third-party widgets don't fit the structural grammar. Engines don't support everything (`interestfor`, base-select, CloseWatcher, `moveBefore`, grid-lanes, `text-box-trim`, `contrast-color()`). | A sanctioned composition zone. Features gated on `@supports`, with `UI-FEATURE-MISSING` at info level. Core behavior never depends on these features. (`06 21`, `05` Contested) |

**What the escape hatch must allow:**
1. **Per-element suppression:** `data-ui-allow="CODE: reason"`. It is local, greppable and listed in the summary, and a stale allow raises `UI-UNUSED-ALLOW`.
2. **A typed open-value channel:** `--data-*` or a registered `--ui-*` custom value through `gap="custom"`. Roles stay closed while values are open.
3. **Sanctioned zones:**
   - `ui-prose`: flow spacing; bare semantic tags styled in a donut scope.
   - `ui-compose`: art direction on a coordinate grid. Structural checks drop to info, but accessibility, overflow and contrast stay on.
   - `ui-decor`: inert. It has no layout influence and is `aria-hidden` and `pointer-events:none`.
4. **Raw CSS always works.** The library sits in the lowest layer with `:where` (zero specificity). Overriding an owned property reports `UI-OWNED-PROPERTY` unless it is allowed.
5. **Theme scopes** may deviate within a declared budget, and are re-verified on registration.
6. **Coexistence:** third-party elements and frameworks are allowed (`UI-MIXED-FRAMEWORK` at warn).

**What it must not allow:**
- a global off switch
- silent overrides of the audited invariants
- a deviation that isn't counted
- region-wide suppression outside a declared art-direction zone

---

## 5. Diagnostics shortlist, ranked by signal-to-false-positive

The section files use three naming styles (`UI-X`, `area/name`, `SNAKE_CASE`). They must be unified into one registry (Contested #28). Rank is by precision first, then by how often the failure happens.

**Tier A: manifest-exact (static and DOM; about zero false positives; error).** No geometry is needed.

| # | Code | Fires when | Source |
|---|---|---|---|
| 1 | `UI-SELF-CLOSE` | `<ui-x/>` swallows its following siblings | `07 A1` |
| 2 | `UI-UNKNOWN-ELEMENT` | an undefined `ui-*` tag, which would render inline | `07 B3` |
| 3 | `UI-BAD-VALUE` / `UI-UNKNOWN-ATTR` | a value or attribute that isn't in the manifest | `07 B4` |
| 4 | `UI-BOOL-STRING` | `"false"` or `"0"` on a presence boolean | `07 A5` |
| 5 | `UI-CONTENT-MODEL` | an illegal child, or foster-parented content | `07 A2` |
| 6 | `UI-DUP-ID` / `UI-DANGLING-IDREF` | duplicate ids, or `for`/`aria-*`/`commandfor` pointing at nothing | `07 E1` |
| 7 | `UI-UNKNOWN-TOKEN` | `var(--ui-*)` that isn't in the manifest, or a private token | `07 D2`, `03` |
| 8 | `UI-RESPONSIVE-SYNTAX`, `UI-AREAS-SHAPE`, `UI-AREA-UNKNOWN`, `UI-INVALID-CSS` | malformed grammar | `07 B5`/`D1` |
| 9 | `UI-REMOVED` / `UI-TOO-NEW` / `UI-RENAMED`, version skew | the API doesn't match the loaded version | `07 B8`, `04 G2` |
| 10 | `UI-UNKNOWN-ICON` / `UI-NO-API` | an unknown icon, or an unknown `window.ui` member | `07 B7` |

**Tier B: exact runtime facts (about zero false positives; error or warn).**

| # | Code | Fires when | Source |
|---|---|---|---|
| 11 | CSS or runtime missing (tripwire) | `--ui-version` is unset, or the runtime marker is absent; shown as a `body::before` banner | `04 G2` |
| 12 | `UI-RESOURCE-FAILED` / `RESOURCE_BLOCKED` / `IMG_LOAD_FAILED` | a font, script or image is blocked or fails to load | `04 F4`, `02 6.1` |
| 13 | `IMG_NO_ALT` | `alt` is absent and the image isn't marked `decorative` | `02 6.3` |
| 14 | `a11y/no-name` | a control or icon-only button has no accessible name | `05 B3` |
| 15 | `a11y/nested-interactive` | an interactive element sits inside another | `05 A4` |
| 16 | `dialog/not-modal` | a dialog was opened without `showModal()` while declared modal | `01 F1` |
| 17 | `container/collapsed` | `container-type` on a box sized by its content | `01 D4` |
| 18 | `grid/implicit-track` | an item lands in a track that wasn't declared | `01 A3` |
| 19 | `align/unsafe-overflow` | centered content overflows at the start edge | `01 C1` |
| 20 | `ROOT_UNPAINTED` | the `html` and `body` backgrounds are both transparent | `03 B4` |
| 21 | `UA_SYSTEM_COLOR_LEAK` | a computed background equals Canvas or Field while the surface differs | `03 B5` |
| 22 | `form/will-navigate`, `a11y/anchor-no-href`, `link/noop-hash` | submit or link defaults would navigate or do nothing | `05 A1` |
| 23 | `focus/lost-to-body`, `state/discarded` | focus drops to `<body>`, or stateful DOM is destroyed | `05 E3`/`E4` |
| 24 | `behavior/unhandled-command`, `event/unknown-name` | a declared command has no handler, or an event name is unknown | `05 A2`/`A3` |
| 25 | `HOST_CAP_DENIED` / `NATIVE_MODAL_USED` | a sandbox capability is denied, or `alert`/`confirm`/`prompt` is used | `04 F1` |
| 26 | `TYPO_WEIGHT_NOT_LOADED`, `TYPO_HYPHENS_NO_LANG`, `NUM_FLOAT_NOISE`, `UI-SENTINEL` | faux bold, hyphenation without `lang`, `0.30000000000000004`, or NaN/undefined/`[object Object]` rendered | `02 1.3`/`3.1`, `04 B5` |

**Tier C: geometry that names its cause (low false positives once intent is declared; warn or error).**

| # | Code | Fires when | Source |
|---|---|---|---|
| 27 | `layout/horizontal-overflow` | page-level overflow; the report lists the culprit elements | `01 C4` |
| 28 | `sticky/ineffective` | a sticky element can't stick; names the condition and the ancestor | `01 E1` |
| 29 | `overlay/fixed-trapped` | a fixed element is trapped; names the ancestor | `01 F2` |
| 30 | `text/truncation-ineffective`, `scroll/unconstrained` | an ellipsis that never triggers, or a scroller with no bound | `01 C3`/`D3` |
| 31 | `layout/overflow-unowned` / `overflow/bleed` | min-size 0 content overlaps a sibling | `01 C2`, `06 17` |
| 32 | `UI-STATE-REFLOW` | a hover, focus, pending or refresh state changes geometry | `04 C1` |
| 33 | `EMBED_HEIGHT_FEEDBACK` | an iframe height loop driven by `vh` or `100%` | `04 H1` |
| 34 | `CONTRAST_FLOOR` + `CONTRAST_UNVERIFIABLE`, `FOCUS_RING_LOW`, `CONTROL_BOUNDARY_LOW` | contrast measured against the composited backdrop, with three result states | `03 C1`/`C2`/`A5` |
| 35 | `THEME_MATRIX_FAIL` | a failing pair in the closed role-by-state-by-scheme matrix at registration | `03 C4` |
| 36 | `media/aspect-distorted`, `UI-CLIPPED` | distorted media, or clipping that was never declared | `01`, `07 F5` |

**Tier D: heuristic warnings (medium false-positive rate; precision is tracked and the check is demoted on misfire).**
`UI-OWNED-PROPERTY` · `UI-OCCLUDED` · `OVERLAP_TRANSPARENT` · `COLOR_UNOWNED_BACKGROUND` · `heading-floats`/`proximity-inverted` (`06 2`) · `multiple-primary` (`06 7`) · `hierarchy/inverted` (`06 6`) · `UI-DROPPED-DECLARATION` · `UI-BARE-TEXT` · `UI-UTILITY-CLASS`/`UI-MIXED-FRAMEWORK`.

**Tier E: info and taste (high false-positive rate; rate-limited).**
`edge-sprawl` · `near-miss` · `UI-SIBLING-DRIFT`/`UI-ORPHAN-ROW` · the `01 G1` nesting set · the accent budget · the sameness fingerprint · `UI-FEATURE-MISSING`, which reports a fact.

**Meta (always on).**
- The settle summary: "checked N elements, M findings, K suppressed".
- `UI-UNUSED-ALLOW`.
- `UI-RUNTIME-ERROR`.

---

## 6. Contested items

Each item is tagged **[decide]** (needs a design call), **[eval]** (needs a measurement) or **[verify]** (needs a fact checked), followed by the current leaning.

| # | Item | Tag | Leaning | Source |
|---|---|---|---|---|
| 1 | Canonical names for primitives and tokens (`gap="base"`, `tone="raised"`, `Stack` ambiguity) | eval | **Measured 2026-11-20** (`eval/name-guess`). Layout is decided: row/stack + modifiers ([layout-vocabulary.md](layout-vocabulary.md)). The rest are decided too ([vocabulary.md](vocabulary.md)). Open: the page root, absolute time, the overlap primitive, and elements agents invented | `07 B1`/X4 |
| 2 | Aliases (`base`→`md`): render and warn, or error | decide | Render, warn, and never document the alias | `07 B10` |
| 3 | Cascade: the library always loses, vs layered `!important` for invariants | decide | Lose by default; keep a small audited invariant list; report every win | `06 22`, `07 D4`, `03` #9 |
| 4 | `overflow-wrap` default: `break-word` vs `anywhere` | eval | `break-word`, with `anywhere` per kind (URLs, identifiers, table cells) | `02 2.3`, `04 B2` |
| 5 | Default `min-inline-size:0`, and requiring an overflow owner | decide | Zero by default, plus `layout/overflow-unowned` | `01 C2` |
| 6 | Canonical sidebar: container-query collapse vs intrinsic flex | decide | **Intrinsic**: `<ui-row wrap>` with `grow` on main ([layout-vocabulary.md](layout-vocabulary.md)) | `01 A6` |
| 7 | Stacking: a z-index ladder vs none; toasts under modals | decide | Top layer for overlays; two in-flow values; the toast outlet is undecided | `01 F3`/`F4`, `06` |
| 8 | Required policy props (`overflow`, `empty`, `error`) vs defaults plus diagnostics | decide | Required in Solid; default plus diagnostic in custom elements | `04 B4`/`B6` |
| 9 | Content with no policy: visible and flagged, or clipped | decide | Visible and flagged | `04` #3 |
| 10 | Default embed mode (flow height vs viewport) | decide | A host handshake or an explicit mode | `04 H1` |
| 11 | Diagnostics on by default in published artifacts | decide | On, silent to humans | `07` X1 |
| 12 | Unknown `window.ui` member: throw or not | decide | Return `undefined` and record `UI-NO-API` | `07` X2 |
| 13 | Solid `style` typing: `--ui-*` only vs an allowlist | decide | `--ui-*` plus a typed list of properties the library doesn't own | `07 C5` |
| 14 | Light DOM for every control vs shadow DOM for behavior widgets | decide | Light DOM; see the proposal in `05 B6` | `05 B6` |
| 15 | `aria-disabled` as the default disabled state | decide | Yes, but the library swallows every activation path | `05 D1` |
| 16 | Overriding derived color roles; `@property` registration | decide | Override only through theme registration; register only per-element structural props | `03` #1–2 |
| 17 | Categorical data color: stable key vs index | decide | An indexed token set with keyed assignment | `02`, `03 I1` |
| 18 | `contrast-color()` fallback threshold (0.62 lets white land at 3.65–4.58:1) | verify | Use about 0.565 for neutrals; build-time verification is the real guarantee | `03` #5 |
| 19 | How much weight APCA gets | eval | Advisory only | `03 C1` |
| 20 | Default theme (skeletal vs credible, title-hash seed), required brief fields, sameness fingerprint | eval | A diversity eval across generated artifacts | `03 F4`/`F5`/`H8` |
| 21 | Taste checks at all (accent budget, near-miss, sibling drift) | eval | Hints with precision targets; delete on misfire | `06` |
| 22 | Charting scope: CSS marks plus a frame contract, vs a chart engine | decide | Open | `02 5.x` |
| 23 | Table `collapse="priority"` | decide | Only with a disclosure or column picker | `02 4.2` |
| 24 | Middle truncation (per-instance JS) vs zero cost | decide | Tier 1, with a CSS end-truncation fallback | `04` #4 |
| 25 | Print defaults, raw-value copy, `user-select:none` on chrome | decide | URL annotation opt-in; per-column copy policy; limit `user-select` to icons and handles | `04 I1`/`I7` |
| 26 | JS rasterizers vs OKLCH tokens (`ui.capture`) | decide | Open | `04 I6` |
| 27 | Enclosure contrast: 3:1 for every surface vs functional boundaries only | decide | Perceptible ΔL or a rule for cards; 3:1 for controls | `03` #10 |
| 28 | One diagnostic-code naming convention | decide | Pick one style and alias the others in the registry | §5 |
| 29 | Escape scope: per element vs whole regions | decide | Both; regions only for declared art direction | `06` |
| 30 | Input width: signals the expected length, or fills its cell | decide | The cell owns the cap; the field width is a maximum inside it | `06 16` |
| 31 | Engine support for `interestfor`, base-select, CloseWatcher, `moveBefore`, grid-lanes, `text-box-trim`, `contrast-color()` | verify | Core must work without them | `05`, `01 A9`, `02 2.4` |
| 32 | Smaller items: toast auto-dismiss; Trusted Types via a meta CSP; stretched-link cards; `scrollbar-gutter` on the root; snap `mandatory` vs `proximity`; `position:fixed` lint severity; nesting-heuristic thresholds; prose measure scope; `text-box-trim` scope; `TYPO_BARE_TEXT` level; dev-mode global patching; capture mode | decide | Per-section leanings | `05`, `01`, `02`, `04` |

---

## 7. Index

The kept total is 239 cases (431 raw).

| Section | Kept | Summary | Labels used |
|---|---|---|---|
| [sections/01-layout-sizing.md](sections/01-layout-sizing.md) | 32 | Primitive choice by who owns size, leaf intent fit/fill/token, overflow and min-size owners, one-directional size flow, sticky, top layer, z-index | 01:N1–N7 |
| [sections/02-typography-media.md](sections/02-typography-media.md) | 30 | Type roles, font loading and weight manifest, prose, raw-value formatting (numbers, dates), tables, honest charts, images, icons, motion | NEW-A–NEW-E |
| [sections/03-color-expression.md](sections/03-color-expression.md) | 39 | Surface-owned ink pairs, scheme mechanics and UA leaks, verification with worst-case bounds, state layer, elevation, theme axes, genre composition, data color | PAIR BOUND UAO SEM AXES ATTR INERT TASTE |
| [sections/04-variation-delivery.md](sections/04-variation-delivery.md) | 37 | Stress harness and root resolver, content extremes and total state sets, locale, preferences, sandboxed host, delivery tripwires, embedding, print, capture and copy | BND TOT MNS PREF AMB HOST SIM IND HON TIER MED P1+ |
| [sections/05-semantics-behavior.md](sections/05-semantics-behavior.md) | 39 | Actuators and commands, ARIA via atomic widgets, forms, async actions with a single writer, rendering identity, navigation and persistence, lifecycle and the Solid adapter | 05:N1–N7 |
| [sections/06-composition-contrarian.md](sections/06-composition-contrarian.md) | 25 | Spacing as relationships, emphasis budgets, edges, same-or-different, seed fixes that go quiet, exits (data channel, compose zone, cascade, cost), taste tiering | REL SAME BUDGET ROLE LOSS DEV CASC COST COMP |
| [sections/07-agent-api-diagnostics.md](sections/07-agent-api-diagnostics.md) | 37 (+3 contested split-offs) | Parser and attribute traps, a guessable uniform vocabulary, one manifest for every target, escape hatches, linear-writable structure, the diagnostic record and delivery, verification modes, the code registry | GU LW TR SM ED CF ID PB 3V SD |
