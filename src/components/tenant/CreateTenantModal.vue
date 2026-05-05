<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTenantStore } from '@/stores/tenant'
import { useToastStore } from '@/stores/toast'
import BaseModal from '@/components/ui/BaseModal.vue'
import TextInput from '@/components/ui/TextInput.vue'

const emit = defineEmits<{ close: [] }>()

const tenantStore = useTenantStore()
const toastStore = useToastStore()
const { t } = useI18n()
const name = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  if (loading.value || !name.value.trim()) return
  error.value = ''
  loading.value = true

  try {
    await tenantStore.createTenant(name.value.trim())
    toastStore.success(t('tenant.success'))
    emit('close')
  } catch {
    error.value = t('tenant.createError')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <BaseModal :open="true" size="sm" title-id="create-tenant-title" @close="emit('close')">
    <h2 id="create-tenant-title" class="text-lg font-semibold text-gray-900 mb-4">
      {{ t('tenant.create') }}
    </h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <TextInput
        v-model="name"
        :label="t('tenant.name')"
        :placeholder="t('tenant.namePlaceholder')"
        required
      />

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <div class="flex gap-2 justify-end">
        <button
          type="button"
          @click="emit('close')"
          class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          {{ t('tenant.cancel') }}
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
        >
          {{ loading ? t('tenant.submitting') : t('tenant.submit') }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>
