import React from 'react';
import { Company } from '../../../services/companyService';

interface LocationsTabProps {
  company: Company | null;
  formData: unknown;
  onDataChange: (data: unknown) => void;
  isNewCompany: boolean;
}

const LocationsTab: React.FC<LocationsTabProps> = ({
  company: _company,
  formData: _formData,
  onDataChange: _onDataChange,
  isNewCompany: _isNewCompany
}) => {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>📍</div>
      <h3 style={{ color: '#495057', marginBottom: '10px' }}>Locations</h3>
      <p style={{ color: '#6c757d', maxWidth: '500px', margin: '0 auto' }}>
        Manage multiple company locations and branches:
      </p>
      <ul style={{
        color: '#6c757d',
        textAlign: 'left',
        maxWidth: '400px',
        margin: '20px auto',
        lineHeight: '1.6'
      }}>
        <li>Headquarters</li>
        <li>Branch Offices</li>
        <li>Manufacturing Units</li>
        <li>Warehouses</li>
        <li>Sales Offices</li>
      </ul>
      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#fff3cd',
        borderRadius: '6px',
        color: '#856404',
        fontSize: '14px'
      }}>
        🚧 Coming Soon - Location management interface will be implemented here
      </div>
    </div>
  );
};

export default LocationsTab;