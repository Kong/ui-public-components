<template>
  <div class="waterfall">
    <div class="dev-interaction">
      <div>Interaction</div>
      <div class="radios">
        <KRadio
          v-model="interaction"
          name="test"
          selected-value="scroll"
        >
          Scroll
        </KRadio>
        <KRadio
          v-model="interaction"
          name="test"
          selected-value="zoom"
        >
          Zoom
        </KRadio>
      </div>
    </div>
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

      <div
        v-if="interaction === 'zoom'"
        class="minimap-wrapper"
      >
        <div
          class="minimap"
          :style="viewportVars"
        />
      </div>
    </div>

    <div
      ref="rowsAreaRef"
      class="waterfall-rows"
      :style="rowsAreaStyle"
      @mouseleave="handleRowsAreaLeave"
      @mousemove="handleRowsAreaMove"
      @wheel="handleWheel"
    >
      <div class="measurement">
        <div class="span-bar-wrapper">
          <div ref="spanBarMeasurementRef" />
        </div>
      </div>

      <div
        v-if="rowsAreaGuideX !== undefined"
        class="guide"
        :style="rowsAreaGuideStyle"
      />

      <WaterfallSpanRow
        v-if="spanRoot"
        :span-node="spanRoot"
      />
    </div>
  </div>
</template>

<script lang="ts">
export interface WaterfallConfig {
  ticks: number;
  totalDurationNano: number;
  startTimeUnixNano: number;
  zoom: number;
  /**
   * Horizontal shift of the viewport in pixels.
   * Left is negative, right is positive.
   */
  viewportShift: number;

  spanBarMeasurement?: DOMRect;

  viewport: {
    left: number;
    right: number;
  };

  selectedSpan?: SpanTreeNode;
}

export const ProvidedWaterfallConfig = Symbol('ProvidedWaterfallConfig')
</script>

<script setup lang="ts">
import { AddIcon, RemoveIcon } from '@kong/icons'
import { useWheel } from '@vueuse/gesture'
import type { SpanTreeNode } from 'src/types/spans'
import { computed, provide, reactive, ref, toRaw, watch, watchEffect, type PropType } from 'vue'
import composables from '../../composables'
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
  'update:selectedSpan': [span?: SpanTreeNode];
}>()

const interaction = ref<'scroll' | 'zoom'>('scroll')
const rowsAreaRef = ref<HTMLElement | null>(null)
const spanBarMeasurementRef = ref<HTMLElement | null>(null)
const minViewportShift = computed(
  () => -((config.spanBarMeasurement?.width ?? 0) * config.zoom) + (config.spanBarMeasurement?.width ?? 0),
)
const rowsAreaGuideX = ref<number | undefined>(undefined)
const rowsAreaRect = composables.useBoundingRect(rowsAreaRef)
const spanBarMeasurementRect = composables.useBoundingRect(spanBarMeasurementRef)

const config = reactive<WaterfallConfig>({
  ticks: props.ticks,
  totalDurationNano: props.spanRoot?.durationNano ?? 0,
  startTimeUnixNano: props.spanRoot?.startTimeUnixNano ?? 0,
  zoom: 1,
  viewportShift: 0,
  spanBarMeasurement: undefined,
  viewport: { left: 0, right: 0 },
})

watch(
  spanBarMeasurementRect,
  (rect) => {
    config.spanBarMeasurement = rect
  },
  { immediate: true },
)

provide<WaterfallConfig>(ProvidedWaterfallConfig, config)

const handleRowsAreaMove = (e: MouseEvent) => {
  if (
    (config.spanBarMeasurement?.x ?? 0) < e.x &&
    e.x < (config.spanBarMeasurement?.x ?? 0) + (config.spanBarMeasurement?.width ?? 0)
  ) {
    rowsAreaGuideX.value = e.x - (rowsAreaRect.value?.x ?? 0)
  } else {
    rowsAreaGuideX.value = undefined
  }
}

const handleRowsAreaLeave = () => {
  rowsAreaGuideX.value = undefined
}

const rowsAreaGuideStyle = computed(() => ({
  transform: `translateX(${rowsAreaGuideX.value}px)`,
}))

const rowsAreaStyle = computed(() => ({
  '--cursor': rowsAreaGuideX.value !== undefined ? 'crosshair' : 'auto',
}))

watch(interaction, () => {
  config.viewport = { left: 0, right: 0 }
  config.zoom = 1
  config.viewportShift = 0
})

const handleWheel = (e: WheelEvent) => {
  if (interaction.value === 'zoom') {
    e.preventDefault()
    return
  }
}

useWheel(
  (e) => {
    if (interaction.value !== 'zoom') {
      return
    }

    if (e.event.x < (config.spanBarMeasurement?.x ?? 0)) {
      return
    }

    if (Math.abs(e.delta[0]) > Math.abs(e.delta[1])) {
      const viewportShift = e.delta[0] / config.zoom / (config.spanBarMeasurement?.width ?? 0)
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
      const nextZoom = Math.max(1, config.zoom - (e.delta[1] / (config.spanBarMeasurement?.width ?? 0)) * 4)
      const viewportWidth = 1 - config.viewport.left - config.viewport.right
      const nextViewportWidth = 1 / nextZoom
      const viewportWidthDelta = nextViewportWidth - viewportWidth

      const zoomOrigin = (e.event.x - (config.spanBarMeasurement?.x ?? 0)) / (config.spanBarMeasurement?.width ?? 0)

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
  },
  {
    domTarget: rowsAreaRef,
  },
)

const viewportVars = computed(() => ({
  '--viewport-left': `${config.viewport.left * 100}%`,
  '--viewport-right': `${config.viewport.right * 100}%`,
}))

watch(
  () => config.selectedSpan,
  (span) => {
    emit('update:selectedSpan', span)
  },
)

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
  --row-column-gap: #{$kui-space-40};
  --span-bar-fading-width: #{$kui-space-50};

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

    .waterfall-scale {
    }
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
          content: "";
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
    position: relative;
    font-family: $kui-font-family-code;
    overflow: hidden;
    cursor: var(--cursor);

    .measurement {
      display: grid;
      grid-template-columns: var(--row-label-width) auto;
      column-gap: var(--row-column-gap);
      height: 0;

      .span-bar-wrapper {
        grid-column: 2 / -1;
        padding: 0 var(--span-bar-fading-width);
      }
    }

    .guide {
      position: absolute;
      z-index: 10;
      top: 0;
      left: -1px;
      width: 0;
      height: 100%;
      border-left: 1px dashed $kui-color-border-neutral-weak;
      pointer-events: none;
    }
  }
}

.dev-interaction {
  position: fixed;
  left: 20px;
  bottom: 20px;
  background: rgba(white, 0.6);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 8px;
  gap: 8px;

  .radios {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
}
</style>
