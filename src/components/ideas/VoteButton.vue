<script setup lang="ts">
import { ref } from 'vue'
import { useCollaborationStore } from '@/stores/collaboration'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  ideaId: string
  votesCount: number
  hasVoted: boolean
}>()

const emit = defineEmits<{
  (e: 'voted', newCount: number, voted: boolean): void
}>()

const collaborationStore = useCollaborationStore()
const authStore = useAuthStore()

const localVoted = ref(props.hasVoted)
const localCount = ref(props.votesCount)
const loading = ref(false)

async function handleVote() {
  if (loading.value) return
  loading.value = true

  // Optimistic update
  const prevVoted = localVoted.value
  const prevCount = localCount.value
  localVoted.value = !localVoted.value
  localCount.value = localVoted.value ? localCount.value + 1 : localCount.value - 1

  try {
    const result = await collaborationStore.toggleVote(props.ideaId)
    localVoted.value = result.voted
    localCount.value = result.votes_count
    emit('voted', result.votes_count, result.voted)
  } catch {
    // Rollback on error
    localVoted.value = prevVoted
    localCount.value = prevCount
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <button
    v-if="!authStore.isAdmin"
    :disabled="loading"
    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    :class="
      localVoted
        ? 'bg-brand-100 text-brand-700 border border-brand-300'
        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
    "
    @click="handleVote"
  >
    <!-- Loading spinner -->
    <svg
      v-if="loading"
      class="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>

    <!-- Thumb up icon (filled when voted) -->
    <template v-else>
      <svg
        v-if="localVoted"
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path
          d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507C2.28 19.482 3.105 20.25 4.05 20.25H4.5c.958 0 1.76-.601 2.092-1.442a.83.83 0 00.053-.297v-.85a.75.75 0 01.75-.75h.75a.75.75 0 01.75.75v.85c0 .101-.018.2-.053.297a2.252 2.252 0 01-2.09 1.442H4.05c-1.518 0-2.826-1.057-3.136-2.547a13.493 13.493 0 01-.585-3.953c0-1.686.32-3.294.897-4.77a.75.75 0 011.105.95z"
        />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H6.75a.75.75 0 01-.75-.75v-4.5c0-.414.336-.75.75-.75h.75M6 15H4.5m0 0H3a.75.75 0 01-.75-.75v-4.5c0-.414.336-.75.75-.75H4.5m0 6v-6"
        />
      </svg>
    </template>

    <span>{{ localCount }} {{ localCount === 1 ? 'voto' : 'votos' }}</span>
  </button>

  <!-- Read-only vote count for admin -->
  <span v-else class="inline-flex items-center gap-1.5 text-sm text-gray-500">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="1.5"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H6.75a.75.75 0 01-.75-.75v-4.5c0-.414.336-.75.75-.75h.75M6 15H4.5m0 0H3a.75.75 0 01-.75-.75v-4.5c0-.414.336-.75.75-.75H4.5m0 6v-6"
      />
    </svg>
    {{ localCount }} {{ localCount === 1 ? 'voto' : 'votos' }}
  </span>
</template>
