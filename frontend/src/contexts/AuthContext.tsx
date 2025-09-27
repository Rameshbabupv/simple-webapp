import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, AuthUser } from '../services/keycloak';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasGroup: (group: string) => boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      initializeAuth();
    }
  }, [initialized]);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      const authenticated = await authService.init();

      if (authenticated) {
        setIsAuthenticated(true);
        setUser(authService.getUser());
        setToken(authService.getToken());
      }
    } catch (error) {
      console.error('Authentication initialization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      setLoading(true);
      await authService.login();

      // After successful login, update state
      setIsAuthenticated(true);
      setUser(authService.getUser());
      setToken(authService.getToken());
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();

      // Clear state after logout
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: string): boolean => {
    return authService.hasRole(role);
  };

  const hasGroup = (group: string): boolean => {
    return authService.hasGroup(group);
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    hasRole,
    hasGroup,
    token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};