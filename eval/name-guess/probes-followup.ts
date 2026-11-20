// Round 2 (2026-11-20): checks the adopted vocabulary (research/vocabulary.md, layout-vocabulary.md).
// A. ui-row / ui-grid modifiers with the element given (do the spellings we froze match the guesses?)
// B. element names still open: page root, absolute date, overlap, field wrapper, modal
// C. native allowed: with "plain HTML is styled", do agents still invent ui-heading / ui-text / ...?
// D. interpretation of the new spellings, including the behaviors we chose (columns cap, nowrap, true center)
// E. two pilot pages re-run with the native preamble
import { KIDS, LAYOUT_WORDS, attr, interpret, page, tag, type Probe } from './probes.ts'

const ROW_WORDS = ['wrap', 'scroll', 'justify', 'between', 'grow', 'threshold', 'breakpoint', 'flex', 'overflow', 'stretch',
  'expand', 'fill', 'collapse', 'stack', 'carousel', 'reel', 'limit']
const without = (...ws: string[]) => ROW_WORDS.filter(w => !ws.includes(w))
const ROW = 'Take `<ui-row>`, which places its children side by side on one line.'
const row = (id: string, candidate: string, text: string, avoid = ROW_WORDS): Probe =>
  ({ ...attr(`row.${id}`, `row.${id}`, candidate, `${ROW} ${text}`), avoid })

const MODIFIERS: Probe[] = [
  row('wrap', 'wrap', 'Add the attribute that lets the children continue onto a new line when they run out of room.'),
  row('push-apart', 'justify="space-between"', 'It holds two children, a page title and a group of action buttons. Add the attribute that puts the title at the start edge and the buttons at the end edge, with all of the leftover room in the middle.'),
  row('true-center', 'justify="space-between"', 'It holds three children: a back button, a title and a menu button. Add the attribute that puts the back button at the start edge, the menu button at the end edge, and the title in the exact middle of the row.'),
  row('rail', 'scrollable', 'Add the attribute that keeps every child on that one line and lets the user move sideways through the ones that do not fit, like a row of movie posters you swipe through.'),
  row('threshold', 'threshold', 'It holds three equal panels. Add the attribute that puts the three panels one under another whenever the row\'s container is narrower than 40rem.'),
  row('equal', '—', 'It holds four children. Add the attribute that makes all four children exactly the same width, sharing the row equally.'),
  { ...attr('row.item-width', 'row.item-width', 'item-width', 'Take `<ui-row scrollable>`, a single line of cards that the user swipes through sideways. Add the attribute that makes every card 18rem wide.'), avoid: without('scroll') },
  { ...attr('row.limit', 'row.limit', 'limit', 'Take `<ui-row threshold="40rem">`, a row of panels that turns into a single column when its container is narrower than 40rem. Add the attribute that also turns it into a column whenever it holds more than 4 panels.'), avoid: without('threshold') },
  { ...attr('row.grow', 'row.grow', 'grow', 'Take the `<main>` element in this layout:\n\n<ui-row>\n  <nav>…</nav>\n  <main>…</main>\n</ui-row>\n\nAdd the attribute that makes `<main>` take all of the leftover width of the row, while `<nav>` keeps its own width.'), avoid: ROW_WORDS },
  { ...attr('stack.horizontal', 'stack.horizontal', 'direction="horizontal"', 'Take `<ui-stack>`, which places its children one below another. Add the attribute that makes it place them side by side instead.'), avoid: ['row', 'horizontal', 'direction', 'orientation', 'axis', 'inline'] },
  attr('grid.exact', 'grid.columns', 'columns="7"', 'Take `<ui-grid>`. Write its opening tag for a month calendar that must always show exactly 7 columns, one per weekday, at every width.'),
  attr('grid.cap', 'grid.columns', 'columns="4"', 'Take `<ui-grid>`, a layout of cards. Write its opening tag so that it shows at most 4 cards per row on wide screens, and fewer on narrow screens.'),
]

const NAMES: Probe[] = [
  ...tag('page-root', 'ui-page',
    'the single outermost element placed directly inside <body> that wraps the whole document, sets up its header, main and footer regions, and adds a skip link for keyboard users',
    'the root wrapper of a small marketing website, directly inside <body>, around the site header, the main content and the footer',
    [...LAYOUT_WORDS, 'page', 'layout', 'app', 'container']),
  ...tag('absolute-date', 'ui-time',
    'an element that shows the ISO value 2026-03-03T14:30Z to the reader as "Mar 3, 2026, 2:30 PM", formatted for their locale',
    'the publication day of a blog post, shown in the reader\'s own regional format (for example "3 March 2026")',
    [...LAYOUT_WORDS, 'time', 'date', 'relative', 'ago']),
  ...tag('overlap', 'ui-layers',
    'an element whose children all occupy the very same area, so each later child is painted above the earlier ones (for example a caption placed across a photo)',
    'a video thumbnail with a play button sitting in the middle of the image, inside the image\'s area rather than below it',
    [...LAYOUT_WORDS, 'top', 'over', 'layer', 'hero', 'background']),
  ...tag('field-wrapper', 'ui-field',
    'a wrapper that groups one native <input> with its visible label, a hint and an error message',
    'in a sign-up form, the wrapper around the "Email" label, the email <input> and the hint "We will never share it"',
    [...LAYOUT_WORDS, 'field']),
  ...tag('modal', 'ui-dialog',
    'a box that appears in front of the whole page, dims everything behind it, and must be closed before the user can use the page again',
    'a "Delete this project?" confirmation with Cancel and Delete buttons that blocks the rest of the page until it is answered',
    [...LAYOUT_WORDS, 'dialog', 'modal', 'overlay']),
]

// candidate = the native element where one exists, so the "hit" column reads as the native share
const native = (concept: string, candidate: string, a: string, b: string): Probe[] =>
  tag(`native.${concept}`, candidate, a, b, []).map(p => ({ ...p, preamble: 'native' as const }))

const NATIVE: Probe[] = [
  ...native('heading', 'h2', 'a second-level section heading that reads "Billing"', 'the title "Recent orders" above a list of orders on a dashboard'),
  ...native('muted-text', 'p', 'a short line of de-emphasized, secondary gray text', 'the small "Last updated 3 days ago" note under a card title'),
  ...native('table', 'table', 'a data table listing orders, with columns for number, customer, date and total', 'the list of recent invoices on an admin screen, one row per invoice with amount and status columns'),
  ...native('link', 'a', 'a text link to the account settings screen', 'the "Forgot password?" link under a sign-in form'),
  ...native('list', 'ul', 'a bulleted list of three product features', 'the list of what is included in a pricing plan'),
  ...native('input', 'input', 'a single-line text input for an email address', 'the password box on a sign-in form'),
  ...native('toggle', 'input', 'an on/off toggle switch for a setting', 'the "Email notifications" on/off control on a settings screen'),
  ...native('button', 'button', 'the main call-to-action button of a page, styled as the most prominent action', 'the "Save changes" button at the bottom of a form, which is the main action'),
  ...native('card', 'ui-card', 'a visually distinct panel with its own background that groups related content', 'a box showing one product with its image, name and price'),
  ...native('metric', 'ui-metric', 'a tile that shows one key number with its label and its change versus last period', 'the "Revenue $12,400, up 8%" tile on a dashboard'),
  ...native('avatar', 'img', 'a small round picture of a user', 'the signed-in user\'s picture in the top bar'),
]

const BUTTONS = '\n' + ['Copy', 'Duplicate', 'Move', 'Archive', 'Export', 'Delete'].map(b => `  <ui-button>${b}</ui-button>`).join('\n') + '\n'

const INTERPRETS: Probe[] = [
  interpret('grid-columns-narrow', '<ui-grid columns="4">\n  <ui-card>…</ui-card>\n  <!-- 8 cards in total -->\n</ui-grid>',
    'What most likely happens when the container is only 360px wide?',
    ['still 4 columns, each card very narrow', 'fewer columns, so each card keeps a reasonable width', 'the grid scrolls sideways', 'the cards overflow outside the container', 'something else'], 'B'),
  interpret('row-narrow', `<ui-row gap="sm">${BUTTONS}</ui-row>`,
    'What most likely happens when the container is too narrow for all six buttons?',
    ['the buttons wrap onto a second line', 'they stay on one line, shrinking or overflowing', 'the row scrolls sideways', 'the buttons turn into a single column', 'something else'], 'B'),
  interpret('row-three-center', '<ui-row justify="space-between">\n  <ui-button>← Back to all projects</ui-button>\n  <h1>Settings</h1>\n  <ui-button>⋯</ui-button>\n</ui-row>',
    'Where does the heading most likely end up?',
    ['exactly in the center of the row', 'halfway between the two buttons, which is off-center because the first button is wider', 'right next to the first button', 'something else'], 'A'),
  interpret('row-scrollable', `<ui-row scrollable item-width="md">${KIDS}</ui-row>`, 'What is this element?',
    ['a single line of medium-width items that scrolls sideways', 'a list that scrolls vertically', 'a row of medium-sized items that wraps', 'an auto-advancing slideshow', 'something else'], 'A'),
  interpret('row-threshold', `<ui-row threshold="40rem">${KIDS}</ui-row>`, 'What does threshold="40rem" most likely do?',
    ['shows the children in a row, and in a single column when the container is narrower than 40rem', 'hides the row below 40rem', 'sets the maximum width of the row to 40rem', 'makes each child at least 40rem wide', 'something else'], 'A'),
  interpret('child-grow', '<ui-row>\n  <nav>…</nav>\n  <main grow>…</main>\n</ui-row>', 'What does grow on <main> most likely do?',
    ['main takes all of the leftover width of the row', 'main gets bigger when hovered', 'main animates in when it appears', 'main gets more vertical space', 'something else'], 'A'),
  interpret('card-elevated', '<ui-card elevated>…</ui-card>', 'What does elevated most likely do?',
    ['gives the card a lifted look, for example a shadow', 'puts the card above other content in stacking order (z-index)', 'colors the card with the brand color', 'makes the card larger', 'something else'], 'A'),
  interpret('button-ghost', '<ui-button variant="ghost">Cancel</ui-button>', 'What does variant="ghost" most likely look like?',
    ['text only, with no background and no border', 'faded, like a disabled button', 'an outline with no fill', 'invisible until hovered', 'something else'], 'A'),
  interpret('bleed', '<ui-container>\n  <h1>Trip report</h1>\n  <p>…</p>\n  <img bleed="full" src="lake.jpg" alt="">\n  <p>…</p>\n</ui-container>',
    'What does bleed="full" most likely do?',
    ['the image breaks out of the text column and spans the full width of the viewport', 'the image has no padding and no border', 'the image is cropped to fill a fixed box', 'the image fades into the background at its edges', 'something else'], 'A'),
  interpret('max-lines', '<ui-text max-lines="3">…a long product description…</ui-text>', 'What does max-lines="3" most likely do?',
    ['shows at most 3 lines and cuts the rest off', 'always reserves exactly 3 lines of height', 'allows at most 3 paragraphs', 'something else'], 'A'),
]

const PAGES: Probe[] = [
  page('dashboard', 'a small analytics dashboard. A top bar with the product name and a user menu button; a row of four metric tiles (label, big number, change versus last week); a panel with a table of recent orders; and a side column with filters.'),
  page('settings', 'a settings page with three sections: Profile (name, email, avatar upload), Notifications (three on/off toggles) and Danger zone (a delete-account button), plus a Save button at the bottom.'),
].map(p => ({ ...p, id: `${p.id}.native`, preamble: 'native' as const }))

export const FOLLOWUP: Probe[] = [...MODIFIERS, ...NAMES, ...NATIVE, ...INTERPRETS, ...PAGES]

// adopted vocabulary, for classifying page output as canonical / alias / invented
export const VOCAB = ['ui-stack', 'ui-row', 'ui-grid', 'ui-container', 'ui-aspect-ratio', 'ui-alert', 'ui-button', 'ui-card',
  'ui-scroll-area', 'ui-relative-time', 'ui-number', 'ui-layout', 'ui-divider', 'ui-prose', 'ui-icon', 'ui-badge', 'ui-skeleton',
  'ui-field', 'ui-page', 'ui-time', 'ui-layers', 'ui-theme']
export const ALIASES = ['ui-frame', 'ui-callout', 'ui-panel', 'ui-surface', 'ui-scroll', 'ui-num', 'ui-format-number',
  'ui-shell', 'ui-app-shell', 'ui-separator']
