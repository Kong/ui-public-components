<template>
  <VueFormGenerator
    :model="formModel"
    :options="formOptions"
    :schema="alwaysVisibleSchema"
    @model-updated="(value: any, model: string) => onModelUpdated(value, model)"
  />

  <KCollapse
    v-model="advancedCollapsed"
    :trigger-label="i18n.t('rla.view_advanced_fields')"
  >
    <VueFormGenerator
      :model="formModel"
      :options="formOptions"
      :schema="advancedSchema"
      @model-updated="(value: any, model: string) => onModelUpdated(value, model)"
    />
  </KCollapse>
</template>

<script lang="ts" setup>
import type { ArrayFieldSchema } from 'src/generator/fields/types/array'
import type { CardContainerFieldSchema } from 'src/generator/fields/types/card-container'
import { computed, ref } from 'vue'
import useI18n from '../composables/useI18n'
import type { PairFieldSchema } from '../generator/fields/types/pair'
import type { FieldSchema, Schema } from '../generator/types'

const { i18n } = useI18n()

const props = defineProps<{
  formSchema: Schema
  formModel: Record<string, any>
  formOptions: any
  onModelUpdated: (value: any, model: string) => void
  isEditing?: boolean
}>()

const advancedCollapsed = ref(true)

const schemaFieldMap = computed(() =>
  props.formSchema.fields.reduce<Record<string, FieldSchema>>((map, field) => {
    if (field.model !== undefined) {
      map[field.model] = field
    }

    return map
  }, {}),
)

const identifierSelectItems = computed(() => {
  return (schemaFieldMap.value['config-identifier']?.values as string[] | undefined)
    ?.map((value) => ({
      id: value,
      name: i18n.t(`rla.identifiers.${value}` as any),
    })) ?? []
})

const alwaysVisibleSchema = computed<Schema>(() => {
  return {
    fields: [
      // schemaFieldMap.value.selectionGroup,
      {
        type: 'array',
        hideAddItemButton: true,
        fieldClasses: 'full-width-array-field-wrapper',
        fieldItemsClasses: 'array-item-pair-wrapper',
        items: {
          type: 'pair',
          multipleModelFields: true,
          inputAttributes: {
            former: {
              type: 'number',
              placeholder: i18n.t('rla.request_limits.request_number'),
            },
            latter: {
              type: 'number',
              placeholder: i18n.t('rla.request_limits.time_interval'),
            },
          },
          insertText: {
            middle: i18n.t('rla.request_limits.interval_determiner'),
            trailing: i18n.t('rla.request_limits.seconds'),
          },
          default: () => (['', 0]),
          formatLabel: (index) => i18n.t('rla.request_limits.label', { index: index + 1 }),
        } as PairFieldSchema,
        wrapper: 'FieldCardContainer',
        wrapperProps: {
          title: i18n.t('rla.request_limits.title'),
          titleTooltip: i18n.t('rla.request_limits.help'),
          subtitle: i18n.t('rla.request_limits.subtitle'),
        },
        get: (model: Record<string, any>) => {
          const configLimit: (number | undefined)[] = model['config-limit']
          const configWindowSize: (number | undefined)[] = model['config-window_size']

          if (!Array.isArray(configLimit) || configLimit.length === 0) {
            model['config-limit'] = [undefined]
          }
          if (!Array.isArray(configWindowSize) || configWindowSize.length === 0) {
            model['config-window_size'] = [undefined]
          }

          return model['config-limit']
            .map((limit, index) => ([
              limit, model['config-window_size'][index]?.toString(),
            ]))
        },
        set: (model, value, index) => {
          console.log('set', model, value, index)
          model['config-limit'][index] = value[0]
          model['config-window_size'][index] = value[1]
        },
        itemFuncs: {
          add: (model, index) => {
            if (!Array.isArray(model['config-limit'])) {
              model['config-limit'] = []
            }
            if (!Array.isArray(model['config-window_size'])) {
              model['config-window_size'] = []
            }
            if (index !== undefined) {
              model['config-limit'].splice(index + 1, 0, undefined)
              model['config-window_size'].splice(index + 1, 0, undefined)
            } else {
              model['config-limit'].push(undefined)
              model['config-window_size'].push(undefined)
            }
          },
          remove(model, index) {
            model['config-limit'].splice(index, 1)
            model['config-window_size'].splice(index, 1)
          },
        },
      } as ArrayFieldSchema & CardContainerFieldSchema,
      {
        ...schemaFieldMap.value['config-identifier'],
        values: identifierSelectItems.value,
      },
      {
        label: i18n.t('rla.error_message.label'),
        type: 'pair',
        multipleModelFields: true,
        help: i18n.t('rla.error_message.help'),
        inputAttributes: {
          former: {
            placeholder: i18n.t('rla.error_message.code_placeholder'),
            class: 'input-error-code',
          },
          latter: {
            placeholder: i18n.t('rla.error_message.message_placeholder'),
          },
        },
        insertText: {
          middle: ':',
        },
        get: (model) =>
          [model['config-error_code'], model['config-error_message']],
        set: (model, [code, message]) => {
          model['config-error_code'] = Number.parseInt(code)
          model['config-error_message'] = message
        },
      } as PairFieldSchema,
    ],
  }
})

const advancedSchema = computed<Schema>(() => {
  const omittedFields = new Set([
    'selectionGroup',
    ...['identifier', 'limit', 'window_size', 'error_code', 'error_message']
      .map((field) => `config-${field}`),
  ])

  return {
    fields: props.formSchema.fields
      .filter((field) => typeof field.model === 'string' && !omittedFields.has(field.model))
      .map((field) => {
        if (field.model === 'config-redis-cluster_addresses') {
          return {
            ...field,
            hint: 'e.g. localhost:6379',
          }
        }
        return field
      }),
  }
})
</script>

<style lang="scss">
.input-error-code {
  width: 20%;
  min-width: 100px;
  max-width: 200px;
}
</style>

<style lang="scss" scoped>
.rla-form-request-limits {
  &-subtitle {
    color: $kui-color-text-neutral;
    font-weight: $kui-font-weight-regular;
  }

  :deep(.form-group) {
    margin-bottom: 0 !important;
  }
}
</style>
