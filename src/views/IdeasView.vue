<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useIdeasStore } from '@/stores/ideas'
import { useAuthStore } from '@/stores/auth'
import { useCollaborationStore } from '@/stores/collaboration'
import { ideaService } from '@/services/ideaService'
import type { IdeaCreate } from '@/types'
import SearchBar from '@/components/common/SearchBar.vue'
import Pagination from '@/components/common/Pagination.vue'
import IdeaCard from '@/components/ideas/IdeaCard.vue'
import IdeaFiltersComponent from '@/components/ideas/IdeaFilters.vue'
import IdeaForm from '@/components/ideas/IdeaForm.vue'

const ideasStore = useIdeasStore()
const authStore = useAuthStore()
const collaborationStore = useCollaborationStore()

const showForm = ref(false)
const formError = ref<string | null>(null)
const formLoading = ref(false)
const toast = ref<string | null>(null)
const searchValue = ref(ideasStore.filters.search ?? '')

let toastTimer: ReturnType<typeof setTimeout> | null = null

onUnmounted(() => { if (toastTimer) clearTimeout(toastTimer) })

function showToast(message: string) {
  toast.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value = null
  }, 3000)
}

// Sync search input with store (debounce handled by SearchBar)
watch(searchValue, (val) => {
  ideasStore.setFilters({ search: val || undefined })
})

async function handleCreate(data: IdeaCreate) {
  formLoading.value = true
  formError.value = null
  try {
    await ideasStore.createIdea(data)
    showForm.value = false
    showToast('Ideia criada com sucesso!')
  } catch (err: unknown) {
    formError.value = extractMessage(err, 'Erro ao criar ideia. Tente novamente.')
  } finally {
    formLoading.value = false
  }
}

async function handleVote(id: string) {
  try {
    const result = await collaborationStore.toggleVote(id)
    const idx = ideasStore.ideas.findIndex((i) => i.id === id)
    if (idx !== -1) {
      ideasStore.ideas[idx] = {
        ...ideasStore.ideas[idx],
        votes_count: result.votes_count,
        has_voted: result.voted,
      }
    }
    showToast(result.voted ? 'Voto registrado!' : 'Voto removido!')
  } catch {
    showToast('Não foi possível registrar o voto.')
  }
}

async function handleDelete(id: string) {
  if (!confirm('Tem certeza que deseja excluir esta ideia?')) return
  try {
    await ideasStore.deleteIdea(id)
    showToast('Ideia excluída com sucesso!')
  } catch {
    showToast('Não foi possível excluir a ideia.')
  }
}

async function handleJoin(id: string) {
  try {
    await collaborationStore.joinIdea(id)
    // Update the specific idea in the store so the card re-renders immediately
    const updated = await ideaService.getIdea(id)
    const idx = ideasStore.ideas.findIndex((i) => i.id === id)
    if (idx !== -1) ideasStore.ideas[idx] = updated
    showToast('Você entrou como colaborador!')
  } catch (err: unknown) {
    showToast(extractMessage(err, 'Não foi possível entrar na ideia.'))
  }
}

function onPageChange(page: number) {
  ideasStore.setPage(page)
}

function onPerPageChange(perPage: number) {
  ideasStore.setFilters({ per_page: perPage })
}

onMounted(() => {
  ideasStore.fetchIdeas()
})

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
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Toast notification -->
    <Transition name="fade">
      <div
        v-if="toast"
        class="fixed top-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg"
      >
        {{ toast }}
      </div>
    </Transition>

    <!-- Header -->
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Ideias de IA</h1>
        <p class="text-sm text-gray-500 mt-0.5">Explore, contribua e vote nas ideias mais inovadoras</p>
      </div>
      <button
        v-if="!authStore.isAdmin"
        class="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition"
        @click="showForm = true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Nova Ideia
      </button>
    </div>

    <!-- Modal: Create Idea -->
    <Transition name="fade">
      <div
        v-if="showForm"
        class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
        @click.self="showForm = false"
      >
        <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-lg font-semibold text-gray-900">
              {{ formLoading ? 'Salvando...' : 'Nova Ideia' }}
            </h2>
            <button
              class="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
              :disabled="formLoading"
              @click="showForm = false"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p v-if="formError" class="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {{ formError }}
          </p>
          <IdeaForm
            @submit="(data) => handleCreate(data as IdeaCreate)"
            @cancel="showForm = false"
          />
        </div>
      </div>
    </Transition>

    <!-- Search + Filters -->
    <div class="flex flex-col gap-3">
      <SearchBar v-model="searchValue" />
      <IdeaFiltersComponent />
    </div>

    <!-- Loading skeleton -->
    <div v-if="ideasStore.loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="n in 6"
        :key="n"
        class="h-48 rounded-xl bg-gray-100 animate-pulse"
      />
    </div>

    <!-- Error state -->
    <div
      v-else-if="ideasStore.error"
      class="rounded-xl bg-red-50 border border-red-100 p-6 text-center"
    >
      <p class="text-sm text-red-600">{{ ideasStore.error }}</p>
      <button
        class="mt-3 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-100 transition"
        @click="ideasStore.fetchIdeas()"
      >
        Tentar novamente
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="ideasStore.ideas.length === 0"
      class="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center"
    >
      <span class="text-5xl mb-4">🔍</span>
      <p class="text-base font-medium text-gray-700">Nenhuma ideia encontrada.</p>
      <p v-if="ideasStore.filters.status || ideasStore.filters.search || ideasStore.filters.category" class="text-sm text-gray-500 mt-1">
        Tente ajustar ou limpar os filtros.
      </p>
    </div>

    <!-- Ideas grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <IdeaCard
        v-for="idea in ideasStore.ideas"
        :key="idea.id"
        :idea="idea"
        @vote="handleVote"
        @join="handleJoin"
        @delete="handleDelete"
      />
    </div>

    <!-- Pagination -->
    <Pagination
      :page="ideasStore.filters.page"
      :pages="ideasStore.pages"
      :total="ideasStore.total"
      :per-page="ideasStore.filters.per_page"
      @update:page="onPageChange"
      @update:per-page="onPerPageChange"
    />
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
