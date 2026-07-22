<template>
  <div class="page page--narrow">
    <header class="page-head">
      <div>
        <h1 class="page-title">New expense</h1>
        <p class="page-sub">Add the details, then attach bills and assign users.</p>
      </div>
      <v-switch
        v-model="formInput.allowReceipts"
        :label="formInput.allowReceipts ? 'With receipt(s)' : 'Without receipt(s)'"
        color="secondary"
        :disabled="uploadSuccess"
        hide-details
        class="receipts-switch"
      ></v-switch>
    </header>

    <div class="form-card">
      <v-form ref="expenseForm" v-model="isFormValid" :disabled="isLoading">
        <!-- Title Field -->
        <v-text-field
          v-model="formInput.title"
          label="Title"
          :rules="[rules.required]"
          required
          :disabled="uploadSuccess"
          class="mb-2"
        ></v-text-field>

        <!-- Description Field -->
        <v-text-field
          v-model="formInput.description"
          label="Description"
          :rules="[rules.required]"
          required
          textarea
          :disabled="uploadSuccess"
          class="mb-2"
        ></v-text-field>

        <!-- Amount Field -->
        <v-text-field
          v-model.number="formInput.amount"
          label="Amount"
          type="number"
          prefix="$"
          :rules="[rules.nonNegative]"
          :disabled="uploadSuccess"
          class="mb-2"
        ></v-text-field>

        <!-- Category Field: we don't auto-detect category yet, so let the user assign one -->
        <v-combobox
          v-model="formInput.category"
          :items="categoryOptions"
          label="Category (optional)"
          :disabled="uploadSuccess"
          class="mb-2"
        ></v-combobox>

        <!-- Attach bills + assign users -->
        <div class="attach-row">
          <template v-if="formInput.allowReceipts">
            <eaUploadDocs :expense-id="expenseId.value" />
            <v-btn
              variant="tonal"
              color="secondary"
              @click="openDocumentDialog"
              :disabled="!uploadSuccess"
            >
              <v-icon start>mdi-upload</v-icon>
              Upload bills
            </v-btn>
          </template>

          <eaAssignUsers :expense-id="expenseId.value" />
          <v-btn
            variant="tonal"
            color="secondary"
            @click="openAssignUsersDialog"
            :disabled="!uploadSuccess"
          >
            <v-icon start>mdi-account-multiple-plus</v-icon>
            Assign users
          </v-btn>
        </div>
      </v-form>

      <div class="form-actions">
        <v-btn
          color="primary"
          size="large"
          @click="submitForm"
          :disabled="!isFormValid || isLoading || uploadSuccess"
          >Create expense</v-btn
        >
        <v-btn variant="text" @click="resetForm" :disabled="isLoading">Start new expense</v-btn>
      </div>

      <!-- Alert Messages -->
      <v-alert
        v-if="alertMessage"
        :type="uploadSuccess ? 'success' : 'error'"
        variant="tonal"
        class="mt-4"
      >
        {{ alertMessage }}
      </v-alert>

      <div class="loading-overlay" v-if="isLoading">
        <v-progress-circular
          color="secondary"
          indeterminate
          :size="56"
          :width="5"
        ></v-progress-circular>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue'
import { ExpenseDataDto, type ExpenseCreateForm } from '../models/ExpenseCreateForm'
import { useExpenseStore } from '../stores/Expense'
import { useDocumentStore } from '../stores/Document'
import { useCategoryStore } from '../stores/Category'
import eaUploadDocs from './DocumentUpload.vue'
import eaAssignUsers from './AssignUsers.vue'
import { roundToCents } from '../utils/money'
export default defineComponent({
  name: 'eaExpenseCreate',
  components: { eaUploadDocs, eaAssignUsers },
  setup() {
    const expenseStore = useExpenseStore()
    const docStore = useDocumentStore()
    const categoryStore = useCategoryStore()
    const formInput = ref<ExpenseCreateForm>({
      title: '',
      description: '',
      amount: 0,
      category: '',
      allowReceipts: true,
      files: [] as File[]
    })

    onMounted(() => categoryStore.LoadCategories())

    // The dropdown lists categories already set up on the Categories page.
    const categoryOptions = computed(() => categoryStore.categories.map((c) => c.name))
    expenseStore.expenseId = null
    docStore.documents = []
    expenseStore.uploadSuccess = false
    const alertMessage = ref<string>('')
    const isFormValid = ref(false)
    const fileInput = ref(null)
    const expenseId = ref<any>('')
    const isLoading = computed(() => expenseStore.isUploading)
    const uploadSuccess = computed(() => expenseStore.uploadSuccess)
    expenseId.value = computed(() => expenseStore.expenseId)

    const rules = {
      required: (value: any) => !!value || 'This field is required',
      nonNegative: (value: any) => value >= 0 || 'Amount cannot be negative'
    }

    const openDocumentDialog = () => {
      expenseStore.dialogUploadDocs = true
    }
    const openAssignUsersDialog = async () => {
      console.log(expenseStore.expenseId)
      await expenseStore.GetAssignedUsers()
      expenseStore.dialogAssignUsers = true
    }
    // Method to submit the form
    const submitForm = async () => {
      if (isFormValid.value) {
        try {
          const expenseFormDto = new ExpenseDataDto(
            formInput.value.title,
            formInput.value.description,
            roundToCents(formInput.value.amount),
            formInput.value.allowReceipts,
            formInput.value.category || undefined
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
        amount: 0,
        category: '',
        allowReceipts: true,
        files: [] as File[]
      }
      if (fileInput.value) {
        ;(fileInput.value as any).reset()
      }
      alertMessage.value = ''
      isFormValid.value = false
      expenseStore.uploadSuccess = false
      docStore.documents = []
    }

    return {
      formInput,
      categoryOptions,
      isFormValid,
      rules,
      submitForm,
      resetForm,
      isLoading,
      alertMessage,
      uploadSuccess,
      fileInput,
      openDocumentDialog,
      openAssignUsersDialog,
      expenseId
    }
  }
})
</script>

<style scoped>
.page--narrow {
  max-width: 720px;
}

.receipts-switch {
  align-self: center;
  flex: 0 0 auto;
}

.receipts-switch :deep(.v-label) {
  white-space: nowrap;
}

.form-card {
  position: relative;
  background: var(--ea-surface);
  border: 1px solid var(--ea-border);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
}

.attach-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--ea-border);
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  z-index: 5;
}
</style>
