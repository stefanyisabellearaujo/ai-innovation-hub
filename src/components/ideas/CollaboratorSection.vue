<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCollaborationStore } from '@/stores/collaboration'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  ideaId: string
}>()

const collaborationStore = useCollaborationStore()
const authStore = useAuthStore()

const actionLoading = ref(false)
const errorMsg = ref<string | null>(null)
const successMsg = ref<string | null>(null)
let successTimer: ReturnType<typeof setTimeout> | null = null

function showSuccess(message: string) {
  successMsg.value = message
  if (successTimer) clearTimeout(successTimer)
  successTimer = setTimeout(() => {
    successMsg.value = null
  }, 3000)
}

function extractMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null) {
    const e = err as Record<string, unknown>
    const detail = (e['response'] as Record<string, unknown> | undefined)?.['data']
    if (typeof detail === 'object' && detail !== null) {
      const d = detail as Record<string, unknown>
      if (typeof d['detail'] === 'string') return d['detail']
    }
  }
  return fallback
}

async function handleJoin() {
  actionLoading.value = true
  errorMsg.value = null
  try {
    await collaborationStore.joinIdea(props.ideaId)
    showSuccess('Você entrou como colaborador!')
  } catch (err) {
    errorMsg.value = extractMessage(err, 'Não foi possível entrar na ideia.')
  } finally {
    actionLoading.value = false
  }
}

async function handleLeave() {
  actionLoading.value = true
  errorMsg.value = null
  try {
    await collaborationStore.leaveIdea(props.ideaId)
    showSuccess('Você saiu da ideia.')
  } catch (err) {
    errorMsg.value = extractMessage(err, 'Não foi possível sair da ideia.')
  } finally {
    actionLoading.value = false
  }
}

function getInitials(name: string | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

onMounted(() => {
  collaborationStore.fetchCollaborators(props.ideaId)
})
</script>

<template>
  <div class="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
    <h2 class="text-base font-semibold text-gray-900 mb-4">Colaboradores</h2>

    <!-- Success / Error messages -->
    <Transition name="fade">
      <p v-if="successMsg" class="mb-3 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
        {{ successMsg }}
      </p>
    </Transition>
    <Transition name="fade">
      <p v-if="errorMsg" class="mb-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
        {{ errorMsg }}
      </p>
    </Transition>

    <!-- Loading state -->
    <div v-if="collaborationStore.loadingCollab" class="flex flex-col gap-3">
      <div
        v-for="n in 3"
        :key="n"
        class="flex items-center gap-3"
      >
        <div class="h-9 w-9 rounded-full bg-gray-100 animate-pulse shrink-0" />
        <div class="flex-1 space-y-1">
          <div class="h-3.5 w-32 rounded bg-gray-100 animate-pulse" />
          <div class="h-3 w-20 rounded bg-gray-100 animate-pulse" />
        </div>
      </div>
    </div>

    <!-- Collaborator list -->
    <template v-else>
      <div
        v-if="collaborationStore.collaborators.length > 0"
        class="flex flex-col divide-y divide-gray-50"
      >
        <div
          v-for="collaborator in collaborationStore.collaborators"
          :key="collaborator.id"
          class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
        >
          <!-- Avatar (initials) -->
          <div
            class="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm shrink-0"
          >
            {{ getInitials(collaborator.user?.name) }}
          </div>

          <!-- Name + role -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ collaborator.user?.name ?? 'Desenvolvedor' }}
            </p>
            <p class="text-xs text-gray-400">
              {{ collaborator.role === 'lead' ? 'Líder' : 'Colaborador' }}
            </p>
          </div>

          <!-- Lead badge -->
          <span
            v-if="collaborator.role === 'lead'"
            class="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700"
          >
            Líder
          </span>
        </div>
      </div>

      <!-- Empty state (non-developer) -->
      <p
        v-else-if="!authStore.isDeveloper"
        class="text-sm text-gray-400"
      >
        Nenhum colaborador ainda.
      </p>

      <!-- Empty state for developer (invite to join) -->
      <p
        v-else-if="collaborationStore.collaborators.length === 0 && !collaborationStore.isCollaborating"
        class="text-sm text-gray-400"
      >
        Nenhum colaborador ainda. Seja o primeiro!
      </p>
    </template>

    <!-- Action buttons (developer only) -->
    <div
      v-if="authStore.isDeveloper && !collaborationStore.loadingCollab"
      class="mt-4 pt-4 border-t border-gray-50"
    >
      <!-- Join button -->
      <button
        v-if="!collaborationStore.isCollaborating"
        :disabled="actionLoading"
        class="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        @click="handleJoin"
      >
        <svg
          v-if="actionLoading"
          class="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        {{ actionLoading ? 'Entrando...' : 'Entrar como Colaborador' }}
      </button>

      <!-- Leave button -->
      <button
        v-else
        :disabled="actionLoading"
        class="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        @click="handleLeave"
      >
        <svg
          v-if="actionLoading"
          class="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        {{ actionLoading ? 'Saindo...' : 'Sair da Ideia' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
