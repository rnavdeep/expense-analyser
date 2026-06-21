<template>
  <div class="page page--narrow">
    <header class="page-head">
      <div>
        <h1 class="page-title">Add friend</h1>
        <p class="page-sub">Find someone by username or email and send a request.</p>
      </div>
    </header>

    <!-- Search -->
    <div class="search-card">
      <div class="search-row">
        <v-text-field
          v-model="friendSearchQuery"
          prepend-inner-icon="mdi-account-search"
          placeholder="Search by username or email"
          hide-details
          clearable
          class="search-input"
          @keyup.enter="searchFriend"
        ></v-text-field>
        <v-btn color="secondary" size="large" @click="searchFriend">Search</v-btn>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="state-block">
      <v-progress-circular indeterminate color="secondary" :size="44"></v-progress-circular>
    </div>

    <!-- No user found -->
    <v-alert v-else-if="!friend" type="info" variant="tonal" class="result-alert">
      Search for a user to send a friend request.
    </v-alert>

    <!-- Friend result -->
    <div v-else class="friend-result">
      <div class="friend-avatar">{{ (friend?.username || '?').charAt(0).toUpperCase() }}</div>
      <div class="friend-info">
        <p class="friend-name">{{ friend?.username }}</p>
        <p class="friend-meta" v-if="friend?.email">{{ friend?.email }}</p>
      </div>
      <v-btn color="secondary" @click="sendRequest(friend)">Send request</v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useFriendsStore } from '../stores/Friends'
import type { UserDto } from '@/models/UserDto'

export default defineComponent({
  name: 'eaFriendsAdd',
  setup() {
    const isLoading = ref(false)
    const friendSearchQuery = ref('')
    const friend = ref<UserDto | null>(null) // Single friend object, initially null
    const friendsStore = useFriendsStore()

    const searchFriend = async () => {
      isLoading.value = true
      friend.value = null
      try {
        const result = await friendsStore.getUser(friendSearchQuery.value)
        friend.value = result // Update the friend with the found result
      } finally {
        isLoading.value = false
      }
    }

    const sendRequest = async (friend: UserDto | null) => {
      // Logic to send a friend request to the friend
      if (friend !== null) {
        console.log('Request sent to', friend.username)
        await friendsStore.sendRequest(friend)
      }
    }

    return {
      isLoading,
      friendSearchQuery,
      friend,
      searchFriend,
      sendRequest
    }
  }
})
</script>

<style scoped>
.page--narrow {
  max-width: 640px;
}

.search-card {
  background: var(--ea-surface);
  border: 1px solid var(--ea-border);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  flex-grow: 1;
}

.state-block {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.result-alert {
  border-radius: 14px;
}

.friend-result {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: var(--ea-surface);
  border: 1px solid var(--ea-border);
  border-radius: 16px;
}

.friend-avatar {
  width: 44px;
  height: 44px;
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
  flex-grow: 1;
  min-width: 0;
}

.friend-name {
  font-family: var(--ea-display);
  font-weight: 600;
  color: var(--ea-ink);
  font-size: 16px;
}

.friend-meta {
  font-size: 13px;
  color: var(--ea-muted);
  margin-top: 2px;
}
</style>
