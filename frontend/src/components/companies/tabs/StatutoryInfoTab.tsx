import React from 'react';
import { Company } from '../../../services/companyService';

interface StatutoryInfoTabProps {
  company: Company | null;
  formData: unknown;
  onDataChange: (data: unknown) => void;
  isNewCompany: boolean;
}

const StatutoryInfoTab: React.FC<StatutoryInfoTabProps> = ({
  company: _company,
  formData: _formData,
  onDataChange: _onDataChange,
  isNewCompany: _isNewCompany
}) => {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>📋</div>
      <h3 style={{ color: '#495057', marginBottom: '10px' }}>Statutory Information</h3>
      <p style={{ color: '#6c757d', maxWidth: '500px', margin: '0 auto' }}>
        This tab will contain statutory information including:
      </p>
      <ul style={{
        color: '#6c757d',
        textAlign: 'left',
        maxWidth: '400px',
        margin: '20px auto',
        lineHeight: '1.6'
      }}>
        <li>PAN Number</li>
        <li>GST Registration</li>
        <li>TAN Number</li>
        <li>ESI Registration</li>
        <li>PF Registration</li>
        <li>Professional Tax Registration</li>
        <li>Labour License Details</li>
      </ul>
      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#fff3cd',
        borderRadius: '6px',
        color: '#856404',
        fontSize: '14px'
      }}>
        🚧 Coming Soon - Statutory information form will be implemented here
      </div>
    </div>
  );
};

export default StatutoryInfoTab;