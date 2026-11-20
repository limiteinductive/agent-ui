# Name-guess eval (catalog 07 B1)

Models get no docs and a behavior description. The eval records which `ui-*` names, attributes and values they guess, and whether they read the catalog's candidate names correctly.

```
node run.ts --run <name> --models gpt-6.2,gpt-5.6,opus,sonnet,haiku --samples 2   # resumable
node analyze.ts <name>                                                            # -> results/<name>-report.md
```

There are two probe sets, selected with `--set` (`sets.ts`). `npm run check` runs the leak and duplicate-id checks on both. The Claude runners need a valid `claude` CLI login.

- **`pilot`** (default; `probes.ts`): 103 probes, made up of 46 tag, 28 attribute, 10 value, 16 interpret and 3 page probes.
- **`followup`** (`probes-followup.ts`): 56 probes that check the adopted vocabulary:
  - `ui-row`/`ui-grid` modifiers with the element given
  - the open names: page root, absolute date, overlap, field wrapper, modal
  - 11 elements under a preamble that allows native HTML ("styled automatically")
  - interpretation of the new spellings and the behaviors we chose
  - two pilot pages re-run with native HTML allowed

  Run it with `node run.ts --run followup --set followup …`. The analyzer reads the set from the rows.

## Pilot 2026-11-20: 5 models, 1,030 calls, 0 failed

The five models were GPT-5.6, GPT-6.2 (`gpt-6.2-sol`), Opus, Sonnet and Haiku, each sampled twice. That gives n=10 per paraphrase. The full tables are in `results/all-report.md`.

**Headline: agents understand our names but don't produce them.**

- Interpretation scored **100% for every model on all 16 candidates**: cluster, switcher, reel, split, bar, shell, layers, frame, `tone="raised"`, `pad`, `min`, `gap="4"` and the rest.
- When writing from a description, the Every-Layout names almost never appear: cluster 0%, split 0%, reel 0%, layers 0%, frame 0%, shell 0%, and switcher 10% (Opus only).

### Element names ("agree" = models whose own top guess on the pure description matches the overall top)

**Keep:**

- `ui-stack` 20/20, 5/5 agree
- `ui-grid` 5/5
- `ui-prose` 5/5
- `ui-icon` 5/5
- `ui-badge` 5/5
- `ui-skeleton` 5/5
- `ui-divider` 4/5 (Haiku wrote `ui-separator`)
- `ui-field` 4/5. In a form context, models write `ui-input` instead.

**Decided 2026-11-20:** the renames below are adopted. See [`research/vocabulary.md`](../../research/vocabulary.md), which adds aliases and the exceptions: `ui-page` stays as the page root, and `ui-time`/`ui-date` are not aliased.

**Rename, with all five models agreeing:**

- `ui-page` → **`ui-container`** (20/20)
- `ui-frame` → **`ui-aspect-ratio`** (18/20)
- `ui-callout` → **`ui-alert`** (15/20)
- native `button` → **`ui-button`** (20/20)

**Rename, with a strong lead:**

- `ui-scroll` → **`ui-scroll-area`** (8/10)
- `ui-time` → **`ui-relative-time`** (8/10). In context, models write `ui-date`.
- `ui-num` → **`ui-number`** or `ui-format-number` (tied 8/8)
- `ui-surface` → **`ui-card`** or `ui-panel`. `ui-card` gets 8/10 in context; `ui-surface` gets 2/20.
- `ui-shell` → `ui-layout` (7/10), or `ui-app-shell` in context

**Horizontal layout is the open design question.**

- Isolated probes produce **`ui-row`** for wrapping rows and push-apart rows (18/20). For horizontal scroll, `ui-row` wins in context (9/10); on the pure description Claude writes `ui-scroller`.
- Row-to-column produces `ui-grid` or `ui-row`.
- In full pages, models write **`<ui-stack direction="horizontal">`** (14 times; `ui-row` appears once). They volunteer modifiers instead of choosing primitives: `wrap` (21 times), `justify="space-between"` (14), `scrollable` (10).

The choice is between two models:

- **Row/stack plus modifiers:** `ui-stack direction`, `ui-row wrap|justify|scroll`.
- **Intent primitives:** cluster, split and the rest, with `ui-row` and `direction=` diagnosed from their modifiers.

**Decided 2026-11-20: row/stack plus modifiers.** See [`research/layout-vocabulary.md`](../../research/layout-vocabulary.md).

**Collision:** Opus, Sonnet and Haiku wrote **`<ui-stack>` for "children on top of each other in the same spot"** in 6 of 6 answers. GPT wrote `ui-overlay`. So `ui-stack` cannot also be the overlap primitive, and the overlap one should be `ui-overlay`. The wording "on top of each other" may inflate this result.

### Attributes and values (element given)

- **`padding`** (10/10; `pad` 0)
- **`loading`** (10/10; `busy` 0)
- **`rounded`** boolean (7/10) vs `radius="lg"` (3)
- Surface level is written as a boolean, **`elevated`** (9/10). Recessed is `variant="sunken"` (Claude) or `recessed`.
- **`min-item-width`** (6/10; `min` 0)
- **`threshold`** (6/10; `at` 0)
- **`position="right"`** (6/10) vs `side`
- Sidebar width is split three ways: `sidebar-width`, `width` and `side-width`
- Clamp is `max-lines` or `lines`
- Matched: `gap`, `align="center"`, `justify="end"`, `truncate`, `ratio="16:9"` and icon `name`
- Number format: `value` + `currency="USD"` + `format="currency"`
- **Semantic color:**
  - attribute: **`variant`** (41/60) or `color` (10); **`tone` 0/60**
  - values: `neutral`, **`primary` (10/10, never `accent`)**, `success`, `warning`, `danger`, `info`
  - In pages, Claude does use `tone`/`color="muted"` for secondary text.
- Buttons: `ui-button variant="primary|secondary|ghost"` (29/30)
- Scale:
  - matched `xs`, `sm`, `lg`, `xl` and `full`
  - **"none" is `0`** (8/10)
  - `md` is split with `medium` (6/4)
  - the step beyond xl is **`2xl`** for Claude and `xxl` for GPT, so accept both

### Pages (brief said to use library elements)

- 0 `class`, 0 `style` and essentially no responsive prop syntax; 92% of elements are `ui-*`.
- Grids are written as **`columns="3"|"4"`** (about 39 times), so this is diagnostic #1 (`columns` → `min-item-width`).
- The invented-vocabulary list forms the alias/diagnostic table:
  - top entries: `ui-table-cell`, `ui-heading`, `ui-text`, `ui-button`, `ui-card`, `ui-list-item`, `ui-link`, `ui-option`, `ui-section`, `ui-switch`, `ui-input`, `ui-metric`/`ui-stat-*`
  - full list: `results/all-summary.json` → `pages.invented`

## Round 2 2026-11-20: 5 models, 560 calls, 0 failed

This round ran the `followup` set (n=10 per probe). The full tables are in `results/followup-report.md`, and the spec changes are in [`research/layout-vocabulary.md`](../../research/layout-vocabulary.md) and [`research/vocabulary.md`](../../research/vocabulary.md).

**Modifier spellings, with `ui-row` given:**

- Confirmed:
  - `wrap` 10/10
  - `justify="space-between"` 9/10
  - child `grow` 9/10
  - `limit` 5/10
- Changed:
  - **`scroll`** 7/10 (was `scrollable`)
  - **`stack-below`** 6/10 (was `threshold`, which got 0)
  - new **`equal`** 8/10
- `card-width` 6 vs `item-width` 4. The prompt said "cards", so this is not a reliable signal.

**`columns` is read and written as an exact count:**

- A calendar got `columns="7"` 10/10.
- For `<ui-grid columns="4">` at 360px, 6/10 readers expected 4 columns.
- A cap is written as `max-columns` (5) or as `columns` + `responsive`.
- This contradicts the spec's rule that `columns` is a cap, so a change is proposed.

**Names:**

- `ui-dialog` 9 vs `ui-modal` 8
- `ui-date` 10/10 (date only), `ui-datetime` 5/10 (date + time)
- page root: `ui-page` 4 / `ui-app` 4 / `ui-layout` 2
- `ui-field` 10/10
- Overlap is still `ui-stack` 8/10 without the "on top" wording, so the collision is real.

**Native allowed, invention persists:**

- Told that native HTML is styled, models still wrote:
  - `ui-heading level` 15/20, `ui-text` 18/20, `ui-table` 18/20, `ui-input` 15/20
  - `ui-switch`, `ui-button`, `ui-stat` (`label value change trend`) and `ui-avatar` (`src alt size`) at 80–100%
- `ui-link` and `ui-list` 65%.
- GPT-6.2 was the only model that leaned native.
- Native pages were 54% `ui-*`. Horizontal containers were all `ui-stack direction="horizontal"` (9), and `ui-row` was written 0 times.

**Interpretation:**

- 100% for `scroll` + `item-width`, `stack-below`, `grow`, `ui-card elevated`, `bleed="full"` and `max-lines`.
- `variant="ghost"` 9/10.
- For a 3-child `space-between` row, 8/10 expect the middle child off-center, which is real CSS; writers intend it centered.

**Decided 2026-11-20:** all five round-2 proposals were adopted.

- `columns` is exact, and `max-columns` is the cap.
- `ui-stack direction="horizontal"` is accepted as equal to `ui-row`.
- The overlap primitive is `ui-overlay`.
- Thin wrappers ship for every concept at 80% or more, while `ui-link`/`ui-list` point to native elements.
- The page root and app shell merge into `<ui-page layout="app">`.

### Caveats

- Small n: 2 samples × 2 paraphrases per model.
- Codex and the Claude CLI each add their own agent framing. GPT ran at low reasoning effort.
- The pilot page brief pushes toward `ui-*`, so its native-vs-library ratios aren't meaningful. Round 2 re-ran two pages with native HTML allowed.
- Claude CLI runs sometimes filled example content with the operator's account name. That name is redacted to "Jane Doe" in `results/`.
- Some round-2 attribute prompts leaked a noun ("cards", "panels") that showed up in the answers.
