<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/task'
import { usePermission } from '@/composables/usePermission'
import { useTenantStore } from '@/stores/tenant'
import { PERMISSIONS } from '@/lib/constants'
import StatusBadge from '@/components/task/StatusBadge.vue'
import CreateTaskModal from '@/components/task/CreateTaskModal.vue'
import EditTaskModal from '@/components/task/EditTaskModal.vue'
import type { Task, TaskStatus } from '@/types'

const router = useRouter()
const taskStore = useTaskStore()
const tenantStore = useTenantStore()
const { can } = usePermission()

const showCreate = ref(false)
const editingTask = ref<Task | null>(null)

const statusOptions: { value: TaskStatus | ''; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'todo', label: 'Todo' },
  { value: 'doing', label: 'Doing' },
  { value: 'completed', label: 'Completed' },
]

onMounted(() => taskStore.fetchTasks())

watch(
  () => [taskStore.filters.status, taskStore.filters.assigned_to, tenantStore.currentTenantId],
  () => taskStore.fetchTasks(),
)

async function handleDelete(task: Task) {
  if (!confirm(`Xoá task "${task.title}"?`)) return
  await taskStore.deleteTask(task.id)
}

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('vi-VN')
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-gray-900">Tasks</h1>
        <p class="text-sm text-gray-500 mt-0.5">{{ taskStore.total }} tasks</p>
      </div>
      <button
        v-if="can(PERMISSIONS.TASK_CREATE)"
        @click="showCreate = true"
        class="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
      >
        <span class="text-base leading-none">+</span>
        Tạo Task
      </button>
    </div>

    <div class="flex items-center gap-3">
      <select
        :value="taskStore.filters.status"
        @change="taskStore.setFilter('status', ($event.target as HTMLSelectElement).value)"
        class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white text-gray-700"
      >
        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <div v-if="taskStore.loading" class="flex justify-center py-16">
      <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>

    <div v-else-if="taskStore.tasks.length === 0" class="text-center py-16 text-gray-400 text-sm">
      Chưa có task nào.
    </div>

    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-100 bg-gray-50 text-left">
            <th class="px-4 py-3 font-medium text-gray-600">Tiêu đề</th>
            <th class="px-4 py-3 font-medium text-gray-600">Trạng thái</th>
            <th class="px-4 py-3 font-medium text-gray-600">Deadline</th>
            <th class="px-4 py-3 font-medium text-gray-600 w-24"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="task in taskStore.tasks"
            :key="task.id"
            class="hover:bg-gray-50 transition cursor-pointer"
            @click="router.push({ name: 'task-detail', params: { id: task.id } })"
          >
            <td class="px-4 py-3 font-medium text-gray-900 max-w-sm">
              <span class="truncate block">{{ task.title }}</span>
              <span v-if="task.description" class="text-xs text-gray-400 truncate block mt-0.5">
                {{ task.description }}
              </span>
            </td>
            <td class="px-4 py-3">
              <StatusBadge :status="task.status" />
            </td>
            <td class="px-4 py-3 text-gray-500">{{ formatDate(task.due_date) }}</td>
            <td class="px-4 py-3" @click.stop>
              <div class="flex items-center gap-1 justify-end">
                <button
                  v-if="can(PERMISSIONS.TASK_UPDATE)"
                  @click="editingTask = task"
                  class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                  title="Chỉnh sửa"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  v-if="can(PERMISSIONS.TASK_DELETE)"
                  @click="handleDelete(task)"
                  class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                  title="Xoá"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <CreateTaskModal v-if="showCreate" @close="showCreate = false" />
  <EditTaskModal v-if="editingTask" :task="editingTask" @close="editingTask = null" />
</template>
