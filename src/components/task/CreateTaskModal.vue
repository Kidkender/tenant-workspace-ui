<script setup lang="ts">
import { ref } from 'vue'
import { useTaskStore } from '@/stores/task'

const emit = defineEmits<{ close: [] }>()

const taskStore = useTaskStore()
const loading = ref(false)
const error = ref('')

const form = ref({
  title: '',
  description: '',
  assigned_to: '',
  due_date: '',
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
    emit('close')
  } catch {
    error.value = 'Tạo task thất bại. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Tạo Task mới</h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tiêu đề <span class="text-red-500">*</span></label>
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="Nhập tiêu đề task..."
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Mô tả chi tiết..."
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
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
            Huỷ
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
          >
            {{ loading ? 'Đang tạo...' : 'Tạo Task' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
