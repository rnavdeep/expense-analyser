<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6">
        <div class="expenseCard">
          <v-card>
            <v-card-title>Create Expense</v-card-title>

            <v-card-text>
              <v-form ref="expenseForm" v-model="isFormValid" :disabled="isLoading">
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
                  ref="fileInput"
                  counter
                  multiple
                  show-size
                  @change="handleFileInput"
                ></v-file-input>
              </v-form>
            </v-card-text>

            <v-card-actions>
              <v-btn color="primary" @click="submitForm" :disabled="!isFormValid || isLoading"
                >Submit</v-btn
              >
              <v-btn @click="resetForm" :disabled="isLoading">Reset</v-btn>
            </v-card-actions>
          </v-card>
        </div>
        <div class="loading" v-if="isLoading">
          <v-progress-circular
            color="primary"
            indeterminate
            :size="67"
            :width="5"
          ></v-progress-circular>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { ExpenseDataDto, type ExpenseCreateForm } from '../models/ExpenseCreateForm'
import { useExpenseStore } from '@/stores/Expense'

export default defineComponent({
  name: 'eaExpenseCreate',
  setup() {
    const expenseStore = useExpenseStore() // Use store to manage expense state

    const formInput = ref<ExpenseCreateForm>({
      title: '',
      description: '',
      files: [] as File[]
    })

    const isFormValid = ref(false)
    const fileInput = ref(null) // Declare ref for file input

    const isLoading = computed(() => expenseStore.isExpenseUploading)
    const isUploadedSuccess = computed(() => expenseStore.isExpenseUploaded)

    const rules = {
      required: (value: any) => !!value || 'This field is required'
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
      if (fileInput.value) {
        ;(fileInput.value as any).reset()
      }

      isFormValid.value = false
    }

    return {
      formInput,
      isFormValid,
      rules,
      handleFileInput,
      submitForm,
      resetForm,
      isLoading,
      isUploadedSuccess,
      fileInput
    }
  }
})
</script>

<style scoped>
.v-container {
  margin-top: 20px;
  position: relative;
  width: 100%;
  height: 100vh;
}
.expenseCard {
  position: absolute;
  top: 20;
  left: 0;
  width: 80%;
  height: 80%;
  z-index: 1;
  background-color: inherit;
}
.loading {
  position: relative;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 100px;
  margin-left: 300px;
}
</style>
