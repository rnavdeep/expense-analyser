<template>
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
          :length="100"
          :show-first-last-page="true"
        />
      </v-col>
      <v-btn v-if="!isLoading && expenses.length === 0" @click="resetPagination()">Reset</v-btn>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, onMounted, computed, ref } from 'vue'
import eaExpenseCard from './ExpenseCard.vue'
import { useExpenseStore } from '../stores/Expense'
import { Pagination } from '../models/Pagination'

export default defineComponent({
  name: 'eaExpenseList',
  components: { eaExpenseCard },
  setup() {
    const expenseStore = useExpenseStore()

    const isLoading = computed(() => expenseStore.isPageLoading)
    const expenses = computed(() => expenseStore.expenses)
    const currentPage = ref(1)
    const itemsPerPage = ref(9)

    // Fetch expenses and count on mount
    onMounted(async () => {
      try {
        await fetchExpenses()
      } catch (error) {
        console.error('Error fetching expenses or count:', error)
      }
    })

    // Function to fetch expenses
    const fetchExpenses = async () => {
      await expenseStore.GetExpenses(new Pagination(currentPage.value, itemsPerPage.value))
    }

    // Pagination logic
    const onPageChange = async (page: number) => {
      currentPage.value = page
      await fetchExpenses()
    }
    const resetPagination = async () => {
      currentPage.value = 1
      await fetchExpenses()
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
        await fetchExpenses()
      } catch (error) {
        if (error == 'Error: 404' && currentPage.value > 1) {
          currentPage.value -= 1
          await fetchExpenses()
        }
        console.error('Error deleting expense:', error)
      }
    }

    return {
      expenses,
      currentPage,
      onPageChange,
      editExpense,
      deleteExpense,
      isLoading,
      itemsPerPage,
      resetPagination
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
</style>
