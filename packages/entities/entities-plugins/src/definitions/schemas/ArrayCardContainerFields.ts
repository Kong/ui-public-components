import type { ArrayCardContainerFieldSchema } from '../../types/plugins/array-card-container-field'

export const arrayCardContainerFieldSchema: ArrayCardContainerFieldSchema = {
  type: 'array',
  showRemoveButton: false,
  newElementButtonLabelClasses: 'kong-form-new-element-button-label',
  itemWrapperFieldType: 'array-card-container',
  fieldClasses: 'array-card-container-wrapper',
}
