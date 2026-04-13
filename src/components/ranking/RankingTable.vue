<script setup lang="ts">
import type { RankingEntry } from '@/types'

defineProps<{
  developers: RankingEntry[]
}>()

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function progressPercent(entry: RankingEntry): number {
  const total = entry.completed_count + entry.in_progress_count
  if (total === 0) return 0
  return Math.round((entry.completed_count / total) * 100)
}

const rowBg: Record<number, string> = {
  1: 'bg-yellow-50',
  2: 'bg-gray-50',
  3: 'bg-orange-50',
}

function rowClass(rank: number): string {
  return rowBg[rank] ?? ''
}

const medal: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}
</script>

<template>
  <div class="bg-white rounded-xl overflow-hidden border border-gray-100">
    <table class="w-full">
      <thead>
        <tr class="bg-gray-50 text-xs uppercase text-gray-500">
          <th class="px-4 py-3 text-left font-medium">#</th>
          <th class="px-4 py-3 text-left font-medium">Desenvolvedor</th>
          <th class="px-4 py-3 text-center font-medium">Concluídas</th>
          <th class="px-4 py-3 text-center font-medium">Em Andamento</th>
          <th class="px-4 py-3 text-left font-medium w-32">Progresso</th>
        </tr>
      </thead>
      <tbody>
        <template v-if="developers.length === 0">
          <tr>
            <td colspan="5" class="px-4 py-12 text-center text-sm text-gray-400">
              Nenhum desenvolvedor encontrado.
            </td>
          </tr>
        </template>
        <template v-else>
          <tr
            v-for="dev in developers"
            :key="dev.user_id"
            :class="['border-t border-gray-50 hover:bg-gray-50 transition-colors', rowClass(dev.rank)]"
          >
            <!-- Rank -->
            <td class="px-4 py-3 text-sm font-semibold text-gray-700 whitespace-nowrap">
              <span v-if="medal[dev.rank]">{{ medal[dev.rank] }}</span>
              <span v-else class="text-gray-400">#{{ dev.rank }}</span>
            </td>

            <!-- Developer -->
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  :class="{
                    'bg-yellow-100 text-yellow-700': dev.rank === 1,
                    'bg-gray-100 text-gray-600': dev.rank === 2,
                    'bg-orange-100 text-orange-600': dev.rank === 3,
                    'bg-brand-100 text-brand-700': dev.rank > 3,
                  }"
                >
                  {{ initials(dev.name) }}
                </div>
                <span class="text-sm font-medium text-gray-900">{{ dev.name }}</span>
              </div>
            </td>

            <!-- Completed -->
            <td class="px-4 py-3 text-center text-sm text-gray-700 font-medium">
              {{ dev.completed_count }}
            </td>

            <!-- In progress -->
            <td class="px-4 py-3 text-center text-sm text-gray-500">
              {{ dev.in_progress_count }}
            </td>

            <!-- Progress -->
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-green-500 rounded-full transition-all"
                    :style="{ width: `${progressPercent(dev)}%` }"
                  />
                </div>
                <span class="text-xs text-gray-400 w-8 text-right shrink-0">{{ progressPercent(dev) }}%</span>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>
