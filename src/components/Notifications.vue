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
          <div class="notification-content">
            <v-list-item-content class="notification-text">
              <v-list-item-title>{{ n.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ n.message }}</v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-action class="notification-actions">
              <!-- Display accept button for friend requests -->
              <v-btn
                v-if="n.isFriendRequest !== null && n.isFriendRequest == 1"
                color="primary"
                @click="acceptRequest(n.id)"
              >
                Accept Request
              </v-btn>

              <!-- Icon buttons for regular notifications -->
              <div v-if="n.isFriendRequest == null || n.isFriendRequest == 0">
                <v-btn icon color="grey" v-if="n.isRead">
                  <v-icon>mdi-check-circle</v-icon>
                </v-btn>
                <v-btn icon color="primary" v-else>
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
              </div>
            </v-list-item-action>
          </div>
        </v-list-item>
      </v-list>
    </div>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useNotificationStore } from '../stores/Notifications'
import { useFriendsStore } from '../stores/Friends'

export default defineComponent({
  name: 'eaNotifications',
  setup() {
    const notificationStore = useNotificationStore()
    const friendStore = useFriendsStore()

    notificationStore.GetAllNotifications()

    const notifications = computed(() => notificationStore.notifications)

    const acceptRequest = async (id: string) => {
      console.log('Accepted friend request with ID:', id)
      await friendStore.acceptRequest(id)
      await notificationStore.GetAllNotifications()
    }

    return {
      notifications,
      acceptRequest
    }
  }
})
</script>

<style scoped>
.notifications {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 16px;
  background-color: #f1f1f1;
  border-radius: 8px;
}

.notification-section {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
}

.notification-item {
  border-radius: 8px;
  margin-bottom: 10px;
  padding: 12px;
  transition:
    background-color 0.3s,
    transform 0.2s;
}

.notification-item.unread {
  background-color: #e3f2fd;
  font-weight: bold;
}

.notification-item.read {
  background-color: #ffffff;
}

.notification-item:hover {
  background-color: #fbe6e6;
  transform: scale(1.02);
}

.notification-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.notification-text {
  flex-grow: 1;
}

/* Right-align buttons */
.notification-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notification-request {
  background-color: #ffecb3;
  padding: 12px;
  border-radius: 8px;
}

.v-btn {
  font-size: 0.875rem;
}
</style>
