import type { Field, ItemsSchema } from '../../types/plugins/shared'

type FieldForKeyValuePairs = Field & {
  newElementButtonLabelClasses?: string
  newElementButtonLabel?: string
  keyInputPlaceholder?: string
  valueInputPlaceholder?: string
}

type ItemsSchemaForKeyValuePairs = Omit<ItemsSchema, 'schema'> & {
  schema: {
    fields: FieldForKeyValuePairs[]
  }
}

export interface RouteByHeaderFormSchema {
  'config-rules': {
    type: string
    showRemoveButton: boolean
    newElementButtonLabelClasses: string
    itemContainerComponent: string
    fieldClasses: string

    newElementButtonLabel: string
    items: ItemsSchemaForKeyValuePairs
  }
}
