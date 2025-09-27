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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative background elements */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            filter: 'blur(40px)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-30%',
            left: '-10%',
            width: '150px',
            height: '150px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '50%',
            filter: 'blur(30px)'
          }} />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            zIndex: 1
          }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '52px',
              height: '52px',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
            }}>
              <img
                src={logo}
                alt="logo"
                style={{
                  width: '32px',
                  height: '32px',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
                }}
              />
            </div>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '700',
                background: 'linear-gradient(45deg, #ffffff, #e8f4f8)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                letterSpacing: '-0.5px'
              }}>
                Systech Nexus Platform
              </h1>
              <p style={{
                margin: 0,
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: '500',
                letterSpacing: '0.3px'
              }}>
                🔐 User Management & Authentication
              </p>
            </div>
          </div>

          {/* User Info & Logout */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 1
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              {/* User Avatar */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #4facfe, #00f2fe)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '700',
                color: 'white',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}>
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </div>

              {/* Compact User Info */}
              <div style={{ minWidth: '0' }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '120px'
                }}>
                  {user.firstName} {user.lastName}
                </div>
                {user.groups && user.groups.length > 0 && (
                  <div style={{
                    fontSize: '10px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    whiteSpace: 'nowrap'
                  }}>
                    {user.groups[0] === 'platform-admins' ? '👑 Admin' :
                     user.groups[0] === 'app-admins' ? '⚡ Admin' : '👤 User'}
                  </div>
                )}
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '4px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
            }}>
              <LoginButton />
            </div>
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
