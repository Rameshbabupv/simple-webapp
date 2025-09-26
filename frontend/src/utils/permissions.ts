import { authService } from '../services/keycloak';
import {
  Permission,
  UserRole,
  USER_ROLES,
  PERMISSIONS,
  RoleName
} from '../types/permissions';
import { UserGroups } from '../types/user';

export class PermissionManager {
  /**
   * Get the current user's highest role based on group membership
   * Per spec: Users with multiple group memberships receive highest privilege level
   */
  getCurrentUserRole(): UserRole | null {
    if (!authService.isAuthenticated()) {
      return null;
    }

    const user = authService.getUser();
    if (!user || !user.groups) {
      return null;
    }

    // Check groups in order of priority (highest first)
    const groupPriorityOrder = [
      UserGroups.PLATFORM_ADMINS,
      UserGroups.APP_ADMINS,
      UserGroups.USERS
    ];

    for (const groupName of groupPriorityOrder) {
      if (this.hasGroup(groupName)) {
        return USER_ROLES[groupName as RoleName];
      }
    }

    // Fallback to users role if no specific group found
    return USER_ROLES[UserGroups.USERS];
  }

  /**
   * Check if current user has a specific group
   */
  hasGroup(groupName: string): boolean {
    return authService.hasGroup(groupName);
  }

  /**
   * Check if current user can perform a specific action on a resource
   */
  can(permission: Permission): boolean {
    const userRole = this.getCurrentUserRole();
    if (!userRole) {
      return false;
    }

    return userRole.permissions.some(p =>
      p.action === permission.action && p.resource === permission.resource
    );
  }

  /**
   * Check if current user can create users
   * Per spec: platform-admins and app-admins can create users
   */
  canCreateUsers(): boolean {
    return this.can(PERMISSIONS.CREATE_USERS);
  }

  /**
   * Check if current user can manage groups
   * Per spec: Only platform-admins can manage groups
   */
  canManageGroups(): boolean {
    return this.can(PERMISSIONS.CREATE_GROUPS);
  }

  /**
   * Check if current user can view all users
   * Per spec: platform-admins and app-admins can view users
   */
  canViewUsers(): boolean {
    return this.can(PERMISSIONS.READ_USERS);
  }

  /**
   * Check if current user can delete users
   * Per spec: Only platform-admins can delete users
   */
  canDeleteUsers(): boolean {
    return this.can(PERMISSIONS.DELETE_USERS);
  }

  /**
   * Check if current user can update users
   * Per spec: platform-admins and app-admins can update users
   */
  canUpdateUsers(): boolean {
    return this.can(PERMISSIONS.UPDATE_USERS);
  }

  /**
   * Check if current user has admin access (platform or app admin)
   */
  isAdmin(): boolean {
    return this.hasGroup(UserGroups.PLATFORM_ADMINS) ||
           this.hasGroup(UserGroups.APP_ADMINS);
  }

  /**
   * Check if current user is platform admin (full access)
   */
  isPlatformAdmin(): boolean {
    return this.hasGroup(UserGroups.PLATFORM_ADMINS);
  }

  /**
   * Check if current user is app admin (user creation only)
   */
  isAppAdmin(): boolean {
    return this.hasGroup(UserGroups.APP_ADMINS);
  }

  /**
   * Check if current user is regular user (profile view only)
   */
  isRegularUser(): boolean {
    const currentRole = this.getCurrentUserRole();
    return currentRole?.name === UserGroups.USERS;
  }

  /**
   * Get list of actions current user can perform
   */
  getAvailableActions(): Permission[] {
    const userRole = this.getCurrentUserRole();
    return userRole ? userRole.permissions : [];
  }

  /**
   * Get user's role display name
   */
  getUserRoleDisplayName(): string {
    const role = this.getCurrentUserRole();
    if (!role) return 'Guest';

    switch (role.name) {
      case UserGroups.PLATFORM_ADMINS:
        return 'Platform Administrator';
      case UserGroups.APP_ADMINS:
        return 'Application Administrator';
      case UserGroups.USERS:
        return 'User';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get menu items based on user permissions
   */
  getAuthorizedMenuItems(): Array<{
    id: string;
    label: string;
    path: string;
    icon?: string;
    requiredPermission: Permission;
  }> {
    const allMenuItems = [
      {
        id: 'profile',
        label: 'My Profile',
        path: '/profile',
        icon: '👤',
        requiredPermission: PERMISSIONS.READ_PROFILE
      },
      {
        id: 'users',
        label: 'User Management',
        path: '/users',
        icon: '👥',
        requiredPermission: PERMISSIONS.READ_USERS
      },
      {
        id: 'groups',
        label: 'Group Management',
        path: '/groups',
        icon: '🏢',
        requiredPermission: PERMISSIONS.READ_GROUPS
      },
      {
        id: 'admin',
        label: 'Administration',
        path: '/admin',
        icon: '⚙️',
        requiredPermission: PERMISSIONS.ADMIN_ACCESS
      }
    ];

    return allMenuItems.filter(item => this.can(item.requiredPermission));
  }

  /**
   * Check if current user should be automatically assigned admin privileges
   * Per spec: First user to log in automatically receives admin privileges
   */
  async shouldReceiveAdminPrivileges(): Promise<boolean> {
    // This would typically check if any admin users exist
    // For now, we'll implement the basic check
    const currentUser = authService.getUser();
    if (!currentUser) {
      return false;
    }

    // Check if user already has admin privileges
    if (this.isAdmin()) {
      return false;
    }

    // TODO: Implement logic to check if this is the first user
    // This would require calling the user service to count existing admin users
    return false;
  }

  /**
   * Require permission - throws error if not authorized
   */
  requirePermission(permission: Permission): void {
    if (!this.can(permission)) {
      const userRole = this.getCurrentUserRole();
      throw new Error(
        `Access denied. Required permission: ${permission.action} ${permission.resource}. ` +
        `Current role: ${userRole?.name || 'none'}`
      );
    }
  }

  /**
   * Require admin access - throws error if not admin
   */
  requireAdmin(): void {
    if (!this.isAdmin()) {
      throw new Error('Admin privileges required');
    }
  }

  /**
   * Require platform admin access - throws error if not platform admin
   */
  requirePlatformAdmin(): void {
    if (!this.isPlatformAdmin()) {
      throw new Error('Platform administrator privileges required');
    }
  }
}

// Singleton instance
export const permissions = new PermissionManager();

// Convenience functions for common permission checks
export const canCreateUsers = () => permissions.canCreateUsers();
export const canManageGroups = () => permissions.canManageGroups();
export const canViewUsers = () => permissions.canViewUsers();
export const canDeleteUsers = () => permissions.canDeleteUsers();
export const canUpdateUsers = () => permissions.canUpdateUsers();
export const isAdmin = () => permissions.isAdmin();
export const isPlatformAdmin = () => permissions.isPlatformAdmin();
export const isAppAdmin = () => permissions.isAppAdmin();
export const getUserRoleDisplayName = () => permissions.getUserRoleDisplayName();
export const getAuthorizedMenuItems = () => permissions.getAuthorizedMenuItems();