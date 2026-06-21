<template>
  <div class="page">
    <header class="page-head">
      <div>
        <h1 class="page-title">My expenses</h1>
        <p class="page-sub">All your receipts, organised.</p>
      </div>
      <div class="head-actions">
        <v-btn
          v-if="expenses.length"
          :color="selectMode ? 'primary' : undefined"
          :variant="selectMode ? 'flat' : 'outlined'"
          size="large"
          prepend-icon="mdi-checkbox-multiple-marked-outline"
          @click="toggleSelectMode"
          >{{ selectMode ? 'Done' : 'Select' }}</v-btn
        >
        <router-link to="/newExpense" class="head-cta">
          <v-btn color="secondary" size="large">New expense</v-btn>
        </router-link>
      </div>
    </header>

    <!-- Bulk selection action bar -->
    <div v-if="selectMode" class="bulk-bar">
      <span class="bulk-count">{{ selectedIds.length }} selected</span>
      <div class="bulk-actions">
        <v-btn variant="text" :disabled="!selectedIds.length" @click="clearSelection">Clear</v-btn>
        <v-btn
          color="error"
          :disabled="!selectedIds.length"
          prepend-icon="mdi-trash-can"
          @click="bulkDeleteConfirm = true"
          >Delete selected</v-btn
        >
      </div>
    </div>

    <!-- Search / sort toolbar -->
    <div class="filter-bar">
      <v-text-field
        v-model="searchValue"
        class="filter-search"
        placeholder="Search expenses…"
        prepend-inner-icon="mdi-magnify"
        clearable
        hide-details
        @keyup.enter="performSearch"
      ></v-text-field>
      <v-select
        v-model="selectedSearchField"
        :items="searchFields"
        label="Field"
        clearable
        hide-details
        class="filter-select"
      ></v-select>
      <v-select
        v-model="selectedSortField"
        :items="sortFields"
        label="Sort by"
        clearable
        hide-details
        class="filter-select"
      ></v-select>
      <v-select
        v-model="sortOrder"
        :items="['Asc', 'Desc']"
        label="Order"
        clearable
        hide-details
        class="filter-select filter-select--sm"
      ></v-select>
      <v-btn color="primary" size="large" @click="performSearch">Apply</v-btn>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="state-block">
      <v-progress-circular indeterminate color="secondary" :size="44"></v-progress-circular>
    </div>

    <!-- Empty -->
    <div v-else-if="expenses.length === 0" class="empty-state">
      <div class="empty-chip">
        <v-icon size="28">mdi-receipt-text-outline</v-icon>
      </div>
      <h2 class="empty-title">No expenses found</h2>
      <p class="empty-sub">Create your first expense or adjust your filters.</p>
      <div class="empty-actions">
        <router-link to="/newExpense">
          <v-btn color="secondary">New expense</v-btn>
        </router-link>
        <v-btn variant="text" @click="resetList()">Reset filters</v-btn>
      </div>
    </div>

    <!-- Grid -->
    <template v-else>
      <div class="expense-grid">
        <eaExpenseCard
          v-for="(expense, index) in expenses"
          :key="expense.id"
          :expense="expense"
          :index="index"
          :isReadOnly="false"
          :selectable="selectMode"
          :selected="selectedIds.includes(expense.id)"
          @edit="editExpense"
          @delete="deleteExpense(expense)"
          @toggle-select="toggleSelect"
        />
      </div>

      <div class="pagination-row">
        <v-pagination
          v-model="currentPage"
          @update:model-value="onPageChange"
          :length="200"
          :show-first-last-page="true"
        />
      </div>
    </template>

    <!-- Bulk delete confirmation -->
    <v-dialog v-model="bulkDeleteConfirm" max-width="400">
      <v-card>
        <v-card-title>Confirm Delete</v-card-title>
        <v-card-text>
          Deleting expenses will remove attached bills and processed bills results. <br />
          Are you sure you want to delete
          <strong>{{ selectedIds.length }}</strong>
          selected {{ selectedIds.length === 1 ? 'expense' : 'expenses' }}?
        </v-card-text>
        <v-card-actions>
          <v-btn text="Cancel" @click="bulkDeleteConfirm = false">Cancel</v-btn>
          <v-btn text="Ok" @click="confirmBulkDelete">Ok</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, computed, ref } from 'vue'
import eaExpenseCard from './ExpenseCard.vue'
import { useExpenseStore } from '../stores/Expense'
import { Pagination } from '../models/Pagination'
import { SortFilter } from '../models/SortFilter'
import { FilterBy } from '../models/FilterBy'

export default defineComponent({
  name: 'eaExpenseList',
  components: { eaExpenseCard },
  setup() {
    const expenseStore = useExpenseStore()

    const isLoading = computed(() => expenseStore.isPageLoading)
    const expenses = computed(() => expenseStore.expenses)
    const currentPage = ref(1)
    const itemsPerPage = ref(9)
    const searchFields = ['Title', 'Description', 'Amount']
    const sortFields = ['Title', 'Description', 'Amount', 'CreatedAt']
    const isSearchEnabled = ref(false)
    const isSortEnabled = ref(false)
    const selectedSearchField = ref(null)
    const searchValue = ref(null)
    const selectedSortField = ref(null)
    const sortOrder = ref(null)
    // Bulk-select state
    const selectMode = ref(false)
    const selectedIds = ref<string[]>([])
    const bulkDeleteConfirm = ref(false)
    // Fetch expenses and count on mount
    onMounted(async () => {
      try {
        await fetchExpenses(await buildSearchFilter(), await buildSortFilter())
      } catch (error) {
        console.error('Error fetching expenses or count:', error)
      }
    })

    // Function to fetch expenses
    const fetchExpenses = async (searchFilter: FilterBy | null, sortFilter: SortFilter | null) => {
      await expenseStore.GetExpenses(
        new Pagination(currentPage.value, itemsPerPage.value),
        sortFilter,
        searchFilter
      )
    }

    // Pagination logic
    const onPageChange = async (page: number) => {
      currentPage.value = page
      await fetchExpenses(await buildSearchFilter(), await buildSortFilter())
    }
    const resetList = async () => {
      currentPage.value = 1
      selectedSearchField.value = null
      selectedSortField.value = null
      searchValue.value = null
      sortOrder.value = null
      await fetchExpenses(await buildSearchFilter(), await buildSortFilter())
    }
    // Edit expense handler
    const editExpense = (index: number) => {
      console.log(`Edit expense at index: ${index}`)
      const expense = expenses.value[index]
    }

    // Delete expense handler
    const deleteExpense = async (expense: any) => {
      console.log(`Delete expense: ${expense.title}`)
      try {
        await expenseStore.DeleteExpense(expense)
        await fetchExpenses(await buildSearchFilter(), await buildSortFilter())
      } catch (error) {
        if (error == 'Error: 404' && currentPage.value > 1) {
          currentPage.value -= 1
          await fetchExpenses(await buildSearchFilter(), await buildSortFilter())
        }
        console.error('Error deleting expense:', error)
      }
    }

    // Selection helpers
    const toggleSelect = (expense: any) => {
      const idx = selectedIds.value.indexOf(expense.id)
      if (idx === -1) {
        selectedIds.value.push(expense.id)
      } else {
        selectedIds.value.splice(idx, 1)
      }
    }
    const clearSelection = () => {
      selectedIds.value = []
    }
    const toggleSelectMode = () => {
      selectMode.value = !selectMode.value
      if (!selectMode.value) {
        clearSelection()
      }
    }

    // Bulk delete handler
    const confirmBulkDelete = async () => {
      const selected = expenses.value.filter((e) => selectedIds.value.includes(e.id))
      bulkDeleteConfirm.value = false
      try {
        await expenseStore.BulkDeleteExpenses(selected)
      } catch (error) {
        console.error('Error deleting expenses:', error)
      } finally {
        clearSelection()
        selectMode.value = false
        // If the page emptied out, step back a page.
        if (selected.length >= expenses.value.length && currentPage.value > 1) {
          currentPage.value -= 1
        }
        await fetchExpenses(await buildSearchFilter(), await buildSortFilter())
      }
    }

    //open search box
    const searchEnabled = async () => {
      isSearchEnabled.value = !isSearchEnabled.value
      if (isSearchEnabled.value == false) {
        selectedSearchField.value = null
        searchValue.value = null
      }
    }
    //sortEnabled
    const sortEnabled = async () => {
      isSortEnabled.value = !isSortEnabled.value
      if (isSortEnabled.value == false) {
        selectedSortField.value = null
        sortOrder.value = null
      }
    }
    const buildSearchFilter = async () => {
      //search object
      var filterBy = null
      //build filter object
      if (selectedSearchField.value != null && selectedSearchField.value != null) {
        filterBy = new FilterBy(selectedSearchField.value, searchValue.value, 'like')
      }
      return filterBy
    }
    const buildSortFilter = async () => {
      //default sortBy
      var sortBy = new SortFilter('CreatedAt', false)
      //if sort by fields selected
      if (selectedSortField.value != null && sortOrder.value != null) {
        sortBy = new SortFilter(selectedSortField.value, sortOrder.value == 'Asc')
      }
      return sortBy
    }
    const performSearch = async () => {
      await fetchExpenses(await buildSearchFilter(), await buildSortFilter())
    }
    const performSort = async () => {
      await fetchExpenses(await buildSearchFilter(), await buildSortFilter())
    }
    return {
      expenses,
      currentPage,
      onPageChange,
      editExpense,
      deleteExpense,
      isLoading,
      itemsPerPage,
      resetList,
      searchFields,
      searchEnabled,
      sortEnabled,
      isSearchEnabled,
      isSortEnabled,
      sortFields,
      selectedSearchField,
      selectedSortField,
      searchValue,
      sortOrder,
      performSearch,
      performSort,
      selectMode,
      selectedIds,
      bulkDeleteConfirm,
      toggleSelect,
      clearSelection,
      toggleSelectMode,
      confirmBulkDelete
    }
  }
})
</script>

<style scoped>
.head-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.head-cta {
  text-decoration: none;
}

/* Bulk selection action bar */
.bulk-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 16px;
  margin-bottom: 20px;
  border: 1px solid var(--ea-border);
  border-radius: 12px;
  background: var(--ea-emerald-tint);
}

.bulk-count {
  font-weight: 600;
  color: var(--ea-ink);
}

.bulk-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Filter toolbar */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 28px;
}

.filter-search {
  flex: 1 1 240px;
  min-width: 200px;
}

.filter-select {
  flex: 0 0 150px;
  max-width: 170px;
}

.filter-select--sm {
  flex: 0 0 120px;
}

/* Card grid */
.expense-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

/* States */
.state-block {
  display: flex;
  justify-content: center;
  padding: 64px 0;
}

.empty-state {
  text-align: center;
  padding: 56px 24px;
  border: 1px dashed var(--ea-border);
  border-radius: 16px;
  background: var(--ea-surface);
}

.empty-chip {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--ea-emerald-tint);
  color: var(--ea-emerald);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-title {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 20px;
  color: var(--ea-ink);
  margin-bottom: 6px;
}

.empty-sub {
  font-size: 14px;
  color: var(--ea-muted);
  margin-bottom: 20px;
}

.empty-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
}
.empty-actions a {
  text-decoration: none;
}

.pagination-row {
  display: flex;
  justify-content: center;
  margin-top: 36px;
}
</style>
