<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useConfirm } from '@/composables/useConfirm'
import BaseModal from './BaseModal.vue'

const { isOpen, options, accept, cancel } = useConfirm()
const { t } = useI18n()
</script>

<template>
  <BaseModal :open="isOpen" size="sm" :close-on-backdrop="false" title-id="confirm-title" @close="cancel">
    <h2 id="confirm-title" class="text-base font-semibold text-gray-900 mb-2">
      {{ options.title }}
    </h2>
    <p class="text-sm text-gray-600 mb-6">{{ options.message }}</p>

    <div class="flex gap-2 justify-end">
      <button
        type="button"
        @click="cancel"
        class="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
      >
        {{ options.cancelLabel ?? t('confirm.cancel') }}
      </button>
      <button
        type="button"
        @click="accept"
        class="px-4 py-2 text-sm rounded-lg transition text-white"
        :class="options.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'"
      >
        {{ options.confirmLabel ?? t('confirm.ok') }}
      </button>
    </div>
  </BaseModal>
</template>
