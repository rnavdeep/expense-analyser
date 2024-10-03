<template>
  <v-container>
    <v-row>
      <v-col v-for="(expense, index) in expenses" :key="index" cols="12" md="4">
        <v-card variant="elevated">
          <div class="cardTitle">
            <v-card-title>
              {{ expense.title }}
            </v-card-title>
          </div>

          <v-card-subtitle> Amount: ${{ expense.amount.toFixed(2) }} </v-card-subtitle>
          <v-card-text>
            <p>{{ expense.description }}</p>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="editExpense(index)">Edit</v-btn>
            <v-btn @click="deleteExpense(index)" color="red">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'eaExpenseList',
  setup() {
    // Sample data for expenses
    const expenses = ref([
      {
        title: 'Grocery Shopping',
        amount: 150.75,
        description: 'Weekly grocery shopping expenses.'
      },
      {
        title: 'Electricity Bill',
        amount: 75.5,
        description: 'Monthly electricity bill payment.'
      },
      {
        title: 'Gym Membership',
        amount: 50.0,
        description: 'Monthly gym membership fee.'
      }
    ])

    const editExpense = (index: number) => {
      console.log(`Edit expense at index: ${index}`)
      // Add your edit logic here
    }

    const deleteExpense = (index: number) => {
      console.log(`Delete expense at index: ${index}`)
      // Remove the expense from the array
      expenses.value.splice(index, 1)
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
.v-card {
  margin: 10px;
}
.cardTitle {
  background: skyblue;
  margin-bottom: 10px;
}
</style>
