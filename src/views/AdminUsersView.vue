<script setup lang="ts">
import { onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import UserManagement from '@/components/dashboard/UserManagement.vue'

const adminStore = useAdminStore()

onMounted(() => {
  adminStore.fetchUsers()
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Usuários</h1>
      <p class="text-gray-500 mt-1">Gerencie os usuários e seus roles na plataforma</p>
    </div>
    <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <UserManagement :users="adminStore.users" />
    </div>
  </div>
</template>
