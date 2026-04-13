<script setup lang="ts">
import { computed } from 'vue'
import type { IdeaStatus } from '@/types'

const props = defineProps<{
  status: IdeaStatus
}>()

const colorMap: Record<IdeaStatus, string> = {
  idea: 'bg-orange-100 text-orange-700',
  evaluation: 'bg-yellow-100 text-yellow-700',
  development: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-600',
}

const labelMap: Record<IdeaStatus, string> = {
  idea: 'Pendente',
  evaluation: 'Avaliação',
  development: 'Desenvolvimento',
  completed: 'Concluída',
  archived: 'Arquivada',
}

const colorClass = computed(() => colorMap[props.status] ?? 'bg-gray-100 text-gray-600')
const label = computed(() => labelMap[props.status] ?? props.status)
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
    :class="colorClass"
  >
    {{ label }}
  </span>
</template>
