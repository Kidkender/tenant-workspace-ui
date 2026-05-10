<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import IconDashboard from '@/components/icons/IconDashboard.vue'
import IconTasks from '@/components/icons/IconTasks.vue'
import IconMembers from '@/components/icons/IconMembers.vue'
import IconActivity from '@/components/icons/IconActivity.vue'
import IconSettings from '@/components/icons/IconSettings.vue'
import IconBilling from '@/components/icons/IconBilling.vue'

const route = useRoute()
const { t } = useI18n()

const navItems = [
  { name: 'dashboard', key: 'nav.dashboard', icon: IconDashboard },
  { name: 'tasks', key: 'nav.tasks', icon: IconTasks },
  { name: 'members', key: 'nav.members', icon: IconMembers },
  { name: 'activity', key: 'nav.activity', icon: IconActivity },
  { name: 'billing', key: 'nav.billing', icon: IconBilling },
  { name: 'settings', key: 'nav.settings', icon: IconSettings },
]

function isActive(name: string) {
  return route.name === name || (name === 'tasks' && route.name === 'task-detail')
}
</script>

<template>
  <aside class="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">
    <div class="px-5 py-4 border-b border-gray-100">
      <span class="text-base font-bold text-gray-900 tracking-tight">{{ t('nav.workspace') }}</span>
    </div>

    <nav class="flex-1 px-3 py-4 space-y-0.5" aria-label="Main navigation">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="{ name: item.name }"
        class="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors"
        :class="
          isActive(item.name)
            ? 'bg-blue-50 text-blue-700 font-medium'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        "
        :aria-current="isActive(item.name) ? 'page' : undefined"
      >
        <component :is="item.icon" class="w-4 h-4 shrink-0" />
        {{ t(item.key) }}
      </RouterLink>
    </nav>
  </aside>
</template>
