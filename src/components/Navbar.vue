<template>
  <v-app-bar app color="nav" dark>
    <v-container class="d-flex align-center justify-space-between">
      <!-- Left side -->
      <div class="left-nav-container">
        <v-app-bar-nav-icon
          v-if="showAppNav && mobile"
          class="nav-hamburger"
          aria-label="Open navigation menu"
          @click="drawer = !drawer"
        ></v-app-bar-nav-icon>

        <a href="/" class="logo-link">
          <div class="logo-mark" aria-label="Expense Analyser">
            <div class="logo-mark-inner"></div>
          </div>
        </a>
        <h1 class="app-name">Expense Analyser</h1>

        <!-- Authenticated route links (desktop) -->
        <nav v-if="showAppNav && !mobile" class="nav-links-app">
          <RouterLink v-for="link in navLinks" :key="link.to" :to="link.to" class="app-link">
            {{ link.title }}
          </RouterLink>
        </nav>
      </div>

      <!-- Right side -->
      <div class="right-nav-container">
        <v-spacer />

        <!-- Theme toggle -->
        <v-btn
          icon
          variant="text"
          @click="toggleTheme"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
        </v-btn>

        <div v-if="!isUserLoggedIn" class="nav-links">
          <v-btn to="/login">Login</v-btn>
          <v-btn to="/register">Register</v-btn>
        </div>

        <template v-if="showAppNav">
          <v-btn icon variant="text" aria-label="Notifications" @click="onClickBell">
            <v-badge
              v-if="notificationCount > 0"
              :content="notificationCount"
              color="error"
              floating
            >
              <v-icon>mdi-bell</v-icon>
            </v-badge>
            <v-icon v-else>mdi-bell</v-icon>
          </v-btn>

          <!-- Avatar / account menu -->
          <v-menu location="bottom end">
            <template v-slot:activator="{ props }">
              <button class="avatar-btn" v-bind="props" aria-label="Account menu">
                {{ initials }}
              </button>
            </template>
            <v-list density="compact">
              <v-list-item to="/about" prepend-icon="mdi-account-circle" title="Profile"></v-list-item>
              <v-list-item prepend-icon="mdi-logout" title="Logout" @click="logout"></v-list-item>
            </v-list>
          </v-menu>
        </template>
      </div>
    </v-container>
  </v-app-bar>

  <!-- Mobile navigation drawer (collapsed top-nav links) -->
  <v-navigation-drawer
    v-if="showAppNav"
    v-model="drawer"
    temporary
    location="left"
    color="nav"
    theme="dark"
    class="ea-mobile-drawer"
  >
    <v-list nav density="comfortable" class="ea-mobile-list">
      <v-list-item
        v-for="link in navLinks"
        :key="link.to"
        :to="link.to"
        :prepend-icon="link.icon"
        :title="link.title"
        @click="drawer = false"
      ></v-list-item>
      <v-divider class="ea-mobile-divider my-2"></v-divider>
      <v-list-item
        to="/about"
        prepend-icon="mdi-account-circle"
        title="Profile"
        @click="drawer = false"
      ></v-list-item>
      <v-list-item prepend-icon="mdi-logout" title="Logout" @click="logout"></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import { useTheme, useDisplay } from 'vuetify'
import { useAuthStore } from '../stores/Auth'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '../stores/Notifications'

export default defineComponent({
  name: 'eaNavbar',
  setup() {
    const authStore = useAuthStore()
    const notificationStore = useNotificationStore()
    const route = useRouter()
    const theme = useTheme()
    const { mobile } = useDisplay()

    const isUserLoggedIn = computed(() => authStore.isAuthenticated)
    const userName = computed(() => authStore.userName)
    const notificationCount = computed(() => notificationStore.count)
    const isLoggedIn = computed(() => authStore.isSessionActive)
    const isDark = computed(() => theme.global.current.value.dark)
    const showAppNav = computed(() => isUserLoggedIn.value && isLoggedIn.value)

    const drawer = ref(false)

    // Top-nav routes (matches the redesign's persistent top nav). Add Friend and
    // Notifications are reachable from the Friends screen and the bell respectively.
    const navLinks = [
      { title: 'Dashboard', to: '/dashboard', icon: 'mdi-view-dashboard' },
      { title: 'Expenses', to: '/myExpenses', icon: 'mdi-piggy-bank' },
      { title: 'Budgets', to: '/budgets', icon: 'mdi-wallet-outline' },
      { title: 'Shared With Me', to: '/sharedExpenses', icon: 'mdi-account-multiple' },
      { title: 'Results', to: '/docResults', icon: 'mdi-file-chart' },
      { title: 'Friends', to: '/friends', icon: 'mdi-account-group' }
    ]

    const initials = computed(() => {
      const name = (userName.value || '').trim()
      return name ? name.slice(0, 2).toUpperCase() : 'U'
    })

    onMounted(() => {
      authStore.checkSession()
    })

    const toggleTheme = () => {
      const next = isDark.value ? 'light' : 'dark'
      theme.global.name.value = next
      localStorage.setItem('ea-theme', next)
      document.body.style.backgroundColor = next === 'dark' ? '#0f1117' : '#faf9f6'
    }

    const logout = async () => {
      drawer.value = false
      await authStore.logout()
      route.push('/')
    }

    const onClickBell = () => {
      notificationStore.count = 0
      route.push('/notifications')
      notificationStore.ReadAllUnreadNotifications()
    }

    return {
      isUserLoggedIn,
      userName,
      logout,
      isLoggedIn,
      onClickBell,
      notificationCount,
      isDark,
      toggleTheme,
      mobile,
      drawer,
      navLinks,
      initials,
      showAppNav
    }
  }
})
</script>

<style scoped>
.logo-link {
  text-decoration: none;
  display: flex;
}

.logo-mark {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: var(--ea-emerald);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-mark-inner {
  width: 9px;
  height: 9px;
  border-radius: 3px;
  background: var(--ea-nav);
}

.left-nav-container {
  display: flex;
  align-items: center;
}

.app-name {
  color: white;
  font-family: var(--ea-display);
  font-weight: 700;
  font-size: 16px;
  margin-left: 10px;
}

/* Authenticated route links — horizontal pills, emerald active state. */
.nav-links-app {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 30px;
}

.app-link {
  font-family: var(--ea-display);
  font-weight: 500;
  font-size: 13.5px;
  letter-spacing: -0.01em;
  color: rgba(255, 255, 255, 0.74);
  text-decoration: none;
  padding: 7px 13px;
  border-radius: 8px;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.app-link:hover {
  color: #ffffff;
}

.app-link.router-link-active {
  color: #ffffff;
  font-weight: 600;
  background: var(--ea-emerald);
}

.right-nav-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-links {
  display: flex;
  gap: 4px;
}

/* Circular initials avatar opening the account menu. */
.avatar-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--ea-emerald);
  color: #ffffff;
  font-family: var(--ea-display);
  font-weight: 700;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  cursor: pointer;
  border: none;
}

.ea-mobile-list :deep(.v-list-item-title) {
  font-family: var(--ea-display);
  font-weight: 500;
  letter-spacing: -0.01em;
}

.ea-mobile-list :deep(.v-list-item) {
  color: rgba(255, 255, 255, 0.78);
}

.ea-mobile-list :deep(.v-list-item--active) {
  color: var(--ea-emerald);
  font-weight: 600;
}

.ea-mobile-divider {
  border-color: rgba(255, 255, 255, 0.08);
}
</style>
