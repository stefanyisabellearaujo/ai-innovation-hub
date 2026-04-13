<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { Idea } from '@/types'
import { useAuthStore } from '@/stores/auth'
import StatusBadge from '@/components/common/StatusBadge.vue'

const props = defineProps<{
  idea: Idea
  hideActions?: boolean  // hides delete + join buttons (e.g. in MyIdeasView)
}>()

const emit = defineEmits<{
  (e: 'vote', id: string): void
  (e: 'join', id: string): void
  (e: 'delete', id: string): void
}>()

const authStore = useAuthStore()


const authorName = computed(() => props.idea.author?.name ?? 'Desconhecido')
const isOwnIdea = computed(() => authStore.user?.id === props.idea.author_id)
const canVote = computed(() =>
  (authStore.isUser || authStore.isDeveloper) &&
  !isOwnIdea.value &&
  props.idea.status !== 'completed' &&
  props.idea.status !== 'archived'
)
const canJoin = computed(() => authStore.isDeveloper)
const isCollaborating = computed(() =>
  props.idea.collaborators?.some(c => c.user_id === authStore.user?.id) ?? false
)
</script>

<template>
  <article
    class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col gap-3"
  >
    <!-- Header: title + status -->
    <div class="flex items-start justify-between gap-2">
      <h3 class="text-base font-semibold text-gray-900 line-clamp-2 flex-1">
        {{ idea.title }}
      </h3>
      <StatusBadge :status="idea.status" />
    </div>

    <!-- Description -->
    <p class="text-sm text-gray-600 line-clamp-3">{{ idea.description }}</p>

    <!-- Footer: author + date + votes + actions -->
    <div class="flex items-center justify-between mt-auto pt-2 border-t border-gray-50 gap-2">
      <!-- Author + date -->
      <div class="text-xs text-gray-400 min-w-0 flex-1 overflow-hidden">
        <span
          class="font-medium text-gray-600 block truncate"
          :title="authorName"
        >{{ authorName }}</span>
      </div>

      <!-- Actions: icon-only buttons with tooltips — fixed width so author name never gets squeezed -->
      <div class="flex items-center gap-1.5 shrink-0">

        <!-- Delete (own idea, icon only) -->
        <button
          v-if="isOwnIdea && !hideActions && idea.status !== 'completed'"
          title="Excluir ideia"
          class="rounded-full border border-gray-200 bg-white p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          @click="emit('delete', idea.id)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Vote: icon + count (clickable or read-only) -->
        <button
          v-if="canVote"
          :title="idea.has_voted ? 'Remover voto' : 'Votar'"
          class="flex items-center gap-1 rounded-full border p-1.5 text-xs font-medium transition"
          :class="idea.has_voted
            ? 'border-brand-300 bg-brand-50 text-brand-600'
            : 'border-gray-200 bg-white text-gray-500 hover:border-brand-300 hover:text-brand-600'"
          @click="emit('vote', idea.id)"
        >
          <svg v-if="idea.has_voted" xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          <span class="text-xs">{{ idea.votes_count }}</span>
        </button>

        <!-- Vote count read-only (own idea / admin / completed+archived) -->
        <span
          v-else
          :title="isOwnIdea && idea.status !== 'completed' && idea.status !== 'archived' ? 'Você não pode votar na sua própria ideia' : undefined"
          class="flex items-center gap-1 rounded-full border border-gray-100 bg-gray-50 p-1.5 text-xs text-gray-400"
          :class="{ 'cursor-not-allowed': isOwnIdea }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          <span>{{ idea.votes_count }}</span>
        </span>

        <!-- Collaborate (developer, icon only) -->
        <template v-if="canJoin && !hideActions">
          <span
            v-if="isCollaborating"
            title="Colaborando nesta ideia"
            class="rounded-full border border-green-200 bg-green-50 p-1.5 text-green-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </span>
          <button
            v-else
            title="Colaborar nesta ideia"
            class="rounded-full border border-brand-200 bg-brand-50 p-1.5 text-brand-600 hover:bg-brand-100 transition"
            @click="emit('join', idea.id)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </template>

        <!-- View details (icon only) -->
        <RouterLink
          :to="{ name: 'IdeaDetail', params: { id: idea.id } }"
          title="Ver detalhes"
          class="rounded-full border border-gray-200 bg-white p-1.5 text-gray-500 hover:border-brand-300 hover:text-brand-600 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
          </svg>
        </RouterLink>

      </div>
    </div>
  </article>
</template>
