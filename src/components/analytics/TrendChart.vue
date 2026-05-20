<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Chart } from 'chart.js'
import { useAnalyticsStore } from '@/stores/analytics'
import type { TrendGranularity, TrendMetric } from '@/types'

const { t } = useI18n()
const store = useAnalyticsStore()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const granularityOptions: { value: TrendGranularity; labelKey: string }[] = [
  { value: 'day', labelKey: 'analytics.trend.granularity.day' },
  { value: 'week', labelKey: 'analytics.trend.granularity.week' },
]

const metricOptions: { value: TrendMetric; labelKey: string }[] = [
  { value: 'both', labelKey: 'analytics.trend.metric.both' },
  { value: 'created', labelKey: 'analytics.trend.metric.created' },
  { value: 'completed', labelKey: 'analytics.trend.metric.completed' },
]

const hasData = computed(() => (store.trend?.points?.length ?? 0) > 0)

function buildChart() {
  if (!canvasRef.value || !store.trend) return
  chart?.destroy()

  const points = store.trend.points
  const labels = points.map((p) => p.bucket)
  const metric = store.trend.metric

  const datasets = []
  if (metric === 'created' || metric === 'both') {
    datasets.push({
      label: t('analytics.trend.created'),
      data: points.map((p) => p.created),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      tension: 0.3,
      fill: true,
    })
  }
  if (metric === 'completed' || metric === 'both') {
    datasets.push({
      label: t('analytics.trend.completed'),
      data: points.map((p) => p.completed),
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34,197,94,0.1)',
      tension: 0.3,
      fill: true,
    })
  }

  chart = new Chart(canvasRef.value, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top' } },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 } },
      },
    },
  })
}

async function changeGranularity(val: TrendGranularity) {
  store.setGranularity(val)
  await store.fetchTrend()
}

async function changeMetric(val: TrendMetric) {
  store.setMetric(val)
  await store.fetchTrend()
}

onMounted(() => {
  if (store.trend) buildChart()
})

watch(
  () => store.trend,
  () => buildChart(),
)

onUnmounted(() => {
  chart?.destroy()
  chart = null
})
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="text-sm font-semibold text-gray-700">{{ t('analytics.trend.title') }}</h2>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Granularity toggle -->
        <div class="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
          <button
            v-for="opt in granularityOptions"
            :key="opt.value"
            @click="changeGranularity(opt.value)"
            class="px-3 py-1.5 transition"
            :class="
              store.granularity === opt.value
                ? 'bg-blue-600 text-white font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            "
          >
            {{ t(opt.labelKey) }}
          </button>
        </div>

        <!-- Metric toggle -->
        <div class="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
          <button
            v-for="opt in metricOptions"
            :key="opt.value"
            @click="changeMetric(opt.value)"
            class="px-3 py-1.5 transition"
            :class="
              store.metric === opt.value
                ? 'bg-blue-600 text-white font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            "
          >
            {{ t(opt.labelKey) }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.loadingTrend" class="h-64 bg-gray-100 rounded-lg animate-pulse" />

    <!-- Error -->
    <div v-else-if="store.errorTrend" class="h-64 flex flex-col items-center justify-center gap-2 text-gray-400">
      <p class="text-sm">{{ t('analytics.error.load') }}</p>
      <button
        @click="store.fetchTrend()"
        class="text-xs text-blue-600 hover:underline"
      >
        {{ t('analytics.error.retry') }}
      </button>
    </div>

    <!-- Empty -->
    <div v-else-if="!hasData" class="h-64 flex items-center justify-center text-sm text-gray-400">
      {{ t('analytics.trend.noData') }}
    </div>

    <!-- Chart -->
    <div v-else class="h-64">
      <canvas ref="canvasRef" />
    </div>
  </div>
</template>
