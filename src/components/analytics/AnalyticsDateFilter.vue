<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAnalyticsStore } from '@/stores/analytics'

const { t } = useI18n()
const store = useAnalyticsStore()

const from = ref(store.range.from)
const to = ref(store.range.to)
const error = ref('')

function applyPreset(days: number) {
  const toDate = new Date()
  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - days)
  from.value = fromDate.toISOString().slice(0, 10)
  to.value = toDate.toISOString().slice(0, 10)
  error.value = ''
  store.setRange({ from: from.value, to: to.value })
}

watch([from, to], ([f, tt]) => {
  if (!f || !tt) return
  if (f > tt) {
    error.value = 'Ngày bắt đầu không được sau ngày kết thúc.'
    return
  }
  error.value = ''
  store.setRange({ from: f, to: tt })
})
</script>

<template>
  <div class="flex flex-wrap items-end gap-3">
    <div class="flex items-end gap-2">
      <div class="space-y-1">
        <label class="block text-xs font-medium text-gray-500">{{ t('analytics.dateFilter.from') }}</label>
        <input
          v-model="from"
          type="date"
          class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white transition"
        />
      </div>
      <div class="space-y-1">
        <label class="block text-xs font-medium text-gray-500">{{ t('analytics.dateFilter.to') }}</label>
        <input
          v-model="to"
          type="date"
          class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white transition"
        />
      </div>
    </div>

    <div class="flex items-center gap-1.5">
      <button
        v-for="days in [7, 30, 90]"
        :key="days"
        @click="applyPreset(days)"
        class="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition"
      >
        {{ t(`analytics.dateFilter.last${days}`) }}
      </button>
    </div>

    <p v-if="error" class="w-full text-xs text-red-600">{{ error }}</p>
  </div>
</template>
