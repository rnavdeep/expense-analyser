# Project API Conventions (expense-analyser)

## Stack Snapshot

- Frontend: Vue 3 + Vite + TypeScript + Pinia + Vuetify
- HTTP client: axios
- API base env: `VITE_APP_API_URL` in `.env` / `.env.example`
- Auth/session transport: cookie-based requests with `withCredentials: true`

## Current Domain Mapping

- `src/services/AuthService.ts` <-> `src/stores/Auth/index.ts`
- `src/services/ExpenseService.ts` <-> `src/stores/Expense/index.ts`
- `src/services/DocumentService.ts` <-> `src/stores/Document/index.ts`
- `src/services/FriendsService.ts` <-> `src/stores/Friends/index.ts`
- `src/services/NotificationService.ts` <-> `src/stores/Notifications/index.ts`
- `src/services/ExtractService.ts` <-> `src/stores/Extract/index.ts`
- `src/services/TextractNotificationService.ts` is SignalR client integration

## Service Pattern

Use this baseline in service files:

```ts
import axios from 'axios'
const BASE_URL = import.meta.env.VITE_APP_API_URL
const API_URL = BASE_URL + '/ControllerName'
```

Method expectations:
- Use typed params and return values when DTOs exist.
- Use `await axios.<verb>(..., { withCredentials: true })`.
- Add `headers: { 'Content-Type': 'multipart/form-data' }` only for form-data uploads.
- Wrap calls in `try/catch` and map errors through `axios.isAxiosError`.

## Store Pattern (Pinia)

Typical flow in `src/stores/<Domain>/index.ts`:
- Define domain state flags (`isLoading`, `isUpdating`, `uploadSuccess`, etc.).
- Validate required inputs at the start of actions.
- Call one service method per action.
- Return useful values to caller and keep state in sync for UI.

## Endpoint Style in Existing Code

- Expense controller: `/Expense`
- Auth controller: `/auth` (mixed case in action routes: `/Register`, `/Login`, `/Logout`)
- Notification controller: `/Notification`
- Friends controller: `/Friends`
- Document controller: `/Document`
- Extract controller: `/Textract`
- SignalR hub endpoint: `/textractNotification`

When adding routes, match backend controller/action casing instead of auto-normalizing.

## API Feature Checklist

1. Add/adjust DTOs in `src/models`.
2. Add service method in the appropriate `src/services/*Service.ts`.
3. Add store action/state integration in `src/stores/<Domain>/index.ts`.
4. Integrate in `src/components` or `src/views`.
5. Ensure env base URL remains `VITE_APP_API_URL`.
6. Run `npm run type-check` and `npm run lint`.

## Common Pitfalls To Avoid

- Missing `withCredentials: true` causes auth/session failures.
- Direct axios calls in components fragment domain logic.
- Inconsistent return types (`any`) hide regressions; prefer DTOs.
- Broad refactors to naming conventions can break existing view/store calls.
