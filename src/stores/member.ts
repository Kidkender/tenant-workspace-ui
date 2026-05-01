import { defineStore } from 'pinia'
import { ref } from 'vue'
import http from '@/lib/http'
import type { ApiResponse, TenantMember, Role } from '@/types'

export const useMemberStore = defineStore('member', () => {
  const members = ref<TenantMember[]>([])
  const roles = ref<Role[]>([])
  const loading = ref(false)
  const inviting = ref(false)

  async function fetchMembers() {
    loading.value = true
    try {
      const { data } = await http.get<ApiResponse<TenantMember[]>>('/tenant/members')
      members.value = data.data
    } finally {
      loading.value = false
    }
  }

  async function fetchRoles() {
    if (roles.value.length > 0) return
    const { data } = await http.get<ApiResponse<Role[]>>('/roles')
    roles.value = data.data
  }

  async function invite(email: string, roleId: number) {
    inviting.value = true
    try {
      await http.post('/tenants/invite', { email, role_id: roleId })
    } finally {
      inviting.value = false
    }
  }

  async function acceptInvite(token: string) {
    await http.post(`/tenants/accept/${token}`)
  }

  async function removeMember(userId: string) {
    await http.delete(`/tenant/members/${userId}`)
    members.value = members.value.filter((m) => m.id !== userId)
  }

  async function updateMemberRole(userId: string, roleId: number) {
    await http.put(`/tenant/members/${userId}/role`, { role_id: roleId })
    const idx = members.value.findIndex((m) => m.id === userId)
    if (idx !== -1) {
      const role = roles.value.find((r) => r.id === roleId)
      members.value[idx] = { ...members.value[idx], role: role?.name ?? null }
    }
  }

  return {
    members,
    roles,
    loading,
    inviting,
    fetchMembers,
    fetchRoles,
    invite,
    acceptInvite,
    removeMember,
    updateMemberRole,
  }
})
