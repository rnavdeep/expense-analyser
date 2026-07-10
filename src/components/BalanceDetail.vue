<template>
  <div class="balance-detail">
    <router-link to="/dashboard" class="bd-back">← Back to dashboard</router-link>

    <!-- ── Error state ── -->
    <div v-if="error" class="bd-state error-state">
      <v-icon size="28" color="secondary">mdi-alert-circle-outline</v-icon>
      <p class="state-msg">{{ error }}</p>
      <button type="button" class="state-btn" @click="retry">Retry</button>
    </div>

    <!-- ── Loading state (first load) ── -->
    <div v-else-if="isLoading && !balanceDetail" class="bd-state">
      <v-progress-circular indeterminate color="secondary" size="32" />
      <p class="state-msg">Loading balance…</p>
    </div>

    <template v-else-if="balanceDetail">
      <section class="panel bd-summary">
        <div class="person-avatar large">{{ initialsOf(balanceDetail.userName) }}</div>
        <div>
          <h1 class="bd-title">{{ balanceDetail.userName }}</h1>
          <p class="bd-net" :class="netClass">{{ netText }}</p>
        </div>
      </section>

      <section class="panel">
        <h2 class="panel-title">History</h2>
        <ul v-if="balanceDetail.entries.length" class="bd-list">
          <li v-for="entry in balanceDetail.entries" :key="entry.id" class="bd-entry">
            <div class="bd-entry-left">
              <v-icon
                size="18"
                :color="entry.type === 'settlement' ? 'success' : 'secondary'"
              >{{ entry.type === 'settlement' ? 'mdi-cash-check' : 'mdi-receipt-text' }}</v-icon>
              <div>
                <div class="bd-entry-desc">{{ entry.description }}</div>
                <div class="bd-entry-date">{{ formatDate(entry.createdAt) }}</div>
              </div>
            </div>
            <span
              class="amount bd-entry-amount"
              :class="entry.direction === 'youOwe' ? 'owe-amount' : 'owed-amount'"
            >{{ entry.direction === 'youOwe' ? '-' : '+' }}{{ formatCurrency(entry.amount) }}</span>
          </li>
        </ul>
        <p v-else class="state-msg">No history yet.</p>
      </section>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSettlementStore } from '../stores/Settlement'

export default defineComponent({
  name: 'eaBalanceDetail',
  setup() {
    const route = useRoute()
    const settlementStore = useSettlementStore()

    const userId = String(route.params.userId)

    const { balanceDetail, isLoading, error } = storeToRefs(settlementStore)

    const load = () => settlementStore.LoadBalanceDetail(userId)

    onMounted(load)

    const retry = () => load()

    const formatCurrency = (n: number) =>
      n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

    const formatDate = (iso: string) =>
      new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    const initialsOf = (name: string) => (name || '').trim().slice(0, 1).toUpperCase() || '?'

    const netClass = computed(() => {
      if (!balanceDetail.value) return ''
      if (balanceDetail.value.direction === 'youOwe') return 'owe-amount'
      if (balanceDetail.value.direction === 'owedToYou') return 'owed-amount'
      return 'settled-amount'
    })

    const netText = computed(() => {
      const detail = balanceDetail.value
      if (!detail) return ''
      const amount = formatCurrency(Math.abs(detail.netAmount))
      if (detail.direction === 'youOwe') return `You owe ${detail.userName} ${amount}`
      if (detail.direction === 'owedToYou') return `${detail.userName} owes you ${amount}`
      return 'Settled up'
    })

    return {
      balanceDetail,
      isLoading,
      error,
      retry,
      formatCurrency,
      formatDate,
      initialsOf,
      netClass,
      netText
    }
  }
})
</script>

<style scoped>
.balance-detail {
  max-width: 760px;
  margin: 0 auto;
  padding: 32px 24px 56px;
  width: 100%;
  box-sizing: border-box;
}

.bd-back {
  display: inline-block;
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 13px;
  color: var(--ea-muted);
  text-decoration: none;
  margin-bottom: 20px;
}
.bd-back:hover { color: var(--ea-ink); }

.panel {
  background: var(--ea-surface);
  border: 1px solid var(--ea-border);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 18px;
}

.panel-title {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 16px;
  color: var(--ea-ink);
  margin: 0 0 16px;
}

/* ── Summary ── */
.bd-summary {
  display: flex;
  align-items: center;
  gap: 16px;
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
  flex-shrink: 0;
}
.person-avatar.large {
  width: 48px;
  height: 48px;
  font-size: 18px;
}

.bd-title {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 22px;
  color: var(--ea-ink);
  margin: 0 0 4px;
}

.bd-net {
  font-size: 14px;
  margin: 0;
  font-weight: 600;
}
.settled-amount { color: var(--ea-muted); }

/* ── History list ── */
.bd-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bd-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--ea-border);
}
.bd-entry:last-child { border-bottom: none; }

.bd-entry-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bd-entry-desc {
  font-size: 14px;
  font-weight: 600;
  color: var(--ea-ink);
}

.bd-entry-date {
  font-size: 12px;
  color: var(--ea-muted);
}

.amount {
  font-family: var(--ea-mono);
}

.bd-entry-amount {
  font-size: 14px;
  font-weight: 700;
}
.owe-amount { color: #dc2626; }
.owed-amount { color: var(--ea-emerald); }

/* ── Loading / error states ── */
.bd-state {
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
</style>
