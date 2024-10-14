<template>
  <v-navigation-drawer app expand-on-hover rail permanent v-if="isUserLoggedIn || isLoggedIn">
    <v-list>
      <v-list-item
        :prepend-avatar="userImage"
        :subtitle="userEmail"
        :title="userName"
        href="/profile"
      ></v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item
        prepend-icon="mdi-piggy-bank"
        title="My Expenses"
        value="expenses"
        to="/myExpenses"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-receipt-text-plus"
        title="Create Expense"
        value="createExpense"
        to="/newExpense"
      ></v-list-item>

      <v-list-item
        prepend-icon="mdi-cog"
        title="Expense Results"
        value="expenseResults"
        to="/docResults"
      ></v-list-item>

      <v-list-item
        prepend-icon="mdi-account-group"
        title="My Friends"
        value="friends"
        to="/friends"
      ></v-list-item>
      <!-- New List Item with Icon -->
      <v-list-item
        prepend-icon="mdi-account-plus"
        title="Add Friend"
        value="addFriend"
        to="/addFriend"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-bell"
        title="Notifications"
        value="notifications"
        to="/myNotification"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue'
import { useAuthStore } from '../stores/Auth'
import eaIcon from '../assets/eaIcon.png'
export default defineComponent({
  name: 'eaNavigationDrawer',
  setup() {
    const authStore = useAuthStore()
    const userImage = eaIcon
    const isUserLoggedIn = computed(() => authStore.isAuthenticated)
    const userName = computed(() => authStore.userName)
    const userEmail = computed(() => authStore.userName)
    onMounted(() => {
      authStore.checkSession()
    })

    const isLoggedIn = computed(() => authStore.isSessionActive)

    return {
      isUserLoggedIn,
      userName,
      isLoggedIn,
      userImage,
      userEmail
    }
  }
})
</script>

<style scoped></style>
