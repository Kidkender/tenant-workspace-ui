import { defineStore } from 'pinia'
import { ref } from 'vue'
import http from '@/lib/http'
import type { ApiResponse, Plan, Subscription } from '@/types'

export const useBillingStore = defineStore('billing', () => {
  const plans = ref<Plan[]>([])
  const subscription = ref<Subscription | null>(null)
  const loadingPlans = ref(false)
  const loadingSubscription = ref(false)
  const subscribing = ref(false)

  async function fetchPlans(force = false) {
    if (!force && plans.value.length > 0) return
    loadingPlans.value = true
    try {
      const { data } = await http.get<ApiResponse<Plan[]>>('/plans')
      plans.value = data.data
    } finally {
      loadingPlans.value = false
    }
  }

  async function fetchSubscription(force = false) {
    if (!force && subscription.value) return
    loadingSubscription.value = true
    try {
      const { data } = await http.get<ApiResponse<Subscription>>('/subscription')
      subscription.value = data.data
    } finally {
      loadingSubscription.value = false
    }
  }

  function invalidateSubscription() {
    subscription.value = null
  }

  async function subscribe(planId: number) {
    subscribing.value = true
    try {
      const { data } = await http.post<ApiResponse<Subscription>>('/subscription', {
        plan_id: planId,
      })
      subscription.value = data.data
    } finally {
      subscribing.value = false
    }
  }

  return {
    plans,
    subscription,
    loadingPlans,
    loadingSubscription,
    subscribing,
    fetchPlans,
    fetchSubscription,
    subscribe,
    invalidateSubscription,
  }
})
