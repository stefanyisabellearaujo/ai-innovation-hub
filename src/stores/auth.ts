import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { LoginCredentials, RegisterData, Role, User } from '@/types'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const role = computed<Role | null>(() => user.value?.role ?? null)
  const isAdmin = computed(() => role.value === 'admin')
  const isDeveloper = computed(() => role.value === 'developer')
  const isUser = computed(() => role.value === 'user')

  async function login(credentials: LoginCredentials): Promise<void> {
    const response = await authService.login(credentials)
    _setAuth(response.access_token, response.user)
  }

  async function register(payload: RegisterData): Promise<void> {
    const response = await authService.register(payload)
    _setAuth(response.access_token, response.user)
  }

  async function checkAuth(): Promise<void> {
    if (!token.value) return
    try {
      const me = await authService.getMe()
      user.value = me
    } catch {
      logout()
    }
  }

  function logout(): void {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  function _setAuth(newToken: string, newUser: User): void {
    token.value = newToken
    user.value = newUser
    localStorage.setItem('token', newToken)
  }

  return {
    user,
    token,
    isAuthenticated,
    role,
    isAdmin,
    isDeveloper,
    isUser,
    login,
    register,
    logout,
    checkAuth,
  }
})
