<template>
  <aside class="w-56 bg-white border-r border-gray-100 flex flex-col min-h-full py-6">
    <nav class="flex-1 px-3 space-y-1">
      <RouterLink
        v-for="item in menuItems"
        :key="item.route"
        :to="item.route"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
        :class="isActive(item.route) ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
      >
        <span class="text-base">{{ item.icon }}</span>
        {{ item.label }}
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { navigationConfig } from '@/config/navigation'

const authStore = useAuthStore()
const route = useRoute()

const menuItems = computed(() => {
  if (!authStore.role) return []
  return navigationConfig[authStore.role]
})

function isActive(itemRoute: string): boolean {
  return route.path.startsWith(itemRoute)
}
</script>
