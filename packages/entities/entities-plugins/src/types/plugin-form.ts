import type { KongManagerBaseFormConfig, KonnectBaseFormConfig } from '@kong-ui-public/entities-shared'
import type { RouteLocationRaw } from 'vue-router'
import type { EntityType } from './plugin'
import type { AIPromptDecoratorFormSchema } from './plugins/ai-prompt-decorator'
import type { AIPromptTemplateFormSchema } from './plugins/ai-prompt-template'

import type { AIRateLimitingAdvancedFormSchema } from './plugins/ai-rate-limiting-advanced'
import type { DatadogFormSchema } from './plugins/datadog-schema'
import type { GraphQLProxyCacheAdvancedFormSchema } from './plugins/graphql-proxy-cache-advanced'
import type { GraphQLRateLimitingAdvancedFormSchema } from './plugins/graphql-rate-limiting-advanced'
import type { JWTPluginFormSchema } from './plugins/jwt'
import type { KafkaFormSchema } from './plugins/kafka-schema'
import type { MockingFormSchema } from './plugins/mocking'
import type { OASValidationFormSchema } from './plugins/oas-validation'
import type { RateLimitingFormSchema } from './plugins/rate-limiting'
import type { RequestTransformerAdvancedFormSchema } from './plugins/request-transformer-advanced'
import type { RouteByHeaderFormSchema } from './plugins/route-by-header'
import type { SAMLFormSchema } from './plugins/saml'
import type { CommonSchemaFields } from './plugins/shared'
import type { StatsDFormSchema } from './plugins/stats-d'
import type { StatsDAdvancedFormSchema } from './plugins/stats-d-advanced'
import type { UpstreamTLSFormSchema } from './plugins/upstream-tls'
import type { VaultAuthFormSchema } from './plugins/vault-auth'
import type { PreFunctionFormSchema } from './plugins/pre-function'

export interface BasePluginSelectConfig {
  /** A function that returns the route for creating a plugin */
  getCreateRoute: (id: string) => RouteLocationRaw
  /** Current entity type and id for plugins for specific entity */
  entityType?: EntityType
  entityId?: string
}

export interface BasePluginFormConfig {
  /** Route to return to if canceling create a Plugin (go back to plugin selection page) */
  backRoute?: RouteLocationRaw
  /** Current entity type and id for plugins for specific entity */
  entityType?: EntityType
  entityId?: string
  /** Whether to hide the consumer group scope field. For Kong Manager OSS, this is true */
  disableConsumerGroupScope?: boolean
  /** Whether to enable grouping for required and advanced (optional) fields. Default: false */
  groupFields?: boolean
}

export interface KongManagerPluginSelectConfig extends BasePluginSelectConfig, KongManagerBaseFormConfig {}

/** Konnect Plugin form config */
export interface KonnectPluginSelectConfig extends BasePluginSelectConfig, KonnectBaseFormConfig {
  /** Route for creating a custom plugin */
  createCustomRoute?: RouteLocationRaw
  /** A function that returns the route for editing a custom plugin */
  getCustomEditRoute?: (id: string) => RouteLocationRaw
}

export interface KonnectPluginFormConfig extends BasePluginFormConfig, KonnectBaseFormConfig {}

/** Kong Manager Plugin form config */
export interface KongManagerPluginFormConfig extends BasePluginFormConfig, KongManagerBaseFormConfig {}

export interface PluginFormFields {
  enabled: boolean
  name?: string
  instance_name?: string
  protocols: string[]
  tags: string[]
  [key: string]: any
}

export interface PluginFormState {
  /** Form fields */
  fields: PluginFormFields
  /** Form readonly state (only used when saving entity details) */
  isReadonly: boolean
  /** The error message to show on the form */
  errorMessage: string
}

export type PluginFieldType = 'switch' | 'input' | 'foreign' | 'selectionGroup' | 'tag' | 'multiselect' | 'select'

export interface PluginTags {
  label: string
  name: string
  type: 'switch' | 'input' | 'foreign' | 'selectionGroup' | 'tag'
  inputType: string
  valueType: string
  valueArrayType: string
  placeholder: string
  help: string
  hint: string
}

export interface DefaultPluginsFormSchema {
  type: PluginFieldType
  default?: boolean | string[] | string
  model?: 'enabled' | 'disabled'
  label?: string
  textOn?: string
  textOff?: string
  styleClasses?: string
  inputType?: 'hidden' | 'text'
  // Will be fixed in KHCP-6469
  fields? : any
  help?: string
  tags?: PluginTags
  values?: Array<Record<string, string | number | boolean>>
  placeholder?: string
  required?: boolean
  /** Whether the field is pinned before the Plugin Configuration. FE only */
  pinned?: boolean
  // Will be fixed in KHCP-6469
  getColumnFields?: (schema: unknown) => object
}

export type PartiallyRequired<T, K extends keyof T> = { [k in K]-?: T[k] } & { [k in keyof T]: T[k] };

export type GetRequiredFieldsByContext<T extends DefaultPluginsFormSchema> = T['type'] extends 'input' ? PartiallyRequired<DefaultPluginsFormSchema, 'inputType'> : DefaultPluginsFormSchema

export type DefaultPluginsSchemaRecord = Record<string, GetRequiredFieldsByContext<DefaultPluginsFormSchema>>

/**
 * Types for schemas
 */

export interface Tags {
  label: string
  name: string
  type: string
  inputType: string
  valueType: string
  valueArrayType: string
  placeholder: string
  help: string
  hint: string
}

export interface AppRegFormSchema {
  enabled: {
    type: string
    model: string
    label: string
    textOn: string
    textOff: string
    inputType: string
    styleClasses: string
    default: boolean
  },
  name: {
    default: string
    type: string
    inputType: string
    styleClasses: string
  }
  'service-id': {
    type: string
    label: string,
    styleClasses: string
    description: string
    model: string
    entity: string
    placeholder: string
    inputValues: {
      fields: string[]
    },
    help: string
  },
  tags: Tags
}

export interface Item {
  inputAttributes?: any
  newElementButtonLabel?: string
}

interface ArrayItem {
  type: string
  itemContainerComponent: string
  fieldClasses: string
  fieldItemsClasses: string
  newElementButtonLabelClasses: string
  inputAttributes: {
    class: string
    style: {
      minWidth: string
    }
    [key: string]: any
  },
  removeElementButtonLabel: string
  styleClasses: string
  inputType: string
  valueType: string
  valueArrayType: string
}

export type ReturnArrayItem = ArrayItem & Item

export interface CustomSchemas extends Record<string, CommonSchemaFields> {
  'application-registration': CommonSchemaFields<AppRegFormSchema>
  datadog: CommonSchemaFields<DatadogFormSchema>
  'upstream-tls': CommonSchemaFields<UpstreamTLSFormSchema>
  jwt: CommonSchemaFields<JWTPluginFormSchema>
  'kafka-upstream': CommonSchemaFields<KafkaFormSchema>
  'kafka-log': CommonSchemaFields<KafkaFormSchema>
  statsd: CommonSchemaFields<StatsDFormSchema>
  'statsd-advanced': CommonSchemaFields<StatsDAdvancedFormSchema>
  mocking: CommonSchemaFields<MockingFormSchema>
  'rate-limiting': CommonSchemaFields<RateLimitingFormSchema>
  'rate-limiting-advanced': CommonSchemaFields<RateLimitingFormSchema>
  'route-by-header': CommonSchemaFields<RouteByHeaderFormSchema>
  'ai-prompt-decorator': CommonSchemaFields<AIPromptDecoratorFormSchema>
  'ai-prompt-template':CommonSchemaFields< AIPromptTemplateFormSchema>
  'ai-rate-limiting-advanced': CommonSchemaFields<AIRateLimitingAdvancedFormSchema>
  'vault-auth': CommonSchemaFields<VaultAuthFormSchema>
  'graphql-proxy-cache-advanced': CommonSchemaFields<GraphQLProxyCacheAdvancedFormSchema>
  'graphql-rate-limiting-advanced': CommonSchemaFields<GraphQLRateLimitingAdvancedFormSchema>
  'response-ratelimiting': CommonSchemaFields<RateLimitingFormSchema>
  'pre-function': CommonSchemaFields<PreFunctionFormSchema>
  'post-function': CommonSchemaFields<PreFunctionFormSchema>
  'request-transformer-advanced': CommonSchemaFields<RequestTransformerAdvancedFormSchema>
  'request-validator': CommonSchemaFields
  zipkin: CommonSchemaFields
  saml: CommonSchemaFields<SAMLFormSchema>
  'oas-validation': CommonSchemaFields<OASValidationFormSchema>
}
