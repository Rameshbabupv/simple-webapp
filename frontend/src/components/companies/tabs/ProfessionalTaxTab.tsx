import React from 'react';
import { Company } from '../../../services/companyService';

interface ProfessionalTaxTabProps {
  company: Company | null;
  formData: unknown;
  onDataChange: (data: unknown) => void;
  isNewCompany: boolean;
}

const ProfessionalTaxTab: React.FC<ProfessionalTaxTabProps> = ({
  company: _company,
  formData: _formData,
  onDataChange: _onDataChange,
  isNewCompany: _isNewCompany
}) => {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏛️</div>
      <h3 style={{ color: '#495057', marginBottom: '10px' }}>Professional Tax Slab Updation</h3>
      <p style={{ color: '#6c757d', maxWidth: '500px', margin: '0 auto' }}>
        Configure professional tax slabs and rates for different states:
      </p>
      <ul style={{
        color: '#6c757d',
        textAlign: 'left',
        maxWidth: '400px',
        margin: '20px auto',
        lineHeight: '1.6'
      }}>
        <li>State-wise Tax Slabs</li>
        <li>Income Range Configuration</li>
        <li>Tax Rate Settings</li>
        <li>Monthly/Annual Tax Calculation</li>
        <li>Exemption Rules</li>
        <li>Compliance Updates</li>
      </ul>
      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#fff3cd',
        borderRadius: '6px',
        color: '#856404',
        fontSize: '14px'
      }}>
        🚧 Coming Soon - Professional tax slab configuration interface will be implemented here
      </div>
    </div>
  );
};

export default ProfessionalTaxTab;