import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AdminStats, User } from '@/types'
import { adminService } from '@/services/adminService'

function extractMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null) {
    const e = err as Record<string, unknown>
    const data = (e['response'] as Record<string, unknown>)?.['data']
    if (typeof data === 'object' && data !== null) {
      const d = data as Record<string, unknown>
      if (typeof d['detail'] === 'string') return d['detail']
    }
  }
  return fallback
}

export const useAdminStore = defineStore('admin', () => {
  const stats = ref<AdminStats | null>(null)
  const users = ref<User[]>([])
  const loadingStats = ref(false)
  const loadingUsers = ref(false)
  const error = ref<string | null>(null)

  async function fetchStats(): Promise<void> {
    loadingStats.value = true
    error.value = null
    try {
      stats.value = await adminService.getStats()
    } catch (err: unknown) {
      error.value = extractMessage(err, 'Erro ao carregar estatísticas.')
    } finally {
      loadingStats.value = false
    }
  }

  async function fetchUsers(): Promise<void> {
    loadingUsers.value = true
    error.value = null
    try {
      users.value = await adminService.getUsers()
    } catch (err: unknown) {
      error.value = extractMessage(err, 'Erro ao carregar usuários.')
    } finally {
      loadingUsers.value = false
    }
  }

  async function updateUserRole(userId: string, role: string): Promise<void> {
    await adminService.updateUserRole(userId, role)
    await fetchUsers()
  }

  return {
    stats,
    users,
    loadingStats,
    loadingUsers,
    error,
    fetchStats,
    fetchUsers,
    updateUserRole,
  }
})
