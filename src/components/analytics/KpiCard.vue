<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAnalyticsStore } from '@/stores/analytics'

const props = defineProps<{
  type: 'completion' | 'overdue'
}>()

const { t } = useI18n()
const store = useAnalyticsStore()

const loading = computed(() =>
  props.type === 'completion' ? store.loadingCompletion : store.loadingOverdue,
)
const error = computed(() =>
  props.type === 'completion' ? store.errorCompletion : store.errorOverdue,
)

const title = computed(() =>
  props.type === 'completion'
    ? t('analytics.kpi.completionRate')
    : t('analytics.kpi.overdueRate'),
)

const ratePercent = computed(() => {
  if (props.type === 'completion') {
    const rate = store.completionRate?.rate ?? 0
    return Math.round(rate * 100)
  }
  const rate = store.overdueRate?.rate ?? 0
  return Math.round(rate * 100)
})

const subtext = computed(() => {
  if (props.type === 'completion') {
    const d = store.completionRate
    if (!d) return ''
    return t('analytics.kpi.tasks', { completed: d.completed, total: d.total })
  }
  const d = store.overdueRate
  if (!d) return ''
  return t('analytics.kpi.open', { overdue: d.overdue, open_total: d.open_total })
})

const colorClass = computed(() =>
  props.type === 'completion'
    ? 'bg-green-50 text-green-700'
    : 'bg-red-50 text-red-700',
)

const dotClass = computed(() =>
  props.type === 'completion' ? 'bg-green-500' : 'bg-red-500',
)

function retry() {
  if (props.type === 'completion') store.fetchCompletionRate()
  else store.fetchOverdueRate()
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3" :class="colorClass">
    <!-- Loading skeleton -->
    <template v-if="loading">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-current opacity-30 animate-pulse" />
        <div class="h-3 w-28 bg-current opacity-20 rounded animate-pulse" />
      </div>
      <div class="h-10 w-20 bg-current opacity-20 rounded animate-pulse" />
      <div class="h-3 w-24 bg-current opacity-20 rounded animate-pulse" />
    </template>

    <!-- Error state -->
    <template v-else-if="error">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full" :class="dotClass" />
        <span class="text-sm font-medium">{{ title }}</span>
      </div>
      <p class="text-sm opacity-70">{{ t('analytics.error.load') }}</p>
      <button
        @click="retry"
        class="self-start text-xs underline opacity-70 hover:opacity-100 transition"
      >
        {{ t('analytics.error.retry') }}
      </button>
    </template>

    <!-- Data state -->
    <template v-else>
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full" :class="dotClass" />
        <span class="text-sm font-medium">{{ title }}</span>
      </div>
      <span class="text-4xl font-bold">{{ ratePercent }}%</span>
      <span class="text-sm opacity-70">{{ subtext }}</span>
    </template>
  </div>
</template>
