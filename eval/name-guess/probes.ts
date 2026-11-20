// Probe set for the no-docs name-guess eval (catalog 07 B1).
// tag:       describe behavior in plain words -> which element name do models invent?
// attr:      give the element, describe an option -> which attribute name/value?
// value:     give element + attribute -> which value token?
// interpret: show candidate markup -> do models infer the intended behavior?
// page:      free-form brief -> which vocabulary do models reach for in context?

export type Kind = 'tag' | 'attr' | 'value' | 'interpret' | 'page'

export interface Probe {
  id: string
  kind: Kind
  concept: string
  text: string // task-specific prompt body
  candidate?: string // current catalog candidate (tag, attr name, or value)
  options?: string[] // interpret only
  expected?: string // interpret only: expected letter
  avoid?: string[] // words that must not appear in text (leak check)
  preamble?: 'native' // round 2: the preamble also allows plain HTML elements
}

export const LAYOUT_WORDS = ['stack', 'cluster', 'switcher', 'reel', 'frame', 'sidebar', 'surface', 'prose', 'split', 'shell', 'layers', 'grid', 'gap', 'tone', 'variant']

export function tag(concept: string, candidate: string, a: string, b: string, avoid = LAYOUT_WORDS): Probe[] {
  return [a, b].map((text, i) => ({ id: `tag.${concept}.${'ab'[i]}`, kind: 'tag', concept, text, candidate, avoid }))
}

const TAGS: Probe[] = [
  ...tag('vertical', 'ui-stack',
    'an element that places its children one below another, top to bottom, with an even amount of space between them',
    'a container that holds the sections of a form in a single column, evenly separated from each other'),
  ...tag('wrap-row', 'ui-cluster',
    'an element that places its children side by side in a row and lets them wrap onto the next line when they run out of room',
    'a container for a group of small filter chips that flow left to right and wrap'),
  ...tag('push-apart', 'ui-split',
    'a row that pushes one group of items to the left edge and another group to the right edge (for example a title on the left and actions on the right)',
    'a toolbar row with a logo at the start and a menu button at the end'),
  ...tag('auto-columns', 'ui-grid',
    'a responsive layout of cards where the number of columns adjusts automatically so each card stays at least a certain width',
    'a gallery that fits as many equal-width tiles per row as the available width allows'),
  ...tag('side-main', 'ui-sidebar',
    'a two-part layout with a narrow fixed-width side panel next to a main area that takes the remaining width, and which puts the two one under the other when there is not enough room',
    'a settings screen layout with a navigation column beside the content area'),
  ...tag('row-to-column', 'ui-switcher',
    'a row of equal-width items that changes into a single column, one item under another, when its container becomes narrower than a threshold',
    'three feature panels that sit side by side in wide containers and one under another in narrow containers'),
  ...tag('h-scroll', 'ui-reel',
    'a single row of items that overflows sideways and is scrolled horizontally (like a row of movie posters you swipe through)',
    'a row of product cards that does not wrap and instead scrolls left and right'),
  ...tag('max-width', 'ui-page',
    'a wrapper that limits its content to a comfortable maximum width and centers it horizontally',
    'the main page container that keeps content from stretching too wide on large screens'),
  ...tag('overlap', 'ui-layers',
    'an element that places all of its children on top of each other in the same spot (for example text over an image)',
    'a hero area where a headline is drawn on top of a background picture'),
  ...tag('aspect', 'ui-frame',
    'a box that keeps a fixed width-to-height ratio such as 16:9 and crops the image inside it to fill it',
    'a container for a video thumbnail that must always keep 16 by 9 proportions'),
  ...tag('scroll-region', 'ui-scroll',
    'a region with a maximum height whose content scrolls inside it instead of making the page longer',
    'a log viewer panel that scrolls its own content'),
  ...tag('app-layout', 'ui-shell',
    'the overall application layout with a header across the top, a navigation column on the left, and the main content area',
    'the outermost layout of a web app: top bar, side navigation and a main region'),
  ...tag('panel', 'ui-surface',
    'a visually distinct panel with its own background color that groups related content, and makes the text inside readable on that background',
    'a card-like box that sets the background for a region of the page'),
  ...tag('long-text', 'ui-prose',
    'a wrapper for long-form article content (headings, paragraphs, lists, quotes) that gives it comfortable reading typography and spacing',
    'a container for rendered markdown blog content'),
  ...tag('form-field', 'ui-field',
    'a wrapper that groups a form label, its input, and a help or error message',
    'one labeled text input in a sign-up form, together with its hint text'),
  ...tag('icon', 'ui-icon',
    'an inline icon showing a magnifying glass, for search',
    'a small trash-can symbol placed before the word Delete'),
  ...tag('number', 'ui-num',
    'an element that displays the raw number 1234567.891 formatted for the reader\'s locale as an amount in US dollars',
    'a formatted percentage display for the raw value 0.4237'),
  ...tag('relative-time', 'ui-time',
    'an element that displays a timestamp as relative time, like "3 hours ago"',
    'the "last edited" date of a document, shown in the reader\'s local format'),
  ...tag('status-label', 'ui-badge',
    'a small label that shows the status "Active" in a color that signals success',
    'a compact pill showing the text "Overdue" in a warning color'),
  ...tag('primary-action', 'button',
    'the main call-to-action button of a page, styled as the most prominent action',
    'the "Save changes" button at the bottom of a form, which is the main action'),
  ...tag('divider', 'ui-divider',
    'a horizontal separator line between two sections',
    'a thin rule that visually separates two groups of menu items'),
  ...tag('loading-placeholder', 'ui-skeleton',
    'a placeholder shown while content is loading, with the same shape as the content it stands in for',
    'gray animated blocks that stand in for a list of articles before the data arrives'),
  ...tag('alert', 'ui-callout',
    'a message box inside the page that warns the user about something important',
    'a notice at the top of a form explaining that the form could not be submitted'),
]

export function attr(id: string, concept: string, candidate: string, text: string): Probe {
  return { id: `attr.${id}`, kind: 'attr', concept, candidate, text: `${text}\n\nWrite that opening tag.` }
}

const ATTRS: Probe[] = [
  attr('child-spacing', 'child-spacing', 'gap', 'Take `<ui-stack>`, a vertical list of items. Add the attribute that sets a medium amount of space between its children.'),
  attr('child-spacing.row', 'child-spacing', 'gap', 'Take `<ui-cluster>`, a wrapping row of items. Add the attribute that sets a small amount of space between its children.'),
  attr('inner-spacing', 'inner-spacing', 'pad', 'Take `<ui-surface>`, a panel with its own background. Add the attribute that puts a large amount of space between its edges and its content.'),
  attr('corners', 'corners', 'radius', 'Take `<ui-surface>`, a panel with its own background. Add the attribute that makes its corners noticeably rounded.'),
  attr('lifted', 'surface-level', 'tone', 'Take `<ui-surface>`, a panel with its own background. Add the attribute that makes it look lifted above the page, more prominent than the background around it.'),
  attr('recessed', 'surface-level', 'tone', 'Take `<ui-surface>`, a panel with its own background. Add the attribute that makes it look recessed into the page, less prominent than the background around it.'),
  attr('cross-align', 'cross-align', 'align', 'Take `<ui-cluster>`, a wrapping row of items of different heights. Add the attribute that centers the items vertically within the row.'),
  attr('main-align', 'main-align', 'justify', 'Take `<ui-cluster>`, a wrapping row of items. Add the attribute that moves the items to the end of the row (the right side in left-to-right languages).'),
  attr('grid-min', 'grid-min', 'min', 'Take `<ui-grid>`, a layout whose number of columns adjusts automatically. Add the attribute that makes every item at least 16rem wide.'),
  attr('switch-at', 'switch-at', 'at', 'Take `<ui-switcher>`, a row of items that turns into a column in narrow containers. Add the attribute that sets the container width at which it switches to 40rem.'),
  attr('side-width', 'side-width', 'side-width', 'Take `<ui-sidebar>`, a layout with a side panel next to a main area. Add the attribute that sets the side panel\'s width to 20rem.'),
  attr('side-end', 'side-placement', 'side', 'Take `<ui-sidebar>`, a layout with a side panel next to a main area. Add the attribute that puts the side panel on the right instead of the left.'),
  attr('measure', 'max-width', 'width', 'Take `<ui-page>`, a centered page container. Add the attribute that limits it to a narrow width suited to reading text.'),
  attr('truncate', 'truncate', 'truncate', 'Take a `ui-` element that shows a long file name. Write its opening tag so the name is cut off with an ellipsis if it does not fit on one line.'),
  attr('clamp', 'clamp', 'lines', 'Take a `ui-` element that shows a product description. Write its opening tag so the text shows at most 3 lines and the rest is cut off.'),
  attr('busy', 'busy', 'busy', 'Take `<ui-surface>`, a panel whose data is currently being fetched. Add the attribute that marks it as loading.'),
  attr('ratio', 'ratio', 'ratio', 'Take `<ui-frame>`, a box with a fixed width-to-height ratio. Add the attribute that sets the ratio to 16:9.'),
  attr('icon-name', 'icon-name', 'name', 'Take `<ui-icon>`. Add the attribute that picks a magnifying-glass (search) icon.'),
  attr('number-format', 'number-format', 'format', 'Take `<ui-num>`, which formats a raw number. Write its opening tag to show the raw value 1234567.891 as US dollars.'),
  // semantic color: measures both the attribute name and the value per level
  attr('tone.neutral', 'tone', 'neutral', 'Take `<ui-badge>`, a small status label. Add the attribute and value that give it a plain, neutral color with no particular meaning.'),
  attr('tone.accent', 'tone', 'accent', 'Take `<ui-badge>`, a small status label. Add the attribute and value that give it the brand\'s main highlight color.'),
  attr('tone.success', 'tone', 'success', 'Take `<ui-badge>`, a small status label. Add the attribute and value that color it to signal that something succeeded.'),
  attr('tone.warning', 'tone', 'warning', 'Take `<ui-badge>`, a small status label. Add the attribute and value that color it to signal caution.'),
  attr('tone.danger', 'tone', 'danger', 'Take `<ui-badge>`, a small status label. Add the attribute and value that color it to signal that something failed or is destructive.'),
  attr('tone.info', 'tone', 'info', 'Take `<ui-badge>`, a small status label. Add the attribute and value that color it to signal neutral information.'),
  // action emphasis: measures element (native vs ui-button), attribute name and value
  attr('emphasis.high', 'emphasis', 'primary', 'Write the opening tag for a button, using this library, that is the single most prominent action on the page.'),
  attr('emphasis.mid', 'emphasis', 'secondary', 'Write the opening tag for a button, using this library, that is a normal, less prominent action next to the main one.'),
  attr('emphasis.low', 'emphasis', 'ghost', 'Write the opening tag for a button, using this library, that is the least prominent kind of action, shown with no background or border.'),
]

function scale(level: string, candidate: string, text: string): Probe {
  return { id: `value.scale.${level}`, kind: 'value', concept: 'scale', candidate, text: `Fill in the blank: \`<ui-stack gap="___">\`\nGive the value for ${text}.` }
}

const VALUES: Probe[] = [
  scale('none', 'none', 'no space at all'),
  scale('min', 'xs', 'the smallest non-zero amount of space'),
  scale('small', 'sm', 'a small amount of space'),
  scale('medium', 'md', 'a medium, everyday amount of space'),
  scale('large', 'lg', 'a large amount of space'),
  scale('max', 'xl', 'the largest standard amount of space'),
  scale('beyond', '2xl', 'an amount of space even larger than the largest standard step'),
  { id: 'value.pad.large', kind: 'value', concept: 'scale-transfer', candidate: 'lg', text: 'Fill in the blank: `<ui-surface pad="___">`\nGive the value for a large amount of space between the edges and the content.' },
  { id: 'value.radius.large', kind: 'value', concept: 'scale-transfer', candidate: 'lg', text: 'Fill in the blank: `<ui-surface radius="___">`\nGive the value for noticeably rounded corners.' },
  { id: 'value.radius.pill', kind: 'value', concept: 'scale-transfer', candidate: 'full', text: 'Fill in the blank: `<ui-surface radius="___">`\nGive the value for fully rounded, pill-shaped ends.' },
]

export function interpret(id: string, markup: string, question: string, options: string[], expected: string): Probe {
  const list = options.map((o, i) => `${'ABCDEF'[i]}) ${o}`).join('\n')
  return { id: `interpret.${id}`, kind: 'interpret', concept: id, candidate: markup, options, expected,
    text: `Here is a snippet that uses the library:\n\n${markup}\n\n${question}\n${list}` }
}

export const KIDS = '\n  <div>One</div>\n  <div>Two</div>\n  <div>Three</div>\n'

const INTERPRETS: Probe[] = [
  interpret('ui-stack', `<ui-stack gap="md">${KIDS}</ui-stack>`, 'How are the three children arranged?',
    ['side by side in a row', 'one below another in a column', 'on top of each other in the same spot', 'it depends on the screen width', 'something else'], 'B'),
  interpret('ui-cluster', `<ui-cluster gap="sm">${KIDS}</ui-cluster>`, 'How are the three children arranged?',
    ['one below another in a column', 'in a grid with a fixed number of columns', 'side by side in a row that wraps onto new lines when needed', 'grouped and overlapping each other', 'something else'], 'C'),
  interpret('ui-switcher', `<ui-switcher at="40rem">${KIDS}</ui-switcher>`, 'What is this element?',
    ['a toggle switch control', 'tabs that switch between panels', 'a layout that shows the children in a row, and in a column when its container is narrower than a threshold', 'a carousel that switches between children over time', 'something else'], 'C'),
  interpret('ui-reel', `<ui-reel gap="md">${KIDS}</ui-reel>`, 'What is this element?',
    ['an auto-advancing slideshow', 'a single row of items that scrolls horizontally', 'a video player', 'a vertical list', 'something else'], 'B'),
  interpret('ui-frame', `<ui-frame ratio="16:9">\n  <img src="photo.jpg" alt="">\n</ui-frame>`, 'What is this element?',
    ['an iframe that embeds another page', 'a box with a decorative border around the image', 'a box that keeps a 16:9 shape and crops its content to fill it', 'the outer chrome of the page', 'something else'], 'C'),
  interpret('ui-sidebar', `<ui-sidebar side-width="20rem">\n  <nav>…</nav>\n  <main>…</main>\n</ui-sidebar>`, 'What is this element?',
    ['only the side navigation panel itself', 'a two-part layout: a side panel next to a main area', 'a drawer that slides in over the page', 'a vertical toolbar', 'something else'], 'B'),
  interpret('ui-split', `<ui-split>\n  <h2>Orders</h2>\n  <button>Export</button>\n</ui-split>`, 'What is this element?',
    ['two resizable panes with a draggable divider', 'two equal-width halves', 'a row that pushes the first child to the start and the last child to the end', 'a divider line between the children', 'something else'], 'C'),
  interpret('ui-bar', `<ui-bar>\n  <h2>Orders</h2>\n  <button>Export</button>\n</ui-bar>`, 'What is this element?',
    ['a progress bar', 'a row that pushes the first child to the start and the last child to the end', 'a fixed navigation bar at the top of the screen', 'a bar chart', 'something else'], 'B'),
  interpret('ui-shell', `<ui-shell>\n  <header>…</header>\n  <nav>…</nav>\n  <main>…</main>\n</ui-shell>`, 'What is this element?',
    ['a terminal or command-line widget', 'the overall app layout that places the header, navigation and main area', 'a plain bordered wrapper', 'a loading placeholder', 'something else'], 'B'),
  interpret('ui-layers', `<ui-layers>\n  <img src="hero.jpg" alt="">\n  <h1>Welcome</h1>\n</ui-layers>`, 'How are the image and heading arranged?',
    ['heading below the image', 'heading drawn on top of the image in the same spot', 'side by side', 'in separate tabs', 'something else'], 'B'),
  interpret('surface-raised', `<ui-surface tone="raised">…</ui-surface>`, 'What does tone="raised" most likely do?',
    ['makes the panel look lifted, for example with a shadow or a lighter background', 'colors the panel with the brand color', 'makes the text bold', 'increases the font size', 'something else'], 'A'),
  interpret('tone-accent', `<ui-badge tone="accent">New</ui-badge>`, 'What does tone="accent" most likely do?',
    ['a warning color', 'the brand\'s main highlight color', 'a gray, neutral color', 'an italic style', 'something else'], 'B'),
  interpret('grid-min', `<ui-grid min="16rem">…</ui-grid>`, 'What does min="16rem" most likely control?',
    ['the minimum width of the whole layout', 'the minimum height of each item', 'the minimum width of each item, which decides how many columns fit', 'the minimum number of columns', 'something else'], 'C'),
  interpret('gap-numeric', `<ui-stack gap="4">${KIDS}</ui-stack>`, 'What does gap="4" most likely mean?',
    ['4 pixels', 'step 4 on a spacing scale (for example 16px)', '4rem', 'a gap after every 4 items', 'something else'], 'B'),
  interpret('pad', `<ui-surface pad="lg">…</ui-surface>`, 'What does pad="lg" most likely do?',
    ['adds large space outside the panel, pushing other elements away', 'adds large space between the panel\'s edges and its content', 'makes the panel large', 'something else'], 'B'),
  interpret('ui-scroll', `<ui-scroll>…long list…</ui-scroll>`, 'What is this element?',
    ['a region that scrolls its own content', 'a scroll-to-top button', 'a paper scroll illustration', 'a scroll-triggered animation', 'something else'], 'A'),
]

export function page(id: string, brief: string): Probe {
  return { id: `page.${id}`, kind: 'page', concept: id, text: `Write the HTML for the <body> of: ${brief}\n\nUse the library's elements wherever such a library would reasonably provide one.` }
}

const PAGES: Probe[] = [
  page('dashboard', 'a small analytics dashboard. A top bar with the product name and a user menu button; a row of four metric tiles (label, big number, change versus last week); a panel with a table of recent orders; and a side column with filters.'),
  page('settings', 'a settings page with three sections: Profile (name, email, avatar upload), Notifications (three on/off toggles) and Danger zone (a delete-account button), plus a Save button at the bottom.'),
  page('landing', 'a landing page for a note-taking app: a hero with a headline, a subheading and two buttons; six features with icons; a pricing section with three plans; and a footer.'),
]

export const PROBES: Probe[] = [...TAGS, ...ATTRS, ...VALUES, ...INTERPRETS, ...PAGES]

export const PREAMBLE = `A web page uses a small UI library made of custom HTML elements. Every element in the library is named with the prefix \`ui-\`. Options are set with plain HTML attributes: no CSS classes, no inline styles, no JavaScript. You have never seen this library's documentation. Guess the API you think is most likely, the way you would if you had to write it right now without looking anything up.`

const SUFFIX: Record<Kind, string> = {
  tag: 'Reply with only the opening tag (the element name plus any attributes it needs) and nothing else.',
  attr: 'Reply with only the opening tag and nothing else.',
  value: 'Reply with only the value and nothing else.',
  interpret: 'Reply with only the letter of the best answer.',
  page: 'Reply with only the HTML: no explanation, no <head>, no <script> or <style> elements.',
}

export const NATIVE_NOTE = 'The page can also use ordinary HTML elements, which the library styles automatically.'

export function buildPrompt(p: Probe): string {
  const body = p.kind === 'tag' ? `Write the single opening tag for: ${p.text}.` : p.text
  const pre = p.preamble === 'native' ? `${PREAMBLE} ${NATIVE_NOTE}` : PREAMBLE
  return `${pre}\n\n${body}\n\n${SUFFIX[p.kind]}`
}

export function leakCheck(probes: Probe[] = PROBES): string[] {
  const problems: string[] = []
  for (const p of probes) for (const w of p.avoid ?? []) if (new RegExp(`\\b${w}`, 'i').test(p.text)) problems.push(`${p.id}: contains "${w}"`)
  return problems
}
