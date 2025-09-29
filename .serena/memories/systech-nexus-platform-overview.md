# Systech Nexus Platform - Complete Project Overview

## Project Summary
**Name**: Systech Nexus Platform (NEXUS HRMS)  
**Type**: Human Resource Management System  
**Current Version**: 1.0.0 (Released 2025-09-26)  
**Repository**: git@github.com:Rameshbabupv/simple-webapp.git  
**License**: Private - Systech Internal Use  

## Current Status
- ✅ **Frontend Complete**: React-based authentication and user management
- 🔄 **Backend Planned**: Spring Boot + GraphQL/REST hybrid API
- ✅ **Database Ready**: PostgreSQL with 10 schemas and sample data
- 🔄 **Current Branch**: feature/company-master-navigation

## Technology Stack

### Frontend (Implemented)
- **React**: 19.1.1 with TypeScript 4.9.5
- **Authentication**: Keycloak JS 26.2.0 for SSO
- **Routing**: React Router DOM 7.9.2
- **Styling**: CSS with Glassmorphism design patterns
- **Testing**: Jest + React Testing Library + Contract tests
- **Build**: Create React App 5.0.1

### Backend (Planned)
- **Framework**: Spring Boot
- **API Strategy**: GraphQL + REST hybrid
  - GraphQL: Primary for frontend data queries/mutations
  - REST: File operations, webhooks, integrations
- **Database**: PostgreSQL with JPA/Hibernate
- **Endpoints**: `/graphql` (main), `/api/*` (REST fallback)

### Database Architecture
**Host**: localhost:5432  
**Database**: nexus_hrms  
**User**: rameshbabu  
**Default Schema**: nx_core  

#### Schema Organization
| Schema | Purpose | Status |
|--------|---------|--------|
| nx_core | Company, user, location, roles | ✅ Ready |
| nx_hr | Employee & HR data | 🔄 Next |
| nx_time | Attendance & time tracking | 🔄 Later |
| nx_leave | Leave management | 🔄 Later |
| nx_fin | Payroll & finance | 🔄 Later |
| nx_perf | Performance management | 🔄 Later |
| nx_recruit | Recruitment | 🔄 Later |
| nx_ref | Reference data | 🔄 Later |
| nx_audit | Audit trails | 🔄 Later |
| nx_config | Configuration | 🔄 Later |

## Project Structure

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── dashboard/Dashboard.tsx
│   │   ├── users/[UserList, CreateUserForm, EditUser]
│   │   ├── companies/CompanyMaster.tsx
│   │   └── LoginButton.tsx, BuildInfo.tsx
│   ├── contexts/AuthContext.tsx
│   ├── services/
│   │   ├── keycloak.ts (Authentication service)
│   │   ├── userService.ts
│   │   └── companyService.ts
│   ├── types/[user.ts, permissions.ts]
│   ├── utils/permissions.ts
│   └── tests/ (unit, integration, contract tests)
├── docs/ (team communication, keycloak setup)
└── specs/001-keycloak-auth-app/
```

## Authentication & Security

### Keycloak Integration
- **URL**: http://localhost:8090
- **Realm**: systech (configurable)
- **Client**: systech-hrms-client
- **Features**:
  - SSO authentication with automatic token refresh
  - Role-based access control (RBAC)
  - Group-based permissions
  - Secure token storage and session management

### Permission System
- **platform-admins**: Full system access
- **app-admins**: Application administration
- **users**: Standard user access
- Permission validation on both client and server side (planned)

## Key Features (v1.0.0)

### Implemented
1. **Authentication Flow**: Secure login/logout with Keycloak
2. **User Management**: CRUD operations with role validation
3. **Group Management**: Assign users to groups
4. **Dashboard**: Modern glassmorphism UI
5. **Profile Management**: User profile and group memberships
6. **Admin Interface**: User management for administrators
7. **Responsive Design**: Mobile-friendly interface

### Company Management (In Progress)
- Company Master data management
- Company type enum support
- Location selection (country/state/city cascading)

## Development Workflow

### Git Flow Strategy
- **main**: Production-ready code
- **develop**: Integration branch
- **feature/***: Feature development
- **release/***: Release preparation
- **hotfix/***: Emergency fixes

### Testing Strategy
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Authentication and user management flows
- **Contract Tests**: API contract validation with Keycloak
- **Mock Support**: Comprehensive mocking for offline development
- **Coverage**: Test coverage reporting enabled

## Environment Configuration

### Required Environment Variables
```bash
REACT_APP_KEYCLOAK_URL=http://localhost:8090
REACT_APP_KEYCLOAK_REALM=systech
REACT_APP_KEYCLOAK_CLIENT=systech-hrms-client
```

### Database Connection (Backend)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/nexus_hrms
    username: rameshbabu
    driver-class-name: org.postgresql.Driver
  jpa:
    properties:
      hibernate:
        default_schema: nx_core
```

## Sample Data Available
- **Company**: SysTech Solutions Private Limited
- **Admin User**: admin@systechsolutions.com
- **Test User**: babu.systech with various group memberships
- **Location Data**: Countries, states, cities for testing

## Development Priorities & Roadmap

### Phase 1: Foundation (Current)
1. ✅ Keycloak authentication integration
2. ✅ User management with RBAC
3. 🔄 Company management (in progress)
4. 🔄 Spring Boot backend setup

### Phase 2: Core HRMS (Planned v1.1.0)
- Employee master data management
- Enhanced group management UI
- Bulk user operations
- Advanced search and filtering

### Phase 3: Advanced Features (Planned v1.2.0)
- Time and attendance tracking
- Leave management
- Performance management
- Payroll integration

## Development Guidelines

### Code Standards
- **Principle**: KISS (Keep It Short and Simple)
- **Approach**: Build one feature at a time, test before proceeding
- **Naming Convention**: nx_ prefix for database schemas
- **Component Structure**: Reusable, testable components
- **Type Safety**: Full TypeScript coverage

### Commands
- `npm start`: Development server (localhost:3000)
- `npm test`: Run tests in watch mode
- `npm run test:coverage`: Generate coverage report
- `npm run test:ci`: CI-friendly test run
- `npm run build`: Production build

## Architecture Patterns

### Frontend Patterns
- **Context API**: Centralized authentication state
- **Component Composition**: Modular, reusable components
- **Protected Routes**: Authentication-based routing
- **Service Layer**: Separation of API calls from components
- **Type Safety**: Comprehensive TypeScript interfaces

### Backend Patterns (Planned)
- **GraphQL Resolvers**: Query and mutation handling
- **Entity-Relationship**: JPA entity mappings
- **Service Layer**: Business logic separation
- **Repository Pattern**: Data access abstraction

## Key Contacts & Documentation
- **Project Lead**: Ramesh Babu
- **Setup Guides**: `/docs/` directory
- **API Documentation**: Keycloak integration guides
- **Team Communication**: `/docs/team_communication/`

This platform serves as both a production HRMS system and a testing ground for Keycloak SSO integration patterns.