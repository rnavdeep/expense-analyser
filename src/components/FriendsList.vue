<template>
  <div>
    <!-- Friends List Section -->
    <v-container>
      <v-row align="center" justify="center" class="mb-4">
        <v-col cols="12" md="8">
          <h1 class="section-title">Friends List</h1>
        </v-col>
      </v-row>

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

      <!-- Friends List Display -->
      <v-container v-else>
        <v-row justify="center">
          <v-col cols="12" md="10">
            <v-data-table :items="friends"></v-data-table>
          </v-col>
        </v-row>
      </v-container>
    </v-container>
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
.v-container {
  padding: 10px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
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
