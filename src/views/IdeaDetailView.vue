<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useIdeasStore } from '@/stores/ideas'
import { useAuthStore } from '@/stores/auth'
import { useCollaborationStore } from '@/stores/collaboration'
import type { IdeaStatus, IdeaUpdate } from '@/types'
import StatusBadge from '@/components/common/StatusBadge.vue'
import IdeaForm from '@/components/ideas/IdeaForm.vue'
import VoteButton from '@/components/ideas/VoteButton.vue'
import CollaboratorSection from '@/components/ideas/CollaboratorSection.vue'
import CommentSection from '@/components/ideas/CommentSection.vue'
import { aiService } from '@/services/aiService'
import type { SimilarIdea } from '@/services/aiService'

const route = useRoute()
const router = useRouter()
const ideasStore = useIdeasStore()
const authStore = useAuthStore()
const collaborationStore = useCollaborationStore()

const ideaId = computed(() => route.params.id as string)
const idea = computed(() => ideasStore.currentIdea)

const showEditForm = ref(false)
const showDeleteConfirm = ref(false)
const actionLoading = ref(false)
const toast = ref<string | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

// Similar ideas (AI)
const similarIdeas = ref<SimilarIdea[]>([])
const similarLoading = ref(false)

async function fetchSimilarIdeas() {
  if (!idea.value?.description) return
  similarLoading.value = true
  try {
    const result = await aiService.findSimilar(idea.value.description, idea.value.id)
    similarIdeas.value = result.similar_ideas.slice(0, 5)
  } catch {
    similarIdeas.value = []
  } finally {
    similarLoading.value = false
  }
}

// Role-based computed helpers
const isAuthor = computed(
  () => !!authStore.user && !!idea.value && authStore.user.id === idea.value.author_id,
)
const canChangeStatus = computed(
  () => collaborationStore.isCollaborating || authStore.isAdmin
)

const editingCategory = ref(false)
const CATEGORY_OPTIONS = [
  'Natural Language Processing',
  'Computer Vision',
  'Process Automation',
  'Data Analytics',
  'Generative AI',
  'Other',
]

const statusOptions: { label: string; value: IdeaStatus }[] = [
  { label: 'Pendente', value: 'idea' },
  { label: 'Avaliação', value: 'evaluation' },
  { label: 'Desenvolvimento', value: 'development' },
  { label: 'Concluída', value: 'completed' },
  { label: 'Arquivada', value: 'archived' },
]

const formattedDate = computed(() => {
  if (!idea.value) return ''
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(idea.value.created_at))
})

function showToast(message: string) {
  toast.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value = null
  }, 3000)
}

async function handleVote(newCount: number, voted: boolean) {
  if (!idea.value) return
  // Update currentIdea to keep the header count in sync
  ideasStore.currentIdea = {
    ...idea.value,
    votes_count: newCount,
    has_voted: voted,
  }
  showToast(voted ? 'Voto registrado!' : 'Voto removido!')
}

async function handleStatusChange(event: Event) {
  if (!idea.value) return
  const newStatus = (event.target as HTMLSelectElement).value as IdeaStatus
  try {
    await ideasStore.updateIdea(idea.value.id, { status: newStatus })
    showToast('Status atualizado com sucesso!')
  } catch {
    showToast('Erro ao atualizar status.')
  }
}

async function saveCategory(newCategory: string) {
  if (!idea.value || newCategory === idea.value.category) {
    editingCategory.value = false
    return
  }
  try {
    await ideasStore.updateIdea(idea.value.id, { category: newCategory })
    editingCategory.value = false
    showToast('Categoria atualizada!')
  } catch {
    showToast('Erro ao atualizar categoria.')
  }
}

async function handleEdit(data: IdeaUpdate) {
  if (!idea.value) return
  actionLoading.value = true
  try {
    await ideasStore.updateIdea(idea.value.id, data)
    showEditForm.value = false
    showToast('Ideia atualizada com sucesso!')
  } catch {
    showToast('Erro ao atualizar ideia.')
  } finally {
    actionLoading.value = false
  }
}

async function handleDelete() {
  if (!idea.value) return
  actionLoading.value = true
  try {
    await ideasStore.deleteIdea(idea.value.id)
    router.push({ name: 'Ideas' })
  } catch {
    showToast('Erro ao excluir ideia.')
    showDeleteConfirm.value = false
  } finally {
    actionLoading.value = false
  }
}

onMounted(() => {
  ideasStore.fetchIdea(ideaId.value)
})

watch(idea, (newIdea) => {
  if (newIdea) {
    fetchSimilarIdeas()
  }
})

onUnmounted(() => {
  collaborationStore.reset()
})
</script>

<template>
  <div class="flex flex-col gap-6 max-w-3xl mx-auto">
    <!-- Toast notification -->
    <Transition name="fade">
      <div
        v-if="toast"
        class="fixed top-4 right-4 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg"
      >
        {{ toast }}
      </div>
    </Transition>

    <!-- Back navigation -->
    <div>
      <button
        class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 transition"
        @click="router.push({ name: 'Ideas' })"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Voltar para Ideias
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="ideasStore.loading" class="flex flex-col gap-4">
      <div class="h-8 w-3/4 rounded-lg bg-gray-100 animate-pulse" />
      <div class="h-4 w-1/2 rounded-lg bg-gray-100 animate-pulse" />
      <div class="h-40 rounded-xl bg-gray-100 animate-pulse" />
    </div>

    <!-- Error state -->
    <div
      v-else-if="ideasStore.error"
      class="rounded-xl bg-red-50 border border-red-100 p-6 text-center"
    >
      <p class="text-sm text-red-600">{{ ideasStore.error }}</p>
      <button
        class="mt-3 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-100 transition"
        @click="ideasStore.fetchIdea(ideaId)"
      >
        Tentar novamente
      </button>
    </div>

    <!-- Idea not found -->
    <div
      v-else-if="!idea"
      class="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center"
    >
      <p class="text-gray-500">Ideia não encontrada.</p>
    </div>

    <!-- Main content -->
    <template v-else>
      <!-- Edit form modal -->
      <Transition name="fade">
        <div
          v-if="showEditForm"
          class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
          @click.self="showEditForm = false"
        >
          <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-lg font-semibold text-gray-900">Editar Ideia</h2>
              <button
                class="rounded-full p-1 text-gray-400 hover:bg-gray-100 transition"
                @click="showEditForm = false"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <IdeaForm
              :idea="idea"
              @submit="(data) => handleEdit(data as IdeaUpdate)"
              @cancel="showEditForm = false"
            />
          </div>
        </div>
      </Transition>

      <!-- Delete confirm dialog -->
      <Transition name="fade">
        <div
          v-if="showDeleteConfirm"
          class="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
          @click.self="showDeleteConfirm = false"
        >
          <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2 class="text-lg font-semibold text-gray-900 mb-2">Excluir ideia?</h2>
            <p class="text-sm text-gray-600 mb-6">
              Esta ação não pode ser desfeita. A ideia e todos os seus dados serão removidos
              permanentemente.
            </p>
            <div class="flex justify-end gap-3">
              <button
                class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                @click="showDeleteConfirm = false"
              >
                Cancelar
              </button>
              <button
                :disabled="actionLoading"
                class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition disabled:opacity-50"
                @click="handleDelete"
              >
                {{ actionLoading ? 'Excluindo...' : 'Excluir' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Idea header card -->
      <div class="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
        <!-- Title row -->
        <div class="flex items-start justify-between gap-4">
          <h1 class="text-2xl font-bold text-gray-900 flex-1">{{ idea.title }}</h1>
          <div class="flex items-center gap-2 shrink-0">
            <StatusBadge :status="idea.status" />
          </div>
        </div>

        <!-- Meta row: category -->
        <div class="flex flex-wrap items-center gap-2">
          <template v-if="idea.category || authStore.isAdmin">
            <!-- Admin: click to edit -->
            <div v-if="authStore.isAdmin" class="flex items-center gap-1">
              <select
                v-if="editingCategory"
                class="rounded-full border border-gray-300 bg-white px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                :value="idea.category ?? ''"
                @change="saveCategory(($event.target as HTMLSelectElement).value)"
                @blur="editingCategory = false"
              >
                <option v-for="cat in CATEGORY_OPTIONS" :key="cat" :value="cat">{{ cat }}</option>
              </select>
              <button
                v-else
                class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600 hover:bg-gray-200 transition cursor-pointer"
                title="Clique para editar a categoria"
                @click="editingCategory = true"
              >
                {{ idea.category ?? 'Sem categoria' }}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
            <!-- Non-admin: read only -->
            <span
              v-else-if="idea.category"
              class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
            >
              {{ idea.category }}
            </span>
          </template>
        </div>

        <!-- Author info -->
        <div class="flex items-center gap-3 pt-1 border-t border-gray-50">
          <div
            class="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm shrink-0"
          >
            {{ idea.author?.name?.charAt(0).toUpperCase() ?? '?' }}
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">{{ idea.author?.name ?? 'Desconhecido' }}</p>
            <p class="text-xs text-gray-500">{{ formattedDate }}</p>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex flex-wrap items-center gap-3 pt-1">
          <!-- Vote button (uses VoteButton component) -->
          <VoteButton
            :idea-id="idea.id"
            :votes-count="idea.votes_count"
            :has-voted="idea.has_voted ?? false"
            @voted="handleVote"
          />

          <!-- Status change (collaborator or admin) -->
          <select
            v-if="canChangeStatus"
            :value="idea.status"
            class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            @change="handleStatusChange"
          >
            <option
              v-for="opt in statusOptions"
              v-show="opt.value !== 'archived' || authStore.isAdmin"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>

          <!-- Author actions -->
          <template v-if="isAuthor">
            <button
              class="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              @click="showEditForm = true"
            >
              <svg
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Editar
            </button>
            <button
              class="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition"
              @click="showDeleteConfirm = true"
            >
              <svg
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Excluir
            </button>
          </template>
        </div>
      </div>

      <!-- Description card -->
      <div class="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <h2 class="text-base font-semibold text-gray-900 mb-3">Descrição</h2>
        <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {{ idea.description }}
        </p>
      </div>

      <!-- Collaborators section -->
      <CollaboratorSection :idea-id="idea.id" />

      <!-- Comments section -->
      <CommentSection :idea-id="idea.id" />

      <!-- Related Ideas section (AI) -->
      <div class="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <h2 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>🔗</span>
          Ideias Relacionadas
        </h2>

        <!-- Loading skeleton -->
        <div v-if="similarLoading" class="flex flex-col gap-2">
          <div v-for="n in 3" :key="n" class="h-14 rounded-lg bg-gray-100 animate-pulse" />
        </div>

        <!-- Results -->
        <div v-else-if="similarIdeas.length > 0" class="flex flex-col gap-2">
          <RouterLink
            v-for="item in similarIdeas"
            :key="item.idea_id"
            :to="`/ideas/${item.idea_id}`"
            class="block p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-900 truncate">{{ item.title }}</span>
              <span class="text-xs text-gray-400 ml-2 shrink-0">{{ Math.round(item.similarity_score * 100) }}% similar</span>
            </div>
            <span
              v-if="item.category"
              class="mt-1 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
            >{{ item.category }}</span>
          </RouterLink>
        </div>

        <!-- Empty state -->
        <p v-else class="text-sm text-gray-400">Nenhuma ideia relacionada encontrada.</p>
      </div>
    </template>
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
