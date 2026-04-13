<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <!-- Name -->
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
      <input
        id="name"
        v-model="form.name"
        type="text"
        autocomplete="name"
        required
        minlength="2"
        class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        placeholder="Seu nome"
      />
    </div>

    <!-- Email -->
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
      <input
        id="email"
        v-model="form.email"
        type="email"
        autocomplete="email"
        required
        class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        placeholder="seu@email.com"
      />
    </div>

    <!-- Password -->
    <div>
      <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
      <input
        id="password"
        v-model="form.password"
        type="password"
        autocomplete="new-password"
        required
        minlength="8"
        class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        placeholder="Mínimo 8 caracteres"
      />
    </div>

    <!-- Role -->
    <div>
      <label for="role" class="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
      <select
        id="role"
        v-model="form.role"
        required
        class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 bg-white"
      >
        <option value="user">Usuário – propor e votar em ideias</option>
        <option value="developer">Desenvolvedor – colaborar e implementar ideias</option>
      </select>
      <p class="mt-1 text-xs text-gray-500">Após o cadastro, apenas um administrador pode alterar seu perfil.</p>
    </div>

    <!-- Error -->
    <p v-if="error" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ error }}</p>

    <!-- Submit -->
    <button
      type="submit"
      :disabled="loading"
      class="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <span v-if="loading">Criando conta...</span>
      <span v-else>Criar conta</span>
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Role } from '@/types'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({ name: '', email: '', password: '', role: 'user' as Role })
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await authStore.register(form.value)
    if (authStore.isAdmin) {
      router.push('/admin/dashboard')
    } else {
      router.push('/ideas')
    }
  } catch (err: unknown) {
    const e = err as { response?: { data?: { detail?: string } } }
    error.value = e.response?.data?.detail ?? 'Falha ao criar conta. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>
