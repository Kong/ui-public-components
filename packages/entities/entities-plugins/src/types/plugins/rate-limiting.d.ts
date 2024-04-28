import type { Field } from '../../types/plugins/shared'

export interface RateLimitingFormSchema {
  'config-strategy'?: Field,
  'config-consumer_groups': Field,
}
