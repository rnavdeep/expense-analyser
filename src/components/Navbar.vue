<template>
  <v-app-bar app color="nav" dark>
    <v-container class="d-flex align-center justify-space-between">
      <!-- Left side -->
      <div class="left-nav-container">
        <a href="/" class="logo-link">
          <div class="logo-mark" aria-label="Expense Analyser">
            <div class="logo-mark-inner"></div>
          </div>
        </a>
        <h1 class="app-name">Expense Analyser</h1>
      </div>

      <!-- Right side -->
      <div class="right-nav-container">
        <v-spacer />

        <!-- Theme toggle -->
        <v-btn icon variant="text" @click="toggleTheme" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
          <v-icon>{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
        </v-btn>

        <div v-if="!isUserLoggedIn" class="nav-links">
          <v-btn to="/login">Login</v-btn>
          <v-btn to="/register">Register</v-btn>
        </div>

        <div v-if="isUserLoggedIn && isLoggedIn" class="nav-links">
          <v-btn @click.prevent="logout">Logout</v-btn>
          <v-btn to="/about">About</v-btn>
        </div>

        <div v-if="isUserLoggedIn && isLoggedIn">
          <v-btn icon variant="text" @click="onClickBell">
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
        </div>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue'
import { useTheme } from 'vuetify'
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

    const isUserLoggedIn = computed(() => authStore.isAuthenticated)
    const userName = computed(() => authStore.userName)
    const notificationCount = computed(() => notificationStore.count)
    const isLoggedIn = computed(() => authStore.isSessionActive)
    const isDark = computed(() => theme.global.current.value.dark)

    onMounted(() => {
      authStore.checkSession()
    })

    const toggleTheme = () => {
      const next = isDark.value ? 'light' : 'dark'
      theme.global.name.value = next
      localStorage.setItem('ea-theme', next)
      document.body.style.backgroundColor = next === 'dark' ? '#0f1117' : '#faf9f6'
    }

    const logout = () => {
      authStore.logout()
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

.right-nav-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-links {
  display: flex;
  gap: 4px;
}
</style>
