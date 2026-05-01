<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTenantStore } from '@/stores/tenant'
import { useToastStore } from '@/stores/toast'

const tenantStore = useTenantStore()
const toastStore = useToastStore()
const { t } = useI18n()

const name = ref(tenantStore.currentTenant?.name ?? '')
const loading = ref(false)
const error = ref('')

const isOwner = computed(() => tenantStore.currentTenant?.role === 'owner')

watch(
  () => tenantStore.currentTenant?.name,
  (v) => { if (v) name.value = v },
)

async function handleSubmit() {
  if (loading.value || !name.value.trim()) return
  error.value = ''
  loading.value = true
  try {
    await tenantStore.updateTenant(name.value.trim())
    toastStore.success(t('settings.success'))
  } catch {
    error.value = t('settings.error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-lg space-y-6">
    <div>
      <h1 class="text-xl font-semibold text-gray-900">{{ t('settings.title') }}</h1>
      <p class="text-sm text-gray-500 mt-0.5">{{ t('settings.subtitle') }}</p>
    </div>

    <div v-if="!tenantStore.currentTenantId" class="text-center py-16 text-gray-400 text-sm">
      {{ t('tenant.noTenant') }}
    </div>

    <template v-else>
      <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">{{ t('settings.general') }}</h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('settings.workspaceName') }}</label>
            <input
              v-model="name"
              type="text"
              required
              :disabled="!isOwner"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('settings.slug') }}</label>
            <input
              :value="tenantStore.currentTenant?.slug"
              type="text"
              disabled
              class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p class="text-xs text-gray-400 mt-1">{{ t('settings.slugNote') }}</p>
          </div>

          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

          <div v-if="isOwner" class="flex justify-end">
            <button
              type="submit"
              :disabled="loading || name.trim() === tenantStore.currentTenant?.name"
              class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition"
            >
              {{ loading ? t('settings.saving') : t('settings.save') }}
            </button>
          </div>
          <p v-else class="text-xs text-gray-400">{{ t('settings.ownerOnly') }}</p>
        </form>
      </div>
    </template>
  </div>
</template>
