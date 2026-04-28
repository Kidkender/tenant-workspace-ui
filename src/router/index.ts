import { createRouter, createWebHistory } from 'vue-router'
import { STORAGE_KEYS } from '@/lib/constants'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
      path: '/',
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
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach((to) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
  const tenantId = localStorage.getItem(STORAGE_KEYS.TENANT_ID)

  if (to.meta.requiresAuth && !token) {
    return { name: 'login' }
  }

  if (to.meta.guest && token) {
    return { name: 'tasks' }
  }

  if (token && !tenantId && to.name === 'task-detail') {
    return { name: 'tasks' }
  }
})

export default router
