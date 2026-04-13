<script setup lang="ts">
import { computed } from 'vue'
import type { RankingEntry } from '@/types'

const props = defineProps<{
  developers: RankingEntry[]
}>()

const first = computed(() => props.developers[0] ?? null)
const second = computed(() => props.developers[1] ?? null)
const third = computed(() => props.developers[2] ?? null)

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}
</script>

<template>
  <div v-if="developers.length >= 1" class="flex items-end justify-center gap-4">
    <!-- 2nd place -->
    <div
      v-if="second"
      class="flex flex-col items-center flex-1 max-w-48 border-2 border-gray-300 bg-gray-50 rounded-xl p-4 pb-6 shadow-sm"
    >
      <span class="text-2xl mb-1">🥈</span>
      <div class="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold bg-gray-100 text-gray-600 mb-2">
        {{ initials(second.name) }}
      </div>
      <p class="text-sm font-semibold text-gray-800 text-center line-clamp-2">{{ second.name }}</p>
      <p class="text-xs text-gray-500 mt-1">{{ second.completed_count }} concluídas</p>
    </div>
    <div v-else class="flex-1 max-w-48" />

    <!-- 1st place (taller) -->
    <div
      class="flex flex-col items-center flex-1 max-w-56 border-2 border-yellow-400 bg-yellow-50 rounded-xl p-4 pb-8 shadow-md shadow-yellow-100 -mb-2"
    >
      <span class="text-3xl mb-1">🥇</span>
      <div class="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold bg-yellow-100 text-yellow-700 mb-2">
        {{ initials(first!.name) }}
      </div>
      <p class="text-sm font-semibold text-gray-800 text-center line-clamp-2">{{ first!.name }}</p>
      <p class="text-xs text-gray-500 mt-1">{{ first!.completed_count }} concluídas</p>
    </div>

    <!-- 3rd place -->
    <div
      v-if="third"
      class="flex flex-col items-center flex-1 max-w-48 border-2 border-orange-300 bg-orange-50 rounded-xl p-4 pb-6 shadow-sm"
    >
      <span class="text-2xl mb-1">🥉</span>
      <div class="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold bg-orange-100 text-orange-600 mb-2">
        {{ initials(third.name) }}
      </div>
      <p class="text-sm font-semibold text-gray-800 text-center line-clamp-2">{{ third.name }}</p>
      <p class="text-xs text-gray-500 mt-1">{{ third.completed_count }} concluídas</p>
    </div>
    <div v-else class="flex-1 max-w-48" />
  </div>
</template>
