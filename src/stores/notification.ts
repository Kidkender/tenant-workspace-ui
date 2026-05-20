import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import http from '@/lib/http'
import type { Notification, ApiResponse } from '@/types'
import { getEcho } from '@/lib/echo'
import { useAuthStore } from '@/stores/auth'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])
  const unreadNotifications = ref<Notification[]>([])
  const loading = ref(false)

  const unreadCount = computed(() => unreadNotifications.value.length)

  async function fetchUnread() {
    try {
      const { data } = await http.get<ApiResponse<Notification[]>>('/notifications/unread')
      unreadNotifications.value = data.data
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  }

  async function fetchAll() {
    loading.value = true
    try {
      const { data } = await http.get<ApiResponse<Notification[]>>('/notifications')
      notifications.value = data.data
    } finally {
      loading.value = false
    }
  }

  async function markAsRead(id: string) {
    await http.post(`/notifications/${id}/read`)
    unreadNotifications.value = unreadNotifications.value.filter((n) => n.id !== id)
    notifications.value = notifications.value.map((n) =>
      n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
    )
  }

  async function markAllAsRead() {
    await http.post('/notifications/read-all')
    const now = new Date().toISOString()
    unreadNotifications.value = []
    notifications.value = notifications.value.map((n) => ({ ...n, read_at: now }))
  }

  async function listenForNotifications() {
    const authStore = useAuthStore()

    const userId = authStore.user?.id
    if (!userId) return

    getEcho()
      .private(`App.Models.User.${userId}`)
      .notification((notification: Notification) => {
        unreadNotifications.value = [notification, ...unreadNotifications.value]
      })
  }

  function stopListeningForNotifications() {
    const authStore = useAuthStore()
    const userId = authStore.user?.id
    if (!userId) return

    getEcho().leave(`App.Models.User.${userId}`)
  }
  return {
    notifications,
    unreadNotifications,
    unreadCount,
    loading,
    fetchUnread,
    fetchAll,
    markAsRead,
    markAllAsRead,
    listenForNotifications,
    stopListeningForNotifications,
  }
})
