import React from 'react';
import { Company } from '../../../services/companyService';

interface HRYearTabProps {
  company: Company | null;
  formData: unknown;
  onDataChange: (data: unknown) => void;
  isNewCompany: boolean;
}

const HRYearTab: React.FC<HRYearTabProps> = ({
  company: _company,
  formData: _formData,
  onDataChange: _onDataChange,
  isNewCompany: _isNewCompany
}) => {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>📅</div>
      <h3 style={{ color: '#495057', marginBottom: '10px' }}>HR Year Configuration</h3>
      <p style={{ color: '#6c757d', maxWidth: '500px', margin: '0 auto' }}>
        Configure HR and financial year settings:
      </p>
      <ul style={{
        color: '#6c757d',
        textAlign: 'left',
        maxWidth: '400px',
        margin: '20px auto',
        lineHeight: '1.6'
      }}>
        <li>Financial Year Start/End</li>
        <li>HR Year Configuration</li>
        <li>Payroll Periods</li>
        <li>Leave Year Configuration</li>
        <li>Appraisal Cycles</li>
        <li>Budget Periods</li>
      </ul>
      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#fff3cd',
        borderRadius: '6px',
        color: '#856404',
        fontSize: '14px'
      }}>
        🚧 Coming Soon - HR Year configuration interface will be implemented here
      </div>
    </div>
  );
};

export default HRYearTab;