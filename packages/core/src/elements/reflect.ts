// A property per attribute, mirroring it. Frameworks set properties on custom elements (Solid always, React 19 and
// Vue whenever the name is `in` the element), and the stylesheet only reads attributes.
import { elements, type AttrSpec } from '../manifest.ts';
import { canonValue } from '../vocab.ts';

/** stack-below -> stackBelow (the name Solid, React and Vue use for the property). */
export const camel = (n: string) => n.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

const has = (o: object, k: PropertyKey) => Object.prototype.hasOwnProperty.call(o, k);

/** true -> bare, false / null / undefined -> removed, anything else -> its string. */
function write(el: Element, attr: string, v: unknown) {
  if (v === true) el.setAttribute(attr, '');
  else if (v === false || v == null) el.removeAttribute(attr);
  else el.setAttribute(attr, String(v));
}

/** Flags and toggles read as booleans (all are off by default); everything else as the attribute's text. */
function read(el: Element, attr: string, spec: AttrSpec): string | boolean | null {
  const raw = el.getAttribute(attr);
  if (spec.kind !== 'flag' && spec.kind !== 'toggle') return raw;
  if (raw === null) return false;
  const r = canonValue(spec, attr, raw);
  return r.ok && r.value !== 'off';
}

const reflected = new WeakMap<object, string[]>();

/** Give `ctor` a property for each of `tag`'s attributes, except those the class already defines. */
export function reflect(ctor: CustomElementConstructor, tag: string) {
  const proto = ctor.prototype as object;
  const props: string[] = [];
  for (const [attr, spec] of Object.entries(elements[tag].attrs)) {
    const prop = camel(attr);
    props.push(prop);
    if (has(proto, prop)) continue; // ui-button's disabled, loading, type
    let native: PropertyDescriptor | undefined;
    for (let o: object | null = HTMLElement.prototype; o && !native; o = Object.getPrototypeOf(o)) native = Object.getOwnPropertyDescriptor(o, prop);
    if (native && typeof native.value !== 'function') continue; // a built-in property: leave it alone
    // a built-in method (scroll): reading still gives the method, assigning sets the attribute
    const method = native?.value as unknown;
    Object.defineProperty(proto, prop, {
      configurable: true, enumerable: true,
      get: method ? () => method : function (this: Element) { return read(this, attr, spec); },
      set(this: Element, v: unknown) { write(this, attr, v); },
    });
  }
  reflected.set(proto, props);
}

/** A property set before the element was upgraded (Solid sets them on clones before inserting) hides the accessor: replay it. */
export function upgrade(el: HTMLElement) {
  const rec = el as unknown as Record<string, unknown>;
  for (const p of reflected.get(Object.getPrototypeOf(el)) ?? []) {
    if (!has(el, p)) continue;
    const v = rec[p];
    delete rec[p];
    rec[p] = v;
  }
}
