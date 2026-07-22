import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RegisterView from '../views/RegisterView.vue'
import LoginView from '../views/LoginView.vue'
import ExpenseCreateView from '../views/ExpenseCreateView.vue'
import ExpenseListView from '../views/ExpenseListView.vue'
import DocumentResultPageView from '../views/DocumentResultPageView.vue'
import NotificationView from '../views/NotificationsView.vue'
import FriendsView from '../views/FriendsAddView.vue'
import FriendsListView from '../views/FriendsListView.vue'
import SharedExpensesView from '../views/SharedExpensesView.vue'
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
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresLogin: true, title: 'Dashboard', description: 'Overview of your expenses' }
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
      path: '/sharedExpenses',
      name: 'SharedExpenses',
      component: SharedExpensesView,
      meta: {
        requiresLogin: true,
        title: 'Shared With Me',
        description: 'Shared Expenses Listing'
      }
    },
    {
      path: '/docResults',
      name: 'Results',
      component: DocumentResultPageView,
      meta: { requiresLogin: true, title: 'Result', description: 'Results' }
    },
    {
      path: '/notifications',
      name: 'Notifications',
      component: NotificationView,
      meta: { requiresLogin: true, title: 'Notifications', description: 'Notifications' }
    },
    {
      path: '/addFriend',
      name: 'Add Friend',
      component: FriendsView,
      meta: { requiresLogin: true, title: 'Add Friend', description: 'Add Friend' }
    },
    {
      path: '/friends',
      name: 'Friends',
      component: FriendsListView,
      meta: { requiresLogin: true, title: 'Friends', description: 'Friends' }
    },
    {
      path: '/balances/:userId',
      name: 'BalanceDetail',
      component: () => import('../views/BalanceDetailView.vue'),
      meta: { requiresLogin: true, title: 'Balance detail', description: 'History with a friend' }
    },
    {
      path: '/categories',
      name: 'Categories',
      component: () => import('../views/CategoriesView.vue'),
      meta: { requiresLogin: true, title: 'Categories', description: 'Set monthly spending limits' }
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
  } else if (to.name === 'home' && authStore.isAuthenticated) {
    // Authenticated users land on the data-rich dashboard, not the marketing home
    next({ name: 'Dashboard' })
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
