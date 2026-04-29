<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LangSwitcher from '@/components/ui/LangSwitcher.vue'

const { t } = useI18n()
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="absolute top-4 right-4">
      <LangSwitcher />
    </div>

    <div class="w-full max-w-sm bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
      <div class="mx-auto mb-4 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
        <svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 class="text-2xl font-semibold text-gray-900 mb-2">{{ t('auth.emailVerified.title') }}</h1>
      <p class="text-sm text-gray-500 mb-6">{{ t('auth.emailVerified.subtitle') }}</p>

      <RouterLink
        to="/login"
        class="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
      >
        {{ t('auth.emailVerified.login') }}
      </RouterLink>
    </div>
  </div>
</template>
