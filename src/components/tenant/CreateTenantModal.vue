<script setup lang="ts">
import { ref } from 'vue'
import { useTenantStore } from '@/stores/tenant'

const emit = defineEmits<{ close: [] }>()

const tenantStore = useTenantStore()
const name = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  if (loading.value || !name.value.trim()) return
  error.value = ''
  loading.value = true

  try {
    await tenantStore.createTenant(name.value.trim())
    emit('close')
  } catch {
    error.value = 'Tạo workspace thất bại. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Tạo Workspace mới</h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tên workspace</label>
          <input
            v-model="name"
            type="text"
            required
            placeholder="Ví dụ: Acme Corp"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <div class="flex gap-2 justify-end">
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
            {{ loading ? 'Đang tạo...' : 'Tạo' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
