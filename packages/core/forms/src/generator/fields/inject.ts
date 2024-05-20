import type { AxiosRequestConfig, AxiosResponse } from 'axios'

export interface FormAPIClient {
  getOne: (entityType: string, entityId: string) => Promise<AxiosResponse>
  getAll: (entityType: string, params: AxiosRequestConfig['params']) => Promise<AxiosResponse>
}
