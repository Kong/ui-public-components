<template>
  <KSlideout
    class="trace-viewer-slideout"
    :max-width="maxWidth"
    :visible="visible"
    @close="emit('close')"
  >
    <template #title>
      <KBadge appearance="warning">
        429
      </KBadge>
      GET /kong/banana
    </template>

    <TraceViewer
      :span-root="spanRoot"
    />
  </KSlideout>
</template>

<script setup lang="ts">
import { type PropType } from 'vue'
import type { SpanTreeNode } from '../../src'
import { TraceViewer } from '../../src'

defineProps({
  spanRoot: {
    type: Object as PropType<SpanTreeNode>,
    required: true,
  },
  visible: {
    type: Boolean,
    default: false,
  },
  maxWidth: {
    type: String,
    default: undefined,
  },
})

const emit = defineEmits(['close'])
</script>

<style lang="scss" scoped>
.trace-viewer-slideout {
  :deep(.slideout-container) {
    box-sizing: border-box;
    .slideout-content {
      flex-grow: 1;
    }
  }
}
</style>
