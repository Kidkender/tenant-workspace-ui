export interface User {
  id: string
  name: string
  email: string
}

export interface TenantMembership {
  id: string
  name: string
  slug: string
  role: 'owner' | 'admin' | 'member'
  permissions: string[]
}

export interface AuthResponse {
  token: string
  user: User
  tenants: TenantMembership[]
}

export type TaskStatus = 'todo' | 'doing' | 'completed'

export interface Task {
  id: string
  tenant_id: string
  title: string
  description: string | null
  status: TaskStatus
  created_by: string
  assigned_to: string | null
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface TaskComment {
  id: string
  task_id: string
  tenant_id: string
  user_id: string
  content: string
  created_at: string
  user: Pick<User, 'id' | 'name' | 'email'>
}

export interface TenantMember {
  id: string
  name: string
  email: string
  role: string | null
}

export interface ActivityLog {
  id: string
  action: string
  entity_type: string
  entity_id: string
  user: { id: string; name: string } | null
  created_at: string
}

export interface DashboardStats {
  tasks: {
    total: number
    todo: number
    doing: number
    completed: number
  }
  members: number
  recent_activity: ActivityLog[]
}

export interface ApiResponse<T> {
  data: T
  meta: Record<string, unknown>
  message: string
}

export interface Paginator<T> {
  current_page: number
  data: T[]
  last_page: number
  per_page: number
  total: number
}

export interface Role {
  id: number
  name: string
}

export interface NotificationData {
  task_id: string
  task_title: string
  tenant_id: string
  message: string
}

export interface Notification {
  id: string
  type: string
  read_at: string | null
  created_at: string
  data: NotificationData
}
