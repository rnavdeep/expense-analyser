import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegisterView from '../views/RegisterView.vue'
import LoginView from '../views/LoginView.vue'
import ExpenseCreateView from '../views/ExpenseCreateView.vue'
import ExpenseListView from '../views/ExpenseListView.vue'
import DocumentResultPageView from '../views/DocumentResultPageView.vue'
import { useAuthStore } from '@/stores/Auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'Home',
        description: 'Landing Page'
      }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { requiresLogin: true, title: 'About', description: 'About Page' }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresGuest: true, title: 'Register', description: 'Registration Page' }
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView,
      meta: {
        title: 'Login',
        description: 'Login Page'
      }
    },
    {
      path: '/newExpense',
      name: 'ExpenseCreate',
      component: ExpenseCreateView,
      meta: { requiresLogin: true, title: 'New Expense', description: 'Create a new expense' }
    },
    {
      path: '/myExpenses',
      name: 'ExpenseList',
      component: ExpenseListView,
      meta: { requiresLogin: true, title: 'Expenses', description: 'Expenses Listing' }
    },
    {
      path: '/docResults',
      name: 'Results',
      component: DocumentResultPageView,
      meta: { requiresLogin: true, title: 'Result', description: 'Results' }
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

  // // Set the page title and meta description
  // const defaultTitle = 'Default Title'
  // const defaultDescription = 'Default Description'

  // const title = to.meta?.title || defaultTitle
  // document.title = title

  // const description = to.meta?.description || defaultDescription
  // const descriptionElement = document.querySelector('head meta[name="description"]')
  // if (descriptionElement) {
  //   descriptionElement.setAttribute('content', description)
  // }
})

export default router
