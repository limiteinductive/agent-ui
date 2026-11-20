# Name-guess eval: all

Set: pilot. Models: gpt-5.6, gpt-6.2, haiku, opus, sonnet. Calls: 1030 (0 failed). Probes: 103.

## 1. Element names (behavior described, no docs)

(a) = pure behavior description, (b) = same behavior in a domain context.

"models agree" = how many models' own top (a) guess equals the overall top (a) guess; dissenters listed.

| concept | candidate | hit | top guesses (a) | top guesses (b) | models agree (a) |
|---|---|---|---|---|---|
| vertical | `ui-stack` | 100% | `ui-stack`×10 | `ui-stack`×10 | 5/5 |
| wrap-row | `ui-cluster` | 0% | `ui-row`×8, `ui-flex`×2 | `ui-chip-group`×9, `ui-stack`×1 | 4/5 (gpt-5.6: ui-flex) |
| push-apart | `ui-split` | 0% | `ui-row`×10 | `ui-toolbar`×10 | 5/5 |
| auto-columns | `ui-grid` | 70% | `ui-grid`×10 | `ui-gallery`×6, `ui-grid`×4 | 5/5 |
| side-main | `ui-sidebar` | 20% | `ui-sidebar`×4, `ui-sidebar-layout`×3, `ui-layout`×2, `ui-split`×1 | `ui-layout`×6, `ui-settings-layout`×2, `ui-sidebar-layout`×2 | 2/5 (gpt-5.6: ui-layout; haiku: ui-sidebar-layout; sonnet: ui-sidebar-layout) |
| row-to-column | `ui-switcher` | 10% | `ui-grid`×4, `ui-row`×3, `ui-switcher`×2, `ui-stack`×1 | `ui-grid`×9, `ui-columns`×1 | 2/5 (gpt-6.2: ui-row; haiku: ui-row; opus: ui-switcher) |
| h-scroll | `ui-reel` | 0% | `ui-scroller`×6, `ui-scroll`×2, `ui-row`×1, `ui-scroll-area`×1 | `ui-row`×9, `ui-stack`×1 | 3/5 (gpt-5.6: ui-row; gpt-6.2: ui-scroll-area) |
| max-width | `ui-page` | 0% | `ui-container`×10 | `ui-container`×10 | 5/5 |
| overlap | `ui-layers` | 0% | `ui-stack`×7, `ui-overlay`×3 | `ui-hero`×10 | 4/5 (gpt-6.2: ui-overlay) |
| aspect | `ui-frame` | 0% | `ui-aspect-ratio`×10 | `ui-aspect-ratio`×8, `ui-video-thumbnail`×2 | 5/5 |
| scroll-region | `ui-scroll` | 10% | `ui-scroll-area`×8, `ui-scroll`×2 | `ui-log-viewer`×8, `ui-panel`×2 | 4/5 (gpt-5.6: ui-scroll) |
| app-layout | `ui-shell` | 0% | `ui-layout`×7, `ui-app-shell`×2, `ui-app-layout`×1 | `ui-app-shell`×6, `ui-layout`×2, `ui-app-layout`×2 | 4/5 (opus: ui-app-shell) |
| panel | `ui-surface` | 10% | `ui-panel`×5, `ui-card`×5 | `ui-card`×8, `ui-surface`×2 | 2/5 (gpt-6.2: ui-card; opus: ui-card; sonnet: ui-card) |
| long-text | `ui-prose` | 85% | `ui-prose`×10 | `ui-prose`×7, `ui-markdown`×2, `ui-markdown-content`×1 | 5/5 |
| form-field | `ui-field` | 40% | `ui-field`×8, `ui-form-field`×2 | `ui-input`×8, `ui-text-field`×1, `ui-text-input`×1 | 4/5 (gpt-6.2: ui-form-field) |
| icon | `ui-icon` | 100% | `ui-icon`×10 | `ui-icon`×10 | 5/5 |
| number | `ui-num` | 0% | `ui-number`×4, `ui-format-number`×4, `ui-currency`×2 | `ui-number`×4, `ui-format-number`×4, `ui-percent`×2 | 2/5 (gpt-6.2: ui-format-number; haiku: ui-currency; opus: ui-format-number) |
| relative-time | `ui-time` | 25% | `ui-relative-time`×8, `ui-time`×2 | `ui-date`×7, `ui-time`×3 | 4/5 (gpt-5.6: ui-time) |
| status-label | `ui-badge` | 100% | `ui-badge`×10 | `ui-badge`×10 | 5/5 |
| primary-action | `button` | 0% | `ui-button`×10 | `ui-button`×10 | 5/5 |
| divider | `ui-divider` | 70% | `ui-divider`×8, `ui-separator`×2 | `ui-divider`×6, `ui-menu-divider`×4 | 4/5 (haiku: ui-separator) |
| loading-placeholder | `ui-skeleton` | 100% | `ui-skeleton`×10 | `ui-skeleton`×10 | 5/5 |
| alert | `ui-callout` | 0% | `ui-alert`×9, `ui-message`×1 | `ui-alert`×6, `ui-notice`×4 | 5/5 |

Attributes volunteered on those tags: `wrap`×21, `variant="primary"`×20, `justify="space-between"`×14, `variant="warning"`×14, `ratio="16:9"`×11, `size="small"`×11, `scrollable`×10, `name="search"`×10, `name="trash"`×10, `value="1234567.891"`×10, `currency="USD"`×10, `value="0.4237"`×10, `type="submit"`×10, `columns="3"`×9, `label="Email"`×9, `variant="success"`×9, `fit="cover"`×8, `max-height="300px"`×8, `format="local"`×8, `size="sm"`×8, `gap="md"`×7, `direction="horizontal"`×7, `ratio="16/9"`×7, `hint="We'll never share your email."`×7, `animated`×7

## 2. Attribute names and values (element given)

| probe | candidate | attributes written | element |
|---|---|---|---|
| child-spacing | `gap` | `gap="md"`×8, `gap="medium"`×2 | `ui-stack`×10 |
| child-spacing.row | `gap` | `gap="small"`×5, `gap="sm"`×5 | `ui-cluster`×10 |
| inner-spacing | `pad` | `padding="large"`×6, `padding="lg"`×4 | `ui-surface`×10 |
| corners | `radius` | `rounded`×7, `radius="lg"`×3 | `ui-surface`×10 |
| lifted | `tone` | `elevated`×9, `raised`×1 | `ui-surface`×10 |
| recessed | `tone` | `variant="sunken"`×5, `recessed`×2, `variant="recessed"`×1, `sunken`×1, `inset`×1 | `ui-surface`×10 |
| cross-align | `align` | `align="center"`×10 | `ui-cluster`×10 |
| main-align | `justify` | `justify="end"`×10 | `ui-cluster`×10 |
| grid-min | `min` | `min-item-width="16rem"`×6, `min-width="16rem"`×2, `min-column-width="16rem"`×2 | `ui-grid`×10 |
| switch-at | `at` | `threshold="40rem"`×6, `breakpoint="40rem"`×3, `collapse-at="40rem"`×1 | `ui-switcher`×10 |
| side-width | `side-width` | `sidebar-width="20rem"`×4, `width="20rem"`×3, `side-width="20rem"`×3 | `ui-sidebar`×10 |
| side-end | `side` | `position="right"`×6, `side="right"`×4 | `ui-sidebar`×10 |
| measure | `width` | `width="narrow"`×5, `narrow`×5 | `ui-page`×10 |
| truncate | `truncate` | `truncate`×8, `ellipsis`×1, `truncate="true"`×1 | `ui-text`×10 |
| clamp | `lines` | `max-lines="3"`×4, `lines="3"`×4, `line-clamp="3"`×2 | `ui-text`×8, `ui-description`×2 |
| busy | `busy` | `loading`×10 | `ui-surface`×10 |
| ratio | `ratio` | `ratio="16:9"`×8, `aspect-ratio="16:9"`×1, `ratio="16/9"`×1 | `ui-frame`×10 |
| icon-name | `name` | `name="search"`×9, `icon="search"`×1 | `ui-icon`×10 |
| number-format | `format` | `value="1234567.891"`×10, `currency="USD"`×10, `format="currency"`×8, `locale="en-US"`×1 | `ui-num`×10 |
| tone.neutral | `neutral` | `variant="neutral"`×8, `color="neutral"`×2 | `ui-badge`×10 |
| tone.accent | `accent` | `variant="primary"`×8, `color="primary"`×2 | `ui-badge`×10 |
| tone.success | `success` | `variant="success"`×9, `status="success"`×1 | `ui-badge`×10 |
| tone.warning | `warning` | `variant="warning"`×8, `color="warning"`×2 | `ui-badge`×10 |
| tone.danger | `danger` | `variant="danger"`×9, `color="destructive"`×1 | `ui-badge`×10 |
| tone.info | `info` | `variant="info"`×7, `color="info"`×1, `color="neutral"`×1, `variant="neutral"`×1 | `ui-badge`×10 |
| emphasis.high | `primary` | `variant="primary"`×9, `primary`×1, `prominence="high"`×1, `type="submit"`×1, `prominence="primary"`×1 | `ui-button`×10 |
| emphasis.mid | `secondary` | `variant="secondary"`×10 | `ui-button`×10 |
| emphasis.low | `ghost` | `variant="ghost"`×10 | `ui-button`×10 |

## 3. Scale values (element + attribute given)

| probe | candidate | values |
|---|---|---|
| scale.none | `none` | `0`×8, `none`×2 |
| scale.small | `sm` | `sm`×7, `small`×2, `sm vel`×1 |
| scale.min | `xs` | `xs`×7, `1`×2, `sm`×1 |
| scale.medium | `md` | `md`×6, `medium`×4 |
| scale.large | `lg` | `lg`×8, `xl`×2 |
| scale.max | `xl` | `xl`×10 |
| scale.beyond | `2xl` | `2xl`×5, `xxl`×4, `xxxl`×1 |
| radius.large | `lg` | `lg`×7, `md`×2, `xl`×1 |
| pad.large | `lg` | `lg`×6, `large`×3, `xl`×1 |
| radius.pill | `full` | `full`×9, `9999px`×1 |

## 4. Interpretation of candidate names (multiple choice)

| markup | expected | answers | correct | gpt-5.6 | gpt-6.2 | haiku | opus | sonnet |
|---|---|---|---|---|---|---|---|---|
| `<ui-cluster gap="sm">` | C | `C`×10 | 100% | 100% | 100% | 100% | 100% | 100% |
| `<ui-switcher at="40rem">` | C | `C`×10 | 100% | 100% | 100% | 100% | 100% | 100% |
| `<ui-stack gap="md">` | B | `B`×10 | 100% | 100% | 100% | 100% | 100% | 100% |
| `<ui-reel gap="md">` | B | `B`×10 | 100% | 100% | 100% | 100% | 100% | 100% |
| `<ui-frame ratio="16:9">` | C | `C`×10 | 100% | 100% | 100% | 100% | 100% | 100% |
| `<ui-sidebar side-width="20rem">` | B | `B`×10 | 100% | 100% | 100% | 100% | 100% | 100% |
| `<ui-split>` | C | `C`×10 | 100% | 100% | 100% | 100% | 100% | 100% |
| `<ui-bar>` | B | `B`×10 | 100% | 100% | 100% | 100% | 100% | 100% |
| `<ui-shell>` | B | `B`×10 | 100% | 100% | 100% | 100% | 100% | 100% |
| `<ui-layers>` | B | `B`×10 | 100% | 100% | 100% | 100% | 100% | 100% |
| `<ui-surface tone="raised">…</ui-surface>` | A | `A`×10 | 100% | 100% | 100% | 100% | 100% | 100% |
| `<ui-badge tone="accent">New</ui-badge>` | B | `B`×10 | 100% | 100% | 100% | 100% | 100% | 100% |
| `<ui-grid min="16rem">…</ui-grid>` | C | `C`×10 | 100% | 100% | 100% | 100% | 100% | 100% |
| `<ui-stack gap="4">` | B | `B`×10 | 100% | 100% | 100% | 100% | 100% | 100% |
| `<ui-surface pad="lg">…</ui-surface>` | B | `B`×10 | 100% | 100% | 100% | 100% | 100% | 100% |
| `<ui-scroll>…long list…</ui-scroll>` | A | `A`×10 | 100% | 100% | 100% | 100% | 100% | 100% |

Overall: gpt-5.6 100%, gpt-6.2 100%, haiku 100%, opus 100%, sonnet 100%

## 5. Free-form pages (vocabulary in context)

30 pages, 1930 elements: 1766 `ui-*` (92%), 0 `class` attrs, 0 `style` attrs.

- **ui-* tags:** `ui-table-cell`×215, `ui-heading`×130, `ui-text`×118, `ui-button`×101, `ui-card`×89, `ui-list-item`×86, `ui-link`×76, `ui-option`×64, `ui-icon`×62, `ui-stack`×59, `ui-badge`×53, `ui-table-row`×47, `ui-section`×44, `ui-grid`×36, `ui-switch`×28, `ui-input`×27, `ui-menu-item`×25, `ui-list`×24, `ui-container`×23, `ui-checkbox`×21, `ui-metric`×20, `ui-divider`×19, `ui-select`×17, `ui-table-header`×16, `ui-field`×15, `ui-price`×15, `ui-panel`×13, `ui-logo`×13, `ui-stat-card`×12, `ui-feature-card`×12, `ui-page`×11, `ui-table`×10, `ui-layout`×9, `ui-table-body`×9, `ui-form`×9, `ui-footer`×9, `ui-table-head`×8, `ui-menu`×8, `ui-header`×8, `ui-hero`×8
- **not in catalog (alias candidates):** `ui-table-cell`×215, `ui-heading`×130, `ui-text`×118, `ui-button`×101, `ui-card`×89, `ui-list-item`×86, `ui-link`×76, `ui-option`×64, `ui-table-row`×47, `ui-section`×44, `ui-switch`×28, `ui-input`×27, `ui-menu-item`×25, `ui-list`×24, `ui-container`×23, `ui-checkbox`×21, `ui-metric`×20, `ui-select`×17, `ui-table-header`×16, `ui-price`×15, `ui-panel`×13, `ui-logo`×13, `ui-stat-card`×12, `ui-feature-card`×12, `ui-table`×10, `ui-layout`×9, `ui-table-body`×9, `ui-form`×9, `ui-footer`×9, `ui-table-head`×8, `ui-menu`×8, `ui-header`×8, `ui-hero`×8, `ui-avatar`×8, `ui-stat`×8, `ui-stat-label`×8, `ui-stat-value`×8, `ui-stat-change`×8, `ui-brand`×7, `ui-nav`×7
- **ui-* attribute names:** `name`×181, `value`×155, `href`×146, `variant`×140, `label`×139, `level`×130, `size`×125, `gap`×98, `align`×96, `type`×59, `color`×44, `columns`×43, `tone`×41, `change`×32, `trend`×32, `period`×30, `icon`×27, `checked`×24, `id`×24, `slot`×24, `direction`×22, `comparison`×16, `placeholder`×16, `title`×15, `amount`×15, `currency`×14, `aria-hidden`×12, `required`×12, `accept`×10, `justify`×10
- **ui-* attribute values:** `level="3"`×62, `align="center"`×48, `variant="primary"`×46, `size="lg"`×37, `level="2"`×36, `size="large"`×34, `align="end"`×34, `color="muted"`×32, `gap="md"`×24, `variant="danger"`×23, `variant="secondary"`×21, `columns="3"`×21, `trend="up"`×21, `gap="sm"`×21, `tone="muted"`×20, `gap="lg"`×20, `size="sm"`×20, `type="submit"`×19, `columns="4"`×18, `href="#features"`×18, `level="1"`×17, `icon="check"`×17, `value="all"`×16, `variant="outline"`×15, `level="4"`×15, `align="right"`×14, `href="#pricing"`×14, `direction="horizontal"`×14, `size="small"`×13, `gap="large"`×12, `variant="success"`×12, `gap="small"`×12, `href="/signup"`×12, `aria-hidden="true"`×12, `period="vs last week"`×12, `tone="accent"`×12, `color="primary"`×12, `name="status"`×11, `name="search"`×11, `label="Name"`×10
- **responsive-looking syntax:** `responsive`×1
- **native tags:** `h3`×27, `p`×22, `li`×18, `h2`×12, `td`×12, `main`×9, `th`×8, `a`×8, `form`×7, `h1`×6, `time`×6, `strong`×6, `ul`×6, `tr`×4, `section`×3, `h4`×3, `nav`×2, `table`×1, `thead`×1, `tbody`×1
