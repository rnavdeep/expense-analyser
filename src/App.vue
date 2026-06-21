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
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import eaNavbar from './components/Navbar.vue'
import eaNavigationDrawer from './components/NavigationDrawer.vue'
import TextractNotificationService from './services/TextractNotificationService'
import { createPinia } from 'pinia'

export default defineComponent({
  name: 'App',
  components: { eaNavbar, eaNavigationDrawer },
  setup() {
    createPinia()
  },
  mounted() {
    TextractNotificationService.start()
  },
  beforeUnmount() {
    TextractNotificationService.stop()
  }
})
</script>

<style>
body {
  margin: 0;
  padding: 0;
  height: 100vh;
  /* background synced with theme via JS in main.ts and Navbar toggle */
  background-color: #faf9f6;
}

.app-background {
  height: 100vh;
}

.main-body {
  width: 100%;
}

/* Prevent Vuetify layout vars from the nav drawer narrowing public pages */
.v-main {
  padding-inline-start: 0 !important;
  padding-inline-end: 0 !important;
}

.main-content {
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.main-content::-webkit-scrollbar { display: none; }
.main-content { -ms-overflow-style: none; scrollbar-width: none; }
</style>
