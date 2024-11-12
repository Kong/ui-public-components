<template>
  <Splitpanes
    class="trace-viewer"
    horizontal
  >
    <Pane
      class="summary-pane"
      min-size="20"
    >
      <div class="above-waterfall">
        <WaterfallSpanLegend />

        <div class="url">
          <div class="label">
            URL
          </div>
          <div class="content">
            <KCopy
              copy-tooltip="Copy"
              text="https://konghq.com"
            />
          </div>
        </div>
      </div>

      <div
        class="waterfall-wrapper"
      >
        <WaterfallView
          :span-root="props.spanRoot"
          @update:selected-span="handleUpdateSelectedSpan"
        />
      </div>
    </Pane>

    <Pane
      class="detail-pane"
      size="50"
    >
      <div v-if="selectedSpan">
        <SpanAttributesDisplay
          :span="selectedSpan"
        />
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
import { Pane, Splitpanes } from '@kong/splitpanes'
import '@kong/splitpanes/dist/splitpanes.css'
import { ref, type PropType } from 'vue'
import type { SpanTreeNode } from '../types'
import WaterfallView from './waterfall/WaterfallView.vue'
import WaterfallSpanLegend from './waterfall/WaterfallSpanLegend.vue'
import SpanAttributesDisplay from './SpanAttributesDisplay.vue'

const props = defineProps({
  spanRoot: {
    type: Object as PropType<SpanTreeNode>,
    required: true,
  },
})

const selectedSpan = ref<SpanTreeNode | undefined>(undefined)

const handleUpdateSelectedSpan = (span?: SpanTreeNode) => {
  selectedSpan.value = span
}
</script>

<style lang="scss" scoped>
.trace-viewer {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  height: 100%;
  box-sizing: border-box;
  padding: 0 !important;

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

  .summary-pane {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    padding: $kui-space-30 0 $kui-space-70;
    gap: $kui-space-50;

    .above-waterfall {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: $kui-space-50;

      .url {
        min-width: 30%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
        gap: $kui-space-40;

        .label {
          font-size: $kui-font-size-30;
          font-weight: $kui-font-weight-semibold;
        }
      }
    }

    .waterfall-wrapper {
      border: 1px solid $kui-color-border-neutral-weaker;
      border-radius: $kui-border-radius-20;
      height: 100%;
      overflow: hidden;
    }
  }

  .detail-pane {
    box-sizing: border-box;
    overflow: scroll;
    padding-bottom: $kui-space-120;

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
