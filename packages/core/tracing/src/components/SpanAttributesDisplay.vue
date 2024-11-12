<template>
  <div class="span-attributes-display">
    <div class="title">
      Span Attributes
    </div>

    <div class="attributes">
      <template v-if="span.attributes.length > 0">
        <SpanAttribute
          v-for="attr in span.attributes"
          :key="attr.key"
          :attribute="attr"
          :span="span"
        />
      </template>
      <div
        v-else
        class="empty-state"
      >
        No attributes available
      </div>
    </div>
  </div>
</template>

<script setup lang="tsx">
import type { PropType } from 'vue'
import type { Span } from '../types'
import SpanAttribute from './SpanAttribute.vue'

defineProps({
  span: {
    type: Object as PropType<Span>,
    required: true,
  },
  generateEntityURL: {
    type: Function as PropType<(entity: string, entityId: string) => string>,
    required: false,
    default: undefined,
  },
})
</script>

<style lang="scss" scoped>
.span-attributes-display {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  .title {
    position: sticky;
    top: 0;
    width: 100%;
    font-size: $kui-font-size-50;
    font-weight: $kui-font-weight-semibold;
    padding: $kui-space-60 0 $kui-space-40;
    background-color: $kui-color-background;
  }

  .attributes {
    width: 100%;

    .config-card-details-row {

    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      min-height: 200px;
    }
  }
}
</style>
