<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import MetricsCards from '@/components/dashboard/MetricsCards.vue'

const adminStore = useAdminStore()

onMounted(() => {
  adminStore.fetchStats()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-500 mt-1">Visão geral da plataforma AI Innovation Hub</p>
    </div>

    <!-- Loading state for stats -->
    <div v-if="adminStore.loadingStats" class="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
      <div v-for="n in 4" :key="n" class="bg-white rounded-xl border border-gray-100 p-5 shadow-sm h-24" />
    </div>

    <!-- Metrics cards -->
    <MetricsCards v-else-if="adminStore.stats" :stats="adminStore.stats" />

    <!-- Stats error -->
    <div v-if="adminStore.error && !adminStore.stats" class="text-sm text-red-600 bg-red-50 rounded-lg p-4">
      {{ adminStore.error }}
    </div>

    <!-- Ideas management redirect -->
    <div class="bg-white rounded-xl border border-gray-100 p-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">Gestão de Ideias</h2>
          <p class="text-gray-500 text-sm mt-1">Visualize, filtre e gerencie todas as ideias da plataforma</p>
        </div>
        <RouterLink
          to="/admin/ideas"
          class="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          Ver todas as ideias →
        </RouterLink>
      </div>
    </div>
  </div>
</template>
