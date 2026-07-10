/**
 * Budget types. The `*Dto` interfaces mirror the raw JSON returned by the
 * backend (camelCase, see BudgetController).
 */

export interface BudgetDto {
  id: string
  category: string
  monthlyLimit: number
}

export interface BudgetStatusDto {
  category: string
  monthlyLimit: number
  spent: number
}

export interface UpsertBudgetRequest {
  category: string
  monthlyLimit: number
}
