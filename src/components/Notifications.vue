<template>
  <div class="page">
    <header class="page-head">
      <div>
        <h1 class="page-title">Notifications</h1>
        <p class="page-sub">Friend requests and receipt updates.</p>
      </div>
    </header>

    <div class="notif-card">
      <!-- Empty -->
      <div v-if="notifications.length === 0" class="notif-empty">
        <v-icon size="28" class="notif-empty-icon">mdi-bell-outline</v-icon>
        <p>You're all caught up.</p>
      </div>

      <!-- Rows -->
      <ul class="notif-list" v-else>
        <li
          v-for="(n, index) in notifications"
          :key="index"
          :class="['notif-row', n.isRead ? 'is-read' : 'is-unread']"
        >
          <span class="notif-dot" :class="{ active: !n.isRead }"></span>
          <div class="notif-icon">
            <v-icon size="20">{{
              n.isFriendRequest == 1 ? 'mdi-account-plus' : 'mdi-receipt-text'
            }}</v-icon>
          </div>

          <div class="notif-text">
            <p class="notif-title">{{ n.title }}</p>
            <p class="notif-message">{{ n.message }}</p>
          </div>

          <div class="notif-actions">
            <!-- Accept button for friend requests -->
            <v-btn
              v-if="n.isFriendRequest !== null && n.isFriendRequest == 1"
              color="secondary"
              size="small"
              @click="acceptRequest(n.id)"
            >
              Accept request
            </v-btn>

            <!-- Read state for regular notifications -->
            <template v-else-if="n.isFriendRequest == null || n.isFriendRequest == 0">
              <v-icon v-if="n.isRead" class="notif-status notif-status--read">mdi-check-circle</v-icon>
              <v-icon v-else class="notif-status">mdi-eye-outline</v-icon>
            </template>
          </div>
        </li>
      </ul>
    </div>
  </div>
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
.notif-card {
  background: var(--ea-surface);
  border: 1px solid var(--ea-border);
  border-radius: 16px;
  overflow: hidden;
}

.notif-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 56px 24px;
  color: var(--ea-muted);
}

.notif-empty-icon {
  color: var(--ea-emerald);
}

.notif-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.notif-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--ea-border);
  transition: background 0.15s ease;
}
.notif-row:last-child {
  border-bottom: none;
}
.notif-row:hover {
  background: var(--ea-paper);
}
.notif-row.is-unread {
  background: var(--ea-emerald-tint);
}
.notif-row.is-unread:hover {
  background: var(--ea-emerald-tint-strong);
}

.notif-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: transparent;
  flex-shrink: 0;
}
.notif-dot.active {
  background: var(--ea-emerald);
}

.notif-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--ea-paper);
  border: 1px solid var(--ea-border);
  color: var(--ea-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notif-text {
  flex-grow: 1;
  min-width: 0;
}

.notif-title {
  font-family: var(--ea-display);
  font-weight: 600;
  color: var(--ea-ink);
  font-size: 15px;
}

.notif-message {
  font-size: 14px;
  
  color: var(--ea-muted);
  margin-top: 2px;
}

.notif-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.notif-status {
  color: var(--ea-muted);
}
.notif-status--read {
  color: var(--ea-emerald);
}
</style>
