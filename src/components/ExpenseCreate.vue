<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6">
        <div class="expenseCard">
          <v-card>
            <div class="cardTitle">
              <v-card-title>New Expense</v-card-title>
            </div>

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
                  label="Drag and Drop Or Click Me"
                  ref="fileInput"
                  counter
                  multiple
                  show-size
                  @change="handleFileInput"
                ></v-file-input>
                <eaUploadDocs :expense-id="expenseId.value" />
                <v-btn text @click="openDocumentDialog">
                  <v-icon left>mdi-upload</v-icon>
                  Upload
                </v-btn>
              </v-form>
            </v-card-text>

            <v-card-actions>
              <v-btn color="primary" @click="submitForm" :disabled="!isFormValid || isLoading"
                >Create Expense</v-btn
              >
              <v-btn @click="resetForm" :disabled="isLoading">Clear Expense</v-btn>
            </v-card-actions>
          </v-card>

          <!-- Alert Messages -->
          <v-alert v-if="alertMessage" :type="uploadSuccess ? 'success' : 'error'" variant="tonal">
            {{ alertMessage }}
          </v-alert>
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
import eaUploadDocs from './DocumentUpload.vue'
export default defineComponent({
  name: 'eaExpenseCreate',
  components: { eaUploadDocs },
  setup() {
    const expenseStore = useExpenseStore()

    const formInput = ref<ExpenseCreateForm>({
      title: '',
      description: '',
      files: [] as File[]
    })

    const alertMessage = ref<string>('')
    const isFormValid = ref(false)
    const fileInput = ref(null)
    const expenseId = ref<any>('')
    const isLoading = computed(() => expenseStore.isUploading)
    const uploadSuccess = computed(() => expenseStore.uploadSuccess)
    expenseId.value = computed(() => expenseStore.expenseId)

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
    const openDocumentDialog = () => {
      expenseStore.dialogUploadDocs = true
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
          const resp = await expenseStore.createExpense(expenseFormDto)
          // Set the alert message based on the upload success
          if (uploadSuccess.value) {
            alertMessage.value = 'Expense Created Successfully'
          } else {
            alertMessage.value = 'Error Creating Expense'
          }

          // Reset the form after 5 seconds
          setTimeout(() => {
            alertMessage.value = ''
            // resetForm()
          }, 5000)
        } catch (error) {
          console.error('Error creating expense:', error)
          alertMessage.value = 'Error creating expense. Please try again.'
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
      alertMessage.value = ''
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
      alertMessage,
      uploadSuccess,
      fileInput,
      openDocumentDialog,
      expenseId
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
  .cardTitle {
    background: skyblue;
    margin-bottom: 20px;
  }
}
.loading {
  position: relative;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 100px;
  margin-left: 300px;
  margin-top: 50px;
}
</style>
