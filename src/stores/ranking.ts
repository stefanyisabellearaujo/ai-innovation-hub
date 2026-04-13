import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RankingEntry } from '@/types'
import { rankingService } from '@/services/rankingService'

export const useRankingStore = defineStore('ranking', () => {
  const developers = ref<RankingEntry[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchRanking(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      developers.value = await rankingService.getRanking()
    } catch {
      error.value = 'Não foi possível carregar o ranking.'
    } finally {
      loading.value = false
    }
  }

  return { developers, loading, error, fetchRanking }
})
