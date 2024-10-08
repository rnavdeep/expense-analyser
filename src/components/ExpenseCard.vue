<template>
  <v-card variant="elevated" class="fixed-card-size">
    <v-row class="align-items-center">
      <v-col class="title-col">
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
            <v-icon v-bind="props" @click="openEditDialog">mdi-pencil</v-icon>
          </template>
        </v-tooltip>

        <v-tooltip text="Delete Expense" location="top">
          <template v-slot:activator="{ props }">
            <v-icon v-bind="props" @click="deleteExpense">mdi-trash-can</v-icon>
          </template>
        </v-tooltip>

        <v-tooltip text="Process Expense" location="top">
          <template v-slot:activator="{ props }">
            <v-icon v-bind="props" @click="processExpense(expense.id)">mdi-home-analytics</v-icon>
          </template>
        </v-tooltip>

        <v-tooltip text="Attached Bills" location="top">
          <template v-slot:activator="{ props }">
            <v-icon v-bind="props" @click="openDocumentsDialog">mdi-file-document-multiple</v-icon>
          </template>
        </v-tooltip>

        <v-tooltip text="Users Expense Shared With" location="top">
          <template v-slot:activator="{ props }">
            <v-icon v-bind="props" @click="editExpense(expense.id)">mdi-account-group</v-icon>
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
                  <v-icon @click="deleteFile(doc.id)" v-bind="props" class="delete"
                    >mdi-trash-can</v-icon
                  >
                </template>
              </v-tooltip>
              <v-divider :opacity="100" style="width: 400px; margin-left: 40px"></v-divider>
            </li>
          </ol>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="Close" @click="dialogDocs = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang="ts">
import { computed, ref } from 'vue'
import type { ExpenseListDataDto } from '@/models/ExpenseCreateForm'
import { defineComponent } from 'vue'
import type { DocumentDialogDto } from '@/models/DocumentDialogDto'
import { useExpenseStore } from '@/stores/Expense'
import { useDocumentStore } from '@/stores/Document'
import { UpdateExpenseDto } from '../models/ExpenseCreateForm'

interface ExpenseCardProps {
  expense: ExpenseListDataDto
  index: number
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
    }
  },
  emits: ['edit', 'delete'],
  setup(props: ExpenseCardProps, { emit }) {
    const dialogEdit = ref(false)
    const dialogDocs = ref(false)
    const editTitle = ref(props.expense.title)
    const editDescription = ref(props.expense.description)
    const documents = ref<DocumentDialogDto[]>([])
    const expenseStore = useExpenseStore()
    const docStore = useDocumentStore()
    const isUpdating = computed(() => expenseStore.isUpdating)
    const isUpdateSuccessful = computed(() => expenseStore.isUpdateSuccessful)

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
    const editExpense = (expenseId: string) => {
      console.log('Users')
    }
    const deleteExpense = () => {
      emit('delete', props.index, props.expense)
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
        documents.value = documents.value.filter((doc) => doc.id !== docId) // Remove document from state
      } catch (error) {
        console.error('Error deleting document:', error)
      }
    }

    const processExpense = async (expenseId: string) => {}

    return {
      dialogEdit,
      dialogDocs,
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
      processExpense,
      editExpense
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
  .v-card-subtitle {
    margin-bottom: 10px;
  }
}

.eachDoc {
  list-style: none;
  padding: 0;
  counter-reset: item;
}

.document-item {
  display: grid;
  grid-template-columns: 30px 1fr auto auto;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.doc-index {
  text-align: right;
  font-weight: bold;
}

.docName {
  margin: 0;
}

.v-icon.download {
  color: green;
  margin-left: 20px;
}

.v-icon.delete {
  color: darkred;
  margin-left: 10px;
}
</style>
