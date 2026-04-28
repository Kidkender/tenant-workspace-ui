import { defineStore } from 'pinia'
import { ref } from 'vue'
import http from '@/lib/http'
import type { ActivityLog, ApiResponse, Paginator } from '@/types'

interface ActivityLogFilters {
  entity_type: string
  entity_id: string
  action: string
  user_id: string
}

export const useActivityLogStore = defineStore('activityLog', () => {
  const logs = ref<ActivityLog[]>([])
  const loading = ref(false)
  const total = ref(0)
  const lastPage = ref(1)
  const page = ref(1)
  const filters = ref<ActivityLogFilters>({ entity_type: '', entity_id: '', action: '', user_id: '' })

  async function fetchLogs(targetPage = 1) {
    loading.value = true
    page.value = targetPage
    try {
      const params: Record<string, string | number> = { page: targetPage }
      if (filters.value.entity_type) params.entity_type = filters.value.entity_type
      if (filters.value.entity_id) params.entity_id = filters.value.entity_id
      if (filters.value.action) params.action = filters.value.action
      if (filters.value.user_id) params.user_id = filters.value.user_id

      const { data } = await http.get<ApiResponse<Paginator<ActivityLog>>>('/activity-logs', { params })
      logs.value = data.data.data
      total.value = data.data.total
      lastPage.value = data.data.last_page
    } finally {
      loading.value = false
    }
  }

  function setFilter(key: keyof ActivityLogFilters, value: string) {
    filters.value = { ...filters.value, [key]: value }
  }

  return { logs, loading, total, lastPage, page, filters, fetchLogs, setFilter }
})
