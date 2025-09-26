# Systech Realm - Developer Integration Guide

## 🏢 Overview

**Realm Name**: `systech`
**Display Name**: Systech Platform
**Keycloak Server**: http://localhost:8090
**Realm URL**: http://localhost:8090/realms/systech

## 🔐 Authentication Architecture

### **User Groups & Access Levels**

| Group | Purpose | Access Level |
|-------|---------|--------------|
| **platform-admins** | System administrators | Full platform control, user management, system configuration |
| **app-admins** | Application administrators | Application management, user assignment, app configuration |
| **users** | End users | Standard application access, personal profile management |

### **Test Credentials**

| Username | Password | Group | Email |
|----------|----------|-------|-------|
| `babu.systech` | `systech@123` | platform-admins | babu@systech.com |

*Note: Add more test users as needed for your development team*

## 🚀 Integration Endpoints

### **Base URLs**
```
Keycloak Server: http://localhost:8090
Realm Base URL: http://localhost:8090/realms/systech
Admin API: http://localhost:8090/admin/realms/systech
```

### **Authentication Endpoints**
```
Token Endpoint: http://localhost:8090/realms/systech/protocol/openid-connect/token
Authorization: http://localhost:8090/realms/systech/protocol/openid-connect/auth
Userinfo: http://localhost:8090/realms/systech/protocol/openid-connect/userinfo
Logout: http://localhost:8090/realms/systech/protocol/openid-connect/logout
```

### **Configuration Endpoints**
```
Well-known Config: http://localhost:8090/realms/systech/.well-known/openid_configuration
JWKS (Public Keys): http://localhost:8090/realms/systech/protocol/openid-connect/certs
```

## 💻 Development Examples

### **1. Get Access Token (Password Grant)**
```bash
curl -X POST http://localhost:8090/realms/systech/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "username=babu.systech" \
  -d "password=systech@123"
```

### **2. Validate Token & Get User Info**
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     http://localhost:8090/realms/systech/protocol/openid-connect/userinfo
```

### **3. Refresh Token**
```bash
curl -X POST http://localhost:8090/realms/systech/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "refresh_token=YOUR_REFRESH_TOKEN"
```

## 🔧 Client Configuration

### **Required Client Settings**

When creating your application client in Keycloak:

```json
{
  "clientId": "your-app-name",
  "enabled": true,
  "protocol": "openid-connect",
  "publicClient": false,
  "standardFlowEnabled": true,
  "directAccessGrantsEnabled": true,
  "serviceAccountsEnabled": false,
  "redirectUris": [
    "http://localhost:3000/*",
    "http://localhost:8080/*"
  ],
  "webOrigins": [
    "http://localhost:3000",
    "http://localhost:8080"
  ]
}
```

### **Spring Boot Configuration**

Add to your `application.yml`:

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:8090/realms/systech
          jwk-set-uri: http://localhost:8090/realms/systech/protocol/openid-connect/certs

keycloak:
  realm: systech
  auth-server-url: http://localhost:8090
  resource: your-client-id
  public-client: true
```

### **React/Frontend Configuration**

```javascript
const keycloakConfig = {
  url: 'http://localhost:8090/',
  realm: 'systech',
  clientId: 'your-frontend-client'
};
```

## 👥 User Management

### **Group-Based Authorization**

Use JWT token claims to check user groups:

```json
{
  "exp": 1234567890,
  "iat": 1234567890,
  "iss": "http://localhost:8090/realms/systech",
  "sub": "1cef29ef-a6e4-4bc4-9f8a-ec7c6b0a155c",
  "preferred_username": "babu.systech",
  "email": "babu@systech.com",
  "groups": ["/platform-admins"],
  "realm_access": {
    "roles": ["default-roles-systech"]
  }
}
```

### **Authorization Examples**

**Backend (Spring Boot)**:
```java
@PreAuthorize("hasRole('platform-admins')")
@GetMapping("/admin/users")
public List<User> getUsers() {
    // Only platform-admins can access
}

@PreAuthorize("hasAnyRole('platform-admins', 'app-admins')")
@PostMapping("/admin/settings")
public void updateSettings() {
    // Both platform-admins and app-admins can access
}
```

**Frontend (React)**:
```javascript
const isAdmin = keycloak.hasRealmRole('platform-admins');
const canManageApps = keycloak.hasRealmRole('app-admins') ||
                      keycloak.hasRealmRole('platform-admins');

{isAdmin && <AdminPanel />}
{canManageApps && <AppManagement />}
```

## 🔒 Security Best Practices

### **Token Validation**
- Always validate JWT tokens using Keycloak's public keys
- Check token expiration (`exp` claim)
- Verify issuer (`iss` claim) matches your realm
- Validate audience (`aud` claim) if configured

### **Group/Role Checking**
- Use `groups` claim for authorization decisions
- Implement hierarchical permissions (platform-admins > app-admins > users)
- Cache group memberships appropriately

### **CORS Configuration**
- Configure proper CORS settings in Keycloak client
- Match your frontend URLs exactly
- Avoid wildcards in production

## 🧪 Testing & Development

### **Quick Token Test**
```bash
# Get token and test API call
TOKEN=$(curl -s -X POST http://localhost:8090/realms/systech/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=account" \
  -d "username=babu.systech" \
  -d "password=systech@123" | jq -r '.access_token')

# Use token to call your API
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:8080/api/protected-endpoint
```

### **JWT Debugging**
Use https://jwt.io to decode and inspect your tokens during development.

## 📋 Integration Checklist

### **Backend Integration**
- [ ] Add Keycloak dependencies to your project
- [ ] Configure JWT validation with realm public keys
- [ ] Implement group-based authorization
- [ ] Add CORS configuration for your frontend
- [ ] Test protected endpoints with tokens

### **Frontend Integration**
- [ ] Install Keycloak JavaScript adapter
- [ ] Configure realm and client settings
- [ ] Implement login/logout flows
- [ ] Add role-based UI rendering
- [ ] Handle token refresh automatically

### **Client Configuration**
- [ ] Create client in Keycloak admin console
- [ ] Configure redirect URIs for your app
- [ ] Set appropriate client settings (public/confidential)
- [ ] Add role mappings if needed
- [ ] Test authentication flow end-to-end

## 🆘 Troubleshooting

### **Common Issues**

**CORS Errors**:
- Check Web Origins in client configuration
- Ensure exact URL matches (no trailing slashes)

**Token Validation Failures**:
- Verify issuer URI matches realm URL
- Check system clock synchronization
- Ensure JWK endpoint is accessible

**Role/Group Access Denied**:
- Verify user group assignments
- Check JWT token groups claim
- Confirm authorization logic in your app

### **Debug Commands**
```bash
# Check realm configuration
curl -s http://localhost:8090/realms/systech/.well-known/openid_configuration | jq .

# Check public keys
curl -s http://localhost:8090/realms/systech/protocol/openid-connect/certs | jq .

# Test user authentication
curl -X POST http://localhost:8090/realms/systech/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=account" \
  -d "username=babu.systech" \
  -d "password=systech@123"
```

## 📞 Support

**Keycloak Admin Console**: http://localhost:8090/admin
**Realm Management**: Navigate to systech realm in admin console
**User Management**: Users section in systech realm

---

**Document Version**: 1.0
**Last Updated**: $(date +%Y-%m-%d)
**Created for**: Systech Platform Development Team