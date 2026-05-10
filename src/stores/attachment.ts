import { defineStore } from 'pinia'
import { ref, toRaw } from 'vue'
import http from '@/lib/http'
import type { TaskAttachment, ApiResponse } from '@/types'

export const useAttachmentStore = defineStore('attachment', () => {
  const attachments = ref<TaskAttachment[]>([])
  const loading = ref(false)
  const uploading = ref(false)

  async function fetchAttachments(taskId: string) {
    loading.value = true
    try {
      const { data } = await http.get<ApiResponse<TaskAttachment[]>>(`/tasks/${taskId}/attachments`)
      attachments.value = data.data
    } finally {
      loading.value = false
    }
  }

  async function upload(taskId: string, file: File) {
    uploading.value = true
    try {
      const form = new FormData()
      form.append('file', toRaw(file))
      const { data } = await http.post<ApiResponse<TaskAttachment>>(
        `/tasks/${taskId}/attachments`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      attachments.value.unshift(data.data)
      return data.data
    } finally {
      uploading.value = false
    }
  }

  async function uploadForComment(taskId: string, commentId: string, file: File) {
    const form = new FormData()
    form.append('file', toRaw(file))
    const { data } = await http.post<ApiResponse<TaskAttachment>>(
      `/tasks/${taskId}/comments/${commentId}/attachments`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    attachments.value.unshift(data.data)
    return data.data
  }

  async function remove(taskId: string, attachmentId: string) {
    await http.delete(`/tasks/${taskId}/attachments/${attachmentId}`)
    attachments.value = attachments.value.filter((a) => a.id !== attachmentId)
  }

  async function download(taskId: string, attachmentId: string, fileName: string) {
    const response = await http.get(`/tasks/${taskId}/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    })
    const url = URL.createObjectURL(response.data as Blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  function reset() {
    attachments.value = []
  }

  return {
    attachments,
    loading,
    uploading,
    fetchAttachments,
    upload,
    uploadForComment,
    remove,
    download,
    reset,
  }
})
