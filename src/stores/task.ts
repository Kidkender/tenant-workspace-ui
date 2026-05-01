import { defineStore } from 'pinia'
import { ref } from 'vue'
import http from '@/lib/http'
import type { Task, TaskStatus, ApiResponse, Paginator } from '@/types'

interface TaskFilters {
  status: TaskStatus | ''
  assigned_to: string
  search: string
}

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([])
  const currentTask = ref<Task | null>(null)
  const loading = ref(false)
  const total = ref(0)
  const page = ref(1)
  const lastPage = ref(1)
  const filters = ref<TaskFilters>({ status: '', assigned_to: '', search: '' })

  async function fetchTasks(targetPage = 1) {
    loading.value = true
    page.value = targetPage
    try {
      const params: Record<string, string | number> = { page: targetPage }
      if (filters.value.status) params.status = filters.value.status
      if (filters.value.assigned_to) params.assigned_to = filters.value.assigned_to
      if (filters.value.search) params.search = filters.value.search

      const { data } = await http.get<ApiResponse<Paginator<Task>>>('/tasks', { params })
      tasks.value = data.data.data
      total.value = data.data.total
      lastPage.value = data.data.last_page
    } finally {
      loading.value = false
    }
  }

  async function fetchTask(id: string) {
    loading.value = true
    try {
      const { data } = await http.get<ApiResponse<Task>>(`/tasks/${id}`)
      currentTask.value = data.data
    } finally {
      loading.value = false
    }
  }

  async function createTask(payload: {
    title: string
    description?: string
    assigned_to?: string
    due_date?: string
  }) {
    const { data } = await http.post<ApiResponse<Task>>('/tasks', payload)
    tasks.value = [data.data, ...tasks.value]
    return data.data
  }

  async function updateTask(
    id: string,
    payload: {
      title?: string
      description?: string
      status?: TaskStatus
      due_date?: string | null
    },
  ) {
    const { data } = await http.put<ApiResponse<Task>>(`/tasks/${id}`, payload)
    const idx = tasks.value.findIndex((t) => t.id === id)
    if (idx !== -1) tasks.value[idx] = data.data
    if (currentTask.value?.id === id) currentTask.value = data.data
    return data.data
  }

  async function assignTask(id: string, userId: string | null) {
    const { data } = await http.post<ApiResponse<Task>>(`/tasks/${id}/assign`, {
      user_id: userId,
    })
    const idx = tasks.value.findIndex((t) => t.id === id)
    if (idx !== -1) tasks.value[idx] = data.data
    if (currentTask.value?.id === id) currentTask.value = data.data
    return data.data
  }

  async function deleteTask(id: string) {
    await http.delete(`/tasks/${id}`)
    tasks.value = tasks.value.filter((t) => t.id !== id)
  }

  function setFilter(key: keyof TaskFilters, value: string) {
    filters.value = { ...filters.value, [key]: value }
  }

  return {
    tasks,
    currentTask,
    loading,
    total,
    page,
    lastPage,
    filters,
    fetchTasks,
    fetchTask,
    createTask,
    updateTask,
    assignTask,
    deleteTask,
    setFilter,
  }
})
