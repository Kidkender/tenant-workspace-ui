<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import LangSwitcher from '@/components/ui/LangSwitcher.vue'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  if (loading.value) return
  error.value = ''
  loading.value = true

  try {
    await authStore.register(name.value, email.value, password.value)
    router.push({ name: 'verify-email', query: { email: email.value } })
  } catch {
    error.value = t('auth.register.error')
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
        <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div class="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl" />
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

      <!-- Feature list -->
      <div class="relative space-y-5">
        <p class="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-6">
          {{ t('landing.features.label') }}
        </p>

        <div
          v-for="item in [
            { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', key: 'tasks' },
            { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', key: 'team' },
            { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', key: 'activity' },
          ]"
          :key="item.key"
          class="flex items-start gap-3"
        >
          <div class="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0 mt-0.5">
            <svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="item.icon" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-white">{{ t(`landing.features.${item.key}.title`) }}</p>
            <p class="text-xs text-gray-500 mt-0.5 leading-relaxed">{{ t(`landing.features.${item.key}.desc`) }}</p>
          </div>
        </div>
      </div>

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
            :to="{ name: 'login' }"
            class="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            {{ t('auth.register.login') }} →
          </RouterLink>
        </div>
      </div>

      <!-- Form -->
      <div class="flex-1 flex items-center justify-center px-8 py-12">
        <div class="w-full max-w-sm">
          <h1 class="text-2xl font-bold text-gray-900 mb-1">{{ t('auth.register.title') }}</h1>
          <p class="text-sm text-gray-500 mb-8">{{ t('auth.register.subtitle') }}</p>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                {{ t('auth.register.name') }}
              </label>
              <input
                v-model="name"
                type="text"
                required
                placeholder="Nguyen Van A"
                class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition placeholder-gray-400"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                {{ t('auth.register.email') }}
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
                {{ t('auth.register.password') }}
              </label>
              <input
                v-model="password"
                type="password"
                required
                minlength="8"
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

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition mt-2 flex items-center justify-center gap-2 shadow-md shadow-gray-900/10"
            >
              <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ loading ? t('auth.register.submitting') : t('auth.register.submit') }}
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-gray-400">
            {{ t('auth.register.hasAccount') }}
            <RouterLink :to="{ name: 'login' }" class="text-gray-900 font-semibold hover:underline">
              {{ t('auth.register.login') }}
            </RouterLink>
          </p>
        </div>
      </div>
    </div>

  </div>
</template>
