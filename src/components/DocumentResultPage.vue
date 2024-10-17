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
        <v-col cols="12" class="d-flex justify-center">
          <v-btn color="primary" @click="getResults" class="submit-btn">Submit</v-btn>
        </v-col>
      </v-row>

      <v-row v-if="isSummaryAvailable">
        <v-col cols="12">
          <v-card flat class="summary-card">
            <v-card-title>{{ expenseResults?.extractSummary().NAME }}</v-card-title>
            <v-card-subtitle>{{ expenseResults?.extractSummary().ADDRESS }}</v-card-subtitle>
            <v-card-text>Total: {{ expenseResults?.extractSummary().TOTAL }}</v-card-text>
            <v-card-actions>
              <v-btn color="warning" @click="removeSummary()">Remove Summary</v-btn>
            </v-card-actions>
          </v-card>
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
          <div class="loading" v-if="loading">
            <v-progress-circular
              color="primary"
              indeterminate
              :size="100"
              :width="2.5"
            ></v-progress-circular>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { useExpenseStore } from '../stores/Expense'
import type { DocumentDialogDto } from '../models/DocumentDialogDto'
import { ExpenseListDataDto } from '../models/ExpenseCreateForm'
import ExpenseResults from '../models/ExpenseResults'

export default defineComponent({
  name: 'eaDocResultPage',
  setup() {
    const expenseStore = useExpenseStore()
    const search = ''
    const columnData = ref<Array<any>>([])
    const expenseResults = ref<ExpenseResults | null>(null)
    const expenseTitles = computed(() => expenseStore.dropdownExpenses)
    const documents = ref<DocumentDialogDto[]>([])
    const selectedExpense = ref<ExpenseListDataDto | null>(null)
    const selectedDocument = ref<DocumentDialogDto | null>(null)
    const columns = ref<Array<any>>([])
    const loading = ref<boolean>(false)
    const isSummaryAvailable = ref<boolean>(false)
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
        loading.value = true
        try {
          const result = await expenseStore.GetDocResults(
            selectedExpense.value.id,
            selectedDocument.value.id
          )
          columns.value = JSON.parse(result.columnNames)
          columnData.value = JSON.parse(result.resultLineItems)
          expenseResults.value = new ExpenseResults(JSON.parse(result.summaryFields))
          isSummaryAvailable.value = true
          loading.value = false
        } catch (error) {
          console.log(error)
          loading.value = false
        }
      }
    }
    const removeSummary = () => {
      isSummaryAvailable.value = false
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
      await expenseStore.GetExpensesDropdown()
    })

    return {
      expenseTitles,
      selectedExpense,
      documents,
      selectedDocument,
      getResults,
      loading,
      columns,
      search,
      columnData,
      expenseResults,
      isSummaryAvailable,
      removeSummary
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

.loading {
  margin-left: calc(50vw - 30%);
}
</style>
