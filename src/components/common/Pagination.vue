<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  page: number
  pages: number
  total: number
  perPage: number
}>()

const emit = defineEmits<{
  (e: 'update:page', value: number): void
  (e: 'update:perPage', value: number): void
}>()

const perPageOptions = [10, 20, 50]

// Page numbers with ellipsis (max 5 visible)
const visiblePages = computed<(number | '...')[]>(() => {
  const total = props.pages
  const current = props.page
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = []
  if (current <= 3) {
    pages.push(1, 2, 3, 4, '...', total)
  } else if (current >= total - 2) {
    pages.push(1, '...', total - 3, total - 2, total - 1, total)
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total)
  }
  return pages
})

function goTo(p: number | '...') {
  if (p === '...' || p === props.page) return
  emit('update:page', p as number)
}

function prev() {
  if (props.page > 1) emit('update:page', props.page - 1)
}

function next() {
  if (props.page < props.pages) emit('update:page', props.page + 1)
}

function onPerPageChange(event: Event) {
  const val = parseInt((event.target as HTMLSelectElement).value, 10)
  emit('update:perPage', val)
  emit('update:page', 1)
}
</script>

<template>
  <div v-if="total > 0" class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
    <!-- Results info + per-page: always shown when there's data -->
    <div class="flex items-center gap-3 text-sm text-gray-600">
      <span>{{ total }} resultado{{ total !== 1 ? 's' : '' }}</span>
      <select
        :value="perPage"
        class="rounded border border-gray-200 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
        @change="onPerPageChange"
      >
        <option v-for="opt in perPageOptions" :key="opt" :value="opt">{{ opt }} / página</option>
      </select>
    </div>

    <!-- Page navigation: only when multiple pages -->
    <nav v-if="pages > 1" class="flex items-center gap-1">
      <button
        :disabled="page <= 1"
        class="rounded px-2 py-1 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-100"
        @click="prev"
      >
        &#8592; Anterior
      </button>

      <template v-for="(p, i) in visiblePages" :key="i">
        <span v-if="p === '...'" class="px-2 text-gray-400 select-none">…</span>
        <button
          v-else
          :class="[
            'rounded px-3 py-1 text-sm font-medium transition',
            p === page
              ? 'bg-brand-600 text-white'
              : 'hover:bg-gray-100 text-gray-700',
          ]"
          @click="goTo(p)"
        >
          {{ p }}
        </button>
      </template>

      <button
        :disabled="page >= pages"
        class="rounded px-2 py-1 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-100"
        @click="next"
      >
        Próxima &#8594;
      </button>
    </nav>
  </div>
</template>
