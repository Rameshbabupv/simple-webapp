import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { User, UserGroup } from '../../types/user';
import { canUpdateUsers, canManageGroups } from '../../utils/permissions';

interface EditUserProps {
  user: User;
  onUserUpdated: (updatedUser: User) => void;
  onCancel: () => void;
}

export const EditUser: React.FC<EditUserProps> = ({
  user,
  onUserUpdated,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    email: user.email || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    enabled: user.enabled
  });

  const [selectedGroups, setSelectedGroups] = useState<string[]>(user.groups || []);
  const [availableGroups, setAvailableGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check permissions
  const canUpdate = canUpdateUsers();
  const canManageUserGroups = canManageGroups();

  useEffect(() => {
    loadAvailableGroups();
  }, []);

  const loadAvailableGroups = async () => {
    try {
      setLoading(true);
      const groups = await userService.getAllGroups();
      setAvailableGroups(groups);
    } catch (err) {
      console.error('Failed to load groups:', err);
      setError('Failed to load available groups');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGroupToggle = (groupName: string) => {
    if (!canManageUserGroups) return;

    setSelectedGroups(prev => {
      if (prev.includes(groupName)) {
        return prev.filter(g => g !== groupName);
      } else {
        return [...prev, groupName];
      }
    });
  };

  const handleSave = async () => {
    if (!canUpdate) {
      setError('You do not have permission to update users');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Update user basic information
      await userService.updateUser(user.id, {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        enabled: formData.enabled
      });

      // Update group memberships if permissions allow
      if (canManageUserGroups) {
        const currentGroups = user.groups || [];
        const groupsToAdd = selectedGroups.filter(g => !currentGroups.includes(g));
        const groupsToRemove = currentGroups.filter(g => !selectedGroups.includes(g));

        // Add new groups
        for (const groupName of groupsToAdd) {
          await userService.addUserToGroup(user.id, groupName);
        }

        // Remove old groups
        for (const groupName of groupsToRemove) {
          await userService.removeUserFromGroup(user.id, groupName);
        }
      }

      // Fetch updated user data
      const updatedUser = await userService.getUserById(user.id);
      onUserUpdated(updatedUser);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMsg);
      console.error('Error updating user:', err);
    } finally {
      setSaving(false);
    }
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

  if (!canUpdate) {
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
        ⚠️ Access Denied: You do not have permission to edit users
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px',
      margin: '20px 0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '2px solid #dee2e6',
        paddingBottom: '10px'
      }}>
        <h3 style={{ margin: 0, color: '#495057' }}>
          ✏️ Edit User: {user.username}
        </h3>
        <button
          onClick={onCancel}
          style={{
            padding: '8px 12px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ✕ Close
        </button>
      </div>

      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24',
          marginBottom: '20px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* User Information Form */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Basic Information */}
        <div>
          <h4 style={{ margin: '0 0 15px 0', color: '#495057' }}>Basic Information</h4>

          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              color: '#495057'
            }}>
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              color: '#495057'
            }}>
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              color: '#495057'
            }}>
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => handleInputChange('enabled', e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 'bold', color: '#495057' }}>
                Account Enabled
              </span>
            </label>
          </div>
        </div>

        {/* Group Memberships */}
        <div>
          <h4 style={{ margin: '0 0 15px 0', color: '#495057' }}>
            Group Memberships
            {!canManageUserGroups && (
              <span style={{ fontSize: '12px', color: '#6c757d', fontWeight: 'normal' }}>
                (Read-only)
              </span>
            )}
          </h4>

          {loading ? (
            <div style={{ color: '#6c757d', fontSize: '14px' }}>
              Loading groups...
            </div>
          ) : (
            <div style={{
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              padding: '10px',
              backgroundColor: '#f8f9fa'
            }}>
              {availableGroups.length === 0 ? (
                <div style={{ color: '#6c757d', fontSize: '14px' }}>
                  No groups available
                </div>
              ) : (
                availableGroups.map((group) => (
                  <label
                    key={group.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                      cursor: canManageUserGroups ? 'pointer' : 'not-allowed',
                      opacity: canManageUserGroups ? 1 : 0.6
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedGroups.includes(group.name)}
                      onChange={() => handleGroupToggle(group.name)}
                      disabled={!canManageUserGroups}
                      style={{ cursor: canManageUserGroups ? 'pointer' : 'not-allowed' }}
                    />
                    <span
                      style={{
                        backgroundColor: getGroupBadgeColor(group.name),
                        color: 'white',
                        fontSize: '12px',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      {group.name}
                    </span>
                  </label>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end',
        borderTop: '1px solid #dee2e6',
        paddingTop: '20px'
      }}>
        <button
          onClick={onCancel}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '10px 20px',
            backgroundColor: saving ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {saving ? '💾 Saving...' : '💾 Save Changes'}
        </button>
      </div>

      {/* User Info Summary */}
      <div style={{
        marginTop: '20px',
        padding: '10px',
        backgroundColor: '#e9ecef',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#495057'
      }}>
        <strong>User ID:</strong> {user.id} |
        <strong> Username:</strong> {user.username} |
        <strong> Created:</strong> {user.createdTimestamp ? new Date(user.createdTimestamp).toLocaleDateString() : 'Unknown'}
      </div>
    </div>
  );
};

export default EditUser;