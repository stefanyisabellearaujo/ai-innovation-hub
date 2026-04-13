import type { Collaborator, Comment, PaginatedResponse } from '@/types'
import api from './api'

export const collaborationService = {
  // Votes
  async toggleVote(ideaId: string): Promise<{ voted: boolean; votes_count: number }> {
    const response = await api.post<{ voted: boolean; votes_count: number }>(
      `/ideas/${ideaId}/vote`,
    )
    return response.data
  },

  // Collaborators
  async joinIdea(ideaId: string): Promise<Collaborator> {
    const response = await api.post<Collaborator>(`/ideas/${ideaId}/collaborators`)
    return response.data
  },

  async leaveIdea(ideaId: string): Promise<void> {
    await api.delete(`/ideas/${ideaId}/collaborators`)
  },

  async getCollaborators(ideaId: string): Promise<Collaborator[]> {
    const response = await api.get<Collaborator[]>(`/ideas/${ideaId}/collaborators`)
    return response.data
  },

  // Comments
  async addComment(ideaId: string, content: string): Promise<Comment> {
    const response = await api.post<Comment>(`/ideas/${ideaId}/comments`, { content })
    return response.data
  },

  async getComments(
    ideaId: string,
    page = 1,
    perPage = 20,
  ): Promise<PaginatedResponse<Comment>> {
    const response = await api.get<PaginatedResponse<Comment>>(
      `/ideas/${ideaId}/comments?page=${page}&per_page=${perPage}`,
    )
    return response.data
  },
}
