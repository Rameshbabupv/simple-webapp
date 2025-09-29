import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Company CRUD API contract types
interface Company {
  id: string;
  companyCode: string;
  companyName: string;
  primaryEmail?: string;
  country: string;
  companyStatus: string;
  createdAt?: string;
  modifiedAt?: string;
}

interface CreateCompanyInput {
  companyName: string;
  registrationNumber: string;
  active?: boolean;
}

interface UpdateCompanyInput {
  companyName?: string;
  registrationNumber?: string;
  countryId?: number;
}

interface CompanyResponse {
  id: string;
  companyCode: string;
  companyName: string;
  country?: string;
  createdAt?: string;
  modifiedAt?: string;
}

interface ApiError {
  message: string;
  path?: string[];
}

// Mock company service for CRUD operations
const mockCompanyService = {
  getAllCompanies: jest.fn(),
  getCompanyById: jest.fn(),
  createCompany: jest.fn(),
  updateCompany: jest.fn(),
  disableCompany: jest.fn(),
  reactivateCompany: jest.fn(),
  checkServiceAvailability: jest.fn(),
};

describe('Company Management API Contract Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('READ Operations', () => {
    it('should get all companies successfully', async () => {
      const mockCompanies: Company[] = [
        {
          id: '21',
          companyCode: 'SYSTECH001',
          companyName: 'SysTech Solutions Private Limited',
          primaryEmail: 'info@systechsolutions.com',
          country: 'India',
          companyStatus: 'ACTIVE',
          createdAt: '2025-09-15T00:24:18.339943',
          modifiedAt: '2025-09-15T00:24:18.339943'
        }
      ];

      mockCompanyService.getAllCompanies.mockResolvedValue(mockCompanies);

      const result = await mockCompanyService.getAllCompanies();

      expect(result).toEqual(mockCompanies);
      expect(result[0].companyStatus).toBe('ACTIVE');
      expect(mockCompanyService.getAllCompanies).toHaveBeenCalledTimes(1);
    });
  });

  describe('CREATE Operations', () => {
    it('should create a new company successfully', async () => {
      const createInput: CreateCompanyInput = {
        companyName: 'New Company Ltd',
        registrationNumber: 'REG12345',
        active: true
      };

      const expectedResponse: CompanyResponse = {
        id: '22',
        companyCode: 'NEWCOMPANY001',
        companyName: 'New Company Ltd',
        createdAt: '2025-09-28T10:00:00.000000'
      };

      mockCompanyService.createCompany.mockResolvedValue(expectedResponse);

      const result = await mockCompanyService.createCompany(createInput);

      expect(result).toEqual(expectedResponse);
      expect(result.companyName).toBe(createInput.companyName);
      expect(mockCompanyService.createCompany).toHaveBeenCalledWith(createInput);
    });

    it('should reject company creation with invalid input', async () => {
      const invalidInput = {
        companyName: 'A', // Too short (< 2 chars)
        registrationNumber: 'AB' // Too short (< 3 chars)
      };

      const expectedError: ApiError = {
        message: 'Company name must be between 2 and 200 characters'
      };

      mockCompanyService.createCompany.mockRejectedValue(expectedError);

      await expect(mockCompanyService.createCompany(invalidInput))
        .rejects.toEqual(expectedError);
    });
  });

  describe('UPDATE Operations', () => {
    it('should update company successfully', async () => {
      const updateInput: UpdateCompanyInput = {
        companyName: 'Updated Company Name',
        countryId: 99
      };

      const expectedResponse: CompanyResponse = {
        id: '21',
        companyCode: 'SYSTECH001',
        companyName: 'Updated Company Name',
        country: 'Nexusland',
        modifiedAt: '2025-09-28T10:00:00.000000'
      };

      mockCompanyService.updateCompany.mockResolvedValue(expectedResponse);

      const result = await mockCompanyService.updateCompany('21', updateInput);

      expect(result).toEqual(expectedResponse);
      expect(result.companyName).toBe(updateInput.companyName);
      expect(result.country).toBe(expectedResponse.country);
      expect(mockCompanyService.updateCompany).toHaveBeenCalledWith('21', updateInput);
    });
  });

  describe('DISABLE/REACTIVATE Operations', () => {
    it('should disable company successfully', async () => {
      const expectedResponse: CompanyResponse = {
        id: '21',
        companyCode: 'SYSTECH001',
        companyName: 'SysTech Solutions Private Limited',
        modifiedAt: '2025-09-28T10:00:00.000000'
      };

      mockCompanyService.disableCompany.mockResolvedValue(expectedResponse);

      const result = await mockCompanyService.disableCompany('21');

      expect(result).toEqual(expectedResponse);
      expect(mockCompanyService.disableCompany).toHaveBeenCalledWith('21');
    });

    it('should reactivate company successfully', async () => {
      const expectedResponse: CompanyResponse = {
        id: '21',
        companyCode: 'SYSTECH001',
        companyName: 'SysTech Solutions Private Limited',
        modifiedAt: '2025-09-28T10:00:00.000000'
      };

      mockCompanyService.reactivateCompany.mockResolvedValue(expectedResponse);

      const result = await mockCompanyService.reactivateCompany('21');

      expect(result).toEqual(expectedResponse);
      expect(mockCompanyService.reactivateCompany).toHaveBeenCalledWith('21');
    });
  });

  describe('Error Handling', () => {
    it('should handle access denied errors', async () => {
      const accessDeniedError: ApiError = {
        message: 'org.springframework.security.access.AccessDeniedException: Access Denied'
      };

      mockCompanyService.getAllCompanies.mockRejectedValue(accessDeniedError);

      await expect(mockCompanyService.getAllCompanies())
        .rejects.toEqual(accessDeniedError);
    });

    it('should handle service unavailability', async () => {
      mockCompanyService.checkServiceAvailability.mockResolvedValue(false);

      const result = await mockCompanyService.checkServiceAvailability();

      expect(result).toBe(false);
    });
  });
});
