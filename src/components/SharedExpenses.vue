<template>
  <div class="page">
    <header class="page-head">
      <div>
        <h1 class="page-title">Shared expenses</h1>
        <p class="page-sub">Split costs with other users and track who owes what.</p>
      </div>
    </header>

    <!-- Search / sort toolbar -->
    <div class="filter-bar">
      <v-text-field
        v-model="searchValue"
        class="filter-search"
        placeholder="Search shared expenses…"
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
        <v-icon size="28">mdi-account-multiple-outline</v-icon>
      </div>
      <h2 class="empty-title">No shared expenses</h2>
      <p class="empty-sub">Expenses shared with you will appear here.</p>
      <div class="empty-actions">
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
          :isReadOnly="true"
          @edit="editExpense"
          @delete="deleteExpense(expense)"
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
  name: 'eaSharedExpenses',
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
      await expenseStore.GetSharedExpenses(
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
      performSort
    }
  }
})
</script>

<style scoped>
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

.expense-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

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

.pagination-row {
  display: flex;
  justify-content: center;
  margin-top: 36px;
}
</style>
