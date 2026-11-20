# Variation robustness and host/delivery environment

> **Names superseded 2026-11-20** by the name-guess eval. See [../vocabulary.md](../vocabulary.md) and [../layout-vocabulary.md](../layout-vocabulary.md). The cases below still hold. Old spellings that remain here are pre-eval: `tone=` → `variant` on components / `color` on text; `accent` → `primary`; `positive|caution|critical` → `success|warning|danger`; `pad` → `padding`; `busy` → `loading`; `none` → `0`; `ui-surface` → `ui-card` (`elevated`/`sunken`/`inverse`); `ui-callout` → `ui-alert`; `ui-time` (relative) → `ui-relative-time`; `ui-cluster|split|bar|reel|switcher|sidebar` → `ui-row` modifiers. Round 2 (same day): `scrollable` → `scroll`; `threshold` → `stack-below`; `ui-layers` → `ui-overlay`; `ui-layout`/`ui-shell` → `<ui-page layout="app">`; absolute `ui-time` → `ui-date`/`ui-datetime`; `ui-modal` → `ui-dialog`; `ui-metric` → `ui-stat`; `ui-grid columns` is now exact, and `max-columns` is the cap.

Scope: what happens when the content, the user's preferences, the host that runs the page, or the medium it is consumed in differ from the agent's preview. Sources: the `variation` lens (30 raw cases) and the `gap:Host and delivery` lens (36 raw cases). Result: 66 raw cases became 37 kept entries, 12 one-line pointers to other sections, and 11 dropped or corrected sub-claims (appendix).

**Why this basin exists ("preview privilege").** The agent checks its work in the best case on every axis at once: English, LTR, 1280px, fine pointer, macOS overlay scrollbars, no preferences set, an unsandboxed top-level tab, the screen medium, complete fixtures and a warm cache. Every failure in this section is latent at that moment, so P7 ("loud when wrong") never fires. The fix is to make verification adversarial by default (A1) and to route every environmental input through one owner (A2).

Legend: **Tier** is CORE (enforced by primitives, tokens or types), DIAGNOSTIC (runtime or static check), GUIDANCE (SKILL.md only) or CONTESTED. **Detect** is static, runtime or both. Principle codes P1–P7 are the draft principles; new codes are defined in §1.

---

## 1. Principle amendments this basin supports

| Code | Proposed principle | Amends | Carried by |
|---|---|---|---|
| BND | **Declared boundary policy.** Where open-ended content meets a bounded box, behaviour at the limit is one choice from a closed set (wrap, clamp(n), middle-truncate, scroll, collapse(+N), paginate, virtualize). The container primitive owns the choice, and choosing nothing is a diagnostic. "Close the policy, not the content." | P1, P5 | B2 B3 B4 |
| TOT | **Total over inputs.** Every member of the declared input space has a defined rendering: loading, empty, empty-filtered, partial, error, refreshing and refresh-error; null versus 0; extremes of length and count. A missing branch is a type error or a diagnostic, never a blank region or a sentinel string. | P4 | B5 B6 |
| MNS | **Metric-neutral state.** Interaction and refresh states change paint, not geometry. Only new content may change geometry, and only into space reserved for it. | P4 | C1 B6 |
| PREF | **Preference-transparent.** User and user-agent preferences (text size, zoom, lang, dir, motion, contrast, forced colors, pointer) are inputs that flow through library tokens and are never pinned. Protective defaults (the automatic min-size of aspect-ratio boxes and grid items) are not "hidden defaults" to override. | P3 | E1 E3 B1 A2 |
| AMB | **Explicit ambient context.** Inherited and environmental channels (lang, dir, color scheme, text scale, motion and contrast preferences, pointer, host capabilities, medium) form a named, finite set. Each is resolved once at the root, can be overridden by an attribute, and appears on every diagnostic. Everything else must be locally readable. | P2 | A2 D1 D2 H3 |
| HOST | **Host capabilities are an input, not an assumption.** Sandbox flags, permissions policy, CSP and origin type are probed into a closed capability map, and each capability has a declared fallback. | P3, P4 | F1–F4 |
| SIM | **Fragility is simulable.** The engine can switch on, deterministically, every axis the library claims robustness for. | P7 | A1 |
| IND | **Loudness is independent of the failure.** The path that reports a failure never depends on the thing that failed. | P7 | G2 G4 |
| HON | **Claims match capabilities.** Success text ("Saved", "Copied", "Downloaded") comes from a typed result. Actions whose outcome can't be verified ship a visible fallback. | P7 | F1 F2 |
| TIER | **Graceful tiering.** CSS alone yields a correct layout and JS only enhances it. Nothing stays hidden waiting for a ready flag. | P3 | G1 G2 |
| MED | **Every output medium is a variation axis.** Screen, print/PDF, a capture at t=0 and the clipboard each have a declared policy per primitive. | P4 | I1–I7 |
| P1+ | **Sizing authority across the iframe boundary is one-directional.** No feedback loop between host and guest. | P1 | H1 |

Compression recommendation: replace P4 with BND, TOT and MNS (plus intrinsic sizing from the Layout section), and widen its axes with HOST and MED. Rewrite P3 as "no hidden quirks, transparent to preferences, protective defaults kept unless a policy is declared", and count environment-dependent API results (`confirm()` returning false, `localStorage` throwing) as hidden defaults. Keep P2 strict and add the AMB carve-out. Give P7 three corollaries: SIM ("loud when fragile"), IND and HON ("never confidently wrong"). Broaden the stem from "visual result" to "rendered, interactive and exported result".

---

## 2. Sub-topic index

| § | Sub-topic | Entries |
|---|---|---|
| 3 | Simulation: making fragility visible | A1–A2 |
| 4 | Content extremes and boundary policies | B1–B6 |
| 5 | State stability | C1 |
| 6 | Locale, script and direction | D1–D6 |
| 7 | Preferences, zoom and input modality | E1–E4 |
| 8 | Host capabilities (sandboxed iframe) | F1–F4 |
| 9 | Delivery: load, version, coexist, fail visibly | G1–G4 |
| 10 | Embedding | H1–H3 |
| 11 | Output media: print, capture, copy | I1–I7 |
| 12 | Pointers to other sections | 12 rows |
| 13 | Contested | 11 items |

---

## 3. Simulation: making fragility visible

#### A1 · One stress harness with a closed axis catalog — DIAGNOSTIC · runtime · P4 P7 SIM MED
- **Prefer** running `UI.stress()` / `?ui-stress=<axes>` as the SKILL.md "done" step **over** one 1280px screenshot of the agent's own 3-row English fixture.
- **Fails:** clipped German labels, a 90-char hash overflowing, RTL mirroring, collapse on empty data, silent no-ops in the sandbox and truncated print all pass a screenshot check, so the bugs ship with real data.
- **Encode:** the axes are a closed catalog (below). Geometry is re-checked after each axis. Each finding carries the axis and the ambient tuple, e.g. `UI-CLIP-001 ui-card>ui-heading [axis=text-200 lang=de dir=ltr]`. Axes the page can simulate itself run through attribute mirrors (A2); the rest run in the harness (`emulateMedia`, a real `<iframe sandbox="allow-scripts">`, iframe resizing). The engine mechanics (settle, freeze, culprit finding) belong to the Diagnostics section; this section owns the axis catalog. It merges stress mode, the sandbox simulation, the print probe, the t=0 capture probe, the embed two-height probe and the tier tests.

| Axis | Simulation | Catches |
|---|---|---|
| `text-expand` | Pseudo-localize text slots: +200% under 10 chars, +35% for long strings, accented glyphs | Clipped buttons and tabs, runaway wrapping |
| `long-token` | Inject a 120-char unbroken token into every text slot | Auto tracks sized by content, the break-word trap |
| `rtl` | `dir=rtl` on the root | Physical transforms and gradients, chevrons, bidi |
| `text-200` | Root font-size 200% | Fixed heights, px icons, px breakpoints, sticky budget |
| `text-spacing` | WCAG 1.4.12 overrides | Text clipping |
| `width` | Container sweep from 320 to 2560 (resize the container, not the window) | Overflow culprits, auto-fit stretch, prose measure |
| `short` | 400px block size (harness) | Sticky budget, obscured focus, off-screen dialogs |
| `count` | 0, 1, 2 and 50x items | Missing empty branch, giant auto-fit tiles, runaway wrapping, very long lists |
| `state` | Force each `data-ui-state` value | Missing branches, layout shift between states |
| `partial` | Null random fields | Sentinel leaks, null shown as 0 |
| `pointer` | `data-ui-pointer=coarse`, `data-ui-hover=none` | Hover-only affordances, small targets |
| `prefs` | Motion and contrast via mirror; forced-colors only in the harness (the UA repaints) | Zombie overlays, invisible edges and focus |
| `classic-scrollbars` | Harness with Windows or Linux scrollbar emulation | Width jumps when overflow toggles (pointer → scrollbar-gutter) |
| `sandbox` | Deny modals, storage, popups, clipboard, downloads, top navigation and cookies | Silent no-ops, throws at the top level |
| `embed` | Load in an iframe at 300px and 900px tall | Viewport-unit feedback loops |
| `print` | `data-ui-medium=print` mirror at A4/Letter width, or `emulateMedia('print')` | Truncated pages, hidden content, dark ink |
| `t0` | First frame before `ui.ready` compared with the settled frame | Blank heroes, counters at 0, skeletons |
| `tier` | Load with JS blocked, then with CSS blocked | Blank page, unexplained unstyled page |

#### A2 · Preferences, medium and host resolve in one root resolver with attribute mirrors — CORE · both · P1 P6 PREF AMB SIM
- **Prefer** a library resolver that evaluates each `@media (prefers-*)`, `(hover)`, `(any-pointer)`, `print` and the host capabilities once, writes tokens and root attributes (`data-ui-motion`, `data-ui-pointer`, `data-ui-medium`, `data-ui-host`), and lets an attribute override each one, **over** author media queries scattered through components.
- **Fails:** JS can't toggle media features, so in-page diagnostics can't test reduced motion or print. Agents write ad-hoc queries with the wrong feature (`pointer` instead of `any-pointer`), and pin or ignore preferences.
- **Encode:** core CSS is generated from one source into both `@media X {…}` and `:root[data-ui-X] {…}` (the print-mirror pattern). Components read only tokens (`--ui-motion-distance`, `--ui-target-min`, `--ui-inline-sign`). A static lint flags author `@media (prefers-*|hover|pointer)` and suggests the token. Every diagnostic shows the resolved tuple. This stays consistent with [contrarian] "device axes stay media queries": they are still media queries, now owned in one place. Forced colors can't be mirrored and are harness-only.

---

## 4. Content extremes and boundary policies

#### B1 · Text boxes grow — CORE · both · P2 P3 P4 P7 PREF
- **Prefer** min-block-size tokens with padding, unitless line-height, and `overflow:clip` for decorative cropping **over** `height:36px` on buttons, badges and rows, `overflow:hidden` to tidy up, and `line-height: 24px | 1.5rem | 150%`.
- **Fails:** text clips silently under 200% text, the browser's minimum font size, WCAG text spacing, or German. Length and percentage line-heights inherit as absolute lengths, so a 2rem heading inside a parent with 1.5rem leading overlaps its own lines once a long title wraps. **New trap:** an aspect-ratio box normally gets an automatic min-size, so content can grow it. `overflow:hidden` makes it a scroll container and removes that minimum, so a "square card" cuts off text. `overflow:clip` is not a scroll container and keeps the minimum, which is a fresh argument for the seed rule.
- **Encode:** text-bearing primitives have no height prop (the Solid types omit it; the element ignores it). Size tokens map to min-block-size. A theme lint rejects length line-heights. Runtime UI-CLIP fires when overflow is not visible, scrollHeight > clientHeight+1, the box holds text, and there is no `lines=` policy. UI-LEADING fires when computed line-height is below 1.05x font-size on a multi-line box. Pointers: [typography] text-spacing resilience; [diagnostics] clipped content needs declared intent.

#### B2 · Wrapping is a closed policy — CORE (default contested) · both · P3 P5 P6 BND
- **Prefer** `wrap="prose|heading|anywhere|code"` **over** ad-hoc `overflow-wrap`/`word-break`, and over `<br>` or `&nbsp;` to tune headlines.
- **Fails:** `break-word` does not lower the min-content contribution, so an auto track or table column is still sized by a 90-char URL and overflows. Agents then escalate to `break-all`, which splits ordinary words mid-letter. Headlines balanced with `<br>` at 1280px in English become one-word lines on mobile or in translation. Prose without a measure runs to 200ch.
- **Encode:** per-primitive defaults: ui-heading uses balance, ui-prose uses pretty with hyphens:auto and about 65ch, table cells use anywhere, ui-code uses pre-wrap. `:lang(ko)` keep-all is built in. Runtime: UI-BR-LAYOUT (a `<br>` in a heading, button or label) and UI-MEASURE (prose over ~90ch). **Contested** with [contrarian]/[typography] (§13.1).

#### B3 · Truncation is content-aware — DIAGNOSTIC · runtime · P4 P5 P7 BND
- The primitive (`<ui-text lines=N truncate=middle>` with a full-text path) belongs to [sizing-overlays] and [typography]. This basin adds the checks that know about content.
- **Prefer** never ellipsizing numbers, prices or dates (wrap them or use compact notation), and middle truncation for paths, hashes, emails and IDs, **over** one end-ellipsis for everything.
- **Fails:** `$1,24…`. Five rows of `Q3-revenue-forecast-…` look identical because end truncation removed the suffix that tells them apart. A `title`-only reveal can't be reached by touch or keyboard.
- **Encode:** UI-TRUNC-NUMERIC (an ellipsized box whose text matches a number, currency or date). UI-TRUNC-AMBIGUOUS (two or more sibling truncated items with identical visible text; suggests middle truncation). UI-TRUNC-NO-FULLTEXT. Middle truncation uses Intl.Segmenter so graphemes stay whole.

#### B4 · Collections declare an overflow policy — CORE (required-vs-default contested) · both · P5 BND
- **Prefer** `overflow="wrap|scroll|collapse|paginate|virtual"` on ui-cluster, ui-tabs, ui-tags and ui-list **over** whatever flex-wrap happens to do with 40 items.
- **Fails:** the demo has 3 tags and production has 40, which wrap into 8 lines and blow up the card. Nine translated tabs overflow or squash. 10k rows freeze the page. `content-visibility:auto` without `contain-intrinsic-size` collapses rows to 0, so the scroll thumb lies.
- **Encode:** `scroll` gives a focusable, labelled region with a direction-aware edge fade and scroll-snap. `collapse` gives "+N more" (measured with ResizeObserver) or priority-plus. `virtual` gives `content-visibility:auto` plus `contain-intrinsic-size: auto <estimate>`. Runtime: UI-WRAP-RUNAWAY (more than 3 lines under the default `wrap`), UI-LIST-LARGE (more than ~300 children with no `virtual` or `paginate`), and a warning for content-visibility without an intrinsic size. Exercised by `count`=50x.

#### B5 · Every value slot is total: no sentinel leaks, and null is not 0 — DIAGNOSTIC · both · P4 P7 TOT
- **Prefer** value primitives (`<ui-value>`, `<ui-number>`, `<ui-time>`) with an explicit nullish fallback (an em dash whose accessible name is "No data") **over** raw interpolation such as `${user.first} ${user.last}`, `${pct}%` or `$${price}`.
- **Fails:** partial API data renders `undefined undefined`, `NaN%`, `$null`, `Invalid Date` or `[object Object]`, and a KPI shows 0 when the value is unknown. The agent's fixtures are complete, so it never sees this.
- **Encode:** a Solid overload makes `fallback` required when the value type includes null. Runtime UI-SENTINEL (error severity) walks text nodes with a TreeWalker for `/\b(undefined|null|NaN|-?Infinity|Invalid Date)\b|\[object \w+\]/`, skipping code, pre and `[translate=no]`; bare `null` inside ui-prose is only a warning. The `partial` axis nulls random fields. This is the cheapest, highest-precision check in the section.

#### B6 · Data regions are total over a closed state set, refresh included — CORE · both · P1 P4 P5 TOT MNS
- The base set (loading, empty, error, ready) belongs to [semantics], [media-data-motion] and [gap:Behavior] (Solid 2.0 async). This basin adds the members agents forget and the rule for skeleton geometry.
- **Prefer** the states `loading | ready | empty | empty-filtered | partial | error | refreshing | refresh-error` and ghost-mode skeletons (the real component with a `loading` attribute) **over** `items.map()` with no empty branch, `<Show when={!loading()}>` (which unmounts on every refetch), one error that blanks the page, and hand-drawn grey divs.
- **Fails:** filtering down to zero shows nothing, so users think the app broke. Each poll flashes the table to a spinner and loses scroll position, focus and selection. A guessed skeleton height shifts layout when content arrives. An 80ms response flashes a skeleton.
- **Encode:** empty-filtered offers "Clear filters". `refreshing` keeps stale data visible with a pending indicator. `refresh-error` keeps stale data and adds an inline banner. Stale content is blocked with `inert`, not `pointer-events:none`. Ghost mode is CSS in each primitive (text becomes 1lh bars, media becomes ratio boxes), so skeleton geometry equals component geometry by construction. The adapter's async helper waits ~150–300ms before showing a skeleton and keeps it for at least ~400–600ms. The region gets `aria-busy`; the skeleton is aria-hidden. Runtime: UI-EMPTY-UNHANDLED (`count`=0 with no `[slot=empty]`), UI-FOCUS-LOST (activeElement falls to body after the region mutates), and UI-CLS from layout-shift `sources`.

---

## 5. State stability

#### C1 · Metric-neutral state — CORE · runtime · P4 MNS
- **Prefer** state styles that change only paint (colour, background, outline, inset shadow, underline); bold width reserved by a hidden bold copy (`::after{content:attr(data-label);font-weight:700;visibility:hidden;block-size:0}`); a loading spinner stacked over a `visibility:hidden` label with grid-area 1/1; and tabular-nums for changing numbers. Prefer these **over** bold on select, a border added on hover, padding added when active, replacing the label with a spinner, and proportional digits in timers and prices.
- **Fails:** selecting a tab shifts its neighbours, so targets move under the cursor. The submit button shrinks to spinner width and the action row reflows. A live price jitters sideways. German labels magnify every shift.
- **Encode:** library state styles are audited for metric neutrality. `<ui-button loading>` uses the overlay recipe with aria-busy and aria-disabled. `<ui-number>` sets tabular-nums, an LTR island and a min-inline-size in ch when the maximum digit count is known. The detector (UI-STATE-REFLOW) belongs to [diagnostics] state probing.

---

## 6. Locale, script and direction

#### D1 · `lang` is the single owner of script-dependent typography — CORE · runtime · P1 P3 P7 AMB
- **Prefer** a required `lang` on `<html>` and on embedded text in another language, `:lang()` token overrides (font stack; label case and tracking removed for Arabic, Hebrew, Indic, Thai and CJK; hyphens; `:lang(ko)` keep-all), and sentence-case source strings with case applied as a token, **over** a missing or wrong lang, `SUBMIT ORDER` in source, and a global uppercase with 0.1em tracking.
- **Fails:** Han unification means Japanese without `lang=ja` can render Chinese glyph variants. `hyphens:auto` silently does nothing. Turkish `i` uppercases to `I` instead of `İ`. Tracking can break Arabic cursive joining (engine-dependent) and looks broken on CJK. All-caps source can't be un-capitalized by translators.
- **Encode:** the theme ships the `:lang()` blocks. Runtime: UI-LANG-MISSING; UI-LANG-MISMATCH (Unicode script regexes such as `\p{Script=Hiragana}`, `\p{Script=Hangul}`, `\p{Script=Arabic}` and `\p{Script=Han}` compared with the nearest lang); UI-TRACKING-CURSIVE; UI-CAPS-SOURCE (info). Pointers: [typography] CJK, RTL and script-aware tokens; [semantics] document boilerplate.

#### D2 · Locale semantics go through Intl, resolved from the nearest `[lang]` — CORE · both · P1 P5 P6 AMB
- **Prefer** `<ui-number format>`, `<ui-time relative>`, `<ui-plural>` (PluralRules), ListFormat, Collator for sorting names, and Segmenter for grapheme counts, initials and any JS truncation **over** `'$'+n.toFixed(2)`, `` `${n} item${n===1?'':'s'}` ``, `toLocaleString()` with no locale, `arr.sort()` on names, and `.length`, `.slice` or `[0]` on user text.
- **Fails:** "1 items". Polish and Arabic plural categories can't be expressed with a ternary. A German page shows `$1,234.50`. A `toLocaleString()` call with no locale uses the browser or OS locale rather than the page's lang, and differs between SSR and the client. 'Émile' sorts after 'Zoe'. Slicing splits surrogate pairs, ZWJ emoji and flags into `�`. Character counters disagree with the server.
- **Encode:** primitives read the locale from the closest `[lang]`. Runtime UI-TEXT-MOJIBAKE: U+FFFD, a lone surrogate, or a combining mark at the start of a text node. Static lint: `toFixed` or argument-less `toLocaleString()` in templates. KPI slots use compact notation with the full value in the accessible name. Pointer: [media-data-motion] number, date and unit formatting.

#### D3 · Isolate the direction of dynamic text — CORE · runtime · P2 P3 P4
- **Prefer** `unicode-bidi:isolate` (or `<bdi>`) on every data slot, `dir=auto` on inputs, textareas and user content (`unicode-bidi:plaintext` for multi-paragraph content), and forced LTR islands for numbers, phone numbers, IBANs, code, URLs and versions **over** interpolating usernames and titles straight into sentences.
- **Fails:** a Hebrew or Arabic name followed by ` (3)` or `: 12 comments` renders with the punctuation or digits on the wrong side, and neighbouring numbers reorder even on LTR pages. Phone-number digit groups reorder in an Arabic UI. English fixtures never show this.
- **Encode:** primitive slots isolate by default. The adapter's text helper isolates. Form fields default to `dir=auto`. ui-number, ui-code and ui-kbd force LTR. Runtime UI-BIDI (warning, moderate false-positive rate): a text node with strong RTL characters whose non-isolated parent also holds LTR text or digits.

#### D4 · Direction-aware transforms, gradients, icons and arrow keys — CORE · static · P2 P5 P6
- Logical properties (a seed rule) don't reach any of these.
- **Prefer** semantic icon names with a registry `mirror` flag, `:dir(rtl)`, a library `--ui-inline-sign` (±1) for translate, shadow x-offsets and gradient angles, and arrow-key handlers mapped through the resolved direction **over** `arrow-right` for "next", `[dir=rtl]` selectors, drawer entrances with `translateX(-100%)`, `linear-gradient(to right)` fades, `background-position:right`, and a blanket `scaleX(-1)`.
- **Fails:** in RTL, "next" points backward, drawers enter from the wrong edge, and scroll fades sit on the wrong side. `[dir=rtl]` misses direction inherited from an ancestor or set by `dir=auto`; only `:dir()` resolves it. A blanket flip mirrors play buttons and numerals. ArrowRight moves a slider backward.
- **Encode:** the core flips `--ui-inline-sign` under `:dir(rtl)` and library keyframes use it. The adapter's roving-focus utility is direction-aware. Static lint: a physical-sign translate, `left`/`right` in gradients or background-position, and `[dir=` selectors. Exercised by the `rtl` axis.

#### D5 · Enter-to-submit ignores IME composition — CORE · static · P3 P6
- **Prefer** form submit semantics, or `<ui-composer>` / `onEnterSubmit`, which check `!e.isComposing && e.keyCode !== 229`, **over** `e.key === 'Enter' && send()`.
- **Fails:** Japanese, Chinese and Korean users press Enter to confirm a conversion, which sends a half-typed message or fires a search on every confirmation. Safari can fire the committing keydown after compositionend, which is why the 229 check is needed.
- **Encode:** the primitives and an adapter helper. Static lint UI-IME: a keydown handler that tests for Enter without checking `isComposing` (near-zero false positives). Pointer: [gap:Behavior] shortcut registry, which uses the same guard.

#### D6 · Survive browser machine translation — GUIDANCE · static · P2 P4 (medium confidence)
- **Prefer** reactive interpolations wrapped in their own element (`<span>{count()}</span> items`), and `translate="no"` on code, kbd, brand names, handles and IDs, **over** static and reactive text as sibling text nodes in one element.
- **Fails:** Chrome and Google Translate replace text nodes with `<font>` wrappers. Framework updates then go to detached nodes (stale counts), or `removeChild` throws NotFoundError. Brand names get translated.
- **Encode:** `translate=no` is the default on ui-code, ui-kbd and ui-brand, plus an adapter convention. This can't be verified in the agent's environment (the runtime detector was dropped; see the appendix).

---

## 7. Preferences, zoom and input modality

#### E1 · Honor user font size and zoom — CORE · both · P3 P4 P5 PREF
- **Prefer** leaving the root at 100%, rem tokens, `@media` thresholds in rem/em, and `@container` thresholds in em. In a container query, em resolves against the query container's font size, so a component reflows when its text grows. Fluid type keeps a rem term, e.g. `clamp(1.25rem, 1rem + 1.2vw, 2.5rem)` with max/min ≤ ~2.5. Prefer all of this **over** `html{font-size:16px|10px}`, px breakpoints, and `font-size:5vw` or a clamp dominated by vw.
- **Fails:** a px root pins a low-vision user's 20–24px default. px breakpoints keep three columns while text is 1.5x, so columns cramp and overflow. Text sized in vw doesn't grow under zoom, because the CSS viewport shrinks (WCAG 1.4.4). Agents assume clamp() means accessible.
- **Encode:** tokens and the type scale are generated in rem. Breakpoints are baked into primitives, because custom properties can't be used in `@media`. Lints: UI-PX-ROOT, UI-PX-BREAKPOINT, UI-FLUID-NO-REM. The `text-200` axis asserts that headings grow at least 1.6x. Pointers: [typography] rem tokens; [contrarian] and [fundamentals] fluid type.

#### E2 · Hover-revealed affordances are gated and have focus parity — CORE · both · P3 P4 P7
- **Prefer** revealing on hover only under `@media (hover:hover) and (pointer:fine)`, always paired with `:focus-within`, with the controls otherwise always visible, **over** row actions at `opacity:0` shown by `:hover`, and hover styles that toggle `display`.
- **Fails:** touch users never see Edit or Delete. iOS sticky hover turns the first tap into a hover. Keyboard focus lands on buttons that are invisible but still focusable.
- **Encode:** `<ui-reveal on="hover">` compiles to the gated recipe. A runtime CSSOM scan raises UI-HOVER-ONLY for a `:hover` rule that changes opacity, visibility or display without a matching `:focus-within` or `:focus-visible` rule. UI-FOCUS-INVISIBLE (error, near-zero false positives): the focused element has computed opacity 0 or visibility hidden. Pointers: [contrarian] device axes stay media queries; [semantics] pointer-only interactions.

#### E3 · Coarse pointers: any-pointer targets, Pointer Events drag, scoped touch-action — CORE · both · P4 P5 P7
- **Prefer** a `--ui-target-min` of 24px that rises to 44px under `(any-pointer:coarse)`, hit areas grown with an inset negative `::before`, and drag built on pointerdown plus setPointerCapture with `touch-action:none|pan-y` on the handle only **over** `(pointer:coarse)` (which reports only the primary pointer, so touch laptops and an iPad with a trackpad say "fine"), `'ontouchstart' in window`, mouse-only drag, and `touch-action:none` on large containers.
- **Fails:** dense toolbars produce mis-taps. Sliders, splitters and kanban boards scroll the page instead of dragging. An agent who "fixes" that with touch-action:none on the whole board makes the page unscrollable on mobile.
- **Encode:** icon-button enforces the token. The library ships ui-splitter and a sortable utility on Pointer Events, and styles the native range input. Runtime: UI-TARGET (under 24×24 and without 24px spacing) and UI-TOUCH-ACTION-WIDE (touch-action:none on more than 50% of the viewport). Static: onMouseDown with no pointer equivalent. Pointer: [semantics] target-size token.

#### E4 · Short viewports: a sticky budget, unobscured focus, bounded overlays — CORE · runtime · P4 P6 P7
- **Prefer** `<ui-sticky>` that sticks only under `@media (min-height: 32rem)`. Rem in a media query tracks the user's default size, and zoom shrinks the viewport, so landscape phones and 200–400% zoom fall back to static. Allow at most one sticky element per edge, with an automatic `scroll-padding-block-start` equal to its height. Give dialogs `max-block-size: calc(100dvh - 2*gutter)` with an inner scroller, and popovers `position-try-fallbacks: flip-block, flip-inline` plus a max-block-size. Prefer all this **over** a sticky header, sticky filters, sticky thead, fixed footer and cookie banner all at once, a `top:50%; translateY(-50%)` tall modal, and popover positions computed once in JS.
- **Fails:** at 200–400% zoom or on a 360px-tall landscape phone, chrome covers 60–100% of the viewport. The focused field sits under the header (WCAG 2.4.11). A tall modal's title and close button end up off-screen and unreachable.
- **Encode:** primitives carry the height-gated rule and the scroll-padding token. Runtime: UI-STICKY-BUDGET (sticky and fixed rects together cover more than 40% of innerHeight), UI-FOCUS-OBSCURED, and UI-OVERLAY-OFFSCREEN (measured against visualViewport). Exercised by the `short` and `text-200` axes. This is a case where a viewport media query is the canonical answer: P6 applies per question. Pointers: [sizing-overlays] dialog sizing and popover bounds; [semantics] scroll-padding.

---

## 8. Host capabilities (sandboxed iframe)

In a sandbox, denied APIs don't fail loudly. They either return a value that looks like the user's choice, or throw at module top level and abort everything. The capability map:

| Capability | When denied | Facade | Fallback tiers |
|---|---|---|---|
| Modals | `confirm()` returns false (looks like Cancel), `prompt()` returns null, `alert()` is never seen; only a console warning | `ui.host.confirm/prompt/notify` built on `<dialog>` or a toast, Promise-returning | Always in-page |
| Storage | Reading `window.localStorage` throws SecurityError in an opaque origin; quota errors | `ui.store` | persist → session → memory |
| Clipboard | API undefined (insecure context) or rejects NotAllowedError (permissions policy, lost activation; Safari wants the call inside the gesture) | `ui.host.copy`, `<ui-copy>` | Clipboard API → execCommand inside the gesture → pre-selected field with "Press Ctrl/Cmd+C" |
| Downloads | An `a[download]` click silently does nothing without `allow-downloads`; navigating to a blob or data URL is blocked | `ui.host.save` | Blob link → visible textarea with Copy (text), or an image panel |
| Popups, top navigation | `window.open` returns null (TypeError on `.focus()`); top navigation blocked | `<ui-link external>` | target=_blank with the URL visible as text and a copy button |
| History | `pushState('/x')` throws SecurityError on about:srcdoc, blob or opaque origins | `ui.route` | Hash routes |
| Cookies | `document.cookie` throws in an opaque origin | Banned | `ui.store` |
| Fetch | A null origin reaches only CORS-enabled endpoints | Data primitive | Typed `error{reason}` |
| Device APIs | Geolocation calls its error callback with PERMISSION_DENIED (the spinner spins forever if the agent passed no error callback); `requestFullscreen` rejects with TypeError; `navigator.share` is missing on many desktops | `ui.host.request(cap)` with a timeout | Manual alternative: type an address, upload a file, maximize in-page |
| Remote resources | CSP blocks fonts, images or CDNs | Declared dependencies | System font stack, generated art |

#### F1 · One `ui.host` facade with a probed, closed capability map and typed results — CORE · both · P3 P5 P7 HOST HON
- **Prefer** `ui.host.{confirm,prompt,notify,copy,save,open,request}` returning `{ok:true} | {ok:false, reason}`, plus a frozen `ui.host.caps` probed once at boot, **over** raw `alert/confirm/prompt`, `navigator.clipboard.writeText().then(toast)`, `a.download` + `click()`, `window.open`, `requestFullscreen`, and `getCurrentPosition` on load.
- **Fails:** the preview tab is unsandboxed, so everything works there. In the host iframe, `if (confirm(…))` never runs the delete, the toast says "Copied" when nothing was copied, the download does nothing, and the location button spins forever. The agent gets no signal.
- **Encode:** confirm is built on `<dialog>.showModal()` and returns Promise<boolean>; the declarative form is `commandfor` with `command="show-modal"`. `<ui-copy>` owns the fallback tiers and announces success or failure in a live region. `<ui-action requires="geolocation">` renders disabled-with-reason when the capability is absent. Success text is derived from the typed result. Static lint on the raw globals (near-zero false positives). Runtime: HOST_CAP_DENIED{cap, fallback} once per capability, and a HOST_CAPS summary at boot. In diagnostic mode, wrapped native modals emit NATIVE_MODAL_USED with a stack, then forward to the in-page implementation. Pointers: [gap:Behavior] sandbox capability honesty (the same failure seen from the behaviour side); [gap:Behavior] destructive actions (confirm only for irreversible actions, undo otherwise).

#### F2 · Storage degrades to memory, never throws at top level, and the UI states the real durability — CORE · both · P3 P4 P7 HON
- **Prefer** `ui.store(key, default, {scope})` returning `{value, persistent, tier}` (tier is persistent, session, memory or host-managed), the host's own storage capability when it has one, and `<ui-save-status>` rendered from the tier, **over** a bare `JSON.parse(localStorage.x)` at module top level, and a try/catch that swallows the error and still toasts "Saved".
- **Fails:** touching `window.localStorage` in an opaque-origin sandbox throws SecurityError. The module aborts, leaving a blank page or a half-initialized UI with dead listeners. A swallowed catch produces a UI that claims persistence it doesn't have, and data is lost on reload.
- **Encode:** probe with a set/get/remove round trip and fall back to a Map. STORAGE_UNAVAILABLE fires once. A `[data-ephemeral]` hook lets the app say "changes won't be saved". Keys are namespaced and versioned; values are parsed in try/catch, schema-validated and reset when invalid. Static lint on direct Web Storage use. Pointer: [gap:Behavior] persisted-state versioning.

#### F3 · Opaque-origin and srcdoc safety: absolute URLs, hash routing, typed network errors — CORE · both · P3 P4 P7
- **Prefer** absolute CDN URLs, inline data or SVG for images, hash routes (`#/settings`), `<ui-link>`, and a data primitive that maps failures to `error{reason: offline|cors|csp|http}` **over** `fetch('data.json')`, `<img src=logo.png>`, root-relative `href="/about"`, `history.pushState('/x')`, state in `location.search`, `new Worker('w.js')`, service workers, `document.cookie`, and relative module imports.
- **Fails:** a srcdoc document inherits the host's base URL, so relative and root-relative URLs 404 or load the host app inside the frame. pushState throws. `location.search` is empty or owned by the host. A fetch from a null origin to a non-CORS endpoint fails with an opaque `TypeError: Failed to fetch`, which agent code renders as "No data", so an error masquerades as empty.
- **Encode:** `ui.route` is hash-only in artifact mode and uses the History API only when the capabilities allow it. `ui.host.caps.origin` is one of opaque, same, blob or srcdoc. Static: RELATIVE_URL_IN_ARTIFACT. Runtime: NAV_WINDOW_OPEN_NULL, NAV_TOP_BLOCKED. Pointers: [gap:Behavior] links in framed artifacts, URL state schema, native form submit.

#### F4 · Remote dependencies are declared, counted and reported when blocked — DIAGNOSTIC · runtime · P3 P4 P7 HOST
- **Prefer** system font stacks by default, remote fonts only through a declared theme `fonts` field with a metric-matched fallback, generated art instead of remote placeholders, and a budget of one external origin (the library's) **over** Google Fonts plus an icon CDN, a chart CDN, the Tailwind CDN and picsum images.
- **Fails:** the host's CSP allows the library CDN but blocks fonts.googleapis.com and img-src. Text falls back to fonts with different metrics (layout shift) and images break. The agent only saw it working outside the sandbox.
- **Encode:** a `securitypolicyviolation` listener raises RESOURCE_BLOCKED{blockedURI, violatedDirective}, which is authoritative with no false positives. `error` events on link, script and img feed the same stream. A document preflight lists every external origin (scripts, links, img, @import, url(), fonts). Pointers: [media-data-motion] remote placeholder images; [typography] font loading.

---

## 9. Delivery: load, version, coexist, fail visibly

#### G1 · Graceful tiering: the stylesheet is the contract — CORE · static (library CI) · P1 P3 P4 TIER
- **Prefer** Tier 0: layout, surface and type primitives that are pure CSS keyed on element names and attributes, with behaviour widgets that fall back to native elements (`details`, `#fragment` anchors, `<dialog>` via `commandfor`). Tier 1 adds the core JS (diagnostics, behaviours, theme switching) and Tier 2 the adapter. Prefer this **over** layout set from connectedCallback or by ResizeObserver-driven classes, and over `html:not(.ui-ready){visibility:hidden}` guards.
- **Fails:** when the CDN is blocked, slow or throws, the page stays blank forever (the guard is never lifted) or shows an unstyled column of text.
- **Encode:** library CI takes a no-JS snapshot of every primitive. If a reveal gate is unavoidable, a CSS animation shows the content after at most 1s regardless. Pointers: [sizing-overlays] custom-element FOUC/CLS; [contrarian] light DOM with zero per-instance JS.

#### G2 · A missing runtime is reported by tripwires that don't depend on it — CORE (boilerplate) · both · P7 IND TIER
- **Prefer** the canonical SKILL.md skeleton with about 300 bytes of inline tripwires **over** silently degrading to unstyled markup, or expecting the library to report its own absence. The tripwires:
  - an inline CSS banner, `html:not([data-ui-ready]) body::before{content:"UI runtime not loaded"}`, revealed by a 3s animation delay;
  - `onerror` on the `<script>` and `<link>`, naming the failed URL;
  - a JS check that `--ui-version` is set on :root. If it's empty, the JS injects a ~1KB emergency stylesheet and raises CSS_MISSING. If it differs from JS `__UI_VERSION__`, the JS raises VERSION_SKEW.
- **Fails:** a CDN blocked by CSP, an ad blocker, being offline, or a 404 on a bad pinned version leaves raw HTML with no explanation. CSS and JS copied from two snippets at different versions give partial theming and invisible components.
- **Encode:** one include snippet, with no alternatives; exact version pins. SRI is optional, but it makes a failure total, so the tripwires become mandatory. A linter validates the boilerplate. `:not(:defined)` covers the case where JS is missing but CSS loaded. Pointers: [llm-api] hallucinated-element tripwire, and one pinned include URL with skew detection.

#### G3 · Idempotent, collision-safe load — CORE · runtime · P1 P3 P7
- **Prefer** a guarded `define()` (a no-op when the same library and version is already registered; otherwise DUPLICATE_ELEMENT{name, existing, this} and no throw), one `globalThis[Symbol.for('ui.core')]` singleton that a second copy defers to, all CSS in `@layer ui-core` so duplicate rules are harmless, and an optional build with a different prefix, **over** a bare `customElements.define` and a `window.ui` singleton.
- **Fails:** the script is included twice (in head and via an import), or two artifacts share one document. The first duplicate define throws NotSupportedError and aborts the module, so half the primitives never register, or two versions fight over the same tags. Scoped registries are not yet baseline.
- **Encode:** as above, plus VERSION_MISMATCH_COEXIST.

#### G4 · Failures reach the agent through channels that survive the sandbox — CORE · runtime · P7 IND
- **Prefer** early `error` and `unhandledrejection` listeners mapped into the diagnostics stream, and in artifact mode a painted `<ui-fault>` banner (code, message, SKILL.md anchor). Prefer `ui.mount(root, App)`, which wraps an ErrorBoundary. Send diagnostics to several sinks: `[ui-diag]` JSON lines in the console; a DOM-resident sink (`window.__uiDiagnostics`, `<script type=application/json id=ui-diagnostics>`, `html[data-ui-diag="N"]`); a `?ui-debug` overlay; and postMessage to the parent when allowed. Prefer all this **over** console-only reporting and catch-and-continue.
- **Fails:** a top-level SecurityError gives a white page. The host hides the iframe's console. Harnesses that only screenshot or snapshot the DOM never see console output, so the engine runs but reports nowhere.
- **Encode:** the banner can be suppressed only by an explicit attribute with a reason, because escape hatches must be loud. A `diagnostics.settled` event. SKILL.md gives the exact read command for each harness. Pointer: [diagnostics] unify failure channels.

---

## 10. Embedding

#### H1 · Embed mode: sizing authority is one-directional — CORE · both · P1+ P4 (default contested)
- **Prefer** `<ui-page mode="auto|embed|standalone">`, where `auto` uses `window !== top` plus the host capabilities. In embed mode the content decides the height: no viewport units, sticky and fixed chrome demoted to static, `--ui-embed-max-height` for bounded embeds, and height reported (ResizeObserver to postMessage) only when the host declares support. Prefer this **over** `min-height:100vh`, `100dvh` or `h-screen` on body or a hero, fixed bottom bars and FABs, and inner scrollers sized in vh inside an auto-height iframe.
- **Fails:** the host sizes the iframe to scrollHeight while the page asks for 100vh, which equals the iframe height. The frame either sticks at the 150px default or grows on every measurement without bound. The hero becomes 4000px tall. A fixed footer sits at the bottom of a giant frame, off-screen. A modal centres in a 4000px frame far from where the user is looking, so it seems not to open.
- **Encode:** lint VIEWPORT_UNIT_IN_EMBED. A harness probe loads the page at two iframe heights; if scrollHeight tracks the frame height, it raises EMBED_HEIGHT_FEEDBACK with the culprit. EMBED_FIXED_CHROME. SKILL.md: the default artifact layout is flow height; use an app shell only when the host declares a fixed viewport.

#### H2 · Good guest manners: no focus steal, scroll trap or key hijack — DIAGNOSTIC · runtime · P1 P3 P4
- **Prefer** shortcuts scoped to the app root via `ui.keys(root, …)` (ignoring editable targets and IME), `focus({preventScroll:true})`, no scrollIntoView on mount, and `overscroll-behavior:contain` only on inner scrollers that need it **over** a document-level keydown that calls preventDefault on Space, the arrows or Ctrl+K, a wheel `preventDefault`, `overscroll-behavior:none` on the embedded root, and `scrollIntoView()`, `focus()` or `window.scrollTo` at load or on route change.
- **Fails:** `scrollIntoView` inside an iframe scrolls the host page down to the embed on load. A wheel trap stops users scrolling past the embed. A Space hijack breaks typing in the host's input. Chromium already blocks autofocus in cross-origin frames, so programmatic focus and scrolling are the real culprits.
- **Encode:** EMBED_FOCUS_STEAL (focus or scroll changes in the first 500ms without user activation, in embed mode only) and EMBED_SCROLL_TRAP. Pointer: [gap:Behavior] keyboard shortcut registry.

#### H3 · Scheme source precedence is declared, and print pins the scheme — CORE · runtime · P1 P3 P5 AMB
- **Prefer** a closed precedence (an explicit root attribute plus `color-scheme`, then a host message `ui:theme` if the host declares one, then `prefers-color-scheme`, then light), with print pinned to light, capture keeping the current scheme, and a THEME_SOURCE diagnostic naming the winner, **over** switching only on `prefers-color-scheme`, or a class toggled on body.
- **Fails:** an iframe's `prefers-color-scheme` follows the OS or the frame element's used color-scheme (engine-dependent), not a host app's class-based toggle. The result is a dark artifact on a light host page with no signal, dark PDFs, and thumbnails captured mid-flash.
- Pointers: [color] theme-mode lifecycle (tri-state, set before paint, light for print) and the root canvas / iframe opacity rule; [media-data-motion] theme-aware media.

---

## 11. Output media: print, capture, copy

#### I1 · Print is a core layer with closed per-primitive policies — CORE · static · P1 P4 P5 MED
- **Prefer** an `@layer ui-print` (plus its attribute mirror for probing) **over** printing the interactive screen as-is. The layer:
  - forces light ink on white via `color-scheme: light` (which requires light-dark() tokens);
  - makes sticky and fixed elements static and releases app-shell heights (`height:auto; overflow:visible`);
  - hides toasts, tooltips and backdrops;
  - applies `print="show|hide|only"` (nav, toolbars and actions default to hide);
  - applies `ink="keep"`, i.e. `print-color-adjust:exact`, only where a background carries data (chart fills, status chips);
  - sets `@page` tokens;
  - prints form controls as their value text, with checkboxes keeping a printed state;
  - annotates external link URLs only inside `ui-prose`, and only when opted in.
- **Fails:** a dvh app shell with `overflow:hidden` prints one truncated page, showing only the first screen of its scroller. A dark theme prints as black blocks, or as white on white once backgrounds are dropped (economy mode). Sticky headers overlap text. 100vh heroes become blank pages. Filled-in forms print blank.
- **Encode:** the probe checks PRINT_OVERFLOW, PRINT_FIXED_REMAINS, PRINT_BG_DEPENDENT_CONTRAST and PRINT_ORPHAN_HEADING. SKILL.md: run the print probe for reports, invoices, résumés and documents.

#### I2 · Print reveals everything the screen hides — CORE · both · P1 P4 P7 MED
- **Prefer** a print policy declared by each primitive that hides content, defaulting to expand **over** PDFs that contain only the first tab, closed accordions, the visible slice of a scroller, `…` text, and blank rectangles where lazy images never loaded. The expansions:
  - `<details>` opens on print and is restored afterwards;
  - tab panels are stacked under their tab labels used as headings;
  - line-clamp and ellipsis are removed;
  - scrollers get `max-block-size:none; overflow:visible`;
  - rails and carousels reflow into wrapped grids;
  - `content-visibility` becomes visible;
  - lazy images switch to eager and are awaited with a timeout.
- **Encode:** hooks on both `beforeprint` and a `matchMedia('print')` change listener, because emulated or headless print may not fire `beforeprint`. PRINT_CONTENT_HIDDEN in the probe.

#### I3 · Fragmentation is a typed prop with safe defaults — CORE · both · P1 P3 P4 P5
- **Prefer** `break="avoid|before|after|auto"` (break-* properties with page-break-* aliases) and these defaults **over** cards split mid-content, a header lost after page 1, div tables, and grid or flex blocks taller than a page:
  - cards, stats, figures, table rows, blockquotes and code blocks avoid breaking inside;
  - headings get `break-after:avoid`;
  - `<ui-table>` emits a real thead and tfoot, so the header repeats;
  - orphans and widows are 3;
  - media get a max-block-size of a fraction of the page;
  - `box-decoration-break:clone`.
- **Fails:** a card's title lands on one page and its chart on the next. A 200-row table has no header after page 1. Engines with weak grid or flex fragmentation treat a whole container as one block, which gets clipped or pushed to a new page, leaving a large blank gap.
- **Encode:** PRINT_UNBREAKABLE_TOO_TALL, for an avoid-break element taller than a page. The browser then ignores `avoid` and splits it mid-element anyway, so the author must allow splitting or shrink it.

#### I4 · Size-reactive media re-render when the medium changes — CORE · runtime · P1 P4 MED (medium confidence)
- **Prefer** chart frames that emit `ui:medium-change` (screen, print or capture) on beforeprint, afterprint and matchMedia changes and re-render to `--ui-print-inline-size`, SVG by default, and redundant encoding (patterns, labels) so grayscale print stays legible **over** canvases sized in px at screen width, series told apart by colour alone, and chart boxes with fixed height and `overflow:hidden`.
- **Fails:** charts are clipped at the right page edge, blurry (rasterized at the screen's DPR), or blank (the print layout changed and nothing redrew; ResizeObserver isn't reliable for print layout).
- **Encode:** PRINT_CANVAS_FIXED_SIZE. Pointers: [layout]/[sizing-overlays] size-contained frame; [media-data-motion] chart sizing and redundant encoding.

#### I5 · The t=0 frame is complete, final and deterministic — CORE · both · P1 P4 P7 MED
- **Prefer** the end state as the initial state **over** IntersectionObserver reveals starting at `opacity:0`, count-ups from 0, fades delayed 600ms, mandatory 1s skeletons, lazy hero images, invisible text while fonts load (FOIT), and `Math.random()` or `Date.now()` in render paths. Concretely:
  - entrances animate only from a visible baseline; scroll reveals use `animation-timeline:view()` with a visible fallback;
  - fonts have metric-matched fallbacks;
  - a `ui.ready` promise resolves, and `html[data-ui-ready]` is set, once fonts (with a timeout), above-the-fold images and the first diagnostics have settled;
  - an explicit capture mode (`?ui-capture` or `data-ui-capture`) skips skeleton delays, renders count-ups at their final value, makes lazy images eager, freezes `ui.clock` and `ui.seed`, and pauses polling and autoplay;
  - primary content is visible without interaction: the default tab is the most informative one, key chart labels show without hover, and no modal is open at load.
- **Fails:** gallery thumbnails, link previews and the agent's own screenshot show blank heroes, zeroed stats, skeletons or a welcome modal. Two runs of the same artifact differ, so diagnostics flake and a user's reported layout can't be reproduced.
- **Encode:** CAPTURE_T0_BLANK (compares t=0 with the settled frame: content with opacity < 1, counters at zero, skeleton nodes still present). CAPTURE_FIRST_VIEWPORT_EMPTY (low text or media density, or an open overlay, at 1280×720 and at 375×667). NONDETERMINISTIC_RENDER (advisory lint). Pointers: [media-data-motion] scroll reveals default to visible; [diagnostics] settle and freeze.

#### I6 · JS rasterizers vs the library's own CSS — CONTESTED · both · P3 P7
- **Prefer** screenshots taken by the harness or browser, or a library `ui.capture(el)` that resolves tokens to computed sRGB and inlines fonts as data URLs, **over** an agent-added html2canvas or dom-to-image "Download PNG" button.
- **Fails:** html2canvas can't parse `oklch()`, `light-dark()` or `color-mix()` (it throws or drops the colour) and ignores backdrop-filter, masks, container queries and anchor positioning. Cross-origin images taint the canvas, and the `toDataURL` SecurityError gets swallowed. Remote fonts fall back. **The seed rule "OKLCH over raw hex" makes every library page incompatible with the most common JS rasterizer.**
- **Encode:** CAPTURE_UNSUPPORTED_FEATURE when a rasterizer global is present and the target subtree uses unsupported features; CAPTURE_TAINTED_CANVAS. Open question: ship ui.capture (size and maintenance cost) or ban rasterizers in SKILL.md.

#### I7 · Copy and selection are an output medium — CORE · both · P1 P3 P4 MED
- **Prefer** these **over** div grids, `▲ 12%` strings, numbers containing U+2212 or a narrow no-break space, digits split into spans for odometers, line numbers as text nodes, and `* {user-select:none}` or rows that can't be selected:
  - real `<table>` markup, since native multi-cell selection pastes as TSV;
  - `copy` handlers on ui-table and ui-number that write text/plain as TSV plus clean text/html, using raw `data-value` values under a per-column `copy="display|raw"` policy;
  - ASCII hyphen-minus and plain spaces in copied numbers;
  - decorations as `::before`/`::after`, or as aria-hidden `user-select:none` chrome;
  - ui-code line numbers drawn with CSS counters and shell prompts as `::before`;
  - `<ui-copy>` copying the raw source.
- **Fails:** a dashboard table pasted into Sheets gives one mixed column, "Sort ascending" labels, and numbers parsed as text (`#VALUE!`). Copied shell snippets interleave line numbers. Odometer digits paste one per line. A blanket `user-select:none` makes the data impossible to copy.
- **Encode:** role-based user-select defaults inside `:where()`. Lints: SELECT_NONE_ON_CONTENT, COPY_NON_TSV_TABLE (table-like display:grid structures), NUM_SPLIT_SPANS, COPY_LINE_NUMBERS_IN_TEXT. Pointers: [semantics]/[contrarian] use `<table>`; [media-data-motion] number component with the raw value in an attribute.

---

## 12. Pointers: cases owned by other sections

| Raw case | Owner | What this basin adds |
|---|---|---|
| Align icons to the first line with a 1lh box | [layout] baselines and 1lh box; [typography] icon + text; [media-data-motion] icons on the line box | UI-ICON-ALIGN (icon top more than 0.5lh below the first line box) only shows up under the `text-200`/`text-expand` axes |
| Reduced motion | [media-data-motion] centralize via tokens; [semantics] motion tokens | A blanket `transition:none` means `transitionend` never fires, so a closing modal never unmounts and an invisible overlay swallows clicks. Keep durations non-zero (e.g. 1ms) |
| Forced colors, high contrast, reduced transparency | [color] survive forced colors, glass fallbacks; [semantics] outline-only focus | `prefers-reduced-transparency` is Chromium-only, so `prefers-contrast:more` must also trigger opaque glass. Icons drawn with `mask-image` + background-color go blank in forced colors |
| gap applies to empty children | [contrarian] gap and empty nodes | `:empty` misses whitespace-only nodes in shipping engines, so the adapter must drop empty optional parts; UI-GAP-EMPTY |
| Late-arriving resources | [media-data-motion] ratio boxes; [typography] metric-matched fonts; [diagnostics] layout-shift attribution | Avatar fallback chain: image, then initials via Segmenter, then icon. UI-IMG-BROKEN (`complete && naturalWidth===0`) |
| Mobile viewport (dvh, safe areas, keyboard, no zoom lock) | [sizing-overlays] mobile viewport; [semantics] boilerplate; [typography] controls ≥16px | — |
| Overflow culprit, overflow:clip, dead sticky | [sizing-overlays] overflow detector, clip, wide data; [diagnostics] sticky silently fails | `overflow-x:auto` forces `overflow-y:auto`, so a sticky thead binds to a wrapper that never scrolls vertically |
| scrollbar-gutter: stable | [sizing-overlays] | The problem is invisible on macOS overlay scrollbars, which is the agent's environment, so use a `classic-scrollbars` harness axis rather than a runtime check |
| Auto-fill grids with a min(100%, X) guard | [layout] equal-item grids; [contrarian] grid's hidden defaults | The `count` axis (1, 2, 50) exposes giant auto-fit tiles |
| container-type collapses shrink-to-fit boxes | [layout], [diagnostics], [contrarian] | Nothing new |
| :user-invalid and a pre-mounted live region | [semantics] validation, live regions | UI-LIVE-LATE: an element with aria-live inserted with non-empty text in a single mutation |
| Forms must never submit natively | [gap:Behavior] form submit default | Without `allow-forms`, the submit is silently blocked instead of reloading: one cause, two different symptoms |

---

## 13. Contested

1. **`overflow-wrap: anywhere` vs `break-word`** (B2). The variation lens says use `anywhere`, because only it lowers min-content, so URLs stop sizing auto tracks. [contrarian] and [typography] say `anywhere` collapses shrink-to-fit boxes (buttons, badges, labels) to one letter per line. Resolution: a per-primitive default. Use `anywhere` where a track or column must not be sized by its content (table cells, grid cells in auto tracks), and `break-word` in shrink-to-fit controls.
2. **Required policy props vs defaults plus diagnostics** (B4, B6). Solid types can require `overflow`, `empty` and `error`; custom elements can't, and a type error in a no-build artifact is invisible. Lean: required in Solid; defaults plus UI-WRAP-RUNAWAY and UI-EMPTY-UNHANDLED for elements.
3. **Content with no policy: visible and flagged, or clipped?** Defaults chosen for robustness (`overflow:hidden`, ellipsis everywhere, `body{overflow-x:hidden}`) hide failures, which is the opposite of P7. Lean: visible plus a diagnostic unless a policy is declared. [contrarian] notes that `minmax(0,1fr)` turns overflow into overlap, so "visible" needs overlap detection alongside it.
4. **Middle truncation needs JS measurement on every instance**, while [contrarian] says layout primitives should have zero per-instance JS. Lean: make it a Tier 1 behaviour on ui-text, with CSS end-truncation as the Tier 0 fallback.
5. **Patching globals in dev mode** (sandbox simulation, NATIVE_MODAL_USED forwarding vs throwing). It makes failures loud in the preview, but the preview then behaves differently from production. It must be opt-in per run and never active in shipped mode.
6. **`user-select:none` on chrome roles by default** (I7). It helps copy fidelity, but hurts users who copy badge or button text and interferes with Find. Limit it to icons, handles and sort affordances.
7. **OKLCH tokens vs JS rasterizers** (I6). Ship `ui.capture` with sRGB resolution, or ban rasterizers and point agents to harness screenshots.
8. **Default embed mode** (H1). The library can't know whether the host auto-sizes the iframe. A flow-height default breaks real app-shell artifacts in hosts with a fixed viewport. This needs a host handshake or an explicit mode.
9. **Copying raw values** (I7). Pasting `1200000` when the user saw `$1.2M` may surprise them. Use a per-column policy: display for text columns, raw for numeric columns.
10. **Print defaults** (I1). Hiding nav and actions and annotating URLs suits reports, but is wrong when the user expects to print the page as-is. URL annotation stays opt-in.
11. **Capture mode** (I5). An explicit signal only. Thumbnailers that don't set it still capture t=0, so "end state first" is the real fix and capture mode is belt and braces.

---

## Appendix: dropped or corrected (whole or in part)

| Item | Reason |
|---|---|
| SAVE_CLAIM_WITHOUT_PERSISTENCE runtime detector | Text-matching heuristic with low precision; the principle moved into F2's typed tier |
| DOWNLOAD_UNVERIFIED diagnostic | Browsers give no success signal, so it fires on every download (noise); the fallback affordance is kept in F1 |
| Capture-mode auto-detection by headless UA or reduced motion | UA sniffing is fragile, and reduced motion is a user preference, not a capture signal |
| Embed dialogs that scrollIntoView on open "to reach the user" | Scrolls the host page uninvited, which contradicts H2 |
| UI-GUTTER runtime info check | Needs classic scrollbars, which the agent's macOS environment lacks; replaced by a base rule and a harness axis |
| UI-NUM-JITTER MutationObserver detector | Redundant with tabular-nums by construction (C1) and with state-reflow probing |
| UI-MT-ACTIVE (`<font>` insertion warning) | Fires only on end users' machines, never during agent verification |
| Global print URL annotation on every external link | Noisy on nav, cards and buttons; kept as an opt-in for ui-prose |
| "The geolocation callback never fires" | Wrong: denial calls the error callback with PERMISSION_DENIED. The real bug is that the agent passed no error callback (corrected in F1) |
| "An iframe's prefers-color-scheme always reflects the OS" | Imprecise: it is engine-dependent and can follow the frame element's used color-scheme (corrected in H3) |
| autofocus as the main way an embed steals focus | Chromium already blocks autofocus in cross-origin frames; H2 now targets scrollIntoView and focus() |
