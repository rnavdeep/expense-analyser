<template>
  <div>
    <!-- Search and Sort Button Group -->
    <div class="search-sort-buttons">
      <v-row align="center" justify="center">
        <v-col cols="12" md="2">
          <v-btn color="primary" @click="searchEnabled">Search</v-btn>
        </v-col>
        <v-col cols="12" md="2">
          <v-btn color="primary" @click="sortEnabled">Sort</v-btn>
        </v-col>
      </v-row>
    </div>

    <!-- Search Section -->
    <div v-if="isSearchEnabled" class="search-section">
      <v-container>
        <v-row align="center" class="mb-4">
          <v-col cols="12" md="2">
            <h1 class="section-title">Search:</h1>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              clearable
              dense
              outlined
              label="Select Field"
              :items="searchFields"
              v-model="selectedSearchField"
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchValue"
              dense
              outlined
              :counter="10"
              label="Search Value"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="2">
            <v-btn color="primary" @click="performSearch">Search</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- Sort Section -->
    <div v-if="isSortEnabled" class="sort-section">
      <v-container>
        <v-row align="center" class="mb-4">
          <v-col cols="12" md="2">
            <h1 class="section-title">Sort:</h1>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              clearable
              dense
              outlined
              label="Select Sort Field"
              :items="sortFields"
              v-model="selectedSortField"
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              clearable
              dense
              outlined
              label="Sort Order"
              :items="['Asc', 'Desc']"
              v-model="sortOrder"
            ></v-select>
          </v-col>
          <v-col cols="12" md="2">
            <v-btn color="primary" @click="performSort">Sort</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </div>
  <v-container>
    <!-- Loading Data -->
    <v-row v-if="isLoading" class="justify-center">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>

    <!-- Not Found -->
    <v-row v-else-if="!isLoading && expenses.length === 0" class="justify-center">
      <v-col cols="12" class="text-center">
        <p>No expenses found.</p>
      </v-col>
    </v-row>

    <!-- Expenses Found -->
    <v-row v-else>
      <v-col v-for="(expense, index) in expenses" :key="expense.id" cols="12" md="4">
        <eaExpenseCard
          :expense="expense"
          :index="index"
          @edit="editExpense"
          @delete="deleteExpense(expense)"
        />
      </v-col>
    </v-row>

    <!-- Pagination -->
    <v-row class="justify-center">
      <v-col v-if="!(!isLoading && expenses.length === 0)" cols="auto">
        <v-pagination
          v-model="currentPage"
          @update:model-value="onPageChange"
          :length="200"
          :show-first-last-page="true"
        />
      </v-col>
      <v-btn v-if="!isLoading && expenses.length === 0" @click="resetList()">Reset</v-btn>
    </v-row>
  </v-container>
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
.v-container {
  padding: 10px;
}

.v-col {
  margin-bottom: 10px;
}

.v-pagination {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.v-pagination__item {
  color: #007bff;
}
.v-pagination__item--active {
  background-color: #007bff;
  color: white;
}

.text-center {
  font-size: 1.5rem;
  color: gray;
  margin-top: 40px;
}

.v-progress-circular {
  margin: 40px 0;
}

.search {
  padding: 20px;
}

.search-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
}

@media (max-width: 960px) {
  .search-title {
    text-align: center;
  }
}
.search-sort-buttons {
  margin-bottom: 20px;
}

.section-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
}

@media (max-width: 960px) {
  .section-title {
    text-align: center;
  }
}
</style>
