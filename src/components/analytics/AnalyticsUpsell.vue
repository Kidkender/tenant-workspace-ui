<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20 text-center">
    <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-5">
      <svg class="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    </div>
    <h2 class="text-lg font-semibold text-gray-800 mb-2">{{ t('analytics.upsell.title') }}</h2>
    <p class="text-sm text-gray-500 max-w-sm mb-6">{{ t('analytics.upsell.description') }}</p>
    <button
      @click="router.push({ name: 'billing' })"
      class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
    >
      {{ t('analytics.upsell.cta') }}
    </button>
  </div>
</template>
