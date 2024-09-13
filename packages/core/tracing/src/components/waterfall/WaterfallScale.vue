<template>
  <div
    ref="waterfallScaleRef"
    class="waterfall-scale"
  >
    <div
      v-for="(_, tick) in config.ticks"
      :key="`tick-${tick}`"
      class="waterfall-scale-tick"
    >
      <div class="waterfall-scale-tick-label">
        {{ format(durationShift + tick * tickDuration) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref } from 'vue'
import composables from '../../composables'
import { ProvidedWaterfallConfig, type WaterfallConfig } from './Waterfall.vue'

let resizeObserver: ResizeObserver | undefined // this should not be reactive

const format = composables.useDurationFormatter()

const config = inject<WaterfallConfig>(ProvidedWaterfallConfig)!
const waterfallScaleRef = ref<HTMLElement | null>(null)

const viewportDuration = computed(() => config.totalDurationNano * (1 - config.viewport.left - config.viewport.right))
const tickDuration = computed(() => (viewportDuration.value) / (config.ticks - 1))
const durationShift = computed(() => config.totalDurationNano * config.viewport.left)

onMounted(() => {
  const updateWidth = () => {
    const { x, width } = waterfallScaleRef.value!.getBoundingClientRect()
    const tickWidth = width / (config.ticks * 2)
    config.scaleBounds = {
      x: x + tickWidth,
      width: tickWidth * (config.ticks - 1) * 2,
    }
  }

  resizeObserver = new ResizeObserver(() => {
    updateWidth()
  })

  updateWidth()
  resizeObserver.observe(waterfallScaleRef.value!)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})
</script>

<style lang="scss" scoped>
.waterfall-scale {
  display: grid;
  grid-template-columns: repeat(v-bind("config.ticks * 2"), 1fr);
  position: relative;
  height: 24px;

  .waterfall-scale-tick {
    grid-column: span 2;
    $tick-height: 6px;
    position: relative;
    padding-bottom: $tick-height;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      border-bottom: 1px solid black;
    }

    &:first-child::before {
      left: calc(50% + 0.5px);
      width: calc(50% - 0.5px);
    }

    &:last-child::before {
      width: calc(50% - 0.5px);
    }

    // Ticks
    &::after {
      content: '';
      display: block;
      position: absolute;
      bottom: 0;
      left: calc(50% - 0.5px);
      width: 1px;
      height: $tick-height;
      background-color: black;
    }

    .waterfall-scale-tick-label {
      text-align: center;
      bottom: calc(#{$tick-height} + 3px);
      font-size: $kui-font-size-20;
      line-height: $kui-line-height-20;
    }
  }
}
</style>
