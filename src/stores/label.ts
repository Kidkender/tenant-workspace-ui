import { defineStore } from 'pinia'
import { ref } from 'vue'
import http from '@/lib/http'
import type { Label, ApiResponse } from '@/types'

export const useLabelStore = defineStore('label', () => {
  const labels = ref<Label[]>([])
  const loading = ref(false)

  async function fetchLabels() {
    loading.value = true
    try {
      const { data } = await http.get<ApiResponse<Label[]>>('/labels')
      labels.value = data.data
    } finally {
      loading.value = false
    }
  }

  async function createLabel(payload: { name: string; color?: string }) {
    const { data } = await http.post<ApiResponse<Label>>('/labels', payload)
    labels.value = [...labels.value, data.data]
    return data.data
  }

  async function updateLabel(id: string, payload: { name?: string; color?: string }) {
    const { data } = await http.put<ApiResponse<Label>>(`/labels/${id}`, payload)
    labels.value = labels.value.map((l) => (l.id === id ? data.data : l))
    return data.data
  }

  async function deleteLabel(id: string) {
    await http.delete(`/labels/${id}`)
    labels.value = labels.value.filter((l) => l.id !== id)
  }

  async function syncTaskLabels(taskId: string, labelIds: string[]) {
    const { data } = await http.post<ApiResponse<Label[]>>(`/tasks/${taskId}/labels/sync`, {
      label_ids: labelIds,
    })
    return data.data
  }

  return {
    labels,
    loading,
    fetchLabels,
    createLabel,
    updateLabel,
    deleteLabel,
    syncTaskLabels,
  }
})
