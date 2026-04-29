<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import LangSwitcher from '@/components/ui/LangSwitcher.vue'

const route = useRoute()
const authStore = useAuthStore()
const { t } = useI18n()

const email = ref((route.query.email as string) ?? '')
const loading = ref(false)
const resent = ref(false)

async function handleResend() {
  if (loading.value || !email.value) return
  loading.value = true
  resent.value = false

  try {
    await authStore.resendVerification(email.value)
    resent.value = true
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="absolute top-4 right-4">
      <LangSwitcher />
    </div>

    <div class="w-full max-w-sm bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
      <div class="mx-auto mb-4 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
        <svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      <h1 class="text-2xl font-semibold text-gray-900 mb-2">{{ t('auth.verifyEmail.title') }}</h1>
      <p class="text-sm text-gray-500 mb-1">{{ t('auth.verifyEmail.subtitle') }}</p>
      <p class="text-sm font-medium text-gray-800 mb-6 break-all">{{ email }}</p>

      <p v-if="resent" class="text-sm text-green-600 mb-4">{{ t('auth.verifyEmail.resendSuccess') }}</p>

      <button
        @click="handleResend"
        :disabled="loading"
        class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition mb-3"
      >
        {{ loading ? t('auth.verifyEmail.resending') : t('auth.verifyEmail.resend') }}
      </button>

      <RouterLink to="/login" class="text-sm text-gray-500 hover:text-gray-700 hover:underline">
        {{ t('auth.verifyEmail.backToLogin') }}
      </RouterLink>
    </div>
  </div>
</template>
