<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Chart } from 'chart.js'
import { useAnalyticsStore } from '@/stores/analytics'

const { t } = useI18n()
const store = useAnalyticsStore()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const hasData = computed(() => (store.priorityDistribution?.total ?? 0) > 0)

function buildChart() {
  if (!canvasRef.value || !store.priorityDistribution) return
  chart?.destroy()

  const d = store.priorityDistribution
  chart = new Chart(canvasRef.value, {
    type: 'doughnut',
    data: {
      labels: [
        t('analytics.priority.low'),
        t('analytics.priority.medium'),
        t('analytics.priority.high'),
        t('analytics.priority.urgent'),
      ],
      datasets: [
        {
          data: [d.low, d.medium, d.high, d.urgent],
          backgroundColor: ['#94a3b8', '#38bdf8', '#fbbf24', '#f43f5e'],
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
    },
  })
}

onMounted(() => {
  if (store.priorityDistribution) buildChart()
})

watch(
  () => store.priorityDistribution,
  () => buildChart(),
)

onUnmounted(() => {
  chart?.destroy()
  chart = null
})
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
    <h2 class="text-sm font-semibold text-gray-700">{{ t('analytics.priority.title') }}</h2>

    <div v-if="store.loadingPriority" class="h-56 bg-gray-100 rounded-lg animate-pulse" />

    <div v-else-if="store.errorPriority" class="h-56 flex flex-col items-center justify-center gap-2 text-gray-400">
      <p class="text-sm">{{ t('analytics.error.load') }}</p>
      <button @click="store.fetchPriorityDistribution()" class="text-xs text-blue-600 hover:underline">
        {{ t('analytics.error.retry') }}
      </button>
    </div>

    <div v-else-if="!hasData" class="h-56 flex items-center justify-center text-sm text-gray-400">
      {{ t('analytics.priority.noData') }}
    </div>

    <div v-else class="h-56">
      <canvas ref="canvasRef" />
    </div>
  </div>
</template>
