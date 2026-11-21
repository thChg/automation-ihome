import { apiClient } from './client'
import { apiEndpoints } from './endpoints'

export type SessionUser = {
  id: number
  email: string
  role: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  user: SessionUser
}

export const authApi = {
  login(payload: LoginPayload) {
    return apiClient.post<LoginResponse>(apiEndpoints.auth.login, payload)
  },
  me() {
    return apiClient.get<SessionUser>(apiEndpoints.auth.me)
  },
  logout() {
    return apiClient.post(apiEndpoints.auth.logout)
  },
}
