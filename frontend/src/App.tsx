import logo from './logo.svg';
import './App.css';
import BuildInfo from './components/BuildInfo';
import LoginButton from './components/LoginButton';
import Dashboard from './components/dashboard/Dashboard';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="App">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          backgroundColor: '#282c34',
          color: 'white'
        }}>
          <img src={logo} className="App-logo" alt="logo" style={{ width: '80px', marginBottom: '20px' }} />
          <h2>Loading Systech Nexus Platform...</h2>
          <p>Initializing authentication...</p>
        </div>
        <BuildInfo />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        {/* Header */}
        <header style={{
          backgroundColor: '#343a40',
          color: 'white',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '3px solid #007bff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img src={logo} alt="logo" style={{ width: '40px', height: '40px' }} />
            <div>
              <h1 style={{ margin: 0, fontSize: '20px' }}>Systech Nexus Platform</h1>
              <p style={{ margin: 0, fontSize: '12px', color: '#adb5bd' }}>
                User Management & Authentication
              </p>
            </div>
          </div>

          {/* User Info & Logout */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {user.firstName} {user.lastName}
              </div>
              <div style={{ fontSize: '12px', color: '#adb5bd' }}>
                {user.email}
              </div>
              {user.groups && user.groups.length > 0 && (
                <div style={{ fontSize: '11px', marginTop: '2px' }}>
                  {user.groups.map(group => (
                    <span
                      key={group}
                      style={{
                        backgroundColor: group === 'platform-admins' ? '#dc3545' :
                                         group === 'app-admins' ? '#fd7e14' : '#28a745',
                        color: 'white',
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '8px',
                        marginRight: '4px'
                      }}
                    >
                      {group}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <LoginButton />
          </div>
        </header>

        {/* Main Dashboard */}
        <Dashboard />

        {/* Footer */}
        <BuildInfo />
      </div>
    );
  }

  // Login page
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1 style={{ color: '#61dafb', margin: '20px 0' }}>
          Systech Nexus Platform
        </h1>
        <p style={{ fontSize: '18px', margin: '10px 0' }}>
          Keycloak Authentication & User Management
        </p>

        <LoginButton />

        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '20px',
          borderRadius: '8px',
          margin: '20px 0',
          maxWidth: '600px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#fff' }}>System Features</h3>
          <div style={{ textAlign: 'left', fontSize: '14px', color: '#ccc' }}>
            <div>🔐 Keycloak Single Sign-On Integration</div>
            <div>👥 User Management (Create, View, Assign Groups)</div>
            <div>🏢 Role-Based Access Control</div>
            <div>⚙️ Group Management (platform-admins, app-admins, users)</div>
            <div>📱 Responsive Web Interface</div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'rgba(255,255,255,0.1)',
          padding: '15px',
          borderRadius: '8px',
          margin: '20px 0',
          maxWidth: '600px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>Configuration</h4>
          <div style={{ textAlign: 'left', fontSize: '12px', color: '#ccc' }}>
            <div>🔗 Keycloak URL: {process.env.REACT_APP_KEYCLOAK_URL}</div>
            <div>🏢 Realm: {process.env.REACT_APP_KEYCLOAK_REALM}</div>
            <div>📱 Client: {process.env.REACT_APP_KEYCLOAK_CLIENT}</div>
            <div>🌍 Environment: {process.env.NODE_ENV}</div>
          </div>
        </div>

        <p style={{ fontSize: '14px', color: '#888', maxWidth: '500px' }}>
          Click the login button above to authenticate with Keycloak and access the user management dashboard.
        </p>
      </header>

      <BuildInfo />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
