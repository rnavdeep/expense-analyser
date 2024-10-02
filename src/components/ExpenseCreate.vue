<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Create Expense</v-card-title>

          <v-card-text>
            <v-form ref="expenseForm" v-model="isFormValid">
              <!-- Title Field -->
              <v-text-field
                v-model="formInput.title"
                label="Title"
                :rules="[rules.required]"
                required
              ></v-text-field>

              <!-- Description Field -->
              <v-text-field
                v-model="formInput.description"
                label="Description"
                :rules="[rules.required]"
                required
                textarea
              ></v-text-field>

              <!-- File Input -->
              <v-file-input
                label="File input"
                counter
                multiple
                show-size
                @change="handleFileInput"
              ></v-file-input>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-btn color="primary" @click="submitForm" :disabled="!isFormValid">Submit</v-btn>
            <v-btn @click="resetForm">Reset</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { ExpenseDataDto, type ExpenseCreateForm } from '../models/ExpenseCreateForm'
import { useExpenseStore } from '@/stores/Expense'

export default defineComponent({
  name: 'eaExpenseCreate',
  setup() {
    const expenseStore = useExpenseStore() // Corrected the naming to avoid conflict with function

    const formInput = ref<ExpenseCreateForm>({
      title: '',
      description: '',
      files: [] as File[]
    })

    const isFormValid = ref(false)

    const rules = {
      required: (value: any) => !!value || 'This field is required'
    }
    const serializeFiles = (files: File[]): object[] => {
      return files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))
    }
    // Method to handle file input
    const handleFileInput = (event: Event) => {
      const input = event.target as HTMLInputElement
      if (input.files) {
        formInput.value.files = Array.from(input.files)
      }
    }

    // Method to submit the form
    const submitForm = async () => {
      if (isFormValid.value) {
        try {
          const expenseFormDto = new ExpenseDataDto(
            formInput.value.title,
            formInput.value.description,
            formInput.value.files
          )
          await expenseStore.createExpense(expenseFormDto)
          console.log('Expense created successfully')
          resetForm()
        } catch (error) {
          console.error('Error creating expense:', error)
        }
      }
    }

    // Method to reset the form
    const resetForm = () => {
      formInput.value = {
        title: '',
        description: '',
        files: [] as File[]
      }
      isFormValid.value = false
    }

    return {
      formInput,
      isFormValid,
      rules,
      handleFileInput,
      submitForm,
      resetForm
    }
  }
})
</script>

<style scoped>
.v-container {
  margin-top: 20px;
}
</style>
