<script setup lang="ts">
import { computed } from 'vue'
import type { Idea, IdeaStatus } from '@/types'
import { useIdeasStore } from '@/stores/ideas'
import { useAuthStore } from '@/stores/auth'
import { ideaService } from '@/services/ideaService'
import KanbanColumn from './KanbanColumn.vue'

const props = withDefaults(defineProps<{ ideas?: Idea[] }>(), { ideas: undefined })

const ideasStore = useIdeasStore()
const authStore = useAuthStore()

const statuses: IdeaStatus[] = ['idea', 'evaluation', 'development', 'completed', 'archived']

// Use the prop when provided, otherwise fall back to the store
const sourceIdeas = computed<Idea[]>(() => props.ideas ?? ideasStore.ideas)

const ideasByStatus = computed(() => {
  const map: Partial<Record<IdeaStatus, Idea[]>> = {}
  for (const status of statuses) {
    map[status] = sourceIdeas.value.filter((i) => i.status === status)
  }
  return map as Record<IdeaStatus, Idea[]>
})

const canDrag = computed(() => authStore.isDeveloper)

async function handleStatusChange(ideaId: string, newStatus: IdeaStatus): Promise<void> {
  // Only developer or admin can change status
  if (!authStore.isDeveloper && !authStore.isAdmin) return
  const idea = sourceIdeas.value.find((i) => i.id === ideaId)
  if (!idea || idea.status === newStatus) return

  try {
    const updated = await ideaService.updateIdea(ideaId, { status: newStatus })

    if (props.ideas !== undefined) {
      // Mutate the local prop array in place so KanbanView reacts
      const idx = props.ideas.findIndex((i) => i.id === ideaId)
      if (idx !== -1) props.ideas[idx] = updated
    } else {
      // Update via store
      const idx = ideasStore.ideas.findIndex((i) => i.id === ideaId)
      if (idx !== -1) {
        ideasStore.ideas[idx] = updated
      }
    }
  } catch {
    // Revert on failure by refetching
    if (props.ideas === undefined) {
      await ideasStore.fetchIdeas()
    }
  }
}
</script>

<template>
  <div class="flex gap-4 overflow-x-auto pb-4">
    <KanbanColumn
      v-for="status in statuses"
      :key="status"
      :status="status"
      :ideas="ideasByStatus[status] ?? []"
      :draggable="canDrag"
      @status-change="handleStatusChange"
    />
  </div>
</template>
