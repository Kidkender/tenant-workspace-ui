import { defineStore } from 'pinia'
import { ref } from 'vue'
import http from '@/lib/http'
import type { ApiResponse, DashboardStats } from '@/types'

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<DashboardStats | null>(null)
  const loading = ref(false)

  async function fetchStats() {
    loading.value = true
    try {
      const { data } = await http.get<ApiResponse<DashboardStats>>('/dashboard/stats')
      stats.value = data.data
    } finally {
      loading.value = false
    }
  }

  return { stats, loading, fetchStats }
})
