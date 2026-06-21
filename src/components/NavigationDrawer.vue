<template>
  <v-navigation-drawer
    app
    expand-on-hover
    rail
    permanent
    color="nav"
    theme="dark"
    class="ea-drawer"
    v-if="isUserLoggedIn || isLoggedIn"
  >
    <v-list class="ea-drawer-user">
      <v-list-item
        :prepend-avatar="userImage"
        :subtitle="userEmail"
        :title="userName"
        href="/profile"
      ></v-list-item>
    </v-list>

    <v-divider class="ea-drawer-divider"></v-divider>

    <v-list density="compact" nav color="secondary" class="ea-drawer-list">
      <v-list-item
        prepend-icon="mdi-piggy-bank"
        title="My Expenses"
        value="expenses"
        to="/myExpenses"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-account-multiple"
        title="Shared Expenses"
        value="sharedExpenses"
        to="/sharedExpenses"
      ></v-list-item>
      <v-list-item
        prepend-icon="mdi-receipt-text-plus"
        title="Create Expense"
        value="createExpense"
        to="/newExpense"
      ></v-list-item>

      <v-list-item
        prepend-icon="mdi-file-chart"
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
        to="/notifications"
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

<style scoped>
/* Match the redesigned Navbar: ink surface, emerald accent for the active route. */
.ea-drawer {
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.ea-drawer-user :deep(.v-list-item-title) {
  font-family: var(--ea-display);
  font-weight: 600;
}

.ea-drawer-divider {
  border-color: rgba(255, 255, 255, 0.08);
}

.ea-drawer-list :deep(.v-list-item-title) {
  font-family: var(--ea-display);
  font-weight: 500;
  letter-spacing: -0.01em;
}

/* Resting items sit muted against the ink surface; hover/active lift to emerald. */
.ea-drawer-list :deep(.v-list-item) {
  color: rgba(255, 255, 255, 0.72);
  margin-bottom: 2px;
}

.ea-drawer-list :deep(.v-list-item:hover) {
  color: #ffffff;
}

.ea-drawer-list :deep(.v-list-item--active) {
  color: var(--ea-emerald);
  font-weight: 600;
}
</style>
