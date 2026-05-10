<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTenantStore } from '@/stores/tenant'
import { useAuthStore } from '@/stores/auth'
import LangSwitcher from '@/components/ui/LangSwitcher.vue'

const router = useRouter()
const { t } = useI18n()
const tenantStore = useTenantStore()
const authStore = useAuthStore()

const showCreateForm = ref(tenantStore.tenants.length === 0)
const newName = ref('')
const creating = ref(false)
const createError = ref('')

const GRADIENT_COLORS = [
  'from-blue-500 to-blue-700',
  'from-violet-500 to-violet-700',
  'from-emerald-500 to-emerald-700',
  'from-rose-500 to-rose-700',
  'from-amber-500 to-amber-700',
  'from-cyan-500 to-cyan-700',
]

function gradientFor(index: number): string {
  return GRADIENT_COLORS[index % GRADIENT_COLORS.length] ?? GRADIENT_COLORS[0] ?? ''
}

function enterWorkspace(tenantId: string) {
  tenantStore.switchTenant(tenantId)
  router.push({ name: 'dashboard' })
}

async function handleCreate() {
  if (creating.value || !newName.value.trim()) return
  createError.value = ''
  creating.value = true
  try {
    await tenantStore.createTenant(newName.value.trim())
    router.push({ name: 'dashboard' })
  } catch {
    createError.value = t('tenant.createError')
  } finally {
    creating.value = false
  }
}

function logout() {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">

    <!-- Top bar -->
    <header class="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
          <svg class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </div>
        <span class="text-sm font-bold text-gray-900">Tenant Workspace</span>
      </div>
      <div class="flex items-center gap-3">
        <LangSwitcher />
        <button
          @click="logout"
          class="text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          {{ t('user.logout') }}
        </button>
      </div>
    </header>

    <!-- Main content -->
    <div class="flex-1 flex items-start justify-center px-4 py-16">
      <div class="w-full max-w-2xl">

        <!-- Heading -->
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 mb-4">
            <svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ t('tenant.selectTitle') }}</h1>
          <p class="text-sm text-gray-500">{{ t('tenant.selectSubtitle') }}</p>
        </div>

        <!-- Workspace list -->
        <div v-if="tenantStore.tenants.length > 0" class="space-y-3 mb-6">
          <button
            v-for="(tenant, index) in tenantStore.tenants"
            :key="tenant.id"
            @click="enterWorkspace(tenant.id)"
            class="w-full flex items-center gap-4 bg-white border border-gray-200 hover:border-blue-300 hover:shadow-sm rounded-2xl p-4 text-left transition group"
          >
            <!-- Avatar -->
            <div
              class="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0 bg-gradient-to-br"
              :class="gradientFor(index)"
            >
              {{ tenant.name.charAt(0).toUpperCase() }}
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-900 truncate">{{ tenant.name }}</p>
              <p class="text-xs text-gray-400 mt-0.5 capitalize">{{ tenant.role }}</p>
            </div>

            <!-- Arrow -->
            <div class="text-gray-300 group-hover:text-blue-500 transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        <!-- Empty state -->
        <div v-else-if="!showCreateForm" class="text-center py-12 mb-6">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-100 mb-4">
            <svg class="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p class="font-semibold text-gray-700 mb-1">{{ t('tenant.noWorkspaces') }}</p>
          <p class="text-sm text-gray-400">{{ t('tenant.noWorkspacesDesc') }}</p>
        </div>

        <!-- Create workspace -->
        <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <!-- Toggle header (only when user has workspaces) -->
          <button
            v-if="tenantStore.tenants.length > 0"
            @click="showCreateForm = !showCreateForm"
            class="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <svg
                class="w-4 h-4 text-gray-500 transition-transform duration-200"
                :class="showCreateForm ? 'rotate-45' : ''"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span class="text-sm font-semibold text-gray-700">{{ t('tenant.createTitle') }}</span>
          </button>

          <!-- Create form -->
          <div v-if="showCreateForm" :class="tenantStore.tenants.length > 0 ? 'border-t border-gray-100' : ''">
            <div class="px-5 py-5">
              <p v-if="tenantStore.tenants.length === 0" class="text-sm font-semibold text-gray-700 mb-4">
                {{ t('tenant.createTitle') }}
              </p>
              <form @submit.prevent="handleCreate" class="space-y-3">
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    {{ t('tenant.name') }}
                  </label>
                  <input
                    v-model="newName"
                    type="text"
                    required
                    :placeholder="t('tenant.namePlaceholder')"
                    class="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-100 transition placeholder-gray-400"
                  />
                </div>

                <div v-if="createError" class="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                  <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ createError }}
                </div>

                <div class="flex gap-2 justify-end pt-1">
                  <button
                    v-if="tenantStore.tenants.length > 0"
                    type="button"
                    @click="showCreateForm = false"
                    class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition"
                  >
                    {{ t('tenant.cancel') }}
                  </button>
                  <button
                    type="submit"
                    :disabled="creating || !newName.trim()"
                    class="px-5 py-2 text-sm font-semibold bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white rounded-xl transition flex items-center gap-2"
                  >
                    <svg v-if="creating" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {{ creating ? t('tenant.submitting') : t('tenant.submit') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>
