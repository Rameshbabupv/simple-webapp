import React from 'react';
import { Company } from '../../../services/companyService';

interface BankTabProps {
  company: Company | null;
  formData: unknown;
  onDataChange: (data: unknown) => void;
  isNewCompany: boolean;
}

const BankTab: React.FC<BankTabProps> = ({
  company: _company,
  formData: _formData,
  onDataChange: _onDataChange,
  isNewCompany: _isNewCompany
}) => {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏦</div>
      <h3 style={{ color: '#495057', marginBottom: '10px' }}>Bank Information</h3>
      <p style={{ color: '#6c757d', maxWidth: '500px', margin: '0 auto' }}>
        Manage company banking details and accounts:
      </p>
      <ul style={{
        color: '#6c757d',
        textAlign: 'left',
        maxWidth: '400px',
        margin: '20px auto',
        lineHeight: '1.6'
      }}>
        <li>Primary Bank Account</li>
        <li>Secondary Accounts</li>
        <li>Salary Account Details</li>
        <li>IFSC Codes</li>
        <li>Bank Branch Information</li>
        <li>Account Numbers</li>
      </ul>
      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#fff3cd',
        borderRadius: '6px',
        color: '#856404',
        fontSize: '14px'
      }}>
        🚧 Coming Soon - Bank information management interface will be implemented here
      </div>
    </div>
  );
};

export default BankTab;