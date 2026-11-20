# Name-guess eval: pilot

Models: gpt-5.6. Calls: 206 (0 failed). Probes: 103.

## 1. Element names (behavior described, no docs)

(a) = pure behavior description, (b) = same behavior in a domain context.

| concept | candidate | hit | top guesses (a) | top guesses (b) | per model (top) |
|---|---|---|---|---|---|
| vertical | `ui-stack` | 100% | `ui-stack`×2 | `ui-stack`×2 | gpt-5.6: ui-stack |
| wrap-row | `ui-cluster` | 0% | `ui-flex`×2 | `ui-chip-group`×2 | gpt-5.6: ui-flex |
| push-apart | `ui-split` | 0% | `ui-row`×2 | `ui-toolbar`×2 | gpt-5.6: ui-row |
| auto-columns | `ui-grid` | 50% | `ui-grid`×2 | `ui-gallery`×2 | gpt-5.6: ui-grid |
| side-main | `ui-sidebar` | 0% | `ui-layout`×2 | `ui-settings-layout`×2 | gpt-5.6: ui-layout |
| row-to-column | `ui-switcher` | 0% | `ui-grid`×2 | `ui-grid`×2 | gpt-5.6: ui-grid |
| h-scroll | `ui-reel` | 0% | `ui-row`×1, `ui-scroll`×1 | `ui-row`×2 | gpt-5.6: ui-row |
| max-width | `ui-page` | 0% | `ui-container`×2 | `ui-container`×2 | gpt-5.6: ui-container |
| overlap | `ui-layers` | 0% | `ui-stack`×1, `ui-overlay`×1 | `ui-hero`×2 | gpt-5.6: ui-hero |
| aspect | `ui-frame` | 0% | `ui-aspect-ratio`×2 | `ui-video-thumbnail`×2 | gpt-5.6: ui-aspect-ratio |
| scroll-region | `ui-scroll` | 50% | `ui-scroll`×2 | `ui-log-viewer`×2 | gpt-5.6: ui-scroll |
| app-layout | `ui-shell` | 0% | `ui-layout`×2 | `ui-layout`×2 | gpt-5.6: ui-layout |
| panel | `ui-surface` | 0% | `ui-panel`×2 | `ui-card`×2 | gpt-5.6: ui-panel |
| long-text | `ui-prose` | 50% | `ui-prose`×2 | `ui-markdown`×1, `ui-markdown-content`×1 | gpt-5.6: ui-prose |
| form-field | `ui-field` | 50% | `ui-field`×2 | `ui-input`×2 | gpt-5.6: ui-field |
| icon | `ui-icon` | 100% | `ui-icon`×2 | `ui-icon`×2 | gpt-5.6: ui-icon |
| number | `ui-num` | 0% | `ui-number`×2 | `ui-number`×2 | gpt-5.6: ui-number |
| relative-time | `ui-time` | 50% | `ui-time`×2 | `ui-date`×2 | gpt-5.6: ui-time |
| status-label | `ui-badge` | 100% | `ui-badge`×2 | `ui-badge`×2 | gpt-5.6: ui-badge |
| primary-action | `button` | 0% | `ui-button`×2 | `ui-button`×2 | gpt-5.6: ui-button |
| divider | `ui-divider` | 100% | `ui-divider`×2 | `ui-divider`×2 | gpt-5.6: ui-divider |
| loading-placeholder | `ui-skeleton` | 100% | `ui-skeleton`×2 | `ui-skeleton`×2 | gpt-5.6: ui-skeleton |
| alert | `ui-callout` | 0% | `ui-alert`×2 | `ui-notice`×2 | gpt-5.6: ui-alert |

Attributes volunteered on those tags: `direction="column"`×4, `wrap`×4, `variant="primary"`×4, `responsive="stack"`×3, `max-width="1200px"`×3, `gap="1rem"`×2, `justify="space-between"`×2, `logo`×2, `menu-button`×2, `side-width="240px"`×2, `navigation="sidebar"`×2, `columns="3"`×2, `wrap="nowrap"`×2, `scroll="horizontal"`×2, `ratio="16:9"`×2, `object-fit="cover"`×2, `aspect-ratio="16/9"`×2, `max-height="300px"`×2, `scrollable`×2, `header="top"`×2, `navigation="left"`×2, `topbar`×2, `sidebar`×2, `main`×2, `type="text"`×2

## 2. Attribute names and values (element given)

| probe | candidate | attributes written | element |
|---|---|---|---|
| child-spacing | `gap` | `gap="md"`×2 | `ui-stack`×2 |
| child-spacing.row | `gap` | `gap="small"`×2 | `ui-cluster`×2 |
| inner-spacing | `pad` | `padding="large"`×2 | `ui-surface`×2 |
| corners | `radius` | `rounded`×2 | `ui-surface`×2 |
| lifted | `tone` | `elevated`×1, `raised`×1 | `ui-surface`×2 |
| recessed | `tone` | `recessed`×2 | `ui-surface`×2 |
| cross-align | `align` | `align="center"`×2 | `ui-cluster`×2 |
| main-align | `justify` | `justify="end"`×2 | `ui-cluster`×2 |
| grid-min | `min` | `min-item-width="16rem"`×2 | `ui-grid`×2 |
| switch-at | `at` | `collapse-at="40rem"`×1, `breakpoint="40rem"`×1 | `ui-switcher`×2 |
| side-width | `side-width` | `width="20rem"`×2 | `ui-sidebar`×2 |
| side-end | `side` | `position="right"`×1, `side="right"`×1 | `ui-sidebar`×2 |
| measure | `width` | `width="narrow"`×1, `narrow`×1 | `ui-page`×2 |
| truncate | `truncate` | `ellipsis`×1, `truncate`×1 | `ui-text`×2 |
| clamp | `lines` | `max-lines="3"`×2 | `ui-text`×2 |
| busy | `busy` | `loading`×2 | `ui-surface`×2 |
| ratio | `ratio` | `ratio="16:9"`×2 | `ui-frame`×2 |
| icon-name | `name` | `name="search"`×1, `icon="search"`×1 | `ui-icon`×2 |
| number-format | `format` | `value="1234567.891"`×2, `currency="USD"`×2, `locale="en-US"`×1 | `ui-num`×2 |
| tone.neutral | `neutral` | `color="neutral"`×2 | `ui-badge`×2 |
| tone.accent | `accent` | `color="primary"`×2 | `ui-badge`×2 |
| tone.success | `success` | `status="success"`×1, `variant="success"`×1 | `ui-badge`×2 |
| tone.warning | `warning` | `color="warning"`×2 | `ui-badge`×2 |
| tone.danger | `danger` | `variant="danger"`×1, `color="destructive"`×1 | `ui-badge`×2 |
| tone.info | `info` | `color="info"`×1, `color="neutral"`×1 | `ui-badge`×2 |
| emphasis.high | `primary` | `variant="primary"`×1, `primary`×1 | `ui-button`×2 |
| emphasis.mid | `secondary` | `variant="secondary"`×2 | `ui-button`×2 |
| emphasis.low | `ghost` | `variant="ghost"`×2 | `ui-button`×2 |

## 3. Scale values (element + attribute given)

| probe | candidate | values |
|---|---|---|
| scale.none | `none` | `0`×2 |
| scale.small | `sm` | `sm`×1, `sm vel`×1 |
| scale.min | `xs` | `1`×1, `sm`×1 |
| scale.medium | `md` | `md`×1, `medium`×1 |
| scale.large | `lg` | `xl`×2 |
| scale.max | `xl` | `xl`×2 |
| scale.beyond | `2xl` | `xxxl`×1, `xxl`×1 |
| radius.large | `lg` | `lg`×1, `xl`×1 |
| pad.large | `lg` | `xl`×1, `large`×1 |
| radius.pill | `full` | `full`×2 |

## 4. Interpretation of candidate names (multiple choice)

| markup | expected | answers | correct | gpt-5.6 |
|---|---|---|---|---|
| `<ui-cluster gap="sm">` | C | `C`×2 | 100% | 100% |
| `<ui-switcher at="40rem">` | C | `C`×2 | 100% | 100% |
| `<ui-stack gap="md">` | B | `B`×2 | 100% | 100% |
| `<ui-reel gap="md">` | B | `B`×2 | 100% | 100% |
| `<ui-frame ratio="16:9">` | C | `C`×2 | 100% | 100% |
| `<ui-sidebar side-width="20rem">` | B | `B`×2 | 100% | 100% |
| `<ui-split>` | C | `C`×2 | 100% | 100% |
| `<ui-bar>` | B | `B`×2 | 100% | 100% |
| `<ui-shell>` | B | `B`×2 | 100% | 100% |
| `<ui-layers>` | B | `B`×2 | 100% | 100% |
| `<ui-surface tone="raised">…</ui-surface>` | A | `A`×2 | 100% | 100% |
| `<ui-badge tone="accent">New</ui-badge>` | B | `B`×2 | 100% | 100% |
| `<ui-grid min="16rem">…</ui-grid>` | C | `C`×2 | 100% | 100% |
| `<ui-stack gap="4">` | B | `B`×2 | 100% | 100% |
| `<ui-surface pad="lg">…</ui-surface>` | B | `B`×2 | 100% | 100% |
| `<ui-scroll>…long list…</ui-scroll>` | A | `A`×2 | 100% | 100% |

Overall: gpt-5.6 100%

## 5. Free-form pages (vocabulary in context)

6 pages, 351 elements: 350 `ui-*` (100%), 0 `class` attrs, 0 `style` attrs.

- **ui-* tags:** `ui-table-cell`×50, `ui-text`×28, `ui-heading`×25, `ui-list-item`×20, `ui-button`×18, `ui-card`×18, `ui-option`×16, `ui-badge`×12, `ui-icon`×12, `ui-link`×12, `ui-section`×11, `ui-table-row`×10, `ui-field`×9, `ui-metric`×8, `ui-toggle`×6, `ui-price`×6, `ui-list`×6, `ui-input`×5, `ui-grid`×5, `ui-container`×5, `ui-page`×4, `ui-panel`×4, `ui-select`×4, `ui-checkbox`×4, `ui-logo`×4, `ui-main`×3, `ui-menu-item`×3, `ui-nav`×3, `ui-nav-item`×3, `ui-upload`×2, `ui-topbar`×2, `ui-brand`×2, `ui-menu-button`×2, `ui-layout`×2, `ui-table`×2, `ui-table-body`×2, `ui-form`×2, `ui-header`×2, `ui-actions`×2, `ui-footer`×2
- **not in catalog (alias candidates):** `ui-table-cell`×50, `ui-text`×28, `ui-heading`×25, `ui-list-item`×20, `ui-button`×18, `ui-card`×18, `ui-option`×16, `ui-link`×12, `ui-section`×11, `ui-table-row`×10, `ui-metric`×8, `ui-toggle`×6, `ui-price`×6, `ui-list`×6, `ui-input`×5, `ui-container`×5, `ui-panel`×4, `ui-select`×4, `ui-checkbox`×4, `ui-logo`×4, `ui-main`×3, `ui-menu-item`×3, `ui-nav`×3, `ui-nav-item`×3, `ui-upload`×2, `ui-topbar`×2, `ui-brand`×2, `ui-menu-button`×2, `ui-layout`×2, `ui-table`×2, `ui-table-body`×2, `ui-form`×2, `ui-header`×2, `ui-actions`×2, `ui-footer`×2, `ui-metric-grid`×1, `ui-table-head`×1, `ui-app`×1, `ui-menu`×1, `ui-page-header`×1
- **ui-* attribute names:** `value`×32, `name`×30, `label`×28, `level`×25, `align`×21, `href`×21, `variant`×15, `size`×13, `title`×11, `type`×10, `change`×8, `columns`×7, `amount`×6, `period`×6, `tone`×5, `id`×5, `currency`×5, `change-label`×4, `status`×4, `gap`×4, `change-direction`×4, `comparison`×4, `block`×3, `width`×3, `accept`×2, `checked`×2, `featured`×2, `danger`×1, `primary`×1, `icon`×1
- **ui-* attribute values:** `level="3"`×18, `size="large"`×12, `align="center"`×11, `align="right"`×10, `variant="primary"`×6, `currency="$"`×5, `type="submit"`×4, `change-label="vs last week"`×4, `value="all"`×4, `comparison="vs last week"`×4, `href="#features"`×4, `href="#pricing"`×4, `variant="secondary"`×4, `level="2"`×4, `columns="3"`×4, `period="month"`×4, `value="last-30-days"`×3, `value="last-7-days"`×3, `level="1"`×3, `change-direction="up"`×3, `gap="large"`×3, `name="search"`×3, `href="#signup"`×3, `href="#contact"`×3, `variant="outline"`×3, `width="full"`×3, `title="Profile"`×2, `label="Name"`×2, `name="name"`×2, `type="text"`×2, `label="Email"`×2, `name="email"`×2, `type="email"`×2, `label="Avatar"`×2, `name="avatar"`×2, `accept="image/*"`×2, `title="Notifications"`×2, `name="email-notifications"`×2, `label="Email notifications"`×2, `name="push-notifications"`×2
- **responsive-looking syntax:** —
- **native tags:** `main`×1
