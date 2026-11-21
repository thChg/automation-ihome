import { apiClient } from './client'
import { apiEndpoints } from './endpoints'

export type HealthResponse = {
  status: 'ok' | string
}

export const healthApi = {
  get() {
    return apiClient.get<HealthResponse>(apiEndpoints.health)
  },
}
