<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTaskStore } from '@/stores/task'
import { useToastStore } from '@/stores/toast'
import http from '@/lib/http'
import type { ApiResponse, TenantMember } from '@/types'

const emit = defineEmits<{ close: [] }>()

const taskStore = useTaskStore()
const toastStore = useToastStore()
const { t } = useI18n()
const loading = ref(false)
const error = ref('')
const members = ref<TenantMember[]>([])

const form = ref({
  title: '',
  description: '',
  assigned_to: '',
  due_date: '',
})

onMounted(async () => {
  try {
    const { data } = await http.get<ApiResponse<TenantMember[]>>('/tenant/members')
    members.value = data.data
  } catch {
    // non-critical
  }
})

async function handleSubmit() {
  if (loading.value || !form.value.title.trim()) return
  error.value = ''
  loading.value = true

  try {
    await taskStore.createTask({
      title: form.value.title.trim(),
      description: form.value.description || undefined,
      assigned_to: form.value.assigned_to || undefined,
      due_date: form.value.due_date || undefined,
    })
    toastStore.success(t('createTask.success'))
    emit('close')
  } catch {
    error.value = t('createTask.error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
  <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">{{ t('createTask.title') }}</h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ t('createTask.titleField') }} <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.title"
            type="text"
            required
            :placeholder="t('createTask.titlePlaceholder')"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('createTask.description') }}</label>
          <textarea
            v-model="form.description"
            rows="3"
            :placeholder="t('createTask.descriptionPlaceholder')"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('createTask.assignTo') }}</label>
          <select
            v-model="form.assigned_to"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition bg-white text-gray-700"
          >
            <option value="">{{ t('createTask.noAssign') }}</option>
            <option v-for="m in members" :key="m.id" :value="m.id">
              {{ m.name }} ({{ m.email }})
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('createTask.deadline') }}</label>
          <input
            v-model="form.due_date"
            type="date"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <div class="flex gap-2 justify-end pt-1">
          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            {{ t('createTask.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
          >
            {{ loading ? t('createTask.submitting') : t('createTask.submit') }}
          </button>
        </div>
      </form>
    </div>
  </div>
  </Teleport>
</template>
