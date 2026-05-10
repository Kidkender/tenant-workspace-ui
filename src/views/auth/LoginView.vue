<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import { useApiError } from '@/composables/useApiError'
import LangSwitcher from '@/components/ui/LangSwitcher.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { t } = useI18n()
const { getErrorCode } = useApiError()

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
    const redirect = route.query.redirect as string | undefined
    router.push(redirect ?? { name: 'dashboard' })
  } catch (e: unknown) {
    if (getErrorCode(e) === 'auth.email_not_verified') {
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
  <div class="min-h-screen flex">

    <!-- Left panel -->
    <div class="hidden lg:flex lg:w-1/2 bg-gray-950 flex-col justify-between p-12 relative overflow-hidden">
      <!-- background decoration -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div class="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-violet-600/20 blur-3xl" />
      </div>

      <!-- Logo -->
      <RouterLink :to="{ name: 'landing' }" class="relative flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/40">
          <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </div>
        <span class="text-sm font-bold text-white">Tenant Workspace</span>
      </RouterLink>

      <!-- Center content -->
      <div class="relative">
        <div class="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-blue-400 uppercase bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full mb-6">
          <span class="w-1.5 h-1.5 rounded-full bg-blue-400" />
          {{ t('landing.hero.badge') }}
        </div>
        <h2 class="text-3xl font-bold text-white leading-snug mb-4">
          {{ t('landing.hero.titleLine1') }}<br />
          <span class="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            {{ t('landing.hero.titleLine2') }}
          </span>
        </h2>
        <p class="text-sm text-gray-400 leading-relaxed max-w-xs">{{ t('landing.hero.subtitle') }}</p>

        <!-- Stats -->
        <div class="mt-10 grid grid-cols-3 gap-6">
          <div v-for="stat in [{ value: '10k+', key: 'users' }, { value: '500k+', key: 'tasks' }, { value: '99.9%', key: 'uptime' }]" :key="stat.key">
            <p class="text-xl font-bold text-white">{{ stat.value }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ t(`landing.hero.stats.${stat.key}`) }}</p>
          </div>
        </div>
      </div>

      <!-- Bottom quote -->
      <p class="relative text-xs text-gray-600">© 2026 Tenant Workspace</p>
    </div>

    <!-- Right panel -->
    <div class="flex-1 flex flex-col">
      <!-- Top bar -->
      <div class="flex items-center justify-between px-8 pt-6">
        <!-- Mobile logo -->
        <RouterLink :to="{ name: 'landing' }" class="flex lg:hidden items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <span class="text-sm font-bold text-gray-900">Tenant Workspace</span>
        </RouterLink>
        <div class="hidden lg:block" />
        <div class="flex items-center gap-3">
          <LangSwitcher />
          <RouterLink
            :to="{ name: 'register' }"
            class="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            {{ t('auth.login.register') }} →
          </RouterLink>
        </div>
      </div>

      <!-- Form -->
      <div class="flex-1 flex items-center justify-center px-8 py-12">
        <div class="w-full max-w-sm">
          <h1 class="text-2xl font-bold text-gray-900 mb-1">{{ t('auth.login.title') }}</h1>
          <p class="text-sm text-gray-500 mb-8">{{ t('auth.login.subtitle') }}</p>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                {{ t('auth.login.email') }}
              </label>
              <input
                v-model="email"
                type="email"
                required
                autocomplete="email"
                placeholder="you@example.com"
                class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition placeholder-gray-400"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                {{ t('auth.login.password') }}
              </label>
              <input
                v-model="password"
                type="password"
                required
                autocomplete="current-password"
                placeholder="••••••••"
                class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition placeholder-gray-400"
              />
            </div>

            <div v-if="error" class="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ error }}
            </div>

            <div v-if="notVerified" class="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
              <p class="mb-2">{{ t('auth.login.errorNotVerified') }}</p>
              <RouterLink
                :to="{ name: 'verify-email', query: { email } }"
                class="font-semibold underline hover:text-amber-900"
              >
                {{ t('auth.login.goVerify') }}
              </RouterLink>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition mt-2 flex items-center justify-center gap-2 shadow-md shadow-gray-900/10"
            >
              <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ loading ? t('auth.login.submitting') : t('auth.login.submit') }}
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-gray-400">
            {{ t('auth.login.noAccount') }}
            <RouterLink :to="{ name: 'register' }" class="text-gray-900 font-semibold hover:underline">
              {{ t('auth.login.register') }}
            </RouterLink>
          </p>
        </div>
      </div>
    </div>

  </div>
</template>
