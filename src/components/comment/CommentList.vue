<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useCommentStore } from '@/stores/comment'
import { usePermission } from '@/composables/usePermission'
import { PERMISSIONS } from '@/lib/constants'
import type { TaskComment } from '@/types'

const props = defineProps<{ taskId: string }>()

const authStore = useAuthStore()
const commentStore = useCommentStore()
const { can } = usePermission()
const { t } = useI18n()

const editingId = ref<string | null>(null)
const editContent = ref('')
const saving = ref(false)

function startEdit(comment: TaskComment) {
  editingId.value = comment.id
  editContent.value = comment.content
}

function cancelEdit() {
  editingId.value = null
  editContent.value = ''
}

async function saveEdit(commentId: string) {
  if (!editContent.value.trim() || saving.value) return
  saving.value = true
  try {
    await commentStore.updateComment(props.taskId, commentId, editContent.value.trim())
    cancelEdit()
  } finally {
    saving.value = false
  }
}

async function handleDelete(commentId: string) {
  if (!confirm(t('comment.confirm.delete'))) return
  await commentStore.deleteComment(props.taskId, commentId)
}

function isOwner(comment: TaskComment) {
  return comment.user_id === authStore.user?.id
}

function formatTime(date: string) {
  return new Date(date).toLocaleString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="space-y-4">
    <div v-if="commentStore.loading" class="flex justify-center py-6">
      <div class="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>

    <p v-else-if="commentStore.comments.length === 0" class="text-sm text-gray-400 italic py-2">
      {{ t('comment.placeholder') }}
    </p>

    <div v-else class="space-y-3">
      <div
        v-for="comment in commentStore.comments"
        :key="comment.id"
        class="flex gap-3"
      >
        <span class="w-7 h-7 rounded-full bg-gray-200 text-gray-600 text-xs font-semibold flex items-center justify-center uppercase shrink-0 mt-0.5">
          {{ comment.user.name.charAt(0) }}
        </span>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-sm font-medium text-gray-900">{{ comment.user.name }}</span>
            <span class="text-xs text-gray-400">{{ formatTime(comment.created_at) }}</span>
          </div>

          <div v-if="editingId === comment.id" class="space-y-2">
            <textarea
              v-model="editContent"
              rows="2"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none"
            />
            <div class="flex gap-2">
              <button
                @click="saveEdit(comment.id)"
                :disabled="saving"
                class="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
              >
                {{ saving ? t('comment.submitting') : t('comment.save') }}
              </button>
              <button
                @click="cancelEdit"
                class="px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition"
              >
                {{ t('comment.cancel') }}
              </button>
            </div>
          </div>

          <p v-else class="text-sm text-gray-700 whitespace-pre-wrap">{{ comment.content }}</p>

          <div v-if="editingId !== comment.id" class="flex gap-2 mt-1">
            <button
              v-if="isOwner(comment)"
              @click="startEdit(comment)"
              class="text-xs text-gray-400 hover:text-blue-600 transition"
            >
              {{ t('comment.edit') }}
            </button>
            <button
              v-if="isOwner(comment) || can(PERMISSIONS.COMMENT_DELETE)"
              @click="handleDelete(comment.id)"
              class="text-xs text-gray-400 hover:text-red-600 transition"
            >
              {{ t('comment.delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
