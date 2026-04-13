<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import type { Idea } from '@/types'
import { ideaService } from '@/services/ideaService'
import { useAuthStore } from '@/stores/auth'
import IdeaCard from '@/components/ideas/IdeaCard.vue'

const authStore = useAuthStore()

const myCollabs = ref<Idea[]>([])
const loading = ref(false)

onMounted(async () => {
  // Wait for auth to be hydrated if needed (e.g. page refresh)
  if (!authStore.user?.id) {
    await authStore.checkAuth()
  }
  if (!authStore.user?.id) return

  loading.value = true
  try {
    const response = await ideaService.getIdeas({ collaborator_id: authStore.user.id, per_page: 100 })
    myCollabs.value = response.items
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Minhas Colaborações</h1>
      <p class="text-gray-500 mt-1">Ideias em que você está colaborando como desenvolvedor</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12 text-gray-400">Carregando...</div>

    <!-- Empty -->
    <div v-else-if="myCollabs.length === 0" class="text-center py-16 text-gray-400">
      <p class="text-4xl mb-3">🤝</p>
      <p class="font-medium">Você ainda não está colaborando em nenhuma ideia.</p>
      <RouterLink
        to="/ideas"
        class="mt-2 inline-block text-sm text-brand-600 hover:underline"
      >
        Explorar ideias →
      </RouterLink>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <IdeaCard v-for="idea in myCollabs" :key="idea.id" :idea="idea" />
    </div>
  </div>
</template>
