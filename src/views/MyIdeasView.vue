<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import type { Idea } from '@/types'
import { ideaService } from '@/services/ideaService'
import { useAuthStore } from '@/stores/auth'
import IdeaCard from '@/components/ideas/IdeaCard.vue'

const authStore = useAuthStore()

type Tab = 'created' | 'collaborations'
const activeTab = ref<Tab>('created')

const myIdeas = ref<Idea[]>([])
const myCollabs = ref<Idea[]>([])
const loading = ref(false)

const isDeveloper = computed(() => authStore.isDeveloper)

const currentIdeas = computed(() =>
  activeTab.value === 'created' ? myIdeas.value : myCollabs.value,
)

const emptyLabel = computed(() =>
  activeTab.value === 'created'
    ? { icon: '💡', text: 'Você ainda não criou nenhuma ideia.', link: true }
    : { icon: '🤝', text: 'Você ainda não está colaborando em nenhuma ideia.', link: false },
)

onMounted(async () => {
  if (!authStore.user?.id) {
    await authStore.checkAuth()
  }
  if (!authStore.user?.id) return

  loading.value = true
  try {
    const [created, collabs] = await Promise.all([
      ideaService.getIdeas({ author_id: authStore.user.id, per_page: 100 }),
      isDeveloper.value
        ? ideaService.getIdeas({ collaborator_id: authStore.user.id, per_page: 100 })
        : Promise.resolve({ items: [] as Idea[], total: 0, page: 1, per_page: 100, pages: 0 }),
    ])
    myIdeas.value = created.items
    myCollabs.value = collabs.items
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Minhas Ideias</h1>
      <p class="text-gray-500 mt-1">
        {{ isDeveloper ? 'Suas ideias e colaborações' : 'Ideias que você criou' }}
      </p>
    </div>

    <!-- Tabs (only for developer) -->
    <div v-if="isDeveloper" class="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
      <button
        class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
        :class="
          activeTab === 'created'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        "
        @click="activeTab = 'created'"
      >
        💡 Criadas por mim
        <span
          class="ml-1.5 rounded-full px-1.5 py-0.5 text-xs"
          :class="activeTab === 'created' ? 'bg-brand-100 text-brand-700' : 'bg-gray-200 text-gray-500'"
        >
          {{ myIdeas.length }}
        </span>
      </button>
      <button
        class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
        :class="
          activeTab === 'collaborations'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        "
        @click="activeTab = 'collaborations'"
      >
        🤝 Colaborações
        <span
          class="ml-1.5 rounded-full px-1.5 py-0.5 text-xs"
          :class="activeTab === 'collaborations' ? 'bg-brand-100 text-brand-700' : 'bg-gray-200 text-gray-500'"
        >
          {{ myCollabs.length }}
        </span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12 text-gray-400">Carregando...</div>

    <!-- Empty state -->
    <div v-else-if="currentIdeas.length === 0" class="text-center py-16 text-gray-400">
      <p class="text-4xl mb-3">{{ emptyLabel.icon }}</p>
      <p class="font-medium">{{ emptyLabel.text }}</p>
      <RouterLink
        v-if="emptyLabel.link"
        to="/ideas"
        class="mt-2 inline-block text-sm text-brand-600 hover:underline"
      >
        Criar minha primeira ideia →
      </RouterLink>
      <RouterLink
        v-else
        to="/ideas"
        class="mt-2 inline-block text-sm text-brand-600 hover:underline"
      >
        Explorar ideias →
      </RouterLink>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <IdeaCard v-for="idea in currentIdeas" :key="idea.id" :idea="idea" :hide-actions="true" />
    </div>
  </div>
</template>
