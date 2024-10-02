import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegisterView from '../views/RegisterView.vue'
import LoginView from '../views/LoginView.vue'
import { useAuthStore } from '@/stores/Auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { requiresLogin: true } // Requires login
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresGuest: true } // Requires guest (i.e., user should not be logged in)
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Ensure the session is validated before each route change
  await authStore.checkSession()

  if (to.matched.some((record) => record.meta.requiresLogin)) {
    // Route requires login
    if (!authStore.isAuthenticated) {
      next({ name: 'Login' }) // Redirect to login if not logged in
    } else {
      next() // Proceed to the route
    }
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // Route is guest-only, redirect to home if logged in
    next({ name: 'home' })
  } else {
    next() // No restrictions, proceed to the route
  }
})

export default router
