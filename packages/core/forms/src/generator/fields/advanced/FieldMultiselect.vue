<template>
  <KMultiselect
    :aria-labelledby="getLabelID(schema)"
    data-testid="field-multiselect"
    :items="schema.values"
    :label-attributes="{ info: schema.help }"
    :model-value="value"
    :placeholder="schema.placeholder"
    :required="schema.required || undefined"
    width="100%"
    @update:model-value="onUpdate"
  />
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import useAbstractFields, { type AbstractFieldComponentProps } from '../../../composables/useAbstractFields'

const props = defineProps<AbstractFieldComponentProps>()

const { value, updateModelValue, getLabelID, clearValidationErrors } = useAbstractFields(props)

defineExpose({
  clearValidationErrors,
})

const onUpdate = (newValue: any) => {
  updateModelValue(newValue, value)
}
</script>
