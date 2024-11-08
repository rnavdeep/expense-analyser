<template>
  <div>
    <!-- Friend Search Section -->
    <v-container>
      <v-row align="center" justify="center" class="mb-4">
        <v-col cols="12" md="2">
          <h1 class="section-title">Search Friend</h1>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="friendSearchQuery"
            dense
            outlined
            label="Search by Username or Email"
            clearable
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="2">
          <v-btn color="primary" @click="searchFriend">Search</v-btn>
        </v-col>
      </v-row>
    </v-container>

    <!-- Loading Indicator -->
    <v-row v-if="isLoading" class="justify-center">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>

    <!-- No user Found -->
    <v-row v-else-if="!isLoading && !friend" class="justify-center">
      <v-col cols="12" class="text-center">
        <p>No user found.</p>
      </v-col>
    </v-row>

    <!-- Friend Display -->
    <v-container v-else>
      <v-row justify="center">
        <v-col cols="12" md="6" lg="4" class="d-flex justify-center">
          <div class="friend-card">
            <span class="friend-username">{{ friend?.username }}</span>
            <v-btn color="primary" @click="sendRequest(friend)">Send Request</v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>
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
.v-container {
  padding: 10px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
}

.text-center {
  font-size: 1.2rem;
  color: gray;
  margin-top: 20px;
}

.v-progress-circular {
  margin: 40px 0;
}

.friend-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 10px;
  background-color: #f9f9f9;
  width: 100%;
}

.friend-username {
  font-weight: 500;
  font-size: 1.2rem;
  margin-right: 10px;
}

.send-request-btn {
  margin-left: auto;
}
</style>
