<template>
  <div class="selection-group">
    <!-- Radio button -->
    <div class="form-group">
      <div class="radio-group">
        <div
          v-for="(option, i) in schema.fields"
          :key="i"
          class="option-group"
        >
          <label
            class="k-label"
            :class="`${option.label}-check`"
          >
            <input
              v-model="checkedGroup"
              class="k-input"
              type="radio"
              :value="i"
            >
            {{ option.label }}
            <div class="control-help">{{ option.description }}</div>
          </label>
        </div>
      </div>

      <div
        v-for="(option, i) in schema.fields"
        :key="i"
        class="option-group"
      >
        <!-- Selected Field -->
        <div
          v-show="option.fields && checkedGroup === i"
          class="option-field"
        >
          <div class="option-field-container">
            <vue-form-generator
              :model="model"
              :options="{ helpAsHtml: true }"
              :schema="{ fields: option.fields }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, toRefs, watch, type PropType } from 'vue'
import useAbstractFields from '../../../composables/useAbstractFields'
import type { SelectionGroupFieldSchema } from '../types/selection-group'

const props = defineProps({
  vfg: {
    type: Object,
    required: true,
  },
  model: {
    type: Object as PropType<Record<string, any>>,
    required: true,
  },
  schema: {
    type: Object as PropType<SelectionGroupFieldSchema>,
    required: true,
  },
  formOptions: {
    type: Object as PropType<Record<string, any>>,
    default: () => undefined,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  flatten: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits<{
  'model-updated': [value: any, model: string]
}>()

const propsRefs = toRefs(props)

const { value, updateModelValue, clearValidationErrors } = useAbstractFields({
  model: propsRefs.model,
  schema: props.schema,
  formOptions: props.formOptions,
})

defineExpose({
  clearValidationErrors,
})

const checkedGroup = ref<number | null>(null)
const fieldModel = ref({ ...props.model }) // keep local copy of original model
const fieldSchema = ref<string[]>([])

const updateModel = (newValue: any, model: string) => {
  value.value[model] = newValue
}

watch(checkedGroup, (newValue, oldValue) => {
  // First time trigger shouldn't need to update the form model
  if (oldValue === null) {
    fieldModel.value = { ...props.model }
    return
  }

  props.schema.fields[oldValue].fields?.forEach((field) => {
    propsRefs.model.value[field.model!] = ''
  })
  props.schema.fields[newValue!].fields?.forEach((field) => {
    propsRefs.model.value[field.model!] = fieldModel.value[field.model!]
  })
})

onMounted(() => {
  // Set checkedGroup based on model
  props.schema.fields.forEach((field, i) => {
    field.fields && field.fields.forEach((subField) => {
      if (props.model?.[subField.model!]) {
        checkedGroup.value = i
        fieldSchema.value.push(subField.model!)
      }
    })
  })

  if (checkedGroup.value === null) {
    checkedGroup.value = 0
  }
})
</script>

<style lang="scss">
.field-selectionGroup {
  > label {
    display: none;
  }
  .control-help {
    color: rgba(0,0,0,.45);
    font-weight: normal;
    margin-left: 32px;
    width: 100%;
  }
  .form-check-input {
    margin-bottom: 8px;
    margin-right: 8px;
  }
  .option-field {
    margin-top: 16px;
    .form-group {
      margin-bottom: 16px;
    }
  }

  .k-label {
    display: block;
  }
}
</style>

<style lang="scss" scoped>
.selection-group {
  width: 100%;

  .form-group,
  .option-field-container {
    margin-bottom: 0;
  }

  .form-group {
    .radio-group {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: $kui-space-80
    }
  }
}
</style>
