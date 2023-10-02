import type { RawAxiosRequestHeaders, AxiosHeaders } from 'axios'

/** Shared config properties for all app entities */
interface BaseAppConfig {
  /** Base URL for API requests */
  apiBaseUrl: string
  /** App name. One of 'konnect' | 'kongManager' */
  app: 'konnect' | 'kongManager'
  /** Additional headers to send with all Axios requests */
  requestHeaders?: RawAxiosRequestHeaders | AxiosHeaders
}

/** Base config properties for Konnect. All entity configs should extend this interface for the app. */
export interface KonnectConfig extends BaseAppConfig {
  /** App name. 'konnect' */
  app: 'konnect'
  /** The control plane id */
  controlPlaneId: string
  /** Config card format */
  jsonYamlEnabled?: boolean
}

/** Base config properties for Kong Manager. All entity configs should extend this interface for the app. */
export interface KongManagerConfig extends BaseAppConfig {
  /** App name. 'kongManager' */
  app: 'kongManager'
  /** Workspace name */
  workspace: string
  /** Gateway instance info, used in Canopy to check if a feature is supported */
  gatewayInfo?: {
    edition: 'enterprise' | 'community'
    version: string
  }
}
