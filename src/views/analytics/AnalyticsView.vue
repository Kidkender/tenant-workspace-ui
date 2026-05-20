<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBillingStore } from '@/stores/billing'
import { useAnalyticsStore } from '@/stores/analytics'
import AnalyticsDateFilter from '@/components/analytics/AnalyticsDateFilter.vue'
import KpiCard from '@/components/analytics/KpiCard.vue'
import TrendChart from '@/components/analytics/TrendChart.vue'
import PriorityChart from '@/components/analytics/PriorityChart.vue'
import TasksPerUserChart from '@/components/analytics/TasksPerUserChart.vue'
import AnalyticsUpsell from '@/components/analytics/AnalyticsUpsell.vue'

const { t } = useI18n()
const billingStore = useBillingStore()
const analyticsStore = useAnalyticsStore()

const hasAnalytics = computed(() =>
  billingStore.subscription?.plan?.features?.some(
    (f) => f.feature_key === 'analytics' && f.value === 'true',
  ) ?? false,
)

onMounted(async () => {
  await billingStore.fetchSubscription()
  if (hasAnalytics.value) {
    await analyticsStore.fetchAll()
  }
})

watch(hasAnalytics, (val) => {
  if (val) analyticsStore.fetchAll()
})

watch(
  () => analyticsStore.range,
  () => {
    if (!hasAnalytics.value) return
    analyticsStore.fetchCompletionRate()
    analyticsStore.fetchPriorityDistribution()
    analyticsStore.fetchTasksPerUser()
    analyticsStore.fetchTrend()
  },
  { deep: true },
)
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-gray-900">{{ t('analytics.title') }}</h1>

    <div v-if="billingStore.loadingSubscription" class="space-y-4">
      <div class="h-10 bg-gray-100 rounded-lg animate-pulse w-64" />
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="h-28 bg-gray-100 rounded-xl animate-pulse" />
        <div class="h-28 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    </div>

    <AnalyticsUpsell v-else-if="!hasAnalytics" />


    <template v-else>
      <AnalyticsDateFilter />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiCard type="completion" />
        <KpiCard type="overdue" />
      </div>

      <TrendChart />

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriorityChart />
        <TasksPerUserChart />
      </div>
    </template>
  </div>
</template>
