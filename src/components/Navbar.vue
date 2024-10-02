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
      </div>
    </v-container>
  </v-app-bar>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue'
import { useAuthStore } from '@/stores/Auth'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'eaNavbar',
  setup() {
    const authStore = useAuthStore()
    const route = useRouter()

    const isUserLoggedIn = computed(() => authStore.isAuthenticated)
    const userName = computed(() => authStore.userName)

    onMounted(() => {
      authStore.checkSession()
    })

    const isLoggedIn = computed(() => authStore.isSessionActive)

    const logout = () => {
      authStore.logout()
      route.push('/')
    }

    return {
      isUserLoggedIn,
      userName,
      logout,
      isLoggedIn
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
