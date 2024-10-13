<template>
  <div class="resultsPage">
    <v-container>
      <v-row>
        <v-col cols="12">
          <p class="headline">Please Select the Expense and Document to view Results</p>
        </v-col>
      </v-row>

      <v-row class="selectValues">
        <v-col cols="12" md="6">
          <v-select
            label="Select Expense"
            :items="expenseTitles"
            v-model="selectedExpense"
            item-value="id"
            item-title="title"
            return-object
            outlined
            dense
            clearable
          ></v-select>
        </v-col>

        <v-col cols="12" md="6">
          <v-select
            label="Select Document"
            :items="documents"
            v-model="selectedDocument"
            item-value="id"
            item-title="name"
            return-object
            :disabled="!documents.length"
            outlined
            dense
            clearable
          ></v-select>
        </v-col>
      </v-row>

      <!-- Separate row for the submit button -->
      <v-row>
        <v-col cols="12" class="d-flex justify-end">
          <v-btn color="primary" @click="getResults" class="submit-btn">Submit</v-btn>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-card flat class="results-card">
            <v-card-title class="headline">Results</v-card-title>
            <v-card-text>
              <v-text-field
                v-model="search"
                label="Search"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                hide-details
                dense
                class="search-field"
              ></v-text-field>

              <v-data-table
                :headers="columns"
                :items="columnData"
                :search="search"
                dense
                class="results-table"
              ></v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { useExpenseStore } from '@/stores/Expense'
import type { DocumentDialogDto } from '@/models/DocumentDialogDto'
import { ExpenseListDataDto } from '../models/ExpenseCreateForm'

export default defineComponent({
  name: 'eaDocResultPage',
  setup() {
    const expenseStore = useExpenseStore()
    const search = ''
    const columnData = ref<Array<any>>([])

    const expenseTitles = computed(() => expenseStore.expenses)
    const documents = ref<DocumentDialogDto[]>([])
    const selectedExpense = ref<ExpenseListDataDto | null>(null)
    const selectedDocument = ref<DocumentDialogDto | null>(null)
    const columns = ref<Array<any>>([])

    const loadDocuments = async () => {
      documents.value = []
      if (selectedExpense.value && selectedExpense.value.id) {
        const result = await expenseStore.GetDocByExpenseId(selectedExpense.value.id)
        documents.value = result as DocumentDialogDto[]
        selectedDocument.value = null
      }
    }

    const getResults = async () => {
      if (selectedExpense.value && selectedDocument.value) {
        const result = await expenseStore.GetDocResults(
          selectedExpense.value.id,
          selectedDocument.value.id
        )
        columns.value = JSON.parse(result.columnNames)
        columnData.value = JSON.parse(result.resultLineItems)
      }
    }

    watch(selectedExpense, (newExpense) => {
      if (newExpense) {
        loadDocuments()
      } else {
        selectedDocument.value = null
        documents.value = []
      }
    })

    watch(selectedDocument, (newDocument) => {
      if (newDocument) {
        selectedDocument.value = newDocument
      } else {
        selectedDocument.value = null
        columns.value = []
        columnData.value = []
      }
    })

    onMounted(async () => {
      await expenseStore.GetExpenses()
    })

    return {
      expenseTitles,
      selectedExpense,
      documents,
      selectedDocument,
      getResults,
      columns,
      search,
      columnData
    }
  }
})
</script>

<style scoped>
.resultsPage {
  padding: 24px;
}

.selectValues {
  margin-bottom: 16px;
}

.submit-btn {
  min-width: 120px;
}

.results-card {
  margin-top: 24px;
}

.search-field {
  margin-bottom: 16px;
}

.results-table {
  margin-top: 16px;
}
</style>
