<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { TenantMember } from '@/types'

const props = defineProps<{ member: TenantMember }>()
const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}
</script>

<template>
  <Teleport to="body">
  <div
    class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
      <div class="flex items-start justify-between mb-5">
        <h2 class="text-lg font-semibold text-gray-900">{{ t('members.detailTitle') }}</h2>
        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600 transition"
          :aria-label="t('members.detailClose')"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="flex flex-col items-center gap-3 py-2">
        <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-700">
          {{ initials(props.member.name) }}
        </div>
        <div class="text-center">
          <p class="text-base font-semibold text-gray-900">{{ props.member.name }}</p>
          <p class="text-sm text-gray-500 mt-0.5">{{ props.member.email }}</p>
        </div>
      </div>

      <div class="mt-5 space-y-2 text-sm border-t border-gray-100 pt-4">
        <div class="flex justify-between">
          <span class="text-gray-500">{{ t('members.detailName') }}</span>
          <span class="text-gray-900 font-medium">{{ props.member.name }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-500">{{ t('members.detailEmail') }}</span>
          <span class="text-gray-900 font-medium">{{ props.member.email }}</span>
        </div>
      </div>

      <div class="mt-5 flex justify-end">
        <button
          @click="emit('close')"
          class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
        >
          {{ t('members.detailClose') }}
        </button>
      </div>
    </div>
  </div>
  </Teleport>
</template>
