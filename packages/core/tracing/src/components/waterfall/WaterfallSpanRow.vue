<template>
  <div :class="['waterfall-span-row', { active }]">
    <div class="label">
      <template v-if="depth > 1">
        <WaterfallSpacer
          v-for="(_, spacerIndex) in depth - 1"
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

      <div
        class="label-content"
        @click="handleSelect"
      >
        <KTooltip
          class="name"
          :text="spanNode.name"
        >
          <div class="name">
            {{ spanNode.name }}
          </div>
        </KTooltip>

        <div class="duration">
          {{ format(spanNode.durationNano) }}
        </div>
      </div>
    </div>

    <div class="bar-wrapper">
      <div
        class="bar"
        :style="barVars"
      />
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
import { spanPresentations } from '../../constants'
import { SpanType, type SpanTreeNode } from '../../types/spans'
import WaterfallTreeControl from './WaterfallTreeControl.vue'
import WaterfallSpacer, { SpacerType } from './WaterfallTreeSpacer.vue'
import {
  ProvidedWaterfallConfig,
  type WaterfallConfig,
} from './WaterfallView.vue'

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

const expanded = ref(true)

const active = computed(
  () =>
    config.selectedSpan?.traceId === props.spanNode.traceId &&
    config.selectedSpan?.spanId === props.spanNode.spanId,
)

const hasChildren = computed(
  () =>
    props.spanNode.children !== undefined && props.spanNode.children.length > 0,
)

const spacerType = computed(() => {
  if (expanded.value && props.index !== props.siblingCount) {
    return SpacerType.Attach
  }

  if (props.index === props.siblingCount) {
    return SpacerType.CornerAttach
  }

  return SpacerType.Attach
})

const handleExpand = () => {
  if (props.spanNode.children) {
    expanded.value = !expanded.value
  }
}

const handleSelect = () => {
  config.selectedSpan = props.spanNode
}

const barColor = computed(() => {
  if (props.spanNode.root) {
    return spanPresentations[SpanType.ROOT].color
  }

  if (props.spanNode.name.includes('client')) {
    return spanPresentations[SpanType.CLIENT].color
  }

  if (props.spanNode.name.includes('upstream')) {
    return spanPresentations[SpanType.UPSTREAM].color
  }

  if (props.spanNode.name === 'kong.dns') {
    return spanPresentations[SpanType.THIRD_PARTY].color
  }

  return spanPresentations[SpanType.KONG].color
})

const barFixedLeft = computed(
  () =>
    ((props.spanNode.startTimeUnixNano - config.startTimeUnixNano) /
      config.totalDurationNano) *
    config.zoom,
)

const barShiftLeft = computed(() => -config.viewport.left * config.zoom)

const barShift = computed(() => barFixedLeft.value + barShiftLeft.value)

const barVars = computed(() => ({
  '--bar-color': barColor.value,
  '--bar-shift': `${barShift.value * 100}%`,
  '--bar-width': `max(3px, ${
    (props.spanNode.durationNano / config.totalDurationNano) * config.zoom * 100
  }%)`,
}))
</script>

<style lang="scss" scoped>
.waterfall-span-row {
  display: grid;
  grid-template-columns: var(--row-label-width) auto;
  column-gap: $kui-space-40;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;

  &.active {
    $row-background-color: $kui-color-background-primary-weakest;
    background-color: $row-background-color;

    .bar-wrapper {
      &::before {
        background: linear-gradient(
          to right,
          $row-background-color 0%,
          rgba($row-background-color, 0) 50%,
          rgba($row-background-color, 0) 100%
        );
      }

      &::after {
        background: linear-gradient(
          to left,
          $row-background-color 0%,
          rgba($row-background-color, 0) 50%,
          rgba($row-background-color, 0) 100%
        );
      }
    }
  }

  .label {
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    font-size: $kui-font-size-20;

    .label-content {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: $kui-space-30;
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
      padding: $kui-space-20 $kui-space-10;
      border-bottom: 1px solid $kui-color-border-neutral-weaker;
      cursor: pointer;

      .name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .duration {
        font-size: $kui-font-size-20;
      }
    }
  }

  .bar-wrapper {
    position: relative;
    font-size: $kui-font-size-30;
    padding: $kui-space-20 var(--span-bar-fading-width);
    overflow: hidden;
    box-sizing: border-box;

    &::before {
      content: "";
      position: absolute;
      display: block;
      z-index: 10;
      left: 0;
      top: 0;
      width: var(--span-bar-fading-width);
      height: 100%;
      background: linear-gradient(
        to right,
        white 0%,
        rgba(255, 255, 255, 0) 50%,
        rgba(255, 255, 255, 0) 100%
      );
    }

    &::after {
      content: "";
      position: absolute;
      display: block;
      z-index: 10;
      right: 0;
      top: 0;
      width: var(--span-bar-fading-width);
      height: 100%;
      background-color: orchid;
      background: linear-gradient(
        to left,
        white 0%,
        rgba(255, 255, 255, 0) 50%,
        rgba(255, 255, 255, 0) 100%
      );
    }

    .bar {
      height: 100%;
      position: relative;
      z-index: 1;

      &::after {
        content: "";
        position: absolute;
        left: var(--bar-shift);
        top: 0;
        width: var(--bar-width);
        height: 100%;
        background-color: var(--bar-color);
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
}
</style>
