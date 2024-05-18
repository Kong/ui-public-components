export const ArrayStringFieldSchema = {
  type: 'array',
  valueType: 'string',
  valueArrayType: 'array',
  itemContainerComponent: 'array-item',
  fieldClasses: 'kong-form-array-field',
  fieldItemsClasses: 'kong-form-array-field-item',
  inputAttributes: { class: 'form-control', style: { minWidth: '200px' } },
  validator: 'array',
  styleClasses: 'kong-form-field-wrapper',
  newElementButtonLabel: '+ Add',
  newElementButtonLabelClasses: 'kong-form-new-element-button-label',
}
