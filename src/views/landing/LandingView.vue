<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useBillingStore } from '@/stores/billing'
import LangSwitcher from '@/components/ui/LangSwitcher.vue'

const { t } = useI18n()
const billingStore = useBillingStore()

onMounted(() => {
  billingStore.fetchPlans()
})

const features = [
  {
    icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />`,
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    key: 'tasks',
  },
  {
    icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />`,
    color: 'from-violet-500 to-violet-600',
    bg: 'bg-violet-50',
    key: 'team',
  },
  {
    icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />`,
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50',
    key: 'activity',
  },
]

const stats = [
  { value: '10k+', key: 'users' },
  { value: '500k+', key: 'tasks' },
  { value: '99.9%', key: 'uptime' },
]

const footerLinks = {
  product: ['features', 'pricing', 'changelog'],
  company: ['about', 'blog', 'careers'],
  support: ['docs', 'contact', 'status'],
}

function formatPrice(price: number): string {
  if (price === 0) return t('landing.pricing.free')
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price)
}

function featureLabel(key: string, value: string | null): string {
  if (value === null) return t(`landing.pricing.featureKeys.${key}_unlimited`, key)
  if (key === 'can_create_task') return t('landing.pricing.featureKeys.can_create_task')
  if (key === 'task_limit') return t('landing.pricing.featureKeys.task_limit', { n: value })
  if (key === 'member_limit') return t('landing.pricing.featureKeys.member_limit', { n: value })
  if (key === 'storage_mb') return t('landing.pricing.featureKeys.storage_mb', { n: value })
  if (value === 'true') return t(`landing.pricing.featureKeys.${key}`)
  if (value === 'false') return ''
  return `${key}: ${value}`
}
</script>

<template>
  <div class="min-h-screen bg-white text-gray-900 antialiased">

    <!-- ── Navbar ─────────────────────────────────────────── -->
    <header class="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <span class="text-sm font-bold text-gray-900">Tenant Workspace</span>
        </div>

        <nav class="hidden md:flex items-center gap-7 text-sm text-gray-500">
          <a href="#features" class="hover:text-gray-900 transition-colors">{{ t('landing.nav.features') }}</a>
          <a href="#pricing" class="hover:text-gray-900 transition-colors">{{ t('landing.nav.pricing') }}</a>
        </nav>

        <div class="flex items-center gap-1.5">
          <LangSwitcher />
          <RouterLink
            :to="{ name: 'login' }"
            class="px-3.5 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition"
          >
            {{ t('landing.nav.login') }}
          </RouterLink>
          <RouterLink
            :to="{ name: 'register' }"
            class="px-4 py-1.5 text-sm font-semibold bg-gray-900 hover:bg-gray-700 text-white rounded-lg transition"
          >
            {{ t('landing.nav.getStarted') }}
          </RouterLink>
        </div>
      </div>
    </header>

    <!-- ── Hero ──────────────────────────────────────────── -->
    <section class="relative pt-32 pb-28 px-6 overflow-hidden">
      <!-- background blobs -->
      <div class="absolute inset-0 -z-10 pointer-events-none">
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-gradient-to-br from-blue-50 via-violet-50 to-white blur-3xl opacity-80" />
        <div class="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-blue-100 blur-3xl opacity-40" />
      </div>

      <div class="max-w-3xl mx-auto text-center">
        <span class="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full mb-6">
          <span class="w-1.5 h-1.5 rounded-full bg-blue-500" />
          {{ t('landing.hero.badge') }}
        </span>

        <h1 class="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-[1.08] tracking-tight mb-6">
          {{ t('landing.hero.titleLine1') }}<br />
          <span class="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            {{ t('landing.hero.titleLine2') }}
          </span>
        </h1>

        <p class="text-lg text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
          {{ t('landing.hero.subtitle') }}
        </p>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <RouterLink
            :to="{ name: 'register' }"
            class="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold bg-gray-900 hover:bg-gray-700 text-white rounded-xl transition shadow-md shadow-gray-900/10"
          >
            {{ t('landing.hero.cta') }}
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </RouterLink>
          <RouterLink
            :to="{ name: 'login' }"
            class="inline-flex items-center justify-center px-6 py-3 text-sm font-medium border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl transition"
          >
            {{ t('landing.hero.login') }}
          </RouterLink>
        </div>
      </div>

      <!-- Stats row -->
      <div class="mt-20 max-w-lg mx-auto grid grid-cols-3 gap-6">
        <div v-for="stat in stats" :key="stat.key" class="text-center">
          <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
          <p class="text-xs text-gray-400 mt-0.5">{{ t(`landing.hero.stats.${stat.key}`) }}</p>
        </div>
      </div>
    </section>

    <!-- ── Features ──────────────────────────────────────── -->
    <section id="features" class="py-24 px-6 bg-gray-950 text-white">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-16">
          <p class="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-3">{{ t('landing.features.label') }}</p>
          <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">{{ t('landing.features.title') }}</h2>
          <p class="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">{{ t('landing.features.subtitle') }}</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div
            v-for="feature in features"
            :key="feature.key"
            class="group bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-2xl p-6 transition-colors"
          >
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
              :class="feature.bg"
            >
              <svg class="w-5 h-5" :class="`bg-gradient-to-br ${feature.color} bg-clip-text`" fill="none" viewBox="0 0 24 24" stroke="currentColor" :style="`color: white; background: none;`">
                <!-- eslint-disable-next-line vue/no-v-html -->
                <g v-html="feature.icon" />
              </svg>
            </div>
            <h3 class="font-semibold text-white mb-2">{{ t(`landing.features.${feature.key}.title`) }}</h3>
            <p class="text-sm text-gray-400 leading-relaxed">{{ t(`landing.features.${feature.key}.desc`) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Pricing ───────────────────────────────────────── -->
    <section id="pricing" class="py-24 px-6 bg-white">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-16">
          <p class="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">{{ t('landing.pricing.label') }}</p>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{{ t('landing.pricing.title') }}</h2>
          <p class="text-gray-500 text-sm">{{ t('landing.pricing.subtitle') }}</p>
        </div>

        <div v-if="billingStore.loadingPlans" class="text-center text-sm text-gray-400 py-12">
          <div class="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
          {{ t('landing.pricing.loading') }}
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
          <div
            v-for="(plan, index) in billingStore.plans"
            :key="plan.id"
            class="rounded-2xl p-6 flex flex-col gap-6 relative"
            :class="index === 1
              ? 'bg-gray-900 text-white border border-gray-700 shadow-2xl shadow-gray-900/20 scale-[1.02]'
              : 'bg-white border border-gray-200 shadow-sm'"
          >
            <span
              v-if="index === 1"
              class="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold bg-gradient-to-r from-blue-500 to-violet-500 text-white px-4 py-1 rounded-full"
            >
              {{ t('landing.pricing.popular') }}
            </span>

            <div>
              <p class="text-xs font-semibold tracking-widest uppercase mb-3" :class="index === 1 ? 'text-blue-400' : 'text-gray-400'">
                {{ plan.name }}
              </p>
              <div class="flex items-end gap-1.5">
                <span class="text-4xl font-extrabold" :class="index === 1 ? 'text-white' : 'text-gray-900'">
                  {{ formatPrice(plan.price_monthly) }}
                </span>
                <span v-if="plan.price_monthly > 0" class="text-sm mb-1.5" :class="index === 1 ? 'text-gray-400' : 'text-gray-400'">
                  /{{ t('landing.pricing.month') }}
                </span>
              </div>
            </div>

            <ul class="space-y-2.5 flex-1">
              <template v-for="feature in plan.features" :key="feature.id">
                <li
                  v-if="featureLabel(feature.feature_key, feature.value)"
                  class="flex items-center gap-2.5 text-sm"
                  :class="index === 1 ? 'text-gray-300' : 'text-gray-600'"
                >
                  <svg class="w-4 h-4 shrink-0" :class="index === 1 ? 'text-blue-400' : 'text-green-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ featureLabel(feature.feature_key, feature.value) }}
                </li>
              </template>
            </ul>

            <RouterLink
              :to="{ name: 'register' }"
              class="block w-full py-2.5 text-sm font-semibold text-center rounded-xl transition"
              :class="index === 1
                ? 'bg-white text-gray-900 hover:bg-gray-100'
                : 'bg-gray-900 hover:bg-gray-700 text-white'"
            >
              {{ t('landing.pricing.cta') }}
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ── CTA Banner ─────────────────────────────────────── -->
    <section class="py-20 px-6 bg-gradient-to-br from-blue-600 via-blue-700 to-violet-700">
      <div class="max-w-2xl mx-auto text-center">
        <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">{{ t('landing.cta.title') }}</h2>
        <p class="text-blue-100 text-sm mb-8">{{ t('landing.cta.subtitle') }}</p>
        <RouterLink
          :to="{ name: 'register' }"
          class="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold bg-white text-blue-700 hover:bg-blue-50 rounded-xl transition shadow-lg"
        >
          {{ t('landing.cta.button') }}
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </RouterLink>
      </div>
    </section>

    <!-- ── Footer ─────────────────────────────────────────── -->
    <footer class="bg-gray-950 text-gray-400 pt-16 pb-8 px-6">
      <div class="max-w-6xl mx-auto">

        <!-- Top grid -->
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          <!-- Brand -->
          <div class="col-span-2 sm:col-span-2">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <span class="text-sm font-bold text-white">Tenant Workspace</span>
            </div>
            <p class="text-sm text-gray-500 leading-relaxed max-w-xs">{{ t('landing.footer.desc') }}</p>
          </div>

          <!-- Links -->
          <div v-for="group in Object.keys(footerLinks)" :key="group">
            <p class="text-xs font-semibold tracking-widest uppercase text-gray-300 mb-4">
              {{ t(`landing.footer.groups.${group}`) }}
            </p>
            <ul class="space-y-2.5">
              <li v-for="link in footerLinks[group as keyof typeof footerLinks]" :key="link">
                <a href="#" class="text-sm text-gray-500 hover:text-gray-200 transition-colors">
                  {{ t(`landing.footer.links.${link}`) }}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom row -->
        <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <span>{{ t('landing.footer.rights') }}</span>
          <div class="flex items-center gap-5">
            <a href="#" class="hover:text-gray-400 transition-colors">{{ t('landing.footer.privacy') }}</a>
            <a href="#" class="hover:text-gray-400 transition-colors">{{ t('landing.footer.terms') }}</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
