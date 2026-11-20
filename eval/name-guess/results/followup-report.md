# Name-guess eval: followup

Set: followup. Models: gpt-5.6, gpt-6.2, haiku, opus, sonnet. Calls: 560 (0 failed). Probes: 56.

## 1. Element names (behavior described, no docs)

(a) = pure behavior description, (b) = same behavior in a domain context.

"models agree" = how many models' own top (a) guess equals the overall top (a) guess; dissenters listed.

| concept | candidate | hit | top guesses (a) | top guesses (b) | models agree (a) |
|---|---|---|---|---|---|
| page-root | `ui-page` | 40% | `ui-app`×4, `ui-page`×4, `ui-layout`×2 | `ui-app`×4, `ui-page`×4, `ui-layout`×2 | 2/5 (gpt-5.6: ui-page; gpt-6.2: ui-page; haiku: ui-layout) |
| absolute-date | `ui-time` | 10% | `ui-datetime`×5, `ui-time`×2, `ui-format-date`×2, `ui-date-time`×1 | `ui-date`×10 | 2/5 (gpt-5.6: ui-date-time; gpt-6.2: ui-format-date; haiku: ui-time) |
| overlap | `ui-layers` | 0% | `ui-stack`×8, `ui-overlay`×2 | `ui-video-thumbnail`×8, `ui-thumbnail`×2 | 4/5 (gpt-6.2: ui-overlay) |
| field-wrapper | `ui-field` | 100% | `ui-field`×10 | `ui-field`×10 | 5/5 |
| modal | `ui-dialog` | 45% | `ui-modal`×8, `ui-dialog`×2 | `ui-dialog`×7, `ui-confirm-dialog`×1, `ui-confirm`×1, `ui-confirmation`×1 | 4/5 (opus: ui-dialog) |

Attributes volunteered on those tags: `open`×16, `label="Email"`×12, `modal`×12, `hint="We will never share it"`×8, `format="long"`×7, `skip-link`×6, `value="2026-03-03T14:30Z"`×6, `play-button="center"`×6, `datetime="2026-03-03"`×5, `date-style="medium"`×4, `time-style="short"`×4, `value="2026-03-03"`×4, `hint="We'll never share your email."`×4, `cancel-label="Cancel"`×4, `confirm-label="Delete"`×4, `format="medium"`×3, `src="thumbnail.jpg"`×3, `error="Please enter a valid email address."`×3, `title="Delete this project?"`×3, `message="Delete this project?"`×3, `skip-link="#main"`×2, `header`×2, `main`×2, `footer`×2, `datetime="2026-03-03T14:30Z"`×2

## 1b. Native allowed ("ordinary HTML elements are styled automatically")

| concept | expected | native share | top elements (a) | top elements (b) | top full tags | models writing ui-* |
|---|---|---|---|---|---|---|
| heading | `h2` | 20% | `ui-heading`×8, `h2`×2 | `ui-heading`×7, `h2`×2, `ui-card`×1 | `<ui-heading level="2">`×15, `<h2>`×4, `<ui-card title="Recent orders">`×1 | `opus`×4, `sonnet`×4, `haiku`×4, `gpt-5.6`×4 |
| muted-text | `p` | 10% | `ui-text`×10 | `ui-text`×8, `small`×2 | `<ui-text muted>`×6, `<ui-text variant="muted">`×4, `<ui-text size="small" color="muted">`×2 | `opus`×4, `sonnet`×4, `haiku`×4, `gpt-5.6`×4, `gpt-6.2`×2 |
| table | `table` | 5% | `ui-table`×8, `ui-data-table`×1, `table`×1 | `ui-table`×10 | `<ui-table columns="number,customer,date,total">`×6, `<ui-table>`×4, `<ui-table striped>`×2 | `opus`×4, `sonnet`×4, `haiku`×4, `gpt-5.6`×4, `gpt-6.2`×3 |
| link | `a` | 35% | `a`×5, `ui-link`×5 | `ui-link`×8, `a`×2 | `<ui-link href="/forgot-password">`×6, `<ui-link href="/account/settings">`×5, `<a href="/settings/account">`×3 | `sonnet`×4, `gpt-5.6`×4, `haiku`×3, `opus`×2 |
| list | `ul` | 35% | `ul`×5, `ui-list`×5 | `ui-feature-list`×3, `ui-plan-features`×3, `ui-pricing-features`×2 | `<ul>`×7, `<ui-list type="bullet">`×4, `<ui-feature-list>`×3 | `sonnet`×4, `gpt-5.6`×4, `haiku`×3, `opus`×2 |
| input | `input` | 20% | `ui-input`×8, `input`×2 | `ui-input`×7, `input`×2, `ui-password-input`×1 | `<ui-input type="email">`×4, `<ui-input type="email" name="email" placeholder="Email address">`×2, `<ui-input type="password" name="password" label="Password" autocomplete="current-password" required>`×2 | `opus`×4, `sonnet`×4, `haiku`×4, `gpt-5.6`×4 |
| toggle | `input` | 0% | `ui-switch`×8, `ui-toggle`×2 | `ui-switch`×10 | `<ui-switch name="setting" checked>`×5, `<ui-switch name="email-notifications" label="Email notifications">`×4, `<ui-switch label="Email notifications">`×4 | `opus`×4, `sonnet`×4, `haiku`×4, `gpt-6.2`×4, `gpt-5.6`×4 |
| button | `button` | 0% | `ui-button`×10 | `ui-button`×10 | `<ui-button variant="primary">`×9, `<ui-button type="submit" variant="primary">`×7, `<ui-button variant="primary" type="submit">`×3 | `opus`×4, `sonnet`×4, `haiku`×4, `gpt-6.2`×4, `gpt-5.6`×4 |
| card | `ui-card` | 0% | `ui-card`×6, `ui-panel`×4 | `ui-card`×6, `ui-product-card`×2, `ui-product`×2 | `<ui-card>`×12, `<ui-panel>`×3, `<ui-product-card image name price>`×2 | `sonnet`×4, `opus`×4, `haiku`×4, `gpt-6.2`×4, `gpt-5.6`×4 |
| metric | `ui-metric` | 0% | `ui-stat`×9, `ui-stat-tile`×1 | `ui-stat`×7, `ui-tile`×2, `ui-stat-card`×1 | `<ui-stat label="Revenue" value="$48,200" change="+12%" trend="up">`×4, `<ui-stat label="Revenue" value="$12,400" change="+8%" trend="up">`×2, `<ui-tile label="Revenue" value="$12,400" change="8%" trend="up">`×2 | `opus`×4, `sonnet`×4, `haiku`×4, `gpt-6.2`×4, `gpt-5.6`×4 |
| avatar | `img` | 0% | `ui-avatar`×10 | `ui-avatar`×10 | `<ui-avatar src="user.jpg" alt="User" size="small">`×2, `<ui-avatar src="user.jpg" alt="User" size="sm" shape="circle">`×2, `<ui-avatar src="user.jpg" alt="Profile picture" size="md">`×2 | `opus`×4, `sonnet`×4, `haiku`×4, `gpt-6.2`×4, `gpt-5.6`×4 |

## 2. Attribute names and values (element given)

| probe | candidate | attributes written | element |
|---|---|---|---|
| row.true-center | `justify="space-between"` | `justify="space-between"`×9, `balanced`×1 | `ui-row`×10 |
| row.push-apart | `justify="space-between"` | `justify="space-between"`×9, `justify="between"`×1 | `ui-row`×10 |
| row.wrap | `wrap` | `wrap`×10 | `ui-row`×10 |
| row.rail | `scrollable` | `scroll`×7, `scrollable`×3 | `ui-row`×10 |
| row.threshold | `threshold` | `stack-below="40rem"`×6, `wrap-below="40rem"`×1, `collapse="40rem"`×1, `collapse-at="40rem"`×1, `stack-at="40rem"`×1 | `ui-row`×10 |
| row.equal | `—` | `equal`×8, `equal-width`×2 | `ui-row`×10 |
| row.item-width | `item-width` | `scrollable`×10, `card-width="18rem"`×6, `item-width="18rem"`×4 | `ui-row`×10 |
| row.limit | `limit` | `threshold="40rem"`×10, `limit="4"`×5, `max-items="4"`×3, `max-panels="4"`×2 | `ui-row`×10 |
| row.grow | `grow` | `grow`×9, `ui-grow`×1 | `main`×10 |
| stack.horizontal | `direction="horizontal"` | `direction="horizontal"`×5, `horizontal`×4, `direction="row"`×1 | `ui-stack`×10 |
| grid.exact | `columns="7"` | `columns="7"`×10, `fixed`×1 | `ui-grid`×10 |
| grid.cap | `columns="4"` | `max-columns="4"`×5, `columns="4"`×5, `responsive`×4, `min-card-width="16rem"`×1, `columns-sm="2"`×1 | `ui-grid`×10 |

## 3. Scale values (element + attribute given)

| probe | candidate | values |
|---|---|---|

## 4. Interpretation of candidate names (multiple choice)

| markup | expected | answers | correct | gpt-5.6 | gpt-6.2 | haiku | opus | sonnet |
|---|---|---|---|---|---|---|---|---|
| `<ui-grid columns="4">` | B | `A`×6, `B`×2, `E`×2<br>wrong: A=still 4 columns, each card very narrow ×6; E=something else ×2 | 20% | 0% | 0% | 0% | 0% | 100% |
| `<ui-row gap="sm">` | B | `B`×7, `A`×2, `E`×1<br>wrong: A=the buttons wrap onto a second line ×2; E=something else ×1 | 70% | 0% | 100% | 50% | 100% | 100% |
| `<ui-row justify="space-between">` | A | `B`×8, `A`×2<br>wrong: B=halfway between the two buttons, which is off-center because the first button is wider ×8 | 20% | 100% | 0% | 0% | 0% | 0% |
| `<ui-row scrollable item-width="md">` | A | `A`×10 | 100% | 100% | 100% | 100% | 100% | 100% |
| `<ui-row threshold="40rem">` | A | `A`×10 | 100% | 100% | 100% | 100% | 100% | 100% |
| `<ui-row>` | A | `A`×10 | 100% | 100% | 100% | 100% | 100% | 100% |
| `<ui-card elevated>…</ui-card>` | A | `A`×10 | 100% | 100% | 100% | 100% | 100% | 100% |
| `<ui-button variant="ghost">Cancel</ui-button>` | A | `A`×9, `C`×1<br>wrong: C=an outline with no fill ×1 | 90% | 50% | 100% | 100% | 100% | 100% |
| `<ui-container>` | A | `A`×10 | 100% | 100% | 100% | 100% | 100% | 100% |
| `<ui-text max-lines="3">…a long product description…</ui-text>` | A | `A`×10 | 100% | 100% | 100% | 100% | 100% | 100% |

Overall: gpt-5.6 75%, gpt-6.2 80%, haiku 75%, opus 80%, sonnet 90%

## 5. Free-form pages (vocabulary in context)

20 pages, 1092 elements: 592 `ui-*` (54%), 0 `class` attrs, 0 `style` attrs.

- **ui-* tags:** `ui-badge`×57, `ui-button`×50, `ui-card`×39, `ui-field`×38, `ui-stack`×30, `ui-input`×26, `ui-heading`×25, `ui-stat`×24, `ui-switch`×23, `ui-checkbox`×23, `ui-menu-item`×22, `ui-text`×17, `ui-select`×17, `ui-section`×13, `ui-grid`×12, `ui-card-header`×10, `ui-option`×10, `ui-toggle`×9, `ui-panel`×9, `ui-avatar`×8, `ui-layout`×8, `ui-metric`×8, `ui-file-upload`×7, `ui-spacer`×7, `ui-menu`×7, `ui-container`×6, `ui-divider`×6, `ui-card-body`×6, `ui-topbar`×6, `ui-brand`×6, `ui-table`×6, `ui-header`×5, `ui-page`×4, `ui-dropdown`×4, `ui-sidebar`×4, `ui-form`×4, `ui-label`×4, `ui-value`×4, `ui-change`×4, `ui-checkbox-group`×3
- **not in catalog (alias candidates):** `ui-input`×26, `ui-heading`×25, `ui-stat`×24, `ui-switch`×23, `ui-checkbox`×23, `ui-menu-item`×22, `ui-text`×17, `ui-select`×17, `ui-section`×13, `ui-card-header`×10, `ui-option`×10, `ui-toggle`×9, `ui-avatar`×8, `ui-metric`×8, `ui-file-upload`×7, `ui-spacer`×7, `ui-menu`×7, `ui-card-body`×6, `ui-topbar`×6, `ui-brand`×6, `ui-table`×6, `ui-header`×5, `ui-dropdown`×4, `ui-sidebar`×4, `ui-form`×4, `ui-label`×4, `ui-value`×4, `ui-change`×4, `ui-checkbox-group`×3, `ui-app`×3, `ui-menu-divider`×2, `ui-pagination`×2, `ui-main`×2, `ui-fieldset`×2, `ui-menu-button`×1, `ui-stat-grid`×1, `ui-card-actions`×1, `ui-multi-select`×1, `ui-avatar-upload`×1, `ui-upload`×1
- **known aliases written:** `ui-panel`×9, `ui-shell`×1
- **ui-* attribute names:** `label`×108, `name`×107, `variant`×104, `value`×67, `type`×58, `gap`×39, `slot`×35, `level`×25, `checked`×25, `change`×24, `trend`×24, `tone`×20, `size`×18, `direction`×17, `placeholder`×17, `required`×16, `columns`×16, `title`×10, `accept`×8, `period`×8, `autocomplete`×6, `justify`×5, `href`×5, `align`×4, `weight`×4, `change-period`×4, `format`×4, `heading`×4, `comparison`×4, `hint`×3
- **ui-* attribute values:** `variant="danger"`×24, `type="submit"`×21, `variant="success"`×21, `variant="primary"`×20, `name="status"`×19, `trend="up"`×16, `level="2"`×15, `gap="md"`×14, `variant="ghost"`×13, `gap="medium"`×12, `tone="success"`×12, `variant="muted"`×11, `label="Name"`×10, `label="Email"`×10, `columns="4"`×10, `slot="header"`×9, `type="text"`×9, `name="name"`×9, `type="email"`×9, `name="email"`×9, `name="avatar"`×9, `direction="horizontal"`×9, `label="Date range"`×9, `label="Avatar"`×8, `slot="change"`×8, `period="vs last week"`×8, `trend="down"`×8, `accept="image/*"`×7, `label="Email notifications"`×7, `label="Push notifications"`×7, `type="button"`×7, `name="range"`×7, `value="paid"`×7, `value="pending"`×7, `value="refunded"`×7, `label="Revenue"`×7, `label="Orders"`×7, `gap="lg"`×6, `slot="trigger"`×6, `variant="warning"`×6
- **responsive-looking syntax:** —
- **native tags:** `td`×219, `th`×56, `tr`×55, `option`×55, `h2`×21, `form`×14, `table`×10, `thead`×10, `tbody`×10, `main`×8, `h1`×6, `section`×6, `time`×6, `aside`×5, `p`×4, `label`×4, `input`×3, `a`×3, `select`×3, `strong`×2
