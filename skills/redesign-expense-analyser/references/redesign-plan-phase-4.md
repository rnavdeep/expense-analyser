# Redesign Plan — Phase 4: Dashboard as Authenticated Homescreen

**Expense Analyser · Vue 3 + Vuetify**
Based on `Wireframes.dc.html`, section **06 · New idea: Post-login dashboard**

---

## Context

Phases 1–3 restyled Home/auth/shell and consolidated nav into a single top bar. The new
`Wireframes.dc.html` (section 06) proposes that authenticated users land on a **data-rich
`/dashboard`** instead of the marketing Home page, which currently shows no data after login.

This phase builds that dashboard: a greeting, a 4-card KPI strip, a monthly-spending bar chart, a
spending-by-category donut, a recent-expenses mini list, and an outstanding-balances panel.

**Confirmed decisions:**
- **Data:** all data comes from a local **seed module** this phase (the backend has no summary/
  monthly/balances endpoints and `ExpenseListDataDto` has no `category` field). Each seed block
  carries an inline `// API NOTE:` documenting the real endpoint we'd need to replace it.
- **Charts:** `vue-chartjs` + `chart.js`.
- **Routing:** login lands on `/dashboard`; authenticated visits to `/` redirect there. Home stays the
  public marketing page for logged-out users.

## Wireframe reference

`skills/redesign-expense-analyser/assets/mockups/Wireframes.dc.html`, section 06 (lines ~519–719).
Layout top→bottom: nav → greeting + period toggle (This month / 3 months / Year) → 4 KPI cards →
charts row (bar 1.6fr / donut 1fr) → bottom row (recent expenses 1fr / outstanding balances 1fr).
KPI accent stripes: Total spent = ink, You owe = red, Owed to you = emerald, Receipts scanned = indigo.

---

## Implementation

### 1. Install chart deps
```
npm i vue-chartjs chart.js
```

### 2. Seed data module — `src/data/dashboardSeed.ts` (new)

Single source of truth, shaped to match what real endpoints would return so the swap-out is a one-line
change later. Each block gets a TS interface and an `// API NOTE:` comment above it:

- `kpis` — `{ totalSpent, youOwe, owedToYou, receiptsScanned }` + deltas/subtexts.
  `// API NOTE: GET /Expense/summary?period= → category-tagged amount + count aggregation`
- `monthly` — 6 entries `{ label: 'Jan', amount }`, last = current month (highlighted bar).
  `// API NOTE: GET /Expense/monthly?months=6 → SUM(amount) GROUP BY month from CreatedAt`
- `categories` — `{ label, amount, color }[]` for donut.
  `// API NOTE: requires a category field on Expense (not present today) + GET /Expense/summary breakdown`
- `recent` — 4 `ExpenseListDataDto`-shaped rows.
  `// API NOTE: existing ExpenseService.GetExpenses(new Pagination(1,4), new SortFilter('CreatedAt', false), null)`
- `balances` — `{ youOwe: {name, amount}[], owedToYou: {name, amount}[] }`.
  `// API NOTE: GET /sharedExpenses/balances (flagged missing in wireframe) — aggregate UserAssignedDto.userAmount per user`

Reuse `ExpenseListDataDto` from `src/models/ExpenseCreateForm.ts` for the `recent` rows.

### 3. Chart components — `src/components/dashboard/`

- `MonthlyBarChart.vue` — `<Bar>` from vue-chartjs. Bars in `--ea-border` grey, current month in
  `--ea-ink`. Props: `data: {label, amount}[]`.
- `CategoryDonut.vue` — `<Doughnut>` from vue-chartjs, `cutout: '68%'`, side legend. Colors from seed
  (ink / emerald / indigo `#6a7adf` / amber `#d97706`). Props: `data: {label, amount, color}[]`.
- `chartSetup.ts` (optional shared) — `ChartJS.register(...)` for Bar/Doughnut, CategoryScale,
  LinearScale, BarElement, ArcElement, Tooltip, Legend.

### 4. Dashboard component — `src/components/Dashboard.vue` (new)

Follow the existing component→view pattern (`Home.vue` ↔ `HomeView.vue`). Sections:
- **Greeting**: "Good morning, {userName} 👋" using `authStore.userName`; time-of-day word from
  `new Date().getHours()`.
- **Period toggle**: `v-btn-toggle` (This month / 3 months / Year); re-slices seed arrays this phase.
  `// API NOTE: period param feeds all summary endpoints`
- **KPI strip**: 4 `v-card`s, `grid-template-columns: repeat(4,1fr)`, top accent stripe via inline
  `border-top` in the four token colors. Amounts in `--ea-mono`.
- **Charts row**: grid `1.6fr 1fr` → `MonthlyBarChart` + `CategoryDonut`.
- **Bottom row**: grid `1fr 1fr` → recent expenses mini-list (icon tile + title/date + amount,
  "View all" → `/myExpenses`) and outstanding balances (red "You owe" rows / emerald "Owed to you"
  rows, "View all" → `/sharedExpenses`).

Style with existing tokens only (`--ea-surface`, `--ea-border`, `--ea-emerald`, `--ea-ink`,
`--ea-muted`, `--ea-display`, `--ea-mono`). Responsive: stack to 1 column under ~900px.

### 5. View wrapper — `src/views/DashboardView.vue` (new)

Mirror `HomeView.vue`: render `<Dashboard />`.

### 6. Router — `src/router/index.ts`

- Add: `{ path: '/dashboard', name: 'Dashboard', component: () => import('../views/DashboardView.vue'), meta: { requiresLogin: true } }`.
- In `router.beforeEach`, after the session check: if `to.name === 'home'` and
  `authStore.isAuthenticated`, `next({ name: 'Dashboard' })`. Keep existing branches intact.

### 7. Post-login redirect — `src/components/Login.vue`

Change post-login `router.push('/')` (~line 111) to `router.push('/dashboard')`.

### 8. Navbar — `src/components/Navbar.vue`

Add as first `navLinks` entry (~line 135):
`{ title: 'Dashboard', to: '/dashboard', icon: 'mdi-view-dashboard' }`.

---

## Critical files

| File | Change |
|---|---|
| `src/data/dashboardSeed.ts` | **new** — seed data + API notes |
| `src/components/dashboard/MonthlyBarChart.vue` | **new** — vue-chartjs Bar |
| `src/components/dashboard/CategoryDonut.vue` | **new** — vue-chartjs Doughnut |
| `src/components/dashboard/chartSetup.ts` | **new** (optional) — ChartJS.register |
| `src/components/Dashboard.vue` | **new** — page composition |
| `src/views/DashboardView.vue` | **new** — view wrapper |
| `src/router/index.ts` | route + `/`→`/dashboard` redirect for authed users |
| `src/components/Login.vue` | redirect to `/dashboard` |
| `src/components/Navbar.vue` | add Dashboard nav link |
| `package.json` | add `vue-chartjs`, `chart.js` |

## Reuse

- `ExpenseListDataDto` (`src/models/ExpenseCreateForm.ts`) for seed `recent` rows.
- `authStore.userName` / `isAuthenticated` (`src/stores/Auth/index.ts`) for greeting + guard.
- Design tokens in `src/assets/base.css`; Vuetify defaults in `src/main.ts`.
- Component↔View pattern from `Home.vue` / `HomeView.vue`.

## Tests

Follow existing Vitest patterns (`src/components/__tests__/`, mirror Home/Navbar specs):
- `Dashboard.spec.ts` — mounts; renders 4 KPI cards; greeting uses mocked `authStore.userName`;
  recent list shows 4 rows; "View all" links target `/myExpenses` and `/sharedExpenses`. Stub chart
  child components / chart.js to avoid canvas rendering in jsdom.
- Update `Navbar` spec to expect the new Dashboard link.

## Verification

1. `npm run dev` — no build/type errors.
2. Log in → lands on `/dashboard`; visiting `/` while logged in redirects to `/dashboard`.
3. Log out → `/` shows the public Home marketing page (unchanged).
4. Dashboard shows greeting with username, 4 KPI cards with colored top stripes, 6-bar monthly chart
   (last bar highlighted), category donut with legend, 4 recent expenses, balances panel.
5. "View all" links navigate to `/myExpenses` and `/sharedExpenses`; Dashboard nav link is active.
6. Resize narrow → sections stack to a single column.
7. `npm run test:unit` — Dashboard + updated Navbar specs pass.
8. Each seed block in `dashboardSeed.ts` carries an `// API NOTE:` for its future endpoint.
