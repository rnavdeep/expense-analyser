# Frontend Component Conventions (expense-analyser)

## Architecture Pattern

- `src/components`: feature components with real UI logic.
- `src/views`: light wrappers that render a single feature component.
- `src/stores`: Pinia state/actions for feature behavior.
- `src/services`: axios API calls.
- `src/router/index.ts`: page route registration and auth guards.

## Existing Style Baseline

- UI library: Vuetify with MDI icons.
- Components primarily use Options API + `defineComponent` + `setup()`.
- Views typically use `<script setup lang="ts">` and only mount one component.
- Component names use `ea` prefix (examples: `eaExpenseCreate`, `eaLogin`, `eaNotifications`).

## Component Decision Rules

1. Create only `src/components/<Feature>.vue` when feature is embedded in an existing page.
2. Create `src/components/<Feature>.vue` + `src/views/<Feature>View.vue` + router entry when feature is a new page.
3. Update store/service/model files when the component requires new data flow or API calls.

## Store Interaction Pattern

- Get store instance in `setup()`:
  - `const expenseStore = useExpenseStore()`
- Keep page state in `ref`.
- Expose store-backed values through `computed`.
- Trigger async store actions in handlers or lifecycle hooks (`onMounted`).

## Vuetify Usage Pattern

Frequent blocks in current code:
- Layout: `v-container`, `v-row`, `v-col`
- Surfaces: `v-card`, `v-card-title`, `v-card-text`, `v-card-actions`
- Forms: `v-form`, `v-text-field`, `v-select`, `v-btn`
- Feedback: `v-alert`, `v-progress-circular`, `v-tooltip`

## Routing Pattern

When adding pages:
1. Import view in `src/router/index.ts`.
2. Add route with `path`, `name`, `component`, and `meta`.
3. Use `meta.requiresLogin` for authenticated pages as appropriate.

## Quality Checklist

1. Component compiles with TypeScript.
2. No axios call is added directly in component when store/service already exists.
3. New imports resolve under Vite alias setup.
4. `npm run type-check` passes.
5. `npm run lint` passes for touched files.
