import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { User } from '../../types/user';
import { canViewUsers, canCreateUsers, canUpdateUsers } from '../../utils/permissions';

interface UserListProps {
  onUserSelect?: (user: User) => void;
  onCreateUser?: () => void;
  refreshTrigger?: number; // For external refresh
}

export const UserList: React.FC<UserListProps> = ({
  onUserSelect,
  onCreateUser,
  refreshTrigger = 0
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Check permissions
  const canView = canViewUsers();
  const canUpdate = canUpdateUsers();
  const canCreate = canCreateUsers();

  useEffect(() => {
    if (!canView) {
      setError('You do not have permission to view users');
      setLoading(false);
      return;
    }

    loadUsers();
  }, [canView, refreshTrigger]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getAllUsers();
      setUsers(response.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, username: string, currentStatus: boolean) => {
    if (!canUpdate) {
      alert('You do not have permission to modify users');
      return;
    }

    const action = currentStatus ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} user "${username}"?`)) {
      return;
    }

    try {
      await userService.updateUser(userId, { enabled: !currentStatus });
      // Update the user in the local state
      setUsers(users.map(user =>
        user.id === userId ? { ...user, enabled: !currentStatus } : user
      ));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : `Failed to ${action} user`;
      alert(`Error ${action.slice(0, -1)}ing user: ${errorMsg}`);
    }
  };

  const handleUserClick = (user: User) => {
    setSelectedUserId(user.id);
    onUserSelect?.(user);
  };

  const getGroupBadgeColor = (groupName: string): string => {
    switch (groupName) {
      case 'platform-admins':
        return '#dc3545'; // Red for highest privilege
      case 'app-admins':
        return '#fd7e14'; // Orange for medium privilege
      case 'users':
        return '#28a745'; // Green for regular users
      default:
        return '#6c757d'; // Gray for unknown groups
    }
  };

  const formatCreatedDate = (timestamp?: number): string => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleDateString();
  };

  if (!canView) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#dc3545',
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '4px',
        margin: '20px 0'
      }}>
        ⚠️ Access Denied: You do not have permission to view users
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        fontSize: '16px',
        color: '#6c757d'
      }}>
        <div style={{
          display: 'inline-block',
          width: '20px',
          height: '20px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{ marginTop: '10px' }}>Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '4px',
        color: '#721c24',
        margin: '20px 0'
      }}>
        <strong>Error:</strong> {error}
        <button
          onClick={loadUsers}
          style={{
            marginLeft: '10px',
            padding: '5px 10px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '2px solid #dee2e6',
        paddingBottom: '10px'
      }}>
        <h2 style={{ margin: 0, color: '#495057' }}>
          👥 User Management ({users.length} users)
        </h2>

        {canCreate && (
          <button
            onClick={onCreateUser}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#218838'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
          >
            ➕ Create New User
          </button>
        )}
      </div>

      {/* Users List */}
      {users.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#6c757d',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '5px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>👤</div>
          <h3>No users found</h3>
          <p>There are currently no users in the system.</p>
          {canCreate && (
            <button
              onClick={onCreateUser}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              Create First User
            </button>
          )}
        </div>
      ) : (
        <div style={{
          border: '1px solid #dee2e6',
          borderRadius: '5px',
          overflow: 'hidden'
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 2fr 2fr 1fr 1fr auto',
            gap: '10px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #dee2e6',
            fontWeight: 'bold',
            color: '#495057'
          }}>
            <div>Username</div>
            <div>Name</div>
            <div>Email</div>
            <div>Groups</div>
            <div>Created</div>
            <div>Actions</div>
          </div>

          {/* User Rows */}
          {users.map((user, index) => (
            <div
              key={user.id}
              onClick={() => handleUserClick(user)}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 2fr 2fr 1fr 1fr auto',
                gap: '10px',
                padding: '15px',
                borderBottom: index < users.length - 1 ? '1px solid #dee2e6' : 'none',
                backgroundColor: selectedUserId === user.id ? '#e3f2fd' : (index % 2 === 0 ? '#ffffff' : '#f8f9fa'),
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                if (selectedUserId !== user.id) {
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                }
              }}
              onMouseOut={(e) => {
                if (selectedUserId !== user.id) {
                  e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa';
                }
              }}
            >
              {/* Username */}
              <div style={{
                fontWeight: 'bold',
                color: user.enabled ? '#495057' : '#6c757d'
              }}>
                {user.username}
                {!user.enabled && (
                  <span style={{
                    marginLeft: '5px',
                    fontSize: '12px',
                    color: '#dc3545'
                  }}>
                    (Disabled)
                  </span>
                )}
              </div>

              {/* Full Name */}
              <div style={{ color: '#6c757d' }}>
                {user.firstName || user.lastName ?
                  `${user.firstName || ''} ${user.lastName || ''}`.trim() :
                  'No name set'
                }
              </div>

              {/* Email */}
              <div style={{
                color: '#6c757d',
                fontSize: '14px',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}>
                {user.email || 'No email'}
              </div>

              {/* Groups */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px'
              }}>
                {user.groups.length > 0 ? user.groups.map(group => (
                  <span
                    key={group}
                    style={{
                      backgroundColor: getGroupBadgeColor(group),
                      color: 'white',
                      fontSize: '11px',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {group}
                  </span>
                )) : (
                  <span style={{ color: '#6c757d', fontSize: '12px' }}>
                    No groups
                  </span>
                )}
              </div>

              {/* Created Date */}
              <div style={{
                color: '#6c757d',
                fontSize: '14px'
              }}>
                {formatCreatedDate(user.createdTimestamp)}
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '5px'
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUserClick(user);
                  }}
                  style={{
                    padding: '5px 8px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                  title="View/Edit User"
                >
                  ✏️
                </button>

                {canUpdate && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleUserStatus(user.id, user.username, user.enabled);
                    }}
                    style={{
                      padding: '5px 8px',
                      backgroundColor: user.enabled ? '#fd7e14' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                    title={user.enabled ? "Deactivate User" : "Activate User"}
                  >
                    {user.enabled ? '⏸️' : '▶️'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          onClick={loadUsers}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );
};

export default UserList;