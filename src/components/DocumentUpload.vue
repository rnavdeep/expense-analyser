<template>
  <!-- Dialog for viewing and uploading documents -->
  <div class="upload-wrap">
    <v-dialog v-model="dialogUploadDocs" max-width="520">
      <v-card class="upload-card">
        <div class="upload-head">
          <h3 class="upload-title">Upload bills</h3>
        </div>

        <div class="upload-body">
          <!-- Dropzone -->
          <div class="dropzone">
            <v-icon size="32" class="dropzone-icon">mdi-cloud-upload-outline</v-icon>
            <p class="dropzone-text">Drag &amp; drop or click to upload</p>
            <p class="dropzone-hint">Image or PDF</p>
            <v-file-input
              label="Choose a file"
              ref="fileInput"
              counter
              show-size
              :multiple="false"
              @change="uploadFile"
              :disabled="isDocumentUploading"
              prepend-icon=""
              prepend-inner-icon="mdi-paperclip"
              hide-details
              class="dropzone-input"
            ></v-file-input>
          </div>

          <!-- Uploaded documents -->
          <div class="uploaded" v-if="documents.length">
            <p class="uploaded-label">Uploaded documents</p>
            <ul class="doc-list">
              <li v-for="(doc, index) in documents" :key="index" class="doc-row">
                <v-icon size="18" class="doc-row-icon">mdi-file-document-outline</v-icon>
                <span class="doc-name">{{ doc.name }}</span>
                <v-tooltip :text="`Delete ${doc.name}`" location="top">
                  <template v-slot:activator="{ props }">
                    <v-icon class="doc-del" v-bind="props" @click="deleteFile(doc.id)"
                      >mdi-trash-can-outline</v-icon
                    >
                  </template>
                </v-tooltip>
              </li>
            </ul>
          </div>

          <div class="loading" v-if="isDocumentUploading">
            <v-progress-circular
              color="secondary"
              indeterminate
              :size="40"
              :width="4"
            ></v-progress-circular>
          </div>

          <!-- Alert Messages -->
          <v-alert
            v-if="alertMessage.trim().length > 0"
            :type="alertMessage === 'Success' ? 'success' : 'error'"
            variant="tonal"
            class="mt-2"
          >
            {{ alertMessage }}
          </v-alert>
        </div>

        <!-- Dialog actions -->
        <div class="upload-actions">
          <v-btn variant="text" @click="closeDocumentDialog">Close</v-btn>
        </div>
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
.upload-card {
  background: var(--ea-surface);
  border: 1px solid var(--ea-border);
  border-radius: 16px;
  padding: 24px;
}

.upload-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.upload-title {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 20px;
  color: var(--ea-ink);
}

/* Dropzone */
.dropzone {
  border: 1px dashed var(--ea-border);
  border-radius: 14px;
  padding: 28px 20px 16px;
  text-align: center;
  background: var(--ea-paper);
  transition: border-color 0.18s ease, background 0.18s ease;
}
.dropzone:hover {
  border-color: var(--ea-emerald);
  background: var(--ea-emerald-tint);
}

.dropzone-icon {
  color: var(--ea-emerald);
}

.dropzone-text {
  font-family: var(--ea-display);
  font-weight: 600;
  color: var(--ea-ink);
  margin-top: 8px;
}

.dropzone-hint {
  font-size: 12px;
  color: var(--ea-muted);
  margin-bottom: 12px;
}

.dropzone-input {
  margin-top: 4px;
}

/* Uploaded list */
.uploaded {
  margin-top: 20px;
}

.uploaded-label {
  font-family: var(--ea-mono);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ea-muted);
  margin-bottom: 8px;
}

.doc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.doc-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--ea-border);
}
.doc-row:last-child {
  border-bottom: none;
}

.doc-row-icon {
  color: var(--ea-muted);
}

.doc-name {
  flex-grow: 1;
  color: var(--ea-ink);
  font-size: 14px;
}

.doc-del {
  color: var(--ea-muted);
  cursor: pointer;
}
.doc-del:hover {
  color: var(--ea-error, #dc2626);
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
  margin-top: 16px;
}

.upload-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
