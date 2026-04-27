<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/task'
import { useCommentStore } from '@/stores/comment'
import { usePermission } from '@/composables/usePermission'
import { PERMISSIONS } from '@/lib/constants'
import StatusBadge from '@/components/task/StatusBadge.vue'
import EditTaskModal from '@/components/task/EditTaskModal.vue'
import CommentList from '@/components/comment/CommentList.vue'
import CommentForm from '@/components/comment/CommentForm.vue'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()
const commentStore = useCommentStore()
const { can } = usePermission()

const taskId = route.params.id as string
const showEdit = ref(false)
const submittingComment = ref(false)

onMounted(async () => {
  await taskStore.fetchTask(taskId)
  if (can(PERMISSIONS.TASK_VIEW)) {
    await commentStore.fetchComments(taskId)
  }
})

onUnmounted(() => commentStore.reset())

async function handleCommentSubmit(content: string) {
  submittingComment.value = true
  try {
    await commentStore.createComment(taskId, content)
  } finally {
    submittingComment.value = false
  }
}

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('vi-VN')
}
</script>

<template>
  <div class="max-w-2xl space-y-5">
    <button
      @click="router.back()"
      class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition"
    >
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Quay lại
    </button>

    <div v-if="taskStore.loading" class="flex justify-center py-16">
      <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>

    <template v-else-if="taskStore.currentTask">
      <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div class="flex items-start justify-between gap-4">
          <h1 class="text-xl font-semibold text-gray-900 leading-snug">
            {{ taskStore.currentTask.title }}
          </h1>
          <div class="flex items-center gap-2 shrink-0">
            <StatusBadge :status="taskStore.currentTask.status" />
            <button
              v-if="can(PERMISSIONS.TASK_UPDATE)"
              @click="showEdit = true"
              class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
              title="Chỉnh sửa"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </div>

        <p v-if="taskStore.currentTask.description" class="text-sm text-gray-600 leading-relaxed">
          {{ taskStore.currentTask.description }}
        </p>
        <p v-else class="text-sm text-gray-400 italic">Không có mô tả.</p>

        <div class="flex items-center gap-6 text-sm text-gray-500 pt-2 border-t border-gray-100">
          <span>
            Deadline:
            <strong class="text-gray-700">{{ formatDate(taskStore.currentTask.due_date) }}</strong>
          </span>
        </div>
      </div>

      <div v-if="can(PERMISSIONS.TASK_VIEW)" class="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 class="text-base font-semibold text-gray-900">
          Comments
          <span class="text-gray-400 font-normal text-sm ml-1">({{ commentStore.comments.length }})</span>
        </h2>

        <CommentForm
          v-if="can(PERMISSIONS.COMMENT_CREATE)"
          :task-id="taskId"
          :loading="submittingComment"
          @submit="handleCommentSubmit"
        />

        <CommentList :task-id="taskId" />
      </div>
    </template>

    <div v-else class="text-center py-16 text-gray-400 text-sm">
      Không tìm thấy task.
    </div>
  </div>

  <EditTaskModal
    v-if="showEdit && taskStore.currentTask"
    :task="taskStore.currentTask"
    @close="showEdit = false"
  />
</template>
