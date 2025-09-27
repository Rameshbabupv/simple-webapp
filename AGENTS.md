# Repository Guidelines

## Project Structure & Module Organization
The core application lives in `frontend/`, a Create React App TypeScript client. Application code sits in `frontend/src`, with reusable UI in `frontend/src/components`, context providers under `frontend/src/contexts`, and API helpers in `frontend/src/services`. Unit-level React Testing Library specs stay alongside components (e.g., `App.test.tsx`). Broader scenarios live in `frontend/src/tests` where `integration/` covers UI flows and `contract/` holds Keycloak API contracts. Generated build artifacts land in `frontend/build` while temporary coverage reports appear under `frontend/coverage`. Reference architecture notes live in `docs/` and `specs/`.

## Build, Test, and Development Commands
Run `npm install` from `frontend/` once to hydrate dependencies. `npm start` boots the dev server on localhost with hot reload. `npm run build` emits a production bundle to `frontend/build`. `npm test` launches Jest in watch mode. Use `npm run test:coverage` for a one-off run that writes coverage data to `frontend/coverage`. CI mirrors `npm run test:ci` to produce coverage without failing on absent suites.

## Coding Style & Naming Conventions
Stick to TypeScript and React functional components. Favor two-space indentation, single quotes in TSX/TS, and PascalCase for components (`LoginButton.tsx`) while hooks and utilities use camelCase filenames. Leverage CRA's built-in ESLint (`react-app`)—lint issues surface during `npm start` and tests. Enforce strict null checks per `tsconfig.json`; prefer explicit types on exported functions and context values.

## Testing Guidelines
Testing uses Jest with React Testing Library plus custom mocks under `frontend/src/__mocks__`. Name files `*.test.ts(x)` and place contract or integration suites in the matching subfolder. Exercise Keycloak flows with the provided `keycloak-js` mock—do not hit the live IdP. New work should maintain or improve coverage (review `npm run test:coverage` output before pushing).

## Commit & Pull Request Guidelines
Existing history uses short imperative subjects with optional contextual emoji (e.g., `✨ Complete ...`). Keep commits scoped and reference the affected domain (`frontend`, `auth`, etc.). Pull requests should link Jira or GitHub issues, outline testing done, and attach UI screenshots or GIFs whenever UI changes Keycloak interactions. Request review from team login specialists before merging.

## Security & Configuration Tips
Document env requirements (`REACT_APP_KEYCLOAK_URL`, `REACT_APP_KEYCLOAK_REALM`, `REACT_APP_KEYCLOAK_CLIENT`) in PRs that touch authentication. Never commit `.env` files; rely on README instructions for local secrets.
