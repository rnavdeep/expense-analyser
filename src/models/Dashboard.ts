import type { ExpenseListDataDto } from '@/models/ExpenseCreateForm'

/**
 * Dashboard types. The `*Dto` interfaces mirror the raw JSON returned by the
 * backend (camelCase, see ExpenseController summary/monthly/balances); the rest
 * are the UI-facing shapes the Dashboard components consume. The store adapts
 * the former into the latter (see stores/Dashboard).
 */

export type DashboardPeriod = 'month' | 'quarter' | 'year'

// ── UI-facing shapes ─────────────────────────────────────────────
export interface KpiSummary {
  totalSpent: number
  youOwe: number
  owedToYou: number
  receiptsScanned: number
  /** % change vs. previous period, for the little trend line under each KPI */
  totalSpentDelta: number
  youOweSubtext: string
  owedToYouSubtext: string
  receiptsSubtext: string
}

export interface MonthlyPoint {
  label: string
  amount: number
}

export interface CategorySlice {
  label: string
  amount: number
  color: string
}

export interface BalanceEntry {
  userId: string
  name: string
  amount: number
}

export interface OutstandingBalances {
  youOwe: BalanceEntry[]
  owedToYou: BalanceEntry[]
}

export interface DashboardData {
  kpis: KpiSummary
  monthly: MonthlyPoint[]
  categories: CategorySlice[]
  recent: ExpenseListDataDto[]
  balances: OutstandingBalances
}

// Donut/category palette — reuses the redesign token colors. Assigned to
// category slices by index (the API has no color of its own).
export const CATEGORY_COLORS = ['#1a1d28', '#2f9e6f', '#6a7adf', '#d97706', '#94a3b8']

// ── Raw API DTOs (camelCase, straight off the wire) ──────────────
export interface CategoryBreakdownDto {
  category: string
  amount: number
}

export interface SummaryDto {
  totalSpent: number
  receiptsScanned: number
  youOwe: number
  owedToYou: number
  totalSpentDeltaPct: number
  categories: CategoryBreakdownDto[]
}

export interface MonthlySpendingDto {
  year: number
  month: number
  label: string
  amount: number
}

export interface BalanceEntryDto {
  userId: string
  userName: string
  amount: number
}

export interface BalancesDto {
  youOwe: BalanceEntryDto[]
  owedToYou: BalanceEntryDto[]
}
