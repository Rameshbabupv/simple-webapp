import React from 'react';
import { Company } from '../../../services/companyService';

interface AttendanceTabProps {
  company: Company | null;
  formData: unknown;
  onDataChange: (data: unknown) => void;
  isNewCompany: boolean;
}

const AttendanceTab: React.FC<AttendanceTabProps> = ({
  company: _company,
  formData: _formData,
  onDataChange: _onDataChange,
  isNewCompany: _isNewCompany
}) => {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>🕐</div>
      <h3 style={{ color: '#495057', marginBottom: '10px' }}>Attendance Configuration</h3>
      <p style={{ color: '#6c757d', maxWidth: '500px', margin: '0 auto' }}>
        Configure attendance policies and settings:
      </p>
      <ul style={{
        color: '#6c757d',
        textAlign: 'left',
        maxWidth: '400px',
        margin: '20px auto',
        lineHeight: '1.6'
      }}>
        <li>Working Hours</li>
        <li>Shift Patterns</li>
        <li>Break Policies</li>
        <li>Overtime Rules</li>
        <li>Holiday Calendar</li>
        <li>Late Coming Rules</li>
      </ul>
      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#fff3cd',
        borderRadius: '6px',
        color: '#856404',
        fontSize: '14px'
      }}>
        🚧 Coming Soon - Attendance configuration interface will be implemented here
      </div>
    </div>
  );
};

export default AttendanceTab;