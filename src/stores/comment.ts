import { defineStore } from 'pinia'
import { ref } from 'vue'
import http from '@/lib/http'
import type { TaskComment, ApiResponse } from '@/types'

export const useCommentStore = defineStore('comment', () => {
  const comments = ref<TaskComment[]>([])
  const loading = ref(false)

  async function fetchComments(taskId: string) {
    loading.value = true
    try {
      const { data } = await http.get<ApiResponse<TaskComment[]>>(`/tasks/${taskId}/comments`)
      comments.value = data.data
    } finally {
      loading.value = false
    }
  }

  async function createComment(taskId: string, content: string): Promise<TaskComment> {
    const { data } = await http.post<ApiResponse<TaskComment>>(`/tasks/${taskId}/comments`, {
      content,
    })
    comments.value.unshift(data.data)
    return data.data
  }

  async function addComment(comment: TaskComment) {
    if (!comments.value.find((c) => c.id === comment.id)) {
      comments.value.unshift(comment)
    }
  }

  async function updateComment(taskId: string, commentId: string, content: string) {
    const { data } = await http.put<ApiResponse<TaskComment>>(
      `/tasks/${taskId}/comments/${commentId}`,
      { content },
    )
    comments.value = comments.value.map((c) => (c.id === commentId ? data.data : c))
  }

  async function deleteComment(taskId: string, commentId: string) {
    await http.delete(`/tasks/${taskId}/comments/${commentId}`)
    comments.value = comments.value.filter((c) => c.id !== commentId)
  }

  function reset() {
    comments.value = []
  }

  return {
    comments,
    loading,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    reset,
    addComment,
  }
})
