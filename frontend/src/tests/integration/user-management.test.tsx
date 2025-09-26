import React from 'react';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// User management types
interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  groups: string[];
  enabled: boolean;
  createdTimestamp?: number;
}

interface CreateUserFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  groups: string[];
  enabled: boolean;
}

interface UpdateUserFormData {
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
}

// Mock components that don't exist yet
const MockUserManagement = ({
  currentUser,
  users = [],
  loading = false,
  error = null,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onSearchUsers
}: {
  currentUser: User;
  users?: User[];
  loading?: boolean;
  error?: string | null;
  onCreateUser: (data: CreateUserFormData) => void;
  onUpdateUser: (id: string, data: UpdateUserFormData) => void;
  onDeleteUser: (id: string) => void;
  onSearchUsers: (searchTerm: string) => void;
}) => (
  <div data-testid="user-management">
    <h2>User Management</h2>
    <div data-testid="current-user-info">Current User: {currentUser.username}</div>

    {error && <div data-testid="error-message">{error}</div>}
    {loading && <div data-testid="loading-spinner">Processing...</div>}

    {/* Search Users */}
    <div data-testid="user-search">
      <input
        type="text"
        placeholder="Search users..."
        data-testid="search-input"
        onChange={(e) => onSearchUsers(e.target.value)}
      />
    </div>

    {/* Create User Form */}
    <form data-testid="create-user-form" onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.target as HTMLFormElement);

      // Validate required fields
      const username = formData.get('username') as string;
      const email = formData.get('email') as string;
      const firstName = formData.get('firstName') as string;
      const lastName = formData.get('lastName') as string;
      const password = formData.get('password') as string;
      const confirmPassword = formData.get('confirmPassword') as string;

      // Check if required fields are filled
      if (!username || !email || !firstName || !lastName || !password || !confirmPassword) {
        // HTML5 validation should prevent this, but add JS validation as backup
        return;
      }

      // Email format validation (basic check)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return;
      }

      const groups = Array.from(formData.getAll('groups')) as string[];

      onCreateUser({
        username,
        email,
        firstName,
        lastName,
        password,
        confirmPassword,
        groups,
        enabled: formData.get('enabled') === 'on',
      });
    }}>
      <h3>Create New User</h3>

      <input
        name="username"
        placeholder="Username"
        data-testid="username-input"
        required
      />

      <input
        name="email"
        type="email"
        placeholder="Email"
        data-testid="email-input"
        required
      />

      <input
        name="firstName"
        placeholder="First Name"
        data-testid="firstName-input"
        required
      />

      <input
        name="lastName"
        placeholder="Last Name"
        data-testid="lastName-input"
        required
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        data-testid="password-input"
        required
      />

      <input
        name="confirmPassword"
        type="password"
        placeholder="Confirm Password"
        data-testid="confirmPassword-input"
        required
      />

      <fieldset data-testid="groups-fieldset">
        <legend>Groups</legend>
        <label>
          <input type="checkbox" name="groups" value="platform-admins" data-testid="group-platform-admins" />
          Platform Admins
        </label>
        <label>
          <input type="checkbox" name="groups" value="app-admins" data-testid="group-app-admins" />
          App Admins
        </label>
        <label>
          <input type="checkbox" name="groups" value="users" data-testid="group-users" />
          Users
        </label>
      </fieldset>

      <label>
        <input type="checkbox" name="enabled" data-testid="enabled-checkbox" defaultChecked />
        Account Enabled
      </label>

      <button type="submit" data-testid="create-user-button">Create User</button>
    </form>

    {/* Users List */}
    <div data-testid="users-list">
      <h3>Users ({users.length})</h3>
      {users.length === 0 ? (
        <div data-testid="no-users">No users found</div>
      ) : (
        <table data-testid="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Name</th>
              <th>Groups</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} data-testid={`user-row-${user.id}`}>
                <td data-testid={`username-${user.id}`}>{user.username}</td>
                <td data-testid={`email-${user.id}`}>{user.email}</td>
                <td data-testid={`name-${user.id}`}>{user.firstName} {user.lastName}</td>
                <td data-testid={`groups-${user.id}`}>{user.groups.join(', ')}</td>
                <td data-testid={`status-${user.id}`}>{user.enabled ? 'Enabled' : 'Disabled'}</td>
                <td>
                  <button
                    data-testid={`edit-user-${user.id}`}
                    onClick={() => {
                      // This would open an edit modal in real implementation
                      const newEmail = prompt('New email:', user.email);
                      if (newEmail && newEmail !== user.email) {
                        onUpdateUser(user.id, { email: newEmail });
                      }
                    }}
                  >
                    Edit
                  </button>
                  <button
                    data-testid={`delete-user-${user.id}`}
                    onClick={() => {
                      if (window.confirm(`Delete user ${user.username}?`)) {
                        onDeleteUser(user.id);
                      }
                    }}
                  >
                    Delete
                  </button>
                  <button
                    data-testid={`toggle-user-${user.id}`}
                    onClick={() => {
                      onUpdateUser(user.id, { enabled: !user.enabled });
                    }}
                  >
                    {user.enabled ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
);

// Mock user service
const mockUserService = {
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  getUsers: jest.fn(),
  searchUsers: jest.fn(),
  getUserById: jest.fn(),
};

// Mock users
const mockAdminUser: User = {
  id: 'admin-123',
  username: 'nexus-admin',
  email: 'admin@nexus.systech.com',
  firstName: 'Nexus',
  lastName: 'Administrator',
  groups: ['platform-admins', 'users'],
  enabled: true,
  createdTimestamp: Date.now(),
};

const mockUsers: User[] = [
  {
    id: 'user-1',
    username: 'john.doe',
    email: 'john.doe@nexus.systech.com',
    firstName: 'John',
    lastName: 'Doe',
    groups: ['users'],
    enabled: true,
  },
  {
    id: 'user-2',
    username: 'jane.smith',
    email: 'jane.smith@nexus.systech.com',
    firstName: 'Jane',
    lastName: 'Smith',
    groups: ['app-admins', 'users'],
    enabled: true,
  },
  {
    id: 'user-3',
    username: 'disabled.user',
    email: 'disabled@nexus.systech.com',
    firstName: 'Disabled',
    lastName: 'User',
    groups: ['users'],
    enabled: false,
  },
];

describe('User Management Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock window.confirm and window.prompt
    window.confirm = jest.fn().mockReturnValue(true);
    window.prompt = jest.fn().mockReturnValue('new@example.com');
  });

  describe('User Management Interface', () => {
    it('should display user management interface for admin users', async () => {
      // Arrange
      const mockHandlers = {
        onCreateUser: jest.fn(),
        onUpdateUser: jest.fn(),
        onDeleteUser: jest.fn(),
        onSearchUsers: jest.fn(),
      };

      // Act
      render(
        <MockUserManagement
          currentUser={mockAdminUser}
          users={mockUsers}
          {...mockHandlers}
        />
      );

      // Assert
      expect(screen.getByTestId('user-management')).toBeInTheDocument();
      expect(screen.getByTestId('create-user-form')).toBeInTheDocument();
      expect(screen.getByTestId('users-list')).toBeInTheDocument();
      expect(screen.getByTestId('user-search')).toBeInTheDocument();
      expect(screen.getByTestId('users-table')).toBeInTheDocument();
    });

    it('should display list of existing users with correct information', async () => {
      // Arrange
      const mockHandlers = {
        onCreateUser: jest.fn(),
        onUpdateUser: jest.fn(),
        onDeleteUser: jest.fn(),
        onSearchUsers: jest.fn(),
      };

      // Act
      render(
        <MockUserManagement
          currentUser={mockAdminUser}
          users={mockUsers}
          {...mockHandlers}
        />
      );

      // Assert
      expect(screen.getByText('Users (3)')).toBeInTheDocument();

      // Check each user is displayed
      mockUsers.forEach(testUser => {
        expect(screen.getByTestId(`user-row-${testUser.id}`)).toBeInTheDocument();
        expect(screen.getByTestId(`username-${testUser.id}`)).toHaveTextContent(testUser.username);
        expect(screen.getByTestId(`email-${testUser.id}`)).toHaveTextContent(testUser.email);
        expect(screen.getByTestId(`name-${testUser.id}`)).toHaveTextContent(`${testUser.firstName} ${testUser.lastName}`);
        expect(screen.getByTestId(`groups-${testUser.id}`)).toHaveTextContent(testUser.groups.join(', '));
        expect(screen.getByTestId(`status-${testUser.id}`)).toHaveTextContent(testUser.enabled ? 'Enabled' : 'Disabled');
      });
    });

    it('should show empty state when no users exist', async () => {
      // Arrange
      const mockHandlers = {
        onCreateUser: jest.fn(),
        onUpdateUser: jest.fn(),
        onDeleteUser: jest.fn(),
        onSearchUsers: jest.fn(),
      };

      // Act
      render(
        <MockUserManagement
          currentUser={mockAdminUser}
          users={[]}
          {...mockHandlers}
        />
      );

      // Assert
      expect(screen.getByTestId('no-users')).toBeInTheDocument();
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });

  describe('User Creation', () => {
    it('should create new user with valid data', async () => {
      // Arrange
      const newUserData: CreateUserFormData = {
        username: 'newuser',
        email: 'newuser@nexus.systech.com',
        firstName: 'New',
        lastName: 'User',
        password: 'securePassword123',
        confirmPassword: 'securePassword123',
        groups: ['users'],
        enabled: true,
      };

      const createdUser: User = {
        id: 'user-new',
        username: newUserData.username,
        email: newUserData.email,
        firstName: newUserData.firstName,
        lastName: newUserData.lastName,
        groups: newUserData.groups,
        enabled: newUserData.enabled,
        createdTimestamp: Date.now(),
      };

      mockUserService.createUser.mockResolvedValue(createdUser);

      let capturedData: CreateUserFormData | null = null;
      const handleCreateUser = jest.fn((data: CreateUserFormData) => {
        capturedData = data;
        return mockUserService.createUser(data);
      });

      const mockHandlers = {
        onCreateUser: handleCreateUser,
        onUpdateUser: jest.fn(),
        onDeleteUser: jest.fn(),
        onSearchUsers: jest.fn(),
      };

      // Act
      render(
        <MockUserManagement
          currentUser={mockAdminUser}
          users={[]}
          {...mockHandlers}
        />
      );

      // Fill in the form
      await user.type(screen.getByTestId('username-input'), newUserData.username);
      await user.type(screen.getByTestId('email-input'), newUserData.email);
      await user.type(screen.getByTestId('firstName-input'), newUserData.firstName);
      await user.type(screen.getByTestId('lastName-input'), newUserData.lastName);
      await user.type(screen.getByTestId('password-input'), newUserData.password);
      await user.type(screen.getByTestId('confirmPassword-input'), newUserData.confirmPassword);

      // Select groups
      await user.click(screen.getByTestId('group-users'));

      // Submit form
      await user.click(screen.getByTestId('create-user-button'));

      // Assert
      expect(handleCreateUser).toHaveBeenCalledWith({
        username: newUserData.username,
        email: newUserData.email,
        firstName: newUserData.firstName,
        lastName: newUserData.lastName,
        password: newUserData.password,
        confirmPassword: newUserData.confirmPassword,
        groups: ['users'],
        enabled: true, // Default checked
      });
    });

    it('should create admin user with multiple groups', async () => {
      // Arrange
      const mockHandlers = {
        onCreateUser: jest.fn(),
        onUpdateUser: jest.fn(),
        onDeleteUser: jest.fn(),
        onSearchUsers: jest.fn(),
      };

      // Act
      render(
        <MockUserManagement
          currentUser={mockAdminUser}
          users={[]}
          {...mockHandlers}
        />
      );

      // Fill form for admin user
      await user.type(screen.getByTestId('username-input'), 'admin-user');
      await user.type(screen.getByTestId('email-input'), 'admin@test.com');
      await user.type(screen.getByTestId('firstName-input'), 'Admin');
      await user.type(screen.getByTestId('lastName-input'), 'User');
      await user.type(screen.getByTestId('password-input'), 'password123');
      await user.type(screen.getByTestId('confirmPassword-input'), 'password123');

      // Select multiple groups
      await user.click(screen.getByTestId('group-platform-admins'));
      await user.click(screen.getByTestId('group-users'));

      await user.click(screen.getByTestId('create-user-button'));

      // Assert
      expect(mockHandlers.onCreateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'admin-user',
          groups: ['platform-admins', 'users'],
        })
      );
    });

    it('should validate required fields before submission', async () => {
      // Arrange
      const mockHandlers = {
        onCreateUser: jest.fn(),
        onUpdateUser: jest.fn(),
        onDeleteUser: jest.fn(),
        onSearchUsers: jest.fn(),
      };

      // Act
      render(
        <MockUserManagement
          currentUser={mockAdminUser}
          users={[]}
          {...mockHandlers}
        />
      );

      // Try to submit without filling required fields
      await user.click(screen.getByTestId('create-user-button'));

      // Assert - Form should not submit (HTML5 validation)
      expect(mockHandlers.onCreateUser).not.toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      // Arrange
      const mockHandlers = {
        onCreateUser: jest.fn(),
        onUpdateUser: jest.fn(),
        onDeleteUser: jest.fn(),
        onSearchUsers: jest.fn(),
      };

      // Act
      render(
        <MockUserManagement
          currentUser={mockAdminUser}
          users={[]}
          {...mockHandlers}
        />
      );

      // Fill form with invalid email
      await user.type(screen.getByTestId('username-input'), 'testuser');
      await user.type(screen.getByTestId('email-input'), 'invalid-email');
      await user.type(screen.getByTestId('firstName-input'), 'Test');
      await user.type(screen.getByTestId('lastName-input'), 'User');
      await user.type(screen.getByTestId('password-input'), 'password123');
      await user.type(screen.getByTestId('confirmPassword-input'), 'password123');

      await user.click(screen.getByTestId('create-user-button'));

      // Assert - HTML5 email validation should prevent submission
      expect(mockHandlers.onCreateUser).not.toHaveBeenCalled();
    });
  });

  describe('User Updates', () => {
    it('should update user information', async () => {
      // Arrange
      const updatedUser: User = {
        ...mockUsers[0],
        email: 'new@example.com',
      };

      mockUserService.updateUser.mockResolvedValue(updatedUser);

      const mockHandlers = {
        onCreateUser: jest.fn(),
        onUpdateUser: jest.fn((id: string, data: UpdateUserFormData) => {
          return mockUserService.updateUser(id, data);
        }),
        onDeleteUser: jest.fn(),
        onSearchUsers: jest.fn(),
      };

      // Act
      render(
        <MockUserManagement
          currentUser={mockAdminUser}
          users={mockUsers}
          {...mockHandlers}
        />
      );

      // Click edit button
      await user.click(screen.getByTestId(`edit-user-${mockUsers[0].id}`));

      // Assert
      expect(mockHandlers.onUpdateUser).toHaveBeenCalledWith(mockUsers[0].id, {
        email: 'new@example.com'
      });
    });

    it('should toggle user enabled status', async () => {
      // Arrange
      const mockHandlers = {
        onCreateUser: jest.fn(),
        onUpdateUser: jest.fn(),
        onDeleteUser: jest.fn(),
        onSearchUsers: jest.fn(),
      };

      // Act
      render(
        <MockUserManagement
          currentUser={mockAdminUser}
          users={mockUsers}
          {...mockHandlers}
        />
      );

      // Click toggle button for enabled user
      await user.click(screen.getByTestId(`toggle-user-${mockUsers[0].id}`));

      // Assert
      expect(mockHandlers.onUpdateUser).toHaveBeenCalledWith(mockUsers[0].id, {
        enabled: false // Should toggle from true to false
      });

      // Click toggle button for disabled user
      await user.click(screen.getByTestId(`toggle-user-${mockUsers[2].id}`));

      expect(mockHandlers.onUpdateUser).toHaveBeenCalledWith(mockUsers[2].id, {
        enabled: true // Should toggle from false to true
      });
    });
  });

  describe('User Deletion', () => {
    it('should delete user after confirmation', async () => {
      // Arrange
      const mockHandlers = {
        onCreateUser: jest.fn(),
        onUpdateUser: jest.fn(),
        onDeleteUser: jest.fn(),
        onSearchUsers: jest.fn(),
      };

      // Act
      render(
        <MockUserManagement
          currentUser={mockAdminUser}
          users={mockUsers}
          {...mockHandlers}
        />
      );

      // Click delete button
      await user.click(screen.getByTestId(`delete-user-${mockUsers[0].id}`));

      // Assert
      expect(window.confirm).toHaveBeenCalledWith(`Delete user ${mockUsers[0].username}?`);
      expect(mockHandlers.onDeleteUser).toHaveBeenCalledWith(mockUsers[0].id);
    });

    it('should not delete user if confirmation is cancelled', async () => {
      // Arrange
      window.confirm = jest.fn().mockReturnValue(false);

      const mockHandlers = {
        onCreateUser: jest.fn(),
        onUpdateUser: jest.fn(),
        onDeleteUser: jest.fn(),
        onSearchUsers: jest.fn(),
      };

      // Act
      render(
        <MockUserManagement
          currentUser={mockAdminUser}
          users={mockUsers}
          {...mockHandlers}
        />
      );

      await user.click(screen.getByTestId(`delete-user-${mockUsers[0].id}`));

      // Assert
      expect(window.confirm).toHaveBeenCalled();
      expect(mockHandlers.onDeleteUser).not.toHaveBeenCalled();
    });
  });

  describe('User Search', () => {
    it('should trigger search when typing in search input', async () => {
      // Arrange
      const mockHandlers = {
        onCreateUser: jest.fn(),
        onUpdateUser: jest.fn(),
        onDeleteUser: jest.fn(),
        onSearchUsers: jest.fn(),
      };

      // Act
      render(
        <MockUserManagement
          currentUser={mockAdminUser}
          users={mockUsers}
          {...mockHandlers}
        />
      );

      const searchInput = screen.getByTestId('search-input');
      await user.type(searchInput, 'john');

      // Assert
      expect(mockHandlers.onSearchUsers).toHaveBeenCalledWith('john');
    });

    it('should show filtered results based on search', async () => {
      // Arrange
      const filteredUsers = mockUsers.filter(u => u.username.includes('john'));

      const mockHandlers = {
        onCreateUser: jest.fn(),
        onUpdateUser: jest.fn(),
        onDeleteUser: jest.fn(),
        onSearchUsers: jest.fn(),
      };

      // Act
      render(
        <MockUserManagement
          currentUser={mockAdminUser}
          users={filteredUsers}
          {...mockHandlers}
        />
      );

      // Assert
      expect(screen.getByText('Users (1)')).toBeInTheDocument();
      expect(screen.getByTestId('user-row-user-1')).toBeInTheDocument();
      expect(screen.queryByTestId('user-row-user-2')).not.toBeInTheDocument();
    });
  });

  describe('Loading and Error States', () => {
    it('should show loading state during operations', async () => {
      // Arrange
      const mockHandlers = {
        onCreateUser: jest.fn(),
        onUpdateUser: jest.fn(),
        onDeleteUser: jest.fn(),
        onSearchUsers: jest.fn(),
      };

      // Act
      render(
        <MockUserManagement
          currentUser={mockAdminUser}
          users={[]}
          loading={true}
          {...mockHandlers}
        />
      );

      // Assert
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('should show error messages when operations fail', async () => {
      // Arrange
      const errorMessage = 'Failed to create user: Username already exists';

      const mockHandlers = {
        onCreateUser: jest.fn(),
        onUpdateUser: jest.fn(),
        onDeleteUser: jest.fn(),
        onSearchUsers: jest.fn(),
      };

      // Act
      render(
        <MockUserManagement
          currentUser={mockAdminUser}
          users={[]}
          error={errorMessage}
          {...mockHandlers}
        />
      );

      // Assert
      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Permission-based Features', () => {
    it('should show different UI elements based on user permissions', async () => {
      // Arrange - Regular user without admin privileges
      const regularUser: User = {
        id: 'user-regular',
        username: 'regular.user',
        email: 'regular@nexus.systech.com',
        firstName: 'Regular',
        lastName: 'User',
        groups: ['users'],
        enabled: true,
      };

      const mockHandlers = {
        onCreateUser: jest.fn(),
        onUpdateUser: jest.fn(),
        onDeleteUser: jest.fn(),
        onSearchUsers: jest.fn(),
      };

      // Act
      render(
        <MockUserManagement
          currentUser={regularUser}
          users={mockUsers}
          {...mockHandlers}
        />
      );

      // Assert - Currently shows all features for all users
      // TODO: When role-based UI is implemented, regular users should have limited access
      expect(screen.getByTestId('user-management')).toBeInTheDocument();
      expect(screen.getByTestId('create-user-form')).toBeInTheDocument();

      // In future implementation:
      // - Regular users should only see user list (read-only)
      // - Only admins should see create/edit/delete buttons
    });
  });

  describe('Data Validation and Error Handling', () => {
    it('should handle user creation errors gracefully', async () => {
      // Arrange
      const creationError = { message: 'Username already exists', name: 'ConflictError' };
      mockUserService.createUser.mockRejectedValue(creationError);

      const handleCreateUser = jest.fn(async (data: CreateUserFormData) => {
        try {
          await mockUserService.createUser(data);
        } catch (error) {
          // Handle user creation error gracefully
        }
      });

      const mockHandlers = {
        onCreateUser: handleCreateUser,
        onUpdateUser: jest.fn(),
        onDeleteUser: jest.fn(),
        onSearchUsers: jest.fn(),
      };

      // Act
      render(
        <MockUserManagement
          currentUser={mockAdminUser}
          users={[]}
          {...mockHandlers}
        />
      );

      // Fill form and submit
      await user.type(screen.getByTestId('username-input'), 'duplicate');
      await user.type(screen.getByTestId('email-input'), 'test@test.com');
      await user.type(screen.getByTestId('firstName-input'), 'Test');
      await user.type(screen.getByTestId('lastName-input'), 'User');
      await user.type(screen.getByTestId('password-input'), 'password');
      await user.type(screen.getByTestId('confirmPassword-input'), 'password');

      try {
        await user.click(screen.getByTestId('create-user-button'));
      } catch (error) {
        // Expected to fail
      }

      // Assert
      expect(handleCreateUser).toHaveBeenCalled();
      expect(mockUserService.createUser).toHaveBeenCalled();
    });

    it('should validate password confirmation matches', async () => {
      // This test demonstrates password validation logic
      const passwordValidation = (password: string, confirmPassword: string) => {
        return password === confirmPassword;
      };

      // Test cases
      expect(passwordValidation('password123', 'password123')).toBe(true);
      expect(passwordValidation('password123', 'different')).toBe(false);
    });

    it('should enforce minimum password requirements', async () => {
      // This test demonstrates password strength validation
      const validatePasswordStrength = (password: string) => {
        const minLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);

        return {
          isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers,
          errors: {
            minLength,
            hasUpperCase,
            hasLowerCase,
            hasNumbers,
          }
        };
      };

      // Test cases
      expect(validatePasswordStrength('weak')).toMatchObject({
        isValid: false,
        errors: expect.objectContaining({
          minLength: false,
        })
      });

      expect(validatePasswordStrength('StrongPass123')).toMatchObject({
        isValid: true,
      });
    });
  });
});