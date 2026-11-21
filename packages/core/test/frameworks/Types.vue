<!-- Type checks only (vue-tsc): what the typings must accept and reject. -->
<script setup lang="ts">
import type {} from '@agent-ui/core/vue';
</script>

<template>
  <ui-row stack-below="40rem" item-width="calc(100% - 2rem)" gap="0" :limit="3" />
  <ui-button @click="(e: MouseEvent) => e" />
  <!-- @vue-expect-error not a gap step -->
  <ui-row gap="huge" />
  <!-- @vue-expect-error columns takes a number -->
  <ui-grid columns="three" />
  <!-- @vue-expect-error flags are booleans -->
  <ui-card elevated="yes" />
</template>
