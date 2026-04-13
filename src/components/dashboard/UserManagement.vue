<script setup lang="ts">
import { ref } from 'vue'
import type { Role, User } from '@/types'
import { useAdminStore } from '@/stores/admin'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const props = defineProps<{
  users: User[]
}>()

const adminStore = useAdminStore()
const authStore = useAuthStore()
const toast = useToast()

const updating = ref<string | null>(null)

const roleOptions: { value: Role; label: string }[] = [
  { value: 'user', label: 'Usuário' },
  { value: 'developer', label: 'Desenvolvedor' },
  { value: 'admin', label: 'Admin' },
]

function roleLabelOf(role: Role): string {
  return roleOptions.find((r) => r.value === role)?.label ?? role
}

function isSelf(user: User): boolean {
  return user.id === authStore.user?.id
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

async function onRoleChange(user: User, event: Event) {
  const newRole = (event.target as HTMLSelectElement).value as Role

  if (newRole === user.role) return

  const confirmed = window.confirm(
    `Alterar role de "${user.name}" para "${roleLabelOf(newRole)}"?`,
  )

  if (!confirmed) {
    // Reset the select to the original value
    ;(event.target as HTMLSelectElement).value = user.role
    return
  }

  updating.value = user.id
  try {
    await adminStore.updateUserRole(user.id, newRole)
    toast.success(`Role de "${user.name}" atualizado para "${roleLabelOf(newRole)}".`)
  } catch (err: unknown) {
    const e = err as Record<string, unknown>
    const data = (e['response'] as Record<string, unknown>)?.['data']
    const detail = (data as Record<string, unknown>)?.['detail']
    const message = typeof detail === 'string' ? detail : 'Erro ao atualizar role.'
    toast.error(message)
    // Reset select on error
    ;(event.target as HTMLSelectElement).value = user.role
  } finally {
    updating.value = null
  }
}
</script>

<template>
  <div>
    <!-- Loading overlay indicator in header -->
    <div
      v-if="adminStore.loadingUsers"
      class="px-4 py-3 text-sm text-gray-500 border-b border-gray-100 flex items-center gap-2"
    >
      <svg class="animate-spin h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      Carregando usuários...
    </div>

    <!-- Error -->
    <div v-if="adminStore.error" class="px-4 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100">
      {{ adminStore.error }}
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <th class="text-left px-4 py-3 font-medium">Nome</th>
            <th class="text-left px-4 py-3 font-medium">E-mail</th>
            <th class="text-left px-4 py-3 font-medium">Role</th>
            <th class="text-left px-4 py-3 font-medium hidden md:table-cell">Cadastro</th>
          </tr>
        </thead>
        <tbody>
          <!-- Empty state -->
          <tr v-if="!adminStore.loadingUsers && props.users.length === 0">
            <td colspan="4" class="px-4 py-12 text-center text-gray-400">
              <div class="text-4xl mb-2">👤</div>
              <p>Nenhum usuário encontrado.</p>
            </td>
          </tr>

          <!-- Skeleton while loading -->
          <template v-if="adminStore.loadingUsers && props.users.length === 0">
            <tr v-for="n in 4" :key="n" class="border-t border-gray-50 animate-pulse">
              <td class="px-4 py-3"><div class="h-4 bg-gray-200 rounded w-32" /></td>
              <td class="px-4 py-3"><div class="h-4 bg-gray-200 rounded w-48" /></td>
              <td class="px-4 py-3"><div class="h-8 bg-gray-200 rounded w-36" /></td>
              <td class="px-4 py-3 hidden md:table-cell"><div class="h-4 bg-gray-200 rounded w-20" /></td>
            </tr>
          </template>

          <!-- Data rows -->
          <tr
            v-for="user in props.users"
            :key="user.id"
            class="border-t border-gray-50 hover:bg-gray-50 transition-colors"
            :class="{ 'opacity-60': updating === user.id }"
          >
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <img
                  v-if="user.avatar_url"
                  :src="user.avatar_url"
                  :alt="user.name"
                  class="h-7 w-7 rounded-full object-cover"
                />
                <div
                  v-else
                  class="h-7 w-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold uppercase"
                >
                  {{ user.name.charAt(0) }}
                </div>
                <span class="font-medium text-gray-900">{{ user.name }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-gray-600">{{ user.email }}</td>
            <td class="px-4 py-3">
              <div v-if="isSelf(user)" class="relative group inline-block">
                <select
                  :value="user.role"
                  disabled
                  class="rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-sm text-gray-400 cursor-not-allowed"
                >
                  <option v-for="opt in roleOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
                <div
                  class="absolute bottom-full left-0 mb-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10"
                >
                  Você não pode alterar seu próprio role
                </div>
              </div>
              <div v-else class="relative">
                <select
                  :value="user.role"
                  :disabled="updating === user.id"
                  class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60 disabled:cursor-not-allowed"
                  @change="onRoleChange(user, $event)"
                >
                  <option v-for="opt in roleOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
            </td>
            <td class="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">
              {{ formatDate(user.created_at) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
