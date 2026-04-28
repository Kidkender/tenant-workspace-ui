<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTenantStore } from '@/stores/tenant'
import CreateTenantModal from './CreateTenantModal.vue'

const tenantStore = useTenantStore()
const { t } = useI18n()
const open = ref(false)
const showCreate = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

function handleClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))

function select(tenantId: string) {
  tenantStore.switchTenant(tenantId)
  open.value = false
}
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <button
      @click="open = !open"
      class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition text-sm max-w-52"
    >
      <span class="w-5 h-5 rounded bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center uppercase shrink-0">
        {{ tenantStore.currentTenant?.name?.charAt(0) ?? '?' }}
      </span>
      <span class="font-medium text-gray-800 truncate">
        {{ tenantStore.currentTenant?.name ?? t('tenant.noTenant') }}
      </span>
      <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div
      v-if="open"
      class="absolute left-0 mt-1.5 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1"
    >
      <div
        v-for="tenant in tenantStore.tenants"
        :key="tenant.id"
        @click="select(tenant.id)"
        class="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition"
        :class="tenant.id === tenantStore.currentTenantId ? 'text-blue-700 font-medium' : 'text-gray-700'"
      >
        <span class="w-5 h-5 rounded bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center uppercase shrink-0">
          {{ tenant.name.charAt(0) }}
        </span>
        <span class="truncate">{{ tenant.name }}</span>
        <span v-if="tenant.id === tenantStore.currentTenantId" class="ml-auto text-blue-500">✓</span>
      </div>

      <div class="border-t border-gray-100 mt-1 pt-1">
        <button
          @click="showCreate = true; open = false"
          class="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 transition"
        >
          + {{ t('tenant.createNew') }}
        </button>
      </div>
    </div>
  </div>

  <CreateTenantModal v-if="showCreate" @close="showCreate = false" />
</template>
