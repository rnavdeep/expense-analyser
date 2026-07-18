<template>
  <div class="expense-row-wrap" :class="{ 'expense-row-wrap--selected': selectable && selected }">
    <div class="expense-row">
      <v-checkbox
        v-if="selectable"
        class="er-select"
        :model-value="selected"
        hide-details
        density="compact"
        color="primary"
        @update:model-value="onToggleSelect"
      ></v-checkbox>
      <div v-else class="er-icon">
        <v-icon size="18" color="secondary">mdi-receipt-text-outline</v-icon>
      </div>

      <div class="er-desc">
        <div class="er-title">{{ expense.title }}</div>
        <p class="er-sub">{{ expense.description }}</p>
        <p v-if="isReadOnly && expense.sharedByUsername" class="er-shared-by">
          Shared by {{ expense.sharedByUsername }}
        </p>
      </div>

      <div class="er-date">{{ expense.createdAt }}</div>

      <div class="er-amount amount">${{ expense.amount }}</div>

      <div class="er-actions">
        <template v-if="!isReadOnly">
          <v-tooltip text="Edit Expense" location="top">
            <template v-slot:activator="{ props }">
              <v-icon class="er-action" v-bind="props" @click="openEditDialog"
                >mdi-pencil</v-icon
              >
            </template>
          </v-tooltip>
          <v-tooltip text="Delete Expense" location="top">
            <template v-slot:activator="{ props }">
              <v-icon
                class="er-action er-action--danger"
                v-bind="props"
                @click="confirmDeletion"
                >mdi-trash-can</v-icon
              >
            </template>
          </v-tooltip>
        </template>
        <v-tooltip :text="expanded ? 'Collapse' : 'Show attached documents & shared users'" location="top">
          <template v-slot:activator="{ props }">
            <v-icon class="er-action er-chevron" :class="{ 'er-chevron--open': expanded }" v-bind="props" @click="toggleExpand"
              >mdi-chevron-down</v-icon
            >
          </template>
        </v-tooltip>
      </div>
    </div>

    <!-- Expanded panel: attached documents + shared users, revealed in place -->
    <div v-if="expanded" class="expense-row-expanded">
      <section class="er-panel-section">
        <h4 class="er-panel-title">Attached documents ({{ documents.length }})</h4>

        <div v-if="!documentsLoaded" class="er-panel-loading">
          <v-progress-circular indeterminate color="secondary" size="20"></v-progress-circular>
        </div>
        <div v-else class="er-doc-list">
          <div v-for="doc in documents" :key="doc.id" class="er-doc">
            <v-icon size="20" color="secondary">mdi-file-document-outline</v-icon>
            <div class="er-doc-info">
              <div class="er-doc-name">{{ doc.name }}</div>
              <span
                class="status-pill"
                :class="canProcess(doc) ? 'status-pill--pending' : 'status-pill--processed'"
                >{{ canProcess(doc) ? 'Pending' : 'Processed' }}</span
              >
            </div>
            <div class="er-doc-actions">
              <v-btn
                v-if="!isReadOnly && canProcess(doc)"
                size="small"
                color="primary"
                @click="openConfirmProcessDialog(doc)"
                >Process</v-btn
              >
              <v-btn
                v-else
                size="small"
                variant="outlined"
                :disabled="canProcess(doc)"
                :href="canProcess(doc) ? undefined : doc.url"
                target="_blank"
                >Download</v-btn
              >
              <v-tooltip v-if="!isReadOnly" :text="`Delete ${doc.name}`" location="top">
                <template v-slot:activator="{ props }">
                  <v-icon
                    class="er-action er-action--danger"
                    v-bind="props"
                    @click="deleteFile(doc.id)"
                    >mdi-trash-can</v-icon
                  >
                </template>
              </v-tooltip>
            </div>
          </div>

          <label
            v-if="expense.allowReceipts && !isReadOnly"
            class="er-attach-slot"
            :class="{ 'er-attach-slot--disabled': isAttaching }"
          >
            <v-icon size="18">mdi-plus</v-icon>
            {{ isAttaching ? 'Uploading…' : 'Attach another document' }}
            <input
              ref="fileInput"
              type="file"
              class="er-attach-input"
              :disabled="isReadOnly || isAttaching"
              @change="onAttachDocument"
            />
          </label>
        </div>
      </section>

      <section v-if="!isReadOnly" class="er-panel-section">
        <div class="er-panel-head">
          <h4 class="er-panel-title">Shared with</h4>
          <v-btn
            v-if="!hasLineItemAssignments && sharedLoaded && usersExpense.length > 1"
            size="small"
            variant="text"
            color="secondary"
            :disabled="isReadOnly"
            @click="editingShares ? cancelEditShares() : startEditShares()"
          >
            {{ editingShares ? 'Cancel' : 'Edit shares' }}
          </v-btn>
        </div>

        <div v-if="!hasLineItemAssignments && sharedLoaded && !editingShares" class="er-add-user">
          <v-select
            v-model="selectedUserId"
            :items="availableUsersToAdd"
            item-value="id"
            item-title="username"
            label="Add a friend"
            density="comfortable"
            hide-details
            :disabled="isReadOnly"
            class="er-add-user-select"
          ></v-select>
          <v-btn
            size="small"
            color="secondary"
            :disabled="isReadOnly || !selectedUserId || isAssigningUser"
            :loading="isAssigningUser"
            @click="addUserToExpense"
          >
            <v-icon start size="16">mdi-plus</v-icon>
            Add
          </v-btn>
        </div>

        <v-alert v-if="sharedError" type="error" variant="tonal" density="compact" class="er-shared-alert">
          {{ sharedError }}
        </v-alert>

        <div v-if="!sharedLoaded" class="er-panel-loading">
          <v-progress-circular indeterminate color="secondary" size="20"></v-progress-circular>
        </div>
        <p v-else-if="usersExpense.length === 0" class="er-panel-empty">Not shared with anyone.</p>
        <div v-else class="er-user-list">
          <div v-for="user in usersExpense" :key="user.userId" class="er-user">
            <template v-if="hasLineItemAssignments">
              <div class="friend-avatar er-user-avatar">{{ (user.userName || '?').charAt(0).toUpperCase() }}</div>
              <span class="er-user-name"
                >{{ user.userName }}<span v-if="isCurrentUser(user)" class="er-user-you">You</span></span
              >
              <span class="er-user-progress">on {{ user.itemsAssignedCount }} of {{ user.totalItemsCount }} items</span>
              <span class="er-user-amount amount">${{ user.userAmount }}</span>
            </template>
            <template v-else>
              <v-icon size="18" color="secondary">mdi-account-circle-outline</v-icon>
              <span class="er-user-name"
                >{{ user.userName }}<span v-if="isCurrentUser(user)" class="er-user-you">You</span></span
              >
              <template v-if="editingShares">
                <v-text-field
                  v-model.number="editShares[user.userId]"
                  type="number"
                  density="compact"
                  variant="outlined"
                  hide-details
                  suffix="%"
                  class="er-share-input"
                ></v-text-field>
              </template>
              <template v-else>
                <span class="er-user-share">{{ user.userShare * 100 }}%</span>
                <span class="er-user-amount amount">${{ shareAmount(user) }}</span>
              </template>
              <v-tooltip
                v-if="!editingShares"
                :text="isCurrentUser(user) ? `You can't remove yourself` : `Remove ${user.userName}`"
                location="top"
              >
                <template v-slot:activator="{ props }">
                  <v-icon
                    class="er-action er-action--danger"
                    :disabled="isReadOnly || isCurrentUser(user)"
                    v-bind="props"
                    @click="deleteUser(user.userId)"
                    >mdi-close</v-icon
                  >
                </template>
              </v-tooltip>
            </template>
          </div>

          <div v-if="editingShares" class="er-share-footer">
            <span :class="{ 'er-share-total--invalid': !sharesValid }" class="er-share-total"
              >Total: {{ sharesTotal }}%</span
            >
            <v-btn
              size="small"
              color="secondary"
              :disabled="!sharesValid || isSavingShares"
              :loading="isSavingShares"
              @click="saveShares"
              >Save</v-btn
            >
          </div>

          <router-link v-if="hasLineItemAssignments" to="/docResults" class="er-manage-sharing-hint">
            Manage sharing on the Document Results page
          </router-link>
        </div>
      </section>
    </div>

    <!-- Dialog for editing expense -->
    <v-dialog v-model="dialogEdit" max-width="500">
      <v-card>
        <v-card-title>Edit Expense</v-card-title>
        <v-card-text>
          <v-text-field label="Title" v-model="editTitle"></v-text-field>
          <v-textarea label="Description" v-model="editDescription"></v-textarea>
          <v-text-field
            label="Amount"
            type="number"
            prefix="$"
            v-model.number="editAmount"
          ></v-text-field>
          <v-alert v-if="editAmountError" type="error" variant="tonal" density="compact">{{
            editAmountError
          }}</v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="Cancel" @click="dialogEdit = false">Cancel</v-btn>
          <v-btn text="Save" @click="saveExpense(expense.id)">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Nested confirmation dialog for processing a document -->
    <v-dialog v-model="dialogConfirmProcess" max-width="400">
      <v-card>
        <v-card-title>Confirm Processing</v-card-title>
        <v-card-text>
          Are you sure you want to process the document <strong>{{ selectedDocument?.name }}</strong
          >?
        </v-card-text>
        <v-card-actions>
          <v-btn text="Cancel" @click="dialogConfirmProcess = false">Cancel</v-btn>
          <v-btn text="Ok" @click="confirmProcessExpenseDoc">Ok</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteConfirmed" max-width="400">
      <v-card>
        <v-card-title>Confirm Delete</v-card-title>
        <v-card-text>
          Expense deletion will remove attached bills and processed bills results. <br />
          Are you sure you want to delete the expense <strong>{{ expense.title }}</strong
          >?
        </v-card-text>
        <v-card-actions>
          <v-btn text="Cancel" @click="deleteConfirmed = false">Cancel</v-btn>
          <v-btn text="Ok" @click="deleteExpense()">Ok</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import type { ExpenseListDataDto } from '../models/ExpenseCreateForm'
import { UpdateExpenseDto } from '../models/ExpenseCreateForm'
import { CreateDocumentDto, type DocumentDialogDto } from '../models/DocumentDialogDto'
import type { UserAssignedDto } from '../models/UserAssignedDto'
import type { UserDto } from '../models/UserDto'
import { useExpenseStore } from '../stores/Expense'
import { useDocumentStore } from '../stores/Document'
import { useExtractStore } from '../stores/Extract'
import { useAuthStore } from '../stores/Auth'
import { useFriendsStore } from '../stores/Friends'
import { roundToCents } from '../utils/money'

interface ExpenseRowProps {
  expense: ExpenseListDataDto
  index: number
  isReadOnly: boolean
  selectable: boolean
  selected: boolean
}

export default defineComponent({
  name: 'eaExpenseRow',

  props: {
    expense: {
      type: Object as () => ExpenseListDataDto,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    isReadOnly: {
      type: Boolean,
      required: true
    },
    selectable: {
      type: Boolean,
      default: false
    },
    selected: {
      type: Boolean,
      default: false
    }
  },
  emits: ['edit', 'delete', 'toggle-select'],

  setup(props: ExpenseRowProps, { emit }) {
    const expenseStore = useExpenseStore()
    const docStore = useDocumentStore()
    const extractStore = useExtractStore()
    const authStore = useAuthStore()
    const friendsStore = useFriendsStore()

    const dialogEdit = ref(false)
    const editTitle = ref(props.expense.title)
    const editDescription = ref(props.expense.description)
    const editAmount = ref(props.expense.amount)
    const editAmountError = ref('')
    const deleteConfirmed = ref(false)

    const expanded = ref(false)
    const documentsLoaded = ref(false)
    const documents = ref<DocumentDialogDto[]>([])
    const sharedLoaded = ref(false)
    const usersExpense = ref<UserAssignedDto[]>([])
    const availableUsers = ref<UserDto[]>([])
    const selectedUserId = ref<number | null>(null)
    const isAssigningUser = ref(false)
    const sharedError = ref('')
    const editingShares = ref(false)
    const editShares = ref<Record<string, number>>({})
    const isSavingShares = ref(false)

    // Both new UserAssignedDto fields are null only when the expense has zero
    // line items (mirrors the backend) — presence of either signals that
    // sharing is now derived from line-item assignments, not manually edited.
    const hasLineItemAssignments = computed(() =>
      usersExpense.value.some((user) => user.totalItemsCount != null)
    )

    const sharesTotal = computed(() =>
      Math.round(
        Object.values(editShares.value).reduce((sum, value) => sum + (Number(value) || 0), 0) * 100
      ) / 100
    )
    const sharesValid = computed(() => sharesTotal.value === 100)

    // The backend only recomputes a user's stored dollar share when they're
    // added/removed/reassigned, not on a plain amount edit — derive it from
    // the current amount instead of trusting the (possibly stale) userAmount.
    const shareAmount = (user: UserAssignedDto): number =>
      roundToCents(props.expense.amount * user.userShare)

    const showSharedError = (message: string) => {
      sharedError.value = message
      setTimeout(() => {
        sharedError.value = ''
      }, 5000)
    }

    // Friends already sharing the expense shouldn't show up as addable again.
    const availableUsersToAdd = computed(() =>
      availableUsers.value.filter(
        (user) => !usersExpense.value.some((assigned) => assigned.userId === String(user.id))
      )
    )

    const dialogConfirmProcess = ref(false)
    const selectedDocument = ref<DocumentDialogDto | null>(null)
    const fileInput = ref<HTMLInputElement | null>(null)
    const isAttaching = ref(false)

    const loadDocuments = async () => {
      documents.value = await expenseStore.GetDocByExpenseId(props.expense.id)
      documentsLoaded.value = true
    }

    const loadShared = async () => {
      const [assigned, friends] = await Promise.all([
        expenseStore.GetAssignedUsersDto(props.expense.id),
        friendsStore.getDropdownUsers()
      ])
      usersExpense.value = assigned ?? []
      availableUsers.value = friends ?? []
      sharedLoaded.value = true
    }

    const addUserToExpense = async () => {
      if (!selectedUserId.value) return
      isAssigningUser.value = true
      try {
        await expenseStore.AddUserToExpense(props.expense.id, String(selectedUserId.value))
        const result = await expenseStore.GetAssignedUsersDto(props.expense.id)
        usersExpense.value = result ?? []
        selectedUserId.value = null
      } catch (error) {
        console.error('Error adding user to expense:', error)
      } finally {
        isAssigningUser.value = false
      }
    }

    const toggleExpand = () => {
      expanded.value = !expanded.value
      if (expanded.value) {
        if (!documentsLoaded.value) loadDocuments()
        if (!props.isReadOnly && !sharedLoaded.value) loadShared()
      }
    }

    const openEditDialog = () => {
      dialogEdit.value = true
      editTitle.value = props.expense.title
      editDescription.value = props.expense.description
      editAmount.value = props.expense.amount
      editAmountError.value = ''
    }

    const saveExpense = async (id: string) => {
      editAmount.value = roundToCents(editAmount.value)
      const scannedReceiptsTotal = props.expense.scannedReceiptsTotal ?? 0
      if (editAmount.value < scannedReceiptsTotal) {
        editAmountError.value = `Amount cannot be less than $${scannedReceiptsTotal} already scanned from receipts.`
        return
      }
      editAmountError.value = ''
      const updatedExpense = new UpdateExpenseDto(id, editTitle.value, editDescription.value, editAmount.value)
      emit('edit', props.index, updatedExpense)
      await expenseStore.updateExpense(id, updatedExpense)
      dialogEdit.value = false
    }

    const confirmDeletion = () => {
      deleteConfirmed.value = true
    }

    const deleteExpense = () => {
      if (deleteConfirmed.value == true) {
        emit('delete', props.index, props.expense)
        deleteConfirmed.value = false
      }
    }

    const onToggleSelect = () => {
      emit('toggle-select', props.expense)
    }

    const deleteFile = async (docId: string) => {
      try {
        await docStore.deleteDocumentFromExpense(docId)
        documents.value = documents.value.filter((doc) => doc.id !== docId)
      } catch (error) {
        console.error('Error deleting document:', error)
      }
    }

    // No userId on the client session — userName is the only identity signal
    // available to pick the current user out of the shared list.
    const isCurrentUser = (user: UserAssignedDto): boolean => {
      return !!authStore.userName && user.userName === authStore.userName
    }

    const deleteUser = async (userId: string) => {
      const user = usersExpense.value.find((u) => u.userId === userId)
      if (user && isCurrentUser(user)) return
      try {
        const result = await expenseStore.RemoveUserFromExpense(props.expense.id, userId)
        usersExpense.value = result ?? usersExpense.value.filter((u) => u.userId !== userId)
      } catch (error) {
        console.error('Error removing user from expense:', error)
        showSharedError(error instanceof Error ? error.message : 'Failed to remove user from expense')
      }
    }

    const startEditShares = () => {
      editShares.value = Object.fromEntries(
        usersExpense.value.map((user) => [user.userId, Math.round(user.userShare * 100 * 100) / 100])
      )
      editingShares.value = true
    }

    const cancelEditShares = () => {
      editingShares.value = false
      editShares.value = {}
    }

    const saveShares = async () => {
      if (!sharesValid.value) return
      isSavingShares.value = true
      try {
        const shares = usersExpense.value.map((user) => ({
          userId: user.userId,
          userShare: (editShares.value[user.userId] ?? user.userShare * 100) / 100
        }))
        const result = await expenseStore.UpdateExpenseUserShares(props.expense.id, shares)
        usersExpense.value = result ?? usersExpense.value
        editingShares.value = false
        editShares.value = {}
      } catch (error) {
        console.error('Error updating user shares:', error)
        showSharedError(error instanceof Error ? error.message : 'Failed to update user shares')
      } finally {
        isSavingShares.value = false
      }
    }

    // jobStatus has no frontend enum: null/2 means no completed-or-running job,
    // so the doc is still processable; any other value means it's been picked up.
    const canProcess = (doc: DocumentDialogDto): boolean => {
      return doc.jobStatus == null || doc.jobStatus == 2
    }

    const openConfirmProcessDialog = (doc: DocumentDialogDto) => {
      selectedDocument.value = doc
      dialogConfirmProcess.value = true
    }

    const processExpenseDoc = async (expenseId: string, docId: string) => {
      try {
        await extractStore.startExpenseAnalysis({ expenseId, docId })
      } catch (error) {
        console.error(error)
      }
    }

    const confirmProcessExpenseDoc = () => {
      if (selectedDocument.value) {
        processExpenseDoc(props.expense.id, selectedDocument.value.id)
        dialogConfirmProcess.value = false
        selectedDocument.value.jobStatus = 0
      }
    }

    const onAttachDocument = async (event: Event) => {
      const target = event.target as HTMLInputElement
      const file = target.files?.[0]
      if (!file) return
      try {
        isAttaching.value = true
        await docStore.uploadExpenseDoc(new CreateDocumentDto(props.expense.id, file))
        await loadDocuments()
      } catch (error) {
        console.error('Error attaching document:', error)
      } finally {
        isAttaching.value = false
        if (fileInput.value) fileInput.value.value = ''
      }
    }

    return {
      dialogEdit,
      editTitle,
      editDescription,
      editAmount,
      editAmountError,
      deleteConfirmed,
      expanded,
      documentsLoaded,
      documents,
      sharedLoaded,
      usersExpense,
      hasLineItemAssignments,
      availableUsersToAdd,
      selectedUserId,
      isAssigningUser,
      sharedError,
      editingShares,
      editShares,
      isSavingShares,
      sharesTotal,
      sharesValid,
      shareAmount,
      startEditShares,
      cancelEditShares,
      saveShares,
      dialogConfirmProcess,
      selectedDocument,
      fileInput,
      isAttaching,
      toggleExpand,
      openEditDialog,
      saveExpense,
      confirmDeletion,
      deleteExpense,
      onToggleSelect,
      deleteFile,
      deleteUser,
      isCurrentUser,
      addUserToExpense,
      canProcess,
      openConfirmProcessDialog,
      confirmProcessExpenseDoc,
      onAttachDocument
    }
  }
})
</script>

<style scoped>
.expense-row-wrap {
  border: 1px solid var(--ea-border);
  border-radius: 12px;
  background: var(--ea-surface);
  margin-bottom: 10px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.expense-row-wrap:hover {
  border-color: #d9d5cc;
}

.expense-row-wrap--selected {
  border-color: var(--ea-emerald);
  box-shadow: 0 0 0 1px var(--ea-emerald);
}

.expense-row {
  display: grid;
  grid-template-columns: 36px 2.2fr 1fr 1fr 132px;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
}

.er-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--ea-emerald-tint);
  display: flex;
  align-items: center;
  justify-content: center;
}

.er-select {
  flex: none;
  margin: -8px 0;
}

.er-desc {
  min-width: 0;
}

.er-title {
  font-family: var(--ea-display);
  font-weight: 600;
  letter-spacing: -0.01em;
  font-size: 15px;
  color: var(--ea-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.er-sub {
  font-size: 13px;
  color: var(--ea-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
}

.er-shared-by {
  font-size: 12px;
  color: var(--ea-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
  font-style: italic;
}

.er-date {
  font-size: 13px;
  color: var(--ea-muted);
}

.er-amount {
  text-align: right;
  font-size: 16px;
  color: var(--ea-ink);
}

.er-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.er-action {
  color: var(--ea-muted);
  cursor: pointer;
  transition: color 0.15s ease, transform 0.15s ease;
}
.er-action:hover {
  color: var(--ea-emerald);
}
.er-action--danger:hover {
  color: var(--ea-error, #dc2626);
}

.er-chevron--open {
  transform: rotate(180deg);
}

/* Expanded panel */
.expense-row-expanded {
  border-top: 1px solid var(--ea-border);
  padding: 16px 16px 20px 66px;
  background: var(--ea-paper);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.er-panel-title {
  font-family: var(--ea-display);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ea-muted);
  margin-bottom: 10px;
}

.er-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.er-panel-head .er-panel-title {
  margin-bottom: 0;
}

.er-shared-alert {
  margin-bottom: 12px;
}

.er-share-input {
  flex: none;
  width: 90px;
}

.er-share-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.er-share-total {
  font-size: 13px;
  color: var(--ea-muted);
}

.er-share-total--invalid {
  color: var(--ea-error, #dc2626);
}

.er-panel-loading {
  display: flex;
  padding: 8px 0;
}

.er-add-user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.er-add-user-select {
  flex: 1 1 auto;
  max-width: 260px;
}

.er-panel-empty {
  font-size: 13px;
  color: var(--ea-muted);
}

.er-doc-list,
.er-user-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.er-doc {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--ea-surface);
  border: 1px solid var(--ea-border);
  border-radius: 8px;
  padding: 10px 12px;
}

.er-doc-info {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.er-doc-name {
  font-size: 13px;
  color: var(--ea-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.er-doc-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.status-pill {
  font-family: var(--ea-mono);
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-pill--processed {
  background: var(--ea-emerald-tint);
  color: var(--ea-emerald);
}

.status-pill--pending {
  background: rgba(217, 119, 6, 0.12);
  color: #d97706;
}

.er-attach-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1.5px dashed var(--ea-border);
  border-radius: 8px;
  padding: 10px;
  font-size: 13px;
  color: var(--ea-muted);
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.er-attach-slot:hover {
  border-color: var(--ea-emerald);
  color: var(--ea-emerald);
}

.er-attach-slot--disabled {
  pointer-events: none;
  opacity: 0.6;
}

.er-attach-input {
  display: none;
}

.er-user {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--ea-surface);
  border: 1px solid var(--ea-border);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
}

.er-user-name {
  flex: 1 1 auto;
  color: var(--ea-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.er-user-you {
  font-family: var(--ea-mono);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ea-emerald);
  background: var(--ea-emerald-tint);
  border-radius: 8px;
  padding: 1px 6px;
  margin-left: 6px;
}

.er-user-share {
  color: var(--ea-muted);
}

.er-user-amount {
  font-size: 13px;
  color: var(--ea-ink);
}

.er-user-avatar {
  width: 24px;
  height: 24px;
  font-size: 11px;
  flex-shrink: 0;
}

.er-user-progress {
  font-size: 12px;
  color: var(--ea-muted);
  white-space: nowrap;
}

.er-manage-sharing-hint {
  font-size: 12px;
  color: var(--ea-muted);
  text-decoration: underline;
  margin-top: 2px;
}

@media (max-width: 720px) {
  .expense-row {
    grid-template-columns: 36px 1fr auto;
    row-gap: 8px;
  }
  .er-date {
    display: none;
  }
  .expense-row-expanded {
    padding-left: 16px;
  }
}
</style>
