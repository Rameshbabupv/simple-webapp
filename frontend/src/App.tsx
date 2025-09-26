import logo from './logo.svg';
import './App.css';
import BuildInfo from './components/BuildInfo';
import LoginButton from './components/LoginButton';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
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
            <h3 style={{ margin: '0 0 15px 0', color: '#fff' }}>Configuration</h3>
            <div style={{ textAlign: 'left', fontSize: '14px', color: '#ccc' }}>
              <div>🔗 Keycloak URL: {process.env.REACT_APP_KEYCLOAK_URL}</div>
              <div>🏢 Realm: {process.env.REACT_APP_KEYCLOAK_REALM}</div>
              <div>📱 Client: {process.env.REACT_APP_KEYCLOAK_CLIENT}</div>
              <div>🌍 Environment: {process.env.NODE_ENV}</div>
            </div>
          </div>
          <p style={{ fontSize: '14px', color: '#888', maxWidth: '500px' }}>
            Click the login button above to authenticate with Keycloak using your credentials.
            The build information below shows the current deployment details.
          </p>
        </header>

        <BuildInfo />
      </div>
    </AuthProvider>
  );
}

export default App;
