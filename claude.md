# Claude Code Context - Systech Nexus Platform

## Project Identity
**Name**: Systech Nexus Platform (NEXUS HRMS)
**Type**: Human Resource Management System
**Version**: 1.0.0
**Repository**: git@github.com:Rameshbabupv/simple-webapp.git
**License**: Private - Systech Internal Use

## Quick Start

### Running the Application
```bash
cd frontend
npm start              # Development server at localhost:3000
npm test              # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run test:ci       # CI-friendly test run
npm run build         # Production build
```

### Key Services
- **Frontend**: http://localhost:3000
- **Keycloak**: http://localhost:8090
- **Database**: PostgreSQL at localhost:5432 (nexus_hrms)

## Technology Stack

### Frontend (Implemented)
- **React**: 19.1.1 with TypeScript 4.9.5
- **Authentication**: Keycloak JS 26.2.0 for SSO
- **Routing**: React Router DOM 7.9.2
- **Styling**: CSS with Glassmorphism design patterns
- **Testing**: Jest + React Testing Library
- **Build**: Create React App 5.0.1

### Backend (Planned)
- **Framework**: Spring Boot
- **API Strategy**: GraphQL + REST hybrid
  - GraphQL: Primary for frontend data queries/mutations at `/graphql`
  - REST: File operations, webhooks, integrations at `/api/*`
- **Database**: PostgreSQL with JPA/Hibernate
- **ORM**: Hibernate with default schema `nx_core`

### Database Architecture
**Connection**: localhost:5432/nexus_hrms
**User**: rameshbabu
**Default Schema**: nx_core

**Schema Organization** (10 schemas):
- `nx_core`: Company, user, location, roles (✅ Active)
- `nx_hr`: Employee & HR data (🔄 Next phase)
- `nx_time`: Attendance & time tracking
- `nx_leave`: Leave management
- `nx_fin`: Payroll & finance
- `nx_perf`: Performance management
- `nx_recruit`: Recruitment
- `nx_ref`: Reference data
- `nx_audit`: Audit trails
- `nx_config`: Configuration

## Project Structure

```
simple-webapp/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── dashboard/      # Dashboard components
│   │   │   ├── users/          # User management (UserList, CreateUserForm, EditUser)
│   │   │   ├── companies/      # Company management (CompanyMaster, CompanyEdit, tabs)
│   │   │   ├── LoginButton.tsx
│   │   │   └── BuildInfo.tsx
│   │   ├── contexts/           # React Context providers
│   │   │   └── AuthContext.tsx # Authentication state management
│   │   ├── services/           # API service layer
│   │   │   ├── keycloak.ts     # Keycloak authentication service
│   │   │   ├── userService.ts  # User management API
│   │   │   └── companyService.ts # Company management API
│   │   ├── types/              # TypeScript type definitions
│   │   │   ├── user.ts
│   │   │   ├── permissions.ts
│   │   │   └── company.ts
│   │   ├── utils/              # Utility functions
│   │   │   └── permissions.ts
│   │   ├── tests/              # Test files (unit, integration, contract)
│   │   └── __mocks__/          # Mock implementations
│   ├── public/                 # Static assets
│   └── package.json
├── docs/                       # Documentation
│   ├── team_communication/     # Team communication docs
│   └── keycloak_setup/         # Keycloak setup guides
├── specs/                      # Feature specifications
│   └── 001-keycloak-auth-app/
├── scripts/                    # Automation scripts
├── .specify/                   # Specification templates
├── .claude/                    # Claude Code configuration
├── CHANGELOG.md               # Version history
├── AGENTS.md                  # AI agent documentation
└── claude.md                  # This file
```

## Development Workflow

### Git Flow Strategy
- **main**: Production-ready code (use for PRs when main branch context not available)
- **develop**: Integration branch
- **feature/***: Feature development (current: `feature/company-crud-frontend-integration`)
- **release/***: Release preparation
- **hotfix/***: Emergency fixes

### Branch Naming Convention
```
feature/descriptive-feature-name
bugfix/issue-description
hotfix/critical-fix-name
release/version-number
```

### Commit Message Convention
```
feat: Add new feature
fix: Bug fix
refactor: Code refactoring
docs: Documentation update
test: Test additions or modifications
chore: Maintenance tasks
```

## Development Principles

### KISS Principle
**Keep It Short and Simple**
- Build one feature at a time
- Test thoroughly before moving to next feature
- Avoid over-engineering
- Prioritize code readability

### Code Standards
- **Type Safety**: Full TypeScript coverage required
- **Component Structure**: Reusable, testable components
- **Service Layer**: Separate API calls from components
- **Error Handling**: Comprehensive error management with user feedback
- **Loading States**: Proper loading indicators during async operations
- **Naming**: Use `nx_` prefix for database schemas

## Authentication & Security

### Keycloak Configuration
**Required Environment Variables** (in `frontend/.env`):
```bash
REACT_APP_KEYCLOAK_URL=http://localhost:8090
REACT_APP_KEYCLOAK_REALM=systech
REACT_APP_KEYCLOAK_CLIENT=systech-hrms-client
```

### Permission System
Three-tier role-based access control:
- **platform-admins**: Full system access (all operations)
- **app-admins**: Application administration (user management)
- **users**: Standard user access (view own profile)

### Security Implementation
- SSO authentication with Keycloak
- Automatic token refresh
- Secure token storage in memory (not localStorage)
- Session cleanup on logout
- Role validation on both client and server (planned)

## Testing Strategy

### Test Types
1. **Unit Tests**: Component and utility function testing
2. **Integration Tests**: Authentication flows and user management
3. **Contract Tests**: API contract validation with Keycloak
4. **Coverage**: Target comprehensive coverage

### Testing Commands
```bash
npm test                # Watch mode
npm run test:coverage   # Generate coverage report
npm run test:ci         # CI pipeline (no watch, passes with no tests)
```

### Mock Support
- Keycloak JS mock: `frontend/src/__mocks__/keycloak-js.js`
- Mock configurations in `package.json` jest config
- Supports offline development

## Architecture Patterns

### Frontend Patterns
- **Context API**: Centralized auth state (AuthContext)
- **Component Composition**: Modular, reusable components
- **Protected Routes**: Authentication-based routing
- **Service Layer**: API abstraction in `/services`
- **Type Safety**: Comprehensive TypeScript interfaces in `/types`

### Backend Patterns (Planned)
- **GraphQL Resolvers**: Query and mutation handling
- **Entity-Relationship**: JPA entity mappings
- **Service Layer**: Business logic separation
- **Repository Pattern**: Data access abstraction
- **Schema-based Multi-tenancy**: Using PostgreSQL schemas

## Current Development Status

### ✅ Completed (v1.0.0)
- Keycloak SSO integration
- User management CRUD with RBAC
- Group management and assignment
- Dashboard with glassmorphism UI
- Profile management
- Admin interface
- Responsive design

### 🔄 In Progress
- **Feature**: Company CRUD frontend integration
- **Branch**: `feature/company-crud-frontend-integration`
- **Files Modified**:
  - `frontend/src/components/companies/CompanyEdit.tsx`
  - `frontend/src/components/companies/tabs/CompanyTab.tsx`
  - `frontend/src/services/companyService.ts`
- **Recent Work**: Country dropdown support for company updates (backend v1.1)

### 📋 Planned (v1.1.0)
- Spring Boot backend setup
- Enhanced group management UI
- Bulk user operations
- Advanced search and filtering
- Employee master data management

### 🔮 Future (v1.2.0+)
- Time and attendance tracking
- Leave management
- Performance management
- Payroll integration

## Sample Data

### Test Accounts
- **Admin User**: admin@systechsolutions.com
- **Test User**: babu.systech (with various group memberships)

### Reference Data
- **Company**: SysTech Solutions Private Limited
- **Location Data**: Countries, states, cities for dropdown testing

## Common Development Tasks

### Adding a New Feature
1. Create feature branch: `git checkout -b feature/feature-name`
2. Review existing patterns in similar components
3. Create types in `/types` if needed
4. Implement service layer in `/services`
5. Build components in `/components`
6. Add tests in `/tests`
7. Update CHANGELOG.md
8. Test thoroughly before committing

### Adding a New Component
1. Place in appropriate directory under `/components`
2. Define TypeScript interfaces/types
3. Use AuthContext for authentication state
4. Implement proper error handling and loading states
5. Add unit tests
6. Follow existing styling patterns (glassmorphism)

### Calling Backend APIs
1. Create/update service file in `/services`
2. Define TypeScript types for request/response
3. Use Keycloak token for authentication
4. Handle errors gracefully
5. Show loading states in UI
6. Add contract tests for API integration

### Working with Permissions
1. Check user groups via AuthContext
2. Use utility functions from `/utils/permissions.ts`
3. Implement UI-level permission checks
4. Plan for server-side validation (when backend ready)
5. Test with different user roles

## Debugging Tips

### Common Issues
1. **Keycloak Connection**: Check if Keycloak is running at localhost:8090
2. **Token Errors**: Clear browser cache and re-login
3. **Permission Errors**: Verify user's group memberships in Keycloak
4. **Build Errors**: Delete `node_modules` and `package-lock.json`, reinstall
5. **Test Failures**: Check mock configurations in package.json

### Useful Commands
```bash
# Check running processes
lsof -i :3000  # Frontend port
lsof -i :8090  # Keycloak port
lsof -i :5432  # PostgreSQL port

# Kill stuck processes
kill -9 <PID>

# Clean install
rm -rf node_modules package-lock.json
npm install

# Database connection test
psql -h localhost -p 5432 -U rameshbabu -d nexus_hrms
```

## API Integration Patterns

### Current (Keycloak Admin API)
- RESTful endpoints
- Bearer token authentication
- Base URL: Keycloak server URL + `/admin/realms/{realm}`

### Planned (Backend GraphQL)
- Primary endpoint: `/graphql`
- Mutations for data modifications
- Queries for data retrieval
- REST fallback for file operations at `/api/*`

### Service Layer Pattern
```typescript
// Example service structure
export const exampleService = {
  getAll: async (): Promise<Type[]> => {
    // API call with error handling
  },
  getById: async (id: string): Promise<Type> => {
    // Single item retrieval
  },
  create: async (data: CreateType): Promise<Type> => {
    // Creation with validation
  },
  update: async (id: string, data: UpdateType): Promise<Type> => {
    // Update with version check
  },
  delete: async (id: string): Promise<void> => {
    // Safe deletion
  }
};
```

## Design System

### Glassmorphism UI
- Semi-transparent backgrounds with blur effects
- Subtle borders and shadows
- Modern, clean aesthetic
- Consistent color scheme
- Responsive breakpoints

### Component Styling
- CSS modules or inline styles
- Consistent spacing and padding
- Accessible color contrasts
- Mobile-first responsive design

## Performance Considerations

### Frontend Optimization
- Lazy loading for routes (when implemented)
- Memoization for expensive computations
- Proper React key usage in lists
- Avoid unnecessary re-renders
- Optimize bundle size

### Backend Optimization (Planned)
- GraphQL query optimization
- Database indexing strategy
- Caching layers
- Connection pooling
- Query batching

## Documentation Standards

### Code Documentation
- JSDoc comments for complex functions
- Type definitions for all interfaces
- README files in major directories
- Inline comments for complex logic

### API Documentation
- GraphQL schema documentation (planned)
- REST endpoint documentation
- Request/response examples
- Error code documentation

## Deployment Readiness

### Build Process
```bash
cd frontend
npm run build
# Outputs to frontend/build/
```

### Production Configuration
- Environment-specific variables
- Optimized production build
- Security headers
- Error tracking (to be implemented)

## Additional Resources

### Documentation Locations
- **Setup Guides**: `/docs/` directory
- **Keycloak Setup**: `/docs/keycloak_setup/`
- **Team Communication**: `/docs/team_communication/`
- **Feature Specs**: `/specs/` directory
- **Changelog**: `CHANGELOG.md`
- **AI Agents**: `AGENTS.md`

### External References
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Contact & Support

**Project Lead**: Ramesh Babu
**Repository**: git@github.com:Rameshbabupv/simple-webapp.git

---

## Notes for AI Assistants

### Context Priorities
1. Always check current branch and modified files before starting work
2. Read relevant service files before modifying components
3. Maintain consistency with existing patterns
4. Test changes thoroughly before marking complete
5. Update documentation when adding features

### File Reading Strategy
1. Start with `get_symbols_overview` for code files
2. Use symbolic tools (`find_symbol`) for targeted reading
3. Read full files only when necessary
4. Check `/types` for TypeScript definitions first
5. Review `/services` for API integration patterns

### Common Workflows
- **Bug fixes**: Read component, identify issue, fix, test
- **New features**: Design types, implement service, build component, test
- **Refactoring**: Understand dependencies first, refactor incrementally
- **API integration**: Define types, create service, mock for testing

### Memory Usage
- Project overview: `systech-nexus-platform-overview` memory available
- Add new memories for complex architectural decisions
- Document patterns that should be replicated

---

*Last Updated: 2025-10-20*
*Version: 1.0*
