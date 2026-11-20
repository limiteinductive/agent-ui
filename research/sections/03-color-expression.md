# Color, theming and expressive range

> **Names superseded 2026-11-20** by the name-guess eval. See [../vocabulary.md](../vocabulary.md) and [../layout-vocabulary.md](../layout-vocabulary.md). The cases below still hold. Old spellings that remain here are pre-eval: `tone=` → `variant` on components / `color` on text; `accent` → `primary`; `positive|caution|critical` → `success|warning|danger`; `pad` → `padding`; `busy` → `loading`; `none` → `0`; `ui-surface` → `ui-card` (`elevated`/`sunken`/`inverse`); `ui-callout` → `ui-alert`; `ui-time` (relative) → `ui-relative-time`; `ui-cluster|split|bar|reel|switcher|sidebar` → `ui-row` modifiers. Round 2 (same day): `scrollable` → `scroll`; `threshold` → `stack-below`; `ui-layers` → `ui-overlay`; `ui-layout`/`ui-shell` → `<ui-page layout="app">`; absolute `ui-time` → `ui-date`/`ui-datetime`; `ui-modal` → `ui-dialog`; `ui-metric` → `ui-stat`; `ui-grid columns` is now exact, and `max-columns` is the cap.

Scope: color roles, schemes, contrast verification, state color, elevation, the theme contract and its expressive axes, decoration, genre-level composition and data color. There were 56 raw cases: 28 from the color lens and 28 from the expressive-range lens. 39 are kept, 12 are merged into other cases and 5 are reduced to pointers (see the appendix).

**Legend.** Tier: `CORE` means enforced by primitives, tokens or types. `DIAGNOSTIC` means a runtime or static check. `GUIDANCE` means SKILL.md only. `CONTESTED` means the case is disputed. Detect: static, runtime or both. Principles: P1–P7 as drafted. Proposed sub-rules (see "Principle revisions"):

- **PAIR**: paired by construction
- **BOUND**: decidable or bounded
- **UAO**: survives UA overrides
- **SEM**: semantics drive style
- **AXES**: orthogonal declared variation
- **ATTR**: defaults are attractors
- **INERT**: inert decoration
- **TASTE**: soft loudness for taste

## Thesis

- **The unit of color correctness is the pair, not the value.** Almost every color bug an agent ships is two valid values in the wrong relation: inherited ink on a new background, white on yellow, a brand-colored ring on a brand-colored button. The library must own the relation. A surface sets its background and every ink in one act.
- **Strict over roles, open over values.** Tone, ink, intent, state, elevation and axis names are closed sets. Their values come from theme seeds. Because the role set is closed, exhaustive verification is cheap: about 4k pairs per theme.
- **Worst-case bounds make the unverifiable verifiable.** Text over photos, glass, scrims and decoration can't be checked against one sampled backdrop. Under normal compositing, though, their luminance always lies between the composite over pure black and the composite over pure white. Primitives that guarantee this bound can be checked. Everything else reports UNVERIFIABLE, never a pass.
- **The UA rewrites color more than any other channel.** Sources: system colors, `color-scheme: normal`, forced colors, print economy and iframe canvas rules. Meaning has to ride on channels that survive these rewrites: border, outline, text, shape and ARIA state.
- **Expressive range comes from orthogonal theme axes and named compositions, not from escape hatches.** The default theme and the SKILL.md examples are the strongest attractors in the system, so they need active counter-pressure.

---

## A. Pairing and ownership

### A1 · Surface owns its ink
`CORE` · both · P1 P2 PAIR
- **Prefer** `<ui-surface tone="base|sunken|raised|overlay|inverse|accent|intent-*">`. It re-declares background, `color`, `--ink`/`--ink-muted`/`--ink-subtle`, borders, `--focus`, state-layer ink and `color-scheme` for its subtree. Text takes only role tones (`<ui-text tone="muted">`). **Avoid** a background on an arbitrary div (inline style or utility class) whose ink is inherited or set per element.
- **Failure:** a dark promo band with `style="background:#0f172a"` keeps the page inks. Gray-500 captions (#6b7280) land at 3.7:1 and blue-600 links (#2563eb) at 3.5:1. Each value was valid; the relation was never set. This extends the seed case "OKLCH pairs over raw hex": the pair also needs an owner.
- **Encoding:** closed tone enum. Solid gets `tone: SurfaceTone` and no `bg`/`color` string props. Diagnostics:
  - `COLOR_UNOWNED_BACKGROUND`: an element with an opaque computed background that differs from the nearest surface's `--surface` and contains text. Links to `SKILL.md#surfaces`.
  - `COLOR_LITERAL`: color literals in inline styles.

### A2 · Ink levels are a closed ladder; muted clears 4.5:1 everywhere
`CORE` · both · P5 P7
- **Prefer** these ink roles:
  - `default`
  - `muted`: at least 4.5:1 on every tone, scheme and contrast level
  - `subtle`: at least 3:1, only for large text, meaningful icons and decoration
  - `disabled`

  Placeholders use muted. **Avoid** ad-hoc gray-300…700 for captions, timestamps and helper text.
- **Failure:** this is the most common contrast bug in generated UI. Text that "looks secondary" lands at 2.5–3:1, and meaningful icons (status glyphs, sort arrows) fall under 3:1.
- **Encoding:** `ui-text tone` enum. The token build verifies muted for each tone × scheme × contrast level. `INK_SUBTLE_SMALL_TEXT` fires when subtle resolves on text below 24px, or below 18.66px for bold. Muted and subtle are disallowed below weight 400 or below 14px.

### A3 · Two border roles, both derived from ink
`CORE` · both · P5 P7. The 3:1 rule itself belongs to [fundamentals] "Functional boundaries need 3:1"; this case covers the token mechanics.
- **Prefer** two roles:
  - `--border-subtle: color-mix(in oklab, var(--ink) 12%, transparent)` for dividers. No contrast requirement, and it adapts to any surface.
  - `--border-control` for input, select, checkbox, radio and switch. At least 3:1 against the surface, verified at build.

  Filled controls with an alpha border get `background-clip: padding-box`. **Avoid** one hex gray (#e5e7eb, about 1.2:1 on white) used for both dividers and fields.
- **Failure:** fields and checkboxes vanish on white, which looks fine on a retina review screen. The same hex vanishes on raised gray and glares on dark. A translucent border composites over the control's own fill, so the control's edge against the page is undefined.
- **Encoding:** form primitives use only `--border-control`. `CONTROL_BOUNDARY_LOW` fires when a control's border (or its fill, if it has no border) is below 3:1 against the adjacent effective background.

### A4 · Intents are role bundles; on-solid ink is computed
`CORE` · both · P5 P1 PAIR
- **Prefer** closed intents `{neutral, accent, info, positive, caution, critical}`. Each exposes `{ink, surface, on-surface, border, solid, on-solid}` per scheme. For example, light-mode caution ink is a dark amber-brown, not amber-500. On-solid is chosen by contrast. **Avoid**:
  - `text-red-500`
  - `bg-yellow-400 text-white`
  - one brand hex used as both fill and text in both schemes
  - status dots without a label
- **Failure:**
  - Red-500 text on white is 3.76:1; amber-500 is about 2.1:1.
  - White on yellow, lime, cyan or amber is unreadable.
  - A mid-lightness brand blue passes as link text on white and fails on dark.
  - A bare dot means nothing to color-vision-deficient (CVD) users or to screen readers.
- **Encoding:** the intent enum is on every primitive.
  - **On-solid:** use `contrast-color()`. The explorer reports it in Chrome 147, Firefox 146 and Safari 26; these versions are not verified here. Keep a relative-color fallback.
  - **Black/white guarantee:** the better of black or white always gives at least 4.58:1, with the crossover at luminance ≈0.18. A black/white flip therefore guarantees AA body text on any opaque solid. Tinted on-solids must be verified.
  - **Fallback threshold:** the explorer's fallback `oklch(from var(--solid) clamp(0, (l / 0.62 - 1) * -infinity, 1) 0 0)` is biased toward white. On neutral solids with L 0.565–0.62 it picks white at only 3.65–4.58:1 (see Contested #5).
  - **Types and diagnostics:** Solid types make `label` required on `ui-badge` and `ui-status`. `COLOR_HUE_LITERAL` is static. `INTENT_COLOR_ONLY` fires for a status indicator with no accessible name.

### A5 · The focus ring color is owned by the surface
`CORE` · runtime · P1 P7 PAIR. Outline-only drawing belongs to [semantics] "Focus ring ownership".
- **Prefer** `outline: 2px solid var(--focus); outline-offset: 2px`. Inverse, accent and intent surfaces re-declare `--focus` so it clears 3:1 against both the surface and the default control fill on it. The offset gap shows the parent surface, so the ring is two-tone for free. **Avoid** one brand-blue ring everywhere.
- **Failure:** a blue ring on a blue primary button or an accent banner is about 1.2:1, and keyboard users lose their place. Agents test focus only on the base surface.
- **Encoding:** `--focus` is surface-owned and verified at build against every tone and solid. `FOCUS_RING_LOW` runs on `focusin`. It compares the outline with the element's fill and with the effective background beyond the offset.

### A6 · Theme native controls through paired color hooks
`CORE` · both · P6 P3 PAIR. Native vs rebuilt controls belongs to [llm-api]/[semantics].
- **Prefer** these hooks, set per surface from tokens: `accent-color: var(--accent-solid)`, `color-scheme`, `scrollbar-color`, `caret-color`, and `::selection { background: var(--selection-surface); color: var(--selection-ink) }` set as a pair. **Avoid** div checkboxes built only to recolor them, `::-webkit-scrollbar` hacks, and `::selection` that sets only a background.
- **Failure:** a `::selection` background alone keeps the original ink, so selected text drops to low contrast. Without `color-scheme`, autofill and scrollbars ignore the theme.
- **Encoding:** hooks live in the base layer. `SELECTION_UNPAIRED` (static) fires when a `::selection` rule sets only one of background or color.

---

## B. Scheme mechanics and environment

### B1 · One mode switch: `color-scheme` plus `light-dark()` tokens
`CORE` · both · P1 P2 P6
- **Prefer** these rules:
  - Every color role is a `light-dark(a, b)` token.
  - `color-scheme: light dark` on the root follows the OS.
  - `[data-scheme=light|dark]` on `html` or on any surface forces a scheme.
  - `tone=inverse` sets the opposite scheme locally.

  **Avoid** scattered `@media (prefers-color-scheme: dark)` blocks, `.dark .card` overrides, and dark themes that never declare `color-scheme`.
- **Failure:**
  - The in-page toggle never reaches media-query blocks, and a dark section inside a light page can't be built.
  - Without `color-scheme`, scrollbars, `<select>` popups, date pickers and autofill stay light. An autofilled field turns light blue with near-white text.
  - `.dark .x` selectors add specificity, which agents answer with `!important`.
- **Encoding:** the token sheet uses `light-dark()` throughout. Scheme is a subtree property, so an inverse surface flips its tokens and the native controls inside it together. Diagnostics:
  - `SCHEME_MEDIA_QUERY_AUTHORED`: a CSSOM scan of non-library sheets.
  - `SCHEME_MISMATCH`: the used scheme is light but the resolved surface has OKLCH L < 0.5, or the reverse.

  Probing flips the attribute rather than emulating the media query; that belongs to [diagnostics].

### B2 · Re-declare inks at every scheme boundary; never register color tokens
`CORE` · runtime · P3 P2
- **Prefer** unregistered custom properties that hold `light-dark()`. Every element that changes `color-scheme` re-declares `color: var(--ink); background-color: var(--surface)`. **Avoid** `@property --ink { syntax: '<color>' }`, and avoid relying on `:root { color: light-dark(…) }` to inherit into a dark island.
- **Failure:** `light-dark()` resolves at computed-value time. Any inherited `<color>` value, both registered properties and `color` itself, is frozen to the ancestor's scheme. The island flips the background it declares, but its text inherits the frozen light-mode near-black, giving black on near-black. Agents register `@property` "for type safety" or to animate theme transitions. Engines have disagreed here, and a CSSWG proposal for used-value-time resolution is open, so this may change.
- **Encoding:** the library registers no role color tokens; it registers only deliberate snapshots such as `--_parent-surface`. Every scheme-changing primitive re-declares color, background and border colors. `SCHEME_BOUNDARY_FROZEN` runs at each element whose used scheme differs from its parent's: it recomputes ink against surface and flags failures.

### B3 · Scheme lifecycle: tri-state, set before paint, light for print, no transition on the flip
`CORE` · both · P3 P4. Forced schemes in hosts and capture belong to [gap:Host]; `transition: all` belongs to [media-data-motion].
- **Prefer**:
  - A CSS-only OS default: `color-scheme: light dark` plus `<meta name="color-scheme" content="light dark">`.
  - An explicit override written to `<html data-scheme>` by a tiny synchronous head snippet.
  - A tri-state System/Light/Dark control.
  - `@media print { :root { color-scheme: light } }`.
  - Transitions suppressed for one frame during the flip, or a View Transition crossfade.

  **Avoid** adding `.dark` on DOMContentLoaded from localStorage, two-state toggles, and color transitions on many elements.
- **Failure:**
  - Artifacts that load the library from a CDN flash the wrong scheme, and the remote fetch widens the gap.
  - A two-state toggle can never return to "system".
  - Printing a dark page under the default `print-color-adjust: economy` puts light ink on white paper.
  - `transition: all .3s` gives about 300ms of mixed-contrast frames.
- **Encoding:**
  - The head snippet is documented in SKILL.md.
  - `<ui-scheme-toggle>` is tri-state, with storage access wrapped in try/catch.
  - During the flip the library sets `[data-scheme-switching] * { transition: none !important }` for one frame, or uses `startViewTransition`.
  - The print rule is in the base layer.
  - `SCHEME_FLASH` fires when the root scheme attribute or class changes within N ms of first paint.

### B4 · Always paint the root canvas
`CORE` · runtime · P3 P1
- **Prefer** a theme that always emits `html { background: var(--surface-base); color: var(--ink); color-scheme: … }` plus the meta tag. **Avoid** transparent `html`/`body` that assume the host page or the UA Canvas color matches.
- **Failure:**
  - **Dark host:** an artifact embedded in an iframe on a dark host with no declared scheme gets an opaque white canvas. The spec paints an opaque canvas when the used schemes of the embedding element and the embedded root differ.
  - **Mismatched dark:** a transparent page with `color-scheme: dark` shows the UA Canvas (about #121212) behind surfaces themed to a different dark, which shows as seams in gaps and on overscroll.
  - **Invisible to checks:** the computed background still reads transparent, so naive checks miss both problems.
- **Encoding:** the base layer paints the root. `ROOT_UNPAINTED` fires when the computed backgrounds of `html` and `body` are both transparent.

### B5 · Remap leaking UA system colors; top-layer elements re-root their tone
`CORE` · runtime · P3 P1 P2
- **Prefer** `<ui-dialog>` and `<ui-popover>` as `tone=overlay` surfaces, plus a base reset that maps UA system-color defaults to theme pairs: `mark` to the highlight pair, fields to the field pair, `::backdrop` to the scrim token. **Avoid** bare or partly styled `<dialog>`, `[popover]`, `<mark>` and `<input>`.
- **Failure:**
  - The UA sheet gives dialog and popover `Canvas`/`CanvasText`, so they open pure white (or #121212) in a warm or tinted theme.
  - `<mark>` is system yellow in dark mode, and inputs keep the white `Field` color on gray raised cards.
  - A popover authored inside an inverse sidebar inherits the sidebar's dark scheme and inks through the DOM, even though it renders over the light page.
- **Encoding:** popovers and dialogs re-root `color-scheme` and tone to the page or to an explicit tone, not to their DOM parent. `UA_SYSTEM_COLOR_LEAK` fires for a top-layer or form element whose computed background equals the resolved `Canvas` or `Field` color while the nearest surface token differs.

### B6 · Survive forced colors: carry meaning in borders, outlines, text and ARIA
`CORE` · both · P4 P3 P7 UAO. General preference fallbacks belong to [variation]; `FOCUS_SHADOW_ONLY` belongs to [semantics].
- **Prefer**:
  - Every interactive primitive carries `border: 1px solid transparent`, counted in its size so there is no layout shift, plus an outline focus ring.
  - One `@media (forced-colors: active)` block maps states to `SelectedItem`, `Highlight`, `GrayText`, `LinkText` and `ButtonText`/`ButtonFace`.
  - Charts scope `forced-color-adjust: none` to plot marks only and add direct labels or patterns.

  **Avoid** shadow focus rings, borderless buttons defined only by their fill, gradients as boundaries, and a global `forced-color-adjust: none`.
- **Failure:** forced colors drop box-shadow, text-shadow and non-url background images, and replace background colors. Buttons become floating text, toggles lose their state, and every chart series turns into one system color. Agents never test this mode, so the failure stays silent.
- **Encoding:** the transparent-border and outline pattern is in every primitive. Selected and current map to system colors through the same ARIA hooks as normal styling. `BOUNDARY_FILL_ONLY` fires for an interactive element with no border, no outline and a distinct fill.

---

## C. Verification

### C1 · Contrast gate: WCAG 2.2 floor, size- and weight-aware; APCA advisory
`DIAGNOSTIC` · both · P7 BOUND. Pass/fail/unknown reporting belongs to [diagnostics] "Contrast checking with honest uncertainty".
- **Prefer** a check that reads computed `font-size` and `font-weight`:
  - **WCAG thresholds:** 4.5:1 for normal text; 3:1 at 24px and up, or 18.66px bold and up; 3:1 for non-text UI (1.4.11).
  - **APCA Lc, reported alongside:** about 75 for body, 60 for content, 45 for large text, 30 for non-essential.
  - **Defaults:** the theme's default pairs must pass both.

  **Avoid** 4.5:1 regardless of size, citing APCA as the compliance standard, and trusting a WCAG pass for dark pairs or thin weights.
- **Failure:**
  - #777 on #000 passes WCAG at 4.7:1 but looks dim and falls short of APCA's body-text guidance.
  - A 300-weight 13px gray caption passes and is still hard to read.
  - On mid-tone saturated fills such as orange, the two algorithms disagree about white vs black text, and agents flip-flop.
  - Agents apply the large-text exemption to 16px semibold.
- **Encoding:** `CONTRAST_FLOOR {wcag, apca, threshold, fontSize, weight, scheme}`. It is an error below the WCAG floor and an advisory for an APCA shortfall, optionally weighted up in dark scheme. The token build verifies both.

### C2 · Non-solid backdrops: a worst-case bound, or UNVERIFIABLE (scrim, glass, decor)
`CORE` · both · P7 P4 BOUND. The scrim rule is shared with [contrarian] "Text over imagery needs a declared scrim"; the glass containing-block trap belongs to [sizing-overlays].
- **Prefer** two things together:
  - **A composite-walking engine.** It alpha-composites ancestor backgrounds and opacity. When it reaches an image, gradient, video, canvas, backdrop-filter or blend mode, it emits `CONTRAST_UNVERIFIABLE`.
  - **Primitives that carry a provable bound:** `<ui-media-overlay scrim="bottom|full">` and `<ui-surface material="glass">`.

  **Avoid**:
  - checking text against its own transparent background
  - text-shadow as the contrast strategy
  - `rgba(0,0,0,.3)` overlays
  - `rgba(255,255,255,.1)` with `blur(10px)` glass
  - nested glass
- **The bound:**
  - **Why it holds:** under source-over compositing, each output channel is monotone in the backdrop channel, and blur only averages backdrop pixels. So the composite's luminance over any backdrop lies between the composite over pure black and the composite over pure white.
  - **The safety condition:** ink is safe if and only if its luminance lies outside that interval and it passes against the nearer end.
  - **Why "both ends" is wrong:** passing against both ends is not enough. With a wide interval, an ink can pass both ends and still meet a mid-tone backdrop at 1:1.
  - **Blend modes:** modes such as `difference` break monotonicity, so they are unverifiable.
- **Derived numbers:**
  - **Scrim:** white body text over any image needs a black scrim of at least 0.54 alpha under it; large text needs at least 0.42.
  - **Glass floors:** the glass tint floor depends on the ink role. Near-black default ink needs about 0.5. Muted ink needs 0.8–0.97, depending on its value: #6b7280 needs about 0.97.
  - **Consequence:** muted text on glass effectively needs an opaque surface, so glass is practical only for default ink and large text.
- **Failure:**
  - Lint passes because the element's own background is transparent.
  - The hero works on the photo the agent imagined and fails on the real one: white text on bright sky.
  - A glass header is readable over the hero and unreadable over a table scrolling beneath it.
  - `prefers-reduced-transparency` exists only in Chromium, so its fallback does not reach every browser.
- **Encoding:**
  - **Derived alpha:** scrim and glass alpha are derived from ink role and text size, never chosen by the author.
  - **Placement:** grid placement keeps text inside the guaranteed region.
  - **Glass fallbacks:** glass falls back to opaque under `forced-colors`, under `prefers-reduced-transparency: reduce`, and under `@supports not (backdrop-filter: blur(1px))`.
  - **Menus:** menus inside glass render in the top layer.
  - **Diagnostics:** `GLASS_UNBOUNDED` fires for backdrop-filter with background alpha below the floor. `GLASS_FIXED_DESCENDANT` fires for a fixed or absolute descendant of a backdrop-filter element.
  - **Reuse:** `<ui-decor>` uses the same bound (G5).

### C3 · Alpha only on adornments: opaque surfaces, opaque inks, disabled tokens, painted overlays
`CORE` · runtime · P4 P1 P6 BOUND. aria-disabled vs the disabled attribute belongs to [semantics].
- **Prefer**:
  - An opaque surface ladder.
  - Alpha only for state layers, borders, scrims and shadows.
  - Secondary text in an opaque per-surface `--ink-muted`.
  - Disabled shown with `--ink-disabled`/`--surface-disabled`/`--border-disabled`, mapping to `GrayText` in forced colors, on `aria-disabled`.
  - `<ui-sticky>` and fixed bars that paint their surface token.

  **Avoid** `rgba(255,255,255,.05)` card tones, `opacity: .6` or rgba ink for secondary text, `opacity: .5; pointer-events: none` for disabled, and a sticky header with no background.
- **Failure:**
  - Translucent panels nested three deep compound into an unpredictable tone.
  - `opacity` on a text block also dims its icons, badges and focus ring, creates a stacking context, and makes contrast depend on whatever is underneath.
  - `pointer-events: none` kills the "why is this disabled" tooltip.
  - A sticky header with no background lets body text scroll through its labels. This shows only after scrolling, so static review misses it.
- **Encoding:** `ui-sticky` paints the parent surface's token. Diagnostics:
  - `ALPHA_SURFACE`
  - `OPACITY_TEXT`: opacity below 1 on a text-bearing element that isn't disabled or animating.
  - `DISABLED_BY_OPACITY`
  - `OVERLAP_TRANSPARENT`: a sticky, fixed or top-layer element that contains text and has a transparent background chain up to its stacking parent.

### C4 · Verify the closed matrix at theme registration, not only the rendered snapshot
`CORE` · static · P5 P7 BOUND. Stress mode belongs to [variation]; the "validate the theme" principle is shared with [fundamentals].
- **Prefer** a verifier that enumerates surface tone × ink role × intent × state (rest, hover, pressed, selected, disabled, focus) × scheme × contrast level. It also covers each component form (F3) and each theme-axis extreme. It runs in library CI, and in the browser through `ui.theme.verify()` for custom themes. **Avoid** relying on runtime checks of whatever state and scheme happen to be on screen in the agent's one screenshot.
- **Failure:** the agent checks light mode at rest. A selected row (accent surface, muted ink at 3.9:1), dark-mode hover, or a caution callout at high contrast is never rendered, so it ships broken.
- **Encoding:** `THEME_MATRIX_FAIL {surface, role, state, scheme, contrast, ratio, apca}`. The closed role set makes this feasible: 7 tones × 4 inks × 6 intents × 6 states × 2 schemes × 2 contrast levels is about 4k pairs, cheap enough to run at registration. The engine can also flip the scheme on the live page and re-check.

### C5 · Color math: L picks the step, the checker decides the pair; mix in oklab
`GUIDANCE` · static · P4 P3 P6
- **Prefer** a generator that:
  - fixes L and H per step;
  - reduces chroma until text roles fit sRGB, using P3 only for decorative and accent fills behind `@media (color-gamut: p3)`;
  - lowers chroma on large dark fills;
  - then verifies contrast numerically.

  Tints, state mixes and gradients interpolate in oklab: `color-mix(in oklab, …)` and `linear-gradient(in oklab, …)`. **Avoid**:
  - assuming equal OKLCH L gives equal WCAG contrast
  - hand-written out-of-gamut values like `oklch(0.7 0.3 150)`
  - HSL "lighten 10%" ramps
  - `color-mix(in srgb)` for tints
  - oklch interpolation between distant hues or near-neutrals
- **Failure:**
  - "L=0.55 for every intent" passes for blue and gives different ratios for yellow and green, because WCAG uses relative luminance, not OKLab L.
  - Out-of-gamut chroma is clipped per channel today, which shifts hue and renders differently on P3 and sRGB screens.
  - sRGB mixes go muddy and produce gray dead zones in gradients.
  - oklch red-to-green swings through yellow, and a near-gray with tiny chroma picks up an arbitrary hue.
- **Encoding:** build-time gamut mapping and verification. Static diagnostics:
  - `OUT_OF_GAMUT`: authored oklch or lch values beyond sRGB on text roles.
  - `MIX_SPACE_NONCANONICAL`: `color-mix(in srgb|hsl)`, and gradients with no interpolation hint.

---

## D. State color

### D1 · Interactive states: one ink-derived state layer; selected comes from ARIA and differs from hover
`CORE` · static · P6 P4 BOUND SEM. ARIA as the state hook belongs to [semantics]/[llm-api]; hover gating is shared with [variation].
- **Prefer** a single state mechanism:
  - **The mix:** `background-color: color-mix(in oklab, var(--fill), var(--state-ink) var(--state-pct))`. `--state-ink` is the control's own on-color, so the mix moves the fill toward its own ink and stays visible on any fill in either scheme.
  - **The ladder:** `--state-pct` steps through a fixed ladder: hover about 8%, pressed about 12%, dragged about 16%.
  - **Gating:** hover rules sit inside `@media (hover: hover)`; pressed applies everywhere.
  - **Selected and current:** keyed on `[aria-selected=true]`, `[aria-current]`, `[aria-pressed=true]` and `:checked`. Each gets its own level plus a non-color cue: an inset start bar, a check, or a weight change.

  **Avoid** per-component hover hexes (`hover:bg-blue-600`), `filter: brightness(.9)`, gradient overlays, unconditional `:hover`, and `.active`/`.selected` classes that only add a tint.
- **Failure:**
  - "Darker on hover" in dark mode lowers contrast.
  - A gray hover on a gray raised surface is invisible.
  - `filter: brightness` dims the label text and creates a stacking context.
  - On phones the last-tapped row keeps its hover tint, which reads as "selected".
  - A hovered row looks the same as the selected one.
  - Selection shown only by tint fails WCAG 1.4.1 and vanishes in forced colors.
- **Encoding:** state tokens live in primitives, so agents never write hover colors. `color-mix` yields a solid computed color the engine can verify. An overlay gradient can't be checked and isn't forced-colors-safe. In forced colors, selected maps to `SelectedItem`/`SelectedItemText` and current to `Highlight`. Diagnostics:
  - `STATE_COLOR_LITERAL`: authored `:hover`/`:active` rules that set literal colors.
  - `HOVER_UNGATED`
  - `SELECTED_HOVER_INDISTINCT`: build-time check that selected and hover composites differ by at least a minimum ΔL.

---

## E. Enclosure and elevation

### E1 · Elevation is a semantic ladder; the surface-style axis and the scheme decide how it is drawn
`CORE` · both · P5 P4 P1 AXES. The card-soup rule belongs to [fundamentals].
- **Prefer** tones `{sunken, base, raised, overlay}`. Their expression is compiled from `theme.surface-style = bordered|tinted|lifted|ruled|open` and from the scheme:
  - **Light:** the same or a brighter fill, plus a shadow.
  - **Dark:** a lighter tonal fill, plus a 1px top highlight or alpha border.
  - **Shadow color:** tinted from the ambient surface (`oklch(from var(--surface) 0.25 c h / a)`).
  - **Shadow scope:** shadows only for floating layers.
  - **Overlay border:** overlays always carry a border, transparent normally and visible in forced colors.

  **Avoid**:
  - per-component box-shadows
  - black shadows on dark
  - a shadow on every card
  - raised inside raised inside raised
  - shadow, bordered and gradient cards mixed on one page
  - "borderless" cards whose fill equals the page
- **Failure:**
  - Dark-mode cards with only a shadow merge into the page.
  - Black shadows look muddy on colored surfaces.
  - Nested raised cards lose hierarchy.
  - Forced colors remove box-shadow, so a shadow-only menu has no edge.
  - Card style changes from section to section.
- **Encoding:** `<ui-surface>` takes no border or shadow prop; the theme axis decides. The registration check requires the enclosure to be perceptible: a fill difference of at least some ΔL, or a border or rule. 3:1 applies only to functional boundaries (Contested #10). Diagnostics:
  - `SURFACE_EDGE_INVISIBLE`
  - `ELEVATION_NESTING_DEEP`: more than 2 levels.
  - `RAW_BOX_SHADOW`
  - `SURFACE_STYLE_MIXED`: same-tone siblings with different enclosure signatures.

---

## F. Theme contract

### F1 · A theme is color seeds plus orthogonal axes; every role is derived; palette steps stay private
`CORE` · both · P1 P5 P6 PAIR AXES
- **Prefer** a public theme contract of:
  - **Color seeds:** paper and neutral tint, ink, accent hue and chroma, and contrast level.
  - **About 10 independent bounded axes:** listed in the table below.

  All roles are derived in `@layer ui.theme` with relative color syntax and `color-mix`. Palette scales stay private (`--_p-blue-6`). `prefers-contrast: more` raises the single contrast-level seed. **Avoid**:
  - overriding 40 role tokens
  - palette steps (`--blue-600`) referenced inside components
  - per-component `prefers-contrast` patches
  - a theme that is just three hex values
  - presets that bundle axes (radius plus font plus shadow), so "sharp + warm serif + airy" can't be expressed
- **Failure:**
  - **Beige surface:** the agent sets `--surface` to beige and leaves `--ink-muted` and `--border-control` as they were computed for white, which silently breaks contrast.
  - **Hue only:** when only color is exposed, about 90% of output differs by hue alone.
  - **Entangled presets:** a "zine" brief can't be expressed without raw CSS, which breaks invariants.
- **Encoding:** registration schema `{seeds, axes, brief?}`. Each axis documents its token footprint, and a property test asserts that flipping one axis changes only its own family. Diagnostics:
  - `PRIVATE_TOKEN_REFERENCE`: `--_p-*` in author CSS.
  - `THEME_PAIR_BROKEN`: runs after any registration or override and re-verifies every pair in both schemes.
  - `RADIUS_OFF_LADDER`
- **Rejected encoding:** the expressive lens proposed derived tokens as "non-inheriting registered custom properties". That fails twice. A registered `<color>` freezes `light-dark()` (B2), and with `inherits: false`, descendants of `:root` see only the initial value.

| Axis | Values | Derives | Mechanics owned by |
|---|---|---|---|
| color seeds | paper, ink, accent (h, c), neutral tint, contrast level | all color roles, state inks, focus, viz ramps | this section |
| shape | sharp, soft, round, pill, organic | radius per role (control, surface, pill, media), concentric nesting | [fundamentals] concentric radii |
| surface-style | bordered, tinted, lifted, ruled, open | how sunken, raised and overlay are drawn (E1) | this section |
| density | airy, base, tight (inherited scope) | spacing, control height, line-height, all within floors | [fundamentals] density scope |
| register | app, marketing, editorial | which type register and measure apply | G2, [typography] |
| type-pairing | registry key | display, text and mono families, metrics, one font request | G1, [typography] |
| scale-ratio | 1.125–1.618 | type steps; display uses a larger exponent | [typography] |
| ornament | none, rule, grain, pattern, marks | rule style, list marker, section mark, corner marks (G3) | this section |
| motion | still, crisp, gentle, springy | durations, easings (spring via `linear()`), stagger step | [media-data-motion], [semantics] |
| icon-stroke | hairline, regular, bold (shares a weight seed with type) | `--icon-stroke` | [fundamentals] one icon family |
| image-treatment | natural, mono, duotone, halftone, grain | one filter/mask recipe on `ui-media` (G4) | this section |

### F2 · Theme scopes re-derive and spend a declared deviation budget
`CORE` · both · P1 P2 P5 P7
- **Prefer** `<ui-theme accent=… shape=…>` scopes:
  - They inherit seeds and may override color seeds freely.
  - They may override `shape`, `ornament` and `motion` only with a `reason`.
  - They can never change the focus contract, target size or contrast floors.
  - Each scope re-derives roles and re-runs the color matrix.
  - Co-branded content goes in a `guest` scope.

  **Avoid** inline custom-property overrides on a section, a second full theme dropped mid-page, and light inks inherited into a dark scope.
- **Failure:** tokens end up half-overridden, ink and background mismatch, the focus ring is invisible on the guest surface, and the page reads as incoherent.
- **Encoding:** override classes are free, declared or forbidden. Re-derivation uses nested custom-property sets, optionally with `@scope`. P2 then reads as "the element plus its nearest declared scope". Diagnostics:
  - `THEME_SCOPE_RAW_VARS`: role tokens set inline outside a scope.
  - `THEME_SCOPE_DEVIATION`: reason missing.
  - `THEME_SCOPE_COUNT`: more than 2 undeclared themes.

### F3 · Components expose a closed set of anatomical forms; each form declares how it meets the invariants
`CORE` · both · P1 P5 P7
- **Prefer** per-component forms:
  - button: `solid|pill|underline|bracket|outline`
  - card: `bordered|ruled|tinted|open`
  - input: `boxed|underlined|filled`

  A form may change paint, border style, radius and ornament glyphs. It must name a provider for each invariant:
  - boundary: `underline|border|fill-contrast`
  - hit area: `padding|pseudo-expansion`
  - focus ring
  - non-color state cue

  **Avoid** restyling buttons with raw background, border and padding, or an open `variant` string where `variant="fancy"` silently does nothing.
- **Failure:** a "brutalist underlined" button ends up 18px tall, with no boundary against the page and no hover/pressed distinction. Or `variant="glass"` does nothing at all.
- **Encoding:**
  - **Registry check:** a form registry runs each form through the C4 matrix (minimum size, 3:1 control boundary, focus visible on every tone) and refuses forms that fail.
  - **Unknown values:** an unknown value emits `UI_FORM_UNKNOWN` with the allowed set; closed-enum mechanics belong to [llm-api].
  - **Invariant protection:** uses the layered-`!important` mechanism from [llm-api] "Protect owned properties".
  - **Naming:** don't name the attribute `form`. On `<button>` and on form-associated custom elements it is the form-owner attribute, so a form-associated `<ui-button form="pill">` would silently detach from its form. It also breaks the [llm-api] global-attribute rule. Use something like `look`.

### F4 · The default theme is an attractor
`CONTESTED` · runtime · P3 ATTR P7
- **Prefer** a neutral but credible default that is flagged when left unchanged, plus a required theme declaration. Axes left undecided are filled deterministically from an explicit `seed` (or a hash of the brief), within the chosen archetype's ranges, and reported as inferred. **Avoid** a polished default that becomes 80% of outputs, and one global fallback for every unset axis.
- **Failure:** this violates P3 at the corpus level. The default theme is the library's largest hidden default, and lazy declarations collapse to identical output.
- **Encoding:**
  - `THEME_UNDECLARED` advisory, plus a "default theme" corner badge in dev mode.
  - `THEME_AXIS_INFERRED` lists the seeded axes in the resolved theme JSON so the agent can pin them.
- **Why contested:** a deliberately "wireframe" default gives up first-shot quality, which is the library's goal. Seeding from the document title means renaming a page silently re-skins it. Proposed resolution: a credible neutral default, the advisory, and seeding only from an explicit `seed`.

### F5 · SKILL.md: a brief-to-axes table and a set of mutually distant exemplars
`GUIDANCE` · static · P3 P5 ATTR
- **Prefer** a documented pipeline: brief → genre archetype (zine, calm-fintech, brutalist-portfolio, editorial-longform, playful-consumer, enterprise-dense, luxury-minimal, …) → axis vector → seeds. Supporting material:
  - **Adjective table:** calm means low chroma, soft shape, gentle motion and airy density. Zine means pattern ornament, mixed pairing, hard borders and pill tags.
  - **Exemplars:** at least 6, spanning genres, each given as an axis vector plus a one-line rationale.
  - **Instruction:** "derive from the brief; don't copy the nearest exemplar."

  **Avoid** freehand "indigo, Inter, rounded-lg, soft shadow" for every brief, and a single canonical example page whose tokens get copied into every output.
- **Failure:** brief words are never turned into decisions, and the agent regresses to the training-data mode. The library's own example then causes the convergence it was meant to prevent.
- **Encoding:** an optional `ui theme --from-brief` lists the 3 nearest archetypes and the axes not yet decided. The docs build computes pairwise fingerprint distance between exemplars and fails if any pair is too close. `THEME_NO_BRIEF` advisory. Requiring a `rationale` field and "move at least 2 axes off the archetype" is contested: agents fill ceremony fields with boilerplate, and dashboards often should stay conventional.

---

## G. Expressive axes that need their own primitive or registry

### G1 · Type pairing is a registry of tested pairs
`CORE` · both · P1 P5 P6. Font loading, metric overrides, and x-height and loaded-weight diagnostics belong to [typography]/[fundamentals].
- **Prefer** `theme.type-pairing=<key>` with 8–12 keys spanning genres (editorial-serif, grotesk-mono, humanist-slab, geometric-display, …). Each key resolves to display, text and mono roles with fallback metrics, loaded weight axes and one combined font request. New pairs come only through registration with metrics. **Avoid** free `font-family` names, three families with seven weights, and Inter everywhere.
- **Failure:** typeface is the strongest identity lever. Agents either never touch it (sameness) or pick fonts that cause layout shift, faux bold and mismatched x-heights.
- **Encoding:** pairing registry JSON (`googleFontsQuery`, weights, fallback metrics). Diagnostics are owned by [typography]: `FONT_UNLOADED_WEIGHT`, `FONT_MULTI_REQUEST`, `FONT_PAIR_XHEIGHT`.

### G2 · Display type is a separate register above the UI scale
`CORE` · both · P3 P4 P5. Fluid-type mechanics belong to [typography].
- **Prefer** display roles (`display-l`, `display-xl`, `mega`) derived from scale-ratio with a larger exponent:
  - a container-relative clamp with a rem floor and ceiling
  - line-height 0.9–1.05
  - `text-box-trim`
  - balanced wrapping
  - a capped number of uses per page, on headings and lockups only

  **Avoid** stopping at the app-scale ceiling (2–3× body), and hand-rolled `vw` clamps with negative tracking.
- **Failure:** landing and editorial pages lack drama because the largest role is barely bigger than h2. `vw` hacks overflow at 320px and ignore user zoom.
- **Encoding:** registers `ui | prose | display`. `DISPLAY_OVERFLOW` fires when a word is wider than its container at the minimum size. `DISPLAY_ON_CONTROL`.

### G3 · Ornament comes from theme-owned glyph slots
`CORE` · static · P1 P3 P5
- **Prefer** ornament slots supplied by the theme:
  - `--rule`: line, double, dashed, dotted, wavy or thick-thin
  - list marker
  - section mark, via `content: "§" / ""`
  - corner marks
  - tag shape

  `<ui-divider kind="rule|mark|space">` and the list primitives consume them. **Avoid** emoji bullets, `***` paragraphs, repeated `<hr>` with inline borders, and hard-coded dashed background images.
- **Failure:** hand-pasted ornament can't be themed, is read aloud by screen readers and is wrong in forced colors. Otherwise ornament is left out, so identity never goes beyond the palette.
- **Encoding:** slot tokens. `ORNAMENT_IN_TEXT` fires for decorative unicode runs or emoji in text nodes and suggests the slot.

### G4 · Image treatment is applied once, before the scrim
`CORE` · runtime · P1 P3 P5. Ratio, focal point and alt text belong to [media-data-motion].
- **Prefer** `theme.image-treatment` applied to every `<ui-media>` through one filter/mask recipe seeded from ink and paper; duotone uses a single deduplicated SVG filter. Per-image overrides go only through a closed `treat=` set. The treatment sits under the scrim, so the C2 bound still holds. **Avoid** ad hoc `filter: grayscale()` on some images, and blend modes on text containers.
- **Failure:** photos with mixed treatments look pasted together. Duotone and halftone take deep CSS knowledge, so agents never use one of the biggest identity levers.
- **Encoding:** treatment recipes in a layer on `ui-media`. `MEDIA_TREATMENT_MIXED` fires when sibling media have different filter chains and no declaration.

### G5 · One inert decoration channel
`CORE` · both · P1 P3 P4 P7 INERT BOUND. Stack sizing belongs to [contrarian] "Stacking with grid-area 1/1 makes every layer size the box".
- **Prefer** all decoration through `<ui-decor kind="rule|grid|dots|grain|wash|blob|stripes|marks|art" intensity="whisper|quiet|loud">`, or `decor=` on bands:
  - `aria-hidden` and `pointer-events: none`
  - painted in the stack cell without adding to its size (`contain: size`, or `position: absolute; inset: 0`)
  - `contain: paint`
  - hidden in forced colors, optional in print
  - parameters from tokens

  **Avoid** `::before` gradients, absolutely positioned blobs with negative offsets, emoji sparkles, and SVG backgrounds as `<img>`.
- **Failure:** blobs cause horizontal overflow, intercept clicks and get announced by screen readers. They vanish in forced colors and leave text unreadable, and they sit behind body text at 2:1.
- **Encoding:** content above the decor is checked against the decor's worst-case composite, using the C2 bound with the pattern's minimum and maximum luminance, not against the flat base. There is a cap on decor layers per band. Diagnostics:
  - `DECOR_OVERFLOW`
  - `DECOR_CONTRAST`
  - `DECOR_INTERACTIVE_CHILD`
  - `DECOR_IN_FLOW`: a low-confidence heuristic for empty aria-hidden elements with a background image outside the channel.

---

## H. Genre-level composition

### H1 · Make it a primitive only if it owns a layout or semantic contract; otherwise make it a validated recipe
`GUIDANCE` · static · P1 P5 P6
- **Prefer** this test: does the pattern need parent-owned cross-item alignment, a named composition, or a semantic contract? If so, it is a primitive; if not, a recipe.
  - **Primitives:** `ui-band`, `ui-hero`, `ui-lockup`, `ui-bento`, `ui-compare`, `ui-quote`, `ui-opener`.
  - **Recipes:** validated HTML snippets in SKILL.md that pass lint: testimonial walls, logo clouds, FAQ, stats strips, timelines, footers.

  **Avoid** a primitive for every marketing pattern, or none at all.
- **Failure:** with too many primitives the closed set becomes unguessable. With too few, the hardest genres (pricing, bento) are left to emergent flex.
- **Encoding:** the decision test is in SKILL.md, and the docs build lint-checks the recipes.

### H2 · Lockup: eyebrow, heading, deck and actions as one unit
`CORE` · both · P1 P2 P5 P6. Heading level from structure and the one-primary rule belong to [fundamentals]/[semantics].
- **Prefer** `<ui-lockup scale="display|section|card">` with fixed slots, parent-owned spacing, a derived heading level, and an action row that allows one primary action. **Avoid** ad hoc h2 + p + button stacks with arbitrary margins.
- **Failure:** section headers differ by accident, the eyebrow is larger than the heading, there are two primary actions, or the deck sits far from its heading.
- **Encoding:** slots by attribute. `LOCKUP_RANK_INVERTED` fires when the eyebrow's computed size is larger than the heading's. `LOCKUP_MULTI_PRIMARY`.

### H3 · Named compositions on page lines replace the centered stack
`CORE` · both · P1 P4 P5 P6. Named lines and the page gutter belong to [fundamentals].
- **Prefer** `<ui-hero compose="split|stacked|overlay|offset|type-only|ledger" media-side="start|end">`:
  - Spans come from a closed ratio set: 5:7, 1:2, 7:5, full.
  - Copy comes first in DOM order; media is placed by grid lines.

  For asymmetric blocks, use `place="lead|hang|offset|bleed-end|wide"`. `text-align: start` is the default. **Avoid**:
  - a centered H1 + subline + two buttons + glow
  - `order: -1` for mobile
  - `vh` hero heights
  - asymmetry through `margin-left` or negative offsets
- **Failure:**
  - Every landing page opens with the same centered hero.
  - The hero clips on short or zoomed viewports.
  - Media reorders focus.
  - Pixel-offset asymmetry breaks at other widths.
- **Encoding:** closed enums with unknown-value diagnostics. Hero `min-block-size` is based on `svh` with a cap. `overlay` requires a C2 scrim. Centering is surfaced through the taste tier (`CENTER_EVERYTHING`).

### H4 · Bands take tone and density from closed sets
`CORE` · runtime · P4 P5 P7 TASTE
- **Prefer** `<ui-band tone=… density="roomy|base|tight" decor=…>`. `tone` reuses the surface tone enum (base, sunken, inverse, accent) plus `image`. **Avoid** ten identical sections on one background, and random color blocking that spends the accent budget.
- **Failure:** a monotone page with no pacing, or an accent diluted across the whole page.
- **Encoding:** band tones are surfaces (A1), so inks follow automatically. The explorer's `paper|sunk` names must merge into the surface vocabulary, per [llm-api] "One ordinal vocabulary". The sequence check `RHYTHM_MONOTONE` lives in the taste tier (H8).

### H5 · Bento: spans are declared by role
`CORE` · both · P1 P5 P6. Implicit tracks and `dense` packing belong to [layout].
- **Prefer** `<ui-bento>` children with `weight="lead|wide|tall|base"`, resolved through a closed template table keyed by item count (3–7). DOM order is preserved, and the layout collapses on container queries. **Avoid** raw `grid-column: span 2` in auto-fill grids, `dense` packing, and six equal cards.
- **Failure:** cards of uniform weight have no focal item. Attempts to vary weight leave holes or reorder focus.
- **Encoding:** template table. `BENTO_COUNT_UNSUPPORTED`, `BENTO_HOLE`.

### H6 · Editorial opener and prose ornaments use real CSS features
`CORE` · both · P1 P3 P5. Prose measure and wrapping belong to [typography].
- **Prefer** `<ui-opener>` with kicker, headline, deck, byline/time and lead. Supporting features:
  - **Drop cap:** `initial-letter`, 2–4 lines, with an `@supports` float fallback.
  - **Pull quotes:** `<figure><blockquote>` with a cite.
  - **Side notes:** on the aside column.
  - **Punctuation:** `hanging-punctuation`.

  **Avoid** float drop caps with magic em margins, quotes built as styled divs, and pull quotes that screen readers read twice.
- **Failure:** editorial pages look like blog templates, built on fragile floats, with duplicate announcements.
- **Encoding:** a pull quote that repeats body text requires `of="#id"`, and the library sets `aria-hidden` on it. Diagnostics check that the reference resolves.

### H7 · Pricing and comparison: one primitive, at most one featured plan
`CORE` · both · P1 P2 P4 P7. Subgrid alignment and `<table>` belong to [layout]/[semantics].
- **Prefer** `<ui-compare>`:
  - **Wide containers:** a semantic table.
  - **Narrow containers:** stacked plan cards (a declared reflow).
  - **Rows:** aligned by subgrid.
  - **Featured plan:** at most one, marked with an accent border, a badge and a non-color cue.
  - **Glyphs and prices:** check and dash glyphs have text alternatives; prices use tabular numerals.

  **Avoid** three flex cards with `margin-top: auto` buttons, absolutely positioned ribbons, and two highlighted plans.
- **Failure:** rows misalign when feature text wraps, ribbons overflow, checkmarks rely on color alone, and featured highlights multiply.
- **Encoding:** slots for plan, price, features and action. `COMPARE_MULTI_FEATURED`, `COMPARE_ROW_MISALIGN`, `ICON_NO_NAME`.

### H8 · Taste gets its own advisory tier: measured, genre-aware, rate-limited
`DIAGNOSTIC` (sameness is `CONTESTED`) · runtime · P7 TASTE ATTR
- **Prefer** advisories that carry measured values, the genre threshold they assumed, and the cheapest concrete fix. They sit in a tier separate from errors and are capped per page. **Avoid** checking correctness only: a page can pass every invariant and still be flat, centered, and identical to the last 50.
- **Failure:** the agent can't see "bland" without a screenshot, and can't act on "looks generic".

| Code | Measures | Default threshold | Confidence |
|---|---|---|---|
| `HIERARCHY_FLAT` | largest display size ÷ body size | landing ≥4×; not applied to dashboards | medium |
| `HIERARCHY_MULTI_FOCUS` | elements in the first viewport above a salience score (size × contrast × saturation × isolation) | more than 2 | medium |
| `CENTER_EVERYTHING` | share of non-hero text blocks that are centered | more than 70% | high |
| `CARD_UNIFORM` | 6 or more siblings with identical weight and none featured | — | medium |
| `RHYTHM_MONOTONE` | consecutive bands with the same tone, density and composition | 3 or more | medium |
| `SAMENESS_DEFAULT_THEME` / `SAMENESS_ATTRACTOR` | distance of the page fingerprint from the default theme and from bundled attractors. Fingerprint: axis vector, accent hue and chroma, radius mode, pairing, scale ratio, surface-style mix, layout histogram | below a threshold | low; contested |

- **Why sameness is contested:** convention is often right (dashboards, forms), so novelty pressure can push agents to vary for its own sake. Corpus fingerprints also need a maintained set of attractors. Keep it advisory, at most one per page, and off by default for `register=app`.

---

## I. Data color

### I1 · Categorical colors: assigned by stable key, 8 or fewer, CVD-ordered, separate from intents
`CORE` · both · P5 P1 P4. Contested against [media-data-motion] "index-based categorical token set".
- **Prefer**:
  - Per-scheme `--viz-cat-1..8` tokens that vary in lightness as well as hue, ordered for CVD separation.
  - Colors assigned from a stable series key: an explicit `colorKey` map or a hash.
  - Intent hues kept out of series.
  - A 1–2px `--surface` gap between adjacent fills, and marks at least 3:1 against the surface.
  - Direct labels rather than legends; context series in gray, with only the focus series accented.

  **Avoid** index-based colors, red/green pairs, critical-red for an ordinary series, pastel fills on white, black separators, and 10 or more categories.
- **Failure:**
  - Toggling a legend filter re-indexes the colors, so "Revenue" is blue in one view and orange in the next.
  - Red and green series merge for about 8% of men.
  - A red series reads as an error.
  - Pastel bars at about 1.5:1 vanish for low-vision users.
- **Encoding:** Solid types require a key per series. The separator uses the surface token, so it works in every scheme. Reconciliation with [media-data-motion]: the token set is indexed, but assignment is keyed. Diagnostics:
  - `VIZ_TOO_MANY_CATEGORIES`: more than 8; suggests an "Other" bucket or small multiples.
  - `VIZ_INTENT_HUE_COLLISION`
  - `VIZ_MARK_CONTRAST`

### I2 · Sequential and diverging scales are anchored to the surface
`CORE` · both · P4 P3
- **Prefer**:
  - **Sequential:** `--viz-seq-0..8` runs from near-surface toward ink in each scheme, so the dark ramp runs dark to light.
  - **Diverging:** two CVD-safe hues (blue and orange), with the neutral midpoint at the surface tone and a typed `midpoint` prop for the meaningful zero.
  - **Forced colors:** plot marks opt out of adjustment and get direct value labels.

  **Avoid** rainbow or jet colormaps, a light-mode ramp reused in dark mode, and diverging scales centered on the mean.
- **Failure:**
  - A light ramp reused in dark mode makes high values vanish into the background while low values glow, which inverts the data's visual weight.
  - Rainbow scales aren't monotonic in lightness, so they create false boundaries and fail in grayscale and for CVD users.
  - A diverging scale centered on the mean colors "slightly below average" as alarming.
- **Encoding:** scale tokens are defined relative to the surface in each scheme. `ui-heatmap` and `ui-choropleth` require `scale="sequential|diverging"`, plus a `midpoint` for diverging. `VIZ_RAMP_NONMONOTONIC` runs at build time.

---

## Principle revisions from this basin

- **P1 becomes "each value and each invariant has one owner."** Contrast is a relation. The surface owns its background and inks, the solid owns its on-solid, the surface owns the focus ring, and `::selection` owns its pair (A1, A4, A5, A6). PAIR folds in here rather than becoming a P8.
- **P2 becomes "readable from the element plus its nearest declared owner."** Inheriting from a named surface or theme scope is intended. The real action at a distance is:
  - global `prefers-color-scheme` blocks
  - `.dark .x` descendant selectors
  - DOM-parent inheritance into top-layer elements that render somewhere else (B1, B5, F2)
- **P3 should name the kinds of hidden default:**
  - UA stylesheet system colors (B5)
  - environment defaults: `color-scheme: normal`, iframe canvas opacity, `print-color-adjust: economy` (B3, B4)
  - timing: `light-dark()` freezing on inheritance (B2)
  - aesthetic, at the corpus level: the default theme and the SKILL.md examples (F4, F5)
- **P4 gains three axes:**
  - **Context:** the surface a component lands on. The fix is relative derivation: `currentColor`, surface-owned tokens, and state mixed from the on-color.
  - **Environment:** scheme, forced colors, contrast preference, reduced transparency, print, the embedding iframe, and hover capability.
  - **Theme:** every component must survive every axis combination, checked by the C4 matrix at axis extremes.

  Where the UA deletes author styles, the choice of channel has to be made at construction time. UAO is a named sub-rule of P4 (B6).
- **P5 becomes "closed over roles, open over values."** Closed roles make exhaustive verification possible, at about 4k pairs per theme. Structural sets are strict. Expressive axes are bounded and registered: neither unbounded nor a single fixed look (F1).
- **P6 becomes one mechanism per concern, not one look.** One mode switch (`color-scheme`), one state mechanism (the state layer), one mixing space (oklab), and one decoration channel. Each brief still has many valid realizations. In color, duplicate mechanisms cause more bugs than value sprawl.
- **P7 becomes "loud when wrong, loud when unverifiable, loud across unrendered states, and separately soft for taste."**
  - **Unverifiable:** a warning, never a pass. Worst-case bounds make glass, scrims and decor decidable (C2).
  - **Unrendered states:** the build matrix covers states and schemes the screenshot never shows (C4).
  - **Taste:** lives in a rate-limited advisory tier (H8).
- **Proposed principles are kept as named sub-rules, not new top-level principles:**
  - BOUND under P7
  - UAO under P4
  - PAIR under P1
  - SEM shared with [semantics]
  - AXES under P5 and ATTR under P3
  - INERT as P1 applied to decoration
  - TASTE as a tier of P7

## Contested

1. **Overriding derived roles.** The color lens allows overrides as long as they are always re-verified. The expressive lens forbids them (`THEME_DERIVED_OVERRIDE`). Proposal: allow overrides only through theme registration, which re-verifies them, and diagnose raw inline overrides (`THEME_SCOPE_RAW_VARS`).
2. **Registering theme tokens with `@property`.** The expressive lens wanted derived tokens registered and non-inheriting. That freezes `light-dark()` (B2) and hides the tokens from descendants. Register only per-element structural props ([llm-api]), never role colors.
3. **Categorical assignment: stable key vs index.** I1 says stable key; [media-data-motion] says index. Proposal: an indexed token set with keyed assignment.
4. **APCA.** Advisory only: it isn't normative, and it disagrees with WCAG on mid-tone fills. Weighting APCA up in dark scheme is a heuristic.
5. **The `contrast-color()` fallback threshold.**
   - **The bug:** with an `l` threshold of 0.62, the relative-color fallback picks white for neutral solids with OKLCH L between about 0.565 and 0.62. There white reaches only 3.65–4.58:1, which fails AA for body text.
   - **The two thresholds:** 0.62 approximates APCA's preference, while about 0.565 is the WCAG crossover for neutrals.
   - **Why build verification is the guarantee:** chromatic solids vary, so only build-time verification guarantees the result.
   - **Unverified versions:** the explorer's browser version numbers for `contrast-color()` are not verified here.
6. **Skeletal vs credible default theme, and seeding from the title hash** (F4).
7. **Required `brief`/`rationale` fields and "move at least 2 axes"** (F5).
8. **The sameness fingerprint** (H8).
9. **Protecting invariants under forms (F3).** This depends on a cross-basin dispute: layered `!important` ([llm-api]) against "the library must lose every specificity fight" ([contrarian]).
10. **Enclosure contrast.** The expressive lens required 3:1 for every surface boundary. WCAG 1.4.11 and [fundamentals] require it only for functional boundaries. E1 uses a perceptible ΔL or a rule for cards, and 3:1 for controls.

## Diagnostics shortlist (best signal-to-false-positive ratio)

| Code | Check | Why it rarely misfires |
|---|---|---|
| `UA_SYSTEM_COLOR_LEAK` | top-layer or form element whose computed background equals the resolved Canvas/Field while the surface differs | exact equality with a system color |
| `ROOT_UNPAINTED` | `html` and `body` backgrounds both transparent | binary |
| `OVERLAP_TRANSPARENT` | sticky, fixed or top-layer container with text and a transparent background chain | catches a bug that static review can't see |
| `COLOR_UNOWNED_BACKGROUND` | opaque background that differs from the nearest surface token, with text inside | library surfaces are exempt by construction |
| `CONTRAST_FLOOR` + `CONTRAST_UNVERIFIABLE` | size- and weight-aware WCAG against the composited backdrop; three states | never passes silently |
| `SCHEME_MISMATCH` / `SCHEME_BOUNDARY_FROZEN` | used scheme vs surface lightness; ink recomputed at scheme boundaries | fires only at real boundaries |
| `FOCUS_RING_LOW` | on focusin: outline vs fill, and vs the backdrop beyond the offset | measured on the real focused state |
| `CONTROL_BOUNDARY_LOW` | control edge below 3:1 against the adjacent background | narrow element set |
| `SELECTION_UNPAIRED`, `STATE_COLOR_LITERAL`, `PRIVATE_TOKEN_REFERENCE` | static CSS scans | purely syntactic |
| `THEME_MATRIX_FAIL` | the closed matrix at theme registration | covers states that are never rendered |
| `GLASS_UNBOUNDED` | backdrop-filter with tint alpha below the computed floor | a numeric bound |

## Appendix: merged, pointers, dropped

**Merged (12):**

| Raw case | Merged into |
|---|---|
| glass and backdrop-filter | C2 |
| disabled tokens | C3 |
| theme as a vector of axes | F1 |
| surface treatment axis | E1 |
| shape language | F1 axis table |
| density and register | F1 axis table |
| motion personality | F1 axis table |
| icon stroke | F1 axis table |
| asymmetric placement | H3 |
| page hierarchy advisories | H8 |
| exemplar anchoring | F5 |
| deterministic tie-breaker seed | F4 |

**Pointers (5):**
- **Links underlined in running text** → [semantics] link affordance.
- **Icons in currentColor, and scheme-specific images** → [media-data-motion] monochrome icons and theme-aware media. Color keeps two things: literal SVG fills count as a `COLOR_LITERAL` case, and `ui-image` keys off its surface's used scheme.
- **Delta and KPI valence** → [media-data-motion] deltas. Addition: `polarity` is required and has no default.
- **Generated seed art** → [media-data-motion] remote placeholder images. Addition: the art consumes theme seeds and the image-treatment axis.
- **Selected/current styled from ARIA** → [semantics]/[llm-api]. The color-specific parts moved into D1.

**Dropped sub-claims:**

| Sub-claim | Reason |
|---|---|
| `ICON_WEIGHT_MISMATCH` | low confidence, noisy |
| `HERO_CENTERED_DEFAULT` | subsumed by `CENTER_EVERYTHING` |
| `ART_SAME_SEED` | trivial |
| "non-inheriting registered derived tokens" | wrong (B2) |
| "!important-free reverse layer trick" | muddled; use the [llm-api] mechanism |
| 3:1 on every surface boundary | over-applies WCAG 1.4.11 |
| `form` as the attribute name | collides with the form owner |
| the specific CSSWG issue number for `light-dark()` timing | unverified; kept as "an open proposal" |
| glass tint floor "0.7–0.85" | replaced by the per-role computation in C2 |
| the 0.62 fallback presented as safe | see Contested #5 |
