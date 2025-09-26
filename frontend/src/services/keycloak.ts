/* eslint-disable @typescript-eslint/no-explicit-any */
import Keycloak from 'keycloak-js';

// Initialize Keycloak instance
const keycloakConfig = {
  url: process.env.REACT_APP_KEYCLOAK_URL || '',
  realm: process.env.REACT_APP_KEYCLOAK_REALM || '',
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT || '',
};

const keycloak = new (Keycloak as any)(keycloakConfig);

// Types for authentication
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  groups: string[];
  enabled: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

// Authentication service
export class KeycloakAuthService {
  private keycloak: Keycloak.KeycloakInstance;
  private initialized = false;

  constructor() {
    this.keycloak = keycloak;
  }

  async init(): Promise<boolean> {
    if (this.initialized) {
      return this.keycloak.authenticated || false;
    }

    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        checkLoginIframe: false,
      }) as unknown as boolean;

      this.initialized = true;

      // Set up token refresh
      this.keycloak.onTokenExpired = () => {
        this.refreshToken();
      };

      return authenticated;
    } catch (error) {
      console.error('Failed to initialize Keycloak:', error);
      // Don't throw error - allow app to continue with disabled auth
      this.initialized = true;
      return false;
    }
  }

  async login(): Promise<AuthResponse> {
    if (!this.initialized) {
      throw new Error('Keycloak not initialized');
    }

    try {
      // Check if server is reachable first
      const serverUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/certs`;
      const response = await fetch(serverUrl);

      if (!response.ok) {
        throw new Error(`Keycloak server not reachable at ${keycloakConfig.url}`);
      }

      // Force redirect to Keycloak login page
      this.keycloak.login({
        redirectUri: window.location.origin
      });

      // This will redirect the user to Keycloak login page
      // The response will come back through the redirect
      throw new Error('Redirecting to Keycloak login...');
    } catch (error) {
      console.error('Login failed:', error);
      if (error instanceof Error && error.message.includes('Redirecting')) {
        throw error; // This is expected - user is being redirected
      }
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`);
      }
      throw new Error('Login failed');
    }
  }

  async logout(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Keycloak not initialized');
    }

    try {
      await this.keycloak.logout();
    } catch (error) {
      console.error('Logout failed:', error);
      throw new Error('Logout failed');
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    if (!this.initialized) {
      throw new Error('Keycloak not initialized');
    }

    try {
      const refreshed = await this.keycloak.updateToken(30);
      if (refreshed && this.keycloak.token) {
        return this.getAuthResponse();
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw new Error('Token refresh failed');
    }
  }

  getAuthUrl(): string {
    return this.keycloak.createLoginUrl();
  }

  isAuthenticated(): boolean {
    return this.keycloak.authenticated || false;
  }

  hasRole(role: string): boolean {
    return this.keycloak.hasRealmRole(role);
  }

  hasGroup(group: string): boolean {
    const token = this.keycloak.tokenParsed as any;
    if (token && token.groups) {
      return token.groups.includes(`/${group}`) || token.groups.includes(group);
    }
    return false;
  }

  getUser(): AuthUser | null {
    if (!this.keycloak.authenticated || !this.keycloak.tokenParsed) {
      return null;
    }

    const token = this.keycloak.tokenParsed as any;
    return {
      id: token.sub || '',
      username: token.preferred_username || '',
      email: token.email || '',
      firstName: token.given_name || '',
      lastName: token.family_name || '',
      groups: token.groups || [],
      enabled: true,
    };
  }

  getToken(): string | null {
    return this.keycloak.token || null;
  }

  private getAuthResponse(): AuthResponse {
    const user = this.getUser();
    if (!user || !this.keycloak.token || !this.keycloak.refreshToken) {
      throw new Error('Invalid authentication state');
    }

    const token = this.keycloak.tokenParsed as any;
    return {
      accessToken: this.keycloak.token,
      refreshToken: this.keycloak.refreshToken,
      expiresIn: token?.exp || 0,
      user,
    };
  }
}

// Export singleton instance
export const authService = new KeycloakAuthService();
export default keycloak;