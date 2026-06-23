import { ExpenseListDataDto } from '@/models/ExpenseCreateForm'

/**
 * Seed data for the Dashboard homescreen.
 *
 * Everything here is mock data so the dashboard renders without a backend. Each
 * block is shaped to match what a real endpoint would return, and carries an
 * `API NOTE` describing the endpoint we'd add to replace it. Swapping to live
 * data should be a one-line change per block (replace the constant with a fetch).
 */

export type DashboardPeriod = 'month' | 'quarter' | 'year'

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

// Donut/category palette — reuses the redesign token colors.
const CATEGORY_COLORS = {
  ink: '#1a1d28',
  emerald: '#2f9e6f',
  indigo: '#6a7adf',
  amber: '#d97706',
  slate: '#94a3b8'
}

/**
 * API NOTE: GET /Expense/summary?period={month|quarter|year}
 *   Returns totalSpent + count for the period, plus owe/owed totals aggregated
 *   from UserAssignedDto.userAmount. Deltas need the previous period's total.
 */
const KPIS_BY_PERIOD: Record<DashboardPeriod, KpiSummary> = {
  month: {
    totalSpent: 1842.57,
    youOwe: 186.13,
    owedToYou: 62.5,
    receiptsScanned: 9,
    totalSpentDelta: 12.4,
    youOweSubtext: 'across 3 people',
    owedToYouSubtext: 'from 2 people',
    receiptsSubtext: 'this month'
  },
  quarter: {
    totalSpent: 5218.94,
    youOwe: 243.4,
    owedToYou: 158.75,
    receiptsScanned: 27,
    totalSpentDelta: 4.1,
    youOweSubtext: 'across 4 people',
    owedToYouSubtext: 'from 3 people',
    receiptsSubtext: 'last 3 months'
  },
  year: {
    totalSpent: 19764.2,
    youOwe: 412.18,
    owedToYou: 305.0,
    receiptsScanned: 113,
    totalSpentDelta: -2.6,
    youOweSubtext: 'across 6 people',
    owedToYouSubtext: 'from 5 people',
    receiptsSubtext: 'this year'
  }
}

/**
 * API NOTE: GET /Expense/monthly?months=6
 *   SUM(amount) GROUP BY month(CreatedAt) for the trailing window. The last
 *   entry is the current month (highlighted bar). `quarter`/`year` would request
 *   a different window size.
 */
const MONTHLY_BY_PERIOD: Record<DashboardPeriod, MonthlyPoint[]> = {
  month: [
    { label: 'Jan', amount: 1320 },
    { label: 'Feb', amount: 1680 },
    { label: 'Mar', amount: 1105 },
    { label: 'Apr', amount: 1920 },
    { label: 'May', amount: 1460 },
    { label: 'Jun', amount: 1842 }
  ],
  quarter: [
    { label: 'Jan', amount: 1320 },
    { label: 'Feb', amount: 1680 },
    { label: 'Mar', amount: 1105 },
    { label: 'Apr', amount: 1920 },
    { label: 'May', amount: 1460 },
    { label: 'Jun', amount: 1842 }
  ],
  year: [
    { label: 'Q3 ’25', amount: 4180 },
    { label: 'Q4 ’25', amount: 5260 },
    { label: 'Q1 ’26', amount: 4105 },
    { label: 'Q2 ’26', amount: 5219 }
  ]
}

/**
 * API NOTE: requires a `category` field on Expense (NOT present today — the
 *   current ExpenseListDataDto has only id/title/description/amount/createdAt).
 *   Once categorized: GET /Expense/summary returns a per-category breakdown.
 */
const CATEGORIES_BY_PERIOD: Record<DashboardPeriod, CategorySlice[]> = {
  month: [
    { label: 'Groceries', amount: 642, color: CATEGORY_COLORS.ink },
    { label: 'Dining', amount: 458, color: CATEGORY_COLORS.emerald },
    { label: 'Transport', amount: 366, color: CATEGORY_COLORS.indigo },
    { label: 'Utilities', amount: 274, color: CATEGORY_COLORS.amber },
    { label: 'Other', amount: 102, color: CATEGORY_COLORS.slate }
  ],
  quarter: [
    { label: 'Groceries', amount: 1820, color: CATEGORY_COLORS.ink },
    { label: 'Dining', amount: 1290, color: CATEGORY_COLORS.emerald },
    { label: 'Transport', amount: 980, color: CATEGORY_COLORS.indigo },
    { label: 'Utilities', amount: 740, color: CATEGORY_COLORS.amber },
    { label: 'Other', amount: 388, color: CATEGORY_COLORS.slate }
  ],
  year: [
    { label: 'Groceries', amount: 6940, color: CATEGORY_COLORS.ink },
    { label: 'Dining', amount: 4820, color: CATEGORY_COLORS.emerald },
    { label: 'Transport', amount: 3680, color: CATEGORY_COLORS.indigo },
    { label: 'Utilities', amount: 2840, color: CATEGORY_COLORS.amber },
    { label: 'Other', amount: 1484, color: CATEGORY_COLORS.slate }
  ]
}

/**
 * API NOTE: existing endpoint already covers this —
 *   ExpenseService.GetExpenses(new Pagination(1, 4), new SortFilter('CreatedAt', false), null)
 *   returns { expenses: ExpenseListDataDto[], totalRows }. Wire the recent list
 *   to that and drop this constant.
 */
const RECENT: ExpenseListDataDto[] = [
  new ExpenseListDataDto('seed-1', 'Whole Foods', 'Weekly groceries', 86.42, '2026-06-22T18:30:00Z'),
  new ExpenseListDataDto('seed-2', 'Uber', 'Airport ride', 41.0, '2026-06-21T09:15:00Z'),
  new ExpenseListDataDto('seed-3', 'Dinner — Nomad', 'Team dinner', 152.75, '2026-06-20T20:05:00Z'),
  new ExpenseListDataDto('seed-4', 'Hydro bill', 'June electricity', 73.18, '2026-06-19T08:00:00Z')
]

/**
 * API NOTE: GET /sharedExpenses/balances (also flagged missing in the wireframe).
 *   Aggregates UserAssignedDto.userAmount per counterparty into net owe/owed.
 */
const BALANCES: OutstandingBalances = {
  youOwe: [
    { name: 'Priya', amount: 124.13 },
    { name: 'Sam', amount: 62.0 }
  ],
  owedToYou: [{ name: 'Jordan', amount: 62.5 }]
}

/**
 * Returns the full dashboard dataset for a period. Replace the body with parallel
 * fetches to the endpoints noted above when the backend is ready.
 */
export function getDashboardData(period: DashboardPeriod = 'month'): DashboardData {
  return {
    kpis: KPIS_BY_PERIOD[period],
    monthly: MONTHLY_BY_PERIOD[period],
    categories: CATEGORIES_BY_PERIOD[period],
    recent: RECENT,
    balances: BALANCES
  }
}
