<template>
  <v-card variant="elevated" class="fixed-card-size">
    <div class="cardTitle">
      <v-row justify="space-between" align="center">
        <v-col>
          <v-card-title>{{ expense.title }}</v-card-title>
        </v-col>

        <v-col class="text-right" cols="auto">
          <v-tooltip text="Edit Expense" location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" @click="editExpense">mdi-pencil</v-icon>
            </template>
          </v-tooltip>
        </v-col>
        <v-col class="text-right" cols="auto">
          <v-tooltip text="Delete Expense" location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" @click="deleteExpense">mdi-trash-can</v-icon>
            </template>
          </v-tooltip>
        </v-col>
      </v-row>
    </div>

    <v-card-subtitle>Amount: ${{ expense.amount }}</v-card-subtitle>
    <v-card-subtitle>Created At: {{ expense.createdAt }}</v-card-subtitle>

    <v-card-text class="description-text">
      <p>{{ expense.description }}</p>
    </v-card-text>

    <v-card-actions>
      <v-row justify="space-between" align="center">
        <v-col cols="auto">
          <v-tooltip text="Attached Bills" location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" @click="editExpense">mdi-file-document-multiple</v-icon>
            </template>
          </v-tooltip>
        </v-col>
        <v-col cols="auto">
          <v-tooltip text="Users Expense Shared With" location="top">
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" @click="editExpense">mdi-account-group</v-icon>
            </template>
          </v-tooltip>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import type { ExpenseListDataDto } from '@/models/ExpenseCreateForm'
import { defineComponent } from 'vue'

// Define interfaces
interface Expense {
  title: string
  amount: number
  description: string
  docUrls: string[]
  userIds: string[]
  createdAt: string // Assuming createdAt is a string in ISO format
}

interface ExpenseCardProps {
  expense: ExpenseListDataDto // Make sure this matches your model
  index: number
}

export default defineComponent({
  name: 'eaExpenseCard',
  props: {
    expense: {
      type: Object as () => ExpenseListDataDto,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  emits: ['edit', 'delete'],
  setup(props: ExpenseCardProps, { emit }) {
    const editExpense = () => {
      emit('edit', props.index)
    }

    const deleteExpense = () => {
      emit('delete', props.index, props.expense)
    }

    return {
      editExpense,
      deleteExpense
    }
  }
})
</script>

<style scoped>
.fixed-card-size {
  width: 350px;
  height: 200px;
  margin: 10px;
  overflow: hidden;
}

.cardTitle {
  display: flex;
  background: skyblue;
  margin-bottom: 10px;
}

.description-text {
  height: 50px;
  margin: 5px;
  overflow-y: auto;
  overflow-x: hidden;
  text-overflow: clip;
  white-space: normal;
}

.v-icon {
  margin: 5px;
}
</style>
