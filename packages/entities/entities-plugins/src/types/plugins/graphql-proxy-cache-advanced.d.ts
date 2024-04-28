import type { FieldOmitWhenEmpty } from './shared'

export interface GraphQLProxyCacheAdvancedFormSchema {
  'config-redis-cluster_addresses': FieldOmitWhenEmpty
  'config-redis-sentinel_addresses': FieldOmitWhenEmpty
}
