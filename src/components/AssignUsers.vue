<template>
  <!-- Dialog for assigning users to expenses -->
  <div class="resizable-box">
    <v-dialog v-model="dialogAssignUsers" max-width="500">
      <v-card>
        <v-card-title class="docTitle">Manage Expense Users</v-card-title>

        <!-- Assign User Section -->
        <v-card-text>
          <h3 class="section-title">Assign User to Expense</h3>
          <div class="users">
            <v-select
              label="Select User"
              :items="availableUsers"
              v-model="selectedUserId"
              item-value="id"
              item-title="username"
              outlined
              dense
            ></v-select>
            <v-btn text="Add User" style="background-color: lightgreen" @click="addUserToExpense"
              >Add</v-btn
            >
          </div>
        </v-card-text>

        <!-- Divider between sections -->
        <v-divider></v-divider>

        <!-- Show Section (Assigned Users) -->
        <v-card-text>
          <h3 class="section-title">Assigned Users</h3>
          <ol class="eachUser">
            <li v-for="(user, index) in assignedUsers" :key="index" class="user-item">
              <span class="user-index">{{ index + 1 }}.</span>
              <p class="userName">{{ user.userName }}</p>
              <v-tooltip :text="`Remove ${user.userName}`" location="top">
                <template v-slot:activator="{ props }">
                  <v-icon
                    @click="removeUserFromExpense(user.userId)"
                    v-bind="props"
                    style="color: dark-red; margin-left: 40px"
                    >mdi-account-remove</v-icon
                  >
                </template>
              </v-tooltip>
              <v-divider :opacity="100" style="width: 400px; margin-left: 40px"></v-divider>
            </li>
          </ol>
        </v-card-text>

        <!-- Loading Indicator -->
        <div class="loading" v-if="isUserAssigning">
          <v-progress-circular
            color="primary"
            indeterminate
            :size="37"
            :width="4"
          ></v-progress-circular>
        </div>

        <!-- Dialog actions -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="Close" @click="closeUserDialog">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { computed, onMounted, ref } from 'vue'
import { defineComponent } from 'vue'
import { useExpenseStore } from '../stores/Expense'
import { useFriendsStore } from '../stores/Friends'
import type { UserDto } from '@/models/UserDto'

export default defineComponent({
  name: 'eaAssignUsers',
  props: {
    expenseId: {
      type: String,
      required: false
    }
  },
  setup(props) {
    const expenseStore = useExpenseStore()
    const friendsStore = useFriendsStore()

    const dialogAssignUsers = computed(() => expenseStore.dialogAssignUsers)
    const selectedUserId = ref<string | null>(null)
    const availableUsers = ref<UserDto[]>([])
    const assignedUsers = computed(() => expenseStore.assignedUsers)
    const isUserAssigning = computed(() => expenseStore.isUserAssigning)
    // Fetch available users on component mount
    onMounted(async () => {
      try {
        availableUsers.value = await friendsStore.getDropdownUsers()
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    })

    const removeUserFromExpense = async (userId: string) => {
      try {
        //   await expenseStore.removeUserFromExpense({
        //     expenseId: props.expenseId,
        //     userId
        //   })
      } catch (error) {
        console.error('Error removing user from expense:', error)
      }
    }

    const addUserToExpense = async () => {
      expenseStore.isUserAssigning = true
      try {
        if ((props.expenseId != null, selectedUserId.value != null)) {
          await expenseStore.AddUserToExpense(props.expenseId, selectedUserId.value)
        }
        await expenseStore.GetAssignedUsers()
        expenseStore.isUserAssigning = false
      } catch (error) {
        console.error('Error removing user from expense:', error)
        expenseStore.isUserAssigning = false
      }
    }

    const closeUserDialog = () => {
      expenseStore.dialogAssignUsers = false
    }

    return {
      dialogAssignUsers,
      addUserToExpense,
      assignedUsers,
      availableUsers,
      closeUserDialog,
      selectedUserId,
      removeUserFromExpense,
      isUserAssigning
    }
  }
})
</script>

<style scoped>
.resizable-box {
  height: 100%;
  width: 100%;
  background-color: aqua;
  position: relative;
}

.users {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.eachUser {
  list-style: none;
  padding: 0;
  counter-reset: item;
}

.user-item {
  display: grid;
  grid-template-columns: 30px 1fr auto;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.user-index {
  text-align: right;
  font-weight: bold;
}

.userName {
  margin: 0;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  margin-top: 20px;
}

.v-btn {
  white-space: nowrap;
}
</style>
