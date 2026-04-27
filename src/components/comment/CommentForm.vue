<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ taskId: string; loading?: boolean }>()
const emit = defineEmits<{ submit: [content: string] }>()

const content = ref('')

function handleSubmit() {
  const trimmed = content.value.trim()
  if (!trimmed || props.loading) return
  emit('submit', trimmed)
  content.value = ''
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="flex gap-3 items-start">
    <textarea
      v-model="content"
      rows="2"
      placeholder="Viết comment..."
      @keydown.ctrl.enter="handleSubmit"
      class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
    />
    <button
      type="submit"
      :disabled="loading || !content.trim()"
      class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition shrink-0"
    >
      {{ loading ? '...' : 'Gửi' }}
    </button>
  </form>
</template>
