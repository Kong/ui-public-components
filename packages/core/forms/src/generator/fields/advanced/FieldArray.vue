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
      :key="`${keyPrefix}-${index}`"
      :class="schema.fieldItemsClasses"
    >
      <component
        :is="schema.itemContainerComponent"
        v-if="schema.items && schema.itemContainerComponent"
        :array-info="{ index, size: value.length }"
        :form-model="model"
        :model="item"
        :schema="generateSchema(value, schema.items, index)"
        @add-item="() => addItem(index)"
        @remove-item="() => removeItem(index)"
      >
        <component
          :is="getFieldType(schema.items)"
          :array-info="{ index, size: value.length }"
          :array-size="value.length"
          :form-model="model"
          :form-options="formOptions"
          :model="item"
          :schema="generateSchema(value, schema.items, index)"
        />
      </component>
      <component
        :is="getFieldType(schema.items)"
        v-else-if="schema.items"
        :array-info="{ index, size: value.length }"
        :array-size="value.length"
        :form-model="model"
        :form-options="formOptions"
        :model="item"
        :schema="generateSchema(value, schema.items, index)"
        @add-item="() => addItem(index)"
        @remove-item="() => removeItem(index)"
      />
      <component
        :is="schema.itemContainerComponent"
        v-else-if="schema.itemContainerComponent"
        :array-info="{ index, size: value.length }"
        :array-size="value.length"
        :data-testid="`${getFieldID(schema)}-item-${index}`"
        :form-model="model"
        :model="item"
        :schema="generateSchema(value, schema.items, index)"
        @add-item="() => addItem(index)"
        @remove-item="() => removeItem(index)"
      >
        <FieldTextArea
          v-if="schema.inputAttributes?.type === 'textarea'"
          :aria-labelledby="getLabelId(schema)"
          class="k-input"
          :form-options="formOptions"
          :model="item"
          :schema="generateSchema(value, schema.items, index)"
        />
        <input
          v-else
          v-model="value[index]"
          :aria-labelledby="getLabelId(schema)"
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
        :aria-labelledby="getLabelId(schema)"
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

<script>
/**
 * @typedef {import('../types/array').ArrayFieldAddItemFunc} ArrayFieldAddItemFunc
 * @typedef {import('../types/array').ArrayFieldUpdateItemFunc} ArrayFieldUpdateItemFunc
 * @typedef {import('../types/array').ArrayFieldRemoveItemFunc} ArrayFieldRemoveItemFunc
 */

import { TrashIcon } from '@kong/icons'
import cloneDeep from 'lodash-es/cloneDeep'
import objGet from 'lodash-es/get'
import abstractField from '../abstractField'
import FieldInput from '../core/FieldInput.vue'
import FieldSelect from '../core/fieldSelect.vue'
import FieldTextArea from '../core/fieldTextArea.vue'
import FieldArrayCardContainer from './FieldArrayCardContainer.vue'
import FieldArrayItem from './FieldArrayItem.vue'
import FieldAutoSuggest from './FieldAutoSuggest.vue'
import FieldCardContainer from './FieldCardContainer.vue'
import FieldMetric from './FieldMetric.vue'
import FieldObject from './FieldObject.vue'
import FieldObjectAdvanced from './FieldObjectAdvanced.vue'
import FieldPair from './FieldPair.vue'
import FieldRadio from './FieldRadio.vue'

export default {
  name: 'FieldArray',
  components: {
    FieldArrayCardContainer,
    FieldArrayItem,
    FieldAutoSuggest,
    FieldCardContainer,
    FieldPair,
    FieldInput,
    FieldMetric,
    FieldObject,
    FieldObjectAdvanced,
    FieldRadio,
    FieldSelect,
    FieldTextArea,
    TrashIcon,
  },
  mixins: [abstractField],
  props: {
    newElementButtonLabel: {
      type: String,
      default: 'New Item',
    },
    removeElementButtonLabel: {
      type: String,
      default: 'x',
    },
  },
  data() {
    return {
      keyPrefix: Math.random().toString(36).substring(2),
    }
  },
  methods: {
    invalidateKeyPrefix() {
      this.keyPrefix = Math.random().toString(36).substring(2)
    },

    generateSchema(rootValue, schema, index) {
      // Instead of using schema directly, we make a copy to avoid schema object mutation side effects

      let copy
      if (schema) {
        copy = cloneDeep(schema)

        copy.schema?.fields?.map?.((field) => {
          field.id = `${field.id || field.model}-${index}`
          return field
        })
      }

      return {
        ...copy,
        set(model, value) {
          rootValue[index] = value
        },
        get() {
          return rootValue[index]
        },
      }
    },

    /**
     *
     * @param {number} index Optional. If provided, the new item will be inserted after the index.
     */
    addItem(index) {
      /** @type {ArrayFieldAddItemFunc} */
      const schemaAddItem = objGet(this.schema, 'itemFuncs.add')
      if (typeof schemaAddItem === 'function') {
        schemaAddItem(this.model, index)
        this.invalidateKeyPrefix()
        return
      }

      let value = this.value
      let itemsDefaultValue

      if (!value || !value.push) value = []

      if (this.schema.items && this.schema.items.default) {
        if (typeof this.schema.items.default === 'function') {
          itemsDefaultValue = this.schema.items.default()
        } else {
          itemsDefaultValue = this.schema.items.default
        }
      }

      value.push(itemsDefaultValue)

      this.value = [...value]

      this.invalidateKeyPrefix()
    },

    updateItem(value, index) {
      /** @type {ArrayFieldUpdateItemFunc} */
      const updateItem = objGet(this.schema, 'itemFuncs.update')
      if (typeof updateItem === 'function') {
        updateItem(this.model, value, index)
      }
    },

    removeItem(index) {
      /** @type {ArrayFieldRemoveItemFunc} */
      const removeItem = objGet(this.schema, 'itemFuncs.remove')
      if (typeof removeItem === 'function') {
        this.value = removeItem(this.model, index)
        this.invalidateKeyPrefix()
        return
      }

      this.value = this.value.filter((_, i) => i !== index)
      this.invalidateKeyPrefix()
    },

    getFieldType(fieldSchema) {
      return 'field-' + fieldSchema.type
    },
  },
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
