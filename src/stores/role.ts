import { defineStore } from 'pinia'
import { ref } from 'vue'
import http from '@/lib/http'
import type { ApiResponse, CustomRole, Permission } from '@/types'

export const useRoleStore = defineStore('role', () => {
  const roles = ref<CustomRole[]>([])
  const permissions = ref<Permission[]>([])
  const loading = ref(false)
  const saving = ref(false)

  async function fetchRoles(force = false) {
    if (!force && roles.value.length > 0) return
    loading.value = true
    try {
      const { data } = await http.get<ApiResponse<CustomRole[]>>('/roles')
      roles.value = data.data
    } finally {
      loading.value = false
    }
  }

  async function fetchPermissions() {
    if (permissions.value.length > 0) return
    const { data } = await http.get<ApiResponse<Permission[]>>('/permissions')
    permissions.value = data.data
  }

  async function createRole(payload: { name: string; description?: string; permissions: number[] }): Promise<CustomRole> {
    saving.value = true
    try {
      const { data } = await http.post<ApiResponse<CustomRole>>('/roles/custom', payload)
      roles.value = [...roles.value, data.data]
      return data.data
    } finally {
      saving.value = false
    }
  }

  async function updateRole(
    id: number,
    payload: { name?: string; description?: string; permissions?: number[] },
  ): Promise<CustomRole> {
    saving.value = true
    try {
      const { data } = await http.put<ApiResponse<CustomRole>>(`/roles/custom/${id}`, payload)
      roles.value = roles.value.map((r) => (r.id === id ? data.data : r))
      return data.data
    } finally {
      saving.value = false
    }
  }

  async function deleteRole(id: number): Promise<void> {
    await http.delete(`/roles/custom/${id}`)
    roles.value = roles.value.filter((r) => r.id !== id)
  }

  function invalidate() {
    roles.value = []
  }

  return {
    roles,
    permissions,
    loading,
    saving,
    fetchRoles,
    fetchPermissions,
    createRole,
    updateRole,
    deleteRole,
    invalidate,
  }
})
