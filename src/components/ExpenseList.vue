<template>
  <v-container>
    <v-row>
      <v-col v-for="(expense, index) in expenses" :key="index" cols="12" md="4">
        <v-card variant="elevated">
          <div class="cardTitle">
            <v-row justify="space-between" align="center">
              <v-col>
                <v-card-title>{{ expense.title }}</v-card-title>
              </v-col>

              <v-col class="text-right" cols="auto">
                <v-tooltip text="Edit Expense" location="top">
                  <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" @click="editExpense(index)"> mdi-pencil </v-icon>
                  </template>
                </v-tooltip>
              </v-col>
              <v-col class="text-right" cols="auto">
                <v-tooltip text="Delete Expense" location="top">
                  <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" @click="deleteExpense(index)">mdi-trash-can </v-icon>
                  </template>
                </v-tooltip>
              </v-col>
            </v-row>
          </div>

          <v-card-subtitle> Amount: ${{ expense.amount.toFixed(2) }} </v-card-subtitle>
          <v-card-text>
            <p>{{ expense.description }}</p>
          </v-card-text>
          <v-card-actions>
            <v-row justify="space-between" align="center">
              <v-col cols="auto">
                <v-tooltip text="Attached Bills" location="top">
                  <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" @click="editExpense(index)">
                      mdi-file-document-multiple
                    </v-icon>
                  </template>
                </v-tooltip>
              </v-col>
              <v-col cols="auto">
                <v-tooltip text="Users Expense Shared With" location="top">
                  <template v-slot:activator="{ props }">
                    <v-icon v-bind="props" @click="editExpense(index)"> mdi-account-group </v-icon>
                  </template>
                </v-tooltip>
              </v-col>
            </v-row>
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
  display: flex;
  background: skyblue;
  margin-bottom: 10px;
  .pencil {
    margin: 0px;
    padding: 0px;
  }
  .v-icon {
    margin: 5px;
  }
}
</style>
