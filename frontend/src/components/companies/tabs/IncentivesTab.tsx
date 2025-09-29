import React from 'react';
import { Company } from '../../../services/companyService';

interface IncentivesTabProps {
  company: Company | null;
  formData: unknown;
  onDataChange: (data: unknown) => void;
  isNewCompany: boolean;
}

const IncentivesTab: React.FC<IncentivesTabProps> = ({
  company: _company,
  formData: _formData,
  onDataChange: _onDataChange,
  isNewCompany: _isNewCompany
}) => {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>💰</div>
      <h3 style={{ color: '#495057', marginBottom: '10px' }}>Incentives & Benefits</h3>
      <p style={{ color: '#6c757d', maxWidth: '500px', margin: '0 auto' }}>
        Configure employee incentives and benefit programs:
      </p>
      <ul style={{
        color: '#6c757d',
        textAlign: 'left',
        maxWidth: '400px',
        margin: '20px auto',
        lineHeight: '1.6'
      }}>
        <li>Performance Bonuses</li>
        <li>Achievement Awards</li>
        <li>Commission Structures</li>
        <li>Employee Benefits</li>
        <li>Reward Programs</li>
        <li>Recognition Systems</li>
      </ul>
      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#fff3cd',
        borderRadius: '6px',
        color: '#856404',
        fontSize: '14px'
      }}>
        🚧 Coming Soon - Incentives configuration interface will be implemented here
      </div>
    </div>
  );
};

export default IncentivesTab;