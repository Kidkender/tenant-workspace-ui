export const PERMISSIONS = {
  TASK_VIEW: 'task.view',
  TASK_CREATE: 'task.create',
  TASK_UPDATE: 'task.update',
  TASK_DELETE: 'task.delete',
  COMMENT_CREATE: 'comment.create',
  COMMENT_DELETE: 'comment.delete',
} as const

export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  TENANT_ID: 'current_tenant_id',
} as const
