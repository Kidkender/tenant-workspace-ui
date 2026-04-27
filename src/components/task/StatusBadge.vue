<script setup lang="ts">
import type { TaskStatus } from '@/types'

defineProps<{ status: TaskStatus }>()

const config: Record<TaskStatus, { label: string; classes: string }> = {
  todo: { label: 'Todo', classes: 'bg-gray-100 text-gray-600' },
  doing: { label: 'Doing', classes: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', classes: 'bg-green-100 text-green-700' },
}
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
    :class="config[status].classes"
  >
    {{ config[status].label }}
  </span>
</template>
