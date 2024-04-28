import type { PreFunctionFormSchema } from '../../types/plugins/pre-function'
import typedefs from './typedefs'

const initPreFunctionFormSchema: PreFunctionFormSchema = {
  'config-access': {},
  'config-body_filter': {},
  'config-header_filter': {},
  'config-certificate': {},
  'config-functions': {},
  'config-log': {},
  'config-rewrite': {},
}

export const preFunctionFormSchema: PreFunctionFormSchema = [
  'config-access',
  'config-body_filter',
  'config-header_filter',
  'config-certificate',
  'config-functions',
  'config-log',
  'config-rewrite',
].reduce((a, v) => ({
  ...a,
  [v]: typedefs.fields.arrayItems({
    newElementButtonLabel: 'Add',
  }),
}), initPreFunctionFormSchema)
