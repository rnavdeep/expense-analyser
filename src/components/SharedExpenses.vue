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

    <!-- List -->
    <template v-else>
      <div class="expense-columns">
        <div></div>
        <div>Description</div>
        <div>Date</div>
        <div class="col-amount">Amount</div>
        <div class="col-actions">Actions</div>
      </div>
      <div class="expense-rows">
        <eaExpenseRow
          v-for="(expense, index) in expenses"
          :key="expense.id"
          :expense="expense"
          :index="index"
          :isReadOnly="true"
        />
      </div>

      <div v-if="totalPages > 1" class="pagination-row">
        <span class="pg-info">{{ pageRangeLabel }}</span>
        <div class="pg-controls">
          <button
            type="button"
            class="pg-btn"
            :disabled="currentPage === 1"
            aria-label="Previous page"
            @click="goToPage(currentPage - 1)"
          >
            <v-icon size="16">mdi-chevron-left</v-icon>
          </button>

          <button v-if="pageWindow[0] > 1" type="button" class="pg-btn" @click="goToPage(1)">1</button>
          <span v-if="pageWindow[0] > 2" class="pg-ellipsis">…</span>

          <button
            v-for="p in pageWindow"
            :key="p"
            type="button"
            class="pg-btn"
            :class="{ 'pg-btn--active': p === currentPage }"
            @click="goToPage(p)"
            >{{ p }}</button
          >

          <span v-if="pageWindow[pageWindow.length - 1] < totalPages - 1" class="pg-ellipsis">…</span>
          <button
            v-if="pageWindow[pageWindow.length - 1] < totalPages"
            type="button"
            class="pg-btn"
            @click="goToPage(totalPages)"
            >{{ totalPages }}</button
          >

          <button
            type="button"
            class="pg-btn"
            :disabled="currentPage === totalPages || isLastPage"
            aria-label="Next page"
            @click="goToPage(currentPage + 1)"
          >
            <v-icon size="16">mdi-chevron-right</v-icon>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, computed, ref } from 'vue'
import eaExpenseRow from './ExpenseRow.vue'
import { useExpenseStore } from '../stores/Expense'
import { Pagination } from '../models/Pagination'
import { SortFilter } from '../models/SortFilter'
import { FilterBy } from '../models/FilterBy'

export default defineComponent({
  name: 'eaSharedExpenses',
  components: { eaExpenseRow },
  setup() {
    const expenseStore = useExpenseStore()

    const isLoading = computed(() => expenseStore.isPageLoading)
    const expenses = computed(() => expenseStore.expenses)
    const currentPage = ref(1)
    const itemsPerPage = ref(9)
    const totalExpenses = computed(() => expenseStore.totalExpenses ?? 0)
    const totalPages = computed(() => Math.max(1, Math.ceil(totalExpenses.value / itemsPerPage.value)))
    // Windowed page numbers around the current page, e.g. [3, 4, 5] of 10 —
    // first/last and ellipses are added around this in the template.
    const pageWindow = computed(() => {
      const delta = 2
      const start = Math.max(1, currentPage.value - delta)
      const end = Math.min(totalPages.value, currentPage.value + delta)
      const pages: number[] = []
      for (let p = start; p <= end; p++) pages.push(p)
      return pages
    })
    const pageRangeLabel = computed(() => {
      if (totalExpenses.value === 0) return 'No shared expenses'
      const start = (currentPage.value - 1) * itemsPerPage.value + 1
      const end = start + expenses.value.length - 1
      return `Showing ${start}–${end} of ${totalExpenses.value}`
    })
    // The reported total can lag reality (deletions elsewhere, stale count) —
    // a page that came back short of a full page is trusted over totalPages.
    const isLastPage = computed(() => expenses.value.length < itemsPerPage.value)
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
      try {
        await expenseStore.GetSharedExpenses(
          new Pagination(currentPage.value, itemsPerPage.value),
          sortFilter,
          searchFilter
        )
      } catch (error) {
        // A page beyond the last one 404s — step back and retry rather than
        // leaving the view stuck on an empty page with no way back.
        if (error == 'Error: 404' && currentPage.value > 1) {
          currentPage.value -= 1
          await fetchExpenses(searchFilter, sortFilter)
        } else {
          throw error
        }
      }
    }

    // Pagination logic
    const onPageChange = async (page: number) => {
      currentPage.value = page
      await fetchExpenses(await buildSearchFilter(), await buildSortFilter())
    }
    const goToPage = async (page: number) => {
      if (page < 1 || page > totalPages.value || page === currentPage.value) return
      if (page > currentPage.value && isLastPage.value) return
      await onPageChange(page)
    }
    const resetList = async () => {
      currentPage.value = 1
      selectedSearchField.value = null
      selectedSortField.value = null
      searchValue.value = null
      sortOrder.value = null
      await fetchExpenses(await buildSearchFilter(), await buildSortFilter())
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
      totalPages,
      pageWindow,
      pageRangeLabel,
      isLastPage,
      goToPage,
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

.expense-columns {
  display: grid;
  grid-template-columns: 36px 2.2fr 1fr 1fr 132px;
  gap: 14px;
  padding: 0 16px 8px;
  font-family: var(--ea-display);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ea-muted);
  border-bottom: 1.5px solid var(--ea-border);
  margin-bottom: 10px;
}

.expense-columns .col-amount {
  text-align: right;
}

.expense-columns .col-actions {
  text-align: right;
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
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 28px;
  padding-top: 18px;
  border-top: 1.5px solid var(--ea-border);
}

.pg-info {
  font-family: var(--ea-mono);
  font-size: 13px;
  color: var(--ea-muted);
}

.pg-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pg-btn {
  min-width: 30px;
  height: 30px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--ea-mono);
  font-size: 13px;
  font-weight: 700;
  color: var(--ea-ink);
  background: transparent;
  border: 1.5px solid var(--ea-border);
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
}

.pg-btn:hover:not(:disabled) {
  border-color: var(--ea-emerald);
  color: var(--ea-emerald);
}

.pg-btn:disabled {
  color: var(--ea-border);
  cursor: default;
}

.pg-btn--active {
  background: var(--ea-ink);
  border-color: var(--ea-ink);
  color: #fff;
}

.pg-btn--active:hover {
  color: #fff;
}

.pg-ellipsis {
  color: var(--ea-muted);
  padding: 0 2px;
}

@media (max-width: 720px) {
  .expense-columns {
    display: none;
  }

  .pagination-row {
    justify-content: center;
    text-align: center;
  }
}
</style>
