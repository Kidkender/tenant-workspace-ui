<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { name: 'tasks', label: 'Tasks', icon: '📋' },
]
</script>

<template>
  <aside class="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">
    <div class="px-5 py-4 border-b border-gray-100">
      <span class="text-base font-bold text-gray-900 tracking-tight">Workspace</span>
    </div>

    <nav class="flex-1 px-3 py-4 space-y-0.5">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="{ name: item.name }"
        class="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors"
        :class="
          route.name === item.name
            ? 'bg-blue-50 text-blue-700 font-medium'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        "
      >
        <span>{{ item.icon }}</span>
        {{ item.label }}
      </RouterLink>
    </nav>
  </aside>
</template>
