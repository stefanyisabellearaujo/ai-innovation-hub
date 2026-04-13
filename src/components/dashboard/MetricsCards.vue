<script setup lang="ts">
import type { AdminStats } from '@/types'

const props = defineProps<{
  stats: AdminStats
}>()

const cards = [
  {
    icon: '💡',
    label: 'Total de Ideias',
    getValue: () => props.stats.total_ideas,
    unit: 'ideias',
    colorClass: 'text-brand-600',
  },
  {
    icon: '👥',
    label: 'Colaboradores Ativos',
    getValue: () => props.stats.active_collaborators,
    unit: 'ativos',
    colorClass: 'text-blue-600',
  },
  {
    icon: '✅',
    label: 'Concluídas',
    getValue: () => props.stats.ideas_by_status?.completed ?? 0,
    unit: 'ideias',
    colorClass: 'text-green-600',
  },
  {
    icon: '🔧',
    label: 'Em Desenvolvimento',
    getValue: () => props.stats.ideas_by_status?.development ?? 0,
    unit: 'ideias',
    colorClass: 'text-purple-600',
  },
]
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div
      v-for="card in cards"
      :key="card.label"
      class="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex items-start gap-4"
    >
      <div class="text-3xl leading-none select-none">{{ card.icon }}</div>
      <div>
        <p class="text-sm text-gray-500">{{ card.label }}</p>
        <p class="text-3xl font-bold mt-0.5" :class="card.colorClass">
          {{ card.getValue() }}
        </p>
        <p class="text-xs text-gray-400 mt-0.5">{{ card.unit }}</p>
      </div>
    </div>
  </div>
</template>
