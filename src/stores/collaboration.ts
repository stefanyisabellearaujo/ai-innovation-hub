import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Collaborator, Comment } from '@/types'
import { collaborationService } from '@/services/collaborationService'
import { useAuthStore } from '@/stores/auth'

export const useCollaborationStore = defineStore('collaboration', () => {
  const authStore = useAuthStore()

  // Votes
  const votedIdeaIds = ref<Set<string>>(new Set())

  // Collaborators
  const collaborators = ref<Collaborator[]>([])
  const isCollaborating = ref(false)
  const loadingCollab = ref(false)

  // Comments
  const comments = ref<Comment[]>([])
  const commentsTotal = ref(0)
  const commentsPage = ref(1)
  const loadingComments = ref(false)

  // -------------------------------------------------------------------------
  // Actions – Votes
  // -------------------------------------------------------------------------

  async function toggleVote(ideaId: string): Promise<{ voted: boolean; votes_count: number }> {
    const result = await collaborationService.toggleVote(ideaId)
    if (result.voted) {
      votedIdeaIds.value.add(ideaId)
    } else {
      votedIdeaIds.value.delete(ideaId)
    }
    return result
  }

  // -------------------------------------------------------------------------
  // Actions – Collaborators
  // -------------------------------------------------------------------------

  async function fetchCollaborators(ideaId: string): Promise<void> {
    loadingCollab.value = true
    try {
      collaborators.value = await collaborationService.getCollaborators(ideaId)
      _updateIsCollaborating()
    } finally {
      loadingCollab.value = false
    }
  }

  async function joinIdea(ideaId: string): Promise<void> {
    await collaborationService.joinIdea(ideaId)
    await fetchCollaborators(ideaId)
  }

  async function leaveIdea(ideaId: string): Promise<void> {
    await collaborationService.leaveIdea(ideaId)
    await fetchCollaborators(ideaId)
  }

  // -------------------------------------------------------------------------
  // Actions – Comments
  // -------------------------------------------------------------------------

  async function fetchComments(ideaId: string, page = 1): Promise<void> {
    loadingComments.value = true
    try {
      const response = await collaborationService.getComments(ideaId, page)
      if (page === 1) {
        comments.value = response.items
      } else {
        comments.value = [...comments.value, ...response.items]
      }
      commentsTotal.value = response.total
      commentsPage.value = response.page
    } finally {
      loadingComments.value = false
    }
  }

  async function addComment(ideaId: string, content: string): Promise<void> {
    const newComment = await collaborationService.addComment(ideaId, content)
    comments.value = [...comments.value, newComment]
    commentsTotal.value += 1
  }

  // -------------------------------------------------------------------------
  // Reset
  // -------------------------------------------------------------------------

  function reset(): void {
    collaborators.value = []
    isCollaborating.value = false
    comments.value = []
    commentsTotal.value = 0
    commentsPage.value = 1
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  function _updateIsCollaborating(): void {
    const userId = authStore.user?.id
    if (!userId) {
      isCollaborating.value = false
      return
    }
    isCollaborating.value = collaborators.value.some((c) => c.user_id === userId)
  }

  return {
    // State
    votedIdeaIds,
    collaborators,
    isCollaborating,
    loadingCollab,
    comments,
    commentsTotal,
    commentsPage,
    loadingComments,
    // Actions
    toggleVote,
    fetchCollaborators,
    joinIdea,
    leaveIdea,
    fetchComments,
    addComment,
    reset,
  }
})
