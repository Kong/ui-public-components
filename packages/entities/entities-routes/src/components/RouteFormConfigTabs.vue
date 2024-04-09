<template>
  <KTabs
    v-if="tabs.length > 1"
    v-model="tab"
    :tabs="tabs"
    @change="(t: string) => tab = t"
  >
    <template
      v-if="routerFlavors.traditional"
      #[RouterFlavor.TRADITIONAL]
    >
      <slot name="before-content" />

      <slot :name="RouterFlavor.TRADITIONAL" />
    </template>

    <template
      v-if="routerFlavors.expressions"
      #[RouterFlavor.EXPRESSIONS]
    >
      <slot name="before-content" />

      <slot :name="RouterFlavor.EXPRESSIONS" />
    </template>
  </KTabs>

  <template v-else>
    <slot name="before-content" />

    <slot
      v-if="routerFlavors.traditional"
      :name="RouterFlavor.TRADITIONAL"
    />

    <slot
      v-else-if="routerFlavors.expressions"
      :name="RouterFlavor.EXPRESSIONS"
    />
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type RouterFlavors, RouterFlavor } from '../types'

const tab = defineModel<string>()

const props = defineProps<{
  routerFlavors: RouterFlavors
}>()

const tabs = computed(() => [
  ...props.routerFlavors.traditional
    ? [{
      hash: RouterFlavor.TRADITIONAL,
      title: 'Traditional',
    }]
    : [],
  ...props.routerFlavors.expressions
    ? [{
      hash: RouterFlavor.EXPRESSIONS,
      title: 'Expressions',
    }]
    : [],
])
</script>
