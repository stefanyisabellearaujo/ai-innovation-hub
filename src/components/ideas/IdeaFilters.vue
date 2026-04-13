<script setup lang="ts">
import { computed } from 'vue'
import type { IdeaCategory } from '@/types'
import { useIdeasStore } from '@/stores/ideas'

const ideasStore = useIdeasStore()

const statusChips = [
  { key: undefined,       label: 'Todas' },
  { key: 'idea',         label: 'Pendente' },
  { key: 'evaluation',   label: 'Avaliação' },
  { key: 'development',  label: 'Desenvolvimento' },
  { key: 'completed',    label: 'Concluídas' },
  { key: 'archived',     label: 'Arquivadas' },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setQuickFilter(key: string | undefined) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ideasStore.setFilters({ status: key as any })
}

const categoryOptions: { label: string; value: IdeaCategory | '' }[] = [
  { label: 'Todos', value: '' },
  { label: 'Natural Language Processing', value: 'Natural Language Processing' },
  { label: 'Computer Vision', value: 'Computer Vision' },
  { label: 'Process Automation', value: 'Process Automation' },
  { label: 'Data Analytics', value: 'Data Analytics' },
  { label: 'Generative AI', value: 'Generative AI' },
]

type SortBy = 'created_at' | 'votes_count' | 'title'

const sortOptions: { label: string; value: SortBy }[] = [
  { label: 'Mais recentes', value: 'created_at' },
  { label: 'Mais votadas', value: 'votes_count' },
  { label: 'A-Z', value: 'title' },
]

const selectedCategory = computed({
  get: () => ideasStore.filters.category ?? '',
  set: (val: IdeaCategory | '') => {
    ideasStore.setFilters({ category: val === '' ? undefined : val })
  },
})

const selectedSort = computed({
  get: () => ideasStore.filters.sort_by,
  set: (val: SortBy) => {
    const order = val === 'title' ? 'asc' : 'desc'
    ideasStore.setFilters({ sort_by: val, order })
  },
})

function clearAll() {
  ideasStore.setFilters({
    status: undefined,
    category: undefined,
    sort_by: 'created_at',
    order: 'desc',
  })
}

const hasExtraFilters = computed(
  () => !!ideasStore.filters.category || ideasStore.filters.sort_by !== 'created_at',
)
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Quick filter chips -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="chip in statusChips"
        :key="chip.key ?? 'all'"
        class="rounded-full px-3 py-1 text-xs font-medium border transition"
        :class="
          ideasStore.filters.status === chip.key
            ? 'bg-brand-600 text-white border-brand-600'
            : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-700'
        "
        @click="setQuickFilter(chip.key)"
      >
        {{ chip.label }}
      </button>
    </div>

    <!-- Detailed filters row -->
    <div class="flex flex-wrap items-end gap-3">
      <!-- Category filter -->
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
          <svg class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.553.894l-4 2A1 1 0 016 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
          </svg>
          Categoria
        </label>
        <select
          v-model="selectedCategory"
          class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <!-- Sort by -->
      <div>
        <label class="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
          <svg class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 9a1 1 0 10-2 0v4.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V9z" />
          </svg>
          Ordenar por
        </label>
        <select
          v-model="selectedSort"
          class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <!-- Clear extra filters -->
      <button
        v-if="hasExtraFilters"
        class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition"
        @click="clearAll"
      >
        Limpar filtros
      </button>
    </div>
  </div>
</template>
