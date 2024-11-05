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

    <!-- No Friends Found -->
    <v-row v-else-if="!isLoading && friends.length === 0" class="justify-center">
      <v-col cols="12" class="text-center">
        <p>No friends found.</p>
      </v-col>
    </v-row>

    <!-- Friends List -->
    <v-container v-else>
      <v-col cols="12" md="2">
        <v-btn color="primary" @click="searchFriend">Send Request</v-btn>
      </v-col>
      <h2 class="section-title">Friends</h2>
      <v-row>
        <v-col v-for="(friend, index) in friends" :key="friend.id" cols="12" md="4">
          <eaFriendCard :friend="friend" :index="index" @remove="removeFriend(friend.id)" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'

export default defineComponent({
  name: 'eaFriendsAdd',
  setup() {
    const isLoading = ref(false)
    const friendSearchQuery = ref('')
    const friends = ref([])

    const searchFriend = async () => {
      isLoading.value = true
      try {
        // Fetch friends based on search query
        // Assume fetchFriends is a function that retrieves friend data from an API
        // friends.value = await fetchFriends(friendSearchQuery.value)
        // Placeholder for demo purposes
        friends.value = [
          { id: '1', name: 'John Doe' },
          { id: '2', name: 'Jane Smith' }
        ]
      } finally {
        isLoading.value = false
      }
    }

    const removeFriend = async (friendId: string) => {
      // Remove friend logic (optional for now)
    }

    onMounted(async () => {
      isLoading.value = true
      try {
        // Initial load of friends (optional for now)
        // friends.value = await fetchFriends()
      } finally {
        isLoading.value = false
      }
    })

    return {
      isLoading,
      friendSearchQuery,
      friends,
      searchFriend,
      removeFriend
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
</style>
