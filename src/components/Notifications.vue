<template>
  <v-container class="notifications">
    <!-- Notifications Section -->
    <div class="notification-section">
      <h2 class="section-title">Notifications</h2>
      <v-list>
        <v-list-item
          v-for="(n, index) in notifications"
          :key="index"
          :class="['notification-item', n.isRead ? 'read' : 'unread']"
        >
          <v-list-item-content>
            <v-list-item-title>{{ n.title }}</v-list-item-title>
            <v-list-item-subtitle>{{ n.message }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn icon color="grey" v-if="n.isRead">
              <v-icon>mdi-check-circle</v-icon>
            </v-btn>
            <v-btn icon color="primary" v-else>
              <v-icon>mdi-eye</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </div>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useNotificationStore } from '../stores/Notifications'

export default defineComponent({
  name: 'eaNotifications',
  setup() {
    const notificationStore = useNotificationStore()

    // Fetch notifications when the component is set up
    notificationStore.GetAllNotifications()

    // Compute all notifications
    const notifications = computed(() => notificationStore.notifications)

    return {
      notifications
    }
  }
})
</script>

<style scoped>
.notifications {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.notification-section {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.notification-item {
  border-radius: 8px;
  margin-bottom: 10px;
  transition: background-color 0.3s;
}

.notification-item.unread {
  background-color: #b3dfff; /* Light blue for unread notifications */
}

.notification-item.read {
  background-color: #ffffff; /* White for read notifications */
}

.notification-item:hover {
  background-color: #fbe6e6; /* Light red on hover */
}
</style>
