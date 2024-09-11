import { makeFilterable } from './util'
import type { AbsoluteTimeRangeV4, ExploreFilterTypesV2, RequestFilterTypeEqualsV2, RequestFilterTypeMetricV2, RequestFilterTypeWildcardV2 } from './common'
import { type ExploreFilter } from './advanced'

// status_code and upstream_status_code are treated as metric filters
export const queryableRequestDimensions = [
  'api_product',
  'api_product_version',
  'application',
  'auth_type',
  'client_ip',
  'consumer',
  'consumer_group',
  'control_plane',
  'control_plane_group',
  'data_plane_node',
  'gateway_service',
  'header_host',
  'header_user_agent',
  'http_method',
  'iso_code',
  'request_id',
  'request_uri',
  'response_header_content_type',
  'response_source',
  'route',
  'service_port',
  'service_protocol',
  'sse',
  'status_code_grouped',
  'time',
  'upstream_uri',
  'websocket',
] as const

export type QueryableRequestDimensions = typeof queryableRequestDimensions[number]

export const filterableRequestDimensions = makeFilterable(queryableRequestDimensions)

export type FilterableRequestDimensions = typeof filterableRequestDimensions[number]

export const queryableRequestWildcardDimensions = [
  'request_uri',
  'upstream_uri',
] as const

export type QueryableRequestWildcardDimensions = typeof queryableRequestWildcardDimensions[number]

export const filterableRequestWildcardDimensions = queryableRequestWildcardDimensions

export type FilterableRequestWildcardDimensions = typeof filterableRequestWildcardDimensions[number]

export const queryableRequestMetrics = [
  'ai_count',
  'latencies_response_ms',
  'latencies_upstream_ms',
  'latencies_kong_gateway_ms',
  'response_body_size',
  'request_body_size',
  'status_code',
  'status_code_grouped',
  'upstream_status_code',
  'upstream_status_code_grouped',
] as const

export type QueryableRequestMetrics = typeof queryableRequestMetrics[number]

export const filterableRequestMetrics = makeFilterable(queryableRequestMetrics)

export type FilterableRequestMetrics = typeof filterableRequestMetrics[number]

export interface RequestInFilter {
  type: ExploreFilterTypesV2
  field: FilterableRequestDimensions | FilterableRequestWildcardDimensions | FilterableRequestMetrics
  value: (string | number)[]
}
export interface RequestEqualsFilter {
  type: RequestFilterTypeEqualsV2
  field: FilterableRequestDimensions | FilterableRequestWildcardDimensions
  value: string
}
export interface RequestMetricFilter {
  type: RequestFilterTypeMetricV2
  field: FilterableRequestMetrics
  value: number
}
export interface RequestEmptyFilter {
  type: RequestFilterTypeEqualsV2
  field: FilterableRequestDimensions | FilterableRequestWildcardDimensions | FilterableRequestMetrics
}
export interface RequestWildcardFilter {
  type: RequestFilterTypeWildcardV2
  field: FilterableRequestWildcardDimensions
  value: string
}

export type RequestFilter = ExploreFilter |
  RequestInFilter |
  RequestEqualsFilter |
  RequestMetricFilter |
  RequestEmptyFilter |
  RequestWildcardFilter

export const relativeTimeRangeValuesRequestV2 = [
  '15M',
  '1H',
  '6H',
  '12H',
  '24H',
  '7D',
] as const

export type RelativeTimeRangeValuesRequestV2 = typeof relativeTimeRangeValuesRequestV2[number]

export interface RelativeTimeRangeRequestV2 {
  type: 'relative'
  tz?: string
  time_range: RelativeTimeRangeValuesRequestV2
}

export type TimeRangeRequestV2 = AbsoluteTimeRangeV4 | RelativeTimeRangeRequestV2

export interface RequestQuery {
  filters: RequestFilter[]
  time_range: TimeRangeRequestV2
  order?: string
  offset?: number
  size?: number
  query_id?: string
  limit?: number
  classified?: boolean
}
