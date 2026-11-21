// agent-ui 0.1.0: React JSX typings. Generated from the manifest; do not edit.

import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import type { UIElementAttributes, UIChildAttributeStrings, UIElements } from './index.js';

type El<T extends keyof UIElementAttributes, E extends HTMLElement> =
  Omit<DetailedHTMLProps<HTMLAttributes<E>, E>, keyof UIElementAttributes[T]> & UIElementAttributes[T];

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'ui-stack': El<'ui-stack', UIElements['ui-stack']>;
      'ui-row': El<'ui-row', UIElements['ui-row']>;
      'ui-grid': El<'ui-grid', UIElements['ui-grid']>;
      'ui-overlay': El<'ui-overlay', UIElements['ui-overlay']>;
      'ui-card': El<'ui-card', UIElements['ui-card']>;
      'ui-button': El<'ui-button', UIElements['ui-button']>;
      'ui-page': El<'ui-page', UIElements['ui-page']>;
      'ui-container': El<'ui-container', UIElements['ui-container']>;
    }
  }
  // grow and bleed go on any child; strings, since React drops true/false on native elements
  interface HTMLAttributes<T> extends UIChildAttributeStrings {}
}
