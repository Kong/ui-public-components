<template>
  <KCard class="field-card-container">
    <template #title>
      <div>
        <KLabel
          :info="props.titleTooltip"
          :tooltip-attributes="props.titleTooltip ? {
            maxWidth: '300',
            placement: 'top',
          } : undefined"
        >
          <div class="field-card-container-title">
            {{ props.title }}
          </div>
        </KLabel>
      </div>

      <div
        v-if="props.subtitle"
        class="field-card-container-subtitle"
      >
        {{ props.subtitle }}
      </div>
    </template>

    <slot />
  </KCard>
</template>

<script setup lang="ts">
import type { CardContainerProps } from '../types/card-container'

const props = defineProps<CardContainerProps>()
</script>

<style lang="scss" scoped>
.field-card-container {
  &-title-tooltip {
    display: inline-block;
  }

  &-title {
    font-size: $kui-font-size-40;
    font-weight: $kui-font-weight-bold;
    line-height: $kui-line-height-30;
  }

  &-subtitle {
    color: $kui-color-text-neutral;
    font-weight: $kui-font-weight-regular;
  }

  :deep(.form-group) {
    margin-bottom: 0 !important;
  }

  :deep(.card-header) {
    margin-bottom: $kui-space-20;
  }

  :deep(.card-content) {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: $kui-space-40;
    width: 100%;
  }
}
</style>
