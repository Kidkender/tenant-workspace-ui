<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import LangSwitcher from '@/components/ui/LangSwitcher.vue'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const email = ref('')
const password = ref('')
const error = ref('')
const notVerified = ref(false)
const loading = ref(false)

async function handleSubmit() {
  if (loading.value) return
  error.value = ''
  notVerified.value = false
  loading.value = true

  try {
    await authStore.login(email.value, password.value)
    router.push({ name: 'dashboard' })
  } catch (e: unknown) {
    if (axios.isAxiosError(e) && e.response?.status === 403) {
      notVerified.value = true
    } else {
      error.value = t('auth.login.error')
    }
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

    <div class="w-full max-w-sm bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h1 class="text-2xl font-semibold text-gray-900 mb-1">{{ t('auth.login.title') }}</h1>
      <p class="text-sm text-gray-500 mb-6">{{ t('auth.login.subtitle') }}</p>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.login.email') }}</label>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="you@example.com"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('auth.login.password') }}</label>
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="••••••••"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <div v-if="notVerified" class="rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
          <p class="mb-1">{{ t('auth.login.errorNotVerified') }}</p>
          <RouterLink
            :to="{ name: 'verify-email', query: { email } }"
            class="font-medium underline hover:text-yellow-900"
          >
            {{ t('auth.login.goVerify') }}
          </RouterLink>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition"
        >
          {{ loading ? t('auth.login.submitting') : t('auth.login.submit') }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-gray-500">
        {{ t('auth.login.noAccount') }}
        <RouterLink to="/register" class="text-blue-600 hover:underline font-medium">
          {{ t('auth.login.register') }}
        </RouterLink>
      </p>
    </div>
  </div>
</template>
