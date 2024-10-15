<template>
  <v-app-bar app color="primary" dark>
    <v-container class="d-flex align-center justify-space-between">
      <!-- Left side of Navbar -->
      <div class="left-nav-container">
        <a href="/">
          <img class="app-icon" src="../assets/eaIcon.png" alt="" />
        </a>
        <h1 class="app-name">Expense Analyser</h1>
      </div>
      <!-- Right side of Navbar -->
      <div class="right-nav-container">
        <v-spacer> </v-spacer>
        <div v-if="!isUserLoggedIn" class="nav-links">
          <v-btn to="/login">Login</v-btn>
          <v-btn to="/register">Register</v-btn>
        </div>
        <div v-if="isUserLoggedIn && isLoggedIn">
          <v-btn @click.prevent="logout">Logout</v-btn>
          <v-btn to="/about">About</v-btn>
        </div>
        <div v-if="isUserLoggedIn && isLoggedIn">
          <button
            type="button"
            class="ml-2 v-btn v-btn--flat v-btn--text theme--light v-size--large"
            style="min-width: 0px; padding: 5px 5px"
            role="button"
            aria-haspopup="true"
            aria-expanded="true"
            v-on:click="onClickBell"
          >
            <span class="v-btn__content" style="font-size: 32px">
              <span class="v-badge v-badge--bordered v-badge--overlap theme--light">
                <i aria-hidden="true" class="v-icon notranslate mdi mdi-bell theme--light"></i>
                <span class="v-badge__wrapper" v-if="notificationCount > 0">
                  <span
                    aria-atomic="true"
                    aria-label="Badge"
                    aria-live="polite"
                    role="status"
                    class="v-badge__badge red"
                    style="inset: auto auto calc(100% - 12px) calc(100% - 12px)"
                  >
                    <span>{{ notificationCount }}</span>
                    <!-- Bind notification count -->
                  </span>
                </span>
              </span>
            </span>
          </button>
        </div>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue'
import { useAuthStore } from '../stores/Auth'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '../stores/Notifications'
export default defineComponent({
  name: 'eaNavbar',
  setup() {
    const authStore = useAuthStore()
    const notificationStore = useNotificationStore()
    const route = useRouter()

    const isUserLoggedIn = computed(() => authStore.isAuthenticated)
    const userName = computed(() => authStore.userName)
    const notificationCount = computed(() => notificationStore.count)

    const isLoggedIn = computed(() => authStore.isSessionActive)
    onMounted(() => {
      authStore.checkSession()
    })
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
      notificationCount
    }
  }
})
</script>

<style scoped>
.app-icon {
  width: 40px;
  height: auto;
}
.left-nav-container {
  display: flex; /* Use flex for aligning items */
  align-items: center; /* Center items vertically */
}
.app-name {
  color: white;
  font-size: 24px;
  margin-left: 10px; /* Space between icon and name */
}

.right-nav-container {
  display: flex; /* Use flex for aligning items */
  align-items: center; /* Center items vertically */
}

.nav-links {
  display: flex;
  gap: 20px; /* Space between links */
}

.user-menu {
  position: relative;
}

#app {
  padding-top: 60px; /* Adjust this value based on the navbar height */
}
</style>
