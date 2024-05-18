<template>
  <component
    :is="schema.wrapper || 'div'"
    v-if="schema"
    :id="getFieldID(schema)"
    :class="schema.fieldClasses"
    v-bind="schema.wrapperProps"
  >
    <div
      v-for="(item, index) in value"
      :key="index.toString()"
      :class="schema.fieldItemsClasses"
    >
      <component
        :is="getFieldComponent(schema.itemContainerComponent)"
        v-if="schema.items && schema.itemContainerComponent"
        :array-info="{ index, size: value.length }"
        :model="model"
        :schema="generateSchema(index)"
        @add-item="() => addItem(index)"
        @remove-item="() => removeItem(index)"
      >
        <component
          :is="getFieldComponent(schema.items.type)"
          :array-info="{ index, size: value.length }"
          :array-size="value.length"
          :form-options="formOptions"
          :model="model"
          :schema="generateSchema(index)"
          @model-updated="(value: any) => updateItem(value, index)"
        />
      </component>
      <component
        :is="getFieldComponent(schema.items.type)"
        v-else-if="schema.items"
        :array-info="{ index, size: value.length }"
        :array-size="value.length"
        :form-options="formOptions"
        :model="model"
        :schema="generateSchema(index)"
        @add-item="() => addItem(index)"
        @model-updated="(value: any) => updateItem(value, index)"
        @remove-item="() => removeItem(index)"
      />
      <component
        :is="getFieldComponent(schema.itemContainerComponent)"
        v-else-if="schema.itemContainerComponent"
        :array-info="{ index, size: value.length }"
        :array-size="value.length"
        :data-testid="`${getFieldID(schema)}-item-${index}`"
        :model="model"
        :schema="generateSchema(index)"
        @add-item="() => addItem(index)"
        @remove-item="() => removeItem(index)"
      >
        <FieldTextArea
          v-if="schema.inputAttributes?.type === 'textarea'"
          :aria-labelledby="getLabelID(schema)"
          class="k-input"
          :form-options="formOptions"
          :model="model"
          :schema="generateSchema(index)"
        />
        <input
          v-else
          v-model="value[index]"
          :aria-labelledby="getLabelID(schema)"
          v-bind="schema.inputAttributes"
          :type="schema.inputAttributes?.type || 'text'"
        >
        <input
          v-if="schema.showRemoveButton"
          v-bind="schema.removeElementButtonAttributes"
          type="button"
          :value="schema.removeElementButtonLabel || removeElementButtonLabel"
          @click="() => removeItem(index)"
        >
      </component>
      <input
        v-else
        v-bind="schema.inputAttributes"
        v-model="value[index]"
        :aria-labelledby="getLabelID(schema)"
        type="text"
      >
      <input
        v-if="schema.showRemoveButton"
        v-bind="schema.removeElementButtonAttributes"
        type="button"
        :value="schema.removeElementButtonLabel || removeElementButtonLabel"
        @click="() => removeItem(index)"
      >
    </div>
    <KButton
      v-if="!schema.hideAddItemButton"
      appearance="tertiary"
      :class="schema.newElementButtonLabelClasses"
      :data-testid="`add-${getFieldID(schema)}`"
      type="button"
      @click="addItem"
    >
      {{ schema.newElementButtonLabel || newElementButtonLabel }}
    </KButton>
  </component>
</template>

<script setup lang="ts">
import cloneDeep from 'lodash-es/cloneDeep'
import { toRefs } from 'vue'
import composables from '../../../composables'
import type { FieldSchema } from '../../types'
import FieldInput from '../core/FieldInput.vue'
import FieldSelect from '../core/fieldSelect.vue'
import FieldTextArea from '../core/fieldTextArea.vue'
import type { ArrayFieldSchema } from '../types/array'
import FieldArrayCardContainer from './FieldArrayCardContainer.vue'
import FieldArrayItem from './FieldArrayItem.vue'
import FieldAutoSuggest from './FieldAutoSuggest.vue'
import FieldCardContainer from './FieldCardContainer.vue'
import FieldMetric from './FieldMetric.vue'
import FieldObject from './FieldObject.vue'
import FieldObjectAdvanced from './FieldObjectAdvanced.vue'
import FieldPair from './FieldPair.vue'
import FieldRadio from './FieldRadio.vue'

const props = withDefaults(defineProps<{
  vfg: any
  model: Record<string, any>
  schema: ArrayFieldSchema
  formOptions?: Record<string, any>
  newElementButtonLabel: string
  removeElementButtonLabel: string
}>(), {
  newElementButtonLabel: 'New Item',
  removeElementButtonLabel: 'x',
})

const emit = defineEmits<{
  (event: 'model-updated', value: any, keyPath: string): void
}>()

const propsRefs = toRefs(props)

const { value, clearValidationErrors, getLabelID, getFieldID } = composables.useAbstractFields({
  model: propsRefs.model,
  schema: props.schema,
  formOptions: props.formOptions,
  emitModelUpdated: (data) => {
    emit('model-updated', data.value, data.modelKey)
  },
})

defineExpose({
  clearValidationErrors,
})

const generateSchema = (index: number) => {
  // Instead of using schema directly, we make a copy to avoid schema object mutation side effects

  let newItemSchema: any

  if (props.schema.items !== undefined) {
    newItemSchema = cloneDeep<FieldSchema>(props.schema.items)

    newItemSchema.schema?.fields?.map?.((field: FieldSchema) => {
      field.id = `${field.id || field.model}-${index}`
      return field
    })
  }

  if (newItemSchema === undefined) {
    newItemSchema = {}
  }

  if (typeof newItemSchema?.get !== 'function') {
    newItemSchema.get = () => value.value[index]
  }

  if (typeof newItemSchema?.set !== 'function') {
    newItemSchema.set = (_: any, newValue: any) => {
      value.value[index] = newValue
    }
  }

  return newItemSchema
}

const getFieldComponent = (fieldType: string) => {
  switch (fieldType) {
    case 'array-card-container':
      return FieldArrayCardContainer
    case 'array-item':
      return FieldArrayItem
    case 'auto-suggest':
      return FieldAutoSuggest
    case 'card-container':
      return FieldCardContainer
    case 'input':
      return FieldInput
    case 'metric':
      return FieldMetric
    case 'object':
      return FieldObject
    case 'object-advanced':
      return FieldObjectAdvanced
    case 'pair':
      return FieldPair
    case 'radio':
      return FieldRadio
    case 'select':
      return FieldSelect
    case 'text-area':
      return FieldTextArea
    default:
      console.warn('No matching field component found for field type:', fieldType)
  }
}

const addItem = (index?: number) => {
  if (typeof props.schema?.itemFuncs?.add === 'function') {
    props.schema.itemFuncs.add(props.model, index)
    return
  }

  let newValue = value.value
  let itemsDefaultValue

  if (!newValue || !newValue.push) newValue = []

  if (props.schema.items !== undefined && props.schema.items.default !== undefined) {
    if (typeof props.schema.items.default === 'function') {
      itemsDefaultValue = props.schema.items.default()
    } else {
      itemsDefaultValue = props.schema.items.default
    }
  }

  newValue.push(itemsDefaultValue)

  value.value = newValue
}

const updateItem = (newValue: any, index: number) => {
  props.schema.set?.(props.model, newValue, index)
}

const removeItem = (index: number) => {
  if (typeof props.schema.itemFuncs?.remove === 'function') {
    props.schema.itemFuncs.remove(props.model, index)
    return
  }

  value.value.splice(index, 1)
}
</script>

<style scoped lang="scss">
.field-array-item {
  display: flex;
  justify-content: space-between;

  input.form-control {
    width: 200px;
  }
}

.full-width-array-field-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: $kui-space-40;
  width: 100%;
}

.array-item-pair-wrapper {
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: $kui-space-40;
  justify-content: space-between;
  width: 100%;
}
</style>
