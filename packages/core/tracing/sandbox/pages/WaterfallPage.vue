<template>
  <WaterfallView
    v-for="(root, i) in spanRoots"
    :key="i"
    :span-root="root"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { buildSpanTrees, WaterfallView } from '../../src'
import spanWithExceptions from '../fixtures/spans-2.json'

const spanRoots = computed(() => buildSpanTrees(spanWithExceptions))
</script>
