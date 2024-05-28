import { type DebouncedFunc } from 'lodash-es'
import debounce from 'lodash-es/debounce'
import forEach from 'lodash-es/forEach'
import objGet from 'lodash-es/get'
import isFunction from 'lodash-es/isFunction'
import isString from 'lodash-es/isString'
import arrayUniq from 'lodash-es/uniq'
import uniqueId from 'lodash-es/uniqueId'
import { computed, ref, toRef } from 'vue'
import type { FieldSchema } from '../generator/types'
import { slugifyFormID } from '../generator/utils/schema'
import validators from '../generator/utils/validators'

/**
 * The base interface for all field components that are make use of the useAbstractFields composable.
 */
export interface AbstractFieldComponentProps<S extends FieldSchema = FieldSchema> {
  vfg: any // not sure if this is still needed
  model: Record<string, any>
  schema: S
  formOptions?: Record<string, any>
  disabled?: boolean
}

export interface UseAbstractFieldsEmits {
  emitModelUpdated?: (data: {
    value: any
    modelKey: string
  }) => void,
  emitValidated?: (data: {
    isValid: any
    errors: any[]
    field: Record<string, any>
  }) => void
}

export default function useAbstractFields<M = any>(props: AbstractFieldComponentProps, emits?: UseAbstractFieldsEmits) {
  const model = toRef(props, 'model')
  const errors = ref<string[]>([])
  const debouncedValidateFunc = ref<DebouncedFunc<(calledParent?: any) => any[]> | null>(null)

  /**
   * Get the validator function from the validators object or null if given a string key, otherwise return the original param.
   * @param validator The validator function key in the validators object
   * @returns The validator function from the validators object or null if not found
   */
  const convertValidator = (validator: any) => {
    if (isString(validator)) {
      if (validators[validator] != null) {
        return validators[validator]
      } else {
        console.warn(`'${validator}' is not a validator function!`)

        return null // caller need to handle null
      }
    }

    return validator
  }

  /**
   * The value of the field with getter/setter defined.
   * Handles formatting to/from the model (used in PUT/POST) and field (actual input element) formatted values
   */
  const value = computed<M>({
    get() {
      let val

      if (isFunction(objGet(props.schema, 'get'))) {
        val = props.schema.get!(model.value!)
      } else if (props.schema.model !== undefined) {
        val = objGet(model.value, props.schema.model)
      } // else: this field is managed externally

      return formatValueToField(val)
    },
    set(newValue): void {
      const oldValue = value.value
      newValue = formatValueToModel(newValue)

      if (isFunction(newValue)) {
        newValue(newValue, oldValue)
      } else {
        updateModelValue(newValue, oldValue)
      }
    },
  })

  /**
   * Call validation functions on the field value. Will emit validated event (if defined)
   * with validity, errors, and the field being validated.
   */
  const validate = (calledParent?: any) => {
    clearValidationErrors()

    const schemaValidator = props.schema?.validator
    const validateAsync = objGet(props.formOptions, 'validateAsync', false)
    let results: any[] = []

    if (schemaValidator && props.schema.readonly !== true && props.disabled !== true) {
      const validators = []

      if (!Array.isArray(schemaValidator)) {
        validators.push(convertValidator(schemaValidator))
      } else {
        forEach(schemaValidator, validator => {
          validators.push(convertValidator(validator))
        })
      }

      forEach(validators, validator => {
        if (validateAsync) {
          results.push(validator(value.value, props.schema, model.value))
        } else {
          const result = validator(value.value, props.schema, model.value)

          if (result && isFunction(result.then)) {
            result.then((err: any) => {
              if (err) {
                errors.value = errors.value.concat(err)
              }

              const isValid = errors.value.length === 0

              emits?.emitValidated?.({ isValid, errors: errors.value, field: props.schema })
            })
          } else if (result) {
            results = results.concat(result)
          }
        }
      })
    }

    // Call onValidated and emit validated event
    const handleErrors = (errors: any[]) => {
      let fieldErrors: any[] = []

      forEach(arrayUniq(errors), err => {
        if (Array.isArray(err) && err.length > 0) {
          fieldErrors = fieldErrors.concat(err)
        } else if (isString(err)) {
          fieldErrors.push(err)
        }
      })

      if (isFunction(props.schema?.onValidated)) {
        props.schema.onValidated(model.value, fieldErrors, props.schema)
      }

      if (!calledParent) {
        const isValid = fieldErrors.length === 0

        emits?.emitValidated?.({ isValid, errors: fieldErrors, field: props.schema })
      }

      errors = fieldErrors

      return fieldErrors
    }

    if (!validateAsync) {
      return handleErrors(results)
    }

    return Promise.all(results).then(handleErrors)
  }

  const debouncedValidate = () => {
    if (!isFunction(debouncedValidateFunc.value)) {
      debouncedValidateFunc.value = debounce(
        validate,
        objGet(props.schema, 'validateDebounceTime', objGet(props.formOptions, 'validateDebounceTime', 500)),
      )
    } else {
      debouncedValidateFunc.value()
    }
  }

  /**
   * This is called every time the value of an input is changed and should handle validation/emitting modelUpdated events.
   */
  const updateModelValue = (newValue: M, oldValue: M) => {
    let finalValue = newValue
    if (typeof props.schema.modelTransformer === 'function') {
      finalValue = props.schema.modelTransformer(newValue)
    }

    let changed = false
    if (isFunction(props.schema.set)) {
      props.schema.set(model.value!, finalValue)
      changed = true
    } else if (props.schema.model) {
      setModelValueByPath(props.schema.model, finalValue)
      changed = true
    } else if (props.schema.multipleModelFields) {
      changed = true
    }

    if (changed) {
      if (model.value) {
        emits?.emitModelUpdated?.({ value: finalValue, modelKey: props.schema.model! })
      }

      if (isFunction(props.schema.onChanged)) {
        props.schema.onChanged(model.value, finalValue, oldValue, props.schema)
      }

      if (objGet(props.formOptions, 'validateAfterChanged', false) === true) {
        if (objGet(props.schema, 'validateDebounceTime', objGet(props.formOptions, 'validateDebounceTime', 0)) > 0) {
          debouncedValidate()
        } else {
          validate()
        }
      }
    }
  }

  const clearValidationErrors = (): void => {
    errors.value.splice(0)
  }

  /**
   * Given an object path, set the value of the model to the given value.
   * @param path A string like 'person.name.first' describing the path to a value in an object
   * @param value The value to set the entry at the path to
   *
   * Example:
   * setModelValueByPath('person.name.first', 'John') =>
   * {
   *   person: {
   *     name: {
   *       first: 'John'
   *     }
   *   }
   * }
   */
  const setModelValueByPath = (path: string, value: any): void => {
    // convert array indexes to properties
    let pathStr = path.replace(/\[(\w+)\]/g, '.$1')

    // strip a leading dot
    pathStr = pathStr.replace(/^\./, '')

    let dataModel = model.value || {}
    let index = 0
    const arr = pathStr.split('.')
    const arrLength = arr.length

    while (index < arrLength) {
      const key = arr[index]

      if (index < arrLength - 1) {
        if (dataModel[key] !== undefined) {
          // Found parent property. Step in
          dataModel = dataModel[key]
        } else {
          // Create missing property (new level)
          dataModel[key] = {}
          dataModel = dataModel[key]
        }
      } else {
        // Set final property value
        dataModel[key] = value

        return
      }

      ++index
    }
  }

  const getFieldID = (fieldSchema: Record<string, any>, unique = false) => {
    const idPrefix = objGet(props.formOptions, 'fieldIdPrefix', '')

    return slugifyFormID(fieldSchema, idPrefix) + (unique ? '-' + uniqueId() : '')
  }

  const getLabelID = (fieldSchema: Record<string, any>) => {
    return `${getFieldID(fieldSchema)}-label`
  }

  const getFieldClasses = () => {
    return objGet(props.schema, 'fieldClasses', [])
  }

  /**
   * Placeholder functions to be overridden for specific field types.
   * We use them in the computed value for the field value, which CAN be exported.
   * TODO: check that this actually works as expected (ie. fieldSelect, fieldSwitch, etc.)
   * DO NOT EXPORT THESE FUNCTIONS
   */
  const formatValueToField = (value: any) => {
    return value
  }

  const formatValueToModel = (value: any) => {
    return value
  }

  return {
    value,
    clearValidationErrors,
    getFieldID,
    getLabelID,
    getFieldClasses,
    updateModelValue,
  }
}
