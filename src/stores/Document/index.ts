import { defineStore } from 'pinia'
import DocumentService from '@/services/DocumentService'
import { DocumentDialogDto } from '@/models/DocumentDialogDto' // Import your DTO type
import ExpenseService from '@/services/ExpenseService'

// Define the Pinia store
export const useDocumentStore = defineStore('document', {
  state: () => ({
    documents: [] as DocumentDialogDto[],
    loading: false
  }),

  actions: {
    // Action to delete a document
    async deleteDocument(docId: string): Promise<void> {
      //   this.loading = true
      try {
        await DocumentService.DeleteDocument(docId)
        // Remove the document from the state after successful deletion
        this.documents = this.documents.filter((doc) => doc.id !== docId)
      } catch (error) {
        console.error('Error deleting document:', error)
        throw new Error('Failed to delete document')
      } finally {
        // this.loading = false
      }
    },

    async uploadExpenseDoc(data: any) {
      if (!data.id || !data.file) {
        throw new Error('All fields are required to upload an expense document.')
      }

      try {
        //   this.isUploading = true
        // Call ExpenseService to create the new expense
        const resp = await ExpenseService.UploadExpenseDoc(data)

        if (resp) {
          // this.uploadSuccess = true
          this.documents.push(resp)
        } else {
          throw new Error('Unsuccessful')
        }
      } catch (error) {
        // this.uploadSuccess = false
      } finally {
        // this.isUploading = false
      }
    }
  },

  getters: {
    //to do
    allDocuments: (state) => state.documents
  }
})
