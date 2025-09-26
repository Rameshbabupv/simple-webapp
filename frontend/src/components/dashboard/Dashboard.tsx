import React, { useState, useEffect } from 'react';
import { authService } from '../../services/keycloak';
import UserList from '../users/UserList';
import CreateUserForm from '../users/CreateUserForm';
import {
  isAdmin,
  canCreateUsers,
  canViewUsers,
  getUserRoleDisplayName
} from '../../utils/permissions';
import { User } from '../../types/user';

type ActiveView = 'overview' | 'users' | 'create-user' | 'profile' | 'groups';

export const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get current user info
  const currentUser = authService.getUser();
  const roleDisplayName = getUserRoleDisplayName();

  // Auto-select appropriate initial view based on permissions
  useEffect(() => {
    if (isAdmin() && canViewUsers()) {
      setActiveView('users');
    } else {
      setActiveView('profile');
    }
  }, []);

  const handleUserCreated = (userId: string) => {
    console.log('User created with ID:', userId);
    setRefreshTrigger(prev => prev + 1);
    setActiveView('users');
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    // Could open edit modal here in future
  };

  const renderOverview = () => (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#495057', marginBottom: '20px' }}>
        📊 System Overview
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* User Info Card */}
        <div style={{
          padding: '20px',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa'
        }}>
          <h4 style={{ color: '#495057', marginBottom: '15px' }}>👤 Your Account</h4>
          <div style={{ fontSize: '14px', color: '#6c757d' }}>
            <div><strong>Username:</strong> {currentUser?.username}</div>
            <div><strong>Name:</strong> {currentUser?.firstName} {currentUser?.lastName}</div>
            <div><strong>Email:</strong> {currentUser?.email}</div>
            <div><strong>Role:</strong> {roleDisplayName}</div>
            <div><strong>Groups:</strong> {currentUser?.groups?.join(', ') || 'None'}</div>
          </div>
        </div>

        {/* Quick Actions Card */}
        {isAdmin() && (
          <div style={{
            padding: '20px',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa'
          }}>
            <h4 style={{ color: '#495057', marginBottom: '15px' }}>⚡ Quick Actions</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {canViewUsers() && (
                <button
                  onClick={() => setActiveView('users')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  👥 Manage Users
                </button>
              )}
              {canCreateUsers() && (
                <button
                  onClick={() => setActiveView('create-user')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  ➕ Create New User
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Welcome Message */}
      <div style={{
        padding: '20px',
        border: '1px solid #d1ecf1',
        borderRadius: '8px',
        backgroundColor: '#d1ecf1',
        color: '#0c5460'
      }}>
        <h3>Welcome to Systech Nexus Platform! 👋</h3>
        <p>
          You are logged in as <strong>{roleDisplayName}</strong>.
          {isAdmin() ?
            ' You have administrative privileges to manage users and groups.' :
            ' You can view and update your profile information.'
          }
        </p>
        {isAdmin() && (
          <p style={{ marginTop: '10px', fontSize: '14px' }}>
            📌 <strong>Admin Tips:</strong> Use the navigation menu to access user management features.
            All user data is synchronized with Keycloak automatically.
          </p>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#495057', marginBottom: '20px' }}>
        👤 My Profile
      </h2>

      <div style={{
        maxWidth: '500px',
        padding: '20px',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        backgroundColor: '#ffffff'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '15px',
          fontSize: '14px'
        }}>
          <div><strong>Username:</strong></div>
          <div>{currentUser?.username}</div>

          <div><strong>First Name:</strong></div>
          <div>{currentUser?.firstName}</div>

          <div><strong>Last Name:</strong></div>
          <div>{currentUser?.lastName}</div>

          <div><strong>Email:</strong></div>
          <div>{currentUser?.email}</div>

          <div><strong>Role:</strong></div>
          <div>{roleDisplayName}</div>

          <div><strong>Groups:</strong></div>
          <div>
            {currentUser?.groups && currentUser.groups.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {currentUser.groups.map(group => (
                  <span
                    key={group}
                    style={{
                      backgroundColor: group === 'platform-admins' ? '#dc3545' :
                                       group === 'app-admins' ? '#fd7e14' : '#28a745',
                      color: 'white',
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}
                  >
                    {group}
                  </span>
                ))}
              </div>
            ) : (
              <span style={{ color: '#6c757d' }}>No groups assigned</span>
            )}
          </div>

          <div><strong>Status:</strong></div>
          <div>
            <span style={{
              color: '#28a745',
              fontWeight: 'bold'
            }}>
              ✅ Active
            </span>
          </div>
        </div>

        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          fontSize: '13px',
          color: '#6c757d'
        }}>
          <strong>Note:</strong> Profile information is managed through Keycloak.
          Contact your administrator to update personal details.
        </div>
      </div>
    </div>
  );

  const renderMainContent = () => {
    switch (activeView) {
      case 'overview':
        return renderOverview();

      case 'users':
        if (!canViewUsers()) {
          return (
            <div style={{ padding: '20px', textAlign: 'center', color: '#dc3545' }}>
              Access Denied: You do not have permission to view users
            </div>
          );
        }
        return (
          <UserList
            onUserSelect={handleUserSelect}
            onCreateUser={() => setActiveView('create-user')}
            refreshTrigger={refreshTrigger}
          />
        );

      case 'create-user':
        if (!canCreateUsers()) {
          return (
            <div style={{ padding: '20px', textAlign: 'center', color: '#dc3545' }}>
              Access Denied: You do not have permission to create users
            </div>
          );
        }
        return (
          <CreateUserForm
            onUserCreated={handleUserCreated}
            onCancel={() => setActiveView('users')}
          />
        );

      case 'profile':
        return renderProfile();

      case 'groups':
        return (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
            <h3>🏢 Group Management</h3>
            <p>Group management functionality coming soon...</p>
            <p style={{ fontSize: '14px' }}>
              Groups (platform-admins, app-admins, users) are configured in Keycloak.
            </p>
          </div>
        );

      default:
        return renderOverview();
    }
  };

  const menuItemStyle = (isActive: boolean) => ({
    display: 'block',
    padding: '10px 15px',
    color: isActive ? '#007bff' : '#495057',
    backgroundColor: isActive ? '#f8f9fa' : 'transparent',
    textDecoration: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    textAlign: 'left' as const,
    fontSize: '14px',
    marginBottom: '2px'
  });

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '250px 1fr',
      minHeight: 'calc(100vh - 140px)', // Account for header and footer
      backgroundColor: '#f8f9fa'
    }}>
      {/* Sidebar Navigation */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRight: '1px solid #dee2e6',
        padding: '20px 0'
      }}>
        <div style={{
          padding: '0 15px',
          marginBottom: '20px',
          borderBottom: '1px solid #dee2e6',
          paddingBottom: '15px'
        }}>
          <h4 style={{
            margin: 0,
            color: '#495057',
            fontSize: '16px'
          }}>
            Navigation
          </h4>
          <div style={{
            fontSize: '12px',
            color: '#6c757d',
            marginTop: '5px'
          }}>
            Role: {roleDisplayName}
          </div>
        </div>

        <nav>
          {/* Always show profile */}
          <button
            onClick={() => setActiveView('profile')}
            style={menuItemStyle(activeView === 'profile')}
          >
            👤 My Profile
          </button>

          {/* Admin sections */}
          {isAdmin() && (
            <>
              <button
                onClick={() => setActiveView('overview')}
                style={menuItemStyle(activeView === 'overview')}
              >
                📊 Overview
              </button>

              {canViewUsers() && (
                <button
                  onClick={() => setActiveView('users')}
                  style={menuItemStyle(activeView === 'users')}
                >
                  👥 User Management
                </button>
              )}

              {canCreateUsers() && (
                <button
                  onClick={() => setActiveView('create-user')}
                  style={menuItemStyle(activeView === 'create-user')}
                >
                  ➕ Create User
                </button>
              )}

              <button
                onClick={() => setActiveView('groups')}
                style={menuItemStyle(activeView === 'groups')}
              >
                🏢 Groups
              </button>
            </>
          )}
        </nav>

        {/* Selected User Info */}
        {selectedUser && (
          <div style={{
            margin: '20px 15px',
            padding: '10px',
            backgroundColor: '#e3f2fd',
            borderRadius: '4px',
            border: '1px solid #bbdefb'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#1976d2',
              marginBottom: '5px'
            }}>
              Selected User:
            </div>
            <div style={{ fontSize: '12px', color: '#1565c0' }}>
              {selectedUser.username}
            </div>
            <div style={{ fontSize: '11px', color: '#1976d2' }}>
              {selectedUser.firstName} {selectedUser.lastName}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div style={{
        backgroundColor: '#ffffff',
        overflow: 'auto'
      }}>
        {renderMainContent()}
      </div>
    </div>
  );
};

export default Dashboard;