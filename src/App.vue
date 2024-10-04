<template>
  <v-app class="app-background">
    <div class="navbar">
      <eaNavbar />
      <eaNavigationDrawer />
    </div>
    <div class="main-body">
      <v-main>
        <main class="main-content">
          <router-view />
        </main>
      </v-main>
    </div>
    <v-footer>ednvvednfpenfpq</v-footer>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import eaNavbar from './components/Navbar.vue'
import eaNavigationDrawer from './components/NavigationDrawer.vue'
export default defineComponent({
  name: 'App',
  components: {
    eaNavbar,
    eaNavigationDrawer
  }
})
</script>

<style>
/* Set the body's background color */
body {
  background-color: white; /* White background for the body */
  margin: 10px; /* Remove default margin */
  height: 100vh; /* Make body take the full viewport height */
}

/* Apply the same background color to v-app */
.app-background {
  background-color: white;
  height: 100vh;
}
.main-body {
  width: 1350px;
  padding: 10px;
  margin: 10px;
}
/* Main content styles */
.main-content {
  height: calc(100vh - 64px); /* Adjust height based on navbar height */
  padding: 0; /* Remove any padding if you want no space around */
  overflow-y: scroll; /* Allow vertical scrolling */
}

/* Hide scrollbar for Webkit browsers */
.main-content::-webkit-scrollbar {
  display: none; /* Hide scrollbar */
}

/* Hide scrollbar for other browsers */
.main-content {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
