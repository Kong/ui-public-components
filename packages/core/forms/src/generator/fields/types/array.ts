import type { FieldSchema } from '../../types'

export type ArrayFieldAddItemFunc = (model: Record<string, any>, index?: number) => any
export type ArrayFieldUpdateItemFunc = (model: Record<string, any>, value: any, index: number) => void
export type ArrayFieldRemoveItemFunc = (model: Record<string, any>, index: number) => void

export interface ArrayFieldSchema extends FieldSchema {
  type: 'array'
  containerComponent?: string
  items?: FieldSchema
  itemWrapperFieldType?: string
  itemFuncs?: {
    add?: ArrayFieldAddItemFunc
    update?: ArrayFieldUpdateItemFunc
    remove?: ArrayFieldRemoveItemFunc
  }
  arrayWrapper?: string
  arrayWrapperProps?: Record<string, any>

  /**
   * Whether to hide the "Add Item" button.
   * Default to false.
   */
  hideAddItemButton?: boolean
  set?: (model: Record<string, any>, value: any, index: number) => void
}

export interface ArrayFieldItemFieldProps {
  parentArray: {
    index: number
    size: number
  }
}
