<template>
  <Splitpanes
    class="trace-viewer"
    horizontal
  >
    <Pane class="waterfall-pane">
      <WaterfallView
        :span-root="props.spanRoot"
        @update:selected-span="handleUpdateSelectedSpan"
      />
    </Pane>

    <Pane
      class="detail-pane"
      size="50"
    >
      <div v-if="selectedSpan">
        <div>
          Sorry, Just a WIP…
        </div>
        <pre>{{ selectedSpan }}</pre>
      </div>
      <div
        v-else
        class="empty-state"
      >
        Selected span will be shown here
      </div>
    </Pane>
  </Splitpanes>
</template>

<script setup lang="tsx">
import { Pane, Splitpanes } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import { computed, ref, type PropType } from 'vue'
import type { SpanTreeNode } from '../types'
import WaterfallView from './waterfall/WaterfallView.vue'

const props = defineProps({
  spanRoot: {
    type: Object as PropType<SpanTreeNode>,
    required: true,
  },
})

const resizeHandleRef = ref<HTMLElement | null>(null)
const detailPanelRef = ref<HTMLElement | null>(null)
const selectedSpan = ref<SpanTreeNode | undefined>(undefined)

const dragOffset = ref(0)

const detailPanelVars = computed(() => ({
  '--resize-offset': `${dragOffset.value}px`,
}))

const handleUpdateSelectedSpan = (span?: SpanTreeNode) => {
  selectedSpan.value = span
}

// useDrag((e) => {
//   console.log(e.movement)
//   dragOffset.value += e.delta[1]
// }, {
//   domTarget: resizeHandleRef,
//   useTouch: true,
// })
</script>

<style lang="scss" scoped>

.trace-viewer {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  height: 100%;

  :deep(.splitpanes__splitter) {
    $resize-handle-height: 4px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: $kui-space-20 0;
    border-top: 1px solid $kui-color-border-neutral-weaker;

    &::after {
      content: '';
      width: 30px;
      height: $resize-handle-height;
      border-radius: $resize-handle-height / 2;
      background-color: $kui-color-border-neutral-weak;
    }
  }

  .waterfall-pane {
    overflow: scroll;
    padding: $kui-space-20;
    box-sizing: border-box;
  }

  .detail-pane {
    overflow: scroll;

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }
  }
}
</style>
