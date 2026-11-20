# Name-guess eval: gpt

Models: gpt-5.6, gpt-6.2. Calls: 412 (0 failed). Probes: 103.

## 1. Element names (behavior described, no docs)

(a) = pure behavior description, (b) = same behavior in a domain context.

"models agree" = how many models' own top (a) guess equals the overall top (a) guess; dissenters listed.

| concept | candidate | hit | top guesses (a) | top guesses (b) | models agree (a) |
|---|---|---|---|---|---|
| vertical | `ui-stack` | 100% | `ui-stack`×4 | `ui-stack`×4 | 2/2 |
| wrap-row | `ui-cluster` | 0% | `ui-flex`×2, `ui-row`×2 | `ui-chip-group`×3, `ui-stack`×1 | 1/2 (gpt-6.2: ui-row) |
| push-apart | `ui-split` | 0% | `ui-row`×4 | `ui-toolbar`×4 | 2/2 |
| auto-columns | `ui-grid` | 63% | `ui-grid`×4 | `ui-gallery`×3, `ui-grid`×1 | 2/2 |
| side-main | `ui-sidebar` | 25% | `ui-layout`×2, `ui-sidebar`×2 | `ui-settings-layout`×2, `ui-layout`×2 | 1/2 (gpt-6.2: ui-sidebar) |
| row-to-column | `ui-switcher` | 0% | `ui-grid`×2, `ui-row`×1, `ui-stack`×1 | `ui-grid`×4 | 1/2 (gpt-6.2: ui-row) |
| h-scroll | `ui-reel` | 0% | `ui-scroll`×2, `ui-row`×1, `ui-scroll-area`×1 | `ui-row`×4 | 0/2 (gpt-5.6: ui-row; gpt-6.2: ui-scroll-area) |
| max-width | `ui-page` | 0% | `ui-container`×4 | `ui-container`×4 | 2/2 |
| overlap | `ui-layers` | 0% | `ui-overlay`×3, `ui-stack`×1 | `ui-hero`×4 | 1/2 (gpt-5.6: ui-stack) |
| aspect | `ui-frame` | 0% | `ui-aspect-ratio`×4 | `ui-video-thumbnail`×2, `ui-aspect-ratio`×2 | 2/2 |
| scroll-region | `ui-scroll` | 25% | `ui-scroll`×2, `ui-scroll-area`×2 | `ui-log-viewer`×4 | 1/2 (gpt-6.2: ui-scroll-area) |
| app-layout | `ui-shell` | 0% | `ui-layout`×3, `ui-app-layout`×1 | `ui-layout`×2, `ui-app-shell`×2 | 2/2 |
| panel | `ui-surface` | 0% | `ui-panel`×3, `ui-card`×1 | `ui-card`×4 | 1/2 (gpt-6.2: ui-card) |
| long-text | `ui-prose` | 75% | `ui-prose`×4 | `ui-prose`×2, `ui-markdown`×1, `ui-markdown-content`×1 | 2/2 |
| form-field | `ui-field` | 25% | `ui-field`×2, `ui-form-field`×2 | `ui-input`×4 | 1/2 (gpt-6.2: ui-form-field) |
| icon | `ui-icon` | 100% | `ui-icon`×4 | `ui-icon`×4 | 2/2 |
| number | `ui-num` | 0% | `ui-number`×2, `ui-format-number`×2 | `ui-number`×2, `ui-format-number`×2 | 1/2 (gpt-6.2: ui-format-number) |
| relative-time | `ui-time` | 25% | `ui-time`×2, `ui-relative-time`×2 | `ui-date`×4 | 1/2 (gpt-6.2: ui-relative-time) |
| status-label | `ui-badge` | 100% | `ui-badge`×4 | `ui-badge`×4 | 2/2 |
| primary-action | `button` | 0% | `ui-button`×4 | `ui-button`×4 | 2/2 |
| divider | `ui-divider` | 75% | `ui-divider`×4 | `ui-divider`×2, `ui-menu-divider`×2 | 2/2 |
| loading-placeholder | `ui-skeleton` | 100% | `ui-skeleton`×4 | `ui-skeleton`×4 | 2/2 |
| alert | `ui-callout` | 0% | `ui-alert`×4 | `ui-notice`×2, `ui-alert`×2 | 2/2 |

Attributes volunteered on those tags: `wrap`×8, `variant="primary"`×8, `sidebar`×6, `size="small"`×6, `justify="space-between"`×5, `direction="column"`×4, `columns="3"`×4, `ratio="16:9"`×4, `scrollable`×4, `type="text"`×4, `name="search"`×4, `name="trash"`×4, `value="1234567.891"`×4, `currency="USD"`×4, `value="0.4237"`×4, `variant="warning"`×4, `type="submit"`×4, `direction="row"`×3, `side-width="240px"`×3, `responsive="stack"`×3, `equal-width`×3, `responsive`×3, `max-width="1200px"`×3, `format="local"`×3, `variant="success"`×3

## 2. Attribute names and values (element given)

| probe | candidate | attributes written | element |
|---|---|---|---|
| child-spacing | `gap` | `gap="md"`×4 | `ui-stack`×4 |
| child-spacing.row | `gap` | `gap="small"`×2, `gap="sm"`×2 | `ui-cluster`×4 |
| inner-spacing | `pad` | `padding="large"`×4 | `ui-surface`×4 |
| corners | `radius` | `rounded`×4 | `ui-surface`×4 |
| lifted | `tone` | `elevated`×3, `raised`×1 | `ui-surface`×4 |
| recessed | `tone` | `recessed`×2, `variant="sunken"`×1, `variant="recessed"`×1 | `ui-surface`×4 |
| cross-align | `align` | `align="center"`×4 | `ui-cluster`×4 |
| main-align | `justify` | `justify="end"`×4 | `ui-cluster`×4 |
| grid-min | `min` | `min-item-width="16rem"`×4 | `ui-grid`×4 |
| switch-at | `at` | `threshold="40rem"`×2, `collapse-at="40rem"`×1, `breakpoint="40rem"`×1 | `ui-switcher`×4 |
| side-width | `side-width` | `width="20rem"`×3, `sidebar-width="20rem"`×1 | `ui-sidebar`×4 |
| side-end | `side` | `position="right"`×3, `side="right"`×1 | `ui-sidebar`×4 |
| measure | `width` | `width="narrow"`×3, `narrow`×1 | `ui-page`×4 |
| truncate | `truncate` | `truncate`×3, `ellipsis`×1 | `ui-text`×4 |
| clamp | `lines` | `max-lines="3"`×2, `line-clamp="3"`×2 | `ui-text`×4 |
| busy | `busy` | `loading`×4 | `ui-surface`×4 |
| ratio | `ratio` | `ratio="16:9"`×3, `aspect-ratio="16:9"`×1 | `ui-frame`×4 |
| icon-name | `name` | `name="search"`×3, `icon="search"`×1 | `ui-icon`×4 |
| number-format | `format` | `value="1234567.891"`×4, `currency="USD"`×4, `format="currency"`×2, `locale="en-US"`×1 | `ui-num`×4 |
| tone.neutral | `neutral` | `color="neutral"`×2, `variant="neutral"`×2 | `ui-badge`×4 |
| tone.accent | `accent` | `color="primary"`×2, `variant="primary"`×2 | `ui-badge`×4 |
| tone.success | `success` | `variant="success"`×3, `status="success"`×1 | `ui-badge`×4 |
| tone.warning | `warning` | `color="warning"`×2, `variant="warning"`×2 | `ui-badge`×4 |
| tone.danger | `danger` | `variant="danger"`×3, `color="destructive"`×1 | `ui-badge`×4 |
| tone.info | `info` | `variant="info"`×2, `color="info"`×1, `color="neutral"`×1 | `ui-badge`×4 |
| emphasis.high | `primary` | `variant="primary"`×3, `primary`×1 | `ui-button`×4 |
| emphasis.mid | `secondary` | `variant="secondary"`×4 | `ui-button`×4 |
| emphasis.low | `ghost` | `variant="ghost"`×4 | `ui-button`×4 |

## 3. Scale values (element + attribute given)

| probe | candidate | values |
|---|---|---|
| scale.none | `none` | `0`×4 |
| scale.small | `sm` | `sm`×3, `sm vel`×1 |
| scale.min | `xs` | `xs`×2, `1`×1, `sm`×1 |
| scale.medium | `md` | `md`×2, `medium`×2 |
| scale.large | `lg` | `xl`×2, `lg`×2 |
| scale.max | `xl` | `xl`×4 |
| scale.beyond | `2xl` | `xxl`×3, `xxxl`×1 |
| radius.large | `lg` | `lg`×3, `xl`×1 |
| pad.large | `lg` | `lg`×2, `xl`×1, `large`×1 |
| radius.pill | `full` | `full`×4 |

## 4. Interpretation of candidate names (multiple choice)

| markup | expected | answers | correct | gpt-5.6 | gpt-6.2 |
|---|---|---|---|---|---|
| `<ui-cluster gap="sm">` | C | `C`×4 | 100% | 100% | 100% |
| `<ui-switcher at="40rem">` | C | `C`×4 | 100% | 100% | 100% |
| `<ui-stack gap="md">` | B | `B`×4 | 100% | 100% | 100% |
| `<ui-reel gap="md">` | B | `B`×4 | 100% | 100% | 100% |
| `<ui-frame ratio="16:9">` | C | `C`×4 | 100% | 100% | 100% |
| `<ui-sidebar side-width="20rem">` | B | `B`×4 | 100% | 100% | 100% |
| `<ui-split>` | C | `C`×4 | 100% | 100% | 100% |
| `<ui-bar>` | B | `B`×4 | 100% | 100% | 100% |
| `<ui-shell>` | B | `B`×4 | 100% | 100% | 100% |
| `<ui-layers>` | B | `B`×4 | 100% | 100% | 100% |
| `<ui-surface tone="raised">…</ui-surface>` | A | `A`×4 | 100% | 100% | 100% |
| `<ui-badge tone="accent">New</ui-badge>` | B | `B`×4 | 100% | 100% | 100% |
| `<ui-grid min="16rem">…</ui-grid>` | C | `C`×4 | 100% | 100% | 100% |
| `<ui-stack gap="4">` | B | `B`×4 | 100% | 100% | 100% |
| `<ui-surface pad="lg">…</ui-surface>` | B | `B`×4 | 100% | 100% | 100% |
| `<ui-scroll>…long list…</ui-scroll>` | A | `A`×4 | 100% | 100% | 100% |

Overall: gpt-5.6 100%, gpt-6.2 100%

## 5. Free-form pages (vocabulary in context)

12 pages, 655 elements: 511 `ui-*` (78%), 0 `class` attrs, 0 `style` attrs.

- **ui-* tags:** `ui-table-cell`×65, `ui-card`×39, `ui-button`×35, `ui-option`×30, `ui-text`×28, `ui-heading`×25, `ui-icon`×24, `ui-list-item`×20, `ui-badge`×18, `ui-section`×16, `ui-metric`×16, `ui-table-row`×14, `ui-link`×12, `ui-grid`×11, `ui-input`×10, `ui-field`×9, `ui-container`×9, `ui-panel`×8, `ui-select`×8, `ui-menu-item`×7, `ui-toggle`×6, `ui-table-header`×6, `ui-price`×6, `ui-list`×6, `ui-switch`×6, `ui-page`×4, `ui-brand`×4, `ui-layout`×4, `ui-table`×4, `ui-checkbox`×4, `ui-logo`×4, `ui-menu-button`×3, `ui-main`×3, `ui-table-body`×3, `ui-nav`×3, `ui-nav-item`×3, `ui-footer`×3, `ui-stack`×3, `ui-group`×3, `ui-upload`×2
- **not in catalog (alias candidates):** `ui-table-cell`×65, `ui-card`×39, `ui-button`×35, `ui-option`×30, `ui-text`×28, `ui-heading`×25, `ui-list-item`×20, `ui-section`×16, `ui-metric`×16, `ui-table-row`×14, `ui-link`×12, `ui-input`×10, `ui-container`×9, `ui-panel`×8, `ui-select`×8, `ui-menu-item`×7, `ui-toggle`×6, `ui-table-header`×6, `ui-price`×6, `ui-list`×6, `ui-switch`×6, `ui-brand`×4, `ui-layout`×4, `ui-table`×4, `ui-checkbox`×4, `ui-logo`×4, `ui-menu-button`×3, `ui-main`×3, `ui-table-body`×3, `ui-nav`×3, `ui-nav-item`×3, `ui-footer`×3, `ui-group`×3, `ui-upload`×2, `ui-topbar`×2, `ui-table-head`×2, `ui-form`×2, `ui-menu`×2, `ui-header`×2, `ui-actions`×2
- **ui-* attribute names:** `name`×58, `value`×58, `label`×54, `variant`×37, `href`×35, `align`×27, `level`×25, `type`×20, `gap`×18, `change`×16, `columns`×13, `size`×13, `comparison`×12, `aria-hidden`×12, `title`×11, `id`×10, `trend`×8, `amount`×6, `period`×6, `tone`×5, `currency`×5, `accept`×4, `change-label`×4, `status`×4, `change-direction`×4, `checked`×4, `autocomplete`×4, `aria-label`×4, `heading`×4, `block`×3
- **ui-* attribute values:** `level="3"`×18, `variant="primary"`×14, `align="right"`×14, `align="center"`×12, `size="large"`×12, `aria-hidden="true"`×12, `variant="secondary"`×10, `type="submit"`×8, `columns="3"`×8, `comparison="vs. last week"`×8, `value="all"`×6, `href="#features"`×6, `trend="up"`×6, `gap="large"`×5, `name="search"`×5, `currency="$"`×5, `label="Name"`×4, `name="name"`×4, `label="Email"`×4, `name="email"`×4, `type="email"`×4, `label="Avatar"`×4, `name="avatar"`×4, `accept="image/*"`×4, `label="Push notifications"`×4, `type="button"`×4, `columns="4"`×4, `label="Revenue"`×4, `change-label="vs last week"`×4, `label="Orders"`×4, `label="Date range"`×4, `label="Order status"`×4, `name="status"`×4, `value="refunded"`×4, `comparison="vs last week"`×4, `href="#pricing"`×4, `id="features"`×4, `level="2"`×4, `name="folder"`×4, `id="pricing"`×4
- **responsive-looking syntax:** —
- **native tags:** `p`×22, `h3`×18, `li`×18, `td`×12, `h2`×10, `th`×8, `a`×8, `main`×7, `time`×6, `strong`×6, `ul`×6, `h1`×5, `form`×4, `tr`×4, `section`×3, `nav`×2, `table`×1, `thead`×1, `tbody`×1, `aside`×1
