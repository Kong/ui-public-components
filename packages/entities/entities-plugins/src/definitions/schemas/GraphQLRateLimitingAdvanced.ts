import type { GraphQLRateLimitingAdvancedFormSchema } from '../../types/plugins/graphql-rate-limiting-advanced'

export const graphqlRateLimitingAdvancedFormSchema: GraphQLRateLimitingAdvancedFormSchema = {
  'config-strategy': {
    label: 'Config.Strategy',
    type: 'select',
    default: 'cluster',
    values: ['cluster', 'redis'],
  },
}
