<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import type { IdeaCategory, IdeaStatus } from '@/types'
import { ideaService } from '@/services/ideaService'
import StatusBadge from '@/components/common/StatusBadge.vue'
import Pagination from '@/components/common/Pagination.vue'

// ── State ──────────────────────────────────────────────────────────────────
const ideas = ref<Awaited<ReturnType<typeof ideaService.getIdeas>>['items']>([])
const total = ref(0)
const pages = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)

// ── Filters ────────────────────────────────────────────────────────────────
const page = ref(1)
const perPage = ref(10)
const search = ref('')
const statusFilter = ref<IdeaStatus | ''>('')
const categoryFilter = ref<IdeaCategory | ''>('')

const statusOptions: { value: IdeaStatus | ''; label: string }[] = [
  { value: '', label: 'Todos os status' },
  { value: 'idea', label: 'Ideia' },
  { value: 'evaluation', label: 'Avaliação' },
  { value: 'development', label: 'Desenvolvimento' },
  { value: 'completed', label: 'Concluída' },
  { value: 'archived', label: 'Arquivada' },
]

const categoryOptions: { value: IdeaCategory | ''; label: string }[] = [
  { value: '', label: 'Todas as categorias' },
  { value: 'Natural Language Processing', label: 'Processamento de Linguagem Natural' },
  { value: 'Computer Vision', label: 'Visão Computacional' },
  { value: 'Process Automation', label: 'Automação de Processos' },
  { value: 'Data Analytics', label: 'Análise de Dados' },
  { value: 'Generative AI', label: 'IA Generativa' },
  { value: 'Other', label: 'Outro' },
]

// ── Fetch ──────────────────────────────────────────────────────────────────
async function fetchIdeas() {
  loading.value = true
  error.value = null
  try {
    const response = await ideaService.getIdeas({
      page: page.value,
      per_page: perPage.value,
      sort_by: 'created_at',
      order: 'desc',
      ...(statusFilter.value ? { status: statusFilter.value } : {}),
      ...(categoryFilter.value ? { category: categoryFilter.value } : {}),
      ...(search.value ? { search: search.value } : {}),
    })
    ideas.value = response.items
    total.value = response.total
    pages.value = response.pages
  } catch (err: unknown) {
    const e = err as Record<string, unknown>
    const data = (e['response'] as Record<string, unknown>)?.['data']
    const detail = (data as Record<string, unknown>)?.['detail']
    error.value = typeof detail === 'string' ? detail : 'Erro ao carregar ideias.'
  } finally {
    loading.value = false
  }
}

// ── Watchers ───────────────────────────────────────────────────────────────
let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(search, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchIdeas()
  }, 400)
})

watch([statusFilter, categoryFilter], () => {
  page.value = 1
  fetchIdeas()
})

function onPageChange(p: number) {
  page.value = p
  fetchIdeas()
}

function onPerPageChange(pp: number) {
  perPage.value = pp
  page.value = 1
  fetchIdeas()
}

function resetFilters() {
  search.value = ''
  statusFilter.value = ''
  categoryFilter.value = ''
  page.value = 1
  perPage.value = 10
  fetchIdeas()
}

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

onMounted(fetchIdeas)
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
    <!-- Filter bar -->
    <div class="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-end">
      <div class="flex-1">
        <label class="block text-xs font-medium text-gray-500 mb-1">Buscar</label>
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por título..."
          class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      <div class="relative">
        <label class="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
          <svg class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.553.894l-4 2A1 1 0 016 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
          </svg>
          Status
        </label>
        <select
          v-model="statusFilter"
          class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      <div class="relative">
        <label class="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
          <svg class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.553.894l-4 2A1 1 0 016 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
          </svg>
          Categoria
        </label>
        <select
          v-model="categoryFilter"
          class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      <button
        class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition whitespace-nowrap"
        @click="resetFilters"
      >
        Limpar filtros
      </button>
    </div>

    <!-- Error -->
    <div v-if="error" class="p-4 text-sm text-red-600 bg-red-50">{{ error }}</div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <th class="text-left px-4 py-3 font-medium">Título</th>
            <th class="text-left px-4 py-3 font-medium">Status</th>
            <th class="text-left px-4 py-3 font-medium hidden md:table-cell">Categoria</th>
            <th class="text-left px-4 py-3 font-medium hidden lg:table-cell">Autor</th>
            <th class="text-center px-4 py-3 font-medium hidden sm:table-cell">Votos</th>
            <th class="text-left px-4 py-3 font-medium hidden lg:table-cell">Criado em</th>
          </tr>
        </thead>
        <tbody>
          <!-- Loading skeleton -->
          <template v-if="loading">
            <tr v-for="n in 3" :key="n" class="border-t border-gray-50 animate-pulse">
              <td class="px-4 py-3"><div class="h-4 bg-gray-200 rounded w-48" /></td>
              <td class="px-4 py-3"><div class="h-5 bg-gray-200 rounded-full w-20" /></td>
              <td class="px-4 py-3 hidden md:table-cell"><div class="h-4 bg-gray-200 rounded w-32" /></td>
              <td class="px-4 py-3 hidden lg:table-cell"><div class="h-4 bg-gray-200 rounded w-24" /></td>
              <td class="px-4 py-3 text-center hidden sm:table-cell"><div class="h-4 bg-gray-200 rounded w-8 mx-auto" /></td>
              <td class="px-4 py-3 hidden lg:table-cell"><div class="h-4 bg-gray-200 rounded w-20" /></td>
            </tr>
          </template>

          <!-- Empty state -->
          <tr v-else-if="ideas.length === 0">
            <td colspan="6" class="px-4 py-12 text-center text-gray-400">
              <div class="text-4xl mb-2">🔍</div>
              <p>Nenhuma ideia encontrada.</p>
            </td>
          </tr>

          <!-- Data rows -->
          <template v-else>
            <tr
              v-for="idea in ideas"
              :key="idea.id"
              class="border-t border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3">
                <RouterLink
                  :to="`/ideas/${idea.id}`"
                  class="font-medium text-gray-900 hover:text-brand-600 transition-colors line-clamp-1"
                >
                  {{ idea.title }}
                </RouterLink>
              </td>
              <td class="px-4 py-3">
                <StatusBadge :status="idea.status" />
              </td>
              <td class="px-4 py-3 hidden md:table-cell text-gray-600">
                {{ idea.category ?? '—' }}
              </td>
              <td class="px-4 py-3 hidden lg:table-cell text-gray-600">
                {{ idea.author?.name ?? '—' }}
              </td>
              <td class="px-4 py-3 text-center hidden sm:table-cell text-gray-700 font-medium">
                {{ idea.votes_count }}
              </td>
              <td class="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">
                {{ formatDate(idea.created_at) }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="px-4 pb-4">
      <Pagination
        :page="page"
        :pages="pages"
        :total="total"
        :per-page="perPage"
        @update:page="onPageChange"
        @update:per-page="onPerPageChange"
      />
    </div>
  </div>
</template>
