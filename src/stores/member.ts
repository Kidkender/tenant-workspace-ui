import { defineStore } from 'pinia'
import { ref } from 'vue'
import http from '@/lib/http'
import type { ApiResponse, TenantMember } from '@/types'

export const useMemberStore = defineStore('member', () => {
  const members = ref<TenantMember[]>([])
  const loading = ref(false)

  async function fetchMembers() {
    loading.value = true
    try {
      const { data } = await http.get<ApiResponse<TenantMember[]>>('/tenant/members')
      members.value = data.data
    } finally {
      loading.value = false
    }
  }

  return { members, loading, fetchMembers }
})
