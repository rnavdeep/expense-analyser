# Redesign Plan — Phase 2 (Authenticated App)
**Expense Analyser · Vue 3 + Vuetify**
Based on the mockups in `assets/mockups/` (Expense flow, Expenses grid, Shared
Expenses, Notifications, Friends, Receipt results).

> Prereq: Phase 1 (`redesign-plan-phase-1.md`) is merged — the fonts, `:root`
> tokens, and Vuetify theme/defaults are already global. Phase 2 reuses them and
> adds no new foundation. Read [design-system.md](design-system.md) first.

---

## Overview

Phase 1 covered the public surface (Home, Login, Register) plus the shell
(Navbar/App). Phase 2 restyles the logged-in app — the data-heavy screens — to the
same visual language. **Visual only: preserve all logic, stores, services, routes,
and realtime/notification behavior.**

| Step | Files | Mockup section | Effort |
|---|---|---|---|
| 0 | Shared building blocks (page shell, `NavigationDrawer.vue`) | App shell | ~30 min |
| 1 | `ExpenseList.vue` | Expenses · card grid + search/sort | ~45 min |
| 2 | `ExpenseCard.vue` | Expense card | ~45 min |
| 3 | `ExpenseCreate.vue` + `DocumentUpload.vue` + `AssignUsers.vue` | Expense · create + upload + assign | ~60 min |
| 4 | `DocumentResultPage.vue` | Upload → Textract → Results | ~40 min |
| 5 | `SharedExpenses.vue` | Shared Expenses | ~40 min |
| 6 | `Notifications.vue` | Notifications | ~25 min |
| 7 | `FriendsList.vue` + `FriendsAdd.vue` | Friends + Add Friend | ~30 min |

---

## Step 0 — Shared building blocks (do first)

These patterns repeat on every authenticated screen, so establish them once.

### 0a. Page shell
Every view should sit on the `--ea-paper` background with consistent gutters and a
max width. Introduce a reusable wrapper convention (a `.page` container class or a
`v-container` with a max-width) so screens align:

```css
.page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 24px 64px;
  width: 100%;
  box-sizing: border-box;
}
```

### 0b. Page header pattern
A consistent header for each screen: display-font title, muted subtitle, optional
primary action button on the right.

```vue
<header class="page-head">
  <div>
    <h1 class="page-title">My expenses</h1>
    <p class="page-sub">All your receipts, organised.</p>
  </div>
  <router-link to="/newExpense">
    <v-btn color="secondary" size="large">New expense</v-btn>
  </router-link>
</header>
```

`.page-title` → `var(--ea-display)`, weight 600, `letter-spacing: -0.02em`, ink.
`.page-sub` → 15px, `var(--ea-muted)`.

### 0c. `NavigationDrawer.vue`
- Use the ink (`--ea-ink`) surface to match the redesigned Navbar, emerald for the
  active item.
- Display-font labels, `mdi` icons, clear active/hover states.
- Keep all existing route links and the auth-gated item visibility exactly as-is.

### 0d. Amounts use the mono font
Anywhere a currency value renders (cards, lists, totals), wrap it so it uses
`var(--ea-mono)` — this is the redesign's signature for figures.

```css
.amount { font-family: var(--ea-mono); font-weight: 700; }
```

---

## Step 1 — `ExpenseList.vue`

**Mockup:** Expenses · card grid + search/sort.

### What's wrong now
| Issue |
|---|
| Listing lacks the card-grid layout and visual hierarchy of the mockup |
| Search / sort controls not styled to the system |
| Empty state and loading state unstyled |

### Do
1. Wrap in the Step 0 page shell + page header (title "My expenses", "New expense" CTA).
2. Render expenses as a responsive grid of `ExpenseCard` components:
   ```css
   .expense-grid {
     display: grid;
     grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
     gap: 20px;
   }
   ```
3. Style the search field (`VTextField` already defaults to outlined) with a leading
   `mdi-magnify` icon; style sort as a `VSelect`/menu using theme colors.
4. Add a friendly empty state (icon chip + message + "New expense" button) and a
   `v-skeleton-loader`/spinner for loading.
5. **Preserve** the fetch, search, and sort logic and any store bindings.

---

## Step 2 — `ExpenseCard.vue`

**Mockup:** Expense card.

### What's wrong now
| Issue |
|---|
| Card styling doesn't match surface/border/radius tokens |
| Merchant, date, total not visually ranked; amount not in mono |
| Shared / status indicators not styled |

### Do
1. White `--ea-surface`, `1px solid var(--ea-border)`, 16px radius, hover lift
   (`translateY(-3px)` + soft shadow) — same as the Phase 1 feature card.
2. Layout: merchant name (display font) + date (muted) at top, **total in mono** and
   prominent, line-item count / category as small mono labels.
3. Status/shared chips use emerald (`secondary`) tonal styling; keep any "SHARED ×N"
   indicator.
4. Keep click/navigation, props, and emitted events unchanged.

---

## Step 3 — Create flow: `ExpenseCreate.vue` + `DocumentUpload.vue` + `AssignUsers.vue`

**Mockup:** Expense · create + upload + assign.

### Do
1. **`ExpenseCreate.vue`** — page shell + header ("New expense"). Group the form in a
   single auth-card-style surface; outlined fields (theme default); primary submit,
   subtle secondary/cancel.
2. **`DocumentUpload.vue`** — turn the uploader into a clear dropzone: dashed
   `--ea-border`, emerald-tint hover, `mdi-cloud-upload-outline`, helper text ("image
   or PDF"). Show selected-file chip and upload progress. **Keep** the upload handler,
   accepted types, and Textract trigger intact.
3. **`AssignUsers.vue`** — style the user picker as avatar/name rows with emerald
   selection state; assigned users render as `secondary` chips. Preserve the
   assign/unassign logic and friend-list data source.

---

## Step 4 — `DocumentResultPage.vue`

**Mockup:** Upload → Textract → Results ("Receipt processed.").

### Do
1. Page shell + header conveying processed state (e.g. emerald check + "Receipt
   processed").
2. Present extracted fields (merchant, date, totals) in a clean key/value card;
   **values in mono**.
3. Render line items as a styled table/list using border + surface tokens; right-align
   amounts in mono.
4. Primary action (save / continue) in emerald. Keep all Textract result parsing and
   actions unchanged.

---

## Step 5 — `SharedExpenses.vue`

**Mockup:** Shared Expenses ("Split costs with other users and track…").

### Do
1. Page shell + header ("Shared expenses", subtitle about splitting/tracking).
2. Reuse the `ExpenseCard` grid; surface who-owes-what with emerald (owed to you) vs
   muted/ink (you owe) emphasis; amounts in mono.
3. Style any settle/track action as a themed button. Style empty + loading states.
4. Preserve sharing/settlement logic and realtime updates.

---

## Step 6 — `Notifications.vue`

**Mockup:** Notifications.

### Do
1. Page shell + header ("Notifications").
2. Notification rows on `--ea-surface` with `--ea-border` dividers; unread marked with
   an emerald dot/accent; relative timestamps in muted mono.
3. Icon per type (`mdi-account-plus`, `mdi-receipt`, etc.). Keep mark-read /
   navigation actions and the realtime subscription untouched.

---

## Step 7 — `FriendsList.vue` + `FriendsAdd.vue`

**Mockup:** Friends + Add Friend (stacked).

### Do
1. **`FriendsList.vue`** — page shell + header ("Friends"); each friend as an
   avatar + name row on a bordered surface; actions (remove, view) as themed
   icon-buttons.
2. **`FriendsAdd.vue`** — outlined search/username field with `mdi-account-search`
   leading icon and an emerald "Add" button; success/error via `v-alert` tonal (as in
   Login). Preserve add-friend request logic and validation.

---

## Testing checklist

After each step:

- [ ] `npm run dev` starts with no errors
- [ ] `npm run type-check` and `npm run lint` pass
- [ ] All screens sit on `--ea-paper` with consistent gutters and page headers
- [ ] Currency amounts render in the mono font everywhere
- [ ] Cards use surface/border/radius tokens with hover lift; no leftover dark-grey fills
- [ ] NavigationDrawer matches the Navbar (ink surface, emerald active item)
- [ ] Expense list grid, search, and sort still work
- [ ] Upload → Textract → results flow still functions end to end
- [ ] Shared expenses and notifications still receive realtime updates
- [ ] Friend add/remove still works; alerts styled consistently
- [ ] No store/service/router logic changed — diffs are template + scoped style only

---

## Design reference

Inspect `assets/mockups/Expense Analyser Redesign.dc.html` in the project preview
(DevTools) for exact spacing/typography per screen. Token quick-reference lives in
[design-system.md](design-system.md).
