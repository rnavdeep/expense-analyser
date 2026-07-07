<!--
  Redesign-aligned feature component template.

  Matches the post-redesign conventions (see
  skills/.../references/frontend-component-conventions.md → "Design System"):
  - global `.page` / `.page-head` shell (defined in src/assets/main.css — do NOT redefine)
  - `--ea-*` tokens in scoped styles so light AND dark themes render correctly
  - `color="secondary"` (emerald) for CTAs, `color="primary"` (ink) for primary actions
  - amounts carry `class="amount"` to render in the mono face

  For an embedded (non-page) widget, drop the `.page`/`.page-head` wrapper and keep just
  the feature card + scoped styles.
-->
<template>
  <div class="page">
    <header class="page-head">
      <div>
        <h1 class="page-title">Feature Title</h1>
        <p class="page-sub">One line describing the page.</p>
      </div>
      <div class="head-actions">
        <v-btn color="secondary" size="large" prepend-icon="mdi-plus">New item</v-btn>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="isLoading" class="state-block">
      <v-progress-circular indeterminate color="secondary" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!items.length" class="empty-state">
      <div class="empty-chip"><v-icon>mdi-inbox-outline</v-icon></div>
      <h2 class="empty-title">Nothing here yet</h2>
      <p class="empty-sub">Create your first item to get started.</p>
      <v-btn color="secondary">New item</v-btn>
    </div>

    <!-- Content (token-styled feature card) -->
    <div v-else class="feature-card">
      <v-form @submit.prevent="onSubmit">
        <v-text-field v-model="formValue" label="Field" :rules="[rules.required]" />
        <div class="card-amount amount">${{ total }}</div>
        <v-btn type="submit" color="secondary" :loading="isLoading">Submit</v-btn>
      </v-form>

      <v-alert v-if="errorMessage" type="error" variant="tonal" class="mt-4">
        {{ errorMessage }}
      </v-alert>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
// import { useDomainStore } from '@/stores/Domain'

export default defineComponent({
  name: 'eaFeatureName',
  setup() {
    // const domainStore = useDomainStore()
    const formValue = ref('')
    const errorMessage = ref('')
    const isLoading = computed(() => false)
    const items = computed<unknown[]>(() => [])
    const total = computed(() => '0.00')

    const rules = {
      required: (value: string) => !!value || 'This field is required'
    }

    const onSubmit = async () => {
      try {
        errorMessage.value = ''
        // await domainStore.someAction(formValue.value)
      } catch (error) {
        errorMessage.value = 'Unable to complete request.'
      }
    }

    return {
      formValue,
      errorMessage,
      isLoading,
      items,
      total,
      rules,
      onSubmit
    }
  }
})
</script>

<style scoped>
/* .page / .page-head / .page-title / .page-sub / .amount are GLOBAL (main.css). */
.head-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Feature card — token-driven so it adapts to light/dark automatically. */
.feature-card {
  background: var(--ea-surface);
  border: 1px solid var(--ea-border);
  border-radius: 16px;
  padding: 24px;
}

.card-amount {
  font-size: 26px;
  color: var(--ea-ink);
  margin: 10px 0;
}

/* Loading + empty states (mirrors ExpenseList.vue). */
.state-block {
  display: flex;
  justify-content: center;
  padding: 64px 0;
}

.empty-state {
  text-align: center;
  padding: 56px 24px;
  border: 1px dashed var(--ea-border);
  border-radius: 16px;
  background: var(--ea-surface);
}

.empty-chip {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--ea-emerald-tint);
  color: var(--ea-emerald);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-title {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 20px;
  color: var(--ea-ink);
  margin-bottom: 6px;
}

.empty-sub {
  font-size: 14px;
  color: var(--ea-muted);
  margin-bottom: 20px;
}
</style>
