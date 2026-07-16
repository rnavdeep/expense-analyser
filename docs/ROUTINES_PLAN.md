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

GET  /Friends/getFriends            (existing endpoint; gains a field in phase B6)
  → FriendDto[] { userId: string, username: string, acceptedAt: string /* ISO */, sharedExpenses: ExpenseDto[] }

POST /Expense/{id}/addUser?userId=  (existing endpoint; after B7 rejects non-friends)
     400 "Users must be friends before sharing an expense." when the caller and {userId}
     have no accepted FriendRequest row between them.
```

## Line-item assignment (phases F8–F10 / backend B8–B10)

Feature: on the Document Results page, each OCR'd line item gets an "Assigned to" chip
(avatar-stack + name(s)) that opens a checklist of the current user's friends to multi-select
who that item is split between. The Expenses/Shared-Expenses row's "Shared with" section then
displays per-person totals *derived* from those assignments — no separate manual add/edit-share
step remains once an expense has at least one scanned line item. Design reference:
`docs/Line Item User Assignment (standalone).html` — a compressed dc-runtime wireframe bundle;
the real markup is JSON-encoded inside a `<script type="__bundler/template">` tag, extract and
`json.loads()` it to view (do not try to read the file directly, it's 400KB+ of mostly base64
font/bundler data). Confirmed product rules (mirror the backend plan verbatim):

- Every line item always has ≥1 assignee; unchecking the sole remaining assignee must be
  blocked client-side (disable the checkbox, matching the server's 400).
- Split is even per line item only — no custom %/amount UI.
- Only friends are assignable (source: `friendsStore.getDropdownUsers()`, already used by
  `ExpenseRow.vue`/`AssignUsers.vue`).
- "Assign all items to X" is additive only.
- Expenses with no line items keep the existing manual add/remove/edit-shares flow in
  `ExpenseRow.vue` completely unchanged — the new UI is conditional on the expense having ≥1
  line item (signalled by `totalItemsCount != null` on its assigned users, see contract below).

New API contracts (fixed — must match the ExpenseApi plan verbatim):

```
GET  /Expense/{expenseId}/doc/{docId}          (existing; response gains `lineItems`)
  → existing response shape, unchanged, plus:
     lineItems: LineItemDto[]
     LineItemDto { id: string, description: string | null, quantity: string | null,
                   amount: number | null, sortOrder: number, assignees: LineItemAssigneeDto[] }
     LineItemAssigneeDto = { userId: string, userName: string }

PUT  /Expense/lineItem/{lineItemId}/assignees/{userId}
  → 200 LineItemDto

DELETE /Expense/lineItem/{lineItemId}/assignees/{userId}
  → 200 LineItemDto
     400 "Cannot remove the last remaining assignee from a line item." when this would leave
         zero assignees

PUT  /Expense/{expenseId}/lineItems/assignAll/{userId}
  → 200 LineItemDto[]   (additive only — never removes existing assignees on any item)

GET  /Expense/{id}/getAssignedUsers   (existing; ExpenseUserDto/UserAssignedDto gain two fields)
  → UserAssignedDto[] { ...existing fields, itemsAssignedCount: number | null,
                        totalItemsCount: number | null }
     Both null when the expense has zero line items; otherwise itemsAssignedCount = how many of
     the expense's line items this user is on, totalItemsCount = the expense's line item count.

POST /Expense/{id}/addUser?userId=       (existing; after backend B9 all three reject with 400
DELETE /Expense/{id}/removeUser/{userId}  "This expense's sharing is managed by line-item
PUT  /Expense/{id}/updateShares           assignment — use the Document Results page instead."
                                           once the target expense has any line item)
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
- Document Results page: `src/components/DocumentResultPage.vue` (route `/docResults`, no
  params — expense/document chosen via in-page `v-select`s, then `expenseStore.GetDocResults`).
  Line items today render via a fully dynamic Vuetify `v-data-table` off JSON parsed from the
  response — no stable row id existed before phase F8/backend B8-B9 added one.
  Avatar-initial convention: `.friend-avatar` CSS class in `FriendsList.vue`/`FriendsAdd.vue`
  (`username.charAt(0).toUpperCase()` in a colored circle) — reuse this styling, there is no
  shared component for it yet.

## Phase checklist

- [x] **F1 — Settlement models, service, store**
- [x] **F2 — Settle-up dialog on the dashboard balances panel**
- [x] **F3 — Balance detail view (`/balances/:userId`)**
- [x] **F4 — Budget models, service, store**
- [x] **F5 — Budget settings page (`/budgets`)**
- [x] **F6 — Dashboard budget progress widget**
- [x] **F7 — Friends list links to balance/expense history (`/balances/:userId`)**
- [ ] **F8 — Line-item models, service, store additions**
- [ ] **F9 — LineItemAssigneeChip component + wire into DocumentResultPage.vue**
- [ ] **F10 — ExpenseRow.vue derived "shared with" display**

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

### F7 — Friends list links to balance/expense history (`/balances/:userId`)

Context: the dashboard balances panel (F3) only shows counterparties with a non-zero net
balance, so once a friend is fully settled up they have no way to be reached from the UI —
their transaction history effectively disappears. The Friends page (`FriendsList.vue`) already
lists every accepted friend regardless of balance, so it's the natural permanent access point:
make each row a link into the existing `/balances/:userId` view from F3 (no new route or view
needed; it already renders "Settled up" correctly for a net-zero counterparty).

Modify:
- `src/models/FriendsDto.ts` — add `userId: string` to `FriendDto`, per the updated
  `GET /Friends/getFriends` contract above (backend phase B6 adds the field; the frontend
  implements against the documented contract without waiting for it, same as every other
  phase in this file).
- `src/components/FriendsList.vue` — wrap each `.friend-row` in a `router-link` to
  `/balances/${friend.userId}`, following the same pattern F3 used on `Dashboard.vue`'s
  balance rows (`text-decoration: none; color: inherit` on the row class so it doesn't look
  like a link).

Tests: extend `src/components/__tests__/FriendsList.spec.ts` — asserts each rendered row is a
`router-link` (or has the resolved `to`) pointing at `/balances/{userId}` for a mocked
`userId`-bearing `FriendDto`.

Acceptance: quality gates pass; no changes to `FriendsAdd.vue`, the friends store/service
methods, or any other route.

### F8 — Line-item models, service, store additions

Create/modify (mirror F1's structure — models+service+store only, no components this phase):

- `src/models/LineItemDto.ts` — `LineItemAssigneeDto { userId: string; userName: string }` and
  `LineItemDto { id: string; description: string | null; quantity: string | null; amount: number | null; sortOrder: number; assignees: LineItemAssigneeDto[] }`
  per the contract above.
- `src/models/UserAssignedDto.ts` — add `itemsAssignedCount: number | null` and
  `totalItemsCount: number | null` to the existing `UserAssignedDto` interface.
- `src/services/ExpenseService.ts` — three new methods on the existing singleton class, same
  `axios`/`withCredentials: true`/`API_URL` conventions and try/catch-rethrow style as
  `AddUserToExpense`/`RemoveUserFromExpense`:
  - `AssignUserToLineItem(lineItemId: string, userId: string): Promise<LineItemDto>` →
    `PUT ${API_URL}/lineItem/${lineItemId}/assignees/${userId}`
  - `RemoveUserFromLineItem(lineItemId: string, userId: string): Promise<LineItemDto>` →
    `DELETE` same URL
  - `AssignUserToAllLineItems(expenseId: string, userId: string): Promise<LineItemDto[]>` →
    `PUT ${API_URL}/${expenseId}/lineItems/assignAll/${userId}`
  `GetDocResults`'s signature stays `Promise<any>` (no change needed) — its response now simply
  includes `lineItems` per the fixed contract.
- `src/stores/Expense/index.ts` — new actions `AssignUserToLineItem`, `RemoveUserFromLineItem`,
  `AssignUserToAllLineItems`, following the try/catch-rethrow pattern of the existing
  `RemoveUserFromExpense`/`UpdateExpenseUserShares` actions (rethrow
  `error instanceof Error ? error : new Error('...')`).

Tests: check whether `src/services/__tests__/ExpenseService.spec.ts` and
`src/stores/Expense/__tests__/index.spec.ts` already exist (search `src/services/__tests__` and
`src/stores/Expense/__tests__`); create or extend them following `DashboardService.spec.ts`'s
mocking pattern (`vi.mock('axios')`, assert URL/method/`withCredentials`, error paths) for the
three new service methods and three new store actions.

Acceptance: quality gates pass; no components changed in this phase.

### F9 — LineItemAssigneeChip component + wire into DocumentResultPage.vue

Create:
- `src/components/LineItemAssigneeChip.vue` (component name `eaLineItemAssigneeChip`). Props:
  `assignees: LineItemAssigneeDto[]`, `friends: UserDto[]`, `creatorUserId: string`,
  `lineItemId: string`. Emits `toggle-assignee(userId: string, checked: boolean)` — the parent
  owns the actual API call and state patch, this component is presentational only. Renders an
  avatar-stack chip (reuse the `.friend-avatar` initials-circle CSS block from
  `FriendsList.vue`/`FriendsAdd.vue`, duplicated locally since Vuetify SFC `scoped` styles aren't
  shared across components) plus name text matching the wireframe: "You" for a single
  self-assignee, "You + Priya" for two, "3 people" for three or more. Clicking opens a `v-menu`
  with a checkbox per friend (plus the creator row) and a search `v-text-field` pinned at the
  bottom (per the wireframe layout). Disable un-checking the sole remaining checked box
  client-side (grey out + tooltip) to give instant feedback ahead of the server's 400.
- Wire into `src/components/DocumentResultPage.vue`: parse the new `lineItems` array from the
  (already-called) `GetDocResults` response alongside the existing `columnNames`/`resultLineItems`
  parsing. Append a synthetic "Assigned to" column to the existing `v-data-table`, rendering
  `LineItemAssigneeChip` per row keyed by the now-stable `item.id`. Load `friends` once on mount
  via `friendsStore.getDropdownUsers()` (the same source `ExpenseRow.vue` already uses). On
  `toggle-assignee`, call `expenseStore.AssignUserToLineItem`/`RemoveUserFromLineItem`, patch the
  local `lineItems` array optimistically, and re-fetch `GetDocResults` on failure to resync. Add
  a small "Assign all items to…" `v-menu` next to the existing search field, calling
  `expenseStore.AssignUserToAllLineItems` and replacing `lineItems` with the response.

Tests: `src/components/__tests__/LineItemAssigneeChip.spec.ts` — renders chip text for
single/two/many assignees, checklist opens and toggling emits `toggle-assignee`, the sole
remaining checkbox is disabled. Extend `src/components/__tests__/DocumentResultPage.spec.ts`
(check the existing spec file's name/mocking pattern first) for the new column rendering, the
toggle wiring to the store, and the bulk-assign menu.

Acceptance: quality gates pass; existing dynamic column/table rendering for non-assignment data
is unchanged.

### F10 — ExpenseRow.vue derived "shared with" display

Context: with F8/F9 landed, `ExpenseRow.vue`'s existing manual add-friend + edit-shares UI needs
to give way to a read-only, line-item-derived display once an expense has line items, while
continuing to work completely unmodified for expenses that have none.

- Treat `totalItemsCount != null` on a loaded `UserAssignedDto` entry as the signal that this
  expense's sharing is line-item-derived (mirrors the backend: both new fields are null only
  when the expense has zero line items). Add a small computed, e.g. `hasLineItemAssignments`,
  based on this.
- Gate the existing "Add a friend" `v-select` block and the entire
  `editingShares`/`startEditShares`/`cancelEditShares`/`saveShares` UI (including the per-user
  delete icon) behind `!hasLineItemAssignments` — none of that renders for a line-item-derived
  expense.
- For the line-item-derived case, render each assigned user's row as: avatar (`.friend-avatar`
  initials pattern), name, the existing "You" badge logic (unchanged), a caption
  "on {itemsAssignedCount} of {totalItemsCount} items", and the dollar amount read directly from
  `user.userAmount` (no longer client-recomputed via `expense.amount * user.userShare` — that
  distrust-and-recompute path, and its explanatory comment, remains only for the manual
  non-line-item branch, since it's now server-recomputed on every assignment change). Add a
  small hint/link ("Manage sharing on the Document Results page") in place of the removed delete
  icon.

Tests: extend `src/components/__tests__/ExpenseRow.spec.ts` — new cases for the derived display
(renders N-of-M + amount, hides the manual add/edit UI and per-user delete icon) alongside the
existing manual-flow cases, which must keep passing unmodified for a `UserAssignedDto` with
`totalItemsCount: null`.

Acceptance: quality gates pass; manual flow entirely unchanged for expenses without line items.
