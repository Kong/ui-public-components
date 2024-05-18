import type { VFG } from '@kong-ui-public/forms'

export interface ItemsSchema {
  type: string
  default?: object
  schema: {
    fields: Array<VFG.Field | VFG.ArrayItem>
  }
}

export interface PluginBasicSchema {
  title: string
  plugin: string
  name: string
  endpoint: string
  schemaEndpoint: string
}

export interface CommonSchemaFields {
  id?: string
  overwriteDefault?: boolean
  formSchema?: Record<string, any>
}
