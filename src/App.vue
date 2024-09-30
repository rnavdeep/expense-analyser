<!-- src/App.vue -->
<template>
  <div id="app">
    <eaNavbar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import eaNavbar from './components/Navbar.vue'
export default defineComponent({
  name: 'App',
  components: {
    eaNavbar
  }
})
</script>

<style>
/* Global styles */
body {
  margin: 0;
  font-family: Arial, sans-serif; /* Change to your preferred font */
}

.main-content {
  padding-top: 60px; /* Adjust this value based on the navbar height */
}
</style>
