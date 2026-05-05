<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTaskStore } from '@/stores/task'
import { useCommentStore } from '@/stores/comment'
import { useMemberStore } from '@/stores/member'
import { usePermission } from '@/composables/usePermission'
import { PERMISSIONS } from '@/lib/constants'
import StatusBadge from '@/components/task/StatusBadge.vue'
import EditTaskModal from '@/components/task/EditTaskModal.vue'
import CommentList from '@/components/comment/CommentList.vue'
import CommentForm from '@/components/comment/CommentForm.vue'
import IconBack from '@/components/icons/IconBack.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import { echo } from '@/lib/echo'
import type { TaskComment } from '@/types'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()
const commentStore = useCommentStore()
const memberStore = useMemberStore()
const { can } = usePermission()
const { t } = useI18n()

const taskId = computed(() => route.params.id as string)
const showEdit = ref(false)
const submittingComment = ref(false)

const assigneeName = computed(() => {
  const id = taskStore.currentTask?.assigned_to
  if (!id) return null
  return memberStore.members.find((m) => m.id === id)?.name ?? null
})

watch(
  taskId,
  async (newId, oldId) => {
    if (oldId) {
      echo.leave(`tasks.${oldId}`)
      commentStore.reset()
    }

    await taskStore.fetchTask(newId)
    memberStore.fetchMembers()

    if (can(PERMISSIONS.TASK_VIEW)) {
      await commentStore.fetchComments(newId)
    }

    echo.private(`tasks.${newId}`).listen('comment.created', (data: TaskComment) => {
      commentStore.addComment(data)
    })
  },
  { immediate: true },
)

onUnmounted(() => {
  commentStore.reset()
  echo.leave(`tasks.${taskId.value}`)
})

async function handleCommentSubmit(content: string) {
  submittingComment.value = true
  try {
    await commentStore.createComment(taskId.value, content)
  } finally {
    submittingComment.value = false
  }
}

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString()
}
</script>

<template>
  <div class="max-w-2xl space-y-5">
    <button @click="router.back()"
      class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition">
      <IconBack class="w-4 h-4" />
      {{ t('task.back') }}
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
            <button v-if="can(PERMISSIONS.TASK_UPDATE)" @click="showEdit = true"
              class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
              :title="t('tasks.edit')">
              <IconEdit class="w-4 h-4" />
            </button>
          </div>
        </div>

        <p v-if="taskStore.currentTask.description" class="text-sm text-gray-600 leading-relaxed">
          {{ taskStore.currentTask.description }}
        </p>
        <p v-else class="text-sm text-gray-400 italic">{{ t('task.noDescription') }}</p>

        <div class="flex flex-wrap items-center gap-6 text-sm text-gray-500 pt-2 border-t border-gray-100">
          <span>
            {{ t('task.deadline') }}:
            <strong class="text-gray-700">{{ formatDate(taskStore.currentTask.due_date) }}</strong>
          </span>
          <span>
            {{ t('task.assignee') }}:
            <span v-if="assigneeName" class="inline-flex items-center gap-1.5 ml-1">
              <span
                class="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center uppercase">
                {{ assigneeName.charAt(0) }}
              </span>
              <strong class="text-gray-700">{{ assigneeName }}</strong>
            </span>
            <strong v-else class="text-gray-400 ml-1">{{ t('tasks.unassigned') }}</strong>
          </span>
        </div>
      </div>

      <div v-if="can(PERMISSIONS.TASK_VIEW)" class="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 class="text-base font-semibold text-gray-900">
          {{ t('task.comments') }}
          <span class="text-gray-400 font-normal text-sm ml-1">({{ commentStore.comments.length }})</span>
        </h2>

        <CommentForm v-if="can(PERMISSIONS.COMMENT_CREATE)" :task-id="taskId" :loading="submittingComment"
          @submit="handleCommentSubmit" />

        <CommentList :task-id="taskId" />
      </div>
    </template>

    <div v-else class="text-center py-16 text-gray-400 text-sm">
      {{ t('task.notFound') }}
    </div>
  </div>

  <EditTaskModal v-if="showEdit && taskStore.currentTask" :task="taskStore.currentTask" @close="showEdit = false" />
</template>
