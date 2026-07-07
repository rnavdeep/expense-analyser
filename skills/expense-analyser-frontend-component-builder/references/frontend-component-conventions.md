# Frontend Component Conventions (expense-analyser)

## Architecture Pattern

- `src/components`: feature components with real UI logic.
- `src/views`: light wrappers that render a single feature component.
- `src/stores`: Pinia state/actions for feature behavior.
- `src/services`: axios API calls.
- `src/router/index.ts`: page route registration and auth guards.

## Required Test-First Flow

Before implementing a new feature, write tests for every changed layer:

1. Component test:
- `src/components/__tests__/<Feature>.spec.ts`

2. Store test:
- `src/stores/<Domain>/__tests__/index.spec.ts`

3. Service test:
- `src/services/__tests__/<Domain>Service.spec.ts`

Then implement service -> store -> component until tests pass.

## Existing Style Baseline

- UI library: Vuetify with MDI icons.
- Components primarily use Options API + `defineComponent` + `setup()`.
- Views typically use `<script setup lang="ts">` and only mount one component.
- Component names use `ea` prefix (examples: `eaExpenseCreate`, `eaLogin`, `eaNotifications`).

## Design System (post-redesign — REQUIRED for new UI)

The app has been redesigned (Phases 1–3). New components MUST match it, not the
pre-redesign Vuetify defaults. Source of truth:
`skills/redesign-expense-analyser/references/design-system.md`.

### Tokens — never hard-code colors/fonts

Use the CSS variables from `src/assets/base.css` in scoped styles. They have **dark-mode
values** (under `.v-theme--dark`), so reading tokens is what makes a component theme-correct
for free — a literal `#fff`/`#1a1d28` will break dark mode.

| Token | Use for |
|---|---|
| `--ea-ink` | headings / primary text |
| `--ea-muted` | secondary text |
| `--ea-surface` | card backgrounds |
| `--ea-paper` | page background |
| `--ea-border` | borders, dividers |
| `--ea-emerald` | accents, active state, icon-chip glyphs |
| `--ea-emerald-tint` / `--ea-emerald-tint-strong` | icon chips, subtle fills, hover |
| `--ea-nav` | always-dark surfaces (nav/hero) — does NOT flip in dark mode |
| `--ea-display` | Space Grotesk — headings, titles, nav |
| `--ea-mono` | Space Mono — amounts, codes, eyebrow labels |

### Vuetify theme colors (set in `src/main.ts` — use these, don't override)

- `color="primary"` → ink (`--ea-ink`) — primary/dark buttons.
- `color="secondary"` → emerald — **CTAs / "create" actions** (e.g. "New expense").
- `color="error"` / `color="success"` for those states.
- `VBtn`/`VTextField`/`VCard` defaults are already set (rounded `lg`, no text-transform,
  outlined comfortable fields, flat cards) — don't re-specify them per component.

### Page shell (global classes in `src/assets/main.css` — reuse, don't redefine)

Every authenticated page renders inside this shell:

```html
<div class="page">
  <header class="page-head">
    <div>
      <h1 class="page-title">My expenses</h1>
      <p class="page-sub">All your receipts, organised.</p>
    </div>
    <div class="head-actions"><!-- secondary CTA / actions --></div>
  </header>
  <!-- content -->
</div>
```

- `.page` (max-width 1100px, centered, gutters), `.page-head`, `.page-title`,
  `.page-sub`, and `.amount` are **global** — do not re-declare them in scoped styles.
- **Currency:** every monetary figure gets `class="amount"` (renders in the mono face),
  e.g. `<div class="ec-amount amount">${{ expense.amount }}</div>`.

### Reusable patterns (see `ExpenseList.vue`, `ExpenseCard.vue`, `Login.vue`)

- **Feature card:** `--ea-surface` bg, 1px `--ea-border`, ~16px radius, emerald-tint
  icon chip, optional hover lift (`translateY(-3px)` + shadow).
- **Auth card** (`.login-card`): centered, max-width 460px, 6px emerald top stripe —
  reuse for any login/register-style form.
- **Empty / loading state:** dashed-border `.empty-state` block with an emerald-tint
  `.empty-chip`, `.empty-title`, `.empty-sub`, and a CTA (pattern in `ExpenseList.vue`).
- **Icon-only buttons** need an `aria-label` (bell, hamburger, theme toggle precedent in
  `Navbar.vue`).

### Responsive

For breakpoint-dependent UI use Vuetify's `const { mobile } = useDisplay()`. When a
component calls `useDisplay()`, its spec MUST mock it (alongside `useTheme()` if used) —
see `Navbar.spec.ts`.

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
- Page shell: `<div class="page">` + `<header class="page-head">` (NOT `v-container` for
  full pages — the `.page` shell handles max-width/gutters; `v-row`/`v-col` or CSS grid
  inside it).
- Surfaces: `v-card` (flat, themed by defaults) or token-styled `<div>` cards.
- Forms: `v-form`, `v-text-field`, `v-select`, `v-btn` (`color="secondary"` for CTAs).
- Feedback: `v-alert`, `v-progress-circular`, `v-tooltip`.

Always prefer tokens + the shell over bare Vuetify defaults so light/dark both render
correctly — see the Design System section above.

## Routing Pattern

When adding pages:
1. Import view in `src/router/index.ts`.
2. Add route with `path`, `name`, `component`, and `meta`.
3. Use `meta.requiresLogin` for authenticated pages as appropriate.

## Quality Checklist

1. Tests exist for each touched layer (component, store, service).
2. Tests are executed and pass (`npx vitest run` or targeted run).
3. Component compiles with TypeScript.
4. No axios call is added directly in component when store/service already exists.
5. New imports resolve under Vite alias setup.
6. `npm run type-check` passes.
7. `npm run lint` passes for touched files.
8. Design system honored: page uses the `.page`/`.page-head` shell, amounts use
   `.amount`, colors/fonts come from `--ea-*` tokens or theme colors (no hard-coded
   hexes), CTAs use `color="secondary"`.
9. Renders correctly in BOTH light and dark themes (a consequence of #8).
10. Icon-only buttons have `aria-label`; `useDisplay()`/`useTheme()` are mocked in specs
    when used.
