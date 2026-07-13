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
          <li v-for="row in rows" :key="row.category" class="budget-row">
            <div class="budget-row-main">
              <span class="budget-category">{{ row.category }}</span>
              <span class="budget-hint"
                >{{ formatCurrency(row.spent) }} of {{ formatCurrency(row.monthlyLimit) }} spent</span
              >
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
              <v-tooltip text="Delete budget" location="top">
                <template v-slot:activator="{ props }">
                  <v-icon
                    class="budget-delete"
                    color="secondary"
                    :disabled="isSaving"
                    v-bind="props"
                    @click="confirmDelete(row)"
                    >mdi-trash-can</v-icon
                  >
                </template>
              </v-tooltip>
            </div>
          </li>
        </ul>
        <p v-else class="state-msg">No budgets yet — add one below.</p>
      </section>

      <section class="panel">
        <h2 class="panel-title">Add budget</h2>
        <div class="add-budget-row">
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
      </section>
    </template>

    <v-dialog :model-value="!!deleteTarget" max-width="400" @update:model-value="(v) => !v && cancelDelete()">
      <v-card>
        <v-card-title>Delete budget</v-card-title>
        <v-card-text>
          Are you sure you want to delete the <strong>{{ deleteTarget?.category }}</strong> budget?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text="Cancel" @click="cancelDelete">Cancel</v-btn>
          <v-btn text="Delete" color="error" :loading="isSaving" @click="doDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useBudgetStore } from '../stores/Budget'
import { useDashboardStore } from '../stores/Dashboard'

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

    const deleteTarget = ref<BudgetRow | null>(null)
    const confirmDelete = (row: BudgetRow) => {
      deleteTarget.value = row
    }
    const cancelDelete = () => {
      deleteTarget.value = null
    }
    const doDelete = async () => {
      if (!deleteTarget.value) return
      try {
        await budgetStore.DeleteBudget(deleteTarget.value.category)
        deleteTarget.value = null
      } catch {
        // store.error already holds the message for display
      }
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
      save,
      addBudget,
      deleteTarget,
      confirmDelete,
      cancelDelete,
      doDelete
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
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--ea-border);
}
.budget-row:last-child {
  border-bottom: none;
}

.budget-row-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.budget-category {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 14px;
  color: var(--ea-ink);
}

.budget-hint {
  font-size: 12px;
  color: var(--ea-muted);
}

.budget-row-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.budget-limit-field {
  max-width: 140px;
}

.budget-delete {
  color: var(--ea-muted);
  cursor: pointer;
  transition: color 0.15s ease;
}
.budget-delete:hover {
  color: var(--ea-error, #dc2626);
}

/* ── Add budget ── */
.add-budget-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.add-budget-category {
  flex: 1;
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
