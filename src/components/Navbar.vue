<template>
  <nav class="navbar">
    <div class="navbar-container">
      <a href="/"><img src="@/assets/eaIcon.png" alt="App Icon" class="app-icon" /></a>

      <h1 class="app-name">Expense Analyser</h1>

      <!-- Links for logged out users -->
      <div v-if="!isUserLoggedIn" class="nav-links">
        <router-link to="/login">Login</router-link>
        <router-link to="/register">Register</router-link>
      </div>

      <!-- Dropdown for logged in users -->
      <div v-if="isUserLoggedIn" class="user-menu">
        <button @click="toggleDropdown" class="user-name">{{ userName }}</button>
        <ul v-if="dropdownOpen" class="dropdown">
          <li><router-link to="/profile">Profile</router-link></li>
          <li><a href="#" @click.prevent="logout">Logout</a></li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useAuthStore } from '@/stores/Auth'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'eaNavbar',
  setup() {
    const authStore = useAuthStore()
    const dropdownOpen = ref(false)
    const route = useRouter()

    // Create a computed property for isUserLoggedIn
    const isUserLoggedIn = computed(() => authStore.isAuthenticated)
    const userName = computed(() => authStore.userName)

    // Toggle dropdown visibility
    const toggleDropdown = () => {
      dropdownOpen.value = !dropdownOpen.value
    }

    // Handle logout
    const logout = () => {
      authStore.logout()
      dropdownOpen.value = false // Close dropdown on logout
      route.push('/')
    }

    return {
      ...authStore,
      isUserLoggedIn,
      userName,
      toggleDropdown,
      dropdownOpen,
      logout
    }
  }
})
</script>

<style scoped>
.navbar {
  position: fixed; /* Keep the navbar at the top */
  top: 0;
  left: 0;
  right: 0;
  background-color: #3498db; /* Change to your preferred color */
  padding: 10px 20px;
  z-index: 1000; /* Ensure it stays above other content */
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-icon {
  width: 40px; /* Adjust size as necessary */
  height: auto;
  margin-right: 10px;
}

.app-name {
  color: white;
  font-size: 24px;
  margin-left: 200px;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-size: 18px;
}

.nav-links a:hover {
  text-decoration: underline;
}

/* User dropdown styles */
.user-menu {
  position: relative;
}

.user-name {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 18px;
  text-decoration: none;
}

.user-name:hover {
  text-decoration: underline;
}

.dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  list-style: none;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dropdown li {
  margin: 10px 0;
}

.dropdown li a {
  color: black;
  text-decoration: none;
  font-size: 16px;
}

.dropdown li a:hover {
  text-decoration: underline;
}

.User {
  color: black;
}

/* Add padding to the main content to avoid being covered by the navbar */
#app {
  padding-top: 60px; /* Adjust this value based on the navbar height */
}
</style>
