<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Chart } from 'chart.js'
import { useAnalyticsStore } from '@/stores/analytics'

const { t } = useI18n()
const store = useAnalyticsStore()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const hasData = computed(() => store.tasksPerUser.length > 0)

// Top 10 sorted by total desc
const top10 = computed(() =>
  [...store.tasksPerUser].sort((a, b) => b.total - a.total).slice(0, 10),
)

function buildChart() {
  if (!canvasRef.value || !hasData.value) return
  chart?.destroy()

  const users = top10.value
  chart = new Chart(canvasRef.value, {
    type: 'bar',
    data: {
      labels: users.map((u) => u.name),
      datasets: [
        {
          label: t('dashboard.todo'),
          data: users.map((u) => u.todo),
          backgroundColor: '#94a3b8',
        },
        {
          label: t('dashboard.doing'),
          data: users.map((u) => u.doing),
          backgroundColor: '#fbbf24',
        },
        {
          label: t('dashboard.completed'),
          data: users.map((u) => u.completed),
          backgroundColor: '#22c55e',
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { stacked: true, ticks: { precision: 0 } },
        y: { stacked: true },
      },
    },
  })
}

onMounted(() => {
  if (hasData.value) buildChart()
})

watch(
  () => store.tasksPerUser,
  () => buildChart(),
)

onUnmounted(() => {
  chart?.destroy()
  chart = null
})
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
    <h2 class="text-sm font-semibold text-gray-700">{{ t('analytics.tasksPerUser.title') }}</h2>

    <div v-if="store.loadingTasksPerUser" class="h-56 bg-gray-100 rounded-lg animate-pulse" />

    <div v-else-if="store.errorTasksPerUser" class="h-56 flex flex-col items-center justify-center gap-2 text-gray-400">
      <p class="text-sm">{{ t('analytics.error.load') }}</p>
      <button @click="store.fetchTasksPerUser()" class="text-xs text-blue-600 hover:underline">
        {{ t('analytics.error.retry') }}
      </button>
    </div>

    <div v-else-if="!hasData" class="h-56 flex items-center justify-center text-sm text-gray-400">
      {{ t('analytics.tasksPerUser.noData') }}
    </div>

    <div v-else class="h-56">
      <canvas ref="canvasRef" />
    </div>
  </div>
</template>
