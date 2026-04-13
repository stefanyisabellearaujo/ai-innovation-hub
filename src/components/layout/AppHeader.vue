<template>
  <header class="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
    <!-- Logo -->
    <div class="flex items-center gap-2">
      <span class="text-xl">💡</span>
      <span class="font-bold text-gray-900 text-sm">AI Innovation Hub</span>
    </div>

    <!-- User info + logout -->
    <div class="flex items-center gap-3">
      <!-- Role badge -->
      <span :class="roleBadgeClass" class="px-2 py-0.5 rounded-full text-xs font-medium">
        {{ roleLabel }}
      </span>
      <!-- User name -->
      <span class="text-sm text-gray-700">{{ authStore.user?.name }}</span>
      <!-- Logout button -->
      <button @click="handleLogout" class="text-sm text-gray-500 hover:text-red-600 transition-colors">
        Sair
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const roleBadgeClass = computed(() => {
  switch (authStore.role) {
    case 'admin':
      return 'bg-red-100 text-red-700'
    case 'developer':
      return 'bg-purple-100 text-purple-700'
    default:
      return 'bg-blue-100 text-blue-700'
  }
})

const roleLabel = computed(() => {
  switch (authStore.role) {
    case 'admin':
      return 'Admin'
    case 'developer':
      return 'Developer'
    default:
      return 'User'
  }
})

function handleLogout(): void {
  authStore.logout()
  router.push('/login')
}
</script>
