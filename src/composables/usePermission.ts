import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'

export function usePermission() {
  const authStore = useAuthStore()
  const tenantStore = useTenantStore()

  const permissions = computed<string[]>(() => {
    const tenantId = tenantStore.currentTenantId
    if (!tenantId) return []
    return authStore.getTenantPermissions(tenantId)
  })

  function can(permission: string): boolean {
    return permissions.value.includes(permission)
  }

  return { can }
}
