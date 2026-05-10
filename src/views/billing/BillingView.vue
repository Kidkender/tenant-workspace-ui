<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useBillingStore } from '@/stores/billing'
import { useToastStore } from '@/stores/toast'
import { useTenantStore } from '@/stores/tenant'
import { usePermission } from '@/composables/usePermission'
import type { Plan } from '@/types'

const { t } = useI18n()
const billingStore = useBillingStore()
const toastStore = useToastStore()
const tenantStore = useTenantStore()
const { can } = usePermission()

const isOwner = computed(() => tenantStore.currentTenant?.role === 'owner')

const currentPlanId = computed(() => billingStore.subscription?.plan_id ?? null)

onMounted(async () => {
  await Promise.all([billingStore.fetchPlans(), billingStore.fetchSubscription()])
})

function featureLabel(key: string, value: string): string {
  if (key === 'can_create_task') return value === '1' || value === 'true' ? t('billing.features.canCreateTask') : ''
  if (key === 'task_limit') return t('billing.features.taskLimit', { n: value })
  if (key === 'member_limit') return t('billing.features.memberLimit', { n: value })
  return `${key}: ${value}`
}

async function handleSubscribe(plan: Plan) {
  if (billingStore.subscribing) return
  try {
    await billingStore.subscribe(plan.id)
    toastStore.success(t('billing.subscribeSuccess'))
  } catch {
    toastStore.error(t('billing.subscribeError'))
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl font-semibold text-gray-900">{{ t('billing.title') }}</h1>
      <p class="text-sm text-gray-500 mt-0.5">{{ t('billing.subtitle') }}</p>
    </div>

    <div v-if="!tenantStore.currentTenantId" class="text-center py-16 text-gray-400 text-sm">
      {{ t('tenant.noTenant') }}
    </div>

    <template v-else>
      <!-- Current subscription -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          {{ t('billing.currentPlan') }}
        </h2>

        <div v-if="billingStore.loadingSubscription" class="text-sm text-gray-400">
          {{ t('billing.loading') }}
        </div>

        <div v-else-if="!billingStore.subscription" class="text-sm text-gray-400">
          {{ t('billing.noSubscription') }}
        </div>

        <div v-else class="flex items-center justify-between">
          <div class="space-y-1">
            <p class="font-medium text-gray-900">
              {{ billingStore.plans.find((p) => p.id === currentPlanId)?.name ?? '—' }}
            </p>
            <p class="text-xs text-gray-500">
              <span
                :class="billingStore.subscription.status === 'active' ? 'text-green-600' : 'text-red-500'"
                class="font-medium"
              >
                {{ t(`billing.status.${billingStore.subscription.status}`) }}
              </span>
              <template v-if="billingStore.subscription.expired_at">
                &nbsp;·&nbsp;{{ t('billing.expiresAt') }}
                {{ new Date(billingStore.subscription.expired_at).toLocaleDateString() }}
              </template>
            </p>
          </div>
        </div>
      </div>

      <!-- Plans list -->
      <div>
        <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          {{ t('billing.allPlans') }}
        </h2>

        <div v-if="billingStore.loadingPlans" class="text-sm text-gray-400">
          {{ t('billing.loading') }}
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="plan in billingStore.plans"
            :key="plan.id"
            class="bg-white rounded-xl border p-5 flex flex-col gap-4 transition"
            :class="plan.id === currentPlanId ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'"
          >
            <div class="flex items-start justify-between">
              <div>
                <p class="font-semibold text-gray-900">{{ plan.name }}</p>
                <p class="text-2xl font-bold text-gray-900 mt-1">
                  {{ plan.price_monthly === 0 ? t('billing.free') : `$${plan.price_monthly}` }}
                  <span v-if="plan.price_monthly > 0" class="text-sm font-normal text-gray-400">/{{ t('billing.month') }}</span>
                </p>
              </div>
              <span
                v-if="plan.id === currentPlanId"
                class="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full"
              >
                {{ t('billing.current') }}
              </span>
            </div>

            <ul class="space-y-1.5 flex-1">
              <li
                v-for="feature in plan.features"
                :key="feature.id"
                class="flex items-center gap-2 text-sm text-gray-600"
              >
                <svg class="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ featureLabel(feature.feature_key, feature.value) }}
              </li>
            </ul>

            <button
              v-if="isOwner && plan.id !== currentPlanId"
              :disabled="billingStore.subscribing"
              class="w-full py-2 text-sm font-medium rounded-lg transition"
              :class="plan.price_monthly === 0
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50'
                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50'"
              @click="handleSubscribe(plan)"
            >
              {{ billingStore.subscribing ? t('billing.subscribing') : t('billing.subscribe') }}
            </button>

            <div
              v-else-if="plan.id === currentPlanId"
              class="w-full py-2 text-center text-sm font-medium text-blue-700 bg-blue-50 rounded-lg"
            >
              {{ t('billing.currentPlanLabel') }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
