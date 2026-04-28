<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const authStore = useAuthStore()
const toastStore = useToastStore()
const { t } = useI18n()

const name = ref(authStore.user?.name ?? '')
const loading = ref(false)
const error = ref('')

watch(
  () => authStore.user?.name,
  (v) => { if (v) name.value = v },
)

async function handleSubmit() {
  if (loading.value || !name.value.trim()) return
  error.value = ''
  loading.value = true
  try {
    await authStore.updateProfile(name.value.trim())
    toastStore.success(t('profile.success'))
  } catch {
    error.value = t('profile.error')
  } finally {
    loading.value = false
  }
}

function initials(n: string) {
  return n.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
}
</script>

<template>
  <div class="max-w-lg space-y-6">
    <h1 class="text-xl font-semibold text-gray-900">{{ t('profile.title') }}</h1>

    <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-blue-600 text-white text-xl font-bold flex items-center justify-center uppercase">
          {{ initials(authStore.user?.name ?? '?') }}
        </div>
        <div>
          <p class="font-semibold text-gray-900">{{ authStore.user?.name }}</p>
          <p class="text-sm text-gray-500">{{ authStore.user?.email }}</p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('profile.name') }}</label>
          <input
            v-model="name"
            type="text"
            required
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('profile.email') }}</label>
          <input
            :value="authStore.user?.email"
            type="email"
            disabled
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
          />
          <p class="text-xs text-gray-400 mt-1">{{ t('profile.emailNote') }}</p>
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="loading || name.trim() === authStore.user?.name"
            class="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition"
          >
            {{ loading ? t('profile.saving') : t('profile.save') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
