<template>
  <div class="span-legend">
    <div class="title">
      Latency
    </div>
    <div
      v-for="(presentation, t) in spanPresentations"
      :key="t"
      class="span-legend-item"
    >
      <div
        class="color"
        :style="{ backgroundColor: presentation.color }"
      />
      <div>{{ presentation.label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { spanPresentations } from '../../constants'
</script>

<style lang="scss" scoped>
.span-legend {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: $kui-space-40;
  font-size: $kui-font-size-30;

  .title {
    font-weight: $kui-font-weight-semibold;
  }

  .span-legend-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: $kui-space-20;

    .color {
      width: 10px;
      height: 10px;
    }
  }
}
</style>
