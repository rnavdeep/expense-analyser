<template>
  <v-navigation-drawer app expand-on-hover rail permanent v-if="isUserLoggedIn || isLoggedIn">
    <v-list>
      <v-list-item
        :prepend-avatar="userImage"
        :subtitle="userEmail"
        :title="userName"
      ></v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item
        prepend-icon="mdi-account-details"
        title="My Expenses"
        value="expenses"
        to="/myExpenses"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-plus"
        title="Create Expense"
        value="createExpense"
        to="/newExpense"
      ></v-list-item>

      <v-list-item
        prepend-icon="mdi-star"
        title="Starred"
        value="starred"
        to="/starred"
      ></v-list-item>
      <!-- New List Item with Icon -->
      <v-list-item
        prepend-icon="mdi-plus"
        title="Settings"
        value="settings"
        to="/settings"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue'
import { useAuthStore } from '@/stores/Auth'
import { useRouter } from 'vue-router'
import eaIcon from '../assets/eaIcon.png'
export default defineComponent({
  name: 'eaNavigationDrawer',
  setup() {
    const authStore = useAuthStore()
    const route = useRouter()
    const userImage = eaIcon
    const isUserLoggedIn = computed(() => authStore.isAuthenticated)
    const userName = computed(() => authStore.userName)
    const userEmail = computed(() => authStore.userName)
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
      isLoggedIn,
      userImage,
      userEmail
    }
  }
})
</script>

<style scoped></style>
