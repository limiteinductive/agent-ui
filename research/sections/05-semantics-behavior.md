# Semantics, accessibility, interaction, behavior and state

> **Names superseded 2026-11-20** by the name-guess eval. See [../vocabulary.md](../vocabulary.md) and [../layout-vocabulary.md](../layout-vocabulary.md). The cases below still hold. Old spellings that remain here are pre-eval: `tone=` → `variant` on components / `color` on text; `accent` → `primary`; `positive|caution|critical` → `success|warning|danger`; `pad` → `padding`; `busy` → `loading`; `none` → `0`; `ui-surface` → `ui-card` (`elevated`/`sunken`/`inverse`); `ui-callout` → `ui-alert`; `ui-time` (relative) → `ui-relative-time`; `ui-cluster|split|bar|reel|switcher|sidebar` → `ui-row` modifiers. Round 2 (same day): `scrollable` → `scroll`; `threshold` → `stack-below`; `ui-layers` → `ui-overlay`; `ui-layout`/`ui-shell` → `<ui-page layout="app">`; absolute `ui-time` → `ui-date`/`ui-datetime`; `ui-modal` → `ui-dialog`; `ui-metric` → `ui-stat`; `ui-grid columns` is now exact, and `max-columns` is the cap.

Scope: what a construct *does*, meaning its name, role, focus, keyboard path, form payload, announcements and state over time, as distinct from how it looks. Input was 60 raw cases from two explorers: a semantics lens with 31 cases and a behavior/state/lifecycle gap lens with 29. The result is 39 kept cases, 17 reduced to one-line pointers because another basin owns them, and 4 merged (see the appendix). Six raw claims were corrected, and each correction is marked inline.

**Principles.** 1 owned by one place · 2 locally readable · 3 no hidden defaults · 4 robust to variation · 5 closed set · 6 one canonical way · 7 loud when wrong. Proposed additions (the case for each is under "Principle evidence"):

- **N1 Browser-owned behavior.** Prefer constructs whose focus, keyboard, dismissal, validation and form participation are implemented by the browser.
- **N2 Atomic widget contract.** A widget with an interaction contract is one indivisible component. Authors supply content and intent, never the role, state or keyboard parts.
- **N3 Meaning and appearance on separate axes.** The semantic prop (element, level, disabled-ness) is independent of the visual prop (size, tone, look).
- **N4 Parity.** Visual order, DOM/tab order, the accessibility tree, and pointer, keyboard and touch reachability all agree.
- **N5 Single writer.** Each piece of state has one representation, which is both the semantic attribute and the styling hook, and one writer, which is the runtime.
- **N6 Declared intent.** Behavior that must happen is declared at the actuator in a closed vocabulary, so its absence can be detected.
- **N7 Time-independence.** The construct stays correct when an operation is repeated, runs concurrently, runs out of order or runs mid-render, and under any load or upgrade order.

**Tiers.** CORE: primitives, tokens or types make the wrong thing hard. DIAGNOSTIC: a check is the main lever. GUIDANCE: SKILL.md only. CONTESTED. **Detect** values: static, runtime, both or hard. Diagnostic codes use the form `area/kebab-name`, and each maps to a SKILL.md anchor.

---

## A. Actuators: links, buttons, commands

### A1 Link vs button, with safe button defaults (CORE)
- **Prefer** `<a href>` for "where does it go" and `<button type=button>` for "what does it do", with submit as an opt-in (`intent=submit`). **Over** `<a onclick>`, `href="#"` or `javascript:`, `<button onclick=location=…>`, or a bare `<button>` inside a form.
- **Principles:** 3, 5, 6, N3
- **Failure:** A bare `<button>` in a form is `type=submit`, so a Cancel or Add-row button submits the form and reloads the page. Fake links lose middle-click, copy-link and open-in-tab. An `<a>` with no href is not focusable. `href="#"` scrolls to the top, or reloads `about:srcdoc` in artifacts.
- **Encoding:** `<ui-button>` and `<ui-link>` are distinct primitives. The core renders `type=button` unless `intent=submit`. `<ui-button href>` is a Solid type error. The seed case (`<button>` over `div onClick`) is not repeated here; the delta is the submit default and the hash and `javascript:` no-ops, folded in from the framed-links case.
- **Detect:** both. `a11y/anchor-no-href`, `link/noop-hash`, `link/dangling-anchor` (the hash has no matching id), `a11y/role-button-on-link`, and an advisory `form/stray-submit` (more than one submit in a form, or a submit labelled cancel, close or back).

### A2 Every actuator resolves to a declared action; sweep for dead controls (DIAGNOSTIC)
- **Prefer** buttons that each carry exactly one action source: submit with a form owner, `commandfor` plus `command`, `popovertarget`, `href` (which makes it a link), or a registered `--custom` command. **Over** markup whose JS is missing, points at the wrong element, or is bound to a node that a later render replaced.
- **Principles:** 7, N6, 2, 5
- **Failure:** Dead buttons are among the most frequent first-shot failures. The screenshot looks perfect, and a missing handler produces no error, mutation or event.
- **Encoding:** The Solid adapter types `ui-button` as a discriminated union of action sources, so a button with no source is a type error. In dev, the core patches `addEventListener` early. It also reads the `onclick` property and attribute and framework delegation markers (for example Solid's delegated-handler properties). After the page settles, it classifies every `button` and `[role=button]` as live, dead or unknown. A delegated click listener on `document` makes the verdict "unknown" rather than "dead", so the sweep never reports a false positive.
- **Detect:** runtime. `behavior/dead-control`, reported with the element path and the two canonical repairs: `command`/`commandfor` (A3), or `intent=submit`.

### A3 Wire behavior through named commands and one handler on a stable owner (CORE)
- **Prefer** `<button commandfor="todos" command="--remove" value="12">` plus one `command` listener on `#todos`, or `UI.commands(root, {'--remove': fn})`. **Over** per-item `addEventListener` calls inside a render loop, or inline `onclick`.
- **Principles:** 2 (refined), 6, 1, N6, N7
- **Failure:** An innerHTML re-render orphans per-row listeners, leaving rows dead. Re-binding on each render stacks listeners, so one click deletes twice. Closures capture stale indices.
- **Encoding:** The `command` event is dispatched at the `commandfor` target and does not bubble. That makes the target the natural stable owner, and it means listening on `document` does not work. `UI.commands` registers handlers by name and reports unknown names. The Solid adapter types `on:command` with the union of registered names. Here, action at a distance is acceptable because both ends are named and verified.
- **Detect:** both. `behavior/unhandled-command` (a `--name` with no handler reachable from its target). Reference integrity for `commandfor` is owned by [diagnostics].

### A4 One primary link per card; no interactive-in-interactive (CORE)
- **Prefer** `<ui-card href>`, which renders one real `<a>` on the title with an overlay pseudo-element covering the card, and puts secondary actions in an `actions` slot layered above it. **Over** an `<a>` wrapping a block that contains buttons, `<div onclick>` cards, or a `<button>` inside an `<a>`.
- **Principles:** 1, 2, 6, N2
- **Failure:** Nested interactive content activates unpredictably: a secondary button also navigates, the accessible name runs on, text cannot be selected, and Enter and click do different things.
- **Encoding:** The Solid adapter's type forbids `href` and `onClick` together on `ui-card`. The core owns the overlay and the layering of the actions slot inside the card's own isolated stacking context, so the author never sets z-index. The known cost is text selection inside the card.
- **Detect:** both. `a11y/nested-interactive` (a, button, input, select, textarea, summary or `[tabindex]` inside another interactive element) and `a11y/click-on-generic` (a click listener on a non-interactive element, found through the listener patch).

### A5 Pointer-only gestures need a single-pointer keyboard path (CORE)
- **Prefer** drag-to-reorder with move buttons that are always present, swipe actions duplicated as visible buttons, and any tooltip information also present as DOM text. **Over** drag-only kanban boards and sortables, swipe-only row actions, and `title=` as the only carrier of information.
- **Principles:** 4 (modality), 5, N4
- **Failure:** Agent-generated boards and sortable lists are drag-only (WCAG 2.5.7), so keyboard and switch users cannot reorder. Information that lives only in `title` is invisible on touch.
- **Encoding:** `<ui-sortable>` always renders focusable, visually quiet move-up and move-down buttons and announces the new position through D5. Hover-reveal parity is owned by [variation].
- **Detect:** both. `a11y/drag-only` (items with `draggable` or pointer-drag listeners and no button alternative) and `a11y/info-only-in-title`.

### A6 Keyboard shortcuts through one registry (CORE)
- **Prefer** `UI.hotkey('mod+k', fn, {label})` registered through one document listener. The registry skips editable targets and IME composition, normalizes `mod`, publishes `aria-keyshortcuts`, and renders a `<kbd>` hint. **Over** raw `keydown` listeners that check `e.key === '/'`.
- **Principles:** 6, 3, 7, 4
- **Failure:** Typing `/` or `j` in a field fires the shortcut. IME composition triggers actions. Two features bind one key and one silently wins. Single-character shortcuts that cannot be turned off fail WCAG 2.1.4.
- **Encoding:** The registry throws on a duplicate binding. By default, single printable-key bindings are either scoped to a focused region or require a modifier. The Enter-to-submit composition guard is owned by [variation].
- **Detect:** both. `hotkey/conflict`, and an advisory `hotkey/raw-listener` (a document keydown listener that calls preventDefault with no target check).

## B. ARIA policy, names and page structure

### B1 ARIA comes only from components that own the whole contract (CORE)
- **Prefer** native elements first. For tabs, combobox, tree, menu and toolbar, use a single library component that bundles role, states, keyboard model and focus. **Over** agent-assembled `role=tablist`/`tab` with `aria-selected` and no arrow keys.
- **Principles:** N2, 1, 6, 7
- **Failure:** Half-implemented ARIA is worse than none, because a screen reader announces a widget that does not behave like one. `aria-label` on a generic `div` is ignored. `aria-hidden` lands on focusable content. ARIA drifts from the real state.
- **Encoding:** If an author sets `role` or `aria-*` on a `ui-*` element whose component manages that attribute, the runtime warns and overwrites it. SKILL.md carries a "do you need ARIA?" table. Styling from state attributes is owned by [llm-api] and [color]. The delta kept here: toggle buttons keep a constant label and flip `aria-pressed`, because changing both double-announces; and `<ui-nav-link>` derives `aria-current=page` from the location.
- **Detect:** both. `aria/managed-attr-overridden`, `aria/invalid-role-attr`, `aria/label-on-generic`, `aria/required-owner-missing` (a tab outside a tablist), `aria/redundant-role`, and an advisory `aria/pressed-label-flip`.

### B2 Composite widgets share one roving-focus behavior (CORE)
- **Prefer** one core `roving` behavior used by every composite: one tab stop, arrow keys, Home/End and type-ahead, aware of RTL and orientation, and skipping disabled items. Use native radios or `<details name>` where they fit. **Over** per-component arrow handling, or `tabindex=0` on every item.
- **Principles:** 1, 5, 6, N2
- **Failure:** Keyboard users press Tab 40 times to get through a menu. Arrow keys are dead, or reversed in RTL. The activation model (focus follows selection vs manual) differs from screen to screen.
- **Encoding:** Closed `activation` (auto, manual) and `orientation` sets. This is kept separate from B1 because its check is mechanical.
- **Detect:** runtime. `aria/composite-multiple-tabstops` (a tablist, menu, toolbar, listbox or radiogroup with more than one `tabindex=0` child) and `a11y/tabindex-positive`. Visual-vs-focus order itself is owned by [layout] and [diagnostics].

### B3 Every control has a name; icon-only buttons require `label` (CORE)
- **Prefer** `<ui-icon-button icon="x" label="Close">`, where `label` is mandatory and renders both the accessible name and a hint tooltip, with icons `aria-hidden` by default. **Over** `<button><svg/></button>`, `title` as the only name, or `aria-label` placed on the svg.
- **Principles:** 3, 5, 7
- **Failure:** The button is announced as "button" and nothing else. `title` is not reliably exposed on touch. An `aria-label` that does not contain the visible text breaks voice control (WCAG 2.5.3).
- **Encoding:** In the Solid adapter, a `ui-button` with no text children requires `label` (a discriminated union). Icon alignment belongs to [media-data-motion]; this entry owns name computation and the label-in-name rule.
- **Detect:** both. `a11y/no-name` (button, link or control), `a11y/name-only-title`, `a11y/label-not-in-name`.

### B4 `<ui-page>` owns landmarks, the skip link and document preconditions (CORE)
- **Prefer** a `<ui-page>` with named slots that emits one `<main id tabindex=-1>`, page-level `<header>` and `<footer>`, labelled `<nav>`s and a generated skip link, plus `<html lang>`, `<title>` and a zoomable viewport. **Over** div soup, unlabeled duplicate navs, unnamed `<section>`s treated as regions, and single-file pages missing lang, title or main.
- **Principles:** 1, 3, 6, 7
- **Failure:** Users cannot jump to the content. Landmarks are indistinguishable. Pronunciation is wrong without `lang`. `user-scalable=no` or `maximum-scale=1` blocks zoom (WCAG 1.4.4).
- **Encoding:** The document-boilerplate case is merged in here. The preflight mechanism is owned by [diagnostics]; this entry owns which accessibility preconditions it asserts. Heading outline is owned by [typography] and [fundamentals].
- **Detect:** both. `a11y/main-count`, `a11y/landmark-unlabeled-duplicate`, `a11y/skip-target-unfocusable`, `a11y/doc-lang`, `a11y/doc-title`, `a11y/viewport-zoom-lock`.

### B5 Disclosures are `<details>`; view switching is tabs (CORE)
- **Prefer** `<details name="g">` with `<summary>` for disclosures and exclusive accordions, styled from `[open]`. It needs no JS, works in single files, and find-in-page expands it. **Over** `div onclick` plus a hand-synced `aria-expanded` and JS max-height tricks.
- **Principles:** N1, 1, 3, 6
- **Failure:** Triggers are not keyboard-operable. `aria-expanded` disagrees with what is visible. Collapsed content is invisible to Ctrl+F.
- **Encoding:** `<ui-disclosure>` and `<ui-accordion>` wrap `<details>`. The principle 6 tie-break is written down: exclusive disclosure of content in the reading flow uses `details name`; switching between peer views of one region uses `<ui-tabs>` (B2). Animation is owned by [sizing-overlays] and [media-data-motion].
- **Detect:** both. `aria/expanded-mismatch` (the controlled element's visibility disagrees) and `a11y/click-toggles-sibling` (a non-interactive click handler that toggles a sibling's visibility).

### B6 Controls live in light DOM; custom controls are form-associated (CONTESTED)
- **Prefer** light-DOM `ui-*` wrappers around native `<input>`, `<select>`, `<button>` and `<label>`. Use `formAssociated` plus `ElementInternals` only when a control must itself be a custom element. **Over** a `<ui-input>` that renders its input inside a shadow root.
- **Principles:** 1, 2, 6, N1
- **Failure:** `label[for]` and `aria-labelledby`/`describedby` cannot cross the shadow boundary. FormData skips the value. Autofill and password managers miss the field. `focus()` and label clicks are not forwarded.
- **Encoding:** This is an architecture rule for every control. It is contested by [contrarian] "shadow DOM only for behavior widgets". Proposed resolution: shadow DOM is allowed only for a widget that owns its full contract (B1), is form-associated, uses `delegatesFocus`, and is never the target of an external id reference. Anything that wraps a native control, or is referenced by `for` or `aria-*`, stays in light DOM. Cross-root ARIA (reference target) is not baseline and must not be relied on.
- **Detect:** both. `form/shadow-wrapped-control`, `aria/ref-crosses-shadow`, `form/named-control-not-in-elements`.

## C. Forms: fields, values, validation, payload

### C1 `<ui-field>` owns label, hint, error and their wiring (CORE)
- **Prefer** `<ui-field label="Email" hint="…"><input …></ui-field>`. It generates ids when connected and sets `for`, `aria-describedby`, `aria-errormessage`, `aria-invalid` and the required marking on the slotted native control. **Over** placeholder-as-label, a sibling `<label>` and `<input>` with no `for`, error spans nothing references, and hand-written ids that collide in repeated rows.
- **Principles:** 1, 2, 4, 7
- **Failure:** The label disappears once the user types. Clicking the label does not focus the field. The screen reader announces "edit text" with no name. Errors are not announced. Duplicate ids attach a label to the wrong field. Floating labels break on long text.
- **Encoding:** Containment replaces id pairs, consistent with [llm-api] linear-writable markup. `label` is required in the Solid types, and there is no placeholder-as-label mode. Ids come from the shared deterministic helper (G2).
- **Detect:** both. `a11y/no-name`, `a11y/placeholder-only-name`, `dom/duplicate-id`, `a11y/orphan-label`.

### C2 Input purpose is a closed `kind` that expands to the full attribute bundle (CORE)
- **Prefer** `<ui-field kind="email|tel|postal-code|one-time-code|integer|decimal|currency|search|url|username|new-password|current-password|name|…">`, which sets `type`, `inputmode`, `autocomplete`, `enterkeyhint`, `autocapitalize` and `spellcheck` together. **Over** `type=text` everywhere, or `type=number` for identifiers.
- **Principles:** 3, 5, 6
- **Failure:** `type=number` adds spinners and scroll-wheel changes, strips leading zeros and accepts `e`. Mobile users get the wrong keyboard. Autofill and password managers fail (WCAG 1.3.5). Autocorrect mangles emails and names. OTP codes cannot be autofilled from SMS.
- **Encoding:** Raw `type` and `inputmode` are not exposed. **Correction:** `postal-code` must not force `inputmode=numeric`, because UK, Canadian and Dutch postcodes are alphanumeric. It maps to `type=text autocomplete=postal-code autocapitalize=characters spellcheck=false`. Numeric keyboards are reserved for `integer` and `one-time-code`; `tel` uses `type=tel`. The 16px control floor and ch-based width hints are owned by [typography] and [fundamentals].
- **Detect:** both. `form/number-for-identifier` (`type=number` where the name or label matches zip, postal, phone, card, otp, pin or id), `form/missing-autocomplete`, `form/password-no-autocomplete`. All three are heuristic and locale-dependent, so they are advisory.

### C3 Groups are fieldset plus legend; choices are native inputs (CORE)
- **Prefer** `<ui-choice-group legend="…">`, which renders `<fieldset><legend>` around native radios or checkboxes (arrow keys come free). Card styling reads `:checked` and `:has(:focus-visible)`. A switch is `<input type=checkbox switch>` or `role=switch`. **Over** a heading div above the radios, clickable-div radio cards, and `display:none` on the real input.
- **Principles:** N1, 1, 5, 6
- **Failure:** The screen reader announces "radio button 1 of 3" with no question. Custom radios lose arrow keys, focus and form submission. `display:none` removes the input from both the tab order and the accessibility tree.
- **Encoding:** `legend` is required. The real input is visually hidden with the clip pattern, never `display:none`.
- **Detect:** static. `form/radio-group-unnamed` (two or more same-name radios with no fieldset/legend and no named radiogroup) and `aria/fake-checkable` (role checkbox, radio or switch on a non-input).

### C4 Native select and datalist before custom listboxes (CORE)
- **Prefer** `<select>`, styled with `appearance: base-select` where supported and classic native styling otherwise; `<input list>` with `<datalist>`; native date, time and range inputs with `<output>`; and a library combobox only for async or multi-select filtering. **Over** div dropdowns with a hand-managed `aria-activedescendant`, and div sliders or datepickers.
- **Principles:** N1, 1, 5, 6
- **Failure:** No type-ahead, Home/End or Esc. The value is missing from FormData. `aria-activedescendant` is wrong. Mobile users lose the native picker.
- **Encoding:** `<ui-select>` is a native select with theme parts and feature-detected base-select. `<ui-combobox>` is one bundle (B1). The principle 6 tie-break: fixed options use select, free text with suggestions uses datalist, and async or multi-select uses combobox. [llm-api] owns the "style native controls" mechanism; this entry owns the choice table.
- **Detect:** both. `aria/hand-listbox` (role listbox or combobox authored outside a `ui-*` component), `aria/fake-range` (role slider or spinbutton with no native input), `form/custom-control-not-in-formdata`.

### C5 Native constraint validation, `:user-invalid`, one error channel (CORE)
- **Prefer** native constraints (`required`, `type`, `pattern`, `min`, `minlength`) plus `setCustomValidity` for server errors, styling on `:user-invalid` and `[aria-invalid=true]`, and moving focus to the first invalid field or an error summary on failed submit. Errors are text plus an icon. **Over** `:invalid` styling, a parallel JS `errors{}` object, a red border as the only signal, and `novalidate` with hand-rolled checks that skip the accessibility wiring.
- **Principles:** N1, N5, 1, 3, 4
- **Failure:** A pristine form renders fully red, because `:invalid` matches on load. Errors are visible but neither announced nor linked to their field. Submit gives no feedback. Validity, error text and `aria-invalid` drift apart.
- **Encoding:** `<ui-field>` reads `validity` and toggles its error slot and `aria-invalid`. `<ui-form>` intercepts an invalid submit, focuses the first invalid control and updates one live summary. The announcer-mounted-in-advance angle is shared with [variation].
- **Detect:** both. `form/invalid-pseudo-in-author-css` (static stylesheet scan), `form/error-without-text`, `form/aria-invalid-without-message`.

### C6 One value and event contract across vanilla and Solid (CORE)
- **Prefer** `.value` as the only value surface and the native events `input` (continuous) and `change` (commit), plus a short closed list of `ui-`prefixed domain events (for example `ui-sort`) that are never needed to read a value. **Over** invented events such as `value-changed` or `ui-change`, `e.detail.value`, reading values from attributes, and re-dispatching inner events in a new shape.
- **Principles:** 5, 6, 3, 7
- **Failure:** The listener never fires, or it reads `undefined`; the control looks fine but is dead. A live filter updates only on blur because the agent chose `change`.
- **Encoding:** Light-DOM wrappers let the inner control's native events bubble through the host untouched. **Correction:** `event.target` is the inner native control and `currentTarget` is the host. Both expose `.value` because the host mirrors the inner control, so the types should be `currentTarget: Host` and `target: HTMLInputElement | …`. Each element ships an emitted-events manifest, and SKILL.md has one row per element.
- **Detect:** both. `event/unknown-name` (a listener on a `ui-*` element for an event not in its manifest; the message names the nearest valid event).

### C7 Read the form with FormData; every value-bearing control is named (CORE)
- **Prefer** `new FormData(form, event.submitter)`, or `<ui-form>.values()`, which returns arrays for multi-valued names, with every value-bearing control named and form-associated. **Over** per-field listeners that mirror values into a state object, `Object.fromEntries` on multi-value fields, and disabling inputs before reading them.
- **Principles:** 1, 3, 4, 7
- **Failure:** Disabled controls are excluded from the payload, so "disable on submit, then read" yields empty data. `Object.fromEntries` keeps only the last checkbox. Nameless controls silently vanish. **Correction:** `new FormData(form)` never includes the submitter, so the payload loses which button was pressed unless the submitter is passed explicitly. The raw case framed this as a disabled-submitter problem.
- **Encoding:** The pending state uses `aria-disabled`, `readonly` or `inert`, all of which keep values in the payload, and never `disabled` (D1). `<ui-form>.values()` is typed and array-aware.
- **Detect:** both. `form/nameless-control`, `form/disabled-before-read` (FormData constructed while the form's controls are disabled, found through a patched constructor in dev), `form/duplicate-name` (for controls other than checkboxes and radios).

### C8 Value is a property, the attribute is the default, and writes never fight the user (CORE)
- **Prefer** native semantics: the `value` attribute is the initial value, the `.value` property is the live value, and `form.reset()` resets. Uncontrolled with `defaultValue` is the documented default. The Solid adapter assigns the property, skips equal writes and defers writes during IME composition. **Over** `setAttribute('value', …)` after the user has typed, transforms that make the caret jump, and clearing a field by re-rendering its container.
- **Principles:** 3, 6, 1, 7
- **Failure:** After the first keystroke, attribute updates are ignored, so "clear after submit" silently fails. Uppercase or mask transforms move the caret. IME composition is interrupted.
- **Encoding:** The adapter has separate `value` and `defaultValue` props. SKILL.md has one table covering initial, live and reset values for both vanilla and Solid. Masking goes through `kind` (C2), and the component owns caret-preserving formatting.
- **Detect:** both. `form/attr-value-after-dirty` (a mutation changes the `value` attribute on a dirty control).

### C9 Unsaved-changes guard derived from dirtiness (CORE, opt-in)
- **Prefer** `<ui-form guard>`, which computes `[dirty]` by comparing FormData with its initial snapshot, installs one `beforeunload` listener only while dirty, clears it on successful submit through D2, and routes in-app navigation through a confirm dialog. **Over** a global flag flipped on every change, and a `beforeunload` handler left registered after save.
- **Principles:** N5, 1, 3, 7
- **Failure:** Users lose drafts, or the guard fires after a successful save. In sandboxed frames without `allow-modals`, the prompt never shows while the agent believes it exists.
- **Encoding:** `[dirty]` is written only by the runtime. Capability probing is owned by [Host and deliver].
- **Detect:** both. `form/guard-inactive-in-frame` and `state/written-by-author`.

## D. Async actions and runtime-owned state

### D1 One disabled model with a reason; pending never uses `disabled` (CORE)
- **Prefer** native `disabled` only for controls that are truly inapplicable. For "not yet" and loading, use `aria-disabled=true`: activation is swallowed, focus is kept, and an optional `disabled-reason` is linked through `aria-describedby`. One token set styles `:disabled`, `[aria-disabled=true]` and `[aria-busy=true]`. **Over** opacity plus `pointer-events:none`, a `.disabled` class, disabling the button that was just clicked, and disabled submits with no explanation.
- **Principles:** N5, N3, 1, 3
- **Failure:** With `pointer-events:none` the button is still activatable from the keyboard. Native disabled removes the control from the tab order, so a keyboard user cannot discover why the form will not submit. Disabling the focused button drops focus to `<body>`. A CSS-only disabled state allows a double submit.
- **Encoding:** `<ui-button disabled>` swallows click, Enter/Space and implicit form submission (cancelling the default button's synthetic click cancels the submit), and it keeps focus. Disabled color tokens are owned by [color].
- **Detect:** both. `a11y/pointer-events-none-focusable`, `form/disabled-submit-no-reason`, `a11y/looks-disabled` (low opacity plus a not-allowed cursor with neither native nor ARIA disabled).

### D2 One async action primitive; the runtime is the only writer of action state (CORE)
- **Prefer** `UI.action(trigger, async ({signal}) => …)`, with `<ui-form>` submit usable as a trigger. It writes `state=pending|success|error` and `aria-busy` on the control, locks re-entry with `aria-disabled`, keeps focus, announces the outcome, and stays on error with a retry. **Over** `let loading = false` flags, try/finally blocks that forget to reset, and spinners that persist after a throw.
- **Principles:** N5, N7, 1, 5, 7
- **Failure:** A double submit creates duplicate records. A thrown error leaves the spinner forever, or silently returns to idle. Success is never confirmed, so users click again.
- **Encoding:** `state` is read-only for authors. The Solid adapter is a thin layer over Solid 2.0's action, pending and optimistic primitives (names to be verified against the shipped release), so there is one contract in two implementations.
- **Detect:** both. `state/written-by-author`, `action/stuck-pending`, `action/double-submit` (two submits from one form within 300ms with no action wrapper).

### D3 Async results are latest-wins by construction (CORE, enforced by API shape)
- **Prefer** handlers that receive an `AbortSignal`, which is aborted when a newer invocation starts or the element disconnects; the library applies a result only if its signal was not aborted. `UI.search(input, (q, signal) => …)` is debounced and composition-aware. **Over** `fetch().then(render)` inside an input handler, hand-rolled debounce, and sequence counters.
- **Principles:** N7, 4, 1
- **Failure:** The user types "ab" and then "abc", and the "ab" response lands last and wins. Stale results overwrite a later optimistic state. This reproduces only under real latency, which agents do not test.
- **Encoding:** The API shape is the lever: the signal is passed in and the library owns the apply step. Solid 2.0 async computations give the same semantics natively.
- **Detect:** hard. An optional dev-only check, `async/out-of-order-apply`, can wrap fetch. The main protection is that the API shape prevents the bug.

### D4 Destructive actions declare their consequence (CORE)
- **Prefer** a closed `consequence="reversible|irreversible"` on the actuator. A reversible action happens immediately, shows an undo toast and defers the commit. An irreversible action opens an in-page `<dialog>` confirm whose destructive button does not get default focus. Optimistic updates carry a rollback. **Over** `confirm('Are you sure?')`, deletes with no undo, and optimistic UI with no rollback.
- **Principles:** 5, N6, 7, 3
- **Failure:** In sandboxed frames `window.confirm` returns immediately, so the delete either never runs or runs unguarded. Optimistic state diverges from the server after errors. Mistaken deletes cannot be recovered.
- **Encoding:** These are options on D2 (`consequence`, `optimistic`, `rollback`). The confirm-dialog primitive and the blocking of modal APIs are owned by [Host and deliver].
- **Detect:** both. `action/undeclared-destructive`, advisory only: it matches a localized list of labels such as delete, remove, clear and reset.

### D5 One pre-mounted announcer; toasts that persist (CORE)
- **Prefer** a singleton live region created at init and written through `announce(msg, 'polite'|'assertive')` (Solid: `useAnnounce()`). Use `role=status` for results and `role=alert` only for errors that need to interrupt. Toasts pause on hover and focus, have a close button, default to long durations, and are never the only error channel. **Over** live regions created together with their content, `aria-live` on large containers, and toasts that auto-dismiss after 2-3 seconds.
- **Principles:** N2, 2, 4, 7
- **Failure:** Screen-reader users get no feedback for save, copy or validation, or they get flooded with re-reads. Time-limited toasts are missed (WCAG 2.2.1). Solid conditional mounting recreates the region on every update. **Correction:** `role=alert` inserted together with its content is often announced, but inconsistently across assistive technologies. Inserting any live region already filled is unreliable, so the singleton is the rule.
- **Encoding:** `<ui-toast>` composes the announcer. Politeness is a closed set.
- **Detect:** runtime. `live/inserted-with-content`, `live/oversized-region`, `toast/too-short` (under 5 seconds with no pause on hover or focus).

## E. Rendering identity and state preservation

### E1 Static skeleton with setters; dynamic rows through one keyed-list contract (CORE)
- **Prefer** static HTML with `data-ref` anchors and a `render(state)` that writes only through stable setters (`textContent`, `.value`, `.hidden`, `dataset`). Dynamic rows go through `UI.list(container, items, {key, template})` in vanilla or `<Each items key>` in Solid, with a required stable key. **Over** `container.innerHTML = items.map(…)` on every change, index keys, reference-keyed lists over freshly fetched arrays, and remove-and-reinsert for reorders.
- **Principles:** 1, 4, 6, N7
- **Failure:** Every re-render recreates nodes. Focus drops to body, the caret resets, typed values vanish, details and popovers collapse, scroll and transitions restart, and the list is re-announced. Polling refreshes recreate every row. With index identity, drafts attach to the wrong row after a delete.
- **Encoding:** A reconciler of about 60 lines: key diff, `template.content.cloneNode`, text written via `textContent`, and moves via state-preserving `moveBefore()` where supported, otherwise `insertBefore`. It has the same name and semantics in both layers. `key` is required in the types, and index identity is an explicit `index` opt-in for static lists. The Solid keyed-list case is merged in here.
- **Detect:** both. `list/key-duplicate`, `list/key-missing`, `list/key-is-index` (on reorder), `list/rekeyed-wholesale` (N rows removed and N added with identical text after one update).

### E2 Hide stateful regions instead of unmounting them; validation is per step (CORE)
- **Prefer** tabs, wizard steps and form-bearing panels that stay mounted and toggle `hidden`/`inert` (or `hidden=until-found`). The library validates the active step on each step change and the whole form on final submit. **Over** `{step() === 2 && <Step2/>}`, `<Show>`, or innerHTML swaps for panels that hold input.
- **Principles:** 1, 4, 3, N7
- **Failure:** Going back discards input, selection and scroll. Required fields on unmounted steps are skipped, so a wizard submits incomplete data. The opposite choice fails silently too: an invalid required field inside a hidden or inert panel blocks native submission, with only a console message ("invalid form control … is not focusable"). Neither choice is safe unless the library owns per-step validation.
- **Encoding:** `ui-tabs` and `ui-steps` keep panels mounted and call `reportValidity` per step. Step state lives in the URL (F1) or in one store.
- **Detect:** both. `state/discarded` (E3) for removed dirty panels, and `form/invalid-hidden-control`.

### E3 State-destruction detector (DIAGNOSTIC)
- **Prefer** a MutationObserver-based check that runs when a DOM removal takes focus with it or discards dirty state, and names the removed element, the mutated container and the repair. **Over** relying on screenshots, or checking focus only at load.
- **Principles:** 7, 4, N4
- **Failure:** A search-as-you-type input inside the re-rendered region loses focus and caret on every keystroke. Deleting the focused row strands keyboard users on body. Snapshot validation cannot see either.
- **Encoding:** On `removedNodes`, check `document.activeElement === body` in a microtask and again on the next frame, which allows a deliberate refocus. Inspect detached subtrees for `value !== defaultValue`, `[open]`, popover-open state (from `beforetoggle` bookkeeping) and cached scroll offsets. Attribute the finding to the nearest `data-ref` or id ancestor. A removal is exempt when focus returns to a trigger, as when an overlay closes.
- **Detect:** runtime. `focus/lost-to-body`, `state/discarded`.

### E4 Post-action focus destination is part of the action (CORE)
- **Prefer** a closed `focus-after="next|prev|list|trigger|none"` whose default comes from the action type: delete moves to the next row or the list heading, save moves to the edit trigger, and add moves to the new item. **Over** removing the focused node and doing nothing, or focusing a node that a later render replaces.
- **Principles:** 1, 3, N6
- **Failure:** After a delete, add or save, the next Tab starts from the top of the document, and screen-reader users lose their place. Agents never test with a keyboard, so they never see it.
- **Encoding:** D2 and E1's row removal resolve `focus-after`. If nothing is specified, focus moves to the nearest focusable sibling, or else to the container (`tabindex=-1`). Overlay focus return is owned by [sizing-overlays].
- **Detect:** both. `focus/lost-to-body` (E3) names the missing `focus-after`.

### E5 Closed and offscreen content is inert or hidden (CORE)
- **Prefer** `inert` on collapsed drawers, off-canvas panels and the page behind custom overlays, and `hidden`, `hidden=until-found` or `display:none` for closed states. **Over** `transform: translateX(-100%)` or `opacity:0` as the closed state, and `aria-hidden=true` on a subtree that still holds focusable elements.
- **Principles:** N4, 2, 4, 7
- **Failure:** Tab lands on invisible controls. Screen readers read closed accordions and hidden wizard steps. Focus ends up inside an `aria-hidden` subtree.
- **Encoding:** `<ui-drawer>` and `<ui-collapse>` set `inert`/`hidden` when closed; their animation (`@starting-style`, `allow-discrete`) is owned by [media-data-motion]. **Correction:** the raw case listed `content-visibility:auto`, but it does not remove content from focus or the accessibility tree. It is a rendering optimization, not a closed state.
- **Detect:** runtime. `aria/hidden-focusable` and `focus/invisible-reachable` (a focusable element that, at rest, is fully offscreen or at opacity 0 with no inert or hidden ancestor).

## F. Navigation, history and persistence

### F1 URL state is one typed schema (CORE)
- **Prefer** `UI.url({tab:'overview', q:'', page:1})`, which declares keys, types and defaults. Defaults are omitted from the URL. New logical locations (tab, page, step) use `pushState`, and ephemeral input uses `replaceState`. State is restored on `popstate` and `hashchange`. Single files use the hash form `#/view?…`. **Over** ad-hoc `location.hash` parsing, a `pushState` per keystroke, state held only in memory, and hash routing that collides with `#id` anchors.
- **Principles:** 1, 5, 6, 4, 3
- **Failure:** Reload, back and share lose the view state. Back leaves the app after a run of typing-created entries. In opaque-origin frames `pushState` throws, or it changes a URL nobody can share.
- **Encoding:** A fixed convention: `#/` for state, plain `#id` for anchors. Invalid values fall back to defaults. Solid gets the same schema as a signal-backed store.
- **Detect:** both. `url/param-invalid`, `url/state-not-shareable`.

### F2 View changes move focus, set the title, announce and restore scroll (CORE)
- **Prefer** one `ui-view` or router primitive that, on each change, sets `document.title`, focuses the new view's heading (`tabindex=-1`) or main, announces through D5, scrolls to the top for new locations, and restores scroll on back/forward traversal, including inner scrollers keyed by history entry. **Over** swapping content while focus stays on a now-hidden link, relying on native scroll restoration for div scrollers, and Navigation API `intercept()` with its default focus and scroll behavior.
- **Principles:** 1, 3, 7, 4
- **Failure:** Focus is stranded or reset to the start of the document. Screen-reader users hear nothing. The title is stale. Back returns to the top of a long list.
- **Encoding:** Shares the app-shell scroll owner with [layout] and [sizing-overlays]. Uses the Navigation API when present and hash routing otherwise.
- **Detect:** both. `view/no-focus-or-title`.

### F3 Close requests use native overlays or CloseWatcher, not history hacks (GUIDANCE)
- **Prefer** sheets and drawers built on `<dialog>` or popover, which are already wired to Esc and the Android back gesture, and `CloseWatcher` inside the single overlay behavior for anything else. **Over** calling `pushState` when a sheet opens so that back closes it, and custom Escape keydown handlers.
- **Principles:** 6, 1, 3, N1
- **Failure:** Dead history entries: back after closing duplicates an entry, and refresh reopens the sheet. Or the Android back gesture exits the app while a sheet is open.
- **Encoding:** `ui-sheet` is a `<dialog>` or `popover=manual`, with a feature-detected CloseWatcher fallback.
- **Detect:** hard. An advisory `overlay/history-hack` (pushState in the same task as an overlay toggle).

### F4 Persisted state is versioned and validated (CORE)
- **Prefer** `UI.store('todo', {version, schema, default})`, which validates on load and migrates or resets loudly, is namespaced per artifact, and persists durable user data only. **Over** `JSON.parse(localStorage.getItem('state'))`, unversioned keys, and persisting transient UI state.
- **Principles:** 4, 3, 7, 5, N7
- **Failure:** The agent republishes with a new state shape. A returning user's browser loads the old shape, and the page crashes or renders NaN. This never happens in the agent's fresh preview.
- **Encoding:** `version` and `schema` are required in the signature. Throw-safe storage and durability tiers are owned by [Host and deliver]; this entry owns versioning.
- **Detect:** both. `store/shape-mismatch` and a static `store/raw-json-parse`.

## G. Lifecycle, adapter and injection

### G1 Upgrade timing: define early, upgrade properties, make lookups fail loudly (CORE; load mode CONTESTED)
- **Prefer** these together: the core defines elements before page code touches them; the base class re-applies own properties set before upgrade (the upgrade-property pattern); page code waits with `UI.ready()` or `whenDefined()`; refs are typed as the element class and upgraded before the ref callback runs; and `UI.ref('save')` throws and lists nearby valid names. **Over** loading the core with `async` or `defer` while page code sets `el.items` immediately, and `getElementById('sav-btn')` returning null partway through init.
- **Principles:** 3, 7, N7
- **Failure:** A property set before upgrade becomes an own data property that shadows the accessor, so the component stays empty. Methods throw "not a function". A mistyped id throws halfway through init, and every control set up after it is dead. Refs to dynamically created elements fire before upgrade under some load orders.
- **Encoding:** `_upgradeProperty` runs for every public property. The Solid adapter calls `customElements.upgrade(el)` before ref callbacks and maps tag names to element classes for ref types. The refs case is merged in here. **Contested:** the raw case proposed a blocking classic `<script>` in the head. That defines elements before the body is parsed, so `connectedCallback` runs before the element's children exist. It is safe only if no element reads its children on upgrade (G2). Proposed resolution: allow the blocking definition, because the CSS-first contract already forbids child-dependent upgrade; behavior that needs children attaches through a child observer or on DOMContentLoaded.
- **Detect:** both. `lifecycle/own-property-shadows-accessor`, `lifecycle/undefined-at-ready` (extends the `:not(:defined)` tripwire with a timing cause), `lifecycle/ref-before-upgrade`, `ref/missing`.

### G2 Upgrade never mutates children; generated ids are deterministic (CORE)
- **Prefer** `ui-*` elements that set attributes, ids and ARIA but never insert, remove or reorder their own children on upgrade. Generated ids derive from the author's id or the tree position, through one helper shared by core and adapter (Solid's unique-id facility under SSR). **Over** a `connectedCallback` that prepends icons or wraps children, and ids from `Math.random` or a module counter.
- **Principles:** 1, 3, 4, N7
- **Failure:** Solid SSR outputs complete light-DOM HTML. If upgrade changes children before hydration, the hydration keys no longer line up, and nodes are duplicated, dropped or mis-bound. Counter-based ids differ between server and client, so label and ARIA links break only after hydration.
- **Encoding:** One id helper. Core tests assert that each primitive leaves its children unchanged on upgrade.
- **Detect:** runtime. `lifecycle/upgrade-mutated-children`.

### G3 Solid props are reactive proxies (DIAGNOSTIC)
- **Prefer** reading `props.x` inside JSX or tracked scopes, `splitProps` and merge helpers for forwarding, and thunks in no-build `html` templates (`${() => count()}`). **Over** `function Card({title})`, a top-level `const {title} = props`, and `${count()}`.
- **Principles:** 3, 7, 2, 4
- **Failure:** The component renders correctly once and never updates, which is exactly the failure a snapshot cannot catch. React-style destructuring is the agent's default.
- **Encoding:** Types cannot forbid destructuring, so the levers are: a lint preset shipped with the package and quoted in SKILL.md; Solid's dev warnings about untracked reads, routed into the diagnostics stream; and library components written without destructuring, so the exemplars agents copy are correct.
- **Detect:** both. `solid/prop-destructured` (lint) and `solid/prop-read-untracked` (dev).

### G4 Untrusted data: one escaping path per sink, and validated URL props (CORE + DIAGNOSTIC)
- **Prefer** `textContent` or an escaping `UI.html` tagged template for text; `<ui-prose>` with `setHTML()` (the Sanitizer API) or a bundled allowlist sanitizer for rich content; URL-typed props (`href`, `src`, `action`, `poster`) validated against a scheme allowlist; and tokens for style. **Over** template literals assigned to `innerHTML`, `document.write`, data interpolated into `style`, `srcdoc` or `on*`, and assuming HTML escaping protects `href="${url}"`.
- **Principles:** 3, 7, 6, 5, 1
- **Failure:** XSS from any data field, often LLM output the agent rendered itself. Broken markup from a stray `<` or `&`. Clickable `javascript:` URLs that pass HTML escaping. Sample data looks fine, so all of this passes visual review.
- **Encoding:** In dev, the core installs a Trusted Types default policy, enabled by a meta CSP `require-trusted-types-for 'script'` and feature-detected. Every HTML sink then funnels through one function, which logs the call stack and passes the string through. Production sanitizes. URL setters reject `javascript:` and `data:text/html` and render inert. The attribute-context injection case is merged in here. **Contested:** a meta CSP in an artifact can collide with the host's CSP and with third-party libraries, so it stays dev-only and opt-in.
- **Detect:** runtime. `inject/innerhtml-sink` (with a heuristic for interpolated content) and `inject/url-scheme-blocked`.

---

## Pointers to cases owned by other basins

| Raw case | Owner | Delta kept here |
|---|---|---|
| Dialogs: native `<dialog>.showModal()` | [sizing-overlays] (overlays, `open`-attribute trap, focus/naming contract) | `a11y/fake-dialog`: `role=dialog` or `aria-modal` on a non-dialog element |
| Popovers, menus, tooltips | [sizing-overlays] (popover modes, anchor positioning, tooltips) | none |
| Form control sizing, 16px floor, field-sizing | [typography], [fundamentals], [sizing-overlays] | none |
| Heading level vs size | [typography], [fundamentals], [diagnostics] | N3 generalizes it |
| State in the ARIA attribute, not `.active` | [llm-api], [color] | constant toggle label and derived `aria-current` (in B1) |
| Focus order equals DOM order | [layout], [contrarian], [fundamentals], [diagnostics] | `a11y/tabindex-positive` (in B2) |
| Focus ring, focus not obscured | [color], [sizing-overlays], [variation] | the theme layer cannot set `outline-style:none` (core layer lock) |
| Target sizes | [variation], [fundamentals] | a hit-area pseudo-element keeps the floor when `density` shrinks visuals |
| Async states, plus the Solid 2.0 boundary mapping | [variation], [media-data-motion] | per-state accessibility: `aria-busy` while loading, error announced with a focusable retry, skeleton hidden from AT |
| Scrollable regions reachable by keyboard | [diagnostics], [sizing-overlays] | Chromium now makes scrollers focusable by default and Safari does not; neither supplies a name, so the check stays |
| Tabular data in `<table>` | [contrarian], [layout], [media-data-motion] | restore `role=list` when list-style is removed (Safari) |
| Link underline, color-only meaning | [color], [typography], [media-data-motion] | none |
| Motion tokens, reduced motion | [variation], [media-data-motion] | an infinite auto-play longer than 5s needs a pause control (2.2.2) |
| Form submit reloads or navigates the frame | [Host and deliver] ("Forms must never submit natively") | `form/will-navigate` at window bubble; flag `preventDefault` called after an `await` (check `defaultPrevented` synchronously); implicit Enter submit in one-field forms |
| Links in framed artifacts | [Host and deliver] (navigation in a sandbox) | `href="#"` and dangling hashes moved to A1 |
| Sandbox capability honesty (alert, confirm, clipboard, downloads) | [Host and deliver] | confirmation in destructive flows moved to D4 |

## Principle evidence (from this basin)

- **The stem needs rewording.** Change "its visual result" to "its outcome: how it looks, what it does, and how it is perceived and operated". Most failures here are absences (no handler, no name, no announcement, no focus move) that a snapshot cannot show.
- **P1 splits in two.** Owning the value is separate from owning the writes (N5). The best owner is often the browser (N1): dialog, popover, details, constraint validation, radios, select, FormData and commandfor all need zero agent code.
- **P2 is refined, not violated, by good wiring.** Distance is acceptable through a named link that the engine verifies, such as commandfor/id or label/control. Containment beats id pairs (C1), and a named command beats a closure (A3).
- **P3 fits this basin best.** Rank hidden defaults that cause navigation, data loss or no-ops highest: button `type=submit`, native form submission, FormData omitting disabled fields and the submitter, `change` firing on blur, value attribute vs property, and `<a>` with no href. Rule: the default is the safe option, or there is no default (a required prop).
- **P4 needs more axes:** input modality (keyboard, touch, screen reader, voice), user preference, and time and order (N7). The time-and-order failures are double submit, stale responses, stacked listeners, use before upgrade, and hydration mismatch.
- **P5 extends to behavioral vocabularies:** `kind`, `consequence`, `focus-after`, politeness, `activation` and action state. The platform already ships closed sets (autocomplete tokens, input types, roles). The closed set applies to structure and semantics; copy stays open.
- **P6 needs a written tie-break** where two native ways exist, decided by meaning: details vs tabs (B5), select vs datalist vs combobox (C4), link vs button (A1).
- **P7 cannot fire on an absence.** Declared intent (N6) is the precondition for detecting a dead control, an unhandled command or a missing focus destination. Prevention comes before detection. Some cases are "hard" (latest-wins races, history hacks for overlays), and there the API shape is the only lever.
- **N2 is P5 applied to interaction contracts.** It also gives diagnostics a clean boundary: author-written ARIA on a managed element is a finding.
- **N3 is the counterpart** of [fundamentals] "same look must mean same behavior".
- **N4 is checkable at runtime** by comparing trees: visual vs DOM order, focusable vs visible, `aria-hidden` vs focusable.

## Highest-precision diagnostics from this section

`a11y/nested-interactive` · `a11y/no-name` · `a11y/anchor-no-href` and `link/noop-hash` · `focus/lost-to-body` · `state/discarded` · `form/will-navigate` · `behavior/unhandled-command` · `event/unknown-name` · `form/radio-group-unnamed` · `aria/composite-multiple-tabstops` · `a11y/tabindex-positive` · `form/disabled-before-read` · `lifecycle/own-property-shadows-accessor` · `list/key-duplicate` · `aria/hidden-focusable`. Medium precision, which must report "unknown" rather than guess: `behavior/dead-control`. Advisory only, because they rely on label heuristics: `action/undeclared-destructive`, `form/number-for-identifier`, `form/missing-autocomplete`.

## Contested

- **Shadow DOM for behavior widgets** ([contrarian]) vs light DOM for every control (B6). See the resolution proposed in B6.
- **Blocking head definition** means `connectedCallback` runs before children are parsed (G1).
- **Hide vs unmount** for wizard steps: both are silently wrong unless the library owns per-step validation (E2).
- **`aria-disabled` as the default disabled state** keeps controls discoverable, but the library must swallow every activation path, including implicit submit, and the control's values are still submitted (D1).
- **Toast auto-dismiss.** Whether WCAG 2.2.1 applies is debated, and persistent toasts add clutter (D5).
- **Trusted Types through a meta CSP** in artifacts vs the host's CSP and third-party libraries (G4).
- **Stretched-link cards** cost text selection inside the card (A4).
- **Dead-control sweep.** It needs framework cooperation, such as Solid's delegated handlers, to avoid false positives (A2).
- **Engine support.** `interestfor`, `base-select`, `CloseWatcher`, `moveBefore`, `setHTML`, the Navigation API and reference target are not universal. Core behavior and diagnostics must work without them.

## Appendix: merged, reduced or corrected raw cases

- **Merged (4):** document boilerplate into B4; Solid keyed list into E1; refs to custom elements into G1; attribute-context injection into G4.
- **Reduced to pointers (17):** dialogs; popovers/menus/tooltips; form control sizing; heading outline; state in semantic attribute; focus order; focus ring; target sizes; async states; Solid 2.0 async boundaries; scrollable regions; tabular data; link affordance; motion tokens; form submit default; links in framed artifacts; sandbox capability honesty. All are owned by the basins named in the pointer table.
- **Dropped as wrong:** none. The six wrong claims were corrected in place: postal-code numeric keyboard (C2), event target typing (C6), FormData submitter (C7), `role=alert` announcement (D5), `content-visibility` treated as hiding (E5), and blocking-script child timing (G1).
