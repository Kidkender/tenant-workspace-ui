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

    const savedTenantId = localStorage.getItem(STORAGE_KEYS.TENANT_ID)
    const validSaved = data.data.tenants.find((t) => t.id === savedTenantId)
    if (!validSaved) {
      localStorage.removeItem(STORAGE_KEYS.TENANT_ID)
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

  async function resendVerification(email: string) {
    await http.post('/email/verify/resend', { email })
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

  async function updateProfile(name: string) {
    const { data } = await http.put<ApiResponse<User>>('/me', { name })
    user.value = data.data
  }

  function addTenant(tenant: TenantMembership) {
    tenants.value = [...tenants.value, tenant]
  }

  return {
    token,
    user,
    tenants,
    isAuthenticated,
    login,
    register,
    resendVerification,
    logout,
    fetchMe,
    updateProfile,
    getTenantPermissions,
    addTenant,
  }
})
