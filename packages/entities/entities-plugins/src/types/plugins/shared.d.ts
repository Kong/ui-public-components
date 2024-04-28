interface Field {
  model?: string
  label: string
  type: string
  values?: string[]
  id?: string
  default?: string,
  placeholder?: string,
  hint?: string,
  help?: string,
  inputType?: 'text' | 'number'
}

interface FieldOmitWhenEmpty {
  omitWhenEmpty?: boolean
}

interface ArrayItem extends Field {
  itemContainerComponent: string
  fieldClasses?: string
  fieldItemsClasses?: string
  inputAttributes?: {
    class: string
    style: {
      minWidth: string
    }
  }
}

export interface ItemsSchema {
  type: string,
  default?: object,
  schema: {
    fields: Array<Field | ArrayItem>
  }
}

export interface PluginBasicSchema {
  title: string,
  plugin: string,
  name: string,
  endpoint: string,
  schemaEndpoint: string,
}

export interface CommonSchemaFields<S extends Record<string, any> = Record<string, any>> {
  id?: string
  mergingStrategy?: 'overwrite' | 'shallowMerge'
  formSchema?: S
}
