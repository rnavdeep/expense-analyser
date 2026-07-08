<template>
  <div class="dashboard">
    <!-- ── Greeting + period toggle ── -->
    <header class="dash-header">
      <div>
        <h1 class="dash-title">Dashboard</h1>
        <p class="dash-greeting">{{ greeting }}, {{ displayName }} 👋</p>
      </div>
      <!-- API NOTE: the active period feeds every summary endpoint above. -->
      <div class="period-toggle" role="tablist" aria-label="Reporting period">
        <button
          v-for="opt in periodOptions"
          :key="opt.value"
          type="button"
          role="tab"
          :aria-selected="period === opt.value"
          class="period-btn"
          :class="{ active: period === opt.value }"
          @click="period = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
    </header>

    <!-- ── Error state ── -->
    <div v-if="error" class="dash-state error-state">
      <v-icon size="28" color="secondary">mdi-alert-circle-outline</v-icon>
      <p class="state-msg">{{ error }}</p>
      <button type="button" class="state-btn" @click="retry">Retry</button>
    </div>

    <!-- ── Loading state (first load) ── -->
    <div v-else-if="isLoading && !data" class="dash-state">
      <v-progress-circular indeterminate color="secondary" size="32" />
      <p class="state-msg">Loading your dashboard…</p>
    </div>

    <template v-else-if="data">
    <!-- ── KPI strip ── -->
    <section class="kpi-strip">
      <div v-for="kpi in kpiCards" :key="kpi.label" class="kpi-card" :style="{ borderTopColor: kpi.accent }">
        <div class="kpi-top">{{ kpi.label }}</div>
        <div class="kpi-value" :style="{ color: kpi.valueColor }">{{ kpi.value }}</div>
        <div class="kpi-sub">
          <span class="kpi-dot" :style="{ background: kpi.accent }"></span>
          {{ kpi.sub }}
        </div>
      </div>
    </section>

    <!-- ── Charts row ── -->
    <section class="charts-row">
      <div class="panel chart-panel">
        <div class="panel-head">
          <div>
            <h2 class="panel-title">Spending over time</h2>
            <p class="panel-sub">Last {{ data.monthly.length }} periods · latest highlighted</p>
          </div>
        </div>
        <div class="chart-box">
          <MonthlyBarChart :data="data.monthly" />
        </div>
      </div>

      <div class="panel chart-panel">
        <div class="panel-head">
          <div>
            <h2 class="panel-title">By category</h2>
            <p class="panel-sub">Where it went</p>
          </div>
        </div>
        <div class="chart-box donut-box">
          <CategoryDonut :data="data.categories" />
        </div>
      </div>
    </section>

    <!-- ── Bottom row: recent + balances ── -->
    <section class="bottom-row">
      <!-- Recent expenses -->
      <div class="panel">
        <div class="panel-head">
          <h2 class="panel-title">Recent expenses</h2>
          <router-link to="/myExpenses" class="panel-link">View all</router-link>
        </div>
        <ul class="recent-list">
          <li v-for="exp in data.recent" :key="exp.id" class="recent-item">
            <div class="recent-left">
              <div class="recent-icon"><v-icon size="18" color="secondary">mdi-receipt-text-outline</v-icon></div>
              <div>
                <div class="recent-title">{{ exp.title }}</div>
                <div class="recent-date">{{ formatDate(exp.createdAt) }}</div>
              </div>
            </div>
            <div class="amount recent-amount">{{ formatCurrency(exp.amount) }}</div>
          </li>
        </ul>
      </div>

      <!-- Outstanding balances -->
      <div class="panel">
        <div class="panel-head">
          <h2 class="panel-title">Outstanding balances</h2>
          <router-link to="/sharedExpenses" class="panel-link">View all</router-link>
        </div>

        <div class="balance-group">
          <div class="balance-label owe"><span class="kpi-dot owe-dot"></span>You owe</div>
          <div v-for="b in data.balances.youOwe" :key="'owe-' + b.userId" class="balance-row owe-row">
            <div class="balance-person">
              <div class="person-avatar">{{ initialsOf(b.name) }}</div>
              <span>{{ b.name }}</span>
            </div>
            <div class="balance-owe-right">
              <span class="amount balance-amount owe-amount">{{ formatCurrency(b.amount) }}</span>
              <v-btn size="small" variant="text" color="secondary" @click="openSettleUp(b)">Settle up</v-btn>
            </div>
          </div>
        </div>

        <div class="balance-group">
          <div class="balance-label owed"><span class="kpi-dot owed-dot"></span>Owed to you</div>
          <div v-for="b in data.balances.owedToYou" :key="'owed-' + b.name" class="balance-row owed-row">
            <div class="balance-person">
              <div class="person-avatar">{{ initialsOf(b.name) }}</div>
              <span>{{ b.name }}</span>
            </div>
            <span class="amount balance-amount owed-amount">{{ formatCurrency(b.amount) }}</span>
          </div>
        </div>
      </div>
    </section>
    </template>

    <SettleUpDialog
      v-if="settleUpTarget"
      v-model="settleUpOpen"
      :payee-user-id="settleUpTarget.userId"
      :payee-name="settleUpTarget.name"
      :max-amount="settleUpTarget.amount"
      @settled="onSettled"
    />

    <v-snackbar v-model="snackbar" color="secondary" :timeout="3000">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/Auth'
import { useDashboardStore } from '../stores/Dashboard'
import MonthlyBarChart from './dashboard/MonthlyBarChart.vue'
import CategoryDonut from './dashboard/CategoryDonut.vue'
import SettleUpDialog from './SettleUpDialog.vue'
import type { BalanceEntry, DashboardPeriod } from '@/models/Dashboard'

export default defineComponent({
  name: 'eaDashboard',
  components: { MonthlyBarChart, CategoryDonut, SettleUpDialog },
  setup() {
    const authStore = useAuthStore()
    const dashboardStore = useDashboardStore()

    const period = ref<DashboardPeriod>('month')
    const periodOptions: { label: string; value: DashboardPeriod }[] = [
      { label: 'This month', value: 'month' },
      { label: '3 months', value: 'quarter' },
      { label: 'Year', value: 'year' }
    ]

    // Live data, keyed off the active period — see the summary/monthly/balances
    // endpoints on ExpenseController.
    const { data, isLoading, error } = storeToRefs(dashboardStore)

    onMounted(() => dashboardStore.LoadDashboard(period.value))
    watch(period, (p) => dashboardStore.LoadDashboard(p))

    const displayName = computed(() => (authStore.userName || 'there').trim() || 'there')

    const greeting = computed(() => {
      const h = new Date().getHours()
      if (h < 12) return 'Good morning'
      if (h < 18) return 'Good afternoon'
      return 'Good evening'
    })

    const formatCurrency = (n: number) =>
      n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

    const formatDate = (iso: string) =>
      new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    const initialsOf = (name: string) => (name || '').trim().slice(0, 1).toUpperCase() || '?'

    const kpiCards = computed(() => {
      if (!data.value) return []
      const k = data.value.kpis
      const deltaSign = k.totalSpentDelta >= 0 ? '+' : ''
      return [
        {
          label: 'Total spent',
          value: formatCurrency(k.totalSpent),
          valueColor: 'var(--ea-ink)',
          accent: '#1a1d28',
          sub: `${deltaSign}${k.totalSpentDelta}% vs last period`
        },
        {
          label: 'You owe',
          value: formatCurrency(k.youOwe),
          valueColor: '#dc2626',
          accent: '#dc2626',
          sub: k.youOweSubtext
        },
        {
          label: 'Owed to you',
          value: formatCurrency(k.owedToYou),
          valueColor: 'var(--ea-emerald)',
          accent: '#2f9e6f',
          sub: k.owedToYouSubtext
        },
        {
          label: 'Receipts scanned',
          value: String(k.receiptsScanned),
          valueColor: '#6a7adf',
          accent: '#6a7adf',
          sub: k.receiptsSubtext
        }
      ]
    })

    const retry = () => dashboardStore.LoadDashboard(period.value)

    // ── Settle-up dialog ──
    const settleUpOpen = ref(false)
    const settleUpTarget = ref<BalanceEntry | null>(null)
    const snackbar = ref(false)
    const snackbarText = ref('')

    const openSettleUp = (balance: BalanceEntry) => {
      settleUpTarget.value = balance
      settleUpOpen.value = true
    }

    const onSettled = () => {
      snackbarText.value = `Settled up with ${settleUpTarget.value?.name}`
      snackbar.value = true
      dashboardStore.LoadDashboard(period.value)
    }

    return {
      period,
      periodOptions,
      data,
      isLoading,
      error,
      retry,
      displayName,
      greeting,
      kpiCards,
      formatCurrency,
      formatDate,
      initialsOf,
      settleUpOpen,
      settleUpTarget,
      snackbar,
      snackbarText,
      openSettleUp,
      onSettled
    }
  }
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 56px;
  width: 100%;
  box-sizing: border-box;
}

/* ── Header ── */
.dash-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.dash-title {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 28px;
  letter-spacing: -0.02em;
  color: var(--ea-ink);
  margin: 0 0 4px;
}

.dash-greeting {
  font-size: 15px;
  color: var(--ea-muted);
  margin: 0;
}

.period-toggle {
  display: inline-flex;
  border: 1px solid var(--ea-border);
  border-radius: 10px;
  overflow: hidden;
  background: var(--ea-surface);
}

.period-btn {
  font-family: var(--ea-display);
  font-weight: 500;
  font-size: 13px;
  color: var(--ea-muted);
  background: transparent;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  border-left: 1px solid var(--ea-border);
  transition: background 0.15s ease, color 0.15s ease;
}
.period-btn:first-child { border-left: none; }
.period-btn:hover { color: var(--ea-ink); }
.period-btn.active {
  background: var(--ea-ink);
  color: #ffffff;
}

/* ── KPI strip ── */
.kpi-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 18px;
}

.kpi-card {
  background: var(--ea-surface);
  border: 1px solid var(--ea-border);
  border-top: 4px solid var(--ea-ink);
  border-radius: 14px;
  padding: 18px 20px;
}

.kpi-top {
  font-size: 12.5px;
  color: var(--ea-muted);
  margin-bottom: 10px;
}

.kpi-value {
  font-family: var(--ea-mono);
  font-weight: 700;
  font-size: 24px;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}

.kpi-sub {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--ea-muted);
}

.kpi-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ── Panels ── */
.panel {
  background: var(--ea-surface);
  border: 1px solid var(--ea-border);
  border-radius: 14px;
  padding: 20px;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.panel-title {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 16px;
  color: var(--ea-ink);
  margin: 0;
}

.panel-sub {
  font-size: 12.5px;
  color: var(--ea-muted);
  margin: 3px 0 0;
}

.panel-link {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 13px;
  color: var(--ea-emerald);
  text-decoration: none;
}
.panel-link:hover { text-decoration: underline; }

/* ── Charts ── */
.charts-row {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 18px;
  margin-bottom: 18px;
}

.chart-box {
  height: 220px;
  position: relative;
}
.donut-box {
  height: 220px;
}

/* ── Bottom row ── */
.bottom-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.recent-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.recent-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--ea-border);
}
.recent-item:last-child { border-bottom: none; }

.recent-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.recent-icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: var(--ea-emerald-tint);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.recent-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ea-ink);
}

.recent-date {
  font-size: 12px;
  color: var(--ea-muted);
}

.amount {
  font-family: var(--ea-mono);
}

.recent-amount {
  font-size: 14px;
  font-weight: 700;
  color: var(--ea-ink);
}

/* ── Balances ── */
.balance-group { margin-bottom: 16px; }
.balance-group:last-child { margin-bottom: 0; }

.balance-label {
  display: flex;
  align-items: center;
  gap: 7px;
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 10px;
}
.balance-label.owe { color: #dc2626; }
.balance-label.owed { color: var(--ea-emerald); }
.owe-dot { background: #dc2626; }
.owed-dot { background: var(--ea-emerald); }

.balance-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 12px;
  border-radius: 9px;
  margin-bottom: 7px;
}
.balance-row:last-child { margin-bottom: 0; }
.owe-row { background: rgba(220, 38, 38, 0.06); }
.owed-row { background: var(--ea-emerald-tint); }

.balance-person {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13.5px;
  color: var(--ea-ink);
}

.person-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--ea-ink);
  color: #ffffff;
  font-family: var(--ea-display);
  font-weight: 700;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.balance-amount {
  font-size: 13.5px;
  font-weight: 700;
}
.owe-amount { color: #dc2626; }
.owed-amount { color: var(--ea-emerald); }

.balance-owe-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── Loading / error states ── */
.dash-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 320px;
  text-align: center;
}

.state-msg {
  font-size: 14px;
  color: var(--ea-muted);
  margin: 0;
}

.state-btn {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 13px;
  color: #ffffff;
  background: var(--ea-ink);
  border: none;
  border-radius: 10px;
  padding: 9px 20px;
  cursor: pointer;
}
.state-btn:hover { opacity: 0.9; }

/* ── Responsive ── */
@media (max-width: 900px) {
  .kpi-strip { grid-template-columns: repeat(2, 1fr); }
  .charts-row,
  .bottom-row { grid-template-columns: 1fr; }
}

@media (max-width: 520px) {
  .kpi-strip { grid-template-columns: 1fr; }
  .dash-header { align-items: flex-start; }
}
</style>
