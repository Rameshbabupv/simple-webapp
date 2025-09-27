# Quickstart: Keycloak Authentication & Role Management App

## Prerequisites
- Keycloak server running on localhost:8090
- Node.js 18+ installed
- Modern web browser

## Setup Instructions

### 1. Keycloak Configuration
```bash
# Start Keycloak on port 8090
./keycloak.sh start-dev --http-port=8090

# Create realm 'webapp-test' or use existing realm
# Configure client for React app with:
# - Client ID: react-auth-app
# - Client authentication: OFF (public client)
# - Valid redirect URIs: http://localhost:3000/*
# - Web origins: http://localhost:3000
```

### 2. Application Setup
```bash
# Install dependencies
npm install

# Configure environment variables
echo "REACT_APP_KEYCLOAK_URL=http://localhost:8090" > .env
echo "REACT_APP_KEYCLOAK_REALM=webapp-test" >> .env
echo "REACT_APP_KEYCLOAK_CLIENT=react-auth-app" >> .env

# Start development server
npm start
```

## User Acceptance Testing

### Test Scenario 1: Initial Admin Setup
**Objective**: Verify first user becomes admin

1. Navigate to `http://localhost:3000`
2. Click "Login" button
3. Complete Keycloak authentication (create account if needed)
4. **Expected**: Redirected to dashboard with admin privileges
5. **Verify**: "User Management" and "Group Management" sections visible
6. **Verify**: User profile shows admin status

### Test Scenario 2: Group Creation
**Objective**: Admin can create predefined groups

1. Login as admin user
2. Navigate to "Group Management" section
3. Click "Create Group" button
4. Select "platform-admins" from dropdown
5. Click "Create"
6. **Expected**: Group created successfully
7. **Verify**: Group appears in groups list
8. Repeat for "app-admins" and "users" groups

### Test Scenario 3: User Creation and Assignment
**Objective**: Admin can create users and assign groups

1. Login as admin user
2. Navigate to "User Management" section
3. Click "Create User" button
4. Fill form:
   - Username: testuser1
   - Email: test1@example.com
   - First Name: Test
   - Last Name: User
   - Password: password123
   - Groups: Select "app-admins"
5. Click "Create User"
6. **Expected**: User created and assigned to group
7. **Verify**: User appears in users list with correct group

### Test Scenario 4: Role-Based Access Control
**Objective**: Different user types have appropriate permissions

1. Create user in "users" group (following Test Scenario 3)
2. Logout as admin
3. Login as the new user
4. **Expected**: Dashboard loads but limited options shown
5. **Verify**: No "User Management" section (users group = read-only)
6. **Verify**: Can view profile information only

### Test Scenario 5: Multiple Group Membership
**Objective**: Users with multiple groups get highest privileges

1. Login as admin
2. Assign existing user to both "users" and "app-admins" groups
3. Logout and login as that user
4. **Expected**: User has app-admin privileges (higher than users)
5. **Verify**: Can access user creation functionality
6. **Verify**: Cannot access group management (platform-admin only)

### Test Scenario 6: Offline Authentication
**Objective**: Cached authentication works when Keycloak unavailable

1. Login successfully and use application
2. Stop Keycloak server
3. Refresh browser page
4. **Expected**: Application loads with cached authentication
5. **Verify**: User profile and basic functionality work
6. **Verify**: Warning message about offline mode displayed
7. **Verify**: Write operations disabled/queued

### Test Scenario 7: Token Refresh
**Objective**: Authentication tokens refresh automatically

1. Login and wait for token expiration (or force expiration)
2. Perform any action requiring authentication
3. **Expected**: Token refreshed automatically
4. **Verify**: No login prompt shown
5. **Verify**: Action completes successfully

## Validation Checklist

### Functional Requirements
- [ ] FR-001: Connects to Keycloak on localhost:8090
- [ ] FR-002: Login functionality works
- [ ] FR-003: Logout cleans up session
- [ ] FR-004: Users can view profile and roles
- [ ] FR-005: First user gets admin privileges and can create groups
- [ ] FR-006: Admin users can create accounts
- [ ] FR-007: Admin users can assign users to groups
- [ ] FR-008: Admin users can view all users and memberships
- [ ] FR-009: Role-based access control enforced
- [ ] FR-010: UI elements change based on user role
- [ ] FR-011: Token refresh and offline caching work
- [ ] FR-012: Success/failure feedback provided

### User Experience
- [ ] Login flow is intuitive and secure
- [ ] Dashboard clearly shows user's capabilities
- [ ] Group and user management interfaces are clear
- [ ] Error messages are helpful and actionable
- [ ] Loading states provide appropriate feedback
- [ ] Responsive design works on different screen sizes

### Security
- [ ] No sensitive data in localStorage
- [ ] Tokens handled securely
- [ ] Protected routes require authentication
- [ ] Admin functions require appropriate permissions
- [ ] CORS configured correctly

### Performance
- [ ] Initial page load < 3 seconds
- [ ] Login response < 200ms after Keycloak authentication
- [ ] UI transitions < 100ms
- [ ] Token refresh happens seamlessly

## Troubleshooting

### Common Issues
1. **Keycloak connection failed**: Check Keycloak is running on port 8090
2. **Redirect loop**: Verify client configuration in Keycloak admin
3. **CORS errors**: Check web origins configuration in Keycloak client
4. **Token refresh failed**: Check client settings allow refresh token flow
5. **Groups not created**: Verify admin API permissions in Keycloak

### Reset Instructions
```bash
# Clear browser storage
localStorage.clear()
sessionStorage.clear()

# Reset Keycloak realm data (development only)
# Delete and recreate realm in Keycloak admin console
```