<script setup lang="ts">
import IdeasTable from '@/components/dashboard/IdeasTable.vue'
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Ideias</h1>
      <p class="text-gray-500 mt-1">Todas as ideias cadastradas na plataforma</p>
    </div>
    <IdeasTable />
  </div>
</template>
