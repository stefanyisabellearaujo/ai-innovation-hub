import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Idea, IdeaCreate, IdeaFilters, IdeaUpdate } from '@/types'
import { ideaService } from '@/services/ideaService'

export const useIdeasStore = defineStore('ideas', () => {
  const ideas = ref<Idea[]>([])
  const currentIdea = ref<Idea | null>(null)
  const filters = ref<IdeaFilters>({
    page: 1,
    per_page: 20,
    sort_by: 'created_at',
    order: 'desc',
  })
  const total = ref(0)
  const pages = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchIdeas(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const response = await ideaService.getIdeas(filters.value)
      ideas.value = response.items
      total.value = response.total
      pages.value = response.pages
    } catch (err: unknown) {
      error.value = _extractMessage(err, 'Erro ao carregar ideias.')
    } finally {
      loading.value = false
    }
  }

  async function fetchIdea(id: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      currentIdea.value = await ideaService.getIdea(id)
    } catch (err: unknown) {
      error.value = _extractMessage(err, 'Erro ao carregar ideia.')
    } finally {
      loading.value = false
    }
  }

  async function createIdea(data: IdeaCreate): Promise<Idea> {
    const created = await ideaService.createIdea(data)
    await fetchIdeas()
    return created
  }

  async function updateIdea(id: string, data: IdeaUpdate): Promise<Idea> {
    const updated = await ideaService.updateIdea(id, data)
    // Update in list if present
    const idx = ideas.value.findIndex((i) => i.id === id)
    if (idx !== -1) ideas.value[idx] = updated
    // Update currentIdea if it matches
    if (currentIdea.value?.id === id) currentIdea.value = updated
    return updated
  }

  async function deleteIdea(id: string): Promise<void> {
    await ideaService.deleteIdea(id)
    ideas.value = ideas.value.filter((i) => i.id !== id)
    if (currentIdea.value?.id === id) currentIdea.value = null
    total.value = Math.max(0, total.value - 1)
  }

  function setFilters(newFilters: Partial<IdeaFilters>): void {
    filters.value = { ...filters.value, ...newFilters, page: 1 }
    fetchIdeas()
  }

  function setPage(page: number): void {
    filters.value = { ...filters.value, page }
    fetchIdeas()
  }

  function _extractMessage(err: unknown, fallback: string): string {
    if (typeof err === 'object' && err !== null) {
      const e = err as Record<string, unknown>
      const detail = (e['response'] as Record<string, unknown>)?.['data']
      if (typeof detail === 'object' && detail !== null) {
        const d = detail as Record<string, unknown>
        if (typeof d['detail'] === 'string') return d['detail']
      }
    }
    return fallback
  }

  return {
    ideas,
    currentIdea,
    filters,
    total,
    pages,
    loading,
    error,
    fetchIdeas,
    fetchIdea,
    createIdea,
    updateIdea,
    deleteIdea,
    setFilters,
    setPage,
  }
})
