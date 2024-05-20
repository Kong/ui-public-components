export interface FieldSchema extends Record<string, any> {
  type: string
  model?: string
  label?: string
  required?: boolean
  styleClasses?: string
  values?: string[] | { id: string; name: string }[]
  id?: string
  default?: any,
  placeholder?: string,
  hint?: string,
  help?: string,
  inputType?: 'text' | 'number'
  pinned?: boolean
  get?: (model: Record<string, any>) => any
  set?: (model: Record<string, any>, value: any, ...args: any) => any
  multipleModelFields?: boolean
  modelTransformer?: <M = any>(model: M) => M
}

export type FieldGroupCollapsibleOptions = boolean | {
  title?: string
  description?: string
  nestedCollapsible?: {
    fields: any[],
    triggerLabel: {
      expand: string
      collapse: string
    }
  }
}

export interface FieldGroupSlots {
  beforeContent?: string
  emptyState?: string
}

export interface FieldGroup {
  legend?: string
  fields?: FieldSchema[]
  collapsible?: FieldGroupCollapsibleOptions
  slots?: FieldGroupSlots
}

export interface Schema extends Record<string, any> {
  fields: FieldSchema[]
}
