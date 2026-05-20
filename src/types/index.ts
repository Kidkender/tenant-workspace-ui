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

export interface Label {
  id: string
  tenant_id: string
  name: string
  color: string
  created_at: string
  updated_at: string
}

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
  labels?: Label[]
}

export interface TaskAttachment {
  id: string
  task_id: string
  comment_id: string | null
  tenant_id: string
  uploaded_by: string
  file_name: string
  file_path: string
  mime_type: string
  size: number
  created_at: string
  uploader: Pick<User, 'id' | 'name' | 'email'>
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

export interface Permission {
  id: number
  key: string
  description: string | null
}

export interface CustomRole {
  id: number
  name: string
  description: string | null
  tenant_id: string | null
  permissions: Permission[]
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

export interface PlanFeature {
  id: number
  plan_id: number
  feature_key: string
  value: string
}

export interface Plan {
  id: number
  name: string
  price_monthly: number
  price_yearly: number
  features: PlanFeature[]
}

export interface Subscription {
  id: number
  tenant_id: string
  plan_id: number
  status: 'active' | 'inactive' | 'expired'
  start_at: string
  expired_at: string | null
  plan?: Plan
}

// Analytics types
export interface AnalyticsDateRange {
  from: string
  to: string
}

export interface CompletionRateData {
  from: string
  to: string
  total: number
  completed: number
  rate: number
}

export interface TasksPerUserItem {
  user_id: string
  name: string
  total: number
  todo: number
  doing: number
  completed: number
  completion_rate: number
}

export interface OverdueRateData {
  open_total: number
  overdue: number
  rate: number
}

export interface PriorityDistributionData {
  from: string
  to: string
  low: number
  medium: number
  high: number
  urgent: number
  total: number
}

export type TrendGranularity = 'day' | 'week'
export type TrendMetric = 'created' | 'completed' | 'both'

export interface TrendPoint {
  bucket: string
  created: number
  completed: number
}

export interface TrendData {
  granularity: TrendGranularity
  metric: TrendMetric
  points: TrendPoint[]
}
