<template>
  <div
    ref="waterfallScaleRef"
    class="waterfall-scale"
  >
    <div
      v-for="(_, tick) in config.ticks - 1"
      :key="`tick-${tick}`"
      class="scale-segment"
    >
      <div class="scale-tick-label">
        {{ format(durationShift + tick * tickDuration) }}
      </div>
      <div
        v-if="tick === config.ticks - 2"
        class="scale-tick-label"
      >
        {{ format(durationShift + (tick + 1) * tickDuration) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import composables from '../../composables'
import {
  ProvidedWaterfallConfig,
  type WaterfallConfig,
} from './WaterfallView.vue'

const format = composables.useDurationFormatter()

const config = inject<WaterfallConfig>(ProvidedWaterfallConfig)!
const waterfallScaleRef = ref<HTMLElement | null>(null)

const viewportDuration = computed(() => config.totalDurationNano * (1 - config.viewport.left - config.viewport.right))
const tickDuration = computed(() => viewportDuration.value / (config.ticks - 1))
const durationShift = computed(() => config.totalDurationNano * config.viewport.left)
</script>

<style lang="scss" scoped>
.waterfall-scale {
  display: grid;
  grid-template-columns: v-bind("`repeat(${(config.ticks - 1)}, 1fr)`");
  position: relative;
  height: 24px;

  .scale-segment {
    $tick-height: 6px;
    position: relative;
    padding-bottom: 0;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    align-items: flex-end;
    justify-content: center;
    border-bottom: 1px solid black;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      bottom: 0;
      height: $tick-height;
      border-left: 1px solid black;
    }

    &:last-child {
      &::after {
        content: "";
        position: absolute;
        right: 0;
        bottom: 0;
        height: $tick-height;
        border-left: 1px solid black;
      }
    }

    .scale-tick-label {
      position: absolute;
      font-family: $kui-font-family-code;
      font-size: $kui-font-size-10;
      line-height: $kui-line-height-20;
      bottom: $tick-height;

      &:nth-child(1) {
        left: 0;
      }

      &:nth-child(2) {
        right: 0;
      }
    }

    &:not(:first-child) {
      .scale-tick-label:nth-child(1) {
        transform: translateX(-50%);
      }
    }
  }
}
</style>
