<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTaskStore } from '@/stores/task'
import { useToastStore } from '@/stores/toast'
import type { Task, TaskStatus } from '@/types'

const props = defineProps<{ task: Task }>()
const emit = defineEmits<{ close: [] }>()

const taskStore = useTaskStore()
const toastStore = useToastStore()
const { t } = useI18n()
const loading = ref(false)
const error = ref('')

const form = ref({
  title: props.task.title,
  description: props.task.description ?? '',
  status: props.task.status as TaskStatus,
})

const statusOptions: { value: TaskStatus; labelKey: string }[] = [
  { value: 'todo', labelKey: 'dashboard.todo' },
  { value: 'doing', labelKey: 'dashboard.doing' },
  { value: 'completed', labelKey: 'dashboard.completed' },
]

async function handleSubmit() {
  if (loading.value || !form.value.title.trim()) return
  error.value = ''
  loading.value = true

  try {
    await taskStore.updateTask(props.task.id, {
      title: form.value.title.trim(),
      description: form.value.description || undefined,
      status: form.value.status,
    })
    toastStore.success(t('editTask.success'))
    emit('close')
  } catch {
    error.value = t('editTask.error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ t('editTask.title') }}</h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ t('editTask.titleField') }} <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.title"
            type="text"
            required
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('editTask.description') }}</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('editTask.status') }}</label>
          <select
            v-model="form.status"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white"
          >
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
              {{ t(opt.labelKey) }}
            </option>
          </select>
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <div class="flex gap-2 justify-end pt-1">
          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            {{ t('editTask.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
          >
            {{ loading ? t('editTask.submitting') : t('editTask.submit') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
