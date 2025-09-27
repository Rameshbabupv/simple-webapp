// Mock Keycloak for Jest tests
const mockKeycloak = {
  authenticated: false,
  token: null,
  refreshToken: null,
  tokenParsed: null,
  realm: 'systech',
  clientId: 'systech-hrms-client',

  init: jest.fn().mockResolvedValue(false),
  login: jest.fn().mockResolvedValue(undefined),
  logout: jest.fn().mockResolvedValue(undefined),
  updateToken: jest.fn().mockResolvedValue(true),
  loadUserInfo: jest.fn().mockResolvedValue({}),
  hasRealmRole: jest.fn().mockReturnValue(false),
  createLoginUrl: jest.fn().mockReturnValue('http://localhost:8090/auth/login'),

  onTokenExpired: null,
  onAuthSuccess: null,
  onAuthError: null,
  onAuthRefreshSuccess: null,
  onAuthRefreshError: null,
  onAuthLogout: null
};

// Mock constructor
const Keycloak = jest.fn(() => mockKeycloak);

// Static methods and properties
Keycloak.mockKeycloak = mockKeycloak;

module.exports = Keycloak;
module.exports.default = Keycloak;