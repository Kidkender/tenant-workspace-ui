import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import http from '@/lib/http'
import { STORAGE_KEYS } from '@/lib/constants'
import { useAuthStore } from '@/stores/auth'
import type { TenantMembership } from '@/types'

export const useTenantStore = defineStore('tenant', () => {
  const currentTenantId = ref<string | null>(localStorage.getItem(STORAGE_KEYS.TENANT_ID))

  const authStore = useAuthStore()

  const tenants = computed<TenantMembership[]>(() => authStore.tenants)

  const currentTenant = computed<TenantMembership | null>(
    () => tenants.value.find((t) => t.id === currentTenantId.value) ?? null,
  )

  function switchTenant(tenantId: string) {
    currentTenantId.value = tenantId
    localStorage.setItem(STORAGE_KEYS.TENANT_ID, tenantId)
  }

  async function createTenant(name: string) {
    const { data } = await http.post<{ data: { id: string; name: string; slug: string } }>(
      '/tenants',
      { name },
    )
    const created = data.data

    switchTenant(created.id)

    // fetchMe để lấy permissions thật từ backend thay vì hardcode
    await authStore.fetchMe()

    return created
  }

  return { currentTenantId, currentTenant, tenants, switchTenant, createTenant }
})
