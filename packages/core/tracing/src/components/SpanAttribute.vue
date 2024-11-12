<template>
  <ConfigCardItem
    :item="{
      type: ConfigurationSchemaType.Text,
      key: attribute.key,
      label: attribute.key,
      value: formattedValue,
    }"
  >
    <template #instance_id="{ rowValue }">
      <EntityLink
        allow-copy
        :entity-link-data="item.entity"
        :external-link="generateEntityURL('service', rowValue)"
        new-window
      />
    </template>
  </ConfigCardItem>
</template>

<script setup lang="tsx">
import { ConfigCardItem, ConfigurationSchemaType } from '@kong-ui-public/entities-shared'
import '@kong-ui-public/entities-shared/dist/style.css'
import { computed, ref, watch, type PropType } from 'vue'
import type { KeyValue, Span } from '../types'

const props = defineProps({
  span: {
    type: Object as PropType<Span>,
    required: true,
  },
  attribute: {
    type: Object as PropType<KeyValue>,
    required: true,
  },
  generateEntityURL: {
    type: Function as PropType<(entity: string, entityId: string) => string>,
    required: false,
    default: undefined,
  },
})

const entity = ref(undefined)

const formattedValue = computed(() => {
  if (props.attribute.value.stringValue !== undefined) {
    return props.attribute.value.stringValue
  }

  if (props.attribute.value.intValue !== undefined) {
    return `${props.attribute.value.intValue}`
  }

  if (props.attribute.value.doubleValue !== undefined) {
    return `${props.attribute.value.doubleValue}`
  }

  if (props.attribute.value.boolValue !== undefined) {
    return `${props.attribute.value.boolValue}`
  }

  // Unsupported type
  return `${JSON.stringify(props.attribute.value)}`
})

watch(() => props.attribute, () => {
  if (props.attribute.value.stringValue !== undefined) {
    entity.value = {
      id: props.attribute.value.stringValue,
      label: props.attribute.value.stringValue,
      deleted: false,
    }
  }
})
</script>

<style lang="scss" scoped>
</style>
