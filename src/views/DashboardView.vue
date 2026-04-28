<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '@/stores/dashboard'

const store = useDashboardStore()
const { t } = useI18n()

onMounted(() => store.fetchStats())

const taskCards = computed(() => {
  const s = store.stats?.tasks
  if (!s) return []
  return [
    { labelKey: 'dashboard.totalTasks', value: s.total, color: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
    { labelKey: 'dashboard.todo', value: s.todo, color: 'bg-gray-50 text-gray-700', dot: 'bg-gray-400' },
    { labelKey: 'dashboard.doing', value: s.doing, color: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-400' },
    { labelKey: 'dashboard.completed', value: s.completed, color: 'bg-green-50 text-green-700', dot: 'bg-green-500' },
  ]
})

function formatAction(action: string, entityType: string) {
  const key = `dashboard.actions.${action}`
  return `${t(key)} ${entityType}`
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-xl font-semibold text-gray-900">{{ t('dashboard.title') }}</h1>

    <div v-if="store.loading" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="h-24 bg-gray-100 rounded-xl animate-pulse" />
    </div>

    <template v-else-if="store.stats">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="card in taskCards"
          :key="card.labelKey"
          class="rounded-xl p-5 flex flex-col gap-3"
          :class="card.color"
        >
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full" :class="card.dot" />
            <span class="text-sm font-medium">{{ t(card.labelKey) }}</span>
          </div>
          <span class="text-3xl font-bold">{{ card.value }}</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h2 class="text-sm font-semibold text-gray-700 mb-4">{{ t('dashboard.membersTitle') }}</h2>
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <span class="text-2xl font-bold text-blue-700">{{ store.stats.members }}</span>
            </div>
            <p class="text-sm text-gray-500">{{ t('dashboard.membersActive') }}</p>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-5">
          <h2 class="text-sm font-semibold text-gray-700 mb-1">{{ t('dashboard.progressTitle') }}</h2>
          <div v-if="store.stats.tasks.total > 0" class="mt-4">
            <div class="flex gap-1 h-3 rounded-full overflow-hidden">
              <div
                class="bg-gray-300 transition-all"
                :style="{ width: `${(store.stats.tasks.todo / store.stats.tasks.total) * 100}%` }"
              />
              <div
                class="bg-yellow-400 transition-all"
                :style="{ width: `${(store.stats.tasks.doing / store.stats.tasks.total) * 100}%` }"
              />
              <div
                class="bg-green-500 transition-all"
                :style="{ width: `${(store.stats.tasks.completed / store.stats.tasks.total) * 100}%` }"
              />
            </div>
            <div class="flex gap-4 mt-3 text-xs text-gray-500">
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-gray-300" />{{ t('dashboard.todo') }}</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-yellow-400" />{{ t('dashboard.doing') }}</span>
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-green-500" />{{ t('dashboard.completed') }}</span>
            </div>
          </div>
          <p v-else class="text-sm text-gray-400 mt-4">{{ t('dashboard.noTasks') }}</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-5">
        <h2 class="text-sm font-semibold text-gray-700 mb-4">{{ t('dashboard.recentActivity') }}</h2>
        <div v-if="store.stats.recent_activity.length === 0" class="text-sm text-gray-400">
          {{ t('dashboard.noActivity') }}
        </div>
        <ul v-else class="divide-y divide-gray-100">
          <li
            v-for="log in store.stats.recent_activity"
            :key="log.id"
            class="flex items-center justify-between py-2.5 text-sm"
          >
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                {{ log.user?.name?.charAt(0).toUpperCase() ?? '?' }}
              </div>
              <span>
                <span class="font-medium text-gray-800">{{ log.user?.name ?? t('dashboard.system') }}</span>
                <span class="text-gray-500"> {{ formatAction(log.action, log.entity_type) }}</span>
              </span>
            </div>
            <span class="text-xs text-gray-400 shrink-0">{{ timeAgo(log.created_at) }}</span>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>
