# Data Model: Keycloak Authentication & Role Management App

## Core Entities

### User
Represents authenticated individuals managed through Keycloak
- **id**: string - Keycloak user UUID
- **username**: string - Unique username for login
- **email**: string - User email address (required)
- **firstName**: string - User's first name
- **lastName**: string - User's last name
- **groups**: Group[] - Array of groups user belongs to
- **enabled**: boolean - Whether user account is active
- **createdTimestamp**: number - Unix timestamp of user creation

**Relationships**:
- Many-to-many with Group (via group membership)
- One-to-many with UserSession (active sessions)

**Validation Rules**:
- email must be valid email format
- username must be unique across realm
- At least one group membership required

### Group
Represents role categories for access control
- **id**: string - Keycloak group UUID
- **name**: string - Group name (platform-admins, app-admins, users)
- **path**: string - Group hierarchy path in Keycloak
- **members**: User[] - Users belonging to this group
- **attributes**: Record<string, string[]> - Custom group attributes

**Relationships**:
- Many-to-many with User (via group membership)

**Validation Rules**:
- name must be one of: platform-admins, app-admins, users
- path format: /group-name
- Cannot delete group with existing members

### UserSession
Represents active authentication state
- **user**: User - Associated user object
- **token**: string - Access token from Keycloak
- **refreshToken**: string - Refresh token for token renewal
- **expiresIn**: number - Token expiration time in seconds
- **isOffline**: boolean - Whether session is cached offline

**Relationships**:
- Many-to-one with User (user sessions)

**State Transitions**:
- ACTIVE → EXPIRED (token expires)
- ACTIVE → OFFLINE (Keycloak unavailable)
- OFFLINE → ACTIVE (Keycloak reconnects)
- EXPIRED → ACTIVE (successful refresh)

### Permission
Represents specific actions users can perform
- **action**: 'create' | 'read' | 'update' | 'delete' - CRUD operations
- **resource**: 'users' | 'groups' | 'profile' - Resource types
- **level**: number - Permission hierarchy level (1=platform-admin, 2=app-admin, 3=user)

**Permission Matrix**:
```
platform-admins (level 1): all actions on all resources
app-admins (level 2): create/read/update on users, read on groups/profile
users (level 3): read on profile only
```

## Data Flow

### Authentication Flow
1. User provides credentials → Keycloak validates
2. Keycloak returns tokens + user info
3. System fetches user groups from Keycloak
4. UserSession created with permissions calculated
5. Session stored in context + localStorage backup

### User Creation Flow
1. Admin user initiates user creation
2. Validate admin has 'create' permission on 'users'
3. Call Keycloak Admin API to create user
4. Assign user to specified groups
5. Return created User object with group memberships

### Group Management Flow
1. Platform-admin creates group via Keycloak Admin API
2. Group object stored in Keycloak with predefined attributes
3. Users assigned to groups via Keycloak group membership API
4. Permission levels calculated based on group hierarchy

### Offline Data Handling
1. Last successful UserSession cached in localStorage
2. User and Group data cached for offline viewing
3. Write operations queued until online
4. Cache invalidated after 24 hours or explicit logout

## Implementation Notes

- All data persistence handled by Keycloak
- Application acts as frontend client only
- No local database required
- Caching used only for offline support and performance