<template>
  <div class="category-settings">
    <header class="cs-header">
      <div class="cs-header-top">
        <div>
          <h1 class="cs-title">Categories</h1>
          <p class="cs-subtitle">{{ summaryLine }}</p>
        </div>
        <v-btn size="small" color="secondary" @click="openNewCategoryDialog">+ New category</v-btn>
      </div>
    </header>

    <v-alert v-if="error" type="error" density="compact" class="cs-alert">{{ error }}</v-alert>

    <!-- ── Loading state (first load) ── -->
    <div v-if="isLoading && !rows.length" class="cs-state">
      <v-progress-circular indeterminate color="secondary" size="32" />
      <p class="state-msg">Loading categories…</p>
    </div>

    <template v-else>
      <div v-if="rows.length" class="cs-distribution">
        <div class="cs-distribution-bar">
          <div
            v-for="row in rows"
            :key="row.id"
            class="cs-distribution-segment"
            :style="{ width: segmentPct(row) + '%', background: categoryColor(row.name) }"
          ></div>
        </div>
        <ul class="cs-legend">
          <li v-for="row in rows" :key="row.id" class="cs-legend-item">
            <span class="cs-legend-swatch" :style="{ background: categoryColor(row.name) }"></span>
            <span class="cs-legend-label">{{ row.name }}</span>
            <span class="cs-legend-amount">{{ formatCurrency(row.monthlyLimit) }}</span>
          </li>
        </ul>
      </div>

      <section class="panel">
        <ul v-if="rows.length" class="category-list">
          <li v-for="row in rows" :key="row.id" class="category-row" :class="`status-${statusOf(row)}`">
            <span class="category-avatar" :style="{ background: categoryColor(row.name) }">{{
              row.name.charAt(0).toUpperCase()
            }}</span>
            <div class="category-row-body">
              <div class="category-row-main">
                <span class="category-name">{{ row.name }}</span>
                <span class="category-badge" :class="`badge-${statusOf(row)}`">{{ statusLabel(row) }}</span>
              </div>
              <span class="category-hint"
                >{{ formatCurrency(row.spent) }} of {{ formatCurrency(row.monthlyLimit) }} spent</span
              >
              <div class="category-progress-track">
                <div
                  class="category-progress-fill"
                  :class="`fill-${statusOf(row)}`"
                  :style="{ width: progressPct(row) + '%' }"
                ></div>
              </div>
            </div>
            <div class="category-row-actions">
              <v-tooltip text="Edit category" location="top">
                <template v-slot:activator="{ props }">
                  <v-icon class="category-row-edit" v-bind="props" @click="openEditCategoryDialog(row)"
                    >mdi-pencil</v-icon
                  >
                </template>
              </v-tooltip>
              <button
                class="category-row-delete"
                type="button"
                aria-label="Delete category"
                @click="confirmDelete(row)"
              >
                ×
              </button>
            </div>
          </li>
        </ul>
        <p v-else class="state-msg">No categories yet — add one to get started.</p>
      </section>
    </template>

    <!-- ── New/Edit category dialog (shared) ── -->
    <v-dialog v-model="categoryDialogOpen" max-width="480">
      <v-card>
        <v-card-title>{{ dialogMode === 'edit' ? 'Edit category' : 'New category' }}</v-card-title>
        <v-card-text>
          <v-combobox
            v-model="newCategoryName"
            :items="categoryOptions"
            :disabled="dialogMode === 'edit'"
            label="Category"
            density="compact"
            hide-details
            class="dialog-field"
          ></v-combobox>

          <div v-if="newCategoryName" class="linked-expenses">
            <p v-if="isLoadingPreview" class="state-msg">Loading…</p>
            <p v-else-if="!linkedExpenses.length" class="state-msg">No expenses yet in this category.</p>
            <ul v-else class="linked-expenses-list">
              <li v-for="exp in linkedExpenses" :key="exp.id">
                <span>{{ exp.title }}</span>
                <span>{{ formatCurrency(exp.amount) }}</span>
              </li>
            </ul>
          </div>

          <v-text-field
            v-model.number="newLimit"
            type="number"
            prefix="$"
            label="Monthly limit"
            density="compact"
            hide-details
            hide-spin-buttons
            class="dialog-field"
            @keyup.enter="submitCategory"
          ></v-text-field>
          <p v-if="addHint" class="add-category-hint">{{ addHint }}</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeCategoryDialog">Cancel</v-btn>
          <v-btn color="secondary" :disabled="!canAdd" :loading="isSaving" @click="submitCategory">{{
            dialogMode === 'edit' ? 'Save changes' : 'Create category'
          }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ── Delete confirm dialog ── -->
    <v-dialog v-model="deleteDialogOpen" max-width="420">
      <v-card>
        <v-card-title>Delete "{{ rowPendingDelete?.name }}" category?</v-card-title>
        <v-card-text> This removes the monthly limit. Expenses in this category stay untouched. </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteDialogOpen = false">Cancel</v-btn>
          <v-btn color="error" :loading="isSaving" @click="performDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoryStore } from '../stores/Category'
import { useDashboardStore } from '../stores/Dashboard'
import { CATEGORY_COLORS } from '../models/Dashboard'
import CategoryService from '../services/CategoryService'
import type { CategoryExpenseDto } from '../models/Category'

interface CategoryRow {
  id: string
  name: string
  monthlyLimit: number
  spent: number
}

export default defineComponent({
  name: 'eaCategorySettings',
  setup() {
    const categoryStore = useCategoryStore()
    const dashboardStore = useDashboardStore()

    const { categories, isLoading, isSaving, error } = storeToRefs(categoryStore)

    onMounted(() => categoryStore.LoadCategories())

    // Editable copy so in-progress edits aren't clobbered by the reload SaveCategory triggers.
    const rows = reactive<CategoryRow[]>([])
    watch(
      categories,
      (list) => rows.splice(0, rows.length, ...list.map((c) => ({ ...c }))),
      { immediate: true }
    )

    // Categories are free-text server-side — seed the combobox with labels already
    // seen on the dashboard, minus ones that already exist here.
    const categoryOptions = computed(() => {
      const existing = new Set(rows.map((r) => r.name))
      const fromDashboard = dashboardStore.data?.categories.map((c) => c.label) ?? []
      return [...new Set(fromDashboard)].filter((label) => !existing.has(label))
    })

    const newCategoryName = ref('')
    const newLimit = ref<number | null>(null)

    const canAdd = computed(() => !!newCategoryName.value && !!newLimit.value && newLimit.value > 0)

    const formatCurrency = (n: number) =>
      n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

    // Deterministic color per category name so a category always gets the same
    // avatar color across renders (categories are free-text, so no id to key off).
    const categoryColor = (name: string) => {
      const hash = [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
      return CATEGORY_COLORS[hash % CATEGORY_COLORS.length]
    }

    const ratioOf = (row: CategoryRow) => (row.monthlyLimit > 0 ? row.spent / row.monthlyLimit : 0)

    const statusOf = (row: CategoryRow): 'over' | 'warn' | 'ok' => {
      const ratio = ratioOf(row)
      if (ratio >= 1) return 'over'
      if (ratio >= 0.8) return 'warn'
      return 'ok'
    }

    const statusLabel = (row: CategoryRow) =>
      ({ over: 'OVER BUDGET', warn: 'CLOSE TO LIMIT', ok: 'ON TRACK' })[statusOf(row)]

    // Capped at 100 — the bar shows how full the limit is, not how far over.
    const progressPct = (row: CategoryRow) => Math.min(ratioOf(row) * 100, 100)

    // Distribution bar/legend show each category's share of total budgeted (limit), not spend —
    // spend can be zero or wildly over, which would make the bar meaningless as an allocation view.
    const totalMonthlyLimit = computed(() => rows.reduce((sum, r) => sum + r.monthlyLimit, 0))
    const segmentPct = (row: CategoryRow) =>
      totalMonthlyLimit.value > 0 ? (row.monthlyLimit / totalMonthlyLimit.value) * 100 : 0

    const summaryLine = computed(() => {
      const count = rows.length
      const overCount = rows.filter((r) => statusOf(r) === 'over').length
      const categoryWord = count === 1 ? 'category' : 'categories'
      return `${count} ${categoryWord} · ${overCount} over budget`
    })

    const addHint = computed(() => {
      if (canAdd.value) return ''
      if (!newCategoryName.value && !newLimit.value) return ''
      if (!newCategoryName.value) return 'Enter a category name to continue.'
      if (!newLimit.value || newLimit.value <= 0) return 'Enter a monthly limit greater than $0.'
      return ''
    })

    // ── New/Edit category dialog (one dialog, two modes — upsert is keyed by name
    // server-side, so editing just re-submits the same name with a new limit) ──
    const categoryDialogOpen = ref(false)
    const dialogMode = ref<'create' | 'edit'>('create')
    const linkedExpenses = ref<CategoryExpenseDto[]>([])
    const isLoadingPreview = ref(false)

    const openNewCategoryDialog = () => {
      dialogMode.value = 'create'
      newCategoryName.value = ''
      newLimit.value = null
      linkedExpenses.value = []
      categoryDialogOpen.value = true
    }

    const openEditCategoryDialog = (row: CategoryRow) => {
      dialogMode.value = 'edit'
      newCategoryName.value = row.name
      newLimit.value = row.monthlyLimit
      categoryDialogOpen.value = true
    }

    const closeCategoryDialog = () => {
      categoryDialogOpen.value = false
    }

    // Preview the category's recent expenses as soon as one is picked, before the limit is set.
    watch(newCategoryName, async (name) => {
      if (!name) {
        linkedExpenses.value = []
        return
      }
      isLoadingPreview.value = true
      try {
        linkedExpenses.value = await CategoryService.GetCategoryExpenses(name)
      } catch {
        linkedExpenses.value = []
      } finally {
        isLoadingPreview.value = false
      }
    })

    const submitCategory = async () => {
      if (!canAdd.value) return
      await categoryStore.SaveCategory({
        name: newCategoryName.value,
        monthlyLimit: newLimit.value as number
      })
      newCategoryName.value = ''
      newLimit.value = null
      closeCategoryDialog()
    }

    // ── Delete confirm dialog ──
    const deleteDialogOpen = ref(false)
    const rowPendingDelete = ref<CategoryRow | null>(null)

    const confirmDelete = (row: CategoryRow) => {
      rowPendingDelete.value = row
      deleteDialogOpen.value = true
    }

    const performDelete = async () => {
      if (!rowPendingDelete.value) return
      await categoryStore.DeleteCategory(rowPendingDelete.value.id)
      deleteDialogOpen.value = false
      rowPendingDelete.value = null
    }

    return {
      rows,
      isLoading,
      isSaving,
      error,
      categoryOptions,
      newCategoryName,
      newLimit,
      canAdd,
      formatCurrency,
      categoryColor,
      statusOf,
      statusLabel,
      progressPct,
      segmentPct,
      summaryLine,
      addHint,
      submitCategory,
      categoryDialogOpen,
      dialogMode,
      linkedExpenses,
      isLoadingPreview,
      openNewCategoryDialog,
      openEditCategoryDialog,
      closeCategoryDialog,
      deleteDialogOpen,
      rowPendingDelete,
      confirmDelete,
      performDelete
    }
  }
})
</script>

<style scoped>
.category-settings {
  max-width: 760px;
  margin: 0 auto;
  padding: 32px 24px 56px;
  width: 100%;
  box-sizing: border-box;
}

.cs-header {
  margin-bottom: 20px;
}

.cs-header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.cs-title {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 28px;
  letter-spacing: -0.02em;
  color: var(--ea-ink);
  margin: 0 0 4px;
}

.cs-subtitle {
  font-size: 14px;
  color: var(--ea-muted);
  margin: 0;
}

.cs-alert {
  margin-bottom: 16px;
}

/* ── Distribution bar + legend ── */
.cs-distribution {
  margin-bottom: 18px;
}

.cs-distribution-bar {
  display: flex;
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--ea-border);
}

.cs-distribution-segment {
  height: 100%;
}

.cs-legend {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 10px 0 0;
  padding: 0;
}

.cs-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--ea-muted);
}

.cs-legend-swatch {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.cs-legend-label {
  color: var(--ea-ink);
  font-weight: 600;
}

.panel {
  background: var(--ea-surface);
  border: 1px solid var(--ea-border);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 18px;
}

/* ── Category list ── */
.category-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.category-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--ea-border);
}
.category-row:last-child {
  border-bottom: none;
}

/* ── Category avatar ── */
.category-avatar {
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

.category-row-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-row-main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-name {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 14px;
  color: var(--ea-ink);
}

.category-badge {
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

.category-hint {
  font-size: 12px;
  color: var(--ea-muted);
}

.category-progress-track {
  height: 5px;
  border-radius: 999px;
  background: var(--ea-border);
  overflow: hidden;
}

.category-progress-fill {
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

.category-row-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.category-row-edit {
  color: var(--ea-muted);
  cursor: pointer;
  transition: color 0.15s ease;
}
.category-row-edit:hover {
  color: var(--ea-emerald);
}

.category-row-delete {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid var(--ea-border);
  background: transparent;
  color: var(--ea-muted);
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.category-row-delete:hover {
  border-color: #dc2626;
  color: #dc2626;
}

/* ── New category dialog ── */
.dialog-field {
  margin-bottom: 14px;
}

.linked-expenses {
  margin: -6px 0 14px;
}

.linked-expenses-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid var(--ea-border);
  border-radius: 8px;
  overflow: hidden;
}

.linked-expenses-list li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 10px;
  font-size: 12px;
  color: var(--ea-muted);
  border-bottom: 1px dashed var(--ea-border);
}
.linked-expenses-list li:last-child {
  border-bottom: none;
}

.add-category-hint {
  font-size: 12px;
  color: var(--ea-muted);
  margin: 10px 0 0;
}

/* ── Loading state ── */
.cs-state {
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
