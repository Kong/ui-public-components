import type { ItemsSchema, CommonSchemaFields } from '../../types/plugins/shared'

export interface DatadogSchema extends CommonSchemaFields {
  'config-metrics': {
    type: string
    showRemoveButton: boolean
    newElementButtonLabelClasses: string
    itemWrapperFieldType: string
    fieldClasses: string
    items: ItemsSchema
  }
}
