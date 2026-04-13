import api from './api'

export interface CategorizeResponse {
  category: string
  scores: Record<string, number>
}

export interface SimilarIdea {
  idea_id: string
  title: string
  category: string
  similarity_score: number
}

export interface SimilarResponse {
  similar_ideas: SimilarIdea[]
}

export const aiService = {
  async categorize(description: string): Promise<CategorizeResponse> {
    const { data } = await api.post<CategorizeResponse>('/ai/categorize', { description })
    return data
  },

  async findSimilar(description: string, excludeId?: string, title?: string): Promise<SimilarResponse> {
    const { data } = await api.post<SimilarResponse>('/ai/similar', {
      description,
      title: title ?? '',
      exclude_id: excludeId ?? null,
    })
    return data
  },
}
