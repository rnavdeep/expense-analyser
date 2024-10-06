<template>
  <v-card variant="elevated" class="fixed-card-size">
    <div class="cardTitle">
      <v-row justify="space-between" align="center">
        <v-col>
          <v-card-title>{{ expense.title }}</v-card-title>
        </v-col>

        <v-col class="text-right" cols="auto">
          <v-tooltip text="Edit Expense" location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" @click="openEditDialog">mdi-pencil</v-icon>
            </template>
          </v-tooltip>
        </v-col>
        <v-col class="text-right" cols="auto">
          <v-tooltip text="Delete Expense" location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" @click="deleteExpense">mdi-trash-can</v-icon>
            </template>
          </v-tooltip>
        </v-col>
      </v-row>
    </div>

    <v-card-subtitle>Amount: ${{ expense.amount }}</v-card-subtitle>
    <v-card-subtitle>Created At: {{ expense.createdAt }}</v-card-subtitle>

    <v-card-text class="description-text">
      <p>{{ expense.description }}</p>
    </v-card-text>

    <v-card-actions>
      <v-row justify="space-between" align="center">
        <v-col cols="auto">
          <v-tooltip text="Attached Bills" location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" @click="openDocumentsDialog"
                >mdi-file-document-multiple</v-icon
              >
            </template>
          </v-tooltip>
        </v-col>
        <v-col cols="auto">
          <v-tooltip text="Users Expense Shared With" location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" @click="editExpense">mdi-account-group</v-icon>
            </template>
          </v-tooltip>
        </v-col>
      </v-row>
    </v-card-actions>

    <!-- Dialog for editing expense -->
    <v-dialog v-model="dialogEdit" max-width="500">
      <v-card>
        <v-card-title>Edit Expense</v-card-title>
        <v-card-text>
          <v-text-field label="Title" v-model="editTitle"></v-text-field>
          <v-text-field label="Amount" v-model="editAmount" type="number"></v-text-field>
          <v-textarea label="Description" v-model="editDescription"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="Cancel" @click="dialogEdit = false">Cancel</v-btn>
          <v-btn text="Save" @click="saveExpense">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog for viewing attached documents -->
    <v-dialog v-model="dialogDocs" max-width="500">
      <v-card>
        <v-card-title>Attached Bills</v-card-title>
        <v-card-text>
          <ol>
            <li v-for="(doc, index) in documents" :key="index">
              <a :href="doc.url" target="_blank">{{ doc.name }}</a>
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
import { ref } from 'vue'
import type { ExpenseListDataDto } from '@/models/ExpenseCreateForm'
import { defineComponent } from 'vue'
import type { DocumentDialogDto } from '@/models/DocumentDialogDto'
import { useExpenseStore } from '@/stores/Expense'

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
    const editAmount = ref(props.expense.amount)
    const editDescription = ref(props.expense.description)
    const documents = ref<DocumentDialogDto[]>([])
    const expenseStore = useExpenseStore()

    const openEditDialog = () => {
      dialogEdit.value = true
    }
    const editExpense = () => {
      console.log('Users')
    }
    const openDocumentsDialog = async () => {
      dialogDocs.value = true
      var result = await expenseStore.GetDocByExpenseId(props.expense.id)
      documents.value = result
    }

    const deleteExpense = () => {
      emit('delete', props.index, props.expense)
    }

    const saveExpense = () => {
      const updatedExpense = {
        title: editTitle.value,
        amount: editAmount.value,
        description: editDescription.value
      }
      emit('edit', props.index, updatedExpense)
      dialogEdit.value = false
    }

    return {
      dialogEdit,
      dialogDocs,
      editTitle,
      editAmount,
      editDescription,
      openEditDialog,
      deleteExpense,
      saveExpense,
      openDocumentsDialog,
      documents,
      editExpense
    }
  }
})
</script>

<style scoped>
.fixed-card-size {
  width: 350px;
  height: 200px;
  margin: 10px;
  overflow: hidden;
}

.cardTitle {
  display: flex;
  background: skyblue;
  margin-bottom: 10px;
}

.description-text {
  height: 50px;
  margin: 5px;
  overflow-y: auto;
  overflow-x: hidden;
  text-overflow: clip;
  white-space: normal;
}

.v-icon {
  margin: 5px;
}
</style>
