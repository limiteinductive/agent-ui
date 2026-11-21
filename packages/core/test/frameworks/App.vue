<script setup lang="ts">
import type {} from '@agent-ui/core/vue';
import type { State } from './scene.ts';
defineProps<{ s: State }>();
</script>

<template>
  <ui-container size="md" data-k="container">
    <div :bleed="s.bleed" data-k="bleed">Bleed</div>
    <ui-stack :gap="s.gap" data-k="stack">
      <ui-row :wrap="s.wrap" gap="sm" class="r" data-k="row">
        <span :grow="s.grow" data-k="grow">Alpha</span><span>Beta</span><span>Gamma</span>
      </ui-row>
      <ui-row :stack-below="s.stackBelow" data-k="sb"><div>One</div><div>Two</div></ui-row>
      <ui-grid :columns="s.columns" data-k="grid"><div>1</div><div>2</div><div>3</div><div>4</div></ui-grid>
      <ui-card :elevated="s.elevated" :variant="s.variant" padding="md" data-k="card"><p>Card</p></ui-card>
      <form data-k="form">
        <ui-button :variant="s.variant" type="submit" :disabled="s.disabled" :loading="s.loading" data-k="btn">Save</ui-button>
      </form>
    </ui-stack>
  </ui-container>
</template>
