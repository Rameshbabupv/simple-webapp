<!--
Sync Impact Report:
- Version change: [TEMPLATE] → 1.0.0
- Added sections: All principles and governance sections
- Removed sections: None
- Templates requiring updates: ⚠ pending - .specify/templates/*.md files
- Follow-up TODOs: None
-->

# Simple React Keycloak Web App Constitution

## Core Principles

### I. Component-First Architecture
All UI functionality MUST be implemented as reusable React components. Components MUST be self-contained with clear props interfaces, independently testable, and follow single responsibility principle. No monolithic components exceeding 200 lines without explicit justification.

### II. Authentication Security
Keycloak integration MUST handle all authentication and authorization. No custom authentication logic permitted. All protected routes MUST verify authentication status. Token refresh and session management MUST be handled automatically through Keycloak client libraries.

### III. Type Safety (NON-NEGOTIABLE)
TypeScript MUST be used throughout the application. All components, props, API responses, and Keycloak user objects MUST have explicit type definitions. No `any` types permitted except for third-party library compatibility with explicit documentation.

### IV. User & Group Management
All user and group operations MUST go through Keycloak Admin API. Direct database manipulation of users/groups is prohibited. Role-based access control MUST be implemented using Keycloak roles and groups. User permissions MUST be validated on both client and server sides.

### V. Testing & Documentation
Unit tests MUST cover all custom React components and utilities. Integration tests MUST verify Keycloak authentication flows. API documentation MUST be maintained for all user/group management endpoints. Component props and usage MUST be documented with examples.

## Security Requirements

All authentication tokens MUST be handled securely with httpOnly cookies where possible. No sensitive data MUST be stored in localStorage. All API calls MUST include proper authorization headers. CORS policies MUST be configured appropriately for Keycloak and application domains.

## Development Workflow

Code changes MUST pass TypeScript compilation, linting, and all tests before merge. Keycloak configuration changes MUST be documented and version controlled. Component library updates MUST maintain backward compatibility or include migration guides.

## Governance

This constitution supersedes all other development practices. All pull requests MUST verify compliance with these principles. Breaking changes to authentication flows or user management require explicit approval and migration planning.

**Version**: 1.0.0 | **Ratified**: 2025-09-26 | **Last Amended**: 2025-09-26