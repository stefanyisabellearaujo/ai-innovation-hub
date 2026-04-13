import type { Idea, IdeaCreate, IdeaUpdate, IdeaFilters, PaginatedResponse } from '@/types'
import api from './api'

function buildQueryString(filters?: Partial<IdeaFilters>): string {
  if (!filters) return ''
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value))
    }
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export const ideaService = {
  async createIdea(data: IdeaCreate): Promise<Idea> {
    const response = await api.post<Idea>('/ideas', data)
    return response.data
  },

  async getIdeas(filters?: Partial<IdeaFilters>): Promise<PaginatedResponse<Idea>> {
    const qs = buildQueryString(filters)
    const response = await api.get<PaginatedResponse<Idea>>(`/ideas${qs}`)
    return response.data
  },

  async getIdea(id: string): Promise<Idea> {
    const response = await api.get<Idea>(`/ideas/${id}`)
    return response.data
  },

  async updateIdea(id: string, data: IdeaUpdate): Promise<Idea> {
    const response = await api.put<Idea>(`/ideas/${id}`, data)
    return response.data
  },

  async deleteIdea(id: string): Promise<void> {
    await api.delete(`/ideas/${id}`)
  },

  async voteIdea(id: string): Promise<Idea> {
    const response = await api.post<Idea>(`/ideas/${id}/vote`)
    return response.data
  },
}
