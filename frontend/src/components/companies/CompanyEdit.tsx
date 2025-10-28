import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Company, companyService } from '../../services/companyService';

// Tab component imports
import CompanyTab from './tabs/CompanyTab';
import StatutoryInfoTab from './tabs/StatutoryInfoTab';
import LocationsTab from './tabs/LocationsTab';
import GeneralTab from './tabs/GeneralTab';
import AttendanceTab from './tabs/AttendanceTab';
import IncentivesTab from './tabs/IncentivesTab';
import BankTab from './tabs/BankTab';
import HRYearTab from './tabs/HRYearTab';
import SymbolicTab from './tabs/SymbolicTab';
import ProfessionalTaxTab from './tabs/ProfessionalTaxTab';
import PrintConfigTab from './tabs/PrintConfigTab';

// Tab configuration
export const TAB_CONFIG = {
  company: { label: '🏢 Company', component: CompanyTab },
  statutory: { label: '📋 Statutory Info', component: StatutoryInfoTab },
  locations: { label: '📍 Locations', component: LocationsTab },
  general: { label: '⚙️ General', component: GeneralTab },
  attendance: { label: '🕐 Attendance', component: AttendanceTab },
  incentives: { label: '💰 Incentives', component: IncentivesTab },
  bank: { label: '🏦 Bank', component: BankTab },
  hryear: { label: '📅 HR Year', component: HRYearTab },
  symbolic: { label: '🎨 Symbolic', component: SymbolicTab },
  professionaltax: { label: '🏛️ Professional Tax', component: ProfessionalTaxTab },
  printconfig: { label: '🖨️ Print Config', component: PrintConfigTab },
} as const;

export type TabKey = keyof typeof TAB_CONFIG;

interface CompanyEditProps {
  companyId?: string;
}

const CompanyEdit: React.FC<CompanyEditProps> = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract active tab from URL query params, default to 'company'
  const searchParams = new URLSearchParams(location.search);
  const activeTabFromUrl = searchParams.get('tab') as TabKey || 'company';

  const [activeTab, setActiveTab] = useState<TabKey>(activeTabFromUrl);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Load company data on mount
  useEffect(() => {
    if (companyId && companyId !== 'new') {
      loadCompanyData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  // Update URL when tab changes
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    if (activeTab !== 'company') {
      newSearchParams.set('tab', activeTab);
    }
    const newSearch = newSearchParams.toString();
    const newUrl = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;

    if (location.pathname + location.search !== newUrl) {
      navigate(newUrl, { replace: true });
    }
  }, [activeTab, navigate, location.pathname, location.search]);

  const loadCompanyData = async () => {
    if (!companyId || companyId === 'new') return;

    setLoading(true);
    setError(null);

    try {
      // Fetch real company data from the API
      const company = await companyService.getCompanyById(companyId);

      setCompany(company);
      setFormData({
        company: {
          companyName: company.companyName,
          // shortName: company.shortName, // temporarily disabled until backend schema is updated
          registeredAddress: company.registeredAddress,
          country: company.country
          // companyCode is readonly, so don't include in formData for saving
        },
        // Initialize other tab data as needed
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load company data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabKey: TabKey) => {
    // TODO: Add unsaved changes warning if needed
    setActiveTab(tabKey);
  };

  const handleBack = () => {
    // TODO: Add unsaved changes warning if needed
    navigate('/');
  };

  const handleFormDataChange = (tabKey: string, data: unknown) => {
    setFormData(prev => ({
      ...prev,
      [tabKey]: data
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!company?.id) {
      console.error('No company ID available for saving');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get company tab data
      const companyTabData = formData.company as {
        companyName?: string;
        companyCode?: string;
        shortName?: string;
        registeredAddress?: string;
        countryId?: number;
        state?: string;
        city?: string;
        pincode?: string;
        email?: string;
        website?: string;
        contactPerson?: string;
        designation?: string;
        landlineNo?: string;
        officeMobile?: string;
        currency?: string;
        remarks?: string;
      } | undefined;

      // Prepare update data (Company Code is readonly, so don't include it)
      // shortName temporarily excluded until backend schema is updated
      const updateData: {
        companyName?: string;
        registeredAddress?: string;
        countryId?: number;
        state?: string;
        city?: string;
        pincode?: string;
        email?: string;
        website?: string;
        contactPerson?: string;
        designation?: string;
        landlineNo?: string;
        officeMobile?: string;
        currency?: string;
        remarks?: string;
      } = {};
      let hasChanges = false;

      // Validate and prepare company name
      if (companyTabData?.companyName) {
        if (companyTabData.companyName.trim().length < 2) {
          setError('Company Name must be at least 2 characters long');
          return;
        }
        if (companyTabData.companyName.trim().length > 100) {
          setError('Company Name must be less than 100 characters');
          return;
        }
        updateData.companyName = companyTabData.companyName.trim();
        hasChanges = true;
      }

      // TODO: Validate and prepare short name (temporarily disabled until backend schema is updated)
      // if (companyTabData?.shortName !== undefined) {
      //   if (companyTabData.shortName.trim().length > 50) {
      //     setError('Short Name must be less than 50 characters');
      //     return;
      //   }
      //   updateData.shortName = companyTabData.shortName.trim();
      //   hasChanges = true;
      // }

      // Validate and prepare registered address
      if (companyTabData?.registeredAddress !== undefined) {
        if (companyTabData.registeredAddress.trim().length > 500) {
          setError('Registered Address must be less than 500 characters');
          return;
        }
        updateData.registeredAddress = companyTabData.registeredAddress.trim();
        hasChanges = true;
      }

      // Include countryId if provided (backend v1.1 supports country updates)
      if (companyTabData?.countryId !== undefined) {
        updateData.countryId = companyTabData.countryId;
        hasChanges = true;
      }

      // TODO: Include new fields when backend supports them
      // Backend needs to add these fields to UpdateCompanyInput GraphQL type first:
      // state, city, pincode, email, website, contactPerson, designation,
      // landlineNo, officeMobile, currency, remarks

      if (hasChanges) {
        console.log('Saving company data:', updateData);

        // Call the update API
        const updatedCompany = await companyService.updateCompany(company.id, updateData);

        // Update local company data
        setCompany({
          ...updatedCompany,
          country: updatedCompany.country || company.country,
          companyStatus: updatedCompany.companyStatus || company.companyStatus
        });
        setHasUnsavedChanges(false);

        console.log('✅ Company saved successfully:', updatedCompany);
      } else {
        console.log('No company changes to save');
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.error('Failed to save company:', err);
      setError(err instanceof Error ? err.message : 'Failed to save company data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Loading company data...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#dc3545' }}>
        <h3>Error loading company</h3>
        <p>{error}</p>
        <button onClick={handleBack} style={{ padding: '8px 16px', marginTop: '16px' }}>
          Back to Company List
        </button>
      </div>
    );
  }

  const isNewCompany = companyId === 'new';
  const ActiveTabComponent = TAB_CONFIG[activeTab].component;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `${sidebarExpanded ? '250px' : '80px'} 1fr`,
      minHeight: 'calc(100vh - 140px)',
      backgroundColor: '#f8f9fa',
      transition: 'grid-template-columns 0.3s ease'
    }}>
      {/* Expandable/Collapsible Sidebar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRight: '1px solid #dee2e6',
          padding: '20px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: sidebarExpanded ? 'stretch' : 'center',
          transition: 'all 0.3s ease',
          position: 'relative'
        }}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        {/* Expand/Collapse Toggle */}
        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#f8f9fa',
            color: '#495057',
            cursor: 'pointer',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            zIndex: 10
          }}
          title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarExpanded ? '◀' : '▶'}
        </button>

        {/* Navigation Items */}
        <div style={{
          padding: sidebarExpanded ? '0 15px' : '0',
          marginTop: '40px'
        }}>
          {/* Back to Dashboard */}
          <button
            onClick={handleBack}
            style={{
              width: sidebarExpanded ? '100%' : '50px',
              height: '50px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#f8f9fa',
              color: '#495057',
              cursor: 'pointer',
              marginBottom: '15px',
              fontSize: sidebarExpanded ? '14px' : '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarExpanded ? 'flex-start' : 'center',
              transition: 'all 0.3s ease',
              padding: sidebarExpanded ? '0 15px' : '0',
              gap: sidebarExpanded ? '10px' : '0'
            }}
            title="Back to Dashboard"
          >
            <span>🏠</span>
            {sidebarExpanded && <span>Dashboard</span>}
          </button>

          {/* Company Section */}
          <div style={{
            width: sidebarExpanded ? '100%' : '50px',
            minHeight: '50px',
            borderRadius: '8px',
            backgroundColor: '#007bff',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarExpanded ? 'flex-start' : 'center',
            fontSize: sidebarExpanded ? '14px' : '20px',
            marginBottom: '15px',
            padding: sidebarExpanded ? '0 15px' : '0',
            gap: sidebarExpanded ? '10px' : '0',
            transition: 'all 0.3s ease'
          }}>
            <span>🏢</span>
            {sidebarExpanded && (
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>Company Edit</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  {company?.companyName || 'Loading...'}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Menu Items */}
          {sidebarExpanded && (
            <div style={{
              borderTop: '1px solid #dee2e6',
              paddingTop: '15px',
              marginTop: '15px'
            }}>
              <div style={{
                fontSize: '12px',
                color: '#6c757d',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Quick Actions
              </div>

              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: hasUnsavedChanges ? '#28a745' : '#e9ecef',
                  color: hasUnsavedChanges ? 'white' : '#6c757d',
                  cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed',
                  fontSize: '13px',
                  marginBottom: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                💾 {hasUnsavedChanges ? 'Save Changes' : 'No Changes'}
              </button>

              <button
                onClick={handleBack}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #dee2e6',
                  backgroundColor: 'white',
                  color: '#495057',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'all 0.2s ease'
                }}
              >
                ← Cancel
              </button>
            </div>
          )}

          {/* Save indicator for collapsed state */}
          {!sidebarExpanded && hasUnsavedChanges && (
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#dc3545',
              margin: '10px auto'
            }} title="Unsaved changes" />
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        backgroundColor: '#ffffff',
        overflow: 'auto',
        padding: '20px'
      }}>
        {/* Header with breadcrumbs */}
        <div style={{
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ marginBottom: '8px', fontSize: '14px', color: '#6c757d' }}>
              <button
                onClick={handleBack}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#007bff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textDecoration: 'underline'
                }}
              >
                ← Company Master
              </button>
              <span> / </span>
              <span>{isNewCompany ? 'New Company' : company?.companyName || 'Edit Company'}</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '28px', color: '#495057' }}>
              {isNewCompany ? '➕ Create New Company' : `✏️ Edit ${company?.companyName}`}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleBack}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              style={{
                padding: '10px 20px',
                backgroundColor: hasUnsavedChanges ? '#28a745' : '#e9ecef',
                color: hasUnsavedChanges ? 'white' : '#6c757d',
                border: 'none',
                borderRadius: '6px',
                cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed',
                fontSize: '14px'
              }}
            >
              {hasUnsavedChanges ? 'Save Changes' : 'No Changes'}
            </button>
          </div>
        </div>

        {/* Tabbed content container */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {/* Tab Navigation */}
          <div style={{
            borderBottom: '1px solid #dee2e6',
            backgroundColor: '#f8f9fa',
            padding: '0 20px'
          }}>
            <div style={{
              display: 'flex',
              gap: '0',
              overflowX: 'auto',
              scrollbarWidth: 'thin'
            }}>
              {Object.entries(TAB_CONFIG).map(([key, config]) => {
                const tabKey = key as TabKey;
                const isActive = activeTab === tabKey;

                return (
                  <button
                    key={tabKey}
                    onClick={() => handleTabChange(tabKey)}
                    style={{
                      padding: '14px 20px',
                      border: 'none',
                      backgroundColor: isActive ? '#5bc0de' : 'transparent',
                      color: isActive ? 'white' : '#495057',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: isActive ? '600' : '400',
                      borderRadius: isActive ? '6px 6px 0 0' : '0',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease',
                      marginBottom: isActive ? '0' : '0',
                      transform: isActive ? 'translateY(0)' : 'none'
                    }}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div style={{ padding: '30px' }}>
            <ActiveTabComponent
              company={company}
              formData={formData[activeTab] || {}}
              onDataChange={(data: unknown) => handleFormDataChange(activeTab, data)}
              isNewCompany={isNewCompany}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyEdit;