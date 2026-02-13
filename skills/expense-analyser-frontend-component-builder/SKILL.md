---
name: expense-analyser-frontend-component-builder
description: Create or update frontend components in the expense-analyser Vue application. Use when building new UI features, pages, or reusable widgets and you need to follow this project's existing architecture across src/components, src/views, src/stores, src/services, src/router, and Vuetify-based styling patterns.
---

# Expense Analyser Frontend Component Builder

Build frontend features that match the current repo conventions:
- Reusable UI in `src/components`
- Thin page wrappers in `src/views`
- Data/state logic in Pinia stores (`src/stores`)
- API logic in services (`src/services`)
- Route entries in `src/router/index.ts` for new pages

Read `references/frontend-component-conventions.md` before implementation.

Use templates from `assets/component-options-template.vue` and `assets/view-wrapper-template.vue` when bootstrapping files.

## Workflow

1. Decide scope first.
- Add only a component when UI is embedded in an existing page.
- Add both component + view when creating a new route/page.

2. Place files in the correct layer.
- `src/components/<Feature>.vue` for feature UI.
- `src/views/<Feature>View.vue` as route wrapper.
- `src/stores/<Domain>/index.ts` for actions/state needed by UI.
- `src/models` for form/request/response types.

3. Follow existing component style.
- Prefer Vuetify primitives (`v-container`, `v-row`, `v-col`, `v-card`, `v-form`, `v-btn`, `v-alert`).
- Use `defineComponent` with TypeScript in components.
- Keep component names in `ea*` style to match current usage.
- Keep local styles `scoped` unless intentionally global.

4. Keep data flow architecture-safe.
- Use stores for stateful logic and async actions.
- Keep API calls in `src/services`, not inside components.
- Use `computed` for store-derived state and `ref` for local form/UI state.

5. Add route only when needed.
- Register new page routes in `src/router/index.ts`.
- Add route meta fields following current pattern (`title`, `description`, guards).

6. Validate.
- Run `npm run type-check`.
- Run `npm run lint`.
- Confirm component imports resolve and route navigation works.

## Guardrails

- Preserve path aliases and imports (`@/stores`, `@/models`, `@/services`) where already used.
- Keep views minimal wrappers when no page-level logic is required.
- Avoid broad style refactors while adding a single component.
- Do not introduce new state libraries or component frameworks.
