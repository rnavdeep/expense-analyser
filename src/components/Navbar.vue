<!-- src/components/Navbar.vue -->
<template>
  <nav class="navbar">
    <div class="navbar-container">
      <a href="/"><img src="@/assets/eaIcon.png" alt="App Icon" class="app-icon" /></a>

      <h1 class="app-name">Expense Analyser</h1>
      <div class="nav-links">
        <router-link to="/login">Login</router-link>
        <router-link to="/Register">Register</router-link>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'eaNavbar'
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

/* Add padding to the main content to avoid being covered by the navbar */
#app {
  padding-top: 60px; /* Adjust this value based on the navbar height */
}
</style>
