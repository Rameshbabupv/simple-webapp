# Codex Recommendations

## Close Functionality Gaps
- Implement full admin workflows: create/edit users, manage Keycloak group memberships (`platform-admins`, `app-admins`, `users`), and show role-scoped UI per spec.
- Enforce highest-privilege precedence when a user belongs to multiple groups; surface role indicators in the dashboard.

## Harden Authentication Lifecycle
- Finish token refresh and offline caching logic promised in requirements so the app survives Keycloak outages.
- Provide consistent user feedback (toasts, inline states) for each auth or management action.

## Build Out Service & Type Layers
- Add missing TypeScript models (`frontend/src/types/`) and service modules (`auth`, `user`, `group`, `offlineAuth`) planned in `/specs/001-keycloak-auth-app/tasks.md`.
- Centralize permission helpers to simplify role checks across components.

## Follow Test-First Roadmap
- Author the contract and integration suites in `frontend/src/tests/{contract,integration}` to lock requirements before implementation.
- Extend unit/component coverage during polish to keep regressions out as features grow.

## UX & DX Improvements
- Protect routes with reusable guards, seed the “first login becomes admin” path, and capture environment prerequisites in docs.
- Add loading spinners, error boundaries, and accessibility tweaks highlighted in the task plan once core flows are stable.
