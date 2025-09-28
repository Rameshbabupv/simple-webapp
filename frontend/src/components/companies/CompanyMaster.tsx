import React, { useState, useEffect } from 'react';
import { companyService, Company } from '../../services/companyService';

export const CompanyMaster: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceAvailable, setServiceAvailable] = useState(false);

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
        setError('Backend service is not available. Please ensure the GraphQL server is running on http://localhost:8080');
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
      if (err instanceof Error) {
        setError(`Failed to load companies: ${err.message}`);
      } else {
        setError('Failed to load companies: Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    checkServiceAndLoadCompanies();
  };

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h2 style={{ color: '#495057', marginBottom: '20px' }}>
          🏢 Company Master
        </h2>
        <div style={{
          padding: '40px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#6c757d'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>⏳</div>
          <p>Loading companies...</p>
          <p style={{ fontSize: '14px' }}>
            Fetching data from GraphQL endpoint...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <h2 style={{ color: '#495057', marginBottom: '20px' }}>
          🏢 Company Master
        </h2>
        <div style={{
          padding: '20px',
          backgroundColor: '#f8d7da',
          borderRadius: '8px',
          border: '1px solid #f5c6cb',
          color: '#721c24'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>❌</div>
          <strong>Error:</strong> {error}
          <div style={{ marginTop: '15px' }}>
            <button
              onClick={handleRefresh}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🔄 Retry
            </button>
          </div>
        </div>

        {!serviceAvailable && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#fff3cd',
            borderRadius: '8px',
            border: '1px solid #ffeaa7',
            color: '#856404'
          }}>
            <strong>Troubleshooting:</strong>
            <ul style={{ marginTop: '10px', textAlign: 'left' }}>
              <li>Ensure the backend GraphQL server is running on port 8080</li>
              <li>Check your authentication token is valid</li>
              <li>Verify you have platform-admin or app-admin permissions</li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#495057', margin: 0 }}>
          🏢 Company Master
        </h2>
        <button
          onClick={handleRefresh}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {companies.length === 0 ? (
        <div style={{
          padding: '40px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#6c757d'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>📋</div>
          <p>No companies found</p>
          <p style={{ fontSize: '14px' }}>
            The company list is empty or you may not have permission to view companies.
          </p>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr 1fr 1fr',
            gap: '10px',
            padding: '15px 20px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #dee2e6',
            fontWeight: '600',
            fontSize: '14px',
            color: '#495057'
          }}>
            <div>Company Code</div>
            <div>Company Name</div>
            <div>Country</div>
            <div>Status</div>
          </div>

          {/* Company Rows */}
          {companies.map((company, index) => (
            <div
              key={company.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr 1fr 1fr',
                gap: '10px',
                padding: '15px 20px',
                borderBottom: index < companies.length - 1 ? '1px solid #dee2e6' : 'none',
                fontSize: '14px'
              }}
            >
              <div style={{ fontWeight: '500', color: '#007bff' }}>
                {company.companyCode}
              </div>
              <div style={{ color: '#495057' }}>
                {company.companyName}
              </div>
              <div style={{ color: '#6c757d' }}>
                {company.country}
              </div>
              <div>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: company.companyStatus === 'ACTIVE' ? '#d4edda' : '#f8d7da',
                  color: company.companyStatus === 'ACTIVE' ? '#155724' : '#721c24'
                }}>
                  {company.companyStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div style={{
        marginTop: '20px',
        fontSize: '12px',
        color: '#6c757d',
        textAlign: 'center'
      }}>
        Showing {companies.length} companies | Data from GraphQL endpoint
      </div>
    </div>
  );
};

export default CompanyMaster;