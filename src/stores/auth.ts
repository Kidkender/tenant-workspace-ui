import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import http from '@/lib/http'
import { STORAGE_KEYS } from '@/lib/constants'
import type { User, TenantMembership, ApiResponse } from '@/types'

interface MeResponse {
  user: User
  tenants: TenantMembership[]
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(STORAGE_KEYS.TOKEN))
  const user = ref<User | null>(null)
  const tenants = ref<TenantMembership[]>([])

  const isAuthenticated = computed(() => !!token.value)

  async function fetchMe() {
    const { data } = await http.get<ApiResponse<MeResponse>>('/me')
    user.value = data.data.user
    tenants.value = data.data.tenants

    if (data.data.tenants.length > 0) {
      const savedTenantId = localStorage.getItem(STORAGE_KEYS.TENANT_ID)
      const validSaved = data.data.tenants.find((t) => t.id === savedTenantId)
      const defaultTenant = validSaved ?? data.data.tenants[0]
      if (defaultTenant) {
        localStorage.setItem(STORAGE_KEYS.TENANT_ID, defaultTenant.id)
      }
    }
  }

  async function login(email: string, password: string) {
    const { data } = await http.post<{ token: string }>('/auth/login', { email, password })

    token.value = data.token
    localStorage.setItem(STORAGE_KEYS.TOKEN, data.token)

    await fetchMe()
  }

  async function register(name: string, email: string, password: string) {
    await http.post('/auth/register', { name, email, password })
  }

  function logout() {
    token.value = null
    user.value = null
    tenants.value = []
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.TENANT_ID)
  }

  function getTenantPermissions(tenantId: string): string[] {
    return tenants.value.find((t) => t.id === tenantId)?.permissions ?? []
  }

  return { token, user, tenants, isAuthenticated, login, register, logout, fetchMe, getTenantPermissions }
})
