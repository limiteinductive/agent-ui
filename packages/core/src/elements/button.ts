// <ui-button>: the only element with behavior. Everything else is CSS.
// Form-associated, focusable, keyboard-activatable, and inert while disabled/loading.
import { upgrade } from './reflect.ts';

/** Attributes the library itself adds; snippets and the mutation observer ignore them. */
const sproutedAttrs = new WeakMap<Element, Set<string>>();
export const sprouted = (el: Element, name: string) => !!sproutedAttrs.get(el)?.has(name);
function sprout(el: Element, name: string, value: string) {
  if (el.hasAttribute(name)) return;
  let s = sproutedAttrs.get(el);
  if (!s) sproutedAttrs.set(el, (s = new Set()));
  s.add(name);
  el.setAttribute(name, value);
}

const LOADING = ['loading', 'busy', 'pending'];

export class UIButton extends HTMLElement {
  static formAssociated = true;
  static observedAttributes = ['disabled', ...LOADING];

  #internals: ElementInternals;
  #formDisabled = false;

  constructor() {
    super();
    this.#internals = this.attachInternals();
    this.#internals.role = 'button';
    // capture at target runs before any bubble listener on this element or its ancestors
    this.addEventListener('click', this.#guard, { capture: true });
    this.addEventListener('click', this.#activate);
    this.addEventListener('keydown', this.#keydown);
    this.addEventListener('keyup', this.#keyup);
  }

  connectedCallback() {
    upgrade(this);
    sprout(this, 'tabindex', '0');
    // ElementInternals.role reaches assistive tech, but getByRole in Playwright/testing-library reads only the attribute
    sprout(this, 'role', 'button');
    this.#sync();
  }
  attributeChangedCallback() { this.#sync(); }
  formDisabledCallback(disabled: boolean) { this.#formDisabled = disabled; this.#sync(); }

  get form() { return this.#internals.form; }
  get labels() { return this.#internals.labels; }
  get type() {
    const t = (this.getAttribute('type') ?? '').toLowerCase();
    return t === 'submit' || t === 'reset' ? t : 'button';
  }
  set type(v: string | null | undefined) { if (v == null) this.removeAttribute('type'); else this.setAttribute('type', v); }
  get disabled() { return this.hasAttribute('disabled'); }
  set disabled(v: boolean) { this.toggleAttribute('disabled', !!v); }
  /** "false" is off, as for every non-native flag (Vue and Solid write a false binding that way). */
  get loading() { return LOADING.some((a) => this.hasAttribute(a) && this.getAttribute(a)!.trim().toLowerCase() !== 'false'); }
  set loading(v: boolean) { this.toggleAttribute('loading', !!v); }

  get #inactive() { return this.disabled || this.#formDisabled || this.loading; }

  #sync() {
    this.#internals.ariaDisabled = this.disabled || this.#formDisabled ? 'true' : null;
    this.#internals.ariaBusy = this.loading ? 'true' : null;
  }

  #guard = (e: Event) => {
    if (!this.#inactive) return;
    e.preventDefault();
    e.stopImmediatePropagation();
  };

  #activate = (e: Event) => {
    const type = this.type;
    if (type === 'button') return;
    // let every other click listener run (and maybe preventDefault) first
    setTimeout(() => {
      const form = this.#internals.form;
      if (e.defaultPrevented || !form) return;
      if (type === 'reset') { form.reset(); return; }
      const name = this.getAttribute('name');
      if (name) this.#internals.setFormValue(this.getAttribute('value') ?? '');
      try { form.requestSubmit(); } finally { if (name) this.#internals.setFormValue(null); }
    });
  };

  #keydown = (e: KeyboardEvent) => {
    if (e.target !== this || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'Enter') { e.preventDefault(); this.click(); }
    else if (e.key === ' ') e.preventDefault(); // no page scroll; activates on keyup like native
  };

  #keyup = (e: KeyboardEvent) => {
    if (e.target !== this || e.key !== ' ') return;
    e.preventDefault();
    this.click();
  };
}

/** Define unless something already owns the name. Returns who owns it now. */
export function define(name: string, ctor: CustomElementConstructor): 'defined' | 'ours' | 'foreign' {
  const existing = customElements.get(name);
  if (!existing) { customElements.define(name, ctor); return 'defined'; }
  return existing === ctor ? 'ours' : 'foreign';
}
