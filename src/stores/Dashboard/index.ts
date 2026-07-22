import { defineStore } from 'pinia'
import DashboardService from '@/services/DashboardService'
import ExpenseService from '@/services/ExpenseService'
import CategoryService from '@/services/CategoryService'
import { Pagination } from '@/models/Pagination'
import { SortFilter } from '@/models/SortFilter'
import type { ExpenseListDataDto } from '@/models/ExpenseCreateForm'
import type { CategoryStatusDto } from '@/models/Category'
import {
  CATEGORY_COLORS,
  type BalancesDto,
  type DashboardData,
  type DashboardPeriod,
  type MonthlySpendingDto,
  type OutstandingBalances,
  type SummaryDto
} from '@/models/Dashboard'

interface DashboardState {
  data: DashboardData | null
  isLoading: boolean
  error: string | null
}

// The monthly endpoint only buckets by month, so we widen the window for longer
// periods rather than change bucket granularity.
function monthsFor(period: DashboardPeriod): number {
  return period === 'year' ? 12 : 6
}

function receiptsSubtextFor(period: DashboardPeriod): string {
  if (period === 'quarter') return 'last 3 months'
  if (period === 'year') return 'this year'
  return 'this month'
}

function toDashboardData(
  period: DashboardPeriod,
  summary: SummaryDto,
  monthly: MonthlySpendingDto[],
  balancesDto: BalancesDto,
  recent: ExpenseListDataDto[],
  categoryLimits: CategoryStatusDto[]
): DashboardData {
  // A settled-up balance (0, or floating-point noise that rounds to $0.00)
  // shouldn't show up in either list.
  const isOwed = (amount: number) => Math.round(amount * 100) !== 0

  const balances: OutstandingBalances = {
    youOwe: balancesDto.youOwe
      .filter((b) => isOwed(b.amount))
      .map((b) => ({ userId: b.userId, name: b.userName, amount: b.amount })),
    owedToYou: balancesDto.owedToYou
      .filter((b) => isOwed(b.amount))
      .map((b) => ({ userId: b.userId, name: b.userName, amount: b.amount }))
  }

  return {
    kpis: {
      totalSpent: summary.totalSpent,
      youOwe: summary.youOwe,
      owedToYou: summary.owedToYou,
      receiptsScanned: summary.receiptsScanned,
      totalSpentDelta: summary.totalSpentDeltaPct,
      // The API doesn't send subtexts — derive them from the balance counts.
      youOweSubtext: `across ${balances.youOwe.length} ${
        balances.youOwe.length === 1 ? 'person' : 'people'
      }`,
      owedToYouSubtext: `from ${balances.owedToYou.length} ${
        balances.owedToYou.length === 1 ? 'person' : 'people'
      }`,
      receiptsSubtext: receiptsSubtextFor(period)
    },
    monthly: monthly.map((m) => ({ label: m.label, amount: m.amount })),
    categories: summary.categories.map((c, i) => ({
      label: c.category,
      amount: c.amount,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length]
    })),
    recent,
    balances,
    categoryLimits
  }
}

export const useDashboardStore = defineStore('Dashboard', {
  state: (): DashboardState => ({
    data: null,
    isLoading: false,
    error: null
  }),

  actions: {
    async LoadDashboard(period: DashboardPeriod): Promise<void> {
      this.isLoading = true
      this.error = null
      try {
        const [summary, monthly, balancesDto, expensesResp, categoryLimits] = await Promise.all([
          DashboardService.GetSummary(period),
          DashboardService.GetMonthly(monthsFor(period)),
          DashboardService.GetBalances(),
          // A user with no expenses makes this call throw (404) — that's not a
          // dashboard failure, so swallow it into an empty recent list.
          ExpenseService.GetExpenses(
            new Pagination(1, 4),
            new SortFilter('CreatedAt', false),
            null
          ).catch(() => ({ expenses: [], totalRows: 0 })),
          // A user with no categories makes this call throw (404) too.
          CategoryService.GetCategories('month').catch(() => [])
        ])

        this.data = toDashboardData(
          period,
          summary,
          monthly,
          balancesDto,
          (expensesResp?.expenses ?? []) as ExpenseListDataDto[],
          categoryLimits
        )
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to load dashboard'
      } finally {
        this.isLoading = false
      }
    }
  }
})
