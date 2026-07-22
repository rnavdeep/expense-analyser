/**
 * Category types. The `*Dto` interfaces mirror the raw JSON returned by the
 * backend (camelCase, see CategoryController). A category can optionally
 * carry a monthly spending limit.
 */

export interface CategoryDto {
  id: string
  name: string
  monthlyLimit: number
}

export interface CategoryStatusDto {
  id: string
  name: string
  monthlyLimit: number
  spent: number
}

export interface UpsertCategoryRequest {
  name: string
  monthlyLimit: number
}

export interface CategoryExpenseDto {
  id: string
  title: string
  amount: number
  createdAt: string
}
