<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import draggable from 'vuedraggable'
import type { Idea, IdeaStatus } from '@/types'

const props = defineProps<{
  status: IdeaStatus
  ideas: Idea[]
  draggable: boolean
}>()

const emit = defineEmits<{
  (e: 'status-change', ideaId: string, newStatus: IdeaStatus): void
}>()

const localIdeas = ref<Idea[]>([...props.ideas])

watch(
  () => props.ideas,
  (val) => {
    localIdeas.value = [...val]
  },
  { deep: true },
)

const statusLabel: Record<IdeaStatus, string> = {
  idea: 'Pendente',
  evaluation: 'Avaliação',
  development: 'Desenvolvimento',
  completed: 'Concluída',
  archived: 'Arquivada',
}

const dotColor: Record<IdeaStatus, string> = {
  idea: 'bg-blue-400',
  evaluation: 'bg-yellow-400',
  development: 'bg-purple-400',
  completed: 'bg-green-400',
  archived: 'bg-gray-400',
}

const headerColor: Record<IdeaStatus, string> = {
  idea: 'text-blue-700',
  evaluation: 'text-yellow-700',
  development: 'text-purple-700',
  completed: 'text-green-700',
  archived: 'text-gray-600',
}

function handleChange(event: { added?: { element: Idea; newIndex: number } }) {
  if (event.added) {
    emit('status-change', event.added.element.id, props.status)
  }
}
</script>

<template>
  <div class="bg-gray-50 rounded-xl p-3 min-w-48 flex-1">
    <!-- Column header -->
    <div class="flex items-center justify-between mb-3 px-1">
      <div class="flex items-center gap-2">
        <span :class="['w-2 h-2 rounded-full shrink-0', dotColor[status]]" />
        <span :class="['text-sm font-semibold', headerColor[status]]">
          {{ statusLabel[status] }}
        </span>
      </div>
      <span class="text-xs font-medium text-gray-400 bg-white border border-gray-200 rounded-full px-2 py-0.5">
        {{ ideas.length }}
      </span>
    </div>

    <!-- Cards -->
    <draggable
      :list="localIdeas"
      :disabled="!draggable"
      item-key="id"
      group="ideas"
      @change="handleChange"
    >
      <template #item="{ element }">
        <div
          class="bg-white rounded-lg p-3 mb-2 shadow-sm border border-gray-100 group"
          :class="draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'"
        >
          <p class="text-sm font-medium text-gray-900 line-clamp-2">{{ element.title }}</p>
          <div class="flex items-center justify-between mt-2">
            <span class="text-xs text-gray-400 truncate mr-2">{{ element.author?.name ?? 'Autor' }}</span>
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-xs text-gray-400 flex items-center gap-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                {{ element.votes_count }}
              </span>
              <RouterLink
                :to="{ name: 'IdeaDetail', params: { id: element.id } }"
                title="Ver detalhes"
                class="inline-flex items-center justify-center rounded border border-gray-200 bg-white p-1 text-gray-500 hover:border-brand-400 hover:text-brand-600 transition"
                @click.stop
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
              </RouterLink>
            </div>
          </div>
        </div>
      </template>
    </draggable>

    <!-- Empty state -->
    <div v-if="localIdeas.length === 0" class="text-center py-6 text-xs text-gray-300">
      Nenhuma ideia
    </div>
  </div>
</template>
