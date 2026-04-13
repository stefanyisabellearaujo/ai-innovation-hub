<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Idea } from '@/types'
import { ideaService } from '@/services/ideaService'
import { useAuthStore } from '@/stores/auth'
import IdeaBoard from '@/components/ideas/IdeaBoard.vue'

const authStore = useAuthStore()
const ideas = ref<Idea[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const sortByVotes = ref(false)

const sortedIdeas = computed(() =>
  sortByVotes.value
    ? [...ideas.value].sort((a, b) => b.votes_count - a.votes_count)
    : ideas.value,
)

onMounted(async () => {
  try {
    const response = await ideaService.getIdeas({ per_page: 100, page: 1 })
    ideas.value = response.items
  } catch {
    error.value = 'Não foi possível carregar as ideias.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Kanban Board</h1>
        <p class="text-gray-500 mt-1">
          {{ authStore.isDeveloper ? 'Arraste ideias para atualizar o status' : 'Visualize o progresso das ideias' }}
        </p>
      </div>

      <!-- Sort segmented control -->
      <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1 text-sm">
        <span class="text-xs text-gray-500 px-2 font-medium">Ordenar:</span>
        <button
          class="px-3 py-1.5 rounded-md font-medium transition"
          :class="!sortByVotes ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          @click="sortByVotes = false"
        >
          Padrão
        </button>
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition"
          :class="sortByVotes ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          @click="sortByVotes = true"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777z" />
          </svg>
          Mais votadas
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12 text-gray-400">Carregando...</div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-12 text-red-500">{{ error }}</div>

    <!-- Board -->
    <IdeaBoard v-else :ideas="sortedIdeas" />
  </div>
</template>
