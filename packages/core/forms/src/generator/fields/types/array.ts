import type { FieldSchema } from '../../types'

export type ArrayFieldAddItemFunc = (model: Record<string, any>, index?: number) => any
export type ArrayFieldUpdateItemFunc = (model: Record<string, any>, value: any, index: number) => void
export type ArrayFieldRemoveItemFunc = (model: Record<string, any>, index: number) => void

export interface ArrayFieldSchema extends FieldSchema {
  type: 'array'
  containerComponent?: string
  items?: FieldSchema
  itemContainerComponent?: string
  itemFuncs?: {
    add?: ArrayFieldAddItemFunc
    update?: ArrayFieldUpdateItemFunc
    remove?: ArrayFieldRemoveItemFunc
  }
  wrapper?: string
  wrapperProps?: Record<string, any>

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
