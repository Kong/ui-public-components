<template>
  <div
    class="waterfall"
    :style="rootStyle"
  >
    <div class="waterfall-sticky-header">
      <div class="waterfall-row">
        <div class="minimap-wrapper">
          <div
            v-if="interaction === 'zoom'"
            class="minimap"
            :style="viewportVars"
          />
        </div>
      </div>

      <div class="waterfall-row">
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

        <div>
          <WaterfallScale v-if="config" />
        </div>
      </div>
    </div>

    <div
      ref="rowsAreaRef"
      class="waterfall-rows"
      :style="rowsAreaStyle"
      @mouseleave="handleRowsAreaLeave"
      @mousemove="handleRowsAreaMove"
    >
      <div class="waterfall-row">
        <div />
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
import { computed, provide, reactive, ref, watch, watchEffect, type PropType } from 'vue'
import type { SpanTreeNode } from '../../types/spans'
import WaterfallScale from './WaterfallScale.vue'
import WaterfallSpanRow from './WaterfallSpanRow.vue'

const props = defineProps({
  ticks: {
    type: Number,
    default: 6,
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
const rowsAreaGuideX = ref<number | undefined>(undefined)

const config = reactive<WaterfallConfig>({
  ticks: props.ticks,
  totalDurationNano: props.spanRoot?.durationNano ?? 0,
  startTimeUnixNano: props.spanRoot?.startTimeUnixNano ?? 0,
  zoom: 1,
  viewportShift: 0,
  viewport: { left: 0, right: 0 },
})

provide<WaterfallConfig>(ProvidedWaterfallConfig, config)

const getRowsAreaRect = () => rowsAreaRef.value?.getBoundingClientRect()
const getSBMRect = () => spanBarMeasurementRef.value?.getBoundingClientRect()

const handleRowsAreaMove = (e: MouseEvent) => {
  const rowsAreaRect = getRowsAreaRect()!
  const sbmRect = getSBMRect()!
  if (sbmRect.x < e.x && e.x <= sbmRect.x + sbmRect.width) {
    rowsAreaGuideX.value = e.x - (rowsAreaRect.x ?? 0)
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

const rootStyle = computed(() => ({
  overflow: interaction.value === 'zoom' ? 'hidden' : 'scroll',
}))

const rowsAreaStyle = computed(() => ({
  '--cursor': rowsAreaGuideX.value !== undefined ? 'crosshair' : 'auto',
}))

watch(interaction, () => {
  config.viewport = { left: 0, right: 0 }
  config.zoom = 1
  config.viewportShift = 0
})

useWheel(
  (e) => {
    if (interaction.value !== 'zoom') {
      return
    }

    e.event.preventDefault()

    const sbmRect = getSBMRect()!

    if (e.event.x < sbmRect.x) {
      return
    }

    if (Math.abs(e.delta[0]) > Math.abs(e.delta[1])) {
      const viewportShift = e.delta[0] / config.zoom / sbmRect.width
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
      const nextZoom = Math.max(1, config.zoom - (e.delta[1] / sbmRect.width) * 4)
      const viewportWidth = 1 - config.viewport.left - config.viewport.right
      const nextViewportWidth = 1 / nextZoom
      const viewportWidthDelta = nextViewportWidth - viewportWidth

      const zoomOrigin = (e.event.x - sbmRect.x) / sbmRect.width

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
    eventOptions: {
      passive: false,
    },
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
  const sbmRect = getSBMRect()
  if (sbmRect) {
    const minViewportShift = -(sbmRect.width * config.zoom) + sbmRect.width

    if (config.viewportShift > 0) {
      config.viewportShift = 0
    } else if (config.viewportShift < minViewportShift) {
      config.viewportShift = minViewportShift
    }
  }
})
</script>

<style lang="scss" scoped>
.waterfall {
  --row-label-width: 400px;
  --row-column-gap: #{$kui-space-40};
  --span-bar-fading-width: #{$kui-space-50};

  box-sizing: border-box;
  height: 100%;

  :deep(.waterfall-row) {
    box-sizing: border-box;
    width: 100%;
    display: grid;
    grid-template-columns: var(--row-label-width) auto;
    column-gap: var(--row-column-gap);
    padding: 0 $kui-space-40;

    &> :nth-child(2) {
      padding: 0 var(--span-bar-fading-width);
    }
  }

  .waterfall-sticky-header {
    position: sticky;
    top: 0;
    z-index: 1000;
    background-color: $kui-color-background-neutral-weakest;
    border-bottom: 1px solid $kui-color-border-neutral-weaker;
    padding: $kui-space-30 0 $kui-space-20;
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
  }

  .waterfall-minimap {
    align-items: center;

    .minimap-label {
      grid-column: 1 / 2;
      font-size: $kui-font-size-20;
    }

    .minimap-wrapper {
      height: 4px;

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

    .span-bar-measurement {
      height: 2px;
      border: 1px solid red;
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
