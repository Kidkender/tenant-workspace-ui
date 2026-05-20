import { defineStore } from 'pinia'
import { ref } from 'vue'
import http from '@/lib/http'
import type {
  ApiResponse,
  AnalyticsDateRange,
  CompletionRateData,
  OverdueRateData,
  PriorityDistributionData,
  TasksPerUserItem,
  TrendData,
  TrendGranularity,
  TrendMetric,
} from '@/types'

function defaultRange(): AnalyticsDateRange {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 30)
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  }
}

export const useAnalyticsStore = defineStore('analytics', () => {
  const range = ref<AnalyticsDateRange>(defaultRange())
  const granularity = ref<TrendGranularity>('day')
  const metric = ref<TrendMetric>('both')

  const completionRate = ref<CompletionRateData | null>(null)
  const overdueRate = ref<OverdueRateData | null>(null)
  const priorityDistribution = ref<PriorityDistributionData | null>(null)
  const tasksPerUser = ref<TasksPerUserItem[]>([])
  const trend = ref<TrendData | null>(null)

  const loadingCompletion = ref(false)
  const loadingOverdue = ref(false)
  const loadingPriority = ref(false)
  const loadingTasksPerUser = ref(false)
  const loadingTrend = ref(false)

  const errorCompletion = ref<string | null>(null)
  const errorOverdue = ref<string | null>(null)
  const errorPriority = ref<string | null>(null)
  const errorTasksPerUser = ref<string | null>(null)
  const errorTrend = ref<string | null>(null)

  async function fetchAll() {
    await Promise.all([
      fetchCompletionRate(),
      fetchOverdueRate(),
      fetchPriorityDistribution(),
      fetchTasksPerUser(),
      fetchTrend(),
    ])
  }

  async function fetchCompletionRate() {
    loadingCompletion.value = true
    errorCompletion.value = null
    try {
      const { data } = await http.get<ApiResponse<CompletionRateData>>(
        '/analytics/completion-rate',
        { params: range.value },
      )
      completionRate.value = data.data
    } catch {
      errorCompletion.value = 'error'
    } finally {
      loadingCompletion.value = false
    }
  }

  async function fetchOverdueRate() {
    loadingOverdue.value = true
    errorOverdue.value = null
    try {
      const { data } = await http.get<ApiResponse<OverdueRateData>>('/analytics/overdue-rate')
      overdueRate.value = data.data
    } catch {
      errorOverdue.value = 'error'
    } finally {
      loadingOverdue.value = false
    }
  }

  async function fetchPriorityDistribution() {
    loadingPriority.value = true
    errorPriority.value = null
    try {
      const { data } = await http.get<ApiResponse<PriorityDistributionData>>(
        '/analytics/priority-distribution',
        { params: range.value },
      )
      priorityDistribution.value = data.data
    } catch {
      errorPriority.value = 'error'
    } finally {
      loadingPriority.value = false
    }
  }

  async function fetchTasksPerUser() {
    loadingTasksPerUser.value = true
    errorTasksPerUser.value = null
    try {
      const { data } = await http.get<ApiResponse<TasksPerUserItem[]>>(
        '/analytics/tasks-per-user',
        { params: range.value },
      )
      tasksPerUser.value = data.data
    } catch {
      errorTasksPerUser.value = 'error'
    } finally {
      loadingTasksPerUser.value = false
    }
  }

  async function fetchTrend() {
    loadingTrend.value = true
    errorTrend.value = null
    try {
      const { data } = await http.get<ApiResponse<TrendData>>('/analytics/trend', {
        params: {
          ...range.value,
          granularity: granularity.value,
          metric: metric.value,
        },
      })
      trend.value = data.data
    } catch {
      errorTrend.value = 'error'
    } finally {
      loadingTrend.value = false
    }
  }

  function setRange(newRange: AnalyticsDateRange) {
    range.value = { ...newRange }
  }

  function setGranularity(val: TrendGranularity) {
    granularity.value = val
  }

  function setMetric(val: TrendMetric) {
    metric.value = val
  }

  return {
    range,
    granularity,
    metric,
    completionRate,
    overdueRate,
    priorityDistribution,
    tasksPerUser,
    trend,
    loadingCompletion,
    loadingOverdue,
    loadingPriority,
    loadingTasksPerUser,
    loadingTrend,
    errorCompletion,
    errorOverdue,
    errorPriority,
    errorTasksPerUser,
    errorTrend,
    fetchAll,
    fetchCompletionRate,
    fetchOverdueRate,
    fetchPriorityDistribution,
    fetchTasksPerUser,
    fetchTrend,
    setRange,
    setGranularity,
    setMetric,
  }
})
