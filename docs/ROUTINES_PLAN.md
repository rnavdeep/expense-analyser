# Routine Phase Plan — Settle-Up + Budgets (frontend)

This file drives an autonomous nightly cloud agent ("the runner"). Each run implements
exactly **one** unchecked phase below and opens a PR. Humans: review/merge the PR each
morning; edit specs here any time — the runner always reads this file fresh from `master`.

The backend counterpart lives in `rnavdeep/ExpenseApi` → `docs/ROUTINES_PLAN.md` (phases
B1–B5). Frontend and backend are decoupled by the fixed API contracts below; all frontend
tests mock axios, so never wait for a backend phase.

## Runner protocol

1. Check for open PRs whose branch starts with `routine/` (`git ls-remote origin 'refs/heads/routine/*'`
   and the GitHub API). If any routine PR is **open and unmerged: exit immediately, change nothing.**
   Merging is the human throttle.
2. Pick the **first unchecked phase** in the checklist below. If all are checked, exit without changes.
3. Create branch `routine/phase-<id>` off `master` (e.g. `routine/phase-f1`).
4. Implement the phase exactly as specified. Imitate the named pattern files closely —
   match their code style, comment density, naming, and test structure. Do not refactor
   unrelated code, do not implement more than one phase, do not "improve" other phases' specs.
5. Quality gates (all must pass):
   - `npm ci` then `npm run type-check`
   - `npm run lint` (note: it auto-fixes; commit any resulting fixes)
   - `npx vitest run` (there is **no** `npm test` script)
6. In the same branch, tick this phase's checkbox below (`- [ ]` → `- [x]`).
7. Commit (conventional commits, e.g. `feat(settlement): add service and store (phase F1)`),
   push, and open a PR titled `routine(F<id>): <phase title>`. PR body: what was built, how it
   was tested, any deviations from the spec and why. End the body with:
   `🤖 Generated with [Claude Code](https://claude.com/claude-code)`

## API contracts (fixed — must match ExpenseApi plan verbatim)

All wire shapes are camelCase JSON. Base URL comes from `import.meta.env.VITE_APP_API_URL`;
every request sends `withCredentials: true` (cookie auth). Amounts are numbers (dollars).

```
POST /Settlement                    body { payeeUserId: string, amount: number, note?: string }
  → 201 SettlementDto { id, payerUserId, payerUserName, payeeUserId, payeeUserName,
                        amount, note: string|null, createdAt: string /* ISO */ }

GET  /Settlement?pageNumber=&pageSize=
  → SettlementDto[]   (newest first; 404 when the user has none — treat as empty list)

GET  /Expense/balances              (existing endpoint; amounts become NET of settlements after B2)
  → { youOwe: BalanceEntryDto[], owedToYou: BalanceEntryDto[] }   // BalanceEntryDto = { userId, userName, amount }

GET  /Expense/balances/{userId}
  → BalanceDetailDto { userId, userName, netAmount: number,
                       direction: 'youOwe' | 'owedToYou' | 'settled',
                       entries: BalanceDetailEntryDto[] }
     BalanceDetailEntryDto = { type: 'expense' | 'settlement', id: string, description: string,
                               amount: number, direction: 'youOwe' | 'owedToYou', createdAt: string }

PUT  /Budget                        body { category: string, monthlyLimit: number }  (upsert)
  → BudgetDto { id: string, category: string, monthlyLimit: number }

GET  /Budget?period=month
  → BudgetStatusDto[] { category: string, monthlyLimit: number, spent: number }
     (404 when the user has no budgets — treat as empty list)
```

## Codebase orientation (read these before coding)

- Service pattern: `src/services/DashboardService.ts` — class with async PascalCase methods,
  default-exported singleton, uniform try/catch throwing `error.response?.data?.message`.
- Store pattern: `src/stores/Dashboard/index.ts` — Pinia **options** store, typed state
  interface, `isLoading`/`error` flags, module-level pure adapter functions (`toDashboardData`).
- Models: `src/models/Dashboard.ts` — `*Dto` interfaces = raw wire shapes; non-Dto = UI shapes.
- Service tests: `src/services/__tests__/DashboardService.spec.ts` — `vi.mock('axios')`, assert
  URL + `{ withCredentials: true }`, error paths via `axios.isAxiosError = () => true`.
- Component tests: `src/components/__tests__/Dashboard.spec.ts` — fresh Pinia per mount,
  `vi.mock('@/services/...')`, Vuetify/chart/router-link stubs, `flushPromises()`.
- Routing: `src/router/index.ts` — flat routes with `meta: { requiresLogin: true, title, description }`;
  nav items in the `navLinks` array in `src/components/Navbar.vue`.

## Phase checklist

- [x] **F1 — Settlement models, service, store**
- [x] **F2 — Settle-up dialog on the dashboard balances panel**
- [x] **F3 — Balance detail view (`/balances/:userId`)**
- [ ] **F4 — Budget models, service, store**
- [ ] **F5 — Budget settings page (`/budgets`)**
- [ ] **F6 — Dashboard budget progress widget**

---

### F1 — Settlement models, service, store

Create:
- `src/models/Settlement.ts` — `SettlementDto`, `CreateSettlementRequest`, `BalanceDetailDto`,
  `BalanceDetailEntryDto` interfaces exactly matching the contracts above (JSDoc header noting
  Dto = wire shape, mirroring the `src/models/Dashboard.ts` convention).
- `src/services/SettlementService.ts` — singleton class (pattern: `DashboardService.ts`) with:
  - `CreateSettlement(request: CreateSettlementRequest): Promise<SettlementDto>` → `POST {BASE}/Settlement`
  - `GetSettlements(pagination: Pagination): Promise<SettlementDto[]>` → `GET {BASE}/Settlement`
    with `params: { pageNumber, pageSize }` (reuse `src/models/Pagination.ts`); rethrow 404 as `new Error('404')`
    the way `ExpenseService.GetExpenses` does.
  - `GetBalanceDetail(userId: string): Promise<BalanceDetailDto>` → `GET {BASE}/Expense/balances/{userId}`
- `src/stores/Settlement/index.ts` — options store id `'Settlement'`: state
  `{ settlements: SettlementDto[], balanceDetail: BalanceDetailDto | null, isLoading, isSaving, error }`;
  actions `CreateSettlement` (returns the created dto, sets `isSaving`), `LoadSettlements`
  (swallows the `'404'` error into an empty list), `LoadBalanceDetail(userId)`.

Tests (mirror `DashboardService.spec.ts` and an existing store spec):
- `src/services/__tests__/SettlementService.spec.ts` — URL/params/withCredentials assertions,
  error-message path, 404 path for `GetSettlements`.
- `src/stores/Settlement/__tests__/index.spec.ts` — mock the service module's `default`;
  cover success, error message capture, and 404→empty-list behaviour.

Acceptance: all quality gates pass; no components changed in this phase.

### F2 — Settle-up dialog on the dashboard balances panel

Modify `src/components/Dashboard.vue`: in the balances panel, each "you owe" row gets a small
`Settle up` button (Vuetify `v-btn`, size small). Clicking opens a new component:

- `src/components/SettleUpDialog.vue` — `v-dialog` with the counterparty name, amount field
  prefilled with the row's net amount (editable, must be > 0 and ≤ net amount), optional note
  field, Cancel / Confirm. Confirm calls `useSettlementStore().CreateSettlement({ payeeUserId, amount, note })`,
  and on success emits `settled`, closing the dialog.
- `Dashboard.vue` listens for `settled` and calls `dashboardStore.LoadDashboard(period)` to
  refresh balances. Show a brief `v-snackbar` confirmation ("Settled up with <name>").
- Note: `BalanceEntry` in `src/models/Dashboard.ts` currently drops `userId` (only `name`/`amount`).
  Extend it with `userId` and thread it through the store adapter (`toDashboardData`) — update
  the existing dashboard specs accordingly.

Tests: `src/components/__tests__/SettleUpDialog.spec.ts` (validation, emit on success, error
display) and extend `Dashboard.spec.ts` (button renders per owe-row, dialog opens, refresh
called after `settled`). Follow the existing stub/mocking style exactly.

Acceptance: quality gates pass; settle-up flow works with mocked service; no other dashboard
behaviour changes.

### F3 — Balance detail view (`/balances/:userId`)

Create:
- `src/views/BalanceDetailView.vue` + `src/components/BalanceDetail.vue` — on mount, call
  `useSettlementStore().LoadBalanceDetail(route.params.userId)`. Render: header with the
  counterparty name and net amount ("You owe Sam $42" / "Sam owes you $18" / "Settled up"),
  then a chronological list (`v-list` or simple table) of `entries` — expenses vs settlements
  visually distinguished (icon `mdi-receipt-text` vs `mdi-cash-check`, settlements in green),
  each with description, date (use the existing date formatting seen in `ExpenseCard.vue` if any),
  and signed amount. Loading spinner + error state matching `Dashboard.vue`'s three-state pattern.
- Route in `src/router/index.ts`: path `/balances/:userId`, name `BalanceDetail`, lazy-loaded,
  `meta: { requiresLogin: true, title: 'Balance detail', description: 'History with a friend' }`.
- In `Dashboard.vue`, make each balances row (both directions) a `router-link` to its detail page.

Tests: `src/components/__tests__/BalanceDetail.spec.ts` — mocked store/service, renders both
entry types, error + loading states; extend `Dashboard.spec.ts` for the row links.

Acceptance: quality gates pass; no nav-bar changes (reachable from the dashboard only).

### F4 — Budget models, service, store

Create (mirror F1's structure):
- `src/models/Budget.ts` — `BudgetDto`, `BudgetStatusDto`, `UpsertBudgetRequest`.
- `src/services/BudgetService.ts` — singleton class:
  - `UpsertBudget(request: UpsertBudgetRequest): Promise<BudgetDto>` → `PUT {BASE}/Budget`
  - `GetBudgets(period: 'month'): Promise<BudgetStatusDto[]>` → `GET {BASE}/Budget?period=month`,
    404 → rethrow `new Error('404')`.
- `src/stores/Budget/index.ts` — options store id `'Budget'`: state
  `{ budgets: BudgetStatusDto[], isLoading, isSaving, error }`; actions `LoadBudgets`
  (404 → empty list), `SaveBudget` (upsert then reload). Getter `utilization` returning
  `(category) => spent / monthlyLimit` guarded against divide-by-zero.

Tests: service spec + store spec exactly as in F1.

Acceptance: quality gates pass; no components changed.

### F5 — Budget settings page (`/budgets`)

Create:
- `src/views/BudgetsView.vue` + `src/components/BudgetSettings.vue` — loads budgets via the
  store on mount. Lists each budget category with its monthly limit in an editable
  `v-text-field` (numeric, prefix `$`) and a per-row progress hint ("$120 of $300 spent").
  An "Add budget" row lets the user pick a category (`v-combobox` — free text allowed, seeded
  with the distinct category labels already present in `useDashboardStore().data?.categories`
  when available, since categories are free-text server-side) and a limit. Save buttons call
  `SaveBudget`; disable while `isSaving`; surface `error` in a `v-alert`.
- Route `/budgets`, name `Budgets`, lazy-loaded, `meta: { requiresLogin: true, title: 'Budgets', description: 'Set monthly spending limits' }`.
- Nav entry in `Navbar.vue` `navLinks`: `{ title: 'Budgets', to: '/budgets', icon: 'mdi-wallet-outline' }`
  placed after Expenses.

Tests: `src/components/__tests__/BudgetSettings.spec.ts` — renders rows from mocked store,
save calls the action with the edited value, add-budget flow, error state. Extend the Navbar
spec if one exists (check `src/components/__tests__`).

Acceptance: quality gates pass.

### F6 — Dashboard budget progress widget

Modify:
- `src/stores/Dashboard/index.ts` — `LoadDashboard` additionally fetches
  `BudgetService.GetBudgets('month')` in its existing `Promise.all` (catch 404 → `[]`, same
  style as the recent-expenses fetch). Extend `DashboardData` (in `src/models/Dashboard.ts`)
  with `budgets: BudgetStatusDto[]`.
- `src/components/Dashboard.vue` — new "Budgets" card (rendered only when `budgets.length > 0`,
  otherwise a subtle link "Set up budgets →" to `/budgets`): one row per budget with category
  label, `spent / limit` text, and a `v-progress-linear` — default color under 80%,
  amber (`warning`) ≥ 80%, red (`error`) ≥ 100% (cap the bar at 100%). Layout consistent with
  the existing dashboard cards.
- Budget alert notifications (created by backend phase B5) require **no new wiring**: the
  SignalR hub event already triggers `GetAllNotifications` and the Navbar bell badge. Do not
  touch the SignalR service.

Tests: extend `Dashboard.spec.ts` (widget renders thresholds/colors, empty state shows the
setup link) and the Dashboard store spec (budgets fetched and adapted, 404 tolerated).

Acceptance: quality gates pass; dashboard renders unchanged for users with no budgets apart
from the setup link.
