<template>
  <v-container>
    <v-row>
      <v-col v-for="(expense, index) in expenses" :key="index" cols="12" md="4">
        <eaExpenseCard
          :expense="expense"
          :index="index"
          @edit="editExpense"
          @delete="deleteExpense"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import eaExpenseCard from './ExpenseCard.vue'
import { useExpenseStore } from '@/stores/Expense'
import { ExpenseListDataDto } from '@/models/ExpenseCreateForm'

export default defineComponent({
  name: 'eaExpenseList',
  components: { eaExpenseCard },
  setup() {
    const expenseStore = useExpenseStore()
    const expenses = ref<ExpenseListDataDto[]>([]) // Ensure this is a reactive reference

    onMounted(async () => {
      try {
        const fetchedExpenses = await expenseStore.GetExpenses()
        expenses.value = fetchedExpenses // Assign fetched expenses to the reactive reference
      } catch (error) {
        console.error('Error fetching expenses:', error)
      }
    })

    const editExpense = (index: number) => {
      console.log(`Edit expense at index: ${index}`)
      // Add your edit logic here
    }

    const deleteExpense = async (index: number, expense: ExpenseListDataDto) => {
      console.log(`Delete expense at index: ${expense}`)
      //call store to invoke delete
      if ((await expenseStore.DeleteExpense(expense)) == true) {
        expenses.value.splice(index, 1)
      } else {
        console.log('Error deleting expense')
      }
    }

    return {
      expenses,
      editExpense,
      deleteExpense
    }
  }
})
</script>

<style scoped>
/* Add any styles specific to this component here */
</style>
