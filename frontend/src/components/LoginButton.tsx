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
      <button
        onClick={handleLogout}
        className={`logout-button ${className}`}
      >
        Logout
        <style>
          {`
            .logout-button {
              background: #dc3545;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 13px;
              font-weight: 600;
              transition: all 0.2s ease;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .logout-button:hover {
              background: #c82333;
              transform: translateY(-1px);
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
            }

            .logout-button:active {
              transform: translateY(0);
            }
          `}
        </style>
      </button>
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