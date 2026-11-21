import { apiClient } from './client'
import { apiEndpoints } from './endpoints'

export type ManagedUser = {
  id: number
  email: string
  role: 'admin' | 'user'
  status: 'pending' | 'active' | 'rejected'
  approvedAt: string | null
  approvedBy: number | null
  createdAt: string
  updatedAt: string
}

export const usersApi = {
  list() {
    return apiClient.get<ManagedUser[]>(apiEndpoints.users)
  },
  approve(id: number) {
    return apiClient.patch<ManagedUser>(`${apiEndpoints.users}/${id}/approve`)
  },
  promoteAdmin(id: number) {
    return apiClient.patch<ManagedUser>(`${apiEndpoints.users}/${id}/admin`)
  },
  reject(id: number) {
    return apiClient.patch<ManagedUser>(`${apiEndpoints.users}/${id}/reject`)
  },
  remove(id: number) {
    return apiClient.delete(`${apiEndpoints.users}/${id}`)
  },
}
