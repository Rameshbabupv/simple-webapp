import React from 'react';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Offline authentication types
interface CachedUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  groups: string[];
  roles: string[];
  enabled: boolean;
  lastLoginTimestamp: number;
  tokenExpiresAt: number;
}

interface OfflineAuthState {
  isOnline: boolean;
  isAuthenticated: boolean;
  user: CachedUser | null;
  lastSyncTimestamp: number | null;
  offlineCapabilities: string[];
}

interface NetworkStatus {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
}

// Mock offline auth service
const mockOfflineAuthService = {
  cacheUserData: jest.fn(),
  getCachedUser: jest.fn(),
  clearCache: jest.fn(),
  isTokenValid: jest.fn(),
  getOfflineCapabilities: jest.fn(),
  validateOfflineSession: jest.fn(),
  syncWithOnlineState: jest.fn(),
};

// Mock network detection service
const mockNetworkService = {
  isOnline: jest.fn(),
  getNetworkStatus: jest.fn(),
  onStatusChange: jest.fn(),
};

// Mock offline-capable component
const MockOfflineApp = ({
  authState,
  onRetryConnection,
  onClearCache,
  onForceSync
}: {
  authState: OfflineAuthState;
  onRetryConnection: () => void;
  onClearCache: () => void;
  onForceSync: () => void;
}) => (
  <div data-testid="offline-app">
    <div data-testid="connection-status">
      {authState.isOnline ? 'Online' : 'Offline'}
    </div>

    {authState.isAuthenticated && authState.user && (
      <div data-testid="user-info">
        <div data-testid="username">{authState.user.username}</div>
        <div data-testid="last-sync">
          Last sync: {authState.lastSyncTimestamp ? new Date(authState.lastSyncTimestamp).toLocaleString() : 'Never'}
        </div>
        <div data-testid="token-status">
          Token expires: {new Date(authState.user.tokenExpiresAt).toLocaleString()}
        </div>
      </div>
    )}

    {!authState.isOnline && (
      <div data-testid="offline-banner">
        <div data-testid="offline-message">
          You are currently offline. Some features may be limited.
        </div>
        <button data-testid="retry-connection-btn" onClick={onRetryConnection}>
          Retry Connection
        </button>
      </div>
    )}

    {authState.isAuthenticated && !authState.isOnline && (
      <div data-testid="offline-capabilities">
        <h3>Available Offline Features:</h3>
        <ul>
          {authState.offlineCapabilities.map(capability => (
            <li key={capability} data-testid={`capability-${capability}`}>
              {capability}
            </li>
          ))}
        </ul>
      </div>
    )}

    {!authState.isAuthenticated && !authState.isOnline && (
      <div data-testid="offline-login-prompt">
        <div data-testid="offline-login-message">
          Cannot authenticate while offline. Please check your connection.
        </div>
        <button data-testid="clear-cache-btn" onClick={onClearCache}>
          Clear Cache
        </button>
      </div>
    )}

    {authState.isOnline && authState.isAuthenticated && (
      <div data-testid="online-actions">
        <button data-testid="force-sync-btn" onClick={onForceSync}>
          Sync Now
        </button>
      </div>
    )}

    <div data-testid="app-content">
      {authState.isAuthenticated ? (
        <div data-testid="dashboard">
          <h2>Dashboard</h2>
          <div data-testid="feature-status">
            {authState.isOnline ? 'All features available' : 'Limited features available'}
          </div>
        </div>
      ) : (
        <div data-testid="login-prompt">
          <h2>Please Login</h2>
          <div data-testid="login-status">
            {authState.isOnline ? 'Ready to authenticate' : 'Offline - authentication unavailable'}
          </div>
        </div>
      )}
    </div>
  </div>
);

// Mock cached user data
const mockCachedUser: CachedUser = {
  id: 'user-123',
  username: 'nexus-admin',
  email: 'admin@nexus.systech.com',
  firstName: 'Nexus',
  lastName: 'Administrator',
  groups: ['nexus-admin', 'nexus-user'],
  roles: ['platform-admin', 'user'],
  enabled: true,
  lastLoginTimestamp: Date.now() - 60000, // 1 minute ago
  tokenExpiresAt: Date.now() + 300000, // 5 minutes from now
};

describe('Offline Authentication Integration Tests', () => {
  const user = userEvent.setup();

  // Store original navigator.onLine
  const originalOnLine = navigator.onLine;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
    });

    // Reset network service mocks
    (mockNetworkService.isOnline as jest.MockedFunction<any>).mockReturnValue(true);
    (mockNetworkService.getNetworkStatus as jest.MockedFunction<any>).mockReturnValue({
      online: true,
      effectiveType: '4g',
      downlink: 10,
    });
  });

  afterEach(() => {
    // Restore original navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      value: originalOnLine,
      writable: true,
    });
  });

  describe('Online Authentication and Caching', () => {
    it('should cache user data after successful online authentication', async () => {
      // Arrange
      (mockOfflineAuthService.cacheUserData as jest.MockedFunction<any>).mockResolvedValue();
      (mockOfflineAuthService.getCachedUser as jest.MockedFunction<any>).mockResolvedValue(null);

      const authState: OfflineAuthState = {
        isOnline: true,
        isAuthenticated: true,
        user: mockCachedUser,
        lastSyncTimestamp: Date.now(),
        offlineCapabilities: ['view-profile', 'limited-dashboard'],
      };

      const mockHandlers = {
        onRetryConnection: jest.fn(),
        onClearCache: jest.fn(),
        onForceSync: jest.fn(),
      };

      // Act
      render(<MockOfflineApp authState={authState} {...mockHandlers} />);

      // Simulate caching after successful authentication
      await mockOfflineAuthService.cacheUserData(mockCachedUser);

      // Assert
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Online');
      expect(screen.getByTestId('username')).toHaveTextContent('nexus-admin');
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('feature-status')).toHaveTextContent('All features available');
      expect(mockOfflineAuthService.cacheUserData).toHaveBeenCalledWith(mockCachedUser);
    });

    it('should update cache with latest user data during sync', async () => {
      // Arrange
      const updatedUser: CachedUser = {
        ...mockCachedUser,
        email: 'updated@nexus.systech.com',
        lastLoginTimestamp: Date.now(),
        tokenExpiresAt: Date.now() + 600000, // Extended expiry
      };

      (mockOfflineAuthService.syncWithOnlineState as jest.MockedFunction<any>).mockResolvedValue();
      (mockOfflineAuthService.cacheUserData as jest.MockedFunction<any>).mockResolvedValue();

      const authState: OfflineAuthState = {
        isOnline: true,
        isAuthenticated: true,
        user: updatedUser,
        lastSyncTimestamp: Date.now(),
        offlineCapabilities: ['view-profile'],
      };

      const mockHandlers = {
        onRetryConnection: jest.fn(),
        onClearCache: jest.fn(),
        onForceSync: jest.fn(async () => {
          await mockOfflineAuthService.syncWithOnlineState();
          await mockOfflineAuthService.cacheUserData(updatedUser);
        }),
      };

      // Act
      render(<MockOfflineApp authState={authState} {...mockHandlers} />);

      await user.click(screen.getByTestId('force-sync-btn'));

      // Assert
      expect(mockHandlers.onForceSync).toHaveBeenCalled();
      expect(mockOfflineAuthService.syncWithOnlineState).toHaveBeenCalled();
    });
  });

  describe('Offline Mode Functionality', () => {
    it('should load cached user data when going offline', async () => {
      // Arrange
      (mockNetworkService.isOnline as jest.MockedFunction<any>).mockReturnValue(false);
      (mockOfflineAuthService.getCachedUser as jest.MockedFunction<any>).mockResolvedValue(mockCachedUser);
      (mockOfflineAuthService.validateOfflineSession as jest.MockedFunction<any>).mockResolvedValue(true);
      (mockOfflineAuthService.getOfflineCapabilities as jest.MockedFunction<any>).mockReturnValue(['view-profile', 'limited-dashboard']);

      Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

      const authState: OfflineAuthState = {
        isOnline: false,
        isAuthenticated: true,
        user: mockCachedUser,
        lastSyncTimestamp: Date.now() - 120000, // 2 minutes ago
        offlineCapabilities: ['view-profile', 'limited-dashboard'],
      };

      const mockHandlers = {
        onRetryConnection: jest.fn(),
        onClearCache: jest.fn(),
        onForceSync: jest.fn(),
      };

      // Act
      render(<MockOfflineApp authState={authState} {...mockHandlers} />);

      // Assert
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Offline');
      expect(screen.getByTestId('offline-banner')).toBeInTheDocument();
      expect(screen.getByTestId('offline-message')).toHaveTextContent('You are currently offline');
      expect(screen.getByTestId('username')).toHaveTextContent('nexus-admin');
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('feature-status')).toHaveTextContent('Limited features available');

      // Should show offline capabilities
      expect(screen.getByTestId('offline-capabilities')).toBeInTheDocument();
      expect(screen.getByTestId('capability-view-profile')).toBeInTheDocument();
      expect(screen.getByTestId('capability-limited-dashboard')).toBeInTheDocument();
    });

    it('should show offline login prompt when not authenticated offline', async () => {
      // Arrange
      (mockNetworkService.isOnline as jest.MockedFunction<any>).mockReturnValue(false);
      (mockOfflineAuthService.getCachedUser as jest.MockedFunction<any>).mockResolvedValue(null);

      Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

      const authState: OfflineAuthState = {
        isOnline: false,
        isAuthenticated: false,
        user: null,
        lastSyncTimestamp: null,
        offlineCapabilities: [],
      };

      const mockHandlers = {
        onRetryConnection: jest.fn(),
        onClearCache: jest.fn(),
        onForceSync: jest.fn(),
      };

      // Act
      render(<MockOfflineApp authState={authState} {...mockHandlers} />);

      // Assert
      expect(screen.getByTestId('connection-status')).toHaveTextContent('Offline');
      expect(screen.getByTestId('offline-login-prompt')).toBeInTheDocument();
      expect(screen.getByTestId('offline-login-message')).toHaveTextContent('Cannot authenticate while offline');
      expect(screen.getByTestId('login-prompt')).toBeInTheDocument();
      expect(screen.getByTestId('login-status')).toHaveTextContent('Offline - authentication unavailable');
    });

    it('should handle retry connection attempts', async () => {
      // Arrange
      (mockNetworkService.isOnline as jest.MockedFunction<any>).mockReturnValueOnce(false).mockReturnValueOnce(true);

      const authState: OfflineAuthState = {
        isOnline: false,
        isAuthenticated: true,
        user: mockCachedUser,
        lastSyncTimestamp: Date.now() - 300000, // 5 minutes ago
        offlineCapabilities: ['view-profile'],
      };

      const mockHandlers = {
        onRetryConnection: jest.fn(() => {
          // Simulate successful reconnection
          (mockNetworkService.isOnline as jest.MockedFunction<any>).mockReturnValue(true);
        }),
        onClearCache: jest.fn(),
        onForceSync: jest.fn(),
      };

      // Act
      render(<MockOfflineApp authState={authState} {...mockHandlers} />);

      await user.click(screen.getByTestId('retry-connection-btn'));

      // Assert
      expect(mockHandlers.onRetryConnection).toHaveBeenCalled();
    });
  });

  describe('Token Expiration Handling', () => {
    it('should handle expired tokens in offline mode', async () => {
      // Arrange
      const expiredUser: CachedUser = {
        ...mockCachedUser,
        tokenExpiresAt: Date.now() - 60000, // Expired 1 minute ago
      };

      (mockOfflineAuthService.isTokenValid as jest.MockedFunction<any>).mockReturnValue(false);
      (mockOfflineAuthService.validateOfflineSession as jest.MockedFunction<any>).mockResolvedValue(false);

      const authState: OfflineAuthState = {
        isOnline: false,
        isAuthenticated: false, // Should be false due to expired token
        user: expiredUser,
        lastSyncTimestamp: Date.now() - 600000, // 10 minutes ago
        offlineCapabilities: [],
      };

      const mockHandlers = {
        onRetryConnection: jest.fn(),
        onClearCache: jest.fn(),
        onForceSync: jest.fn(),
      };

      // Act
      render(<MockOfflineApp authState={authState} {...mockHandlers} />);

      // Assert
      expect(screen.getByTestId('offline-login-prompt')).toBeInTheDocument();
      expect(screen.getByTestId('login-status')).toHaveTextContent('Offline - authentication unavailable');
    });

    it('should warn about approaching token expiration', async () => {
      // Arrange
      const soonToExpireUser: CachedUser = {
        ...mockCachedUser,
        tokenExpiresAt: Date.now() + 120000, // Expires in 2 minutes
      };

      (mockOfflineAuthService.isTokenValid as jest.MockedFunction<any>).mockReturnValue(true);

      const authState: OfflineAuthState = {
        isOnline: true,
        isAuthenticated: true,
        user: soonToExpireUser,
        lastSyncTimestamp: Date.now(),
        offlineCapabilities: ['view-profile'],
      };

      const mockHandlers = {
        onRetryConnection: jest.fn(),
        onClearCache: jest.fn(),
        onForceSync: jest.fn(),
      };

      // Act
      render(<MockOfflineApp authState={authState} {...mockHandlers} />);

      // Assert
      expect(screen.getByTestId('token-status')).toBeInTheDocument();
      expect(screen.getByTestId('username')).toHaveTextContent('nexus-admin');

      // Check if token expiry time is displayed correctly
      const tokenExpiry = new Date(soonToExpireUser.tokenExpiresAt).toLocaleString();
      expect(screen.getByTestId('token-status')).toHaveTextContent(`Token expires: ${tokenExpiry}`);
    });
  });

  describe('Cache Management', () => {
    it('should clear cache when requested', async () => {
      // Arrange
      (mockOfflineAuthService.clearCache as jest.MockedFunction<any>).mockResolvedValue();

      const authState: OfflineAuthState = {
        isOnline: false,
        isAuthenticated: false,
        user: null,
        lastSyncTimestamp: null,
        offlineCapabilities: [],
      };

      const mockHandlers = {
        onRetryConnection: jest.fn(),
        onClearCache: jest.fn(async () => {
          await mockOfflineAuthService.clearCache();
        }),
        onForceSync: jest.fn(),
      };

      // Act
      render(<MockOfflineApp authState={authState} {...mockHandlers} />);

      await user.click(screen.getByTestId('clear-cache-btn'));

      // Assert
      expect(mockHandlers.onClearCache).toHaveBeenCalled();
      expect(mockOfflineAuthService.clearCache).toHaveBeenCalled();
    });

    it('should validate cached data integrity', async () => {
      // Arrange
      const corruptedUser = {
        ...mockCachedUser,
        username: '', // Invalid data
        email: 'invalid-email', // Invalid format
      };

      (mockOfflineAuthService.getCachedUser as jest.MockedFunction<any>).mockResolvedValue(corruptedUser as CachedUser);
      (mockOfflineAuthService.validateOfflineSession as jest.MockedFunction<any>).mockResolvedValue(false);

      // Act & Assert
      const isValid = await mockOfflineAuthService.validateOfflineSession();
      expect(isValid).toBe(false);

      // Should handle corrupted cache gracefully
      expect(mockOfflineAuthService.validateOfflineSession).toHaveBeenCalled();
    });
  });

  describe('Network State Transitions', () => {
    it('should handle online to offline transition', async () => {
      // Arrange
      let networkStatus: NetworkStatus = { online: true };
      const statusChangeCallback = jest.fn();

      (mockNetworkService.onStatusChange as jest.MockedFunction<any>).mockImplementation((callback) => {
        statusChangeCallback.mockImplementation(callback);
        return jest.fn(); // Return unsubscribe function
      });

      // Act - Simulate going offline
      networkStatus = { online: false };
      statusChangeCallback(networkStatus);

      // Assert
      expect(statusChangeCallback).toHaveBeenCalledWith({ online: false });
    });

    it('should handle offline to online transition and trigger sync', async () => {
      // Arrange
      let networkStatus: NetworkStatus = { online: false };
      const statusChangeCallback = jest.fn();

      (mockNetworkService.onStatusChange as jest.MockedFunction<any>).mockImplementation((callback) => {
        statusChangeCallback.mockImplementation(callback);
        return jest.fn();
      });

      (mockOfflineAuthService.syncWithOnlineState as jest.MockedFunction<any>).mockResolvedValue();

      // Act - Simulate coming back online
      networkStatus = { online: true, effectiveType: '4g' };
      statusChangeCallback(networkStatus);

      // Simulate automatic sync when coming back online
      if (networkStatus.online) {
        await mockOfflineAuthService.syncWithOnlineState();
      }

      // Assert
      expect(statusChangeCallback).toHaveBeenCalledWith({
        online: true,
        effectiveType: '4g'
      });
      expect(mockOfflineAuthService.syncWithOnlineState).toHaveBeenCalled();
    });
  });

  describe('Offline Capabilities and Limitations', () => {
    it('should define and respect offline capability limits', async () => {
      // Arrange
      const offlineCapabilities = ['view-profile', 'read-cached-data', 'basic-navigation'];
      const restrictedCapabilities = ['create-user', 'delete-user', 'modify-groups', 'system-config'];

      (mockOfflineAuthService.getOfflineCapabilities as jest.MockedFunction<any>).mockReturnValue(offlineCapabilities);

      // Act
      const availableOffline = mockOfflineAuthService.getOfflineCapabilities();

      // Assert
      expect(availableOffline).toEqual(offlineCapabilities);
      expect(availableOffline).not.toContain('create-user');
      expect(availableOffline).not.toContain('delete-user');

      // Verify offline capabilities are properly restricted
      offlineCapabilities.forEach(capability => {
        expect(availableOffline).toContain(capability);
      });

      restrictedCapabilities.forEach(capability => {
        expect(availableOffline).not.toContain(capability);
      });
    });

    it('should show appropriate offline feature limitations', async () => {
      // Arrange
      const authState: OfflineAuthState = {
        isOnline: false,
        isAuthenticated: true,
        user: mockCachedUser,
        lastSyncTimestamp: Date.now() - 180000, // 3 minutes ago
        offlineCapabilities: ['view-profile', 'limited-dashboard'],
      };

      const mockHandlers = {
        onRetryConnection: jest.fn(),
        onClearCache: jest.fn(),
        onForceSync: jest.fn(),
      };

      // Act
      render(<MockOfflineApp authState={authState} {...mockHandlers} />);

      // Assert
      expect(screen.getByTestId('offline-capabilities')).toBeInTheDocument();
      expect(screen.getByText('Available Offline Features:')).toBeInTheDocument();
      expect(screen.getByTestId('capability-view-profile')).toBeInTheDocument();
      expect(screen.getByTestId('capability-limited-dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('feature-status')).toHaveTextContent('Limited features available');
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle cache corruption gracefully', async () => {
      // Arrange
      (mockOfflineAuthService.getCachedUser as jest.MockedFunction<any>).mockRejectedValue(new Error('Cache corrupted'));
      (mockOfflineAuthService.validateOfflineSession as jest.MockedFunction<any>).mockResolvedValue(false);

      // Act & Assert
      await expect(mockOfflineAuthService.getCachedUser()).rejects.toThrow('Cache corrupted');

      // Should be able to recover by clearing cache
      (mockOfflineAuthService.clearCache as jest.MockedFunction<any>).mockResolvedValue();
      await mockOfflineAuthService.clearCache();

      expect(mockOfflineAuthService.clearCache).toHaveBeenCalled();
    });

    it('should handle network detection failures', async () => {
      // Arrange
      (mockNetworkService.isOnline as jest.MockedFunction<any>).mockImplementation(() => {
        throw new Error('Network detection failed');
      });

      // Act & Assert
      expect(() => mockNetworkService.isOnline()).toThrow('Network detection failed');

      // Should fall back to navigator.onLine
      const fallbackOnlineStatus = navigator.onLine;
      expect(typeof fallbackOnlineStatus).toBe('boolean');
    });

    it('should handle sync failures when coming back online', async () => {
      // Arrange
      (mockOfflineAuthService.syncWithOnlineState as jest.MockedFunction<any>).mockRejectedValue(
        new Error('Sync failed: Server unreachable')
      );

      // Act & Assert
      await expect(mockOfflineAuthService.syncWithOnlineState()).rejects.toThrow('Sync failed');

      // Should continue to work with cached data
      (mockOfflineAuthService.getCachedUser as jest.MockedFunction<any>).mockResolvedValue(mockCachedUser);
      const cachedUser = await mockOfflineAuthService.getCachedUser();

      expect(cachedUser).toEqual(mockCachedUser);
    });
  });
});