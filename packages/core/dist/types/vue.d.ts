// agent-ui 0.1.0: Vue template typings. Generated from the manifest; do not edit.

import type { HTMLAttributes, PublicProps } from 'vue';
import type { UIElementAttributes, UIElements } from './index.js';

type El<T extends keyof UIElementAttributes, E extends HTMLElement> =
  new () => E & { $props: Omit<HTMLAttributes, keyof UIElementAttributes[T]> & UIElementAttributes[T] & PublicProps };

declare module 'vue' {
  interface GlobalComponents {
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
