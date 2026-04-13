import { createRouter, createWebHistory } from 'vue-router'
import type { Role } from '@/types'
import { getDefaultRoute } from '@/config/navigation'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Public (no AppLayout)
    { path: '/login', name: 'Login', component: () => import('@/views/LoginView.vue'), meta: { requiresAuth: false } },
    { path: '/register', name: 'Register', component: () => import('@/views/RegisterView.vue'), meta: { requiresAuth: false } },

    // Protected (wrapped in AppLayout)
    {
      path: '/',
      component: () => import('@/components/layout/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        // User + Developer
        { path: 'ideas', name: 'Ideas', component: () => import('@/views/IdeasView.vue'), meta: { roles: ['user', 'developer'] } },
        { path: 'ideas/:id', name: 'IdeaDetail', component: () => import('@/views/IdeaDetailView.vue'), meta: { roles: ['user', 'developer', 'admin'] } },
        { path: 'my-ideas', name: 'MyIdeas', component: () => import('@/views/MyIdeasView.vue'), meta: { roles: ['user', 'developer'] } },
        { path: 'kanban', name: 'Kanban', component: () => import('@/views/KanbanView.vue'), meta: { roles: ['developer'] } },
        // Developer only
        { path: 'collaborations', name: 'MyCollaborations', component: () => import('@/views/MyCollaborationsView.vue'), meta: { roles: ['developer'] } },
        { path: 'ranking', name: 'Ranking', component: () => import('@/views/RankingView.vue'), meta: { roles: ['developer', 'admin'] } },
        // Admin only
        { path: 'admin/dashboard', name: 'AdminDashboard', component: () => import('@/views/AdminDashboardView.vue'), meta: { roles: ['admin'] } },
        { path: 'admin/ideas', name: 'AdminIdeas', component: () => import('@/views/AdminIdeasView.vue'), meta: { roles: ['admin'] } },
        { path: 'admin/users', name: 'AdminUsersView', component: () => import('@/views/AdminUsersView.vue'), meta: { roles: ['admin'] } },
        // Root redirect
        { path: '', redirect: '/ideas' },
      ],
    },

    // Catch-all
    { path: '/:pathMatch(.*)*', redirect: '/ideas' },
  ],
})

router.beforeEach(async (to) => {
  const { useAuthStore } = await import('@/stores/auth')
  const authStore = useAuthStore()

  const requiresAuth = to.meta.requiresAuth !== false
  const allowedRoles = to.meta.roles as Role[] | undefined

  // Try to rehydrate auth from stored token
  if (requiresAuth && !authStore.isAuthenticated) {
    await authStore.checkAuth()
    if (!authStore.isAuthenticated) {
      return { name: 'Login', query: { redirect: to.fullPath } }
    }
  }

  // Already authenticated → redirect away from public pages
  if (!requiresAuth && authStore.isAuthenticated && authStore.role) {
    return { path: getDefaultRoute(authStore.role) }
  }

  // Role-based access check
  if (authStore.isAuthenticated && allowedRoles && authStore.role) {
    if (!allowedRoles.includes(authStore.role)) {
      return { path: getDefaultRoute(authStore.role) }
    }
  }
})

export default router
