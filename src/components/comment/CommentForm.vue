<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ taskId: string; loading?: boolean }>()
const emit = defineEmits<{ submit: [content: string, files: File[]] }>()

const { t } = useI18n()
const content = ref('')
const pendingFiles = shallowRef<File[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)

const MAX_SIZE = 20 * 1024 * 1024

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function onFileInput(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  const next = [...pendingFiles.value]
  for (const file of Array.from(files)) {
    if (file.size > MAX_SIZE) continue
    if (!next.find((f) => f.name === file.name && f.size === file.size)) {
      next.push(file)
    }
  }
  pendingFiles.value = next
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function removeFile(index: number) {
  pendingFiles.value = pendingFiles.value.filter((_, i) => i !== index)
}

function handleSubmit() {
  const trimmed = content.value.trim()
  if (!trimmed || props.loading) return
  emit('submit', trimmed, [...pendingFiles.value])
  content.value = ''
  pendingFiles.value = []
}
</script>

<template>
  <div class="space-y-2">
    <form @submit.prevent="handleSubmit" class="flex gap-3 items-start">
      <textarea
        v-model="content"
        rows="2"
        :placeholder="t('comment.placeholder')"
        @keydown.ctrl.enter="handleSubmit"
        class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
      />

      <div class="flex flex-col gap-1.5 shrink-0">
        <button
          type="submit"
          :disabled="loading"
          class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition"
        >
          {{ loading ? '...' : t('comment.submit') }}
        </button>

        <button
          type="button"
          @click="fileInputRef?.click()"
          class="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-lg transition flex items-center gap-1 justify-center"
          :title="t('attachment.attach')"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          {{ t('attachment.attach') }}
        </button>
      </div>
    </form>

    <input ref="fileInputRef" type="file" multiple class="hidden" @change="onFileInput" />

    <ul v-if="pendingFiles.length > 0" class="space-y-1">
      <li
        v-for="(file, i) in pendingFiles"
        :key="i"
        class="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5"
      >
        <svg class="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
        <span class="flex-1 truncate">{{ file.name }}</span>
        <span class="text-gray-400 shrink-0">{{ formatSize(file.size) }}</span>
        <button type="button" @click="removeFile(i)" class="text-gray-400 hover:text-red-500 transition shrink-0">
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </li>
    </ul>
  </div>
</template>
