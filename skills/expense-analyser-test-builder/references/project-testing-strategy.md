# Testing Strategy (expense-analyser)

## Recommended Framework

Use `Vitest` as the primary framework.

Why this is the best fit here:
- Native fit for Vite projects.
- Fast TS/ESM support out of the box.
- Works directly with Vue 3 via `@vue/test-utils`.
- Simple mocking (`vi.mock`) for store/service side effects in this codebase.

Use `jsdom` as test environment for component tests.

## Minimal Setup Commands

```bash
npm install -D vitest @vitest/coverage-v8 @vue/test-utils jsdom
```

Add scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Suggested Vitest Config

Either:
- keep all config in `vite.config.ts` under `test: { ... }`, or
- create `vitest.config.ts` and merge with Vite aliases/plugins.

Baseline test settings:
- `environment: 'jsdom'`
- `globals: true`
- `setupFiles: ['src/tests/setup.ts']`
- include `src/**/*.spec.ts`

## Project-Specific Mocking Notes

Auth store side effects:
- `useAuthStore.login()` triggers `TextractNotificationService.start()`.
- `useAuthStore.login()` also accesses `useNotificationStore().GetAllNotifications()`.

In auth store tests, mock:
- `@/services/TextractNotificationService`
- `@/stores/Notifications`
- `@/services/AuthService`

Service tests:
- Mock `axios` module methods (`get/post/put/delete`) and assert URL/options.
- Verify error mapping (`axios.isAxiosError` branches) for robust behavior.

Component tests:
- Mount with `@vue/test-utils`.
- Provide Pinia test instance and stubs for router/Vuetify-heavy UI as needed.
- Assert visible behavior and emitted events, not internal implementation details.

## Test Layout

- `src/tests/setup.ts` global setup
- `src/tests/factories.ts` test data builders (optional)
- `src/components/__tests__/*.spec.ts`
- `src/stores/**/__tests__/*.spec.ts`
- `src/services/__tests__/*.spec.ts`

## First Test Candidates

1. `src/stores/Auth/index.ts`
- login success updates state and triggers notification side effects
- login failure handles thrown errors

2. `src/stores/Expense/index.ts`
- createExpense validates required inputs
- GetExpenses updates list/loading flags

3. `src/services/AuthService.ts`
- Login maps API response to `LoginResponse`
- checkSession handles error path as logged out

4. `src/components/Login.vue`
- submit calls store action
- success path routes to `/`
- error path shows alert

## Optional E2E Layer

After unit/integration coverage stabilizes, add `Playwright` for smoke flows:
- login page renders
- protected route redirects when unauthenticated
- expense list loads with mocked API
