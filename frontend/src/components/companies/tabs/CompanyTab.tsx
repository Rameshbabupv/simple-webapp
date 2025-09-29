import React, { useState, useEffect } from 'react';
import { Company, Country, companyService } from '../../../services/companyService';

interface CompanyTabProps {
  company: Company | null;
  formData: unknown;
  onDataChange: (data: unknown) => void;
  isNewCompany: boolean;
}

interface CompanyFormData {
  companyName: string;
  companyCode: string;
  shortName: string;
  registeredAddress: string;
  country: string;
  countryId?: number;
}

const CompanyTab: React.FC<CompanyTabProps> = ({
  company,
  formData,
  onDataChange,
  isNewCompany
}) => {
  const [localFormData, setLocalFormData] = useState<CompanyFormData>({
    companyName: '',
    companyCode: '',
    shortName: '',
    registeredAddress: '',
    country: '',
    countryId: undefined
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const countriesList = await companyService.getAllCountries();
        setCountries(countriesList);
      } catch (error) {
        console.error('Failed to fetch countries:', error);
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  // Initialize form data only when company data changes, not when formData changes
  useEffect(() => {
    if (company && !isNewCompany) {
      setLocalFormData({
        companyName: company.companyName || '',
        companyCode: company.companyCode || '',
        shortName: company.shortName || '',
        registeredAddress: company.registeredAddress || '',
        country: company.country || '',
        countryId: undefined
      });
    }
  }, [company, isNewCompany]);

  // Initialize form data for new companies or when no company data is available
  useEffect(() => {
    if (isNewCompany && formData && typeof formData === 'object' && formData !== null) {
      const existingData = formData as CompanyFormData;
      setLocalFormData({
        companyName: existingData.companyName || '',
        companyCode: existingData.companyCode || '',
        shortName: existingData.shortName || '',
        registeredAddress: existingData.registeredAddress || '',
        country: existingData.country || '',
        countryId: existingData.countryId
      });
    }
  }, [formData, isNewCompany]);

  const validateCompanyName = (name: string): string => {
    if (!name.trim()) {
      return 'Company Name is required';
    }
    if (name.trim().length < 2) {
      return 'Company Name must be at least 2 characters long';
    }
    if (name.trim().length > 100) {
      return 'Company Name must be less than 100 characters';
    }
    return '';
  };


  const validateRegisteredAddress = (address: string): string => {
    if (address.trim().length > 500) {
      return 'Registered Address must be less than 500 characters';
    }
    return '';
  };


  const handleCompanyNameChange = (value: string) => {
    setLocalFormData(prev => ({ ...prev, companyName: value }));

    // Clear validation error when user starts typing
    if (validationErrors.companyName) {
      setValidationErrors(prev => ({ ...prev, companyName: '' }));
    }

    // Notify parent component of changes
    const updatedData = { ...localFormData, companyName: value };
    onDataChange(updatedData);
  };


  const handleCompanyNameBlur = () => {
    const error = validateCompanyName(localFormData.companyName);
    if (error) {
      setValidationErrors(prev => ({ ...prev, companyName: error }));
    }
  };


  const handleRegisteredAddressChange = (value: string) => {
    setLocalFormData(prev => ({ ...prev, registeredAddress: value }));

    // Clear validation error when user starts typing
    if (validationErrors.registeredAddress) {
      setValidationErrors(prev => ({ ...prev, registeredAddress: '' }));
    }

    // Notify parent component of changes
    const updatedData = { ...localFormData, registeredAddress: value };
    onDataChange(updatedData);
  };

  const handleRegisteredAddressBlur = () => {
    const error = validateRegisteredAddress(localFormData.registeredAddress);
    if (error) {
      setValidationErrors(prev => ({ ...prev, registeredAddress: error }));
    }
  };

  const handleCountryChange = (value: string) => {
    const selectedCountry = countries.find(c => c.id.toString() === value);
    setLocalFormData(prev => ({
      ...prev,
      countryId: selectedCountry ? selectedCountry.id : undefined,
      country: selectedCountry ? selectedCountry.name : ''
    }));

    // Notify parent component of changes
    const updatedData = {
      ...localFormData,
      countryId: selectedCountry ? selectedCountry.id : undefined,
      country: selectedCountry ? selectedCountry.name : ''
    };
    onDataChange(updatedData);
  };


  return (
    <div style={{ width: '100%', height: '100%', padding: '0' }}>
      {/* Form with 2-column layout - Full Width */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        width: '100%',
        minHeight: '500px'
      }}>
        {/* 2-Column Grid Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '30px',
          marginBottom: '30px'
        }}>
          {/* Left Column */}
          <div>
            {/* Company Name Field - Top Left */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#495057',
                fontSize: '14px'
              }}>
                Company Name *
                {company && (
                  <span style={{
                    fontWeight: '400',
                    color: '#6c757d',
                    fontSize: '12px',
                    marginLeft: '8px'
                  }}>
                    (ID: {company.id}, Code: {company.companyCode}, Short Name: {company.shortName || 'N/A'})
                  </span>
                )}
              </label>
              <input
                type="text"
                value={localFormData.companyName}
                onChange={(e) => handleCompanyNameChange(e.target.value)}
                onBlur={handleCompanyNameBlur}
                placeholder="Enter company name"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: validationErrors.companyName ? '2px solid #dc3545' : '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  backgroundColor: 'white',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
              />
              {validationErrors.companyName && (
                <div style={{
                  color: '#dc3545',
                  fontSize: '12px',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ⚠️ {validationErrors.companyName}
                </div>
              )}
            </div>

            {/* Registered Address Field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#495057',
                fontSize: '14px'
              }}>
                Registered Address
              </label>
              <textarea
                value={localFormData.registeredAddress}
                onChange={(e) => handleRegisteredAddressChange(e.target.value)}
                onBlur={handleRegisteredAddressBlur}
                placeholder="Enter registered address"
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: validationErrors.registeredAddress ? '2px solid #dc3545' : '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  backgroundColor: 'white',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  minHeight: '100px'
                }}
              />
              {validationErrors.registeredAddress && (
                <div style={{
                  color: '#dc3545',
                  fontSize: '12px',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ⚠️ {validationErrors.registeredAddress}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Country Field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#495057',
                fontSize: '14px'
              }}>
                Country
                <span style={{
                  fontWeight: '400',
                  color: '#6c757d',
                  fontSize: '12px',
                  marginLeft: '8px',
                  fontStyle: 'italic'
                }}>
                  (Display only - backend doesn't support country updates yet)
                </span>
              </label>
              <select
                value={localFormData.countryId?.toString() || ''}
                onChange={(e) => handleCountryChange(e.target.value)}
                disabled={true}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  backgroundColor: '#f8f9fa',
                  color: '#6c757d',
                  cursor: 'not-allowed',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">
                  {loadingCountries ? 'Loading countries...' : localFormData.country || 'No country set'}
                </option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
              {company && localFormData.country && (
                <div style={{
                  fontSize: '12px',
                  color: '#6c757d',
                  marginTop: '4px'
                }}>
                  Current: {localFormData.country}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Box - Full Width Below Columns */}
        <div style={{
          padding: '16px',
          backgroundColor: '#e7f3ff',
          borderRadius: '6px',
          border: '1px solid #b8daff'
        }}>
          <div style={{
            color: '#004085',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>ℹ️</span>
            <span>
              Following STAGE approach: More company fields will be added incrementally.
              Current fields: Company Name (required, 2-100 characters), Short Name (display only - backend update pending), Registered Address (optional, up to 500 characters), Country (display only - backend doesn't support updates yet). ID and Code shown as metadata.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyTab;