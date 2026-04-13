<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRankingStore } from '@/stores/ranking'
import PodiumSection from '@/components/ranking/PodiumSection.vue'
import RankingTable from '@/components/ranking/RankingTable.vue'

const rankingStore = useRankingStore()

const rankedDevelopers = computed(() =>
  rankingStore.developers.filter(d => d.completed_count > 0)
)

onMounted(async () => {
  await rankingStore.fetchRanking()
})
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Ranking de Desenvolvedores</h1>
      <p class="text-gray-500 mt-1">Desenvolvedores que mais contribuíram com ideias concluídas</p>
    </div>

    <!-- Loading -->
    <div v-if="rankingStore.loading" class="text-center py-12 text-gray-400">
      Carregando ranking...
    </div>

    <!-- Error -->
    <div v-else-if="rankingStore.error" class="text-center py-12 text-red-500">
      {{ rankingStore.error }}
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Empty state: no completions -->
      <div v-if="rankedDevelopers.length === 0" class="text-center py-16 text-gray-400">
        <p class="text-4xl mb-3">🏆</p>
        <p class="font-medium">Nenhum desenvolvedor concluiu uma ideia ainda.</p>
        <p class="text-sm mt-1">Complete ideias como colaborador para aparecer no ranking.</p>
      </div>

      <template v-else>
        <!-- Podium (top 3) -->
        <PodiumSection :developers="rankedDevelopers.slice(0, 3)" />

        <!-- Full table -->
        <RankingTable :developers="rankedDevelopers" />
      </template>
    </template>
  </div>
</template>
