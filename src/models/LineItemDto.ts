/**
 * Line-item types. The `*Dto` interfaces mirror the raw JSON returned by the
 * backend (camelCase, see ExpenseController doc/{docId} and lineItem endpoints).
 */

export interface LineItemAssigneeDto {
  userId: string
  userName: string
}

export interface LineItemDto {
  id: string
  description: string | null
  quantity: string | null
  amount: number | null
  sortOrder: number
  assignees: LineItemAssigneeDto[]
}
