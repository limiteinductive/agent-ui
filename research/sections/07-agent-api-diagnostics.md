# Agent ergonomics, API design and diagnostics

> **Names superseded 2026-11-20** by the name-guess eval. See [../vocabulary.md](../vocabulary.md) and [../layout-vocabulary.md](../layout-vocabulary.md). The cases below still hold. Old spellings that remain here are pre-eval: `tone=` → `variant` on components / `color` on text; `accent` → `primary`; `positive|caution|critical` → `success|warning|danger`; `pad` → `padding`; `busy` → `loading`; `none` → `0`; `ui-surface` → `ui-card` (`elevated`/`sunken`/`inverse`); `ui-callout` → `ui-alert`; `ui-time` (relative) → `ui-relative-time`; `ui-cluster|split|bar|reel|switcher|sidebar` → `ui-row` modifiers. Round 2 (same day): `scrollable` → `scroll`; `threshold` → `stack-below`; `ui-layers` → `ui-overlay`; `ui-layout`/`ui-shell` → `<ui-page layout="app">`; absolute `ui-time` → `ui-date`/`ui-datetime`; `ui-modal` → `ui-dialog`; `ui-metric` → `ui-stat`; `ui-grid columns` is now exact, and `max-columns` is the cap.

Scope: how the API surface (tags, attributes, values, types, include URL, docs) is shaped so that agents' priors land on valid code, and how the diagnostics engine makes the remaining failures loud and repairable. This section owns parser and attribute traps, vocabulary design, schema and type generation, escape hatches, and the engine's record format, delivery, precision and verification modes. Geometric checks owned by other basins appear only as pointers (§10).

Inputs: 63 raw cases (llm-api 30, diagnostics 33). Output: 37 kept entries, 3 contested split-offs and 13 pointer-only cases, plus corrected sub-claims in the Appendix.

Key: **P1** owned by one place · **P2** locally readable · **P3** no hidden defaults · **P4** robust to variation · **P5** closed set · **P6** one canonical way · **P7** loud when wrong. Proposed: **GU** Guessable · **LW** Linear-writable · **TR** Transferable · **SM** Stable meaning · **ED** Explicit deviation · **CF** Convergent, actionable feedback · **ID** Intent declared · **PB** Probeable · **3V** Three-valued results · **SD** One manifest. Detect: `static` (source text or types), `runtime` (DOM or layout), `both`, `hard`.

---

## 0. Thesis

- **Most silent failures happen before CSS runs.** In a CSS-first custom-element library they come from the HTML parser (self-closing tags, foster parenting, attribute lowercasing) and from attribute-selector matching: an unknown tag becomes `display:inline`, an unknown value falls back to the default, and `"false"` means true. One manifest detects all of these exactly, with almost no false positives. Build these checks first.
- **The closed set must be guessable, not only closed.** Measure guessability with a no-docs eval, then make the most common guess canonical. The brief's own `gap="base"` and `tone="raised"` are likely misses.
- **"Loud" breaks into four obligations.** The finding must reach a channel the agent actually observes. It must be actionable: a greppable snippet, the allowed set, a literal fix and a doc anchor. It must be precise: intent is declared and results are pass, fail or unknown. And it must converge, meaning the suggested fixes reach a fixpoint.
- **P1 predicts which layer can check a result.** A result owned by one declared place can be linted statically and exactly. An emergent result needs runtime geometry and probes. A stricter grammar therefore gives a larger exact static layer.
- **Every deviation is sanctioned, local, greppable and counted, and there is no global off switch.** Otherwise agents delete the diagnostics the first time they get annoying.

## 1. Principle deltas

| Principle | What this domain shows | Proposed amendment |
|---|---|---|
| P1 | The library's own artifacts (types, validator, lint, docs) drift unless they are generated from one source. Ownership also predicts whether something can be checked statically. | Add the corollaries **SD** (one manifest) and "owned ⇒ statically checkable". |
| P2 | The non-locality agents actually hit is temporal: forward references, ID pairs, and count props chosen before the children exist. | Replace with **LW**. Context dependence is acceptable when it is declared, queryable and reported (e.g. `sticky-inert` names the ancestor). |
| P3 | The worst hidden defaults live in the parser and the engine, not in CSS initial values. Constant defaults are good because they save tokens. | "Defaults are constant, documented and good. Nothing structural is inherited, context-dependent or silently rewritten by the parser." |
| P4 | Cannot be checked on one render, and agents only test their own happy-path data. | Pair with **PB**: every variation axis can be driven from the DOM. |
| P5 | Necessary but not sufficient. A set that agents can't guess, or one that differs from prop to prop, gets missed as often as an open set. | "Closed, small, uniform across props, and guessable (measured)." |
| P6 | Conflicts with tolerance. Meaning also drifts across targets, binding paths and versions. | Split it into one way to *write* (docs, types, examples) and aliases that are *understood* (render and warn) (contested, §8). Fold in **TR** and **SM**. |
| P7 | Underspecified. | Loud *to the agent* (channel), *with a fix* (actionable), *precisely* (**ID**, **3V**), *convergently* (**CF**), and *gracefully to the human* (debug outlines appear only behind an attribute). |
| missing | Deviation | **ED** is a new top-level principle: leaving the system takes an explicit, local, greppable and counted act. |

Net recommendation: add only **GU** (amends P5) and **ED** as headline principles. LW replaces P2. TR and SM join P6. CF, ID and 3V become P7 clauses. PB joins P4. SD is P1 applied to the library itself.

---

## 2. Markup grammar: parser and attribute traps

**A1. No self-closing tags and no content-less elements** · CORE+DIAG · P3 P7 LW GU · both
- Prefer `gap`, `divided="line"` or `<hr>`, and `<ui-icon name="check"></ui-icon>` over `<ui-divider/>`, `<ui-spacer/>` and `<ui-icon name="x"/>`.
- Fails: HTML ignores `/>` on non-void elements, so `<ui-divider/>` adopts every following sibling until its parent closes. A whole section ends up styled as a divider and nothing errors. This is the JSX-trained default.
- Encode:
  - The vocabulary has no spacer or divider, and `ui-icon` is the only leaf.
  - Static check: the parse5 tokenizer error `non-void-html-element-start-tag-with-trailing-solidus` on any `ui-*` raises `UI-SELF-CLOSE`. This is more robust than a regex because it handles `>` inside attribute values.
  - Runtime check: a leaf with element children raises `UI-SELF-CLOSE` with the message "swallowed N following elements".
  - Debug CSS: `ui-icon:has(> *)`. Don't use `:not(:empty)`, which misfires on whitespace.
  - Solid is unaffected.

**A2. Parser content-model rewrites need a source-level lint** · DIAG · P3 P7 GU · static (plus a runtime heuristic)
- Prefer `<ui-table>` wrapping a native `<table>` with `ui-*` elements only inside `<td>`/`<th>`, native `<option>`, and only phrasing content inside `<p>`. Avoid `<table><ui-row>`, `<select><ui-option>`, `<p><div>`, `<a>` inside `<a>` and `<button>` inside `<button>`.
- Fails: the parser moves ("foster-parents") non-table content above the table. The legacy select parser drops children that aren't options (customizable select relaxes this only in recent Chromium). `<p>` closes itself before a block. The resulting DOM is valid, so runtime checks see nothing.
- Encode:
  - `ui check` re-parses the source with location info and applies a content-model rule over the token stream (`ui-*`, `div` or text inside table, thead, tbody, tr or select outside a cell), raising `UI-CONTENT-MODEL` with line:col.
  - Runtime fallbacks: an empty `<table>` preceded by row-like `ui-*` siblings, an empty `<p>` next to a block, or an interactive element inside another interactive element.

**A3. Bare text inside layout primitives** · DIAG · P2 P3 P7 · both
- Prefer `<p>Total: <strong>$40</strong> per month</p>` inside the primitive over `<ui-cluster>Total: <strong>$40</strong> per month</ui-cluster>`.
- Fails: each text run becomes an anonymous grid or flex item. Gap is inserted between words, wrapping happens per run and baselines misalign, so the line renders as "Total:   $40   per month" or as three stacked lines.
- Encode: a non-whitespace text node that is a direct child of an element the manifest marks as `layout` raises `UI-BARE-TEXT`. Fix: wrap it in `<p>` or `<span>`.

**A4. User-visible content goes in children; attributes are for configuration** · CORE · P2 P5 GU LW · both
- Prefer `<ui-stat><span>Revenue</span><strong>$1.2M</strong></ui-stat>` and native `<h2>` children over `heading="…"` and `label= value= delta=`.
- Fails:
  - Unescaped `"` or `&` inside attribute values breaks the tag and swallows the attributes that follow.
  - Attribute text can't hold links or emphasis.
  - Text rendered via attr() or `::before` is skipped by translation and find-in-page.
  - The library is forced to pick heading levels.
- Encode: the schema forbids props that carry user-visible content, except aria-label-style accessibility names. Child roles are detected structurally (first heading, first `<strong>`), and `UI-MISSING-PART` names the child that is expected.

**A5. Enumerated values, not presence booleans** · CORE+DIAG · P3 P5 P7 · both
- Prefer `wrap="auto|none"` and `divided="none|line"` with documented defaults. Use presence booleans only for affirmative names that default to off. Avoid `wrap="false"`, `wrap="${flag}"`, `nowrap` and `no-gap`.
- Fails: in HTML any value means true, so `wrap="false"` turns wrapping on.
- Encode:
  - The schema lint discourages boolean props.
  - A boolean attribute whose value is false, 0, no or off raises `UI-BOOL-STRING`: "presence means true; remove the attribute".
  - The Solid adapter removes the attribute when the value is `false`.
  - Do not make the CSS accept `[wrap=false i]` (see Appendix).

**A6. Attribute names: one lowercase word, never a global HTML attribute** · CORE+DIAG · P3 P7 GU · both
- Prefer `tone`, `gap`, `pad`, `cols`, `min`, `align` and a heading child over `title=`, `color=`, `width=`, `height=`, `popover`, hidden-like props and camelCase names (`minColWidth`).
- Fails:
  - `title` on a card shows a native tooltip over the whole card and is announced by screen readers.
  - `popover` turns the element into a hidden top-layer popover.
  - The parser lowercases camelCase names, so `minColWidth` becomes `mincolwidth`.
  - The library's `display:grid` beats the UA `[hidden]` rule, so `<ui-stack hidden>` stays visible.
- Encode:
  - The schema build fails on global-attribute names and on uppercase.
  - The earliest layer restores `[hidden]` and `[inert]` with `display:none !important` (the least contested use of D4).
  - `title` on a layout primitive raises `UI-TITLE-TOOLTIP`.
  - The validator maps `alignitems` and `align-items` to `align`.
  - CSS attribute-value matching is case-sensitive, so `gap="MD"` raises `UI-BAD-VALUE`.

## 3. Vocabulary: closed, guessable, uniform, stable

**B1. Canonical names are what agents guess with no docs** · CORE (process) · P5 GU · runtime (alias hits)
- Prefer the most common cross-model guess: `xs|sm|md|lg|xl` for scales and `neutral|accent|success|warning|danger` for tones.
- Avoid:
  - Idiosyncratic values: `base`, `snug`, `loose`, `raised`.
  - Numeric steps: is `gap="4"` a step or 4px?
  - Names whose meaning differs across libraries. "Stack" is vertical in Every Layout, the z-axis in SwiftUI's ZStack, and either axis in Chakra.
- Fails: agents write from priors before reading SKILL.md, and drift back to them after a few hundred lines. A closed set they can't guess leads to a silent default or a repair round-trip.
- Encode: before freezing the vocabulary, give several models only the tag name and a task, and record the names and values they produce for both the name and its meaning.
  - The most common answer becomes canonical, and runner-ups become aliases (B10).
  - Extrapolations (`2xl`) are either supported or aliased to the nearest value with a warning.
  - Alias hits are tracked so you can see where the vocabulary fights priors.
  - Re-run the eval with each model generation.

**B2. One ordinal scale for every scale-like prop** · CORE · P5 P6 TR · runtime
- Prefer `none|xs|sm|md|lg|xl` for gap, pad, radius, text size, shadow and max-width, with a few listed extras (`radius="full"`, `width="fill"`). Avoid `gap=tight|base|loose`, `pad=1..6` and `size=small|large`.
- Fails: values bleed across props (`pad="loose"`). When endpoints differ, `xl` works on gap and silently fails on radius.
- Encode:
  - The schema has one `Scale` type, and the generator rejects ad hoc enums unless they have a waiver.
  - Token names mirror the values: `--ui-space-md` ↔ `gap="md"`.
  - `UI-BAD-VALUE` prints the shared set.

**B3. Unknown element names are loud** · CORE+DIAG · P5 P7 · both
- Prefer registering every tag with `customElements.define` (an empty class for CSS-only primitives) and adding a debug tripwire, over relying on type selectors.
- Fails: `<ui-row>`, `<ui-col>`, `<ui-container>`, `<ui-flex>`, `<ui-hstack>`, `<ui-heading>`, `<ui-text>`, `<ui-input>` and `<ui-button>` parse as undefined inline elements. Their block children become anonymous-block soup that looks almost right.
- Encode:
  - Debug CSS: `html[data-ui-ready] :not(:defined){outline:2px dashed magenta}`, gated on ready so it doesn't flash before upgrade, and visible in screenshots.
  - CSS caveats: it can't filter by tag prefix, so third-party custom elements that are defined lazily get flagged too. A non-hyphenated typo (`<uistack>`) counts as `:defined` and is invisible to it.
  - Runtime: a TreeWalker raises `UI-UNKNOWN-ELEMENT` for both cases, with suggestions from an alias table mined from evals:

  | Hallucinated tag | Suggestion |
  |---|---|
  | row, hstack, flex | `ui-cluster` |
  | col, vstack | `ui-stack` |
  | container, wrapper | `ui-container` |
  | box, paper, panel, surface | `ui-card` |
  | heading, text | native `<h2>` or `<p>` |
  | input, button, select, checkbox | native control inside `<ui-field>` (semantics owns the rationale) |

**B4. Out-of-set attributes and values are loud in both CSS and JS** · DIAG · P5 P7 · both
- Prefer validity selectors generated from the manifest plus a runtime validator that names the nearest valid option, over using attribute selectors as the only contract.
- Fails: `variant="primary"`, `color="blue"`, `spacing="4"`, `gap="medium"`, `justify="between"`, or `align` on a primitive that has no `align`, all fall back to the default.
- Encode:
  - (a) CSS-only loudness that still works when the JS fails to load: `html[data-ui-debug] ui-stack[gap]:not([gap=none],[gap=xs],…){outline:2px dashed red}`.
  - (b) Runtime codes `UI-UNKNOWN-ATTR` and `UI-BAD-VALUE`, using edit distance plus a semantic alias map. Examples: spacing → gap; tone → variant (components) or color (text); `direction="horizontal"` on ui-stack → "use `<ui-row>`"; `16px` → "nearest token md (16px in current theme)".
  - Global, `aria-*` and `data-*` attributes are allowlisted. An empty `gap=""` is flagged.

**B5. No breakpoint grammar in props** · CORE+DIAG · P4 P5 P7 · both
- Prefer intrinsic primitives that respond to their container (`<ui-grid min="16rem">`, `<ui-switcher at="md">`) over `cols="1 md:3"`, `cols-md="3"` and `cols={{base:1,md:3}}`.
- Fails: agents invent this syntax from Tailwind and Chakra priors, so the default applies. Artifacts are reviewed in narrow panes, which then show the wrong variant.
- Encode: the schema has no responsive values by design. Names or values that look responsive (`/^(sm|md|lg|xl|2xl):/`, `-(sm|md|lg)$`, `{`, `base:`) raise `UI-RESPONSIVE-SYNTAX`.

**B6. Translate the utility-class reflex** · DIAG · P1 P6 P7 GU · both
- Prefer primitives plus a SKILL.md table from utility patterns to primitives, over `class="flex flex-col gap-4 p-6 rounded-xl"` and loading the Tailwind CDN to "fix" it.
- Fails: the classes do nothing without Tailwind. Adding Tailwind brings preflight, which resets the library's typography and borders, and utilities that fight the primitives over display and gap.
- Encode: the library uses attributes only, so `class` is clearly the agent's own ad hoc layer.
  - Utility-grammar tokens with no matching stylesheet rule raise `UI-UTILITY-CLASS` with a computed translation: `flex flex-col gap-4` → `<ui-stack gap="md">`.
  - Detecting the Tailwind script or preflight raises `UI-MIXED-FRAMEWORK` once.

**B7. Every other string namespace is closed: icons and the JS global** · CORE+DIAG · P5 P7 · runtime
- Prefer one icon set with aliases from the two or three most common icon libraries. An unknown name renders a fixed-size placeholder box. Avoid empty 0x0 icons and generic `TypeError: ui.toast is not a function`.
- Fails: agents mix lucide (`bar-chart-3`), heroicons (`chart-bar`) and material (`bar_chart`) names, and a blank icon slot shifts alignment. They also call `ui.init()`, `ui.toast()` and `ui.theme.set()` from other libraries.
- Encode:
  - `UI-UNKNOWN-ICON` suggests the nearest names after normalizing `-`, `_` and word order.
  - Accessing an unknown member of `window.ui` records `UI-NO-API`, which lists the real members: check(), lint(), describe(), probe(), version and theme. Whether to throw is contested (§8).
  - The Proxy must exempt `then`, symbols and `toJSON` so that `await ui`, JSON serialization and console inspection keep working.

**B8. Names never change meaning; the validator knows the API's history** · CORE+DIAG · P6 P7 SM · runtime
- Prefer renames that stay as aliases that render and warn, with `since`, `renamedTo` and `removedIn` in the schema, over repurposed names and silent removals.
- Fails: model priors blend every version in the training data. A repurposed name gives plausible but wrong output that no check can catch. An attribute newer than the pinned CDN version is silently ignored.
- Encode:
  - Codes: `UI-RENAMED`, `UI-REMOVED` and `UI-TOO-NEW` ("align=baseline added in 1.3; loaded 1.2").
  - SKILL.md frontmatter states the version and opens with a "changed since" block.
  - The Solid adapter's peer-dependency range pins the core version.

**B9. The include URL an agent guesses is the one that works** · CORE · P3 P7 GU · runtime
- Prefer one pinned bare-package URL that registers its elements and injects the matching CSS, with a CSS-only `<link>` of the same version as a fallback. Avoid:
  - deep `dist/` paths
  - separately versioned CSS and JS
  - `@latest`
  - bare-specifier imports with no import map
  - a required `ui.init()`
  - runtime theme fetches
- Fails: a hallucinated dist path returns 404, so every primitive is an inline box and the agent never sees the network error. `@latest` breaks published artifacts months later.
- Encode:
  - Set the `exports`, `jsdelivr` and `unpkg` package fields so the bare URL serves the bundle, and publish to cdnjs too.
  - No setup call and no runtime fetch.
  - A console banner shows `ui@x.y.z`.
  - The skew sentinel, script loading mode and idempotent registration belong to Host & deliver and Behavior (§10).

## 4. One schema, every target

**C1. One manifest generates everything** · CORE · P1 P6 SD · n/a
- Prefer one manifest that generates all of the following, over hand-maintained parallel artifacts:
  - the Solid d.ts
  - the runtime validator tables
  - the static-lint schema
  - the debug-layer validity CSS
  - the alias table and version history
  - the SKILL.md vocabulary table and repair anchors
- Fails: the types, the validator and the docs disagree, and the agent "fixes" its code toward the wrong one.
- Encode: CI fails when any generated artifact is stale. Every code needs a SKILL.md anchor, one failing fixture and one passing fixture.

**C2. Same tags and props in HTML and Solid** · CORE · P6 TR · static
- Prefer the raw tags typed through `JSX.IntrinsicElements`, with literal-union value types from the manifest. Wrapper components may only pass props through unrenamed. Avoid a parallel API such as `<Stack spacing={4}>` or `<Surface elevation={2}>`.
- Fails: the two dialects blend (`<ui-stack spacing="md">`, `gap={4}`) when agents paste CDN examples into Solid and the reverse.
- Encode: no `string & {}` widening in the d.ts. One SKILL.md example renders identically in both targets. A lint flags wrappers whose prop names differ from the schema.

**C3. Props work whether the framework sets attributes or properties** · CORE · P1 P7 TR · runtime
- Prefer a generated class for every element, CSS-only ones included. Its accessors reflect property → attribute and validate in the setter, and CSS reads attributes only.
- Fails: agents' priors set values in different ways.
  - Solid 1.x sets custom-element props as DOM properties (hence the `attr:` escape).
  - React 19 sets a property when `prop in el` and an attribute otherwise.
  - Vanilla code writes `el.gap='lg'` or `el.dataset.gap`.
  - A property assigned before `customElements.define` (common with deferred module scripts) shadows the accessor permanently.
  - Solid 2.0 changes the binding defaults. Verify against the released docs before baking assumptions into the adapter.
- Encode:
  - The setter calls `setAttribute`.
  - `connectedCallback` re-applies any own properties: `if (Object.hasOwn(this,p)){const v=this[p];delete this[p];this[p]=v}`.
  - The Solid types make `attr:` and `prop:` unnecessary, and the docs never show them.
  - An own property named like a prop, with no matching attribute, raises `UI-EXPANDO`.
  - All state stays visible as light-DOM attributes, so the engine needs no shadow traversal.

**C4. Put the fix in the type error** · CORE (types) · P7 CF · static
- Prefer trap keys typed as explanatory literals (`spacing?: "ui: use gap"`, `className?: "ui: in Solid use class"`) and `gap?: Scale`. Avoid plain omission ("Property does not exist") and permissive index signatures.
- Fails: a type error with no remedy pushes agents to `as any`, `@ts-ignore` or an untyped spread, which turns off checking for everything downstream.
- Encode: the generator emits trap keys from a list mined from eval failures. The runtime validator uses the identical message text, so untyped paths (artifacts, casts) get the same guidance.

## 5. Ownership, raw CSS and escape hatches

**D1. Never pass raw strings to CSS unvalidated** · CORE+DIAG · P5 P7 · both
- Prefer presets (`cols="2"`, `split="sidebar"`, `ratio="2:1"`). Where raw CSS is accepted, validate it with `CSS.supports(prop, value)` and parse and check the area map. Avoid piping `areas="'a a' 'b c d'"` straight into `grid-template-*`.
- Fails: CSS drops the whole declaration on any parse error. A non-rectangular area map kills the layout, and a child `area=` that isn't in the template is auto-placed into an implicit track. Agents often miscount cells in ASCII area maps.
- Encode: codes `UI-INVALID-CSS`, `UI-AREAS-SHAPE` (prints the parsed matrix), `UI-AREA-UNKNOWN` and `UI-AREA-EMPTY`. The same parser runs in the static lint. Implicit-track semantics belong to the layout section.

**D2. Structural custom properties are namespaced, registered and non-inheriting; every token reference is checked** · CORE+DIAG · P2 P3 P7 · both
- Prefer per-primitive internal variables (`--ui-stack-gap`) registered with `@property{syntax:'<length>';inherits:false;initial-value:…}`, public theme tokens that inherit, and a token registry. Avoid shared unregistered `--gap` and hallucinated `var(--ui-color-primary)` or `var(--spacing-4)`.
- Fails:
  - `style="--gap:3rem"` leaks into every nested stack.
  - A bad unregistered value (`--gap:16`) is invalid at computed-value time, so the property becomes `unset`.
  - An undefined `var()` with no fallback also becomes `unset`: color inherits the wrong ink and padding collapses.
  - Malformed declarations (`padding:1.2 rem`) are dropped at parse time and appear only as struck-out lines in DevTools.
- Encode:
  - `@property` gives a known fallback and stops inheritance.
  - A runtime scan of same-origin `document.styleSheets` and inline styles raises `UI-UNKNOWN-TOKEN` for any `var(--ui-*)` not in the registry, with the nearest names.
  - Diffing the `<style>` source text against the CSSOM raises `UI-DROPPED-DECLARATION`, skipping intentional fallback pairs.
  - Exception: color tokens are not registered (the color section owns this).

**D3. Audit author CSS that touches owned properties** · DIAG · P1 P6 P7 · both
- Prefer library CSS in `@layer ui.*` plus an audit of unlayered author rules and inline styles that set owned properties on primitives. Avoid unaccounted `<style>` blocks, pasted resets (`*{margin:0;padding:0}`), broad selectors (`div,section{display:flex}`) and Tailwind preflight.
- Fails: agents write 100 to 300 lines of habitual CSS. Unlayered author CSS beats layered library CSS regardless of specificity, so structure is silently overridden, and the flex negotiation the grammar removed comes back.
- Encode:
  - For each author rule outside `@layer ui`, test primitive instances with `el.matches(rule.selectorText)`.
  - If the rule sets an owned property, raise `UI-OWNED-PROPERTY` with the rule text, the `<style>` index and the canonical attribute to use instead. Owned properties: display, gap, grid-template-*, position, margin on children, padding on ui-surface, raw px font-size, hex colors, numeric z-index.
  - The check is denylist-based, which keeps false positives low.
  - An info line gives the style budget: N author rules and M inline styles touching `ui-*`.
  - It reuses the layout section's table of no-op declarations.

**D5. One sanctioned, local, explicit escape hatch; suppression is per element with a code and a reason** · CORE+DIAG · P1 P2 P7 ED · both
- Prefer `gap="custom" style="--ui-stack-gap:3px"`, where the enum value unlocks the registered variable so two co-located tokens are required, or a counted raw `<ui-box>`. Suppress with `data-ui-allow="UI-CLIPPED: marquee"`. Avoid having no hatch at all (which pushes agents to `!important`, wrapper divs and scattered inline styles), a silent `data-no-diag`, and a global `ui.diagnostics.disable()`.
- Fails: under a "fix all warnings" instruction, the cheapest path is to suppress or delete the dev script, after which every later failure is silent.
- Encode:
  - Escapes are reported at info level with a count, and the summary says "N suppressed (codes)".
  - An unused suppression raises `UI-UNUSED-ALLOW`.
  - A suppression without a reason is an error.
  - A global disable logs a persistent warning listing what it hides.
  - The canonical snippet has no off switch.
  - Each SKILL.md anchor says when suppression is legitimate.

## 6. Linear-writable structure

**E1. Containment over paired references; every reference resolves exactly once** · CORE+DIAG · P2 LW P7 · both
- Prefer `<label>Email <input></label>`, `<ui-field><label>Email</label><input type=email></ui-field>` wired by structure, `<ui-popover>` wrapping both trigger and panel, tabs that derive `aria-controls`, and ids and anchor names generated by the library. Avoid hand-written `for`/`id`, `aria-labelledby`/`aria-controls`, `popovertarget`/`commandfor` and `anchor-name`/`position-anchor` pairs.
- Fails: token-by-token generation can't verify a reference it hasn't written yet. One typo means the popover never opens or the label isn't associated, with no error. Copy-pasted cards duplicate `id="chart"` four times, so every card's button wires to the first chart.
- Encode:
  - `UI-DUP-ID` and `UI-DANGLING-IDREF` cover `for`, `aria-*`, `popovertarget`, `commandfor`, `list`, `form`, `headers`, `href="#x"`, anchor names found in CSS, and SVG `url(#id)`, and suggest the nearest existing id.
  - Both the static lint (exact line) and the runtime check (dynamic content) run it.
  - Field wiring belongs to semantics, anchor scoping to overlays, and SVG ids to media.

**E2. Repeated children: content-adaptive, parent-owned props; detect drift between siblings** · CORE + DIAG(info) · P1 P4 LW · runtime
- Prefer `<ui-grid min="14rem">` over `cols="3"` committed before the children exist. Set spacing once on the parent, or use composites with no internal spacing props.
- Fails: the agent picks three columns, generates four or five items and leaves an orphan row. A later edit sets `pad="lg"` on one copy of a card while the others keep `md`.
- Encode: info codes `UI-ORPHAN-ROW` (when `cols` doesn't divide the child count; suggests `min=`) and `UI-SIBLING-DRIFT` (a value that differs from the majority among same-signature siblings). Declared roles such as featured are exempt. The heuristic is contested (§8).

## 7. Diagnostic record, delivery and precision

**F1. A record shaped for repair from text alone** · DIAG · P7 CF · both
- Prefer one JSON record per finding plus a one-line text form, over `console.warn(el)` (which serializes to `{}` in tool logs), prose-only messages and `div:nth-child(3)` paths.
- Fields:

  | Field | Contents |
  |---|---|
  | `code` | Stable slug, never reused. Severity is not part of the code, so a reclassification never renames it. |
  | `severity`, `confidence` | Separate fields. |
  | `path` | Component path, e.g. `ui-container > ui-stack[2] > ui-card[elevated]`. |
  | `snippet` | The opening tag as written in source, so it can be grepped. |
  | `src` | `file:line`, when known. |
  | `got`, `allowed` | The received value and the allowed set. |
  | `context` | Probe width, scheme, state, mutation and engine. |
  | `cause` | One sentence. |
  | `fix` | Ordered literal edits. |
  | `docs` | Anchor into SKILL.md. |
  | `fingerprint` | Stable identity across runs. |

- Text form: `UI-BAD-VALUE gap="medium" on <ui-stack gap="medium" pad="md"> (main > ui-stack[2]); allowed none|xs|sm|md|lg|xl; fix: gap="md"; SKILL.md#ui-bad-value`.
- Encode:
  - Identical snippets are collapsed (`×12`).
  - When one root cause produces many symptoms, report the outermost cause and count the symptoms.
  - Show the top N findings by severity, then "N more".
  - A fingerprint diff on re-run reports "2 fixed, 1 new, 3 remain".

**F2. Source attribution: the static pass owns positions, the runtime owns geometry** · DIAG · P2 P7 CF · both
- Prefer joining runtime findings to `file:line` through a static parse of the source (parse5 with location info), keyed by path, attributes and a text fingerprint. Always include a greppable snippet. For Solid, a dev-only transform adds `data-src="file:line"` (stripped in production), plus the template origin and item key for list items. Avoid reporting DOM selectors only.
- Fails: "ui-card overflows" with twelve cards in the file, so the agent edits the wrong one or rewrites the whole file.
- Encode: the browser can't see source offsets, so the split is by design. Markup built in JS strings gets a snippet and path, and a line number only when it is built through a tagged `html` helper that the lint understands.

**F3. Deliver findings in every channel an agent might observe** · DIAG · P7 CF · runtime
- Prefer one emitter that writes to all of these:
  - the console, as one `[ui-diag] {json}` line plus a human-readable summary
  - `window.__ui.diagnostics`
  - `data-ui-diag="CODE"` on the offending element
  - `<script type="application/json" id="ui-diagnostics">`
  - under `html[data-ui-debug]`, a summary block rendered in the page
  - CLI stdout
- The rendered block exists because tools that read the accessibility tree or the page text show neither data attributes nor script JSON.
- Also route the other silent failure channels through the same stream:
  - `error` and `unhandledrejection`
  - capture-phase resource `error` events
  - `securitypolicyviolation`
  - images with `naturalWidth=0`
  - failed font loads

  These raise `UI-RUNTIME-ERROR` and `UI-RESOURCE-FAILED`.
- Fails: single-file flows publish without ever running the page, and each agent tool sees a different slice (CDP console, JS evaluation, accessibility tree, screenshot).
- Encode: the engine's MutationObserver must ignore the engine's own `data-ui-diag` writes, or it re-triggers itself. A host that swallows the console, and the banner for fatal errors, belong to Host & deliver.

**F4. A severity contract, and fixes that converge** · DIAG · P7 CF · both
- Prefer three severities with a stated contract:

  | Severity | Meaning | Contract |
  |---|---|---|
  | error | Renders wrong or loses content | Must reach zero |
  | warn | Probably wrong | Review |
  | info | Taste or advisory | Never blocks |

  Every rule ships a literal fix. Avoid taste lints at error level, and rules whose fixes conflict (removing a margin triggers "missing spacing"; adding a wrapper triggers "redundant wrapper").
- Fails: agents either bounce between rules or decide everything is noise and ignore the errors too.
- Encode:
  - CI runs fuzz → apply all suggested fixes → re-check, and asserts a fixpoint with no new diagnostics.
  - Rule metadata declares which other rules a fix can affect.
  - Each code has a cap with a count.
  - The summary leads with the error count.
  - A rule is promoted from info to warn to error only when it meets a precision target, e.g. under 5% false positives on a corpus.

**F5. Precision through declared intent and three-valued results** · DIAG · P7 ID 3V · runtime
- Anything that looks like a failure but may be designed must be declared, through an attribute or a primitive: clipping, truncation, scroll regions, overlap and suppression (`truncate`, `clamp="2"`, `<ui-scroll-area>`, a declared overlay, `data-ui-allow`). Checks return pass, fail or unknown, with a confidence. Avoid geometry heuristics that guess, and boolean checks that fail on images, gradients or blend modes.
- Fails: false positives train agents to suppress diagnostics or ignore them. An honest "unknown" costs less than a false failure.
- Encode:
  - `UI-CLIPPED` fires only when content is clipped, exceeds its box, and no clip intent is declared. The library's `truncate` and `clamp` set the declaration themselves.
  - `UI-COLLISION` (info) fires for overlapping text or interactive leaf boxes outside a declared overlay, and is run for each probe.
  - Contrast over images and gradients raises `contrast-unverifiable` at info level, with the suggestion "add `<ui-scrim>`".
  - The specific rules belong to their owning sections (§10). This entry is the shared contract.

**F6. Settle before measuring, and make zero mean something** · DIAG · P4 P7 · runtime
- Prefer a settle protocol owned by the engine: `fonts.ready`, image decode, two animation frames, ResizeObserver quiet, `getAnimations()` finished, and motion frozen in probe mode. Expose `await ui.check()` returning JSON and a `window.__uiReady` promise, and re-check on mutations with debouncing. The summary says "checked 312 elements, 41 rules (static+dom+layout) at T". Avoid scanning only at DOMContentLoaded or during enter animations.
- Fails: Solid apps and dashboards render after load, so a load-time scan of an empty `#app` reports "0 issues", a false green the agent trusts. In-flight animations and fallback fonts cause false overflow and overlap.
- Encode: reads are batched. In production the engine is off or sampled. One exception: layout-shift observation starts at navigation, before the page settles.

## 8. Verification modes

**G1. Declare per rule whether it is static or runtime** · DIAG · P1 P7 · both
- Prefer rule metadata `layer: static|dom|layout`.
  - Static (HTML and CSS ASTs, types) owns: unknown tags, attributes and values; content model; self-closing; required parts; token existence; references; escape usage; raw px, hex and z-index; `vh`; `order`; parse errors; and Baseline status.
  - Runtime owns geometry: overflow, clipping, collision, occlusion, contrast, state shift, focus order, line measure, and dead sticky or collapsed container elements.
- Fails: with everything at runtime, a sandbox with no browser gets zero checks. With everything static, geometry has to be guessed (`width:400px` ⇒ overflow?), which gives noisy heuristics.
- Encode: `npx <pkg> check page.html` runs the static pass in milliseconds, then headless Chromium. `ui.lint(htmlString)` runs in the page. SKILL.md's first step tells the agent to run `check` before publishing.

**G2. Probeable by construction: every variation axis can be driven from the DOM** · CORE+DIAG · P4 P7 PB · runtime
- Prefer:

  | Axis | Driven by |
  |---|---|
  | Width | The library root is a container, and the probe sets its inline size to 320, 375, 768, 1024 and 1440. |
  | Scheme and theme | `data-theme` + `color-scheme` + `light-dark()`, not only `prefers-color-scheme`. |
  | State | `:is(:hover,[data-force~=hover])` mirrors and ARIA toggles. |
  | Content | Text slots listed in the manifest get 3× length, a 40-character unbroken token, pseudo-localized text, RTL, and 0, 1 or 100 items. |

  Avoid checking only one render at the agent's default viewport with its own happy-path data.
- Fails: dark mode is never verified, because an in-page probe can't flip a media query. Jitter from bold-on-select and focus borders is never seen.
- Encode:
  - `ui.probe({widths, schemes, states, mutations})` keys each finding by context and collapses repeats ("first appears at ≤520px", "only when title ×3").
  - In-page width probing is faithful except for viewport units, `position:fixed` and media queries. The CLI varies the real viewport for those.
  - Probe in place inside a frozen-motion window and then restore, not on an offscreen clone.
  - The stress content set and `data-ui-stress` belong to variation.

**G3. Hit-test interactive elements for occlusion** · DIAG · P7 · runtime
- Prefer scrolling each interactive element into view and calling `elementFromPoint` at its center and at inset points, including after programmatic focus. Avoid inferring clickability from the element's presence in the DOM.
- Fails: an invisible stuck popover, a transparent pseudo-element, a full-width wrapper or a sticky bar covers a button, and the screenshot still looks fine.
- Encode: `UI-OCCLUDED` names both elements and how they stack, and runs for each probe width. Hit-testing honours `pointer-events:none`, so the check measures real clickability. Inset points avoid false positives on rounded corners.

**G4. A feature-support sweep for engines the agent didn't test** · DIAG · P3 P4 P7 · both
- Prefer running `CSS.supports` over the manifest of features the library uses (anchor positioning, field-sizing, interpolate-size, `@scope`, `light-dark()`, `text-wrap`, `contrast-color()`). Each missing feature raises one `UI-FEATURE-MISSING` (info) naming the fallback in effect. Add a static Baseline check on author CSS, and optionally run the CLI in WebKit and Firefox. Avoid verifying only in the agent's own Chromium.
- Fails: the agent's screenshot from a recent Chromium looks perfect, while Safari mispositions the popover.
- Encode: progressive enhancement with explicit fallbacks, and `context.engine` on every finding.

**G5. A text rendering of the layout for agents without vision** · DIAG · P7 CF · runtime
- Prefer `ui.describe()`: for each probed width, a compact tree of path, rect, key attributes and a text snippet, with an optional ASCII wireframe. For agents with vision, add a set-of-marks screenshot whose numbered boxes are keyed to the findings. Avoid relying on screenshots alone: they are slow and nondeterministic, miss 12px defects, and are unavailable to text-only models.
- Encode: describe() uses the same path scheme as the findings. Its advisories (left-edge drift, ragged siblings in the same role) are info-level and low-confidence, and never errors.

## 9. Docs

**H1. SKILL.md: skeleton first, complete vocabulary, a prior → canonical table, and only valid code in fences** · GUIDANCE (+ CI doc tests) · P6 GU · hard
- Prefer this order:
  1. The pinned include and a complete minimal page that passes `check`.
  2. A generated table of every element, attribute, value and default.
  3. An "if you're about to write X, write Y" table keyed to Tailwind, Chakra, Bootstrap, React and SwiftUI priors.
  4. One repair anchor per code.

  Keep it short enough to read in full. Avoid prose-first tutorials, partial lists ("common props include…"), anti-patterns inside fenced blocks, and lorem-ipsum examples.
- Fails: agents copy fenced code verbatim regardless of any "Don't" label, and infer the whole vocabulary from the first few examples.
- Encode: the doc build runs every fenced block through the lint and headless diagnostics and fails on any warning. Anti-patterns appear only as inline code in table cells. Examples use stress content: long names, 7-digit numbers, an empty state. Exemplar diversity belongs to Expressive range.

---

## 10. Contested

| ID | Position A | Position B | Suggested resolution |
|---|---|---|---|
| B10 Render-and-warn aliases | Aliases (`base`→`md`, `xxl`→`2xl`, `tone`→`variant`) render the intent, so the end user sees a working artifact. | Aliases become a de facto API that grows without bound. Agents never learn the canonical names, and P6 erodes. | Strict writer, tolerant reader. Aliases exist only for guesses measured in evals, and they always warn. They never appear in types or docs, and B8 history retires them. |
| C5 Solid `style` typed to `--ui-*` keys only | Closes the inline-style escape route. | Legitimate one-offs (chart height, transform) push agents to `as any`, which turns off all checking. | Allow `--ui-*` plus a typed list of properties the library doesn't own. Owned properties are flagged by D3, not by the type system. |
| D4 Layered `!important` for structural invariants | Pasted resets and Tailwind preflight silently break structure. Earliest-layer `!important` beats all unlayered author CSS, except inline `!important`. | The contrarian position: the library must lose every specificity fight (`@layer`, `:where()`, no `!important`). Intended overrides would need force. | Use `!important` only for `[hidden]`, `[inert]` and a short invariant list such as `min-width:0` on grid items. Everything else stays overridable but audited (D3): loud, not locked. |
| X1 Diagnostics on by default in published artifacts | The agent's preview is its only run. | Cost and noise for end users. | On for artifacts but silent to humans (console, JSON and data attributes only). Outlines and the summary block appear only with `data-ui-debug`. Apps are off or sampled in production. There is no runtime global disable. |
| X2 Unknown `window.ui` member: throw or not | Throwing is loud. | A throwing `get` breaks feature detection (`if (ui.toast)`) and `?.`. A stub function makes the detection falsely truthy. | Record `UI-NO-API` on access and return `undefined`. The resulting TypeError and the diagnostic then appear together. |
| X3 Sibling-drift and orphan-row heuristics (E2) | They catch copy-paste drift. | Featured cards and bento layouts are intentional asymmetry. | Info level only, with declared roles exempt. |
| X4 Guessable names vs unambiguous ones | The most common guess (`Stack`) minimizes misses. | That guess brings cross-library ambiguity about meaning (vertical vs z-axis). | The eval scores the name *and* its inferred behavior. Prefer names with one dominant meaning. |

## 11. Code registry (sorted by precision)

| Code | Sev | Layer | FP risk | Entry |
|---|---|---|---|---|
| `UI-SELF-CLOSE` | E | static+dom | ~0 | A1 |
| `UI-UNKNOWN-ELEMENT` | E | static+dom+css | ~0 (the CSS outline also flags undefined third-party elements) | B3 |
| `UI-BAD-VALUE` / `UI-UNKNOWN-ATTR` | E / W | static+dom+css | ~0 / low (globals, `aria-*` and `data-*` allowlisted) | B4 |
| `UI-BOOL-STRING` | E | static+dom | ~0 | A5 |
| `UI-RESPONSIVE-SYNTAX` | E | static+dom | ~0 | B5 |
| `UI-CONTENT-MODEL` | E | static (+dom heuristic) | ~0 static | A2 |
| `UI-DUP-ID` / `UI-DANGLING-IDREF` | E | static+dom | ~0 | E1 |
| `UI-UNKNOWN-TOKEN` | E | static+dom | ~0 within `--ui-*` | D2 |
| `UI-INVALID-CSS` / `UI-AREAS-SHAPE` / `UI-AREA-UNKNOWN` | E | static+dom | ~0 | D1 |
| `UI-REMOVED` / `UI-TOO-NEW` / `UI-RENAMED` | E / E / W | dom | ~0 | B8 |
| `UI-UNKNOWN-ICON` / `UI-NO-API` | E | dom | ~0 | B7 |
| `UI-RUNTIME-ERROR` / `UI-RESOURCE-FAILED` | E | dom | ~0 | F3 |
| `UI-BARE-TEXT` | W | static+dom | low | A3 |
| `UI-UTILITY-CLASS` / `UI-MIXED-FRAMEWORK` | W | dom (static without the stylesheet check) | low | B6 |
| `UI-TITLE-TOOLTIP` / `UI-EXPANDO` / `UI-STATE-CLASS` | W | dom | low | A6, C3, §12 |
| `UI-UNUSED-ALLOW` | W | dom | low | D5 |
| `UI-DROPPED-DECLARATION` | W | static+dom | medium (fallback pairs) | D2 |
| `UI-OWNED-PROPERTY` | W | dom (+static) | medium (intended overrides should use D5) | D3 |
| `UI-OCCLUDED` | W | layout | medium | G3 |
| `UI-CLIPPED` / `UI-COLLISION` | W / I | layout | medium; depends on declared intent | F5 |
| `UI-FEATURE-MISSING` | I | dom | ~0 (it reports a fact) | G4 |
| `UI-ORPHAN-ROW` / `UI-SIBLING-DRIFT` | I | dom | high | E2 |

Observation: every near-zero-FP check is derived from the manifest and needs no geometry. The strict grammar is what buys that precision. Geometric checks only become precise once intent is declared (F5).

## 12. Pointers (owned elsewhere; what this section contributes)

| Case | Owner | Contribution here |
|---|---|---|
| Horizontal overflow culprit finder | sizing-overlays, variation | F1 record format and G2 width probes |
| Dead sticky and `overflow:clip` | layout, sizing-overlays | — |
| `container-type` zero-width collapse | layout, variation, contrarian | — |
| Visual order vs DOM and tab order | layout, semantics | — |
| Nested scrollers and focusable scroll regions | semantics, sizing-overlays | — |
| Accessible name, heading outline, landmarks | semantics | — |
| Line measure, text-size floor, off-scale value audit | typography, fundamentals (near-miss audit) | — |
| Document preflight (viewport, lang, charset, doctype, color-scheme) | semantics (boilerplate) | — |
| Layout shift from late media and fonts | variation, media | F6 settle exception |
| Contrast gate and composited background | color, typography | F5 three-valued contract |
| Native controls instead of `ui-input` (form association) | semantics | B3 alias entries |
| State from ARIA and native state, not classes | semantics, color | `UI-STATE-CLASS` (class tokens active, selected, is-open or error on items inside ui-tabs, ui-nav or ui-field) |
| Light DOM for primitives | contrarian | Diagnosability rationale in C3 |
| Silent no-op ("inactive") declarations | layout | Reused by D3 |
| CSS/JS version-skew sentinel, emergency CSS, idempotent registration, blocking vs module script | Host & deliver, Behavior | B9 covers only the guessable URL |
| Host swallowing the console; fatal-error banner | Host & deliver | F3 multi-channel emitter |
| Stress content set and `data-ui-stress` | variation | G2 DOM-drivable axes |

---

## Appendix: dropped, merged and corrected

**Pointer-only (13), owned elsewhere:**
- [llm-api] Style native controls instead of replacing them → semantics.
- [llm-api] Style state from ARIA and native state attributes → semantics and color.
- [diagnostics] Ineffective properties → layout.
- [diagnostics] Horizontal overflow → sizing-overlays.
- [diagnostics] Visual order → layout and semantics.
- [diagnostics] Sticky silently fails → layout.
- [diagnostics] Nested scroll containers → semantics.
- [diagnostics] container-type collapse → layout.
- [diagnostics] Accessible-name, heading and landmark structure → semantics.
- [diagnostics] Typography sanity → typography.
- [diagnostics] Document-level preflight → semantics.
- [diagnostics] Layout shift attribution → variation and media.
- [diagnostics] Light DOM and attribute API → contrarian.

**Merged duplicates (diagnostics → kept entry):**
- Self-closing → A1
- Parser error recovery → A2
- Enum typos → B4 and C1
- Dropped CSS and undefined tokens → D2
- Escape-hatch audit → D3
- Clipped content, overlap and contrast uncertainty → F5
- Mutation, width, theme and state probing → G2
- Reference integrity → E1
- Unified failure channels → F3
- Loud escape hatches → D5
- Diagnostic format → F1
- llm-api "Feedback channel" → split into G1, F3 and F6

**Corrected or dropped sub-claims:**

| Raw claim | Correction |
|---|---|
| Self-close check by regex | Use parse5's tokenizer error instead. A regex breaks on `>` inside attribute values. |
| `ui-icon:not(:empty)` debug selector | Use `:has(> *)`. `:empty` misfires on whitespace and on text. |
| `data-ui-diag` is visible to accessibility-tree readers | Wrong: data attributes are not exposed. Added the rendered summary block under `data-ui-debug` (F3). |
| Layered `!important` beats all author CSS | Not inline `!important`, because element-attached styles win. |
| An undefined `var()` makes muted text turn black | It becomes `unset`. Inherited properties take the parent's value, which is still wrong but not necessarily black. |
| Solid 2.0 betas are attributes-first and drop `attr:` | Unverified; marked "verify against released docs" (C3). |
| Tolerant CSS can treat `[wrap="false" i]` as off | Dropped: it diverges from HTML semantics and hides drift. |
| `window.ui` Proxy throws on any unknown access | Exempt `then`, symbols and `toJSON`; record and return `undefined` (X2). |
| Probe on an offscreen clone | Clones lose canvas content, listeners and Solid reactivity. Probe in place or in the CLI's page instead. |
| `<ui-field label="Email">` (E1 example) | Conflicts with A4. Changed to a `<label>` child wired by structure. |
| "Manifest marks childless ui-divider and ui-spacer" vs "no leaf elements" | Resolved: no spacer or divider exists, and `ui-icon` is the only leaf. |
| Codes with a severity letter (`UI-E012`, `UI-W-…`) | Use slug codes with severity as a separate field, so reclassifying a rule never renames its code. |
| "One-word last line" typography lint | Dropped as a taste lint owned by typography (and `text-wrap: pretty` handles it). |
