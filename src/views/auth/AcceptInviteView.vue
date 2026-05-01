<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMemberStore } from '@/stores/member'
import { useAuthStore } from '@/stores/auth'
import LangSwitcher from '@/components/ui/LangSwitcher.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const memberStore = useMemberStore()
const authStore = useAuthStore()

type State = 'loading' | 'success' | 'error'
const state = ref<State>('loading')

onMounted(async () => {
  const token = route.query.token as string | undefined
  if (!token) {
    state.value = 'error'
    return
  }

  try {
    await memberStore.acceptInvite(token)
    await authStore.fetchMe()
    state.value = 'success'
  } catch {
    state.value = 'error'
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="absolute top-4 right-4">
      <LangSwitcher />
    </div>

    <div class="w-full max-w-sm bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">

      <template v-if="state === 'loading'">
        <div class="mx-auto mb-4 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <svg class="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>
        <p class="text-sm text-gray-500">{{ t('auth.acceptInvite.accepting') }}</p>
      </template>

      <template v-else-if="state === 'success'">
        <div class="mx-auto mb-4 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p class="text-lg font-semibold text-gray-900 mb-6">{{ t('auth.acceptInvite.success') }}</p>
        <button
          @click="router.push({ name: 'dashboard' })"
          class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          {{ t('auth.acceptInvite.goToDashboard') }}
        </button>
      </template>

      <template v-else>
        <div class="mx-auto mb-4 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <svg class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p class="text-sm text-gray-600 mb-6">{{ t('auth.acceptInvite.invalidToken') }}</p>
        <RouterLink to="/login" class="text-sm text-blue-600 hover:underline">
          {{ t('auth.acceptInvite.backToLogin') }}
        </RouterLink>
      </template>

    </div>
  </div>
</template>
