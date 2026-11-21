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

export type RegisterPayload = {
  email: string
  password: string
}

export type RegisterResponse = {
  id: number
  email: string
  role: 'user'
  status: 'pending'
}

export const authApi = {
  register(payload: RegisterPayload) {
    return apiClient.post<RegisterResponse>(apiEndpoints.auth.register, payload)
  },
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
