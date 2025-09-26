export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  groups: string[];
  roles: string[];
  createdTimestamp?: number;
  attributes?: Record<string, string[]>;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  enabled?: boolean;
  groups?: string[];
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
}

export interface UserGroup {
  id: string;
  name: string;
  path: string;
}

export interface UserListResponse {
  users: User[];
  total: number;
}

export interface GroupMembership {
  userId: string;
  groupId: string;
  groupName: string;
}

export const UserGroups = {
  PLATFORM_ADMINS: 'platform-admins',
  APP_ADMINS: 'app-admins',
  USERS: 'users'
} as const;

export type UserGroupType = typeof UserGroups[keyof typeof UserGroups];