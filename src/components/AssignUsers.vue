<template>
  <!-- Dialog for assigning users to expenses -->
  <div class="assign-wrap">
    <v-dialog v-model="dialogAssignUsers" max-width="520">
      <v-card class="assign-card">
        <div class="assign-head">
          <h3 class="assign-title">Manage expense users</h3>
        </div>

        <div class="assign-body">
          <!-- Assign user -->
          <div class="assign-row">
            <v-select
              label="Select user"
              :items="availableUsers"
              v-model="selectedUserId"
              item-value="id"
              item-title="username"
              hide-details
              density="comfortable"
              class="assign-select"
            ></v-select>
            <v-btn color="secondary" @click="addUserToExpense">
              <v-icon start>mdi-plus</v-icon>
              Add
            </v-btn>
          </div>

          <!-- Assigned users -->
          <p class="assigned-label">Assigned users</p>
          <div class="assigned-chips" v-if="assignedUsers.length">
            <v-chip
              v-for="(user, index) in assignedUsers"
              :key="index"
              color="secondary"
              variant="tonal"
              closable
              @click:close="removeUserFromExpense(user.userId)"
            >
              {{ user.userName }}
            </v-chip>
          </div>
          <p v-else class="assigned-empty">No users assigned yet.</p>

          <!-- Loading Indicator -->
          <div class="loading" v-if="isUserAssigning">
            <v-progress-circular
              color="secondary"
              indeterminate
              :size="32"
              :width="3"
            ></v-progress-circular>
          </div>
        </div>

        <!-- Dialog actions -->
        <div class="assign-actions">
          <v-btn variant="text" @click="closeUserDialog">Close</v-btn>
        </div>
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
.assign-card {
  background: var(--ea-surface);
  border: 1px solid var(--ea-border);
  border-radius: 16px;
  padding: 24px;
}

.assign-head {
  margin-bottom: 16px;
}

.assign-title {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 20px;
  color: var(--ea-ink);
}

.assign-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.assign-select {
  flex-grow: 1;
}

.assigned-label {
  font-family: var(--ea-mono);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ea-muted);
  margin: 22px 0 10px;
}

.assigned-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.assigned-empty {
  font-size: 14px;
  color: var(--ea-muted);
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 72px;
  margin-top: 16px;
}

.v-btn {
  white-space: nowrap;
}
</style>
