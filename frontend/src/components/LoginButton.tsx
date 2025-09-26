import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginButtonProps {
  className?: string;
}

const LoginButton: React.FC<LoginButtonProps> = ({ className = '' }) => {
  const { isAuthenticated, user, loading, login, logout } = useAuth();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
      if (error instanceof Error && error.message.includes('Redirecting')) {
        // This is expected - user is being redirected to Keycloak
        console.log('Redirecting to Keycloak login page...');
        return;
      }
      alert('Login failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <button disabled className={`login-button loading ${className}`}>
        Authenticating...
      </button>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className={`auth-section ${className}`}>
        <div className="user-info">
          <span className="welcome-text">
            Welcome, <strong>{user.firstName} {user.lastName}</strong>
          </span>
          <span className="user-email">({user.email})</span>
          <div className="user-groups">
            Groups: {user.groups.join(', ') || 'None'}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="logout-button"
        >
          Logout
        </button>
        <style>
          {`
            .auth-section {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 12px;
              padding: 20px;
              background: rgba(255,255,255,0.1);
              border-radius: 8px;
              margin: 20px 0;
            }

            .user-info {
              text-align: center;
              color: #fff;
            }

            .welcome-text {
              display: block;
              font-size: 16px;
              margin-bottom: 4px;
            }

            .user-email {
              display: block;
              font-size: 14px;
              color: #ccc;
              margin-bottom: 8px;
            }

            .user-groups {
              font-size: 12px;
              color: #aaa;
              background: rgba(0,0,0,0.3);
              padding: 4px 8px;
              border-radius: 4px;
            }

            .logout-button {
              background: #dc3545;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
              transition: background 0.3s;
            }

            .logout-button:hover {
              background: #c82333;
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className={`login-button ${className}`}
    >
      Login with Keycloak
      <style>
        {`
          .login-button {
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: all 0.3s;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }

          .login-button:hover {
            background: linear-gradient(135deg, #0056b3, #004085);
            transform: translateY(-2px);
            box-shadow: 0 6px 10px rgba(0,0,0,0.15);
          }

          .login-button:disabled {
            background: #6c757d;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }

          .login-button.loading {
            background: #6c757d;
          }
        `}
      </style>
    </button>
  );
};

export default LoginButton;