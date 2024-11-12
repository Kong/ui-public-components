<template>
  <div
    class="slideout-trigger"
    @click="slideoutVisible = true"
  >
    <div>
      Click to show the slideout
    </div>
  </div>

  <TraceViewerSlideout
    max-width="1220px"
    :span-root="spanRoots[0]"
    :visible="slideoutVisible"
    @close="slideoutVisible = false"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { buildSpanTrees, TraceViewerSlideout } from '../../src'
import spans from '../fixtures/spans-241112.json'

const spanRoots = computed(() => buildSpanTrees(spans))
const slideoutVisible = ref(false)
</script>

<style lang="scss" scoped>
.slideout-trigger {
  position: fixed;
  top: 0;
  left: 0;
  width: 100dvw;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
