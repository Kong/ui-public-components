import type { Field } from '../../types/plugins/shared'

export interface StatsDFormSchema {
  'config-metrics': {
    type: string
    showRemoveButton: boolean
    newElementButtonLabelClasses: string
    itemContainerComponent: string
    fieldClasses: string

    items: {
      type: string,
      default: Function,
      schema: {
        fields: Field[]
      }
    }
  }
}
