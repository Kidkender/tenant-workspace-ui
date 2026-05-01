# Tenant Workspace UI

A multi-tenant workspace management frontend built with Vue 3, TypeScript, and Pinia. Supports workspace switching, task management, member management, role-based UI, activity logs, and in-app notifications.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (`<script setup>` Composition API) |
| Language | TypeScript (strict mode) |
| State | Pinia |
| Routing | Vue Router v4 |
| Styling | Tailwind CSS v4 |
| HTTP | Axios |
| i18n | vue-i18n v9 (EN / VI) |
| Build | Vite |

## Requirements

- Node.js 18+
- pnpm (or npm / yarn)

## Local Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env
# Edit VITE_API_URL to point to the backend

# 3. Start dev server
pnpm dev
```

The app will be available at `http://localhost:5173`.

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000/api` |

## Directory Structure

```
src/
├── components/
│   ├── comment/            # CommentList, CommentForm
│   ├── layout/             # Sidebar, UserMenu, NotificationBell
│   ├── task/               # CreateTaskModal, EditTaskModal
│   ├── tenant/             # TenantSwitcher, CreateTenantModal,
│   │                       #   InviteMemberModal, MemberDetailModal
│   └── ui/                 # LangSwitcher, StatusBadge
├── composables/
│   ├── useApiError.ts      # Maps API error codes to i18n messages
│   └── usePermission.ts    # Role-based rendering helper
├── i18n/
│   ├── index.ts            # vue-i18n setup
│   └── locales/
│       ├── en.ts           # English strings
│       └── vi.ts           # Vietnamese strings
├── layouts/
│   └── AppLayout.vue       # Authenticated shell (sidebar + topbar)
├── lib/
│   ├── api.ts              # Axios instance with auth + tenant interceptors
│   └── constants.ts        # Shared constants
├── router/
│   └── index.ts            # Routes + navigation guards
├── stores/
│   ├── auth.ts             # User session, tenant memberships
│   ├── task.ts             # Task list, filters, pagination, CRUD
│   ├── member.ts           # Workspace members, roles
│   ├── tenant.ts           # Active workspace, settings update
│   ├── activityLog.ts      # Activity log with filters
│   ├── dashboard.ts        # Dashboard stats
│   ├── comment.ts          # Task comments CRUD
│   ├── notification.ts     # In-app notifications
│   └── toast.ts            # Toast notification queue
├── types/
│   └── index.ts            # Shared TypeScript interfaces
└── views/
    ├── auth/
    │   ├── LoginView.vue
    │   ├── RegisterView.vue
    │   ├── VerifyEmailView.vue
    │   ├── EmailVerifiedView.vue
    │   └── AcceptInviteView.vue
    ├── activity/
    │   └── ActivityLogView.vue
    ├── members/
    │   └── MemberListView.vue
    ├── settings/
    │   └── TenantSettingsView.vue
    ├── tasks/
    │   ├── TaskListView.vue
    │   └── TaskDetailView.vue
    ├── DashboardView.vue
    └── ProfileView.vue
```

## Features

### Authentication
- Register with email verification
- Login with Sanctum token auth
- Resend verification email
- Accept workspace invitation via token link

### Workspace (Tenant) Management
- Create a new workspace
- Switch between multiple workspaces (stored in `localStorage`)
- Update workspace name (owner only)
- Invite members by email with role selection
- View, search, and manage workspace members
- Change member roles (owner only)
- Remove members from workspace (owner or admin)

### Tasks
- List tasks with filters: status, assignee, title search
- Paginated task table
- Create task: title, description, assign to member, set due date
- Edit task: title, description, status, due date
- Delete task with confirmation
- Task detail: description, assignee, due date, comments

### Comments
- Add comments to tasks
- Edit own comments inline
- Delete comments (with permission)

### Dashboard
- Task counts by status (To Do / In Progress / Done)
- Active member count
- Task progress bar
- Recent activity feed

### Activity Log
- Full workspace activity history
- Filter by action type (create / update / delete / assign)
- Paginated list with actor name and timestamp

### Notifications
- Bell icon with unread count badge
- Dropdown list of notifications
- Mark single notification as read
- Mark all as read

### Profile
- View and update display name

## Routing

| Path | Name | Auth | Description |
|---|---|---|---|
| `/login` | `login` | — | Sign in |
| `/register` | `register` | — | Create account |
| `/verify-email` | `verify-email` | — | Check inbox prompt |
| `/email-verified` | `email-verified` | — | Email confirmed screen |
| `/accept-invite/:token` | `accept-invite` | required | Join workspace via invite |
| `/` | (redirect) | required | Redirects to `/dashboard` |
| `/dashboard` | `dashboard` | required | Overview stats |
| `/tasks` | `tasks` | required | Task list |
| `/tasks/:id` | `task-detail` | required | Task detail + comments |
| `/members` | `members` | required | Member list |
| `/activity` | `activity` | required | Activity log |
| `/settings` | `settings` | required | Workspace settings |
| `/profile` | `profile` | required | User profile |

Navigation guards redirect unauthenticated users to `/login` and authenticated users away from auth pages.

## State Management

### `auth` store
Holds the current user, active tenant ID, and tenant memberships. The `currentTenant` getter merges the active tenant with the user's role in that workspace.

### `task` store
Manages task list state including `filters` (status, assigned_to, search), pagination, and CRUD operations. `setFilter()` resets pagination and re-fetches.

### `member` store
Fetches and caches workspace members and the roles list. Provides `removeMember()` and `updateMemberRole()` with optimistic local updates.

### `tenant` store
Wraps `currentTenant` from the auth store and exposes `updateTenant()` which calls `authStore.fetchMe()` after saving to keep the tenant name in sync.

### `notification` store
Polls or fetches notifications on demand. Tracks unread count separately via the `/notifications/unread` endpoint.

## Multi-Tenancy

Every authenticated API request to a tenant-scoped endpoint automatically includes:

```
X-Tenant-ID: <active-tenant-uuid>
```

This header is injected by the Axios request interceptor in `src/lib/api.ts` using `localStorage.getItem('tenant_id')`. Switching workspaces updates `localStorage` and triggers a page reload to clear all store state.

## Role-Based UI

The `usePermission()` composable and inline role checks gate UI elements:

```ts
const { isOwner, isAdmin, canManage } = usePermission()
```

- **Owner**: can edit workspace settings, change member roles
- **Admin**: can remove members, create/update/delete tasks
- **Member**: read-only access to tasks and members

## Internationalization

The app ships with English (`en`) and Vietnamese (`vi`) locales. The active locale is persisted to `localStorage`. All UI strings use `t('key')` — no hardcoded text in components.

Switch locale via the language switcher in the top bar.

## Build for Production

```bash
pnpm build
```

Output goes to `dist/`. Point your web server at `dist/index.html` and configure it to serve `index.html` for all routes (SPA fallback).
