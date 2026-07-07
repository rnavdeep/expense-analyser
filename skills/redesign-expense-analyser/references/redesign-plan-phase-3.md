# Redesign Plan — Phase 3 (App Shell, Responsive & Polish)
**Expense Analyser · Vue 3 + Vuetify**
Based on the **"PERSISTENT TOP NAV"** shell in `assets/mockups/` (Application
Overview · "Authenticated app · shared nav", and the APP NAV bar on each screen).

> Prereq: Phases 1–2 are merged — fonts, `:root` tokens, the Vuetify theme/defaults,
> and all page-level redesigns are in place. Phase 3 changes the **shell** and does a
> final consistency pass. Read [design-system.md](design-system.md) first.

---

## Overview

Phases 1–2 restyled every *page*. They left the **shell** in a transitional state: the
app still renders two navigation surfaces at once — the top `Navbar.vue` **and** a
left `NavigationDrawer.vue` rail (`src/App.vue`). The mockups show a **single
persistent top nav** and no sidebar. Phase 3 consolidates the shell to match, makes it
responsive, brings dark mode to parity, and closes out QA.

**Behavior-preserving:** keep every existing route link, the auth-gated visibility
(`authStore.isAuthenticated` / `isSessionActive`), the notification bell + count, the
theme toggle, the SignalR/Textract notification lifecycle in `App.vue`, and all router
config. This is a structural/visual change only — no store/service/router logic edits.

| Step | Files | Mockup section | Effort |
|---|---|---|---|
| 1 | `Navbar.vue` | APP NAV bar (top nav links + avatar) | ~60 min |
| 2 | `App.vue` + retire `NavigationDrawer.vue` | App shell (single bar) | ~30 min |
| 3 | `Navbar.vue` (mobile) | Responsive collapse | ~40 min |
| 4 | `Navbar.vue`, router | Avatar menu · Profile/About target | ~20 min |
| 5 | Theme/dark-mode parity pass | Toggle parity | ~30 min |
| 6 | Cross-cutting QA | All screens | ~30 min |

---

## Step 1 — `Navbar.vue`: fold route links into the top bar

**Mockup:** ink bar (`oklch(0.20 0.02 264)` ≈ `--ea-nav`), 60px tall, three clusters.

### Target structure
- **Left cluster:** existing logo mark + "Expense Analyser" wordmark, then — *when
  authenticated* — a horizontal nav group of `RouterLink`s:

  | Label | Route |
  |---|---|
  | Expenses | `/myExpenses` |
  | New | `/newExpense` |
  | Shared | `/sharedExpenses` |
  | Results | `/docResults` |
  | Friends | `/friends` |

  Active route renders as an **emerald pill** (`background: var(--ea-emerald)` tint,
  white/ink-bold text, `padding: 7px 13px; border-radius: 8px`); inactive links are
  muted (`rgba(255,255,255,0.74)`) and lighten on hover. Use `RouterLink`'s
  `router-link-active` / `exact-active` class (or `v-tab`/`v-btn :active`) for state —
  do **not** hand-roll route matching beyond what the router gives you.

- **Right cluster:** theme toggle (keep), notification bell with the existing
  `notificationCount` badge + `onClickBell` (keep), and a new **avatar menu** — a
  circular emerald avatar with the user's initials opening a `v-menu` with **Profile**
  and **Logout** (wire Logout to the existing `logout()`).

- **Public (unauthenticated):** keep the current Login / Register buttons; the
  authenticated link group and avatar are hidden behind `v-if="isUserLoggedIn && isLoggedIn"`.

### Notes
- "Add Friend" and "Notifications" don't need their own top-level pills (the mockup
  omits them): reach Add Friend from the Friends screen and Notifications via the bell.
  Keep their routes intact regardless.
- Reuse existing computed state (`isUserLoggedIn`, `isLoggedIn`, `notificationCount`,
  `isDark`) and handlers (`logout`, `onClickBell`, `toggleTheme`) — no new store calls.

---

## Step 2 — `App.vue`: single-bar shell, retire the drawer

1. Remove `<eaNavigationDrawer />` and its import/registration from `App.vue`.
2. Drop the now-unneeded rail-offset workarounds in `App.vue`'s `<style>` (the
   `.v-main { padding-inline-start: 0 !important }` hack existed to neutralize the
   drawer's layout var — re-verify content alignment after removal).
3. **Delete `NavigationDrawer.vue`** once Step 3's mobile menu absorbs its job (or keep
   the file only if it's repurposed as the mobile drawer — see Step 3). The
   `/profile` link it pointed at is currently an orphan (no route) — see Step 4.
4. Keep `TextractNotificationService.start()/stop()` in the `App.vue` lifecycle exactly
   as-is.

---

## Step 3 — Responsive collapse

A horizontal link row won't fit narrow screens. Below a breakpoint
(`const { mobile } = useDisplay()`):

- Hide the inline link group; show a **hamburger** (`mdi-menu`) that opens a temporary
  `v-navigation-drawer` (or `v-menu`) containing the **same** links + the avatar
  actions. This is the one acceptable place a drawer remains — as a mobile-only menu,
  not a persistent desktop rail.
- If `NavigationDrawer.vue` is repurposed for this, switch it from `permanent rail` to
  `temporary` bound to a `drawer` ref toggled by the hamburger, and render the Step 1
  link set. Otherwise inline the mobile menu in `Navbar.vue` and delete the old file.
- `useDisplay()` is a Vuetify composable — it must be **mocked** in `shallowMount`
  specs (same pattern as `useTheme()` in `Navbar.spec.ts`).

---

## Step 4 — Avatar menu target (`/profile`) + About

The drawer linked to `/profile`, but **no `/profile` route exists** (`src/router/index.ts`).
Resolve the orphan one of two ways:
- **Preferred:** point the avatar "Profile" item at `/about` (an existing route) until a
  Profile screen exists, **or**
- add a minimal authenticated `Profile` view + route (name/email from `authStore`,
  styled with the page shell + auth-card pattern) if a real profile page is in scope.

Pick one and keep the avatar menu's Logout wired to `authStore.logout()` + redirect home.

---

## Step 5 — Dark-mode parity pass

The theme toggle (`toggleTheme`, persisted to `localStorage['ea-theme']`) already
flips Vuetify light/dark. Phases 1–2 tuned the **light** tokens; sweep the redesigned
screens in **dark** mode and fix any hard-coded light values:

- Card surfaces/borders, empty/loading states, chips, and the new bulk-select bar
  should read tokens (`--ea-surface`, `--ea-border`, `--ea-paper`) that have dark
  values — not literal `#fff`/light hexes.
- Confirm `document.body` background sync (`#0f1117` dark / `#faf9f6` light) still
  matches the redesigned paper background.

---

## Step 6 — Cross-cutting QA / design-system audit

- [ ] Every currency amount uses `var(--ea-mono)` (`.amount`) — cards, lists, totals,
      results, shared balances.
- [ ] No leftover dark-grey fills or pre-redesign hexes; all surfaces use tokens.
- [ ] Focus-visible states on nav links, avatar menu, and buttons (keyboard a11y);
      `aria-label`s on icon-only buttons (bell, hamburger, theme toggle).
- [ ] Active-route highlighting correct on every authenticated screen.
- [ ] Page shells: consistent `--ea-paper` background, gutters, and page headers.

---

## Testing checklist

- [ ] `npm run dev` starts with no errors; single top bar, no left rail on desktop.
- [ ] `npm run type-check` and `npm run lint` pass.
- [ ] `npx vitest run` is green. Update/replace specs:
  - `Navbar.spec.ts` — assert the authenticated link group + active state + avatar
    menu (Profile/Logout) render; mock `useTheme()` **and** `useDisplay()`.
  - `NavigationDrawer.spec.ts` — update for the mobile-menu repurpose, or remove it if
    the component is deleted.
  - Do not weaken assertions on preserved behavior (logout, bell/`onClickBell`,
    auth-gated visibility).
- [ ] Every authenticated route reachable from the top nav (or bell / Friends screen).
- [ ] Resize to mobile: links collapse into the hamburger menu; all routes still reachable.
- [ ] Auth gating unchanged: logged-out users see Login/Register only; the link group
      and avatar appear only when `isUserLoggedIn && isLoggedIn`.
- [ ] Notification bell badge/count and SignalR/Textract lifecycle in `App.vue` intact.
- [ ] Light **and** dark themes both look correct across screens.
- [ ] Diffs are template + scoped style (+ the Navbar mobile ref / optional Profile
      route) only — no store/service changes.

---

## Design reference

Inspect the **APP NAV** bar and "Authenticated app · shared nav" block in
`assets/mockups/Expense Analyser Redesign - Standalone.html` (and `Application
Overview.dc.html`) for exact spacing/typography. Token quick-reference lives in
[design-system.md](design-system.md).
