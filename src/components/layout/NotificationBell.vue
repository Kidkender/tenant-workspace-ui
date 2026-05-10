<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const notificationStore = useNotificationStore()

const open = ref(false)
const bellRef = ref<HTMLElement | null>(null)

let pollInterval: ReturnType<typeof setInterval> | null = null

function startPolling() {
  if (pollInterval) return
  pollInterval = setInterval(() => {
    if (!document.hidden) notificationStore.fetchUnread()
  }, 60_000)
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

function handleVisibilityChange() {
  if (document.hidden) {
    stopPolling()
  } else {
    notificationStore.fetchUnread()
    startPolling()
  }
}

function toggle() {
  open.value = !open.value
  if (open.value) {
    notificationStore.fetchAll()
  }
}

async function handleMarkAsRead(id: string) {
  await notificationStore.markAsRead(id)
}

async function handleMarkAllAsRead() {
  await notificationStore.markAllAsRead()
}

function handleClickOutside(e: MouseEvent) {
  if (bellRef.value && !bellRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

function formatTime(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return t('notification.justNow')
  if (diff < 3600) return t('notification.minutesAgo', { n: Math.floor(diff / 60) })
  if (diff < 86400) return t('notification.hoursAgo', { n: Math.floor(diff / 3600) })
  return t('notification.daysAgo', { n: Math.floor(diff / 86400) })
}

onMounted(() => {
  notificationStore.fetchUnread()
  startPolling()
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  stopPolling()
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <div ref="bellRef" class="relative">
    <button
      @click="toggle"
      class="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 transition text-gray-500 hover:text-gray-700"
      :aria-label="t('notification.title')"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      <span
        v-if="notificationStore.unreadCount > 0"
        class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none"
      >
        {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
      </span>
    </button>

    <div
      v-if="open"
      class="absolute right-0 mt-1.5 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
    >
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 class="text-sm font-semibold text-gray-800">{{ t('notification.title') }}</h3>
        <button
          v-if="notificationStore.unreadCount > 0"
          @click="handleMarkAllAsRead"
          class="text-xs text-blue-600 hover:text-blue-700 font-medium transition"
        >
          {{ t('notification.markAllRead') }}
        </button>
      </div>

      <div class="max-h-80 overflow-y-auto">
        <div v-if="notificationStore.loading" class="flex items-center justify-center py-8">
          <svg
            class="w-5 h-5 animate-spin text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>

        <template v-else-if="notificationStore.notifications.length > 0">
          <button
            v-for="n in notificationStore.notifications"
            :key="n.id"
            @click="!n.read_at && handleMarkAsRead(n.id)"
            class="w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0 flex gap-3"
            :class="{ 'bg-blue-50/60': !n.read_at }"
          >
            <span
              class="mt-1.5 shrink-0 w-2 h-2 rounded-full"
              :class="n.read_at ? 'bg-gray-200' : 'bg-blue-500'"
            />
            <div class="min-w-0">
              <p class="text-sm text-gray-800 leading-snug">{{ n.data.message }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ formatTime(n.created_at) }}</p>
            </div>
          </button>
        </template>

        <div v-else class="py-10 text-center text-sm text-gray-400">
          {{ t('notification.empty') }}
        </div>
      </div>
    </div>
  </div>
</template>
