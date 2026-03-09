# Legacy Boundaries

## Auth API

The app is now primarily local-first, but remote authentication is intentionally retained for now.

Relevant files:

- `services/api.ts`
- `lib/context/AuthContext.tsx`
- `app/(auth)/login.tsx`
- `app/(auth)/register.tsx`

Guidance:

- Do not mix general cleanup work with auth-flow redesign unless that is the explicit goal.
- Prefer improving local data flows, tests, and tooling first.
- If auth is removed in the future, review related token storage, offline mode boot logic, and any schema fields tied to old ownership assumptions.
