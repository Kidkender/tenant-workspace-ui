<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTaskStore } from '@/stores/task'
import { useMemberStore } from '@/stores/member'
import { usePermission } from '@/composables/usePermission'
import { useTenantStore } from '@/stores/tenant'
import { useToastStore } from '@/stores/toast'
import { PERMISSIONS } from '@/lib/constants'
import StatusBadge from '@/components/task/StatusBadge.vue'
import CreateTaskModal from '@/components/task/CreateTaskModal.vue'
import EditTaskModal from '@/components/task/EditTaskModal.vue'
import type { Task, TaskStatus } from '@/types'

const router = useRouter()
const taskStore = useTaskStore()
const memberStore = useMemberStore()
const tenantStore = useTenantStore()
const toastStore = useToastStore()
const { can } = usePermission()
const { t } = useI18n()

const showCreate = ref(false)
const editingTask = ref<Task | null>(null)
const searchInput = ref('')
let searchTimer: ReturnType<typeof setTimeout> | null = null

const statusOptions: { value: TaskStatus | ''; labelKey: string }[] = [
  { value: '', labelKey: 'tasks.filter.all' },
  { value: 'todo', labelKey: 'dashboard.todo' },
  { value: 'doing', labelKey: 'dashboard.doing' },
  { value: 'completed', labelKey: 'dashboard.completed' },
]

const memberMap = computed(() =>
  Object.fromEntries(memberStore.members.map((m) => [m.id, m.name])),
)

onMounted(() => {
  if (tenantStore.currentTenantId) {
    taskStore.fetchTasks()
    memberStore.fetchMembers()
  }
})

watch(
  () => tenantStore.currentTenantId,
  (id) => {
    if (id) {
      taskStore.fetchTasks(1)
      memberStore.fetchMembers()
    }
  },
)

watch(
  () => [taskStore.filters.status, taskStore.filters.assigned_to],
  () => { if (tenantStore.currentTenantId) taskStore.fetchTasks(1) },
)

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    taskStore.setFilter('search', searchInput.value)
    taskStore.fetchTasks(1)
  }, 350)
}

async function handleDelete(task: Task) {
  if (!confirm(t('tasks.confirm.delete', { title: task.title }))) return
  await taskStore.deleteTask(task.id)
  toastStore.success(t('tasks.deleted'))
}

function isOverdue(task: Task) {
  if (!task.due_date || task.status === 'completed') return false
  return new Date(task.due_date) < new Date(new Date().toDateString())
}

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString()
}
</script>

<template>
  <div class="space-y-5">
    <div
      v-if="!tenantStore.currentTenantId"
      class="flex flex-col items-center justify-center py-24 text-center"
    >
      <div class="text-4xl mb-4">🏢</div>
      <h2 class="text-lg font-semibold text-gray-800 mb-1">{{ t('tasks.noWorkspace') }}</h2>
      <p class="text-sm text-gray-500 mb-5">{{ t('tasks.noWorkspaceDesc') }}</p>
    </div>

    <template v-else>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold text-gray-900">{{ t('tasks.title') }}</h1>
          <p class="text-sm text-gray-500 mt-0.5">{{ t('tasks.count', { n: taskStore.total }) }}</p>
        </div>
        <button
          v-if="can(PERMISSIONS.TASK_CREATE)"
          @click="showCreate = true"
          class="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          <span class="text-base leading-none">+</span>
          {{ t('tasks.create') }}
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <input
          v-model="searchInput"
          type="text"
          :placeholder="t('tasks.search')"
          @input="onSearchInput"
          class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white text-gray-700 w-56"
        />
        <select
          :value="taskStore.filters.status"
          @change="taskStore.setFilter('status', ($event.target as HTMLSelectElement).value)"
          class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white text-gray-700"
        >
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
            {{ t(opt.labelKey) }}
          </option>
        </select>
      </div>

      <div v-if="taskStore.loading" class="flex justify-center py-16">
        <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>

      <div v-else-if="taskStore.tasks.length === 0" class="text-center py-16 text-gray-400 text-sm">
        {{ t('tasks.empty') }}
      </div>

      <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50 text-left">
              <th class="px-4 py-3 font-medium text-gray-600">{{ t('tasks.columns.title') }}</th>
              <th class="px-4 py-3 font-medium text-gray-600">{{ t('tasks.columns.status') }}</th>
              <th class="px-4 py-3 font-medium text-gray-600">{{ t('tasks.columns.assignee') }}</th>
              <th class="px-4 py-3 font-medium text-gray-600">{{ t('tasks.columns.deadline') }}</th>
              <th class="px-4 py-3 font-medium text-gray-600 w-24"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="task in taskStore.tasks"
              :key="task.id"
              class="hover:bg-gray-50 transition cursor-pointer"
              :class="{ 'bg-red-50/30': isOverdue(task) }"
              @click="router.push({ name: 'task-detail', params: { id: task.id } })"
            >
              <td class="px-4 py-3 font-medium text-gray-900 max-w-xs">
                <span class="truncate block">{{ task.title }}</span>
                <span v-if="task.description" class="text-xs text-gray-400 truncate block mt-0.5">
                  {{ task.description }}
                </span>
              </td>
              <td class="px-4 py-3">
                <StatusBadge :status="task.status" />
              </td>
              <td class="px-4 py-3 text-gray-500">
                <div v-if="task.assigned_to && memberMap[task.assigned_to]" class="flex items-center gap-1.5">
                  <span class="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center uppercase shrink-0">
                    {{ memberMap[task.assigned_to].charAt(0) }}
                  </span>
                  <span class="truncate text-xs text-gray-700">{{ memberMap[task.assigned_to] }}</span>
                </div>
                <span v-else class="text-xs text-gray-400">{{ t('tasks.unassigned') }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1.5">
                  <span :class="isOverdue(task) ? 'text-red-600 font-medium' : 'text-gray-500'">
                    {{ formatDate(task.due_date) }}
                  </span>
                  <span
                    v-if="isOverdue(task)"
                    class="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium"
                  >
                    {{ t('tasks.overdue') }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3" @click.stop>
                <div class="flex items-center gap-1 justify-end">
                  <button
                    v-if="can(PERMISSIONS.TASK_UPDATE)"
                    @click="editingTask = task"
                    class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                    :title="t('tasks.edit')"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    v-if="can(PERMISSIONS.TASK_DELETE)"
                    @click="handleDelete(task)"
                    class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                    :title="t('tasks.delete')"
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

        <div
          v-if="taskStore.lastPage > 1"
          class="flex items-center justify-between px-4 py-3 border-t border-gray-100"
        >
          <span class="text-xs text-gray-400">
            {{ t('tasks.page', { page: taskStore.page, last: taskStore.lastPage }) }}
          </span>
          <div class="flex items-center gap-1">
            <button
              :disabled="taskStore.page <= 1"
              @click="taskStore.fetchTasks(taskStore.page - 1)"
              class="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {{ t('tasks.prev') }}
            </button>
            <button
              :disabled="taskStore.page >= taskStore.lastPage"
              @click="taskStore.fetchTasks(taskStore.page + 1)"
              class="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {{ t('tasks.next') }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>

  <CreateTaskModal v-if="showCreate" @close="showCreate = false" />
  <EditTaskModal v-if="editingTask" :task="editingTask" @close="editingTask = null" />
</template>
