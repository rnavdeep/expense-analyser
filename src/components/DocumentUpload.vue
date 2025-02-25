<template>
  <!-- Dialog for viewing and uploading documents -->
  <div class="resizable-box">
    <v-dialog v-model="dialogUploadDocs" max-width="500">
      <v-card>
        <v-card-title class="docTitle">Manage Bills</v-card-title>

        <!-- Create Section (Upload Documents) -->
        <v-card-text>
          <h3 class="section-title">Upload New Document</h3>
          <v-file-input
            label="Drag and Drop Or Click Me"
            ref="fileInput"
            counter
            show-size
            :multiple="false"
            @change="uploadFile"
            :disabled="isDocumentUploading"
          ></v-file-input>
        </v-card-text>

        <!-- Divider between sections -->
        <v-divider></v-divider>

        <!-- Show Section (Existing Documents) -->
        <v-card-text>
          <h3 class="section-title">Uploaded Documents</h3>
          <ol class="eachDoc">
            <li v-for="(doc, index) in documents" :key="index" class="document-item">
              <span class="doc-index">{{ index + 1 }}.</span>
              <p class="docName">{{ doc.name }}</p>
              <v-tooltip :text="`Delete ${doc.name}`" location="top">
                <template v-slot:activator="{ props }">
                  <v-icon
                    @click="deleteFile(doc.id)"
                    v-bind="props"
                    style="color: dark-red; margin-left: 40px"
                    >mdi-trash-can</v-icon
                  >
                </template>
              </v-tooltip>
              <v-divider :opacity="100" style="width: 400px; margin-left: 40px"></v-divider>
            </li>
          </ol>
        </v-card-text>

        <div class="loading" v-if="isDocumentUploading">
          <v-progress-circular
            color="primary"
            indeterminate
            :size="67"
            :width="5"
          ></v-progress-circular>
        </div>

        <!-- Alert Messages -->
        <v-alert
          v-if="alertMessage.trim().length > 0"
          :type="alertMessage === 'Success' ? 'success' : 'error'"
          variant="tonal"
        >
          {{ alertMessage }}
        </v-alert>

        <!-- Dialog actions -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="Close" @click="closeDocumentDialog">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { computed, ref } from 'vue'
import { defineComponent } from 'vue'
import { CreateDocumentDto } from '../models/DocumentDialogDto'
import { useExpenseStore } from '../stores/Expense'
import { useDocumentStore } from '../stores/Document'
export default defineComponent({
  name: 'eaUploadDocs',
  props: {
    expenseId: {
      type: String,
      required: false
    }
  },
  setup() {
    const expenseStore = useExpenseStore()
    const dialogUploadDocs = computed(() => expenseStore.dialogUploadDocs)
    const expenseId = computed(() => expenseStore.expenseId)
    const fileInput = ref(null)
    const docStore = useDocumentStore()
    const documents = computed(() => docStore.documents)
    const isDocumentUploading = computed(() => docStore.loading)
    const alertMessage = computed(() => docStore.alertMessage)

    const formInput = ref({
      file: null as File | null
    })

    // Method to handle single file upload
    const uploadFile = async (event: Event) => {
      const input = event.target as HTMLInputElement
      if (input.files) {
        formInput.value.file = input.files[0]
      }
      if (formInput.value.file) {
        const uploadData = new CreateDocumentDto(expenseId.value, formInput.value.file)
        // Call the store function to upload the document
        const result = await docStore.uploadExpenseDoc(uploadData)
        console.log(result)
        // Reset the form after 1 second
        setTimeout(() => {
          docStore.alertMessage = ''
          formInput.value.file = null
          fileInput.value = null
        }, 1000)
      }
    }

    const closeDocumentDialog = () => {
      expenseStore.dialogUploadDocs = false
    }

    const deleteFile = async (docId: string) => {
      console.log(`Delete document: ${docId}`)
      await docStore.deleteDocument(docId)
    }

    return {
      dialogUploadDocs,
      uploadFile,
      documents,
      closeDocumentDialog,
      fileInput,
      deleteFile,
      isDocumentUploading,
      alertMessage
    }
  }
})
</script>

<style scoped>
.resizable-box {
  height: 100%;
  width: 100%;
  background-color: aqua;
  position: relative;
}

.eachDoc {
  list-style: none;
  padding: 0;
  counter-reset: item;
}

.section-title {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.document-item {
  display: grid;
  grid-template-columns: 30px 1fr auto;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.doc-index {
  text-align: right;
  font-weight: bold;
}

.docName {
  margin: 0;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  margin-top: 20px;
}
</style>
