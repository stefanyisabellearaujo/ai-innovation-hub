<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCollaborationStore } from '@/stores/collaboration'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  ideaId: string
}>()

const collaborationStore = useCollaborationStore()
const authStore = useAuthStore()

const MAX_CHARS = 2000
const commentText = ref('')
const submitting = ref(false)
const submitError = ref<string | null>(null)

const charCount = computed(() => commentText.value.length)
const isOverLimit = computed(() => charCount.value > MAX_CHARS)
const canSubmit = computed(
  () => commentText.value.trim().length > 0 && !submitting.value && !isOverLimit.value,
)

const hasMore = computed(
  () => collaborationStore.comments.length < collaborationStore.commentsTotal,
)

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

function getInitials(name: string | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

function relativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'agora mesmo'
  if (diffMins < 60) return `há ${diffMins} min`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `há ${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'ontem'
  if (diffDays < 30) return `há ${diffDays} dias`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths === 1) return 'há 1 mês'
  if (diffMonths < 12) return `há ${diffMonths} meses`
  const diffYears = Math.floor(diffMonths / 12)
  return diffYears === 1 ? 'há 1 ano' : `há ${diffYears} anos`
}

async function handleSubmit() {
  if (!canSubmit.value) return
  submitting.value = true
  submitError.value = null
  try {
    await collaborationStore.addComment(props.ideaId, commentText.value.trim())
    commentText.value = ''
  } catch (err) {
    submitError.value = extractMessage(err, 'Erro ao enviar comentário.')
  } finally {
    submitting.value = false
  }
}

async function loadMore() {
  const nextPage = collaborationStore.commentsPage + 1
  await collaborationStore.fetchComments(props.ideaId, nextPage)
}

onMounted(() => {
  collaborationStore.fetchComments(props.ideaId, 1)
})
</script>

<template>
  <div class="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
    <!-- Section header -->
    <h2 class="text-base font-semibold text-gray-900">
      Comentários
      <span class="text-gray-400 font-normal text-sm ml-1">({{ collaborationStore.commentsTotal }})</span>
    </h2>

    <!-- Comment form (hidden for admin) -->
    <form
      v-if="!authStore.isAdmin"
      class="flex flex-col gap-2"
      @submit.prevent="handleSubmit"
    >
      <div class="relative">
        <textarea
          v-model="commentText"
          :rows="3"
          :maxlength="MAX_CHARS + 50"
          placeholder="Escreva um comentário..."
          class="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-400 transition"
          :class="{ 'border-red-300 focus:border-red-400 focus:ring-red-400': isOverLimit }"
        />
      </div>

      <!-- Char counter + submit button -->
      <div class="flex items-center justify-between gap-3">
        <span
          class="text-xs"
          :class="isOverLimit ? 'text-red-500 font-medium' : 'text-gray-400'"
        >
          {{ charCount }}/{{ MAX_CHARS }}
        </span>

        <button
          type="submit"
          :disabled="!canSubmit"
          class="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            v-if="submitting"
            class="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {{ submitting ? 'Enviando...' : 'Enviar' }}
        </button>
      </div>

      <!-- Submit error -->
      <Transition name="fade">
        <p v-if="submitError" class="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
          {{ submitError }}
        </p>
      </Transition>
    </form>

    <!-- Divider -->
    <hr class="border-gray-100" />

    <!-- Loading skeleton -->
    <div v-if="collaborationStore.loadingComments && collaborationStore.comments.length === 0" class="flex flex-col gap-4">
      <div v-for="n in 3" :key="n" class="flex items-start gap-3">
        <div class="h-8 w-8 rounded-full bg-gray-100 animate-pulse shrink-0" />
        <div class="flex-1 space-y-2">
          <div class="h-3 w-28 rounded bg-gray-100 animate-pulse" />
          <div class="h-3 w-full rounded bg-gray-100 animate-pulse" />
          <div class="h-3 w-3/4 rounded bg-gray-100 animate-pulse" />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!collaborationStore.loadingComments && collaborationStore.comments.length === 0"
      class="py-6 text-center"
    >
      <p class="text-sm text-gray-400">Sem comentários ainda. Seja o primeiro a comentar!</p>
    </div>

    <!-- Comments list -->
    <div
      v-else
      class="flex flex-col gap-5"
    >
      <article
        v-for="comment in collaborationStore.comments"
        :key="comment.id"
        class="flex items-start gap-3"
      >
        <!-- Avatar -->
        <div
          class="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-xs shrink-0 mt-0.5"
        >
          {{ getInitials(comment.user?.name) }}
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div class="flex items-baseline gap-2 flex-wrap">
            <span class="text-sm font-medium text-gray-900">
              {{ comment.user?.name ?? 'Usuário' }}
            </span>
            <span class="text-xs text-gray-400">{{ relativeDate(comment.created_at) }}</span>
          </div>
          <p class="mt-1 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
            {{ comment.content }}
          </p>
        </div>
      </article>

      <!-- Load more button -->
      <div v-if="hasMore" class="flex justify-center pt-2">
        <button
          :disabled="collaborationStore.loadingComments"
          class="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          @click="loadMore"
        >
          <svg
            v-if="collaborationStore.loadingComments"
            class="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          {{ collaborationStore.loadingComments ? 'Carregando...' : 'Carregar mais' }}
        </button>
      </div>
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
