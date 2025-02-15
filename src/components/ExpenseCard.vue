<template>
  <v-card variant="elevated" class="fixed-card-size">
    <v-row class="align-items-center">
      <v-col class="title-col" style="overflow: hidden">
        <v-card-title>{{ expense.title }}</v-card-title>
        <v-card-subtitle>Amount: ${{ expense.amount }}</v-card-subtitle>
        <v-card-subtitle>Created At: {{ expense.createdAt }}</v-card-subtitle>
        <v-card-text class="description-text">
          <p>{{ expense.description }}</p>
        </v-card-text>
      </v-col>

      <v-col class="icon-col" cols="auto">
        <v-tooltip text="Edit Expense" location="top">
          <template v-slot:activator="{ props }">
            <v-icon :disabled="isReadOnly" v-bind="props" @click="openEditDialog"
              >mdi-pencil</v-icon
            >
          </template>
        </v-tooltip>

        <v-tooltip text="Delete Expense" location="top">
          <template v-slot:activator="{ props }">
            <v-icon :disabled="isReadOnly" v-bind="props" @click="confirmDeletion"
              >mdi-trash-can</v-icon
            >
          </template>
        </v-tooltip>

        <v-tooltip text="Attached Bills" location="top">
          <template v-slot:activator="{ props }">
            <v-icon v-bind="props" @click="openDocumentsDialog">mdi-file-document-multiple</v-icon>
          </template>
        </v-tooltip>

        <v-tooltip text="Users Expense Shared With" location="top">
          <template v-slot:activator="{ props }">
            <v-icon v-bind="props" @click="openUsersDialog">mdi-account-group</v-icon>
          </template>
        </v-tooltip>
      </v-col>
    </v-row>

    <!-- Dialog for editing expense -->
    <v-dialog v-model="dialogEdit" max-width="500">
      <v-card>
        <v-card-title>Edit Expense</v-card-title>
        <v-card-text>
          <v-text-field label="Title" v-model="editTitle"></v-text-field>
          <v-textarea label="Description" v-model="editDescription"></v-textarea>
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
            <p class="userAmount">{{ user.userAmount + ' AUD' }}</p>
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

interface ExpenseCardProps {
  expense: ExpenseListDataDto
  index: number
  isReadOnly: boolean
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
    }
  },
  emits: ['edit', 'delete'],

  setup(props: ExpenseCardProps, { emit }) {
    const dialogEdit = ref(false)
    const dialogDocs = ref(false)
    const dialogUsers = ref(false)
    console.log(props.isReadOnly)

    const dialogConfirmProcess = ref(false)
    const editTitle = ref(props.expense.title)
    const editDescription = ref(props.expense.description)
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

    const confirmDeletion = () => {
      return (deleteConfirmed.value = true)
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
      const updatedExpense = new UpdateExpenseDto(id, editTitle.value, editDescription.value)
      emit('edit', props.index, updatedExpense)
      const success = await expenseStore.updateExpense(id, updatedExpense)

      if (success) {
        expenseStore.updateExpense(id, updatedExpense)
      }

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
      deleteConfirmed,
      openUsersDialog,
      usersExpense,
      deleteUser
    }
  }
})
</script>

<style scoped>
.fixed-card-size {
  width: 350px;
  height: 210px;
  margin: 10px;
  overflow: hidden;
}

.title-col {
  background-color: white;
  padding: 10px;
  padding-right: 0px;
  flex-grow: 1;
}

.icon-col {
  background-color: skyblue;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
  margin-top: 10px;
  height: 250px;
}

.v-icon {
  margin: 10px 0;
  cursor: pointer;
}

.description-text {
  max-height: 50px;
  overflow-y: auto;
}

.v-card-title {
  background: skyblue;
  margin-bottom: 10px;
}
.v-card-title.v-card-subtitle {
  margin-bottom: 10px;
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
