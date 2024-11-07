<template>
  <div class="waterfall">
    <div
      v-if="false"
      class="waterfall-header"
    >
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
        <WaterfallSpanLegend />
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
      <div class="measurement">
        <div
          ref="spanBarMeasurementRef"
          class="span-bar"
        />
      </div>

      <WaterfallSpanRow
        v-if="spanRoot"
        :span-node="spanRoot"
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

  spanBar: {
    x: number
    width: number
  }

  viewport: {
    left: number
    right: number
  }

  selectedSpan?: SpanTreeNode
}

export const ProvidedWaterfallConfig = Symbol('ProvidedWaterfallConfig')
</script>

<script setup lang="ts">
import { AddIcon, RemoveIcon } from '@kong/icons'
import { useWheel } from '@vueuse/gesture'
import type { SpanTreeNode } from 'src/types/spans'
import { computed, onMounted, provide, reactive, ref, toRaw, watch, watchEffect, type PropType } from 'vue'
import WaterfallScale from './WaterfallScale.vue'
import WaterfallSpanLegend from './WaterfallSpanLegend.vue'
import WaterfallSpanRow from './WaterfallSpanRow.vue'

const props = defineProps({
  ticks: {
    type: Number,
    default: 10,
    validator: (value: number) => value > 1 && Number.isInteger(value),
  },
  spanRoot: {
    type: Object as PropType<SpanTreeNode>,
    default: () => undefined,
  },
})

const emit = defineEmits<{
  'update:selectedSpan': [span?: SpanTreeNode]
}>()

const config = reactive<WaterfallConfig>({
  ticks: props.ticks,
  totalDurationNano: props.spanRoot?.durationNano ?? 0,
  startTimeUnixNano: props.spanRoot?.startTimeUnixNano ?? 0,
  zoom: 1,
  viewportShift: 0,
  spanBar: { x: 0, width: 0 },
  viewport: { left: 0, right: 0 },
})

provide<WaterfallConfig>(ProvidedWaterfallConfig, config)

let resizeObserver: ResizeObserver
const waterfallRowsRef = ref<HTMLElement | null>(null)
const spanBarMeasurementRef = ref<HTMLElement | null>(null)
const minViewportShift = computed(() => -(config.spanBar.width * config.zoom) + config.spanBar.width)

useWheel((e) => {
  if (Math.abs(e.delta[0]) > Math.abs(e.delta[1])) {
    const viewportShift = e.delta[0] / config.zoom / config.spanBar.width
    config.viewport.left += viewportShift
    config.viewport.right -= viewportShift
    if (config.viewport.left < 0) {
      config.viewport.right += config.viewport.left
      config.viewport.left = 0
    } else if (config.viewport.right < 0) {
      config.viewport.left += config.viewport.right
      config.viewport.right = 0
    }
  } else {
    const nextZoom = Math.max(1, config.zoom - e.delta[1] / config.spanBar.width * 5)
    const viewportWidth = 1 - config.viewport.left - config.viewport.right
    const nextViewportWidth = 1 / nextZoom
    const viewportWidthDelta = nextViewportWidth - viewportWidth

    const zoomOrigin = (e.event.x - config.spanBar.x) / config.spanBar.width

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

onMounted(() => {
  const measureSpanBar = () => {
    const { x, width } = spanBarMeasurementRef.value!.getBoundingClientRect()
    config.spanBar = { x, width }
  }

  resizeObserver = new ResizeObserver(() => {
    measureSpanBar()
  })

  measureSpanBar()
  resizeObserver.observe(spanBarMeasurementRef.value!)
})

watch(() => config.selectedSpan, (span) => {
  emit('update:selectedSpan', span)
})

// In case
watchEffect(() => {
  if (config.viewportShift > 0) {
    config.viewportShift = 0
  } else if (config.viewportShift < minViewportShift.value) {
    config.viewportShift = minViewportShift.value
  }
})

console.log(toRaw(props.spanRoot))
console.log(toRaw(config))
</script>

<style lang="scss" scoped>
.waterfall {
  --row-label-width: 400px;
  --span-bar-fading-width: 24px;

  box-sizing: border-box;

  .waterfall-header,
  .waterfall-minimap {
    box-sizing: border-box;
    width: 100%;
    display: grid;
    grid-template-columns: var(--row-label-width) auto;
    column-gap: 10px;
    padding: $kui-space-20 0;
  }

  .waterfall-header {
    border-bottom: 1px solid $kui-color-border-neutral-weaker;

    .waterfall-actions {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: $kui-space-40;
    }

    .waterfall-scale {}
  }

  .waterfall-minimap {
    align-items: center;

    .minimap-label {
      grid-column: 1 / 2;
      font-size: $kui-font-size-20;
      // font-family: $kui-font-family-code;
      // text-align: right;
    }

    .minimap-wrapper {
      grid-column: 2 / -1;
      box-sizing: border-box;
      height: 4px;
      padding: 0 var(--span-bar-fading-width);

      .minimap {
        position: relative;
        width: 100%;
        height: 100%;
        background-color: $kui-color-background-neutral-weaker;
        border-radius: $kui-border-radius-20;
        overflow: hidden;

        &::after {
          content: '';
          position: absolute;
          z-index: 10;
          top: 0;
          left: calc(var(--viewport-left));
          width: calc(100% - var(--viewport-right) - var(--viewport-left));
          height: 100%;
          background-color: $kui-color-background-neutral;
        }
      }
    }


  }

  .waterfall-rows {
    font-family: $kui-font-family-code;

    .measurement {
      display: grid;
      grid-template-columns: var(--row-label-width) auto;

      .span-bar {
        grid-column: 2 / -1;
      }
    }
  }
}
</style>
