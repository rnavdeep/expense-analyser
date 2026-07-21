<template>
  <div class="budget-settings">
    <header class="bs-header">
      <h1 class="bs-title">Budgets</h1>
      <p class="bs-subtitle">Set monthly spending limits per category</p>
    </header>

    <v-alert v-if="error" type="error" density="compact" class="bs-alert">{{ error }}</v-alert>

    <!-- ── Loading state (first load) ── -->
    <div v-if="isLoading && !rows.length" class="bs-state">
      <v-progress-circular indeterminate color="secondary" size="32" />
      <p class="state-msg">Loading budgets…</p>
    </div>

    <template v-else>
      <section class="panel">
        <ul v-if="rows.length" class="budget-list">
          <li v-for="row in rows" :key="row.category" class="budget-row" :class="`status-${statusOf(row)}`">
            <span class="budget-avatar" :style="{ background: categoryColor(row.category) }">{{
              row.category.charAt(0).toUpperCase()
            }}</span>
            <div class="budget-row-body">
              <div class="budget-row-main">
                <span class="budget-category">{{ row.category }}</span>
                <span class="budget-badge" :class="`badge-${statusOf(row)}`">{{ statusLabel(row) }}</span>
              </div>
              <span class="budget-hint"
                >{{ formatCurrency(row.spent) }} of {{ formatCurrency(row.monthlyLimit) }} spent</span
              >
              <div class="budget-progress-track">
                <div
                  class="budget-progress-fill"
                  :class="`fill-${statusOf(row)}`"
                  :style="{ width: progressPct(row) + '%' }"
                ></div>
              </div>
            </div>
            <div class="budget-row-actions">
              <v-text-field
                v-model.number="row.monthlyLimit"
                type="number"
                prefix="$"
                density="compact"
                hide-details
                class="budget-limit-field"
              ></v-text-field>
              <v-btn size="small" color="secondary" :disabled="isSaving" @click="save(row)">Save</v-btn>
            </div>
          </li>
        </ul>
        <p v-else class="state-msg">No budgets yet — add one below.</p>
      </section>

      <section class="panel">
        <h2 class="panel-title">Add budget</h2>
        <div class="add-budget-row">
          <span
            v-if="newCategory"
            class="budget-avatar avatar-preview"
            :style="{ background: categoryColor(newCategory) }"
            >{{ newCategory.charAt(0).toUpperCase() }}</span
          >
          <v-combobox
            v-model="newCategory"
            :items="categoryOptions"
            label="Category"
            density="compact"
            hide-details
            class="add-budget-category"
          ></v-combobox>
          <v-text-field
            v-model.number="newLimit"
            type="number"
            prefix="$"
            label="Monthly limit"
            density="compact"
            hide-details
            class="budget-limit-field"
            @keyup.enter="addBudget"
          ></v-text-field>
          <v-btn
            size="small"
            color="secondary"
            :disabled="!canAdd"
            :loading="isSaving"
            @click="addBudget"
            >Add budget</v-btn
          >
        </div>
        <p v-if="addHint" class="add-budget-hint">{{ addHint }}</p>
      </section>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useBudgetStore } from '../stores/Budget'
import { useDashboardStore } from '../stores/Dashboard'
import { CATEGORY_COLORS } from '../models/Dashboard'

interface BudgetRow {
  category: string
  monthlyLimit: number
  spent: number
}

export default defineComponent({
  name: 'eaBudgetSettings',
  setup() {
    const budgetStore = useBudgetStore()
    const dashboardStore = useDashboardStore()

    const { budgets, isLoading, isSaving, error } = storeToRefs(budgetStore)

    onMounted(() => budgetStore.LoadBudgets())

    // Editable copy so in-progress edits aren't clobbered by the reload SaveBudget triggers.
    const rows = reactive<BudgetRow[]>([])
    watch(
      budgets,
      (list) => rows.splice(0, rows.length, ...list.map((b) => ({ ...b }))),
      { immediate: true }
    )

    // Categories are free-text server-side — seed the combobox with labels already
    // seen on the dashboard, minus ones that already have a budget.
    const categoryOptions = computed(() => {
      const existing = new Set(rows.map((r) => r.category))
      const fromDashboard = dashboardStore.data?.categories.map((c) => c.label) ?? []
      return [...new Set(fromDashboard)].filter((label) => !existing.has(label))
    })

    const newCategory = ref('')
    const newLimit = ref<number | null>(null)

    const canAdd = computed(() => !!newCategory.value && !!newLimit.value && newLimit.value > 0)

    const formatCurrency = (n: number) =>
      n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

    // Deterministic color per category name so a category always gets the same
    // avatar color across renders (categories are free-text, so no id to key off).
    const categoryColor = (name: string) => {
      const hash = [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
      return CATEGORY_COLORS[hash % CATEGORY_COLORS.length]
    }

    const ratioOf = (row: BudgetRow) => (row.monthlyLimit > 0 ? row.spent / row.monthlyLimit : 0)

    const statusOf = (row: BudgetRow): 'over' | 'warn' | 'ok' => {
      const ratio = ratioOf(row)
      if (ratio >= 1) return 'over'
      if (ratio >= 0.8) return 'warn'
      return 'ok'
    }

    const statusLabel = (row: BudgetRow) =>
      ({ over: 'Over budget', warn: 'Near limit', ok: 'On track' })[statusOf(row)]

    // Capped at 100 — the bar shows how full the budget is, not how far over.
    const progressPct = (row: BudgetRow) => Math.min(ratioOf(row) * 100, 100)

    const addHint = computed(() => {
      if (canAdd.value) return ''
      if (!newCategory.value && !newLimit.value) return ''
      if (!newCategory.value) return 'Enter a category name to continue.'
      if (!newLimit.value || newLimit.value <= 0) return 'Enter a monthly limit greater than $0.'
      return ''
    })

    const save = (row: BudgetRow) =>
      budgetStore.SaveBudget({ category: row.category, monthlyLimit: row.monthlyLimit })

    const addBudget = async () => {
      if (!canAdd.value) return
      await budgetStore.SaveBudget({
        category: newCategory.value,
        monthlyLimit: newLimit.value as number
      })
      newCategory.value = ''
      newLimit.value = null
    }

    return {
      rows,
      isLoading,
      isSaving,
      error,
      categoryOptions,
      newCategory,
      newLimit,
      canAdd,
      formatCurrency,
      categoryColor,
      statusOf,
      statusLabel,
      progressPct,
      addHint,
      save,
      addBudget
    }
  }
})
</script>

<style scoped>
.budget-settings {
  max-width: 760px;
  margin: 0 auto;
  padding: 32px 24px 56px;
  width: 100%;
  box-sizing: border-box;
}

.bs-header {
  margin-bottom: 20px;
}

.bs-title {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 28px;
  letter-spacing: -0.02em;
  color: var(--ea-ink);
  margin: 0 0 4px;
}

.bs-subtitle {
  font-size: 14px;
  color: var(--ea-muted);
  margin: 0;
}

.bs-alert {
  margin-bottom: 16px;
}

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

/* ── Budget list ── */
.budget-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.budget-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--ea-border);
}
.budget-row:last-child {
  border-bottom: none;
}

/* ── Category avatar ── */
.budget-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: #fff;
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.budget-row-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.budget-row-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.budget-category {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 14px;
  color: var(--ea-ink);
}

.budget-badge {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.badge-ok {
  color: var(--ea-emerald);
  background: var(--ea-emerald-tint);
}
.badge-warn {
  color: #d97706;
  background: rgba(217, 119, 6, 0.12);
}
.badge-over {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.1);
}

.budget-hint {
  font-size: 12px;
  color: var(--ea-muted);
}

.budget-progress-track {
  height: 5px;
  border-radius: 999px;
  background: var(--ea-border);
  overflow: hidden;
}

.budget-progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.2s ease;
}
.fill-ok {
  background: var(--ea-emerald);
}
.fill-warn {
  background: #d97706;
}
.fill-over {
  background: #dc2626;
}

.budget-row-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.budget-limit-field {
  max-width: 140px;
}

/* ── Add budget ── */
.add-budget-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.add-budget-category {
  flex: 1;
}

.avatar-preview {
  flex-shrink: 0;
}

.add-budget-hint {
  font-size: 12px;
  color: var(--ea-muted);
  margin: 10px 0 0;
}

/* ── Loading state ── */
.bs-state {
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
</style>
