import { authService } from './keycloak';

// Window extension for working countries query storage
declare global {
  interface Window {
    workingCountriesQuery?: string;
    workingCountriesFields?: string[];
  }
}

// Company types based on the GraphQL response
export interface Company {
  id: string;
  companyCode: string;
  companyName: string;
  shortName?: string;
  primaryEmail?: string;
  registeredAddress?: string;
  country: string;
  companyStatus: string;
  createdAt?: string;
  modifiedAt?: string;
}

// CRUD operation input types
export interface CreateCompanyInput {
  companyName: string;
  companyShortName: string;
  registrationNumber: string;
  registeredAddress: string;
  countryId: number;
  active?: boolean;
}

export interface UpdateCompanyInput {
  companyName?: string;
  shortName?: string;
  registrationNumber?: string;
  primaryEmail?: string;
  registeredAddress?: string;
  countryId?: number;
}

// CRUD operation response types
export interface CompanyResponse {
  id: string;
  companyCode: string;
  companyName: string;
  shortName?: string;
  primaryEmail?: string;
  registeredAddress?: string;
  country?: string;
  companyStatus?: string;
  createdAt?: string;
  modifiedAt?: string;
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

// Country interface
export interface Country {
  id: number;
  name: string;
  code?: string;
}

export interface CountryListResponse {
  countries: Country[];
}

export interface DynamicCountryResponse {
  [queryName: string]: Country[];
}

// Raw country data from GraphQL (with backend field names)
interface RawCountryData {
  id: number;
  countryName?: string;
  countryCode?: string;
  name?: string;
  code?: string;
}

export class CompanyService {
  private baseUrl: string;

  constructor() {
    // Use environment variable or default to backend running on localhost:8090
    this.baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8090';
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
   * Uses the exact query structure proven to work in test scripts
   */
  async getAllCompanies(): Promise<Company[]> {
    const query = `
      query GetAllCompanies {
        companies {
          id
          companyCode
          companyName
          primaryEmail
          country
          companyStatus
        }
      }
    `;

    const response = await this.makeGraphQLRequest<CompanyListResponse>(query);
    return response.companies;
  }

  /**
   * Get a specific company by ID
   * Requires platform-admin or app-admin role
   */
  async getCompanyById(id: string): Promise<Company> {
    const query = `
      query GetCompanyById($id: ID!) {
        company(id: $id) {
          id
          companyCode
          companyName
          primaryEmail
          registeredAddress
          country
          companyStatus
          createdAt
          modifiedAt
        }
      }
    `;

    const response = await this.makeGraphQLRequest<{ company: Company }>(
      query,
      { id }
    );
    return response.company;
  }

  /**
   * Create a new company
   * Requires platform-admin or app-admin role
   */
  async createCompany(input: CreateCompanyInput): Promise<CompanyResponse> {
    const query = `
      mutation CreateCompany($input: CreateCompanyInput!) {
        createCompany(input: $input) {
          id
          companyCode
          companyName
          primaryEmail
          registeredAddress
          country
          companyStatus
          createdAt
          modifiedAt
        }
      }
    `;

    const response = await this.makeGraphQLRequest<{ createCompany: CompanyResponse }>(
      query,
      { input }
    );
    return response.createCompany;
  }

  /**
   * Update an existing company
   * Requires platform-admin or app-admin role
   */
  async updateCompany(id: string, input: UpdateCompanyInput): Promise<CompanyResponse> {
    const query = `
      mutation UpdateCompany($id: ID!, $input: UpdateCompanyInput!) {
        updateCompany(id: $id, input: $input) {
          id
          companyCode
          companyName
          primaryEmail
          registeredAddress
          country
          companyStatus
          createdAt
          modifiedAt
        }
      }
    `;

    const response = await this.makeGraphQLRequest<{ updateCompany: CompanyResponse }>(
      query,
      { id, input }
    );
    return response.updateCompany;
  }

  /**
   * Disable a company (soft delete)
   * Requires platform-admin or app-admin role
   */
  async disableCompany(id: string): Promise<CompanyResponse> {
    const query = `
      mutation DisableCompany($id: ID!) {
        disableCompany(id: $id) {
          id
          companyCode
          companyName
          companyStatus
          modifiedAt
        }
      }
    `;

    const response = await this.makeGraphQLRequest<{ disableCompany: CompanyResponse }>(
      query,
      { id }
    );
    return response.disableCompany;
  }

  /**
   * Reactivate a disabled company
   * Requires platform-admin or app-admin role
   */
  async reactivateCompany(id: string): Promise<CompanyResponse> {
    const query = `
      mutation ReactivateCompany($id: ID!) {
        reactivateCompany(id: $id) {
          id
          companyCode
          companyName
          companyStatus
          modifiedAt
        }
      }
    `;

    const response = await this.makeGraphQLRequest<{ reactivateCompany: CompanyResponse }>(
      query,
      { id }
    );
    return response.reactivateCompany;
  }

  /**
   * Get all countries from the backend database only (no fallback)
   */
  async getAllCountries(): Promise<Country[]> {
    // First check if we have a working query discovered by the frontend introspection
    const workingQuery = window?.workingCountriesQuery;
    const workingFields = window?.workingCountriesFields || ['id', 'countryName', 'countryCode'];

    if (workingQuery) {
      try {
        console.log(`🎯 Using discovered countries query: ${workingQuery}`);
        const fieldSelection = workingFields.join('\n            ');
        const query = `
          query GetDiscoveredCountries {
            ${workingQuery} {
              ${fieldSelection}
            }
          }
        `;

        const response = await this.makeGraphQLRequest<DynamicCountryResponse>(query);
        const countries = response[workingQuery];
        if (countries && Array.isArray(countries)) {
          console.log(`✅ Successfully loaded ${countries.length} countries using discovered query: ${workingQuery}`);
          // Map to expected interface if needed
          return countries.map((country: RawCountryData) => ({
            id: country.id,
            name: country.countryName || country.name || '',
            code: country.countryCode || country.code
          }));
        }
      } catch (error) {
        console.warn(`Discovered query ${workingQuery} failed, falling back to standard queries:`, error);
      }
    }

    // Try the standard 'countries' query with correct field names
    try {
      const query = `
        query GetAllCountries {
          countries {
            id
            countryName
            countryCode
          }
        }
      `;

      const response = await this.makeGraphQLRequest<CountryListResponse>(query);
      // Map to expected interface
      return response.countries.map((country: RawCountryData) => ({
        id: country.id,
        name: country.countryName || '',
        code: country.countryCode
      }));
    } catch (error) {
      console.warn('Standard countries query failed, trying alternative queries:', error);
    }

    // Try alternative query patterns that might exist in the backend
    const alternativeQueries = [
      'getAllCountries',
      'listCountries',
      'fetchCountries',
      'getCountries',
      'findCountries',
      'searchCountries'
    ];

    for (const queryName of alternativeQueries) {
      try {
        const query = `
          query ${queryName} {
            ${queryName} {
              id
              countryName
              countryCode
            }
          }
        `;

        const response = await this.makeGraphQLRequest<DynamicCountryResponse>(query);
        const countries = response[queryName];
        if (countries && Array.isArray(countries)) {
          console.log(`✅ Successfully loaded countries using ${queryName} query`);

          // Store this working query for future use
          window.workingCountriesQuery = queryName;
          window.workingCountriesFields = ['id', 'countryName', 'countryCode'];

          // Map to expected interface
          return countries.map((country: RawCountryData) => ({
            id: country.id,
            name: country.countryName || '',
            code: country.countryCode
          }));
        }
      } catch (error) {
        console.warn(`Query ${queryName} failed:`, error);
      }
    }

    // If all queries fail, throw error instead of using fallback
    throw new Error('No countries query available in backend. Use the "🌍 Fix Countries" button to discover the correct query for your backend.');
  }

  /**
   * Check if the service is available by testing the GraphQL endpoint
   */
  async checkServiceAvailability(): Promise<boolean> {
    try {
      const token = authService.getToken();
      const response = await fetch(`${this.baseUrl}/graphql`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'query { __typename }'
        })
      });

      if (response.status === 401 || response.status === 403) {
        console.warn('Company service reachable but returned', response.status);
        return true; // Service is up; user may need to authenticate
      }

      return response.ok;
    } catch (error) {
      console.error('Service availability check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const companyService = new CompanyService();
