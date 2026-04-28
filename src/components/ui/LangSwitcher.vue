<script setup lang="ts">
import { ref } from 'vue'
import { getLocale, setLocale } from '@/i18n'

const current = ref<'en' | 'vi'>(getLocale() as 'en' | 'vi')

function toggle() {
  const next = current.value === 'vi' ? 'en' : 'vi'
  current.value = next
  setLocale(next)
}
</script>

<template>
  <button
    @click="toggle"
    class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition text-sm font-medium text-gray-600"
    :title="current === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'"
  >
    <span class="text-base leading-none">{{ current === 'vi' ? '🇻🇳' : '🇬🇧' }}</span>
    <span class="text-xs uppercase tracking-wide">{{ current === 'vi' ? 'VI' : 'EN' }}</span>
  </button>
</template>
