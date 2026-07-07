<template>
  <div class="page">
    <header class="page-head">
      <div>
        <h1 class="page-title">Friends</h1>
        <p class="page-sub">People you split expenses with.</p>
      </div>
      <router-link to="/addFriend" class="head-cta">
        <v-btn color="secondary" size="large">Add friend</v-btn>
      </router-link>
    </header>

    <!-- Loading -->
    <div v-if="isLoading" class="state-block">
      <v-progress-circular indeterminate color="secondary" :size="44"></v-progress-circular>
    </div>

    <!-- Empty -->
    <div v-else-if="friends.length === 0" class="empty-state">
      <div class="empty-chip">
        <v-icon size="28">mdi-account-group-outline</v-icon>
      </div>
      <h2 class="empty-title">No friends yet</h2>
      <p class="empty-sub">Add a friend to start sharing expenses.</p>
      <router-link to="/addFriend" class="head-cta">
        <v-btn color="secondary">Add friend</v-btn>
      </router-link>
    </div>

    <!-- Friends -->
    <div v-else class="friend-list">
      <div v-for="(friend, index) in friends" :key="index" class="friend-row">
        <div class="friend-avatar">{{ (friend.username || '?').charAt(0).toUpperCase() }}</div>
        <div class="friend-info">
          <p class="friend-name">{{ friend.username }}</p>
          <p class="friend-meta">{{ (friend.sharedExpenses?.length || 0) }} shared expenses</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useFriendsStore } from '@/stores/Friends'
export default defineComponent({
  name: 'eaFriendsList',
  async setup() {
    const isLoading = ref(true)
    const friendsStore = useFriendsStore()
    const friendsList = await friendsStore.getFriends()
    const friends = ref(friendsList)
    isLoading.value = false
    return {
      isLoading,
      friends
    }
  }
})
</script>

<style scoped>
.head-cta {
  text-decoration: none;
}

.state-block {
  display: flex;
  justify-content: center;
  padding: 64px 0;
}

.empty-state {
  text-align: center;
  padding: 56px 24px;
  border: 1px dashed var(--ea-border);
  border-radius: 16px;
  background: var(--ea-surface);
}

.empty-chip {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--ea-emerald-tint);
  color: var(--ea-emerald);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-title {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 20px;
  color: var(--ea-ink);
  margin-bottom: 6px;
}

.empty-sub {
  font-size: 14px;
  color: var(--ea-muted);
  margin-bottom: 20px;
}

/* Friend rows */
.friend-list {
  background: var(--ea-surface);
  border: 1px solid var(--ea-border);
  border-radius: 16px;
  overflow: hidden;
}

.friend-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--ea-border);
  transition: background 0.15s ease;
}
.friend-row:last-child {
  border-bottom: none;
}
.friend-row:hover {
  background: var(--ea-paper);
}

.friend-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--ea-ink);
  color: #fff;
  font-family: var(--ea-display);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.friend-info {
  min-width: 0;
}

.friend-name {
  font-family: var(--ea-display);
  font-weight: 600;
  color: var(--ea-ink);
  font-size: 15px;
}

.friend-meta {
  font-family: var(--ea-mono);
  font-size: 12px;
  color: var(--ea-muted);
  margin-top: 2px;
}
</style>
