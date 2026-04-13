import type { RankingEntry } from '@/types'
import api from './api'

export interface RankingResponse {
  rankings: RankingEntry[]
}

export const rankingService = {
  async getRanking(): Promise<RankingEntry[]> {
    const { data } = await api.get<RankingResponse>('/ranking/developers')
    return data.rankings
  },
}
