<template>
  <v-card class="expense-card" :class="{ 'expense-card--selected': selectable && selected }">
    <div class="ec-body">
      <div class="ec-head">
        <v-checkbox
          v-if="selectable"
          class="ec-select"
          :model-value="selected"
          hide-details
          density="compact"
          color="primary"
          @update:model-value="onToggleSelect"
        ></v-checkbox>
        <h3 class="ec-title">{{ expense.title }}</h3>
        <span class="ec-date">{{ expense.createdAt }}</span>
      </div>

      <div class="ec-amount amount">${{ expense.amount }}</div>

      <p class="ec-desc">{{ expense.description }}</p>
    </div>

    <div class="ec-actions">
      <v-tooltip text="Edit Expense" location="top">
        <template v-slot:activator="{ props }">
          <v-icon class="ec-action" :disabled="isReadOnly" v-bind="props" @click="openEditDialog"
            >mdi-pencil</v-icon
          >
        </template>
      </v-tooltip>

      <v-tooltip text="Delete Expense" location="top">
        <template v-slot:activator="{ props }">
          <v-icon class="ec-action ec-action--danger" :disabled="isReadOnly" v-bind="props" @click="confirmDeletion"
            >mdi-trash-can</v-icon
          >
        </template>
      </v-tooltip>

      <v-tooltip text="Attached Bills" location="top">
        <template v-slot:activator="{ props }">
          <v-icon class="ec-action" v-bind="props" @click="openDocumentsDialog">mdi-file-document-multiple</v-icon>
        </template>
      </v-tooltip>

      <v-tooltip text="Users Expense Shared With" location="top">
        <template v-slot:activator="{ props }">
          <v-icon class="ec-action" v-bind="props" @click="openUsersDialog">mdi-account-group</v-icon>
        </template>
      </v-tooltip>
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

    <!-- Dialog for viewing attached documents -->
    <v-dialog v-model="dialogDocs" max-width="500">
      <v-card>
        <v-card-title class="docTitle">Attached Bills</v-card-title>
        <v-card-text>
          <ol class="eachDoc">
            <li v-for="(doc, index) in documents" :key="index" class="document-item">
              <span class="doc-index">{{ index + 1 }}.</span>
              <p class="docName">{{ doc.name }}</p>
              <v-tooltip :text="`Download ${doc.name}`" location="top">
                <template v-slot:activator="{ props }">
                  <a :href="doc.url" v-bind="props" target="_blank">
                    <v-icon class="download">mdi-download</v-icon>
                  </a>
                </template>
              </v-tooltip>
              <v-tooltip :text="`Delete ${doc.name}`" location="top">
                <template v-slot:activator="{ props }">
                  <v-icon
                    :disabled="isReadOnly"
                    @click="deleteFile(doc.id)"
                    v-bind="props"
                    class="delete"
                    >mdi-trash-can</v-icon
                  >
                </template>
              </v-tooltip>
              <v-tooltip :text="`Process ${doc.name}`" location="top">
                <template v-slot:activator="{ props }">
                  <v-icon
                    :disabled="isProcessButtonDisabled(doc) || isReadOnly"
                    @click="openConfirmProcessDialog(doc)"
                    v-bind="props"
                    class="process"
                    >mdi-head-snowflake</v-icon
                  >
                </template>
              </v-tooltip>
            </li>
          </ol>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="Close" @click="dialogDocs = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dialogUsers" max-width="400">
      <v-card>
        <v-card-title class="userTitle">Attached Users</v-card-title>
        <v-card-text>
          <!-- Header Row -->
          <div class="user-list">
            <span class="user-list-header">Index</span>
            <span class="user-list-header">Name</span>
            <span class="user-list-header">Share</span>
            <span class="user-list-header">Amount</span>
          </div>

          <!-- User Data -->
          <div v-for="(user, index) in usersExpense" :key="index" class="user-list">
            <span>{{ index + 1 }}</span>
            <p class="userName">{{ user.userName }}</p>
            <p class="userShare">{{ user.userShare * 100 + '%' }}</p>
            <p class="userAmount">{{ shareAmount(user) + ' AUD' }}</p>
            <v-tooltip :text="`Delete ${user.userName}`" location="top">
              <template v-slot:activator="{ props }">
                <v-icon :disabled="isReadOnly" @click="deleteUser(user.userId)" v-bind="props"
                  >mdi-trash-can</v-icon
                >
              </template>
            </v-tooltip>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="Close" @click="dialogUsers = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Nested Confirmation Dialog for Processing -->
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
  </v-card>
</template>

<script lang="ts">
import { computed, ref } from 'vue'
import type { ExpenseListDataDto } from '../models/ExpenseCreateForm'
import { defineComponent } from 'vue'
import type { DocumentDialogDto } from '../models/DocumentDialogDto'
import { useExpenseStore } from '../stores/Expense'
import { useDocumentStore } from '../stores/Document'
import { UpdateExpenseDto } from '../models/ExpenseCreateForm'
import { useExtractStore } from '../stores/Extract'
import type { UserAssignedDto } from '../models/UserAssignedDto'
import { roundToCents } from '../utils/money'

interface ExpenseCardProps {
  expense: ExpenseListDataDto
  index: number
  isReadOnly: boolean
  selectable: boolean
  selected: boolean
}

export default defineComponent({
  name: 'eaExpenseCard',

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

  setup(props: ExpenseCardProps, { emit }) {
    const dialogEdit = ref(false)
    const dialogDocs = ref(false)
    const dialogUsers = ref(false)
    console.log(props.isReadOnly)

    const dialogConfirmProcess = ref(false)
    const editTitle = ref(props.expense.title)
    const editDescription = ref(props.expense.description)
    const editAmount = ref(props.expense.amount)
    const editAmountError = ref('')
    const documents = ref<DocumentDialogDto[]>([])
    const usersExpense = ref<UserAssignedDto[]>([])
    const selectedDocument = ref<DocumentDialogDto | null>(null)
    const expenseStore = useExpenseStore()
    const docStore = useDocumentStore()
    const extractStore = useExtractStore()
    const isUpdating = computed(() => expenseStore.isUpdating)
    const isUpdateSuccessful = computed(() => expenseStore.isUpdateSuccessful)
    const deleteConfirmed = ref(false)

    const openEditDialog = () => {
      dialogEdit.value = true
      editTitle.value = props.expense.title
      editDescription.value = props.expense.description
      editAmount.value = props.expense.amount
      editAmountError.value = ''
    }

    const openDocumentsDialog = async () => {
      dialogDocs.value = true
      const result = await expenseStore.GetDocByExpenseId(props.expense.id)
      documents.value = result
    }

    const openUsersDialog = async () => {
      dialogUsers.value = true
      console.log('Calling now')
      const result = await expenseStore.GetAssignedUsersDto(props.expense.id)
      console.log(props.expense.id)
      console.log(result)
      usersExpense.value = result
    }

    // The backend only recomputes a user's stored dollar share when they're
    // added/removed/reassigned, not on a plain amount edit — derive it from
    // the current amount instead of trusting the (possibly stale) userAmount.
    const shareAmount = (user: UserAssignedDto): number =>
      roundToCents(props.expense.amount * user.userShare)

    const confirmDeletion = () => {
      return (deleteConfirmed.value = true)
    }
    const onToggleSelect = () => {
      emit('toggle-select', props.expense)
    }
    const openConfirmProcessDialog = (doc: DocumentDialogDto) => {
      selectedDocument.value = doc
      dialogConfirmProcess.value = true
    }

    const confirmProcessExpenseDoc = () => {
      if (selectedDocument.value) {
        processExpenseDoc(props.expense.id, selectedDocument.value.id)
        dialogConfirmProcess.value = false
        selectedDocument.value.jobStatus = 0
      }
    }

    const editExpense = (expenseId: string) => {
      console.log('Users')
    }

    const deleteExpense = () => {
      if (deleteConfirmed.value == true) {
        emit('delete', props.index, props.expense)
        deleteConfirmed.value = false
      }
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

    const deleteFile = async (docId: string) => {
      try {
        await docStore.deleteDocumentFromExpense(docId)
        documents.value = documents.value.filter((doc) => doc.id !== docId)
      } catch (error) {
        console.error('Error deleting document:', error)
      }
    }

    const deleteUser = async (userId: string) => {
      try {
        await docStore.deleteDocumentFromExpense(userId)
        documents.value = documents.value.filter((doc) => doc.id !== userId)
      } catch (error) {
        console.error('Error deleting document:', error)
      }
    }
    const isProcessButtonDisabled = (doc: DocumentDialogDto): boolean => {
      return doc.jobStatus != null && doc.jobStatus != 2
    }

    const processExpenseDoc = async (expenseId: string, docId: string) => {
      try {
        await extractStore.startExpenseAnalysis({ expenseId, docId })
      } catch (error) {
        console.error(error)
      }
    }

    return {
      dialogEdit,
      dialogDocs,
      dialogUsers,
      dialogConfirmProcess,
      editTitle,
      editDescription,
      editAmount,
      editAmountError,
      openEditDialog,
      deleteExpense,
      saveExpense,
      openDocumentsDialog,
      documents,
      deleteFile,
      isUpdating,
      isUpdateSuccessful,
      processExpenseDoc,
      openConfirmProcessDialog,
      confirmProcessExpenseDoc,
      selectedDocument,
      editExpense,
      isProcessButtonDisabled,
      confirmDeletion,
      onToggleSelect,
      deleteConfirmed,
      openUsersDialog,
      usersExpense,
      shareAmount,
      deleteUser
    }
  }
})
</script>

<style scoped>
/* Expense card — white surface, hairline border, hover lift (matches the
   Phase 1 feature card). Merchant ranked first, total in mono. */
.expense-card {
  position: relative;
  background: var(--ea-surface);
  border: 1px solid var(--ea-border);
  border-radius: 16px;
  padding: 20px 20px 14px;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.expense-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
  border-color: #d9d5cc;
}

.expense-card--selected {
  border-color: var(--ea-emerald);
  box-shadow: 0 0 0 1px var(--ea-emerald);
}

/* Selection checkbox — inline, leading the title row */
.ec-select {
  flex: none;
  margin: -8px 4px -8px -6px;
}

.ec-body {
  flex-grow: 1;
  min-width: 0;
}

.ec-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ec-title {
  flex: 1 1 auto;
  min-width: 0;
  font-family: var(--ea-display);
  font-weight: 600;
  letter-spacing: -0.01em;
  font-size: 18px;
  color: var(--ea-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ec-date {
  margin-left: auto;
  font-size: 12px;
  color: var(--ea-muted);
  white-space: nowrap;
  flex-shrink: 0;
}

.ec-amount {
  font-size: 26px;
  color: var(--ea-ink);
  margin: 10px 0 8px;
}

.ec-desc {
  font-size: 14px;
  color: var(--ea-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ec-actions {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--ea-border);
}

.ec-action {
  color: var(--ea-muted);
  cursor: pointer;
  transition: color 0.15s ease;
}
.ec-action:hover {
  color: var(--ea-emerald);
}
.ec-action--danger:hover {
  color: var(--ea-error, #dc2626);
}

.description-text {
  max-height: 50px;
  overflow-y: auto;
}

.eachDoc {
  list-style: none;
  padding: 0;
  counter-reset: item;
}

.document-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.docName {
  flex-grow: 1;
  margin: 0;
}
.user-list {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: center;
  margin-bottom: 10px;
}

.user-list-header {
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
}

.user-item {
  display: contents;
}

.userName,
.userShare,
.userAmount {
  text-align: center;
}
.delete {
  margin: 10px;
}

.v-icon.download {
  color: green;
  margin-left: 10px;
}

.v-icon.delete {
  color: darkred;
  margin-left: 10px;
}
.v-icon.process {
  color: darkblue;
  margin-left: 10px;
}
</style>
