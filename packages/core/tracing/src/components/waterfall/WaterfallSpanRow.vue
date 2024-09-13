<template>
  <div class="waterfall-span-row-label">
    <template v-if="depth > 1">
      <WaterfallSpacer
        v-for="(_, spacerIndex) in (depth - 1)"
        :key="`spacer-${spacerIndex}`"
        :type="SpacerType.Ruler"
      />
    </template>

    <WaterfallSpacer
      v-if="(depth || 0) > 0"
      :type="spacerType"
    />

    <WaterfallTreeControl
      :expanded="expanded"
      :invisible="!hasChildren"
      @click="handleExpand"
    />

    <div class="label-content">
      <div class="operation-name">
        {{ spanNode.name }}
      </div>
    </div>
  </div>

  <div class="waterfall-span-row-content">
    <div
      class="bar-container"
      :style="barVars"
    >
      <div
        class="bar-label"
        :style="barLabelVars"
      >
        {{ format(spanNode.durationNano) }}
      </div>
    </div>
  </div>

  <template v-if="expanded && spanNode.children">
    <WaterfallSpanRow
      v-for="(child, i) in spanNode.children"
      :key="`${spanNode.traceId}-${child.spanId}`"
      :depth="(depth || 0) + 1"
      :index="i"
      :sibling-count="spanNode.children.length - 1"
      :span-node="child"
    />
  </template>
</template>

<script lang="ts" setup>
import { computed, inject, ref, type PropType } from 'vue'
import composables from '../../composables'
import type { SpanTreeNode } from '../../types'
import { ProvidedWaterfallConfig, type WaterfallConfig } from './Waterfall.vue'
import WaterfallTreeControl from './WaterfallTreeControl.vue'
import WaterfallSpacer, { SpacerType } from './WaterfallTreeSpacer.vue'

const config = inject<WaterfallConfig>(ProvidedWaterfallConfig)!
const format = composables.useDurationFormatter()

const props = defineProps({
  spanNode: {
    type: Object as PropType<SpanTreeNode>,
    required: true,
  },
  depth: {
    type: Number,
    default: 0,
  },
  index: {
    type: Number,
    default: 0,
  },
  /**
   * The SIBLING COUNT of the spans on the same level.
   * Note: This does not count ourself.
   */
  siblingCount: {
    type: Number,
    default: 0,
  },
})

const expanded = ref(false)
const hasChildren = computed(
  () => props.spanNode.children !== undefined && props.spanNode.children.length > 0,
)

const spacerType = computed(() => {
  if (!expanded.value && props.index === props.siblingCount) {
    return SpacerType.CornerAttach
  }

  return SpacerType.Attach
})

const handleExpand = () => {
  if (props.spanNode.children) {
    expanded.value = !expanded.value
  }
}

const barFixedLeft = computed(() =>
  (props.spanNode.startTimeUnixNano - config.startTimeUnixNano) / config.totalDurationNano * config.zoom,
)

const barShiftLeft = computed(() =>
  -config.viewport.left * config.zoom,
)

const barShift = computed(() =>
  barFixedLeft.value + barShiftLeft.value,
)

const barVars = computed(() => ({
  '--bar-shift': `${(barShift.value) * 100}%`,
  '--bar-width': `max(3px, ${props.spanNode.durationNano / config.totalDurationNano * config.zoom * 100}%)`,
}))

const barLabelVars = computed(() => ({
  '--bar-label-left': barShift.value > 0.5 ? 'unset' : `${barShift.value * 100}%`,
  '--bar-label-right': barShift.value >= 0.5 ? `${(1 - barShift.value) * 100}%` : 'unset',
}))
</script>

<style lang="scss" scoped>
.waterfall-span-row-label {
  grid-column: 0 / 1;
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  font-size: $kui-font-size-30;

  .label-content {
    min-width: 0;
    box-sizing: border-box;
    padding: $kui-space-20 $kui-space-10;

    .operation-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.waterfall-span-row-content {
  display: grid;
  grid-template-columns: repeat(v-bind("config.ticks * 2"), 1fr);
  position: relative;
  width: 100%;
  font-size: $kui-font-size-30;
  padding: $kui-space-20 0;
  overflow: hidden;

  &::before {
    content: '';
    grid-column: 1 / 2;
    position: relative;
    z-index: 10;
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, white 0%, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0) 100%);
  }

  &::after {
    content: '';
    grid-column: -2 / -1;
    position: relative;
    z-index: 10;
    width: 100%;
    height: 100%;
    background-color: orchid;
    background: linear-gradient(to left, white 0%, rgba(255, 255, 255, 0) 50%, rgba(255, 255, 255, 0) 100%);
  }

  .bar-container {
    grid-column: 2 / -2;
    height: 100%;
    position: relative;
    z-index: 1;
    // overflow: hidden;

    &::after {
      content: '';
      position: absolute;
      left: var(--bar-shift);
      top: 0;
      width: var(--bar-width);
      height: 100%;
      background-color: $kui-color-background-primary-weaker;
      border-radius: $kui-border-radius-20;
    }

    .bar-label {
      position: absolute;
      left: var(--bar-label-left);
      right: var(--bar-label-right);
      top: 50%;
      transform: translateY(-50%);
      z-index: 10;
      font-size: $kui-font-size-10;
    }
  }
}
</style>
