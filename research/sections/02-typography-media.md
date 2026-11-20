# Typography, media, data display and motion

> **Names superseded 2026-11-20** by the name-guess eval. See [../vocabulary.md](../vocabulary.md) and [../layout-vocabulary.md](../layout-vocabulary.md). The cases below still hold. Old spellings that remain here are pre-eval: `tone=` → `variant` on components / `color` on text; `accent` → `primary`; `positive|caution|critical` → `success|warning|danger`; `pad` → `padding`; `busy` → `loading`; `none` → `0`; `ui-surface` → `ui-card` (`elevated`/`sunken`/`inverse`); `ui-callout` → `ui-alert`; `ui-time` (relative) → `ui-relative-time`; `ui-cluster|split|bar|reel|switcher|sidebar` → `ui-row` modifiers. Round 2 (same day): `scrollable` → `scroll`; `threshold` → `stack-below`; `ui-layers` → `ui-overlay`; `ui-layout`/`ui-shell` → `<ui-page layout="app">`; absolute `ui-time` → `ui-date`/`ui-datetime`; `ui-modal` → `ui-dialog`; `ui-metric` → `ui-stat`; `ui-grid columns` is now exact, and `max-columns` is the cap.

Scope: the type system and font resources, line breaking and prose, numbers/dates/units, data tables, charts, images/video/embeds, icons and inline SVG, motion.
Input: 64 raw cases from 2 explorers (typography 32, media-data-motion 32). Output: **30 entries** (42 raw cases merged into them), **22 one-line pointers** to cases owned by other sections, **13 sub-proposals dropped** (appendix). No raw case was wrong as a whole.

Tiers: **CORE** = enforced by primitives, tokens or types · **DIAGNOSTIC** = runtime or static check · **GUIDANCE** = SKILL.md only · **CONTESTED** = unresolved or resolved against another basin.
Principles: P1 owned by one place · P2 locally readable · P3 no hidden defaults · P4 robust to variation · P5 closed set · P6 one canonical way · P7 loud when wrong. NEW-x = proposed in §9.
Detect: `static` (source/lint/types) · `runtime` (DOM/CSSOM after settle) · `both` · `hard` (semantic; handled by API shape).

---

## 1. Type system and font resources

**1.1 Type roles bundle every typographic knob** · CORE · P5 P6 P1 P3 · both
- **Prefer** `<ui-text role="body|lead|label|caption|overline|heading|display|code">` (one attribute sets size, unitless line-height, weight, tracking in em, family and wrap) **over** independent font-size, leading, tracking and weight utilities.
- **Fails:** near-duplicate sizes (15/17/18px), leading unrelated to size, 10px dashboard text, uppercase labels with no tracking, display tracking leaking onto small text. `line-height: 24px | 150% | 1.5em` on a parent is inherited as a computed length, so a larger child's lines overlap.
- **Encode:** role tokens are generated from the theme's base and ratio (open at the theme, closed at the API). Sizes are in rem. Heading and display sizes are fluid via `clamp(rem, rem + vi|cqi, rem)`, always with a rem term. Container-relative (`cqi`) display type needs an outside-sized container (see layout: container-type). Unitless leading tightens as size grows. `--text-min` floor is 0.75rem. Uppercase and wide tracking exist only in `overline`. There are no free size, leading or weight props; per-role overrides happen only in the theme.
- **Detect:** `TYPO_OFF_SCALE` (computed size not on the scale), `TYPO_LEADING_RATIO` (line-height/font-size <1.05 or >2 on multi-line text, which catches inherited-length leading), `TYPO_TOO_SMALL` (<12px). Static checks: px font-size, a `clamp()` with only vw.
- See also: fundamentals "Typographic roles, not knobs" and "zoom-safe fluid scale with a floor"; expressive "Display type is a separate register". Zoom is owned by variation.

**1.2 Families only through role tokens** · CORE · P5 P6 P1 · both
- **Prefer** `family="sans|serif|mono|display"` resolved from theme stacks **over** literal `font-family` strings.
- **Fails:** invented stacks with no generic fallback (Times when the font is missing), four families on one page, code set in a proportional font.
- **Encode:** no free font-family API. Every theme stack ends in a generic family. The theme overrides stacks per script with `:lang()`.
- **Detect:** `TYPO_UNKNOWN_FAMILY` (computed family on a ui-* element is not a token stack); `TYPO_TOO_MANY_FAMILIES` (info, >3 families in use).

**1.3 Weights and styles are closed to the faces actually loaded** · CORE + DIAGNOSTIC · P5 P7 P3 · runtime
- **Prefer** a theme weight manifest (`weights: [400, 600]`) that generates both the font request and the allowed `weight` tokens **over** free `font-weight: 500/600/800`.
- **Fails:** the Google Fonts URL loads 400 and 700 but the agent uses 600. Font matching silently renders 700 (or a faux bold when no bold face exists), the hierarchy collapses, and nothing reports an error. Faux italics appear when no italic face is loaded. `<b>`/`<i>` get used for emphasis.
- **Encode:** one manifest is the single source of truth. `<em>`/`<strong>` map to weights in the manifest. Variable axes (wght, opsz, wdth) are set only through tokens. `font-synthesis: none` is polish: it hides smearing, it does not make the failure loud.
- **Detect:** `TYPO_WEIGHT_NOT_LOADED` / `TYPO_FAUX_STYLE`: compare the requested weight and style on text against `document.fonts` faces whose status is `loaded` (requested vs resolved).

**1.4 Font loading is layout-neutral and loud on failure** · CORE + DIAGNOSTIC · P3 P4 P7 · runtime
- **Prefer** a system-stack default theme (zero requests). For web fonts, prefer one theme-emitted request plus a metric-matched fallback face (`local()` with `size-adjust`, `ascent-override`, `descent-override`, `line-gap-override`) **over** a `<link>` or `@import` per family with `font-display: block`.
- **Fails:** the agent tests on a warm cache. On a cold load the font swap rewraps headings and resizes buttons (CLS). `@import` serializes requests. When CSP or the sandbox blocks the font host, the page silently falls back, to Times if the stack has no generic.
- **Encode:** `theme.fonts` compiles to one `<link>` with `display=swap`. The fallback `@font-face` is generated from metrics stored in the theme. Engine support for the override descriptors is uneven, so they count as polish only (NEW-A, fallback parity).
- **Detect:** `FONT_LOAD_FAILED` (FontFace status `error`, a `loadingerror` event, or `document.fonts.check()` failing after a timeout); `TYPO_FONT_SWAP_SHIFT` via layout-shift attribution (see diagnostics). CSP and resource declaration are owned by host-and-deliver.

**1.5 Text-coupled dimensions use text-relative units and min-sizes** · CORE · P2 P4 P1 · static
- **Prefer** `lh`, `cap`, `ch`, `rlh` and `em` (icon box `1lh`, skeleton line `1lh`, N-line reserve `calc(N * 1lh)`, input `min-inline-size: 20ch`, stat `min-inline-size: <digits>ch`) **over** px stand-ins (a `height: 24px` placeholder, a 16px icon beside 14px text).
- **Fails:** the skeleton-to-content swap shifts by a few px; reserved clamp space is wrong after a theme font change; icons ignore density and zoom.
- **Encode:** tokens are expressed in lh and ch. `ui-skeleton lines="3"` derives its height from the role's lh. Size props map to `min-block-size`, never `block-size`.
- **Detect:** static check for px `height` on text-bearing ui-* children. Basis for NEW-E.

**1.6 Monospace and code are size-normalized** · CORE · P3 P4 · both
- **Prefer** `ui-code` (inline: explicit `font-size: 0.9em`, ligatures off, `tab-size: 2`) and `ui-code-block` (scroll region, optional `wrap`) **over** bare `<code>`/`<pre>` with `font-family: monospace`.
- **Fails:** a legacy quirk renders generic `monospace` at 13px instead of 16px when the size is keyword-derived. Long code lines cause page-wide horizontal scroll, which the agent "fixes" with `overflow-x: hidden` on body.
- **Encode:** the mono token stack ends in `monospace, monospace` and the size is set explicitly in em. The block owns overflow-x and focusability (see semantics: scrollable regions). Line numbers and prompts are not selectable (see host: copy fidelity).
- **Detect:** the `LAYOUT_HSCROLL` culprit finder (owned by sizing-overlays).

## 2. Line breaking, measure and prose

**2.1 `ui-prose` styles bare semantic tags in a donut scope and owns the measure** · CORE · P1 P2 P6 · both
- **Prefer** one `<ui-prose>` around unclassed h1–h6, p, ul, ol, blockquote, table and img (markdown or LLM output), with `max-inline-size: var(--measure)` in ch, **over** classes on every paragraph or global element styles.
- **Fails:** class-littered long-form content; a global `h2 {}` bleeds into widgets; 150-character lines on desktop; a px max-width gives 40ch with one font and 110ch with another.
- **Encode:** `@scope (ui-prose) to ([data-ui-component])` with zero-specificity `:where()`. Flow spacing is heading-aware (see layout "Editorial and markdown content" and fundamentals "asymmetric heading space"). The measure belongs to the prose container (and the lead/display roles), not to every `ui-text` (§10). Outside prose, bare tags are neutralized.
- **Detect:** `TYPO_MEASURE` (body text over 90 or under 25 characters per line, from Range rects; see diagnostics "Typography sanity measured from rendered lines"); `TYPO_BARE_TEXT` (info: bare h1–h6/p outside prose or ui-text).

**2.2 Line breaking and alignment are role defaults** · CORE · P3 P5 P6 · both
- **Prefer** roles that set `text-wrap: balance` (heading, display, caption, card title), `pretty` (body) or `stable` (editable text, code), plus a closed `align="start|center|end"`, **over** manual `<br>`, max-width wrap tricks, a global `* { text-wrap: balance }`, `text-align: left` or `justify`.
- **Fails:** a single orphaned word on a heading's last line; a `<br>` that breaks wrongly at another width or language; balance on a paragraph is silently ignored beyond the engine's line cap (about 6 lines in Chromium, about 10 in Firefox) and still costs layout time; centered multi-line paragraphs; justified text with rivers when nothing hyphenates.
- **Encode:** baked into role CSS. `pretty` is an enhancement only; no layout may depend on it. `justify` is not offered. Agrees with contrarian "targeted tools, not global resets".
- **Detect:** `TYPO_MANUAL_BREAK` (`<br>` inside heading roles, static); `TYPO_CENTERED_LONG` (center alignment on more than 3 lines, runtime).

**2.3 Long-string wrapping: `break-word` by default, `anywhere` per kind** · CONTESTED · P4 P3 · runtime
- The typography explorer wants `overflow-wrap: anywhere` on all ui-text, because only `anywhere` lowers min-content so flex, grid and table items can shrink. The contrarian basin argues that `anywhere` collapses min-content, so `auto` and fit-content tracks and shrink-to-fit boxes get crushed to columns 1ch wide.
- **Proposed resolution:** `break-word` is the ui-text default, because library primitives already zero min-size (`minmax(0,1fr)`, `min-inline-size: 0`). `anywhere` applies only to `kind=identifier|url|hash` and to table text and identifier columns, where auto table layout reads min-content. `break-all` never applies to prose. The closed policy set is owned by variation ("Wrapping is a closed set of policies").
- **Detect:** the `LAYOUT_HSCROLL` culprit names a text node whose single unbreakable token is wider than its container.

**2.4 Cap-height trim only where it cannot change layout** · CORE (scoped) · P1 P3 P6 · static
- **Prefer** `text-box: trim-both cap alphabetic` inside controls whose outer block size is fixed by the control-height token (button, badge, avatar initials) **over** hand-tuned asymmetric padding or `line-height: 1` (which clips descenders).
- **Fails:** top-heavy pills; padding tuned by eye for one font that looks wrong with the next theme font.
- **Encode:** wrapped in `@supports`. Padding tokens are designed so both trimmed and untrimmed text sit centered inside the fixed `min-block-size`. On headings and section starts, trimming changes the outer box on some engines and not others (Firefox lags), so it is GUIDANCE only there (NEW-A).
- **Detect:** static check `TYPO_NUDGE`: `margin-top` or `position: relative; top` on text inside ui-* elements.

**2.5 Typographic characters** · GUIDANCE · P3 P6 · hard
- **Prefer** `<q>` with lang-driven `quotes`, real ’ – — … characters, and value+unit pairs joined by a no-break space (produced by the formatter, §3.1) **over** ASCII quotes, `...`, hyphen-minus for negatives, and `10 km` breaking across lines.
- **Encode:** a cheat sheet in SKILL.md. Sign, unit and grouping are owned by ui-number, not by agents. No runtime smart-quote pass (dropped).

**Pointers (typography owned elsewhere)**

| Raw case | Owner | Delta added from this domain |
|---|---|---|
| Semantic vs visual heading level | semantics "Heading outline"; fundamentals | none (`look` prop separate from level; ui-section infers level) |
| Truncation, line-clamp, middle truncation (+ media "Truncation must be declared") | sizing-overlays "Truncation as a primitive"; variation "Truncation is opt-in"; layout min-inline-size | `mode="middle"` for identifiers (shrinking head plus a fixed tail of N characters, CSS only); numbers never clamp; any JS truncation segments graphemes with `Intl.Segmenter`, never `slice` |
| Hyphenation; CJK/RTL/script typography | variation "lang is the single owner…", "Isolate the direction…" | `hyphens: auto` with no resolved lang is a silent no-op (`TYPO_HYPHENS_NO_LANG`). `:lang()` role overrides set tracking to 0 and disable synthetic italic and uppercase for CJK and Arabic, since letter-spacing can break cursive joining. `word-break: auto-phrase` for ja |
| Live counters / KPI stability | variation "State and data updates are metric-neutral" | `digits` prop (§3.2) |
| Icon + text alignment | layout "icon beside wrapping text… 1lh box"; variation | icon size in em/lh (§7.1) |
| rem sizing / zoom | variation "Honor user font-size and zoom"; contrarian "Fluid type… only vw" | every clamp has a rem term (§1.1) |
| Inputs ≥16px | semantics "Form control sizing" | type floor `--text-min` (§1.1) |
| Text contrast | color "Ink levels are a closed set", "Text over non-solid backgrounds" | flag `opacity < 1` used to mute text (`TYPO_OPACITY_MUTED`) |
| Worst-case content; WCAG 1.4.12 text spacing | variation "stress mode"; diagnostics "Mutation probing" | typographic mutation set: 3× length, a 60-character word, a URL, empty, RTL, CJK, emoji/ZWJ sequences, the 1.4.12 spacing override, root font-size at 200% |
| Link underlines | color / semantics "Links in running text are underlined" | underline with `text-decoration` and thickness/offset tokens plus skip-ink (a `border-bottom` underline appears only under the last line of a wrapped link); `box-decoration-break: clone` for padded inline highlights |

## 3. Numbers, dates and units

**3.1 Raw value in, named format out** · CORE · P6 P5 P3 · both
- **Prefer** `<ui-number value="1234.5" format="integer|decimal|percent|currency|compact|bytes|duration|unit" currency="USD" unit="kilometer-per-hour">`, rendered through Intl with the nearest `lang` and keeping the raw value in the DOM, **over** `'$' + n.toFixed(2)`, regex separators, `toLocaleString()` with no locale, or `${n} KB`.
- **Fails:** $1,234, 1234.5 and 1.2k on one screen; `0.30000000000000004`; percent off by 100×; KB vs KiB; "1 items"; 59.6 s rounded to "60 s"; a locale mismatch between server and client (Solid hydration mismatch).
- **Encode:** closed format enum. `percent` takes a ratio (0..1). `currency` is type-required when `format=currency`. The bytes base is fixed and documented. Uses `Intl.PluralRules` and `Intl.DurationFormat` (Baseline 2025). `formatToParts` maps `minusSign` to U+2212 (en-US Intl emits a hyphen-minus) and joins value and unit with U+00A0 or U+202F. Charts and tables share one formatter. Output is `<data value="…">`, so copy, accessibility and diagnostics read the raw value (see host "Numbers copy their raw value"). Locale resolution is owned by variation ("Route all locale semantics through Intl").
- **Detect:** `NUM_FLOAT_NOISE` (`\d\.\d*(0{6,}|9{6,})\d` in any text node; near-zero false positives); `NUM_UNFORMATTED` (`\d{5,}` or ≥4 decimals in numeric contexts with no ui-number); `STAT_NO_UNIT` (info).

**3.2 The numeric context sets figures, alignment and reserved width** · CORE + DIAGNOSTIC · P1 P3 P4 · both
- **Prefer** numeric contexts (ui-number, ui-stat, `kind=num` columns) that apply `font-variant-numeric: tabular-nums lining-nums` and `text-align: end`, and reserve width with `digits="6"` (which sets `min-inline-size: 6ch`), **over** per-cell alignment classes, proportional digits, or a monospace font for numbers.
- **Fails:** money columns misalign; live counters and timers wobble; going from 999 to 1,000 shifts neighboring elements on every tick.
- **Encode:** the context owns this, not the cell. Numbers are never clamped or truncated.
- **Detect:** `TYPO_FONT_NO_TNUM` (a DOM probe at theme registration: render "0000" and "1111" with tabular-nums in the theme font; unequal widths mean the font has no tnum feature). `LAYOUT_JITTER` (ResizeObserver sees more than 3 inline-size changes in 2 s on a ui-number).

**3.3 Calendar dates vs instants, with an explicit time zone** · CORE · P3 P6 P7 · hard
- **Prefer** `<ui-time value="2026-03-05" | "2026-03-05T14:00Z" format="date|datetime|time|relative" tz="local|utc|Area/City">` wrapping `<time datetime>` **over** `new Date('2026-03-05').toLocaleDateString()`, `toISOString().slice(0,10)`, or hand-rolled "x days ago".
- **Fails:** a date-only ISO string parses as UTC midnight, so it displays as the previous day anywhere west of UTC. The agent's screenshot is rendered in its own zone, so the bug never shows. A datetime with no offset parses as local time. Relative times go stale and make captures non-deterministic.
- **Encode:** the shape of the value decides its type. Date-only values are calendar dates, formatted with `timeZone: 'UTC'` (or as `Temporal.PlainDate` where available). Instants require an offset. Closed format enum with no pattern strings. Relative mode puts the absolute value in `title` and freezes in capture mode (see host "deterministic t=0").
- **Detect:** `TIME_AMBIGUOUS_TZ` (a datetime with no offset and no `tz`). Static check for `new Date('YYYY-MM-DD')`. Probe: ui-time can re-format under a forced far zone (Pacific/Kiritimati, Pacific/Honolulu) and diff the output. Author code that calls Date directly can only be caught statically.

**Pointers:** deltas and KPI color → color "Delta and KPI coloring follows valence". Delta added: `good="up|down"` is a *required* prop on ui-delta, zero is neutral, and each value shows sign, arrow and text.

## 4. Tables and collections

**4.1 Column kind is declared once on the header and stamped onto cells** · CORE · P1 P5 P6 · runtime
- **Prefer** `<th kind="text|num|id|date|status">` (or Solid `<Column kind>`), deciding wrapping, alignment, figures, truncation and format for the whole column, **over** per-cell classes or `white-space: nowrap` on everything.
- **Fails:** one long cell blows out the table width; numbers wrap ("1,234" split across lines) or misalign; ids end-truncate and lose the tail that distinguishes them; the agent styles some cells and misses others.
- **Hidden default:** CSS cannot select cells by their header, and `<col>` honors only `border`, `background`, `width` and `visibility`, so `col { text-align: end }` silently does nothing. This is the one place where the parent-owned seed insight needs a runtime stamp.
- **Encode:** the core runtime (or the Solid adapter) stamps `data-kind` onto cells. Each kind maps to a policy: text wraps (`anywhere`, §2.3); num is nowrap, tabular and end-aligned; id middle-truncates with the full value accessible; date goes through ui-time. Units go in the header.
- **Detect:** `TABLE_NUM_UNDECLARED` (every cell parses as a number but the kind is not num); `TABLE_COL_STYLE_INERT` (a CSSOM rule on `col` setting properties other than those four).

**4.2 Narrow tables reflow by a declared mode** · CORE (priority mode CONTESTED) · P5 P6 P4 · both
- **Prefer** `<ui-table collapse="scroll|cards|priority">`, driven by a container query on the table's own wrapper, **over** a media query that sets `display: block` on tr/td.
- **Fails:** changing the display of table parts drops table semantics in some engines. A viewport media query misfires for a table in a narrow sidebar. `display: none` on columns silently loses data.
- **Encode:** the default is `scroll` (see sizing-overlays: wide data). `cards` stamps `data-label` from the th and re-asserts role=table/row/cell. `priority` must expose the hidden columns (a row disclosure or a column picker); otherwise it is silent data loss (§10).
- **Detect:** `TABLE_DISPLAY_OVERRIDE` (non-table display on table parts without an owner attribute).

**4.3 Long collections paginate or chunk** · GUIDANCE + DIAGNOSTIC · P4 P6 · runtime
- **Prefer** pagination or "load more", plus `content-visibility: auto; contain-intrinsic-block-size: auto <estimate>` on chunks of cards or list items, **over** rendering 10k rows or a hand-built virtualizer with absolute positioning.
- **Fails:** a 5k-row mock dataset janks the page. Hand-built virtualizers break sticky headers, find-in-page, accessibility and variable row heights.
- **Hidden default:** `content-visibility` has no effect on table rows or row groups (containment does not apply to internal table boxes), so tables paginate instead.
- **Detect:** `LIST_UNBOUNDED` (info: more than 500 rows under one parent with no pagination or chunking). The overflow policy is owned by variation ("Every collection declares an overflow policy").

**Pointers**

| Raw case | Owner | Delta |
|---|---|---|
| Table scroll container + sticky header/first column | sizing-overlays "Wide data… scroll wrapper"; diagnostics "Sticky silently fails" | sticky cells need `border-collapse: separate; border-spacing: 0` (collapsed borders scroll away) and an opaque surface token |
| Sortable headers | semantics "Tabular data uses `<table>`… sortable headers as buttons" | the sort indicator is an `aria-hidden` icon, never a glyph in the header text (the glyph pollutes textContent, copied text and client-side sort keys) |
| Data states loading/empty/error/ready | variation "Data regions are total…"; semantics "Async states…"; variation "Sentinel-leak detector" | skeletons take their column set and row height (1lh) from the real table |

## 5. Charts and data marks

**5.1 Simple marks are CSS; chart text is laid out in CSS px** · CORE · P1 P4 P3 · runtime
- **Prefer** CSS mark primitives (`<ui-bar value="0.42">`, ui-meter, ui-sparkline, ui-stat) driven by a `--value` custom property. For real charts, prefer a renderer that measures its frame and lays out axes and labels in CSS px. Avoid fixed `width="600"` SVGs and viewBox + `preserveAspectRatio` scaling.
- **Fails:** viewBox scaling shrinks labels to 6px on phones (strokes too, unless `vector-effect: non-scaling-stroke`). Canvas libraries resize-loop or render at zero height. Chart fonts don't match the page.
- **Encode:** the frame contract is owned by layout ("Size-reactive content needs a size-contained frame"). Chart text uses role tokens; numbers use the shared formatter (§3.1).
- **Detect:** `CHART_ZERO_SIZE`, `CHART_OVERFLOW`, `CHART_TEXT_SCALED` (rendered label font below the type floor).

**5.2 Honest encodings by leaving footguns out of the API** · CORE (scope CONTESTED) · NEW-C · static
- **Prefer** APIs in which bar and area domains always include zero, there is no secondary axis, more than 8 series means small multiples, and part-to-whole charts are capped with an "Other" bucket. Avoid copying chart-library defaults (auto-scaled minimum, dual axes, 3D, 12-slice pies).
- **Fails:** an auto-scaled bar axis makes a 2% change look like a collapse; dual axes imply a correlation. The output looks polished, so no geometry check fires.
- **Encode:** the footguns are absent from the typed props. A line chart may use a non-zero domain only with a visible axis.
- **Detect:** `CHART_TRUNCATED_BASELINE` when an escape hatch sets a non-zero bar domain.

**5.3 Every chart has a name, a data-table twin, and values reachable without hover** · CORE · P7 NEW-D · runtime
- **Prefer** a required `title`, a `<details>` data table generated from the same data, and keyboard-navigable points that open a hint popover **over** hover-only tooltips placed by mouse-coordinate math.
- **Fails:** touch and keyboard users cannot read values; tooltips clip at the viewport edge; an agent checking the accessibility tree sees an unnamed graphic.
- **Encode:** the tooltip is the shared top-layer hint popover (see sizing-overlays "Tooltips as supplementary-only"). Series color and redundant encoding are owned by color ("Categorical data colors", assigned by key; §10).
- **Detect:** `CHART_NO_TEXT_ALT`.

## 6. Images, video and embeds

**6.1 `ui-image` reserves its box and owns its failure** · CORE · P3 P4 P7 · both
- **Prefer** `<ui-image src alt ratio="1/1|4/3|3/2|16/9|21/9|auto">` (aspect-ratio on the host, the img fills it) plus a reset `img, svg, video, canvas { display: block; max-inline-size: 100%; block-size: auto }` **over** a bare `<img>` with only a CSS width, or a background-image div with a fixed height.
- **Fails:** layout shift on load that the agent's pre-load screenshot never shows; a 4px descender gap under inline images; `height: 100%` collapsing inside an auto-height parent; hallucinated or CSP-blocked URLs leave broken-image icons the agent doesn't see.
- **Encode:** closed ratio enum. On error, the component swaps in a tonal placeholder of the same box and emits `IMG_LOAD_FAILED` with the src. With no known asset, use generated art (see expressive "seed-deterministic art").
- **Detect:** `IMG_LOAD_FAILED` (`complete && naturalWidth === 0`; near-zero false positives); `IMG_NO_INTRINSIC_SIZE` (no ratio, no width+height, and the rect height changes after load).

**6.2 Fit is chosen by image kind, focal point by name** · CORE · P5 P6 P3 · runtime
- **Prefer** `kind="photo|logo|diagram|screenshot"` choosing `cover` (photo) or `contain` (the rest), plus `focus="top|center|bottom|start|end"`, **over** `object-fit: cover` everywhere, or width+height set with no fit.
- **Fails:** stretched photos; cropped logos, charts and screenshots; portraits cropped at the forehead.
- **Encode:** `fill` is not exposed; `kind` defaults to photo.
- **Detect:** `IMG_DISTORTED` (rendered and natural aspect ratios differ by more than 2% while the fit is `fill`).

**6.3 Alt text is required; decorative is said explicitly** · CORE + DIAGNOSTIC · P7 NEW-D · static
- **Prefer** a required `alt` (Solid: `alt: string | { decorative: true }`; core: `alt=""` means decorative) **over** omitted alt, `alt="image"`, the file name as alt, or captions in `title`.
- **Fails:** alt has no visual effect, so agents skip it, and screen readers read out the URL.
- **Encode:** required by the types. `ui-figure` pairs the image with a figcaption.
- **Detect:** `IMG_NO_ALT` (error); `IMG_ALT_PLACEHOLDER` (a generic word or a file extension); `IMG_ALT_EMPTY_LARGE` (info: decorative alt on a large in-flow image).

**6.4 Loading priority follows position; resolution comes only from files that exist** · DIAGNOSTIC + GUIDANCE · P3 P5 P7 · runtime
- **Prefer** the library defaults `loading=lazy` and `decoding=async`, one `priority` image (eager + `fetchpriority=high`), and `sizes="auto"` on lazy images (Chromium-first), **over** a lazy hero, an all-eager gallery, srcset without sizes, or invented width descriptors.
- **Fails:** the LCP hero loads late. Agents fabricate srcset files that 404. **Full-page screenshots and print capture show lazy images that never loaded as blank boxes**, which corrupts the agent's own verification.
- **Encode:** capture and print modes switch lazy to eager (see host capture). SKILL.md: write no srcset unless the files exist.
- **Detect:** `IMG_LAZY_ABOVE_FOLD`; `IMG_MULTIPLE_PRIORITY`; `IMG_OVERSIZED` (info: natural width more than 2.5× rendered width × DPR).

**6.5 Video and embeds ship as attribute bundles** · CORE · P3 P4 P7 · both
- **Prefer** `<ui-video src poster ratio autoplay>` (adds `muted`, `playsinline`, `preload=metadata`, and pauses offscreen and under reduced motion) and `<ui-embed ratio title>` (a lazy iframe) **over** YouTube's `<iframe width=560 height=315>` or `autoplay` without `muted`.
- **Fails:** autoplay is silently blocked (iOS needs both `muted` and `playsinline`); fixed-size iframes overflow on phones; frames have no title.
- **Encode:** the bundle cannot be partially applied. The ratio comes from the closed set. The embed frame is size-contained.
- **Detect:** `VIDEO_AUTOPLAY_UNMUTED` (static); `VIDEO_AUTOPLAY_BLOCKED` (still paused after `canplay` with autoplay set); `IFRAME_NO_TITLE`; `IFRAME_FIXED_SIZE`.

**Pointers:** placeholder/remote images → expressive "Generated, seed-deterministic art" and host "remote resources declared" (delta: §6.1 failure swap). Theme-aware media → color "scheme-specific images key off the element's used scheme" (delta: `src-light`/`src-dark` load only the active source; a `--media-dim` token for photos in dark mode).

## 7. Icons and inline SVG

**7.1 `ui-icon`: a closed registry, currentColor, sized by text** · CORE · P1 P3 P5 · both
- **Prefer** `<ui-icon name="check">` (an inline SVG sprite, or `mask-image` with `background-color: currentColor`; box in `1em` or `1lh`; `flex: none`; `aria-hidden` unless `label` is given) **over** `<img src="icon.svg">`, emoji, icon fonts, or fixed 16px icons.
- **Fails:** an `<img>` SVG cannot inherit currentColor, so icons stay black on dark surfaces and don't tint on hover or disabled. Emoji render differently per OS. Icon fonts fail under sandbox or CSP and are read aloud as letters.
- **Encode:** `name` is a closed namespace (a Solid type error; in core, `ICON_UNKNOWN` plus a visible fallback glyph). The parent aligns the icon with a 1lh first-line box (see layout and variation). Icon-only controls require a `label` (see semantics). One family and stroke axis (see fundamentals and expressive).
- **Detect:** `ICON_UNKNOWN`; static check for `<img src=*.svg>` inside ui-button or ui-label.

**7.2 Inline SVG hygiene** · DIAGNOSTIC · P1 P2 P3 · runtime
- **Prefer** registry-generated per-instance ids (or CSS gradients and masks) and `fill`/`stroke: currentColor` **over** pasted Figma SVGs with `id="grad1"`/`clip0`, `fill="#333"`, and no width or height.
- **Fails:** duplicate ids make `url(#a)` resolve to the first match, giving the wrong gradient, or nothing when that first SVG is `display: none`; editing one icon changes another far away. An SVG with no size renders at 300×150 (no viewBox) or fills its container (viewBox only) until CSS arrives.
- **Detect:** `SVG_DUPLICATE_ID` (an id referenced by `url(#…)` that is not unique; zero false positives; see diagnostics "Reference integrity"); `SVG_HARDCODED_FILL` (fill or stroke other than none, currentColor, inherit or context-* inside ui-icon or ui-button); `SVG_NO_SIZE`.

## 8. Motion

**8.1 Motion is tokens and named presets; reduced motion collapses the tokens** · CORE + DIAGNOSTIC · P5 P6 P1 P4 · both
- **Prefer** duration, easing and distance tokens (`--motion-fast|base|slow`, `--ease-standard|emphasized`, `linear()` springs), presets `motion="fade|rise|scale|slide"`, and components that transition only named compositor-friendly properties, **over** `transition: all .3s`, animating width/height/top/left/margin, ad-hoc durations like 0.37s, or a global `@keyframes fade`.
- **Fails:** `all` animates focus rings, theme flips and layout. Layout properties jank. A later stylesheet's `@keyframes fade` silently replaces the library's. Agents either ignore reduced motion or apply `* { animation: none !important }`, which freezes spinners and strands code waiting for `transitionend`.
- **Encode:** under `prefers-reduced-motion: reduce` or `data-motion="reduce"` (a force mode for testing), durations resolve to **1ms, not 0** (a 0s transition never starts, so it fires no `transitionend`), and distances resolve to 0, so spatial motion becomes a fade. Essential indicators get a non-vestibular variant. Keyframes are prefixed `ui-`. JS reads `ui.motion.duration()`. Variation and semantics carry the same reduced-motion rule; this entry owns the token mechanics.
- **Detect:** `MOTION_TRANSITION_ALL` (computed transitionProperty is `all` with a nonzero duration); `MOTION_LAYOUT_PROP`; `MOTION_UNREDUCED` (under forced reduce, a ui-* element with a spatial transform runs longer than 10ms); `MOTION_MAXHEIGHT_HACK` (a transition on max-height; the fix is owned by semantics: details and interpolate-size).

**8.2 Reveals and entrances fail toward visible content** · CORE · P4 NEW-A · runtime
- **Prefer** a `reveal` attribute built on `animation-timeline: view()`, with the hidden starting state existing only inside `@supports` and `prefers-reduced-motion: no-preference`, **over** `opacity: 0` until an IntersectionObserver adds a class (AOS-style) or JS scroll listeners.
- **Fails:** if the script errors, and in print, reader mode and reduced motion, sections stay blank. Most important, **the agent's own full-page screenshot is blank**, so it concludes the page is empty or ships it that way.
- **Encode:** there is no JS reveal API. Overlay enter/exit uses `@starting-style` (see sizing-overlays). Solid `<Show>` unmounts at once, so the adapter's Presence wrapper holds the unmount until `transitionend` or a token timeout (see behavior "hide, don't unmount").
- **Detect:** `HIDDEN_CONTENT` (a text-bearing element with computed opacity 0 or visibility hidden after settle and a scroll-through, not inside a closed popover, dialog or details); `GHOST_INTERACTIVE` (an opacity-0 element that is still hit-testable or focusable; see semantics: inert).

**8.3 View transitions go through one wrapper** · CORE · P1 P6 P7 · both
- **Prefer** `ui.transition(update)`, which feature-detects, skips under reduced motion, always runs `update`, awaits the framework flush and generates `ui-` names from a stable key, plus `@view-transition { navigation: auto }` for multi-page sites, **over** hand-written `document.startViewTransition` and a static `view-transition-name` on repeated items.
- **Fails:** an unsupported engine throws, or a bad guard skips the update itself. Duplicate names abort the transition with only a console message. With batched updates (Solid 2.0), the snapshot can be taken before the new state is flushed.
- **Detect:** `VT_DUPLICATE_NAME` (collisions in computed view-transition-name; zero false positives); static check for `startViewTransition` outside the wrapper.

**Pointers:** animate to auto size → semantics "Disclosures…" and sizing-overlays "Auto-growing and collapsing sizes" (delta: `MOTION_MAXHEIGHT_HACK`). Enter/exit → sizing-overlays "@starting-style…" (delta: Solid Presence, §8.2).

---

## 9. Principle evidence and proposals

**How this domain tests the draft principles**
- **P1 extends to tables, but needs a runtime stamp.** A table is the oldest parent-owned layout, but per-column typography cannot be parent-owned in CSS (`<col>` supports only 4 properties). Ownership is declared on `th` and stamped onto cells (§4.1).
- **P2 cannot forbid inheritance.** Font size, leading, family and lang are inherited by design. Reword P2: *context flows only through named, declared channels (role tokens, lang, container names, the scroll owner, the motion and theme attributes), each with a diagnostic when the context is missing.*
- **P3: browser defaults are the hazard; library defaults are the cure.** The hidden browser defaults catalogued here: img baseline gap; svg 300×150 or fill-container; 13px generic monospace; `<col>` ignoring text-align; autoplay needing `muted` + `playsinline`; `new Date('YYYY-MM-DD')` parsing as UTC; Intl emitting hyphen-minus; 0s transitions firing no events; content-visibility being inert on table parts; balance being ignored past the line cap; hyphens without lang. Library defaults (balance on headings, lazy images, tabular figures in numeric contexts) are good when documented and visible in the DOM.
- **P4 needs splitting** into content (length, script, empty), container, state (loading, error), user environment (motion, zoom, spacing, scheme, locale, time zone) and **platform/load** (font arrival, engine support, capture). This domain's worst failures sit in the last two.
- **P5 has two tiers, and closure reaches resources.** The API is closed (roles, formats, ratios, kinds) while the theme is open (ratio, families, metrics). Closure must hold at the *loaded resource* level: only weights that were actually shipped may be used (§1.3).
- **P7 must reach the agent's verification loop.** Many failures here are invisible to it: warm font cache, the agent's own time zone, lazy images in full-page screenshots, opacity-0 reveals, autoplay blocked only on iOS. Diagnostics need force modes (cold font, forced time zone, `data-motion`, capture mode). The best checks compare **requested vs resolved** (weight vs face, lang-gated feature vs resolved lang, autoplay vs paused, img complete vs naturalWidth, VT name uniqueness).
- **Semantic correctness is not geometric.** Formatting, time zones and chart honesty cannot be checked from rects. They are handled by API shape (required props, omitted footguns) and by value-level scans (NaN, float noise, unformatted digits).

**Proposed principles (merged from both explorers)**
- **NEW-A Fallback parity, failing toward visible.** Progressive enhancements and late resources (web fonts, text-box-trim, `pretty`, hyphens, interpolate-size, view transitions, scroll-driven reveals, anchor positioning) may affect polish only, never layout correctness or visibility. Hidden starting states exist only inside a feature query that proves support.
- **NEW-B Raw value in, named format out.** Data enters as a machine value plus a format from a closed set. The library formats it and keeps the raw value in the DOM (`<data value>`, `<time datetime>`). Agents never concatenate formatted strings. This also lets diagnostics read values instead of parsing text.
- **NEW-C Semantic honesty.** Well-formed but misleading output (truncated bar baselines, dual axes, sign-based good/bad color, unitless stats) is made impossible by API omission or required semantic props, because no geometric check can see it.
- **NEW-D Every visual has a required non-visual twin.** Alt text, icon labels, chart title + data table, sort state via `aria-sort`. The twin is a required prop, so leaving it out fails to type-check. This also serves agents that verify through the accessibility tree.
- **NEW-E Metric coupling.** A dimension that relates to text is written in text-relative units and as a min-size, so the relation survives font, size, density and zoom changes.
- Environment adaptation in one layer, with a force mode: supported (motion tokens, data-motion, tz probe). Owned by variation.

## 10. Contested

| Issue | Positions | Proposed resolution |
|---|---|---|
| `overflow-wrap: anywhere` vs `break-word` | typography lens: anywhere everywhere · contrarian: anywhere collapses min-content | `break-word` default (primitives already zero min-size); `anywhere` for identifier/url kinds and table text/id columns (§2.3) |
| Chart series color by index vs stable key | media lens: index · color basin: key | key: filtering a series must not recolor the others (color basin wins) |
| Prose measure on every body `ui-text` vs only on `ui-prose` | typography lens: default on all body text · fundamentals: owned by the prose container | only ui-prose and the lead/display roles; a ch max on app text misaligns right edges in cards and forms |
| text-box-trim scope | lens: headings, buttons, badges | only inside fixed-height controls; elsewhere guidance (NEW-A) |
| Table `collapse="priority"` | lens: hide low-priority columns · contrarian: silent data loss | allowed only with a disclosure or column picker for the hidden columns |
| Charting scope | lens: full ui-chart with honesty constraints · general-library goal | open: ship CSS marks + frame contract + shared formatter/palette, and decide separately whether to ship a chart engine; banning dual axes blocks legitimate cases (climate charts) |
| `TYPO_BARE_TEXT` | lens: warn on bare h1/p outside prose | info level only; raw semantic HTML is a valid starting point |

## 11. Highest-signal checks from this domain

| Code | Trigger | False positives |
|---|---|---|
| `IMG_NO_ALT` | img without an alt attribute | none |
| `IMG_LOAD_FAILED` | `complete && naturalWidth === 0` | none |
| `NUM_FLOAT_NOISE` | `\d\.\d*(0{6,}\|9{6,})\d` in rendered text | very low |
| `FONT_LOAD_FAILED` | FontFace `error` / `loadingerror` / `check()` false after timeout | very low |
| `TYPO_WEIGHT_NOT_LOADED` | requested weight/style has no loaded face | very low |
| `SVG_DUPLICATE_ID` | an id referenced via `url(#)` is not unique | none |
| `VT_DUPLICATE_NAME` | computed view-transition-name collision | none |
| `VIDEO_AUTOPLAY_UNMUTED` / `IFRAME_NO_TITLE` | attribute bundle incomplete | none |
| `HIDDEN_CONTENT` | text-bearing, opacity 0 after settle + scroll, not in a closed overlay | low |
| `MOTION_TRANSITION_ALL` | computed `transition-property: all` with duration > 0 | low |
| `TYPO_HYPHENS_NO_LANG` / `DOCUMENT_NO_LANG` | `hyphens: auto` with no resolved lang | none |
| `TABLE_NUM_UNDECLARED` | all cells numeric, column kind not num | low |
| `TYPO_LEADING_RATIO` | line-height/font-size < 1.05 on multi-line text | low |
| `TIME_AMBIGUOUS_TZ` | datetime without offset and without tz | low |

## Appendix: dropped sub-proposals

| Proposal (source) | Reason |
|---|---|
| Runtime smart-quote / typography text-node pass (typographic chars) | mutates text nodes: breaks Solid reconciliation, hydration, copy fidelity and auto-translate |
| `TYPO_STRAIGHT_QUOTES` (typographic chars) | noisy on code-like text and LLM output; low value |
| Widow/orphan detector (text-wrap) | `pretty` addresses it; the heuristic is prone to false positives |
| `direction: rtl` trick for start-truncating paths (identifier truncation) | reorders punctuation through bidi; use the CSS head/tail split |
| `font-synthesis: none` as the loudness mechanism (weights) | wrong: it hides the failure (renders 400 instead of faux bold); loudness comes from comparing requested weight to loaded faces |
| `slot="card\|hero"` mapped to `sizes` (srcset) | `sizes` is viewport-relative and cannot track container layout; use `sizes="auto"` or omit srcset |
| content-visibility on table rows (long lists) | no effect on internal table boxes |
| Opt-in virtual-scroll mode in the adapter (long lists) | scope creep; paginate first |
| Default measure on every body `ui-text` (prose measure) | misaligns app UI; moved to §10 |
| `TYPO_NUMERIC_NOT_TABULAR` regex on cell text (tabular numerals) | diagnoses styling instead of the declaration; replaced by `TABLE_NUM_UNDECLARED` |
| `-webkit-text-size-adjust` note (input floor) | legacy; zoom is covered by variation |
| Hard max of 2 font families (font loading) | arbitrary; kept as info-level `TYPO_TOO_MANY_FAMILIES` (>3) |
| `MOTION_RAW_DURATION` for any nonzero duration under reduce (reduced motion) | would flag the sanctioned 1ms collapse; replaced by a threshold |
