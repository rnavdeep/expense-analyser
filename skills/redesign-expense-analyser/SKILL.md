---
name: redesign-expense-analyser
description: Redesign the expense-analyser Vue + Vuetify frontend to match the approved mockups, applying the shared design system (Space Grotesk / Hanken Grotesk / Space Mono fonts, ink + emerald palette, Vuetify theme tokens). Use when restyling pages such as Home, Login, Register, or Navbar, or when applying the project's redesign visual language to new or existing UI.
---

# Redesign Expense Analyser

Restyle the expense-analyser frontend (Vue 3 + Vuetify) to the approved redesign
without changing app behavior. Visual change only — preserve all existing logic,
state, services, and routing.

## Start here

1. Read `references/design-system.md` for the shared tokens (colors, fonts, Vuetify
   theme, reusable card/hero patterns). This applies to every page.
2. Read `references/redesign-plan-phase-1.md` for the step-by-step plan covering the
   foundation setup plus Home, Login, and Register (with ready-to-paste templates and
   styles).
3. Open the mockups in `assets/mockups/` (start with
   `Expense Analyser Redesign.dc.html`) to inspect exact spacing, color, and typography
   in DevTools before implementing.

## Workflow

1. **Foundation first (Step 0).** Set up fonts in `index.html`, CSS variables in
   `src/assets/base.css`, and the Vuetify theme + component defaults in `src/main.ts`.
   This is global and must land before per-page work, so every `color="primary"` /
   `color="secondary"` and default control style resolves correctly.

2. **Preserve logic.** Touch only `<template>` and `<style scoped>` unless the plan
   explicitly adds a UI-only ref (e.g. `showPassword`). Do not modify stores, services,
   computed auth state, form handlers, or router config. Keep existing `v-model`
   bindings, `@submit` handlers, and prop/event names intact.

3. **Work page by page** following `references/redesign-plan-phase-1.md`:
   - `src/components/Home.vue` — hero + feature cards.
   - `src/components/Login.vue` — single centered auth card.
   - `src/components/Register.vue` — reuse the auth-card pattern; hide the role selector
     from end users (keep the underlying logic if the API needs it).
   - Extend the same tokens/patterns to other components (Navbar, etc.) as scope grows.

4. **Reuse, don't duplicate.** Use the CSS variables and shared patterns from the design
   system rather than hard-coding hex values. Reuse `.login-card` for Login and Register.

5. **Validate** after changes:
   - `npm run dev` starts with no errors.
   - `npm run type-check` and `npm run lint` pass.
   - Walk the testing checklist at the end of `references/redesign-plan-phase-1.md`
     (hero renders dark, feature cards legible, login centered with emerald accent,
     password show/hide works, login success/error flows unchanged, register link works).

## Guardrails

- Visual-only: never change behavior, data flow, or routes while restyling.
- Prefer Vuetify primitives and theme colors over raw `<button>`/inline hex.
- Keep styles `scoped` unless a change is intentionally global (fonts, `:root` vars,
  Vuetify defaults).
- Match existing component conventions (`defineComponent`, TypeScript, `ea*` naming).
- Avoid broad refactors bundled into a styling change.
