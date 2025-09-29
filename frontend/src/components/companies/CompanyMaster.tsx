import React, { useState, useEffect } from 'react';
import {
  companyService,
  Company,
  CompanyResponse,
  Country,
  CreateCompanyInput,
  UpdateCompanyInput
} from '../../services/companyService';
import { findCountriesQuery } from '../../utils/direct-backend-test';
import { introspectCompanyDomain } from '../../utils/company-introspection';

interface CreateFormState {
  companyName: string;
  registrationNumber: string;
  countryId?: number;
  active: boolean;
}

interface EditFormState {
  companyName?: string;
  registrationNumber?: string;
  countryId?: number;
}

interface ValidationErrors {
  companyName?: string;
  registrationNumber?: string;
}

const CompanyMaster: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceAvailable, setServiceAvailable] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormState>({});
  const [createFormData, setCreateFormData] = useState<CreateFormState>({
    companyName: '',
    registrationNumber: '',
    countryId: undefined,
    active: true
  });
  const [currentView, setCurrentView] = useState<'list' | 'edit' | 'create'>('list');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [editLoading, setEditLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);

  useEffect(() => {
    checkServiceAndLoadCompanies();
  }, []);

  const checkServiceAndLoadCompanies = async () => {
    try {
      setLoading(true);
      setError(null);

      // First check if service is available
      const available = await companyService.checkServiceAvailability();
      setServiceAvailable(available);

      if (available) {
        // Service is available, fetch companies
        const companyList = await companyService.getAllCompanies();
        setCompanies(companyList);
      } else {
        setError('Company service is not available. Please check if the backend is running.');
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      if (err instanceof Error) {
        setError(`Failed to load data: ${err.message}`);
      } else {
        setError('Failed to load company data');
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    checkServiceAndLoadCompanies();
  };

  // Developer tool: Introspect Company Domain
  const handleIntrospectDomain = async () => {
    try {
      console.log('🔍 Starting Company Domain Introspection...');
      const result = await introspectCompanyDomain();
      console.log('✅ Introspection completed. Check browser console for details.', result);

      // Show a brief success message
      setSuccessMessage('Domain introspection completed! Check browser console for full details.');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('❌ Introspection failed:', error);
      setError('Failed to introspect domain. Check browser console for details.');
    }
  };

  // Load countries for dropdown
  const loadCountries = async (): Promise<Country[]> => {
    setCountriesLoading(true);
    try {
      const countryList = await companyService.getAllCountries();
      setCountries(countryList);
      console.log(`✅ Loaded ${countryList.length} countries from database`);
      return countryList;
    } catch (err) {
      console.error('Failed to load countries from backend:', err);
      setError('Failed to load countries from database. Use 🌍 Test Countries button to check available queries.');
      setCountries([]); // Empty array, no fallback
      return [];
    } finally {
      setCountriesLoading(false);
    }
  };

  const normalizeCountries = (list: unknown): Country[] => {
    if (!Array.isArray(list)) {
      return [];
    }

    return list.reduce<Country[]>((acc, item) => {
      if (typeof item !== 'object' || item === null) {
        return acc;
      }

      const candidate = item as Record<string, unknown>;
      const id = candidate.id;
      const name = candidate.name;
      const code = candidate.code;

      const numericId = typeof id === 'number'
        ? id
        : typeof id === 'string' && id.trim().length > 0
          ? Number.parseInt(id, 10)
          : undefined;

      if (typeof name !== 'string' || !name.trim() || numericId === undefined || Number.isNaN(numericId)) {
        return acc;
      }

      acc.push({
        id: numericId,
        name: name.trim(),
        code: typeof code === 'string' ? code : undefined
      });

      return acc;
    }, []);
  };

  // Developer tool: Find and Fix Countries Query
  const handleTestCountries = async () => {
    try {
      console.log('🌍 Starting Enhanced Countries Backend Discovery...');
      setCountriesLoading(true);
      setError(null);

      // Use our enhanced direct backend test
      const result = await findCountriesQuery();
      console.log('🎯 FOUND WORKING COUNTRIES QUERY:', result);

      // Update the countries state with the discovered data
      setCountries(normalizeCountries(result.countries));

      // Show success message with the discovered query name
      setSuccessMessage(`✅ SUCCESS! Found working countries query: "${result.queryName}" with ${result.countries.length} countries. Service updated automatically!`);

      // Store the working query name for future use
      window.workingCountriesQuery = result.queryName;
      window.workingCountriesFields = result.workingFields;

      setTimeout(() => {
        setSuccessMessage(null);
      }, 8000);
    } catch (error) {
      console.error('❌ Countries discovery failed:', error);
      setError(`Failed to discover countries query: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => {
        setError(null);
      }, 8000);
    } finally {
      setCountriesLoading(false);
    }
  };


  // Form validation helper for create
  const validateCreateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Company Name validation
    if (!createFormData.companyName || createFormData.companyName.trim().length === 0) {
      errors.companyName = 'Company Name is required';
    } else if (createFormData.companyName.trim().length < 2) {
      errors.companyName = 'Company Name must be at least 2 characters long';
    } else if (createFormData.companyName.trim().length > 100) {
      errors.companyName = 'Company Name must be less than 100 characters';
    }

    // Registration Number validation (required for create)
    if (!createFormData.registrationNumber || createFormData.registrationNumber.trim().length === 0) {
      errors.registrationNumber = 'Registration Number is required';
    } else if (createFormData.registrationNumber.trim().length > 50) {
      errors.registrationNumber = 'Registration Number must be less than 50 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!editFormData.companyName || editFormData.companyName.trim().length === 0) {
      errors.companyName = 'Company Name is required';
    } else if (editFormData.companyName.trim().length < 2) {
      errors.companyName = 'Company Name must be at least 2 characters long';
    } else if (editFormData.companyName.trim().length > 100) {
      errors.companyName = 'Company Name must be less than 100 characters';
    }

    if (editFormData.registrationNumber && editFormData.registrationNumber.trim().length > 50) {
      errors.registrationNumber = 'Registration Number must be less than 50 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Edit functionality handlers
  const handleUpdateClick = async (company: Company) => {
    setSelectedCompany(company);
    setEditFormData({
      companyName: company.companyName,
      registrationNumber: company.companyCode // Using companyCode as registration number
    });
    setValidationErrors({});
    setSuccessMessage(null);
    setError(null);
    setCurrentView('edit');

    let availableCountries = countries;
    if (!availableCountries.length) {
      availableCountries = await loadCountries();
    }

    const normalizedCompanyCountry = company.country?.trim().toLowerCase();
    if (normalizedCompanyCountry && availableCountries.length) {
      const matchingCountry = availableCountries.find(country =>
        country.name.trim().toLowerCase() === normalizedCompanyCountry
      );

      if (matchingCountry) {
        setEditFormData(prev => ({ ...prev, countryId: matchingCountry.id }));
      }
    }
  };

  const handleEditCancel = () => {
    setSelectedCompany(null);
    setEditFormData({});
    setValidationErrors({});
    setSuccessMessage(null);
    setCurrentView('list');
  };

  const handleEditSave = async () => {
    if (!selectedCompany) return;

    // Clear previous messages
    setError(null);
    setSuccessMessage(null);

    // Validate form before saving
    if (!validateForm()) {
      return;
    }

    try {
      setEditLoading(true);

      // Prepare data for submission (trim values)
      const dataToSubmit: UpdateCompanyInput = {
        companyName: editFormData.companyName?.trim(),
        registrationNumber: editFormData.registrationNumber?.trim() || undefined,
        countryId: editFormData.countryId
      };

      const updatedCompany = await companyService.updateCompany(selectedCompany.id, dataToSubmit);

      // Update the company in the list
      setCompanies(prev => prev.map(c =>
        c.id === selectedCompany.id
          ? {
              ...c,
              companyName: updatedCompany.companyName,
              companyCode: updatedCompany.companyCode || c.companyCode,
              country: updatedCompany.country || c.country,
              companyStatus: updatedCompany.companyStatus || c.companyStatus,
              modifiedAt: updatedCompany.modifiedAt
            }
          : c
      ));

      setSuccessMessage('Company updated successfully!');

      // Auto-return to list after 2 seconds
      setTimeout(() => {
        setSelectedCompany(null);
        setEditFormData({});
        setValidationErrors({});
        setSuccessMessage(null);
        setCurrentView('list');
      }, 2000);

    } catch (err) {
      console.error('Failed to update company:', err);
      if (err instanceof Error) {
        setError(`Failed to update company: ${err.message}`);
      } else {
        setError('Failed to update company');
      }
    } finally {
      setEditLoading(false);
    }
  };

  // Create functionality handlers
  const handleCreateClick = async () => {
    setCurrentView('create');
    setValidationErrors({});
    setSuccessMessage(null);
    setError(null);

    // Load countries when opening create form
    if (countries.length === 0) {
      await loadCountries();
    }
  };

  const handleCreateCancel = () => {
    setCreateFormData({
      companyName: '',
      registrationNumber: '',
      countryId: undefined,
      active: true
    });
    setValidationErrors({});
    setSuccessMessage(null);
    setCurrentView('list');
  };

  const handleCreateSave = async () => {
    // Clear previous messages
    setError(null);
    setSuccessMessage(null);

    // Validate form before saving
    if (!validateCreateForm()) {
      return;
    }

    try {
      setCreateLoading(true);

      // Prepare data for submission (trim values)
      const dataToSubmit: CreateCompanyInput = {
        companyName: createFormData.companyName.trim(),
        registrationNumber: createFormData.registrationNumber.trim(),
        countryId: createFormData.countryId || undefined,
        active: createFormData.active
      };

      const newCompany = await companyService.createCompany(dataToSubmit);

      // Add the new company to the list (convert CompanyResponse to Company)
      const companyToAdd: Company = {
        ...newCompany,
        country: newCompany.country || 'Unknown',
        companyStatus: newCompany.companyStatus || 'ACTIVE'
      };
      setCompanies(prev => [companyToAdd, ...prev]);

      setSuccessMessage('Company created successfully!');

      // Auto-return to list after 2 seconds
      setTimeout(() => {
        setCreateFormData({
          companyName: '',
          registrationNumber: '',
          countryId: undefined,
          active: true
        });
        setValidationErrors({});
        setSuccessMessage(null);
        setCurrentView('list');
      }, 2000);

    } catch (err) {
      console.error('Failed to create company:', err);
      if (err instanceof Error) {
        setError(`Failed to create company: ${err.message}`);
      } else {
        setError('Failed to create company');
      }
    } finally {
      setCreateLoading(false);
    }
  };

  // Disable/Enable functionality handler
  const handleToggleStatus = async (company: Company) => {
    try {
      setToggleLoading(company.id);

      let updatedCompany: CompanyResponse;
      if (company.companyStatus === 'ACTIVE') {
        updatedCompany = await companyService.disableCompany(company.id);
      } else {
        updatedCompany = await companyService.reactivateCompany(company.id);
      }

      // Update the company in the list
      setCompanies(prev => prev.map(c =>
        c.id === company.id
          ? { ...c, companyStatus: updatedCompany.companyStatus!, modifiedAt: updatedCompany.modifiedAt }
          : c
      ));
    } catch (err) {
      console.error('Failed to toggle company status:', err);
      if (err instanceof Error) {
        setError(`Failed to toggle company status: ${err.message}`);
      } else {
        setError('Failed to toggle company status');
      }
    } finally {
      setToggleLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Loading companies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
        <button
          onClick={refreshData}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!serviceAvailable) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'orange' }}>
          Company service is not available. Please check if the backend is running.
        </p>
        <button
          onClick={refreshData}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Check Again
        </button>
      </div>
    );
  }

  // Edit View
  if (currentView === 'edit' && selectedCompany) {
    return (
      <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          borderBottom: '1px solid #eee',
          paddingBottom: '1rem'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>Update Company</h2>
          <button
            onClick={handleEditCancel}
            disabled={editLoading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: editLoading ? 'not-allowed' : 'pointer',
              opacity: editLoading ? 0.6 : 1
            }}
          >
            Back to List
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            ✅ {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleEditSave(); }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#333'
            }}>
              Company ID
            </label>
            <input
              type="text"
              value={selectedCompany.id}
              disabled
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                backgroundColor: '#f8f9fa',
                color: '#6c757d'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#333'
            }}>
              Company Code
            </label>
            <input
              type="text"
              value={selectedCompany.companyCode}
              disabled
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                backgroundColor: '#f8f9fa',
                color: '#6c757d'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#333'
            }}>
              Company Name *
            </label>
            <input
              type="text"
              value={editFormData.companyName || ''}
              onChange={(e) => {
                setEditFormData(prev => ({ ...prev, companyName: e.target.value }));
                // Clear validation error when user starts typing
                if (validationErrors.companyName) {
                  setValidationErrors(prev => ({ ...prev, companyName: '' }));
                }
              }}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: validationErrors.companyName ? '2px solid #dc3545' : '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
            {validationErrors.companyName && (
              <div style={{
                color: '#dc3545',
                fontSize: '0.8rem',
                marginTop: '0.25rem'
              }}>
                {validationErrors.companyName}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#333'
            }}>
              Registration Number
            </label>
            <input
              type="text"
              value={editFormData.registrationNumber || ''}
              onChange={(e) => {
                setEditFormData(prev => ({ ...prev, registrationNumber: e.target.value }));
                // Clear validation error when user starts typing
                if (validationErrors.registrationNumber) {
                  setValidationErrors(prev => ({ ...prev, registrationNumber: '' }));
                }
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: validationErrors.registrationNumber ? '2px solid #dc3545' : '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
            {validationErrors.registrationNumber && (
              <div style={{
                color: '#dc3545',
                fontSize: '0.8rem',
                marginTop: '0.25rem'
              }}>
                {validationErrors.registrationNumber}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#333'
            }}>
              Primary Email
            </label>
            <input
              type="email"
              value={selectedCompany.primaryEmail || ''}
              disabled
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                backgroundColor: '#f8f9fa',
                color: '#6c757d'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#333'
            }}>
              Country
            </label>
            <select
              value={editFormData.countryId ? String(editFormData.countryId) : ''}
              onChange={(e) => setEditFormData(prev => ({
                ...prev,
                countryId: e.target.value ? Number.parseInt(e.target.value, 10) : undefined
              }))}
              disabled={countriesLoading || countries.length === 0}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                backgroundColor: countriesLoading ? '#f8f9fa' : 'white'
              }}
            >
              <option value="">Select a country</option>
              {countries.map(country => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
            {(!countriesLoading && countries.length === 0) && (
              <div style={{
                color: '#6c757d',
                fontSize: '0.8rem',
                marginTop: '0.25rem'
              }}>
                No countries available. Use the 🌍 Test Countries button to discover options.
              </div>
            )}
            {selectedCompany.country && (
              <div style={{
                color: '#6c757d',
                fontSize: '0.75rem',
                marginTop: '0.25rem'
              }}>
                Current value: {selectedCompany.country}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#333'
            }}>
              Status
            </label>
            <input
              type="text"
              value={selectedCompany.companyStatus}
              disabled
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                backgroundColor: '#f8f9fa',
                color: '#6c757d'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid #eee'
          }}>
            <button
              type="submit"
              disabled={editLoading}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: editLoading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                opacity: editLoading ? 0.6 : 1
              }}
            >
              {editLoading ? 'Updating...' : 'Update Company'}
            </button>
            <button
              type="button"
              onClick={handleEditCancel}
              disabled={editLoading}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: editLoading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                opacity: editLoading ? 0.6 : 1
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Create View
  if (currentView === 'create') {
    return (
      <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          borderBottom: '1px solid #eee',
          paddingBottom: '1rem'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>Create New Company</h2>
          <button
            onClick={handleCreateCancel}
            disabled={createLoading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: createLoading ? 'not-allowed' : 'pointer',
              opacity: createLoading ? 0.6 : 1
            }}
          >
            Back to List
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            ✅ {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleCreateSave(); }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#333'
            }}>
              Company Name *
            </label>
            <input
              type="text"
              value={createFormData.companyName}
              onChange={(e) => {
                setCreateFormData(prev => ({ ...prev, companyName: e.target.value }));
                // Clear validation error when user starts typing
                if (validationErrors.companyName) {
                  setValidationErrors(prev => ({ ...prev, companyName: '' }));
                }
              }}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: validationErrors.companyName ? '2px solid #dc3545' : '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
            {validationErrors.companyName && (
              <div style={{
                color: '#dc3545',
                fontSize: '0.8rem',
                marginTop: '0.25rem'
              }}>
                {validationErrors.companyName}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#333'
            }}>
              Registration Number *
            </label>
            <input
              type="text"
              value={createFormData.registrationNumber}
              onChange={(e) => {
                setCreateFormData(prev => ({ ...prev, registrationNumber: e.target.value }));
                // Clear validation error when user starts typing
                if (validationErrors.registrationNumber) {
                  setValidationErrors(prev => ({ ...prev, registrationNumber: '' }));
                }
              }}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: validationErrors.registrationNumber ? '2px solid #dc3545' : '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
            {validationErrors.registrationNumber && (
              <div style={{
                color: '#dc3545',
                fontSize: '0.8rem',
                marginTop: '0.25rem'
              }}>
                {validationErrors.registrationNumber}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#333'
            }}>
              Country
            </label>
            <select
              value={createFormData.countryId || ''}
              onChange={(e) => setCreateFormData(prev => ({
                ...prev,
                countryId: e.target.value ? parseInt(e.target.value) : undefined
              }))}
              disabled={countriesLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                backgroundColor: countriesLoading ? '#f8f9fa' : 'white'
              }}
            >
              <option value="">Select a country (optional)</option>
              {countries.map(country => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
            {countriesLoading && (
              <div style={{
                color: '#6c757d',
                fontSize: '0.8rem',
                marginTop: '0.25rem'
              }}>
                Loading countries...
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              fontWeight: '600',
              color: '#333',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={createFormData.active}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, active: e.target.checked }))}
                style={{
                  marginRight: '0.5rem',
                  transform: 'scale(1.2)'
                }}
              />
              Active Company
            </label>
            <div style={{
              fontSize: '0.8rem',
              color: '#6c757d',
              marginTop: '0.25rem'
            }}>
              Uncheck to create company in inactive state
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid #eee'
          }}>
            <button
              type="submit"
              disabled={createLoading}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: createLoading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                opacity: createLoading ? 0.6 : 1
              }}
            >
              {createLoading ? 'Creating...' : 'Create Company'}
            </button>
            <button
              type="button"
              onClick={handleCreateCancel}
              disabled={createLoading}
              style={{
                flex: 1,
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: createLoading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                opacity: createLoading ? 0.6 : 1
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        borderBottom: '1px solid #eee',
        paddingBottom: '1rem'
      }}>
        <h2 style={{ margin: 0, color: '#333' }}>Company Master</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleCreateClick}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            ➕ Create New Company
          </button>
          <button
            onClick={handleTestCountries}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#ffc107',
              color: '#212529',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
            title="Find and Fix Countries Backend Query"
          >
            🌍 Fix Countries
          </button>
          <button
            onClick={handleIntrospectDomain}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
            title="Introspect GraphQL Company Domain Schema"
          >
            🔍 Introspect
          </button>
          <button
            onClick={refreshData}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          ✅ {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          ❌ {error}
        </div>
      )}

      {companies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: '#666' }}>No companies found.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderRadius: '8px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{
                  padding: '12px',
                  textAlign: 'left',
                  borderBottom: '2px solid #dee2e6',
                  fontWeight: '600',
                  color: '#495057'
                }}>ID</th>
                <th style={{
                  padding: '12px',
                  textAlign: 'left',
                  borderBottom: '2px solid #dee2e6',
                  fontWeight: '600',
                  color: '#495057'
                }}>Company Code</th>
                <th style={{
                  padding: '12px',
                  textAlign: 'left',
                  borderBottom: '2px solid #dee2e6',
                  fontWeight: '600',
                  color: '#495057'
                }}>Company Name</th>
                <th style={{
                  padding: '12px',
                  textAlign: 'left',
                  borderBottom: '2px solid #dee2e6',
                  fontWeight: '600',
                  color: '#495057'
                }}>Email</th>
                <th style={{
                  padding: '12px',
                  textAlign: 'left',
                  borderBottom: '2px solid #dee2e6',
                  fontWeight: '600',
                  color: '#495057'
                }}>Country</th>
                <th style={{
                  padding: '12px',
                  textAlign: 'left',
                  borderBottom: '2px solid #dee2e6',
                  fontWeight: '600',
                  color: '#495057'
                }}>Status</th>
                <th style={{
                  padding: '12px',
                  textAlign: 'center',
                  borderBottom: '2px solid #dee2e6',
                  fontWeight: '600',
                  color: '#495057',
                  width: '200px'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} style={{
                  borderBottom: '1px solid #dee2e6',
                  transition: 'background-color 0.2s',
                }}>
                  <td style={{
                    padding: '12px',
                    color: '#6c757d',
                    fontSize: '0.9rem'
                  }}>
                    {company.id}
                  </td>
                  <td style={{
                    padding: '12px',
                    fontWeight: '500',
                    color: '#495057'
                  }}>
                    {company.companyCode}
                  </td>
                  <td style={{
                    padding: '12px',
                    fontWeight: '600',
                    color: '#212529'
                  }}>
                    {company.companyName}
                  </td>
                  <td style={{
                    padding: '12px',
                    color: '#6c757d'
                  }}>
                    {company.primaryEmail || 'N/A'}
                  </td>
                  <td style={{
                    padding: '12px',
                    color: '#495057'
                  }}>
                    {company.country}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      backgroundColor: company.companyStatus === 'ACTIVE' ? '#d4edda' : '#f8d7da',
                      color: company.companyStatus === 'ACTIVE' ? '#155724' : '#721c24'
                    }}>
                      {company.companyStatus}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleUpdateClick(company)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleToggleStatus(company)}
                        disabled={toggleLoading === company.id}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: company.companyStatus === 'ACTIVE' ? '#dc3545' : '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: toggleLoading === company.id ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          opacity: toggleLoading === company.id ? 0.6 : 1
                        }}
                      >
                        {toggleLoading === company.id
                          ? 'Loading...'
                          : company.companyStatus === 'ACTIVE' ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        fontSize: '0.9rem',
        color: '#6c757d'
      }}>
        <strong>Total Companies:</strong> {companies.length}
      </div>
    </div>
  );
};

export default CompanyMaster;
