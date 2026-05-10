<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAttachmentStore } from '@/stores/attachment'
import { usePermission } from '@/composables/usePermission'
import { PERMISSIONS } from '@/lib/constants'
import type { TaskAttachment } from '@/types'

const props = defineProps<{ taskId: string }>()

const { t } = useI18n()
const { can } = usePermission()
const attachmentStore = useAttachmentStore()

const taskAttachments = computed(() =>
  attachmentStore.attachments.filter((a) => !a.comment_id),
)

const fileInputRef = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const errorMsg = ref<string | null>(null)

const MAX_SIZE = 20 * 1024 * 1024

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString()
}

function fileIcon(mime: string): string {
  if (mime.startsWith('image/')) return '🖼️'
  if (mime === 'application/pdf') return '📄'
  if (mime.includes('word') || mime.includes('document')) return '📝'
  if (mime.includes('sheet') || mime.includes('excel')) return '📊'
  if (mime.includes('zip') || mime.includes('compressed')) return '🗜️'
  return '📎'
}

async function handleFiles(files: FileList | null) {
  if (!files || files.length === 0) return
  errorMsg.value = null

  const file = files[0]
  if (file.size > MAX_SIZE) {
    errorMsg.value = t('attachment.tooLarge')
    return
  }

  try {
    await attachmentStore.upload(props.taskId, file)
  } catch {
    errorMsg.value = t('attachment.uploadFailed')
  }
}

function onFileInput(e: Event) {
  handleFiles((e.target as HTMLInputElement).files)
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function onDrop(e: DragEvent) {
  dragOver.value = false
  handleFiles(e.dataTransfer?.files ?? null)
}

async function handleDelete(attachment: TaskAttachment) {
  try {
    await attachmentStore.remove(props.taskId, attachment.id)
  } catch {
    errorMsg.value = t('attachment.deleteFailed')
  }
}

function handleDownload(attachment: TaskAttachment) {
  attachmentStore.download(props.taskId, attachment.id, attachment.file_name)
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h2 class="text-base font-semibold text-gray-900">
        {{ t('attachment.title') }}
        <span class="text-gray-400 font-normal text-sm ml-1">
          ({{ taskAttachments.length }})
        </span>
      </h2>
      <button
        v-if="can(PERMISSIONS.ATTACHMENT_CREATE)"
        @click="fileInputRef?.click()"
        :disabled="attachmentStore.uploading"
        class="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition disabled:opacity-50"
      >
        <svg
          v-if="attachmentStore.uploading"
          class="w-4 h-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        {{ attachmentStore.uploading ? t('attachment.uploading') : t('attachment.upload') }}
      </button>
    </div>

    <input ref="fileInputRef" type="file" class="hidden" @change="onFileInput" />

    <div
      v-if="can(PERMISSIONS.ATTACHMENT_CREATE)"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="onDrop"
      @click="fileInputRef?.click()"
      class="border-2 border-dashed rounded-lg px-4 py-3 text-center text-sm cursor-pointer transition"
      :class="
        dragOver
          ? 'border-blue-400 bg-blue-50 text-blue-600'
          : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500'
      "
    >
      {{ t('attachment.dropZone') }}
    </div>

    <p v-if="errorMsg" class="text-xs text-red-500">{{ errorMsg }}</p>

    <div v-if="attachmentStore.loading" class="flex justify-center py-4">
      <div class="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>

    <div v-else-if="taskAttachments.length === 0" class="text-sm text-gray-400 text-center py-2">
      {{ t('attachment.empty') }}
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="a in taskAttachments"
        :key="a.id"
        class="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition group"
      >
        <span class="text-xl shrink-0 select-none">{{ fileIcon(a.mime_type) }}</span>

        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-800 truncate">{{ a.file_name }}</p>
          <p class="text-xs text-gray-400 mt-0.5">
            {{ formatSize(a.size) }} · {{ a.uploader.name }} · {{ formatDate(a.created_at) }}
          </p>
        </div>

        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
          <button
            @click="handleDownload(a)"
            class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
            :title="t('attachment.download')"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          <button
            v-if="can(PERMISSIONS.ATTACHMENT_DELETE)"
            @click="handleDelete(a)"
            class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
            :title="t('attachment.delete')"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>
