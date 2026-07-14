<template>
  <div class="page">
    <header class="page-head">
      <div class="head-with-icon">
        <div class="check-chip">
          <v-icon size="24">mdi-check-decagram</v-icon>
        </div>
        <div>
          <h1 class="page-title">Receipt results</h1>
          <p class="page-sub">Select an expense and document to view the extracted data.</p>
        </div>
      </div>
    </header>

    <!-- Selectors -->
    <div class="select-card">
      <div class="select-row">
        <v-select
          label="Select expense"
          :items="expenseTitles"
          v-model="selectedExpense"
          item-value="id"
          item-title="title"
          return-object
          hide-details
          clearable
          class="select-field"
        ></v-select>

        <v-select
          label="Select document"
          :items="documents"
          v-model="selectedDocument"
          item-value="id"
          item-title="name"
          return-object
          :disabled="!documents.length"
          hide-details
          clearable
          class="select-field"
        ></v-select>

        <v-btn color="primary" size="large" @click="getResults" class="submit-btn">View results</v-btn>
      </div>
    </div>

    <!-- Extracted summary -->
    <div v-if="isSummaryAvailable" class="summary-card">
      <div class="summary-head">
        <h3 class="summary-title">Receipt processed</h3>
        <v-btn variant="text" size="small" @click="removeSummary()">Hide summary</v-btn>
      </div>
      <div class="kv-grid">
        <div class="kv">
          <span class="kv-key">Merchant</span>
          <span class="kv-val">{{ expenseResults?.extractSummary().NAME }}</span>
        </div>
        <div class="kv">
          <span class="kv-key">Address</span>
          <span class="kv-val">{{ expenseResults?.extractSummary().ADDRESS }}</span>
        </div>
        <div class="kv">
          <span class="kv-key">Total</span>
          <span class="kv-val amount">{{ expenseResults?.extractSummary().TOTAL }}</span>
        </div>
      </div>

      <div class="add-amount-row" v-if="scannedTotalAmount !== null">
        <v-btn
          v-if="!addedToAmount"
          size="small"
          color="secondary"
          :loading="isAddingToAmount"
          :disabled="isAddingToAmount"
          @click="addScannedTotalToExpense"
        >
          Add ${{ scannedTotalAmount }} to expense amount
        </v-btn>
        <span v-else class="add-amount-done">
          <v-icon size="16" color="success">mdi-check-circle</v-icon>
          Added to expense amount
        </span>
        <v-alert v-if="addAmountError" type="error" variant="tonal" density="compact" class="mt-2">
          {{ addAmountError }}
        </v-alert>
      </div>
    </div>

    <!-- Line items -->
    <div class="results-card">
      <div class="results-head">
        <h3 class="results-title">Line items</h3>
        <v-text-field
          v-model="search"
          placeholder="Search items…"
          prepend-inner-icon="mdi-magnify"
          hide-details
          density="comfortable"
          class="results-search"
        ></v-text-field>
      </div>

      <v-data-table
        :headers="columns"
        :items="columnData"
        :search="search"
        class="results-table"
      ></v-data-table>

      <div class="loading" v-if="loading">
        <v-progress-circular
          color="secondary"
          indeterminate
          :size="56"
          :width="3"
        ></v-progress-circular>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { useExpenseStore } from '../stores/Expense'
import type { DocumentDialogDto } from '../models/DocumentDialogDto'
import { ExpenseListDataDto, UpdateExpenseDto } from '../models/ExpenseCreateForm'
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
    const isAddingToAmount = ref<boolean>(false)
    const addedToAmount = ref<boolean>(false)
    const addAmountError = ref<string>('')

    // TOTAL comes back as a currency-ish string (e.g. "$12.34"); strip
    // everything but digits/./- before parsing so the Add button can show
    // and compute a real number.
    const scannedTotalAmount = computed<number | null>(() => {
      const raw = expenseResults.value?.extractSummary().TOTAL
      if (!raw) return null
      const parsed = parseFloat(String(raw).replace(/[^0-9.-]/g, ''))
      return Number.isFinite(parsed) ? parsed : null
    })
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
          addedToAmount.value = false
          addAmountError.value = ''
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

    // The already-existing amount on the expense is preserved — the scanned
    // total is added on top of it, not used to replace it.
    const addScannedTotalToExpense = async () => {
      if (!selectedExpense.value || scannedTotalAmount.value === null) return
      isAddingToAmount.value = true
      addAmountError.value = ''
      try {
        const newAmount = (selectedExpense.value.amount ?? 0) + scannedTotalAmount.value
        const updatedExpense = new UpdateExpenseDto(
          selectedExpense.value.id,
          selectedExpense.value.title,
          selectedExpense.value.description,
          newAmount
        )
        await expenseStore.updateExpense(selectedExpense.value.id, updatedExpense)
        selectedExpense.value.amount = newAmount
        addedToAmount.value = true
      } catch (error) {
        console.error('Error adding scanned total to expense amount:', error)
        addAmountError.value = 'Failed to add scanned total to expense amount.'
      } finally {
        isAddingToAmount.value = false
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
      removeSummary,
      scannedTotalAmount,
      isAddingToAmount,
      addedToAmount,
      addAmountError,
      addScannedTotalToExpense
    }
  }
})
</script>

<style scoped>
.head-with-icon {
  display: flex;
  align-items: center;
  gap: 16px;
}

.check-chip {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--ea-emerald-tint);
  color: var(--ea-emerald);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.select-card {
  background: var(--ea-surface);
  border: 1px solid var(--ea-border);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
}

.select-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.select-field {
  flex: 1 1 240px;
  min-width: 200px;
}

.submit-btn {
  min-width: 140px;
}

/* Extracted summary as a key/value card */
.summary-card {
  background: var(--ea-surface);
  border: 1px solid var(--ea-border);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
}

.summary-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.summary-title {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 18px;
  color: var(--ea-ink);
}

.kv-grid {
  display: grid;
  gap: 12px;
}

.kv {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--ea-border);
}
.kv:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.kv-key {
  font-family: var(--ea-mono);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ea-muted);
}

.kv-val {
  color: var(--ea-ink);
  font-weight: 600;
  text-align: right;
}
.kv-val.amount {
  font-size: 18px;
}

.add-amount-row {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--ea-border);
}

.add-amount-done {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--ea-muted);
}

/* Results table */
.results-card {
  background: var(--ea-surface);
  border: 1px solid var(--ea-border);
  border-radius: 16px;
  padding: 24px;
  position: relative;
}

.results-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.results-title {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 18px;
  color: var(--ea-ink);
}

.results-search {
  flex: 0 1 260px;
}

.results-table {
  margin-top: 8px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}
</style>
