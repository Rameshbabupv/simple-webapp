import { authService } from './keycloak';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserListResponse,
  UserGroup,
  UserGroups
} from '../types/user';

// Keycloak API response types
interface KeycloakUser {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  createdTimestamp?: number;
  attributes?: Record<string, string[]>;
}

interface KeycloakGroup {
  id: string;
  name: string;
  path: string;
}

export class UserService {
  private baseUrl: string;
  private realm: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_KEYCLOAK_URL || '';
    this.realm = process.env.REACT_APP_KEYCLOAK_REALM || '';
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = await this.getAuthHeaders();
    const url = `${this.baseUrl}/admin/realms/${this.realm}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // Some endpoints return empty responses
    if (response.status === 204 || response.status === 201) {
      return {} as T;
    }

    return response.json();
  }

  /**
   * Get all users from Keycloak
   */
  async getAllUsers(first = 0, max = 100): Promise<UserListResponse> {
    try {
      const users = await this.makeRequest<KeycloakUser[]>(`/users?first=${first}&max=${max}`);

      // Fetch groups for each user
      const usersWithGroups = await Promise.all(
        users.map(async (user) => {
          const groups = await this.getUserGroups(user.id);
          return {
            id: user.id,
            username: user.username,
            email: user.email || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            enabled: user.enabled,
            groups: groups.map(g => g.name),
            roles: groups.map(g => g.name), // For compatibility
            createdTimestamp: user.createdTimestamp,
            attributes: user.attributes,
          } as User;
        })
      );

      return {
        users: usersWithGroups,
        total: usersWithGroups.length,
      };
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    try {
      const user = await this.makeRequest<KeycloakUser>(`/users/${userId}`);
      const groups = await this.getUserGroups(userId);

      return {
        id: user.id,
        username: user.username,
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        enabled: user.enabled,
        groups: groups.map(g => g.name),
        roles: groups.map(g => g.name),
        createdTimestamp: user.createdTimestamp,
        attributes: user.attributes,
      };
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw new Error('Failed to fetch user');
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserRequest): Promise<string> {
    try {
      const keycloakUser = {
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        enabled: userData.enabled ?? true,
        credentials: [{
          type: 'password',
          value: userData.password,
          temporary: false,
        }],
      };

      // Create user
      const response = await fetch(`${this.baseUrl}/admin/realms/${this.realm}/users`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(keycloakUser),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create user: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // Extract user ID from Location header
      const location = response.headers.get('Location');
      if (!location) {
        throw new Error('Failed to get created user ID');
      }

      const userId = location.split('/').pop();
      if (!userId) {
        throw new Error('Failed to parse user ID from response');
      }

      // Assign to default groups (users group by default)
      const groupsToAssign = userData.groups || [UserGroups.USERS];
      for (const groupName of groupsToAssign) {
        await this.addUserToGroup(userId, groupName);
      }

      return userId;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, userData: UpdateUserRequest): Promise<void> {
    try {
      const updateData = {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        enabled: userData.enabled,
      };

      await this.makeRequest(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });
    } catch (error) {
      console.error('Failed to update user:', error);
      throw new Error('Failed to update user');
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await this.makeRequest(`/users/${userId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw new Error('Failed to delete user');
    }
  }

  /**
   * Get user's groups
   */
  async getUserGroups(userId: string): Promise<UserGroup[]> {
    try {
      const groups = await this.makeRequest<KeycloakGroup[]>(`/users/${userId}/groups`);
      return groups.map(group => ({
        id: group.id,
        name: group.name,
        path: group.path,
      }));
    } catch (error) {
      console.error('Failed to fetch user groups:', error);
      return [];
    }
  }

  /**
   * Add user to group
   */
  async addUserToGroup(userId: string, groupName: string): Promise<void> {
    try {
      // First, find the group by name
      const group = await this.findGroupByName(groupName);
      if (!group) {
        throw new Error(`Group '${groupName}' not found`);
      }

      await this.makeRequest(`/users/${userId}/groups/${group.id}`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('Failed to add user to group:', error);
      throw new Error('Failed to add user to group');
    }
  }

  /**
   * Remove user from group
   */
  async removeUserFromGroup(userId: string, groupName: string): Promise<void> {
    try {
      const group = await this.findGroupByName(groupName);
      if (!group) {
        throw new Error(`Group '${groupName}' not found`);
      }

      await this.makeRequest(`/users/${userId}/groups/${group.id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to remove user from group:', error);
      throw new Error('Failed to remove user from group');
    }
  }

  /**
   * Find group by name
   */
  private async findGroupByName(groupName: string): Promise<UserGroup | null> {
    try {
      const groups = await this.makeRequest<KeycloakGroup[]>('/groups');
      const group = groups.find(g => g.name === groupName);

      if (group) {
        return {
          id: group.id,
          name: group.name,
          path: group.path,
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to find group:', error);
      return null;
    }
  }

  /**
   * Get all available groups
   */
  async getAllGroups(): Promise<UserGroup[]> {
    try {
      const groups = await this.makeRequest<KeycloakGroup[]>('/groups');
      return groups.map(group => ({
        id: group.id,
        name: group.name,
        path: group.path,
      }));
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      throw new Error('Failed to fetch groups');
    }
  }
}

// Export singleton instance
export const userService = new UserService();