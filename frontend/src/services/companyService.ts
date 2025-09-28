import { authService } from './keycloak';

// Company types based on the GraphQL response
export interface Company {
  id: string;
  companyCode: string;
  companyName: string;
  country: string;
  companyStatus: string;
}

export interface CompanyListResponse {
  companies: Company[];
}

export interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    path?: string[];
  }>;
}

export class CompanyService {
  private baseUrl: string;

  constructor() {
    // Use environment variable or default to localhost:8080
    this.baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private async makeGraphQLRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${this.baseUrl}/graphql`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          variables: variables || {}
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GraphQLResponse<T> = await response.json();

      if (result.errors && result.errors.length > 0) {
        throw new Error(`GraphQL errors: ${result.errors.map(e => e.message).join(', ')}`);
      }

      return result.data;
    } catch (error) {
      console.error('GraphQL request failed:', error);
      if (error instanceof Error) {
        throw new Error(`Company service request failed: ${error.message}`);
      }
      throw new Error('Company service request failed');
    }
  }

  /**
   * Get all companies from the backend
   * Requires platform-admin or app-admin role
   */
  async getAllCompanies(): Promise<Company[]> {
    const query = `
      query GetAllCompanies {
        companies {
          id
          companyCode
          companyName
          country
          companyStatus
        }
      }
    `;

    const response = await this.makeGraphQLRequest<CompanyListResponse>(query);
    return response.companies;
  }

  /**
   * Check if the service is available by testing the GraphQL endpoint
   */
  async checkServiceAvailability(): Promise<boolean> {
    try {
      const token = authService.getToken();
      if (!token) {
        return false;
      }

      const response = await fetch(`${this.baseUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'query { __typename }'
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Service availability check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const companyService = new CompanyService();