import type { AdminStats, User } from '@/types'
import api from './api'

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const response = await api.get<AdminStats>('/admin/stats')
    return response.data
  },

  async getUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/admin/users')
    return response.data
  },

  async updateUserRole(userId: string, role: string): Promise<User> {
    const response = await api.put<User>(`/admin/users/${userId}/role`, { role })
    return response.data
  },
}
