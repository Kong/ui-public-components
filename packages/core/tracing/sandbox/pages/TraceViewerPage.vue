<template>
  <div class="trace-viewer-wrapper">
    <TraceViewer
      v-for="(root, i) in spanRoots"
      :key="i"
      :span-root="root"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { buildSpanTrees, TraceViewer } from '../../src'
import spanWithExceptions from '../fixtures/spans-alt-with-exceptions.json'

const spanRoots = computed(() => buildSpanTrees(spanWithExceptions))
</script>

<style lang="scss" scoped>
.trace-viewer-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100dvw;
  height: 100dvh;
}
</style>
