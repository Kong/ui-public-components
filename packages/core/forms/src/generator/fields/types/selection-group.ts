import type { FieldSchema } from '../../types'

export interface SelectionGroupItem {
  label: string
  description: string
  fields?: FieldSchema[];
}

export interface SelectionGroupFieldSchema extends FieldSchema {
  type: 'selection-group';
  fields: SelectionGroupItem[];
}
