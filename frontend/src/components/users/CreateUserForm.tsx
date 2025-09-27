import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { CreateUserRequest, UserGroups } from '../../types/user';
import { canCreateUsers } from '../../utils/permissions';

interface CreateUserFormProps {
  onUserCreated?: (userId: string) => void;
  onCancel?: () => void;
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({
  onUserCreated,
  onCancel
}) => {
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    enabled: true,
    groups: [UserGroups.USERS] // Default to users group per spec
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Check permissions
  const canCreate = canCreateUsers();

  useEffect(() => {
    if (!canCreate) {
      setError('You do not have permission to create users');
    }
  }, [canCreate]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9._-]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, dots, hyphens, and underscores';
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // First name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof CreateUserRequest, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleGroupChange = (groupName: string, checked: boolean) => {
    const newGroups = checked
      ? [...(formData.groups || []), groupName]
      : (formData.groups || []).filter(g => g !== groupName);

    // Ensure at least one group is selected (default to users)
    if (newGroups.length === 0) {
      newGroups.push(UserGroups.USERS);
    }

    handleInputChange('groups', newGroups);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canCreate) {
      setError('You do not have permission to create users');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userId = await userService.createUser(formData);
      onUserCreated?.(userId);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create user';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      enabled: true,
      groups: [UserGroups.USERS]
    });
    setConfirmPassword('');
    setValidationErrors({});
    setError(null);
  };

  if (!canCreate) {
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
        ⚠️ Access Denied: You do not have permission to create users
      </div>
    );
  }

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box' as const
  };

  const errorInputStyle = {
    ...inputStyle,
    borderColor: '#dc3545',
    boxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold' as const,
    color: '#495057'
  };

  const fieldGroupStyle = {
    marginBottom: '15px'
  };

  const errorMessageStyle = {
    color: '#dc3545',
    fontSize: '12px',
    marginTop: '5px'
  };

  return (
    <div style={{
      maxWidth: '500px',
      margin: '0 auto',
      padding: '20px',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      backgroundColor: '#ffffff'
    }}>
      <h2 style={{
        textAlign: 'center',
        marginBottom: '20px',
        color: '#495057'
      }}>
        ➕ Create New User
      </h2>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24',
          marginBottom: '20px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Username */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Username *</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            style={validationErrors.username ? errorInputStyle : inputStyle}
            placeholder="Enter username"
            disabled={loading}
          />
          {validationErrors.username && (
            <div style={errorMessageStyle}>{validationErrors.username}</div>
          )}
        </div>

        {/* Email */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            style={validationErrors.email ? errorInputStyle : inputStyle}
            placeholder="Enter email address"
            disabled={loading}
          />
          {validationErrors.email && (
            <div style={errorMessageStyle}>{validationErrors.email}</div>
          )}
        </div>

        {/* First Name & Last Name */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>First Name *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              style={validationErrors.firstName ? errorInputStyle : inputStyle}
              placeholder="First name"
              disabled={loading}
            />
            {validationErrors.firstName && (
              <div style={errorMessageStyle}>{validationErrors.firstName}</div>
            )}
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Last Name *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              style={validationErrors.lastName ? errorInputStyle : inputStyle}
              placeholder="Last name"
              disabled={loading}
            />
            {validationErrors.lastName && (
              <div style={errorMessageStyle}>{validationErrors.lastName}</div>
            )}
          </div>
        </div>

        {/* Password */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Password *</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            style={validationErrors.password ? errorInputStyle : inputStyle}
            placeholder="Enter password (min 6 characters)"
            disabled={loading}
          />
          {validationErrors.password && (
            <div style={errorMessageStyle}>{validationErrors.password}</div>
          )}
        </div>

        {/* Confirm Password */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Confirm Password *</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={validationErrors.confirmPassword ? errorInputStyle : inputStyle}
            placeholder="Confirm password"
            disabled={loading}
          />
          {validationErrors.confirmPassword && (
            <div style={errorMessageStyle}>{validationErrors.confirmPassword}</div>
          )}
        </div>

        {/* Group Assignment */}
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Assign to Groups</label>
          <div style={{
            border: '1px solid #ced4da',
            borderRadius: '4px',
            padding: '10px'
          }}>
            {Object.values(UserGroups).map(group => (
              <label
                key={group}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.groups?.includes(group) || false}
                  onChange={(e) => handleGroupChange(group, e.target.checked)}
                  style={{ marginRight: '8px' }}
                  disabled={loading}
                />
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: group === UserGroups.PLATFORM_ADMINS ? '#dc3545' :
                                   group === UserGroups.APP_ADMINS ? '#fd7e14' : '#28a745',
                  color: 'white',
                  fontSize: '12px',
                  marginRight: '8px'
                }}>
                  {group}
                </span>
                {group === UserGroups.PLATFORM_ADMINS && '(Full access)'}
                {group === UserGroups.APP_ADMINS && '(Create users only)'}
                {group === UserGroups.USERS && '(View profile only)'}
              </label>
            ))}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#6c757d',
            marginTop: '5px'
          }}>
            New users are assigned to "users" group by default
          </div>
        </div>

        {/* Enabled Toggle */}
        <div style={fieldGroupStyle}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => handleInputChange('enabled', e.target.checked)}
              style={{ marginRight: '8px' }}
              disabled={loading}
            />
            <span style={{ fontSize: '14px', color: '#495057' }}>
              Enable user account
            </span>
          </label>
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #dee2e6'
        }}>
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            Reset
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              position: 'relative'
            }}
          >
            {loading ? (
              <>
                <span style={{ opacity: 0 }}>Create User</span>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              </>
            ) : (
              'Create User'
            )}
          </button>
        </div>
      </form>

      <style>{`
        @keyframes spin {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CreateUserForm;