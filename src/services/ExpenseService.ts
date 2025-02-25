import type { DocumentDialogDto } from '@/models/DocumentDialogDto'
import type { ExpenseListDataDto, UpdateExpenseDto } from '@/models/ExpenseCreateForm'
import type { FilterBy } from '@/models/FilterBy'
import type { Pagination } from '@/models/Pagination'
import type { SortFilter } from '@/models/SortFilter'
import axios from 'axios'
const BASE_URL = import.meta.env.VITE_APP_API_URL

const API_URL = BASE_URL + '/Expense' // Set your API URL here

class ExpenseService {
  /**
   *
   * @param data of type ExpenseDataDto
   * @returns Guid Id of new Expense
   */
  async CreateExpense(data: any): Promise<string> {
    try {
      const response = await axios.post(`${API_URL}`, data, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data.id
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create expense')
      }
      throw new Error('An unexpected error occurred')
    }
  }
  /**
   *
   * @param id  Guid id of Expense to update
   * @param updateExpenseDto UpdateExpenseDto form data.
   * @returns Updated Expense
   */
  async updateExpense(id: string, updateExpenseDto: UpdateExpenseDto) {
    try {
      const response = await axios.put(`${API_URL}/${id}`, updateExpenseDto, {
        withCredentials: true
      })

      return response.data
    } catch (error) {
      return error
    }
  }
  /**
   *
   * @param data  File to upload of type CreateDocumentDto
   * @returns  Uploaded document of type DocumentDialogDto
   */
  async UploadExpenseDoc(data: any): Promise<DocumentDialogDto> {
    try {
      const response = await axios.post(`${API_URL}/${data.id}/uploadDoc`, data, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to upload expense document')
      }
      throw new Error('An unexpected error occurred')
    }
  }
  /**
   *
   * @returns  List of ExpenseListDataDto for logged in user based on pageNumber and size
   */
  async GetExpenses(
    pagination: Pagination,
    sortFilter: SortFilter | null,
    searchFilter: FilterBy | null
  ): Promise<any> {
    try {
      const params: any = {
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize
      }

      if (sortFilter) {
        params.PropertyNameSort = sortFilter.propertyName
        params.Ascending = sortFilter.ascending
      }

      if (searchFilter) {
        params.PropertyName = searchFilter.propertyName
        params.Type = searchFilter.type
        params.Value = searchFilter.value
      }

      const response = await axios.get(`${API_URL}`, {
        params,
        withCredentials: true
      })

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status == 404) {
          throw new Error(error.response?.status.toString())
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch expenses')
      }
      throw new Error('An unexpected error occurred')
    }
  }
  /**
   *
   * @returns  Total Number of Expenses use for pageCount
   */
  async GetExpensesCount(): Promise<any> {
    try {
      const response = axios.get(`${API_URL}/count`, {
        withCredentials: true
      })

      return (await response).data?.totalRows
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status == 404) {
          throw new Error(error.response?.status.toString())
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch expenses')
      }
      throw new Error('An unexpected error occurred')
    }
  }
  /**
   *
   * @returns  List of ExpenseListDataDto for logged in user for dropdown
   */
  async GetExpensesDropdown(): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/dropdown`, {
        withCredentials: true
      })

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status == 404) {
          throw new Error(error.response?.status.toString())
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch expenses')
      }
      throw new Error('An unexpected error occurred')
    }
  }
  /**
   *
   * @param expense ExpenseListDataDto object to delete
   * @returns Boolean return of whether expense is deleted or not
   */
  async DeleteExpense(expense: ExpenseListDataDto): Promise<any> {
    try {
      const resp = await axios.delete(`${API_URL}/${expense.id}`, {
        withCredentials: true
      })
      return resp.status == 204
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create expense')
      }
      throw new Error('An unexpected error occurred')
    }
  }
  /**
   *
   * @param id  Expense id as input to fetch documents.
   * @returns  List of all documents attached to expenseId passed.
   */
  async GetDocByExpenseId(id: string): Promise<DocumentDialogDto[]> {
    try {
      const resp = await axios.get(`${API_URL}/docs/${id}`, {
        withCredentials: true
      })

      // Check if there's a 204 No Content response
      if (resp.status === 204) {
        return []
      }
      return resp.data as DocumentDialogDto[]
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to retrieve documents')
      }
      throw new Error('An unexpected error occurred')
    }
  }

  /**
   *
   * @param expenseId  Expense Id
   * @param docId  Document Id
   * @returns  List of Document Line Items Results
   */
  async GetDocResults(expenseId: string, docId: string): Promise<any> {
    try {
      const resp = await axios.get(`${API_URL}/${expenseId}/doc/${docId}`, {
        withCredentials: true
      })

      // Check if there's a 204 No Content response
      if (resp.status === 204) {
        return []
      }
      return resp.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to retrieve documents')
      }
      throw new Error('An unexpected error occurred')
    }
  }

  /**
   * Adds a user to an expense.
   * @param userId The ID of the user to add (string).
   * @param expenseId The ID of the expense (string).
   * @returns The GUID ID of the new ExpenseUser entry.
   */
  async AddUserToExpense(userId: string, expenseId: string): Promise<string> {
    try {
      const response = await axios.post(`${API_URL}/${expenseId}/addUser`, null, {
        params: { userId },
        withCredentials: true
      })
      return response.data.id
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to add user to expense')
      }
      throw new Error('An unexpected error occurred')
    }
  }

  /**
   *
   * @returns  Expense Users Dto List
   */
  async GetExpenseUsers(expenseId: string): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/${expenseId}/getAssignedUsers  `, {
        withCredentials: true
      })

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status == 404) {
          throw new Error(error.response?.status.toString())
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch expenses')
      }
      throw new Error('An unexpected error occurred')
    }
  }

  /**
   *
   * @returns  List of ExpenseListDataDto shared with logged in user based on pageNumber and size
   */
  async GetSharedExpenses(
    pagination: Pagination,
    sortFilter: SortFilter | null,
    searchFilter: FilterBy | null
  ): Promise<any> {
    try {
      const params: any = {
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize
      }

      if (sortFilter) {
        params.PropertyNameSort = sortFilter.propertyName
        params.Ascending = sortFilter.ascending
      }

      if (searchFilter) {
        params.PropertyName = searchFilter.propertyName
        params.Type = searchFilter.type
        params.Value = searchFilter.value
      }

      const response = await axios.get(`${API_URL}/sharedExpenses`, {
        params,
        withCredentials: true
      })

      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status == 404) {
          throw new Error(error.response?.status.toString())
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch expenses')
      }
      throw new Error('An unexpected error occurred')
    }
  }
}

export default new ExpenseService()
