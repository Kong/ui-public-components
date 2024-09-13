<template>
  <pre>
viewport = {{ config.viewport }}
zoom = {{ config.zoom }}
  </pre>

  <div class="waterfall">
    <div class="waterfall-header">
      <div class="waterfall-actions">
        <KButton
          appearance="tertiary"
          icon
          size="small"
        >
          <AddIcon />
        </KButton>
        <KButton
          appearance="tertiary"
          icon
          size="small"
        >
          <RemoveIcon />
        </KButton>
      </div>

      <div class="waterfall-scale">
        <WaterfallScale v-if="config" />
      </div>
    </div>

    <div class="waterfall-minimap">
      <div class="minimap-label">
        Minimap
      </div>
      <div class="minimap-wrapper">
        <div
          class="minimap"
          :style="viewportVars"
        />
      </div>
    </div>

    <div
      ref="waterfallRowsRef"
      class="waterfall-rows"
      @wheel.prevent
    >
      <WaterfallSpanRow
        v-if="spanRoots && spanRoots.length > 0"
        :span-node="spanRoots[0]"
      />
    </div>
  </div>
</template>

<script lang="ts">
export interface WaterfallConfig {
  ticks: number
  totalDurationNano: number
  startTimeUnixNano: number
  zoom: number
  /**
   * Horizontal shift of the viewport in pixels.
   * Left is negative, right is positive.
   */
  viewportShift: number

  scaleBounds: {
    x: number
    width: number
  }

  viewport: {
    left: number
    right: number
  }
}

export const ProvidedWaterfallConfig = Symbol('ProvidedWaterfallConfig')
</script>

<script setup lang="ts">
import { AddIcon, RemoveIcon } from '@kong/icons'
import { useWheel } from '@vueuse/gesture'
import type { SpanTreeNode } from 'src/types'
import { computed, provide, reactive, ref, toRaw, watchEffect, type PropType } from 'vue'
import spans from '../../spans.json'
import { buildSpanTrees } from '../../utils'
import WaterfallScale from './WaterfallScale.vue'
import WaterfallSpanRow from './WaterfallSpanRow.vue'

const props = defineProps({
  ticks: {
    type: Number,
    default: 10,
    validator: (value: number) => value > 1 && Number.isInteger(value),
  },
  spanRoots: {
    type: Object as PropType<SpanTreeNode[]>,
    default: () => buildSpanTrees(spans),
  },
})

const config = reactive<WaterfallConfig>({
  ticks: props.ticks,
  totalDurationNano: Math.max(...props.spanRoots.map(root => root.durationNano)),
  startTimeUnixNano: Math.min(...props.spanRoots.map(root => root.startTimeUnixNano)),
  zoom: 1,
  viewportShift: 0,
  scaleBounds: { x: 0, width: 0 },
  viewport: { left: 0, right: 0 },
})

provide<WaterfallConfig>(ProvidedWaterfallConfig, config)

const waterfallRowsRef = ref<HTMLElement | null>(null)
const minViewportShift = computed(() => -(config.scaleBounds.width * config.zoom) + config.scaleBounds.width)

useWheel((e) => {
  if (Math.abs(e.delta[0]) > Math.abs(e.delta[1])) {
    const nextViewportShift = config.viewportShift - e.delta[0]
    // config.viewportShift = Math.max(minViewportShift.value, Math.min(0, nextViewportShift))
    const viewportShift = e.delta[0] / config.zoom / config.scaleBounds.width
    config.viewport.left += viewportShift
    config.viewport.right -= viewportShift
    if (config.viewport.left < 0) {
      config.viewport.right += config.viewport.left
      config.viewport.left = 0
    } else if (config.viewport.right < 0) {
      config.viewport.left += config.viewport.right
      config.viewport.right = 0
    }
  } else if (config.scaleBounds.x <= e.event.x && e.event.x <= config.scaleBounds.x + config.scaleBounds.width) {
    const nextZoom = Math.max(1, config.zoom - e.delta[1] / (waterfallRowsRef.value?.offsetWidth ?? 1) * 4)
    const zoomDelta = nextZoom - config.zoom
    const viewportWidth = 1 - config.viewport.left - config.viewport.right
    const nextViewportWidth = 1 / nextZoom
    const viewportWidthDelta = nextViewportWidth - viewportWidth
    const viewportOrigin = config.viewport.left + viewportWidth / 2

    const zoomOrigin = (e.event.x - config.scaleBounds.x) / config.scaleBounds.width

    config.viewport.left = config.viewport.left - viewportWidthDelta * zoomOrigin
    config.viewport.right = config.viewport.right - viewportWidthDelta * (1 - zoomOrigin)

    if (config.viewport.left < 0 && config.viewport.right < 0) {
      config.viewport.left = 0
      config.viewport.right = 0
    } else if (config.viewport.left < 0) {
      config.viewport.right += config.viewport.left
      config.viewport.left = 0
      if (config.viewport.right < 0) {
        config.viewport.right = 0
      }
    } else if (config.viewport.right < 0) {
      config.viewport.left += config.viewport.right
      config.viewport.right = 0
      if (config.viewport.left < 0) {
        config.viewport.left = 0
      }
    }

    // const previousWidth = config.scaleBounds.width * config.zoom
    // const nextWidth = config.scaleBounds.width * nextZoom
    // const compensation = (previousWidth * 0.5 - nextWidth * zoomOrigin)
    // config.viewportShift += compensation


    config.zoom = 1 / (1 - config.viewport.left - config.viewport.right) // nextZoom < 1 ? 1 : nextZoom
  }
}, {
  domTarget: waterfallRowsRef,
  eventOptions: {
    capture: false,
    passive: false,
  },
})

const viewportVars = computed(() => ({
  '--viewport-left': `${config.viewport.left * 100}%`,
  '--viewport-right': `${config.viewport.right * 100}%`,
}))

// In case
watchEffect(() => {
  if (config.viewportShift > 0) {
    config.viewportShift = 0
  } else if (config.viewportShift < minViewportShift.value) {
    config.viewportShift = minViewportShift.value
  }
})

console.log(toRaw(props.spanRoots))
console.log(toRaw(config))
</script>

<style lang="scss" scoped>
.waterfall {
  box-sizing: border-box;

  .waterfall-header,
  .waterfall-minimap,
  .waterfall-rows {
    box-sizing: border-box;
    width: 100%;
    display: grid;
    grid-template-columns: 300px auto;
    column-gap: 10px;
    padding: 10px;
  }

  .waterfall-header {
    border-bottom: 1px solid #ddd;

    .waterfall-actions {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: $kui-space-20;
    }

    .waterfall-scale {}
  }

  .waterfall-minimap {
    .minimap-label {
      grid-column: 1 / 2;
      font-size: $kui-font-size-20;
      font-family: $kui-font-family-code;
      text-align: right;
    }

    .minimap-wrapper {
      display: grid;
      grid-column: 2 / -1;
      grid-template-columns: repeat(v-bind("config.ticks * 2"), 1fr);

      .minimap {
        grid-column: 2 / -2;
        background-color: $kui-color-background-neutral-weaker;
        height: 12px;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          z-index: 10;
          top: 0;
          left: var(--viewport-left);
          width: calc(100% - var(--viewport-right) - var(--viewport-left));
          height: 100%;
          background-color: $kui-color-background-neutral-weak;
        }
      }
    }
  }

  .waterfall-rows {
    font-family: $kui-font-family-code;
  }
}
</style>
