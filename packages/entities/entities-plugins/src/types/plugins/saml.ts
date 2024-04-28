import type { ItemsSchema } from '../../types/plugins/shared'

export interface SAMLFormSchema {
  'config-session_redis_cluster_nodes': {
    type: string
    showRemoveButton: boolean
    newElementButtonLabelClasses: string
    itemContainerComponent: string
    fieldClasses: string

    newElementButtonLabel: string
    items: ItemsSchema
  }
}
