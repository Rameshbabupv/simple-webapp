import React from 'react';

interface BuildInfoProps {
  className?: string;
}

const BuildInfo: React.FC<BuildInfoProps> = ({ className = '' }) => {
  // Build information
  const buildInfo = {
    version: process.env.REACT_APP_VERSION || require('../../package.json').version,
    buildDate: process.env.REACT_APP_BUILD_DATE || new Date().toISOString(),
    buildNumber: process.env.REACT_APP_BUILD_NUMBER || Math.floor(Date.now() / 1000).toString(),
    gitCommit: process.env.REACT_APP_GIT_COMMIT || 'local-dev',
    gitBranch: process.env.REACT_APP_GIT_BRANCH || 'main',
    environment: process.env.NODE_ENV || 'development',
    realm: process.env.REACT_APP_KEYCLOAK_REALM || 'unknown',
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
    } catch {
      return dateString;
    }
  };

  const copyBuildInfo = () => {
    const info = `
Build Information:
- Version: ${buildInfo.version}
- Build: #${buildInfo.buildNumber}
- Date: ${formatDate(buildInfo.buildDate)}
- Commit: ${buildInfo.gitCommit}
- Branch: ${buildInfo.gitBranch}
- Environment: ${buildInfo.environment}
- Keycloak Realm: ${buildInfo.realm}
    `.trim();

    navigator.clipboard.writeText(info).then(() => {
      console.log('Build info copied to clipboard');
    });
  };

  return (
    <footer
      className={`build-info ${className}`}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #dee2e6',
        padding: '8px 16px',
        fontSize: '11px',
        color: '#6c757d',
        fontFamily: 'Monaco, Consolas, "Courier New", monospace',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}
      onClick={copyBuildInfo}
      title="Click to copy build information"
    >
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span>
          <strong>Systech Nexus</strong> v{buildInfo.version}
        </span>
        <span>
          Build #{buildInfo.buildNumber}
        </span>
        <span>
          {formatDate(buildInfo.buildDate)}
        </span>
        <span>
          {buildInfo.gitBranch}@{buildInfo.gitCommit.substring(0, 7)}
        </span>
        <span style={{
          backgroundColor: buildInfo.environment === 'production' ? '#28a745' : '#ffc107',
          color: buildInfo.environment === 'production' ? 'white' : '#212529',
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '10px',
          fontWeight: 'bold'
        }}>
          {buildInfo.environment.toUpperCase()}
        </span>
        <span>
          Realm: {buildInfo.realm}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', opacity: 0.7 }}>
          Click to copy
        </span>
        <div style={{
          width: '8px',
          height: '8px',
          backgroundColor: '#28a745',
          borderRadius: '50%',
          animation: 'pulse 2s infinite'
        }} title="Live - Auto-refreshing" />
      </div>

      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }

          .build-info:hover {
            background-color: #e9ecef !important;
            cursor: pointer;
          }

          .build-info * {
            user-select: none;
          }
        `}
      </style>
    </footer>
  );
};

export default BuildInfo;