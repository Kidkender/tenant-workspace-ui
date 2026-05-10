<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useCommentStore } from '@/stores/comment'
import { useAttachmentStore } from '@/stores/attachment'
import { usePermission } from '@/composables/usePermission'
// import { PERMISSIONS } from '@/lib/constants'
import type { TaskComment } from '@/types'

const props = defineProps<{ taskId: string }>()

const authStore = useAuthStore()
const commentStore = useCommentStore()
const attachmentStore = useAttachmentStore()
const { can } = usePermission()
const { t } = useI18n()

const attachmentsByComment = computed(() => {
  const map = new Map<string, typeof attachmentStore.attachments>()
  for (const a of attachmentStore.attachments) {
    if (!a.comment_id) continue
    const list = map.get(a.comment_id) ?? []
    list.push(a)
    map.set(a.comment_id, list)
  }
  return map
})

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

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
      <div v-for="comment in commentStore.comments" :key="comment.id" class="flex gap-3">
        <span
          class="w-7 h-7 rounded-full bg-gray-200 text-gray-600 text-xs font-semibold flex items-center justify-center uppercase shrink-0 mt-0.5">
          {{ comment.user.name.charAt(0) }}
        </span>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-sm font-medium text-gray-900">{{ comment.user.name }}</span>
            <span class="text-xs text-gray-400">{{ formatTime(comment.created_at) }}</span>
          </div>

          <div v-if="editingId === comment.id" class="space-y-2">
            <textarea v-model="editContent" rows="2"
              class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none" />
            <div class="flex gap-2">
              <button @click="saveEdit(comment.id)" :disabled="saving"
                class="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition">
                {{ saving ? t('comment.submitting') : t('comment.save') }}
              </button>
              <button @click="cancelEdit"
                class="px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded-lg transition">
                {{ t('comment.cancel') }}
              </button>
            </div>
          </div>

          <p v-else class="text-sm text-gray-700 whitespace-pre-wrap">{{ comment.content }}</p>

          <ul
            v-if="editingId !== comment.id && attachmentsByComment.get(comment.id)?.length"
            class="mt-2 space-y-1"
          >
            <li
              v-for="a in attachmentsByComment.get(comment.id)"
              :key="a.id"
              class="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5 group"
            >
              <svg class="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <span class="flex-1 truncate">{{ a.file_name }}</span>
              <span class="text-gray-400 shrink-0">{{ formatSize(a.size) }}</span>
              <button
                @click="attachmentStore.download(props.taskId, a.id, a.file_name)"
                class="text-gray-400 hover:text-blue-600 transition opacity-0 group-hover:opacity-100 shrink-0"
                :title="t('attachment.download')"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            </li>
          </ul>

          <div v-if="editingId !== comment.id" class="flex gap-2 mt-1">
            <button v-if="isOwner(comment)" @click="startEdit(comment)"
              class="text-xs text-gray-400 hover:text-blue-600 transition">
              {{ t('comment.edit') }}
            </button>
            <button v-if="isOwner(comment)
              // || can(PERMISSIONS.COMMENT_DELETE)
            " @click="handleDelete(comment.id)" class="text-xs text-gray-400 hover:text-red-600 transition">
              {{ t('comment.delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
