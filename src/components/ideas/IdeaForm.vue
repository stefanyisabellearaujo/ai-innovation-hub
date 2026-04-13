<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import type { Idea, IdeaCreate, IdeaUpdate } from '@/types'
import { aiService } from '@/services/aiService'
import type { SimilarIdea } from '@/services/aiService'

const props = defineProps<{
  idea?: Idea
}>()

const emit = defineEmits<{
  (e: 'submit', data: IdeaCreate | IdeaUpdate): void
  (e: 'cancel'): void
}>()

const isEdit = computed(() => !!props.idea)

const form = reactive({
  title: props.idea?.title ?? '',
  description: props.idea?.description ?? '',
})

const errors = reactive({
  title: '',
  description: '',
})

// Similar ideas suggestion (AI)
const suggestions = ref<SimilarIdea[]>([])
const checkingAI = ref(false)
const dismissed = ref(false)  // user chose to continue creating
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => form.description,
  (description) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    dismissed.value = false

    if (description.trim().length < 20) {
      suggestions.value = []
      checkingAI.value = false
      return
    }

    checkingAI.value = true
    debounceTimer = setTimeout(async () => {
      try {
        const result = await aiService.findSimilar(description, undefined, form.title)
        suggestions.value = result.similar_ideas.slice(0, 3)
      } catch {
        suggestions.value = []
      } finally {
        checkingAI.value = false
      }
    }, 600)
  },
)

function dismissSuggestions() {
  dismissed.value = true
}

function validate(): boolean {
  let valid = true
  errors.title = ''
  errors.description = ''

  if (!form.title.trim()) {
    errors.title = 'O título é obrigatório.'
    valid = false
  } else if (form.title.trim().length > 200) {
    errors.title = 'O título deve ter no máximo 200 caracteres.'
    valid = false
  }

  if (!form.description.trim()) {
    errors.description = 'A descrição é obrigatória.'
    valid = false
  } else if (form.description.trim().length > 5000) {
    errors.description = 'A descrição deve ter no máximo 5.000 caracteres.'
    valid = false
  }

  return valid
}

function onSubmit() {
  if (!validate()) return

  if (isEdit.value) {
    const data: IdeaUpdate = {
      title: form.title.trim(),
      description: form.description.trim(),
    }
    emit('submit', data)
  } else {
    const data: IdeaCreate = {
      title: form.title.trim(),
      description: form.description.trim(),
    }
    emit('submit', data)
  }
}
</script>

<template>
  <form class="flex flex-col gap-5" @submit.prevent="onSubmit">
    <!-- Title -->
    <div class="flex flex-col gap-1">
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700" for="idea-title">Título</label>
        <span class="text-xs text-gray-400">{{ form.title.length }}/200</span>
      </div>
      <input
        id="idea-title"
        v-model="form.title"
        type="text"
        maxlength="200"
        placeholder="Título da ideia..."
        class="rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 transition"
        :class="
          errors.title
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-200 focus:border-brand-500 focus:ring-brand-500'
        "
      />
      <p v-if="errors.title" class="text-xs text-red-500">{{ errors.title }}</p>
    </div>

    <!-- Description -->
    <div class="flex flex-col gap-1">
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-gray-700" for="idea-description">Descrição</label>
        <span class="text-xs text-gray-400">{{ form.description.length }}/5000</span>
      </div>
      <textarea
        id="idea-description"
        v-model="form.description"
        rows="5"
        maxlength="5000"
        placeholder="Descreva sua ideia em detalhes..."
        class="rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 resize-y focus:outline-none focus:ring-1 transition"
        :class="
          errors.description
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-200 focus:border-brand-500 focus:ring-brand-500'
        "
      />
      <p v-if="errors.description" class="text-xs text-red-500">{{ errors.description }}</p>

      <!-- Checking indicator -->
      <div v-if="checkingAI && !isEdit" class="mt-2 flex items-center gap-2 text-xs text-gray-400">
        <svg class="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        Verificando se já existe uma ideia parecida...
      </div>

      <!-- Similar ideas found — action required -->
      <div
        v-if="suggestions.length > 0 && !dismissed && !isEdit"
        class="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-4"
      >
        <div class="flex items-start gap-2 mb-3">
          <span class="text-lg">⚠️</span>
          <div>
            <p class="text-sm font-semibold text-amber-900">Já existe{{ suggestions.length > 1 ? 'm' : '' }} {{ suggestions.length }} ideia{{ suggestions.length > 1 ? 's' : '' }} parecida{{ suggestions.length > 1 ? 's' : '' }}!</p>
            <p class="text-xs text-amber-700 mt-0.5">Considere comentar ou colaborar em vez de criar uma duplicata.</p>
          </div>
        </div>

        <!-- List of similar ideas -->
        <ul class="space-y-2 mb-4">
          <li
            v-for="s in suggestions"
            :key="s.idea_id"
            class="flex items-center justify-between bg-white rounded-lg border border-amber-200 px-3 py-2"
          >
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ s.title }}</p>
              <p class="text-xs text-gray-400">{{ s.category }} · {{ Math.round(s.similarity_score * 100) }}% similar</p>
            </div>
            <a
              :href="`/ideas/${s.idea_id}`"
              target="_blank"
              rel="noopener"
              class="ml-3 shrink-0 rounded-lg border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-200 transition-colors"
            >
              Ver ideia →
            </a>
          </li>
        </ul>

        <!-- Decision buttons -->
        <div class="flex items-center gap-2 pt-2 border-t border-amber-200">
          <button
            type="button"
            class="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            @click="dismissSuggestions"
          >
            Minha ideia é diferente — continuar criando
          </button>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-1">
      <button
        type="button"
        class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
        @click="emit('cancel')"
      >
        Cancelar
      </button>
      <button
        type="submit"
        class="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition"
      >
        {{ isEdit ? 'Salvar Alterações' : 'Criar Ideia' }}
      </button>
    </div>
  </form>
</template>
