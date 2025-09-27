export interface Permission {
  action: 'create' | 'read' | 'update' | 'delete';
  resource: 'users' | 'groups' | 'profile' | 'admin';
}

export interface UserRole {
  name: string;
  permissions: Permission[];
  priority: number; // Higher number = higher privilege
}

export const PERMISSIONS = {
  // User management permissions
  CREATE_USERS: { action: 'create', resource: 'users' } as Permission,
  READ_USERS: { action: 'read', resource: 'users' } as Permission,
  UPDATE_USERS: { action: 'update', resource: 'users' } as Permission,
  DELETE_USERS: { action: 'delete', resource: 'users' } as Permission,

  // Group management permissions
  CREATE_GROUPS: { action: 'create', resource: 'groups' } as Permission,
  READ_GROUPS: { action: 'read', resource: 'groups' } as Permission,
  UPDATE_GROUPS: { action: 'update', resource: 'groups' } as Permission,
  DELETE_GROUPS: { action: 'delete', resource: 'groups' } as Permission,

  // Profile permissions
  READ_PROFILE: { action: 'read', resource: 'profile' } as Permission,
  UPDATE_PROFILE: { action: 'update', resource: 'profile' } as Permission,

  // Admin permissions
  ADMIN_ACCESS: { action: 'read', resource: 'admin' } as Permission,
} as const;

// Role definitions based on spec requirements
export const USER_ROLES: Record<string, UserRole> = {
  'platform-admins': {
    name: 'platform-admins',
    priority: 3,
    permissions: [
      PERMISSIONS.CREATE_USERS,
      PERMISSIONS.READ_USERS,
      PERMISSIONS.UPDATE_USERS,
      PERMISSIONS.DELETE_USERS,
      PERMISSIONS.CREATE_GROUPS,
      PERMISSIONS.READ_GROUPS,
      PERMISSIONS.UPDATE_GROUPS,
      PERMISSIONS.DELETE_GROUPS,
      PERMISSIONS.READ_PROFILE,
      PERMISSIONS.UPDATE_PROFILE,
      PERMISSIONS.ADMIN_ACCESS,
    ]
  },
  'app-admins': {
    name: 'app-admins',
    priority: 2,
    permissions: [
      PERMISSIONS.CREATE_USERS,
      PERMISSIONS.READ_USERS,
      PERMISSIONS.UPDATE_USERS,
      PERMISSIONS.READ_PROFILE,
      PERMISSIONS.UPDATE_PROFILE,
    ]
  },
  'users': {
    name: 'users',
    priority: 1,
    permissions: [
      PERMISSIONS.READ_PROFILE,
      PERMISSIONS.UPDATE_PROFILE,
    ]
  }
};

export type RoleName = keyof typeof USER_ROLES;