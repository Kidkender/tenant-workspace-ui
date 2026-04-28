<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useActivityLogStore } from '@/stores/activityLog'

const store = useActivityLogStore()
const { t } = useI18n()

onMounted(() => store.fetchLogs())

watch(
  () => store.filters,
  () => store.fetchLogs(1),
  { deep: true },
)

const actionColors: Record<string, string> = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
  assign: 'bg-purple-100 text-purple-700',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold text-gray-900">{{ t('activity.title') }}</h1>
      <span class="text-sm text-gray-500">{{ t('activity.events', { n: store.total }) }}</span>
    </div>

    <div class="flex gap-3 flex-wrap">
      <select
        class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        :value="store.filters.action"
        @change="store.setFilter('action', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">{{ t('activity.filter.allActions') }}</option>
        <option value="create">{{ t('activity.filter.create') }}</option>
        <option value="update">{{ t('activity.filter.update') }}</option>
        <option value="delete">{{ t('activity.filter.delete') }}</option>
        <option value="assign">{{ t('activity.filter.assign') }}</option>
      </select>

      <select
        class="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        :value="store.filters.entity_type"
        @change="store.setFilter('entity_type', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">{{ t('activity.filter.allTypes') }}</option>
        <option value="task">Task</option>
        <option value="comment">Comment</option>
      </select>
    </div>

    <div v-if="store.loading" class="space-y-2">
      <div v-for="i in 8" :key="i" class="h-14 bg-gray-100 rounded-lg animate-pulse" />
    </div>

    <div v-else-if="store.logs.length === 0" class="text-center py-16 text-gray-400 text-sm">
      {{ t('activity.empty') }}
    </div>

    <div v-else class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <ul class="divide-y divide-gray-100">
        <li
          v-for="log in store.logs"
          :key="log.id"
          class="flex items-center justify-between px-5 py-3 hover:bg-gray-50 text-sm"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
              {{ log.user?.name?.charAt(0).toUpperCase() ?? '?' }}
            </div>
            <div class="min-w-0">
              <span class="font-medium text-gray-800">{{ log.user?.name ?? t('activity.system') }}</span>
              <span class="text-gray-500"> — {{ log.entity_type }} #{{ log.entity_id.slice(0, 8) }}</span>
            </div>
          </div>
          <div class="flex items-center gap-3 shrink-0 ml-4">
            <span
              class="text-xs px-2 py-0.5 rounded-full font-medium"
              :class="actionColors[log.action] ?? 'bg-gray-100 text-gray-600'"
            >
              {{ t(`activity.actions.${log.action}`) || log.action }}
            </span>
            <span class="text-xs text-gray-400">{{ formatDate(log.created_at) }}</span>
          </div>
        </li>
      </ul>
    </div>

    <div v-if="store.lastPage > 1" class="flex justify-center gap-2">
      <button
        v-for="p in store.lastPage"
        :key="p"
        class="w-8 h-8 text-sm rounded-lg transition-colors"
        :class="p === store.page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'"
        @click="store.fetchLogs(p)"
      >
        {{ p }}
      </button>
    </div>
  </div>
</template>
