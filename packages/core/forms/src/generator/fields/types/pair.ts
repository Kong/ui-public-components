import type { FieldSchema } from '../../types'

export type PairFieldValue = [string, string]

export interface PairFieldSchema extends FieldSchema {
  type: 'pair';
  multipleModelFields: true
  inputAttributes?: {
    former: any
    latter: any
  }
  insertText?: {
    leading?: string
    middle?: string
    trailing?: string
  }
  formatLabel?: (index: number, pair: PairFieldValue) => string | undefined
  formatHelp?: (index: number, pair: PairFieldValue) => string | undefined
}
