import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: () => import('@/views/landing/LandingView.vue'),
      meta: { public: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { guest: true },
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: () => import('@/views/auth/VerifyEmailView.vue'),
      meta: { guest: true },
    },
    {
      path: '/email-verified',
      name: 'email-verified',
      component: () => import('@/views/auth/EmailVerifiedView.vue'),
      meta: { guest: true },
    },
    {
      path: '/accept-invite',
      name: 'accept-invite',
      component: () => import('@/views/auth/AcceptInviteView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/workspace',
      name: 'workspace-select',
      component: () => import('@/views/WorkspaceSelectView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/app',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: { name: 'dashboard' },
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'tasks',
          name: 'tasks',
          component: () => import('@/views/tasks/TaskListView.vue'),
        },
        {
          path: 'tasks/:id',
          name: 'task-detail',
          component: () => import('@/views/tasks/TaskDetailView.vue'),
        },
        {
          path: 'members',
          name: 'members',
          component: () => import('@/views/members/MemberListView.vue'),
        },
        {
          path: 'activity',
          name: 'activity',
          component: () => import('@/views/activity/ActivityLogView.vue'),
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/ProfileView.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/settings/TenantSettingsView.vue'),
        },
        {
          path: 'billing',
          name: 'billing',
          component: () => import('@/views/billing/BillingView.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  const tenantStore = useTenantStore()

  const isAuthenticated = authStore.isAuthenticated
  const hasTenant = !!tenantStore.currentTenantId

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Authenticated users hitting guest pages go to workspace select or dashboard
  if (to.meta.guest && isAuthenticated) {
    return hasTenant ? { name: 'dashboard' } : { name: 'workspace-select' }
  }

  // Authenticated users hitting landing go to workspace select or dashboard
  if (to.name === 'landing' && isAuthenticated) {
    return hasTenant ? { name: 'dashboard' } : { name: 'workspace-select' }
  }

  // Authenticated users hitting app routes without a selected workspace
  if (isAuthenticated && !hasTenant && to.path.startsWith('/app')) {
    return { name: 'workspace-select' }
  }
})

export default router
