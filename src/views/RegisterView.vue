<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 px-4 py-8">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 text-white text-2xl mb-4 shadow-lg">
          💡
        </div>
        <h1 class="text-2xl font-bold text-gray-900">AI Innovation Hub</h1>
        <p class="text-gray-500 mt-1 text-sm">Plataforma de ideias da Onfly</p>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">Criar conta</h2>
        <RegisterForm />
        <p class="mt-6 text-center text-sm text-gray-500">
          Já tem conta?
          <RouterLink to="/login" class="font-medium text-brand-600 hover:text-brand-700">
            Entrar
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import RegisterForm from '@/components/auth/RegisterForm.vue'
</script>
