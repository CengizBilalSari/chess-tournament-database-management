import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const roles = ['DB_MANAGER', 'COACH', 'ARBITER', 'PLAYER'];
const tabs = [
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' },
];

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('user');
  const navigate = useNavigate();

  // Login handler for both User and Admin
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = activeTab === 'admin' ? '/api/auth/adminLogin' : '/api/auth/login';
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || 'Invalid credentials');
        return;
      }
      const data = await response.json();
      // Expecting { username, name, surname, role }
      if (!data.role) {
        setError('No role returned from server');
        return;
      }
      localStorage.setItem('username', data.username);
      let role = data.role.toLowerCase();
      if (role === "admin") role = "db_manager";
      navigate(`/${role}-dashboard`);
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 32 }}>
      <h2>Login</h2>
      <div style={{ 
        display: 'flex', 
        marginBottom: 24, 
        borderRadius: 12, 
        overflow: 'hidden', 
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e0e0e0',
        position: 'relative',
        padding: 4
      }}>
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => { setActiveTab(tab.value); setError(''); }}
            style={{
              flex: 1,
              padding: '12px 0',
              background: 'transparent',
              color: activeTab === tab.value ? '#2563eb' : '#64748b',
              border: 'none',
              fontWeight: activeTab === tab.value ? 'bold' : 'normal',
              fontSize: 16,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {tab.label}
          </button>
        ))}
        <div 
          style={{
            position: 'absolute',
            left: activeTab === 'user' ? '1%' : '50%',
            top: 4,
            bottom: 4,
            width: '49%',
            background: '#dbeafe',
            borderRadius: 8,
            transition: 'left 0.3s ease',
            zIndex: 1
          }}
        />
      </div>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: 16 }}>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ 
              width: '300px', 
              padding: 8, 
              marginTop: 4, 
              marginLeft: 'auto', 
              marginRight: 'auto', 
              display: 'block' 
            }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ 
              width: '300px', 
              padding: 8, 
              marginTop: 4, 
              marginLeft: 'auto', 
              marginRight: 'auto', 
              display: 'block' 
            }}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
        <button 
          type="submit" 
          style={{ 
            width: '100%', 
            padding: '12px 24px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#1d4ed8';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#2563eb';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(37, 99, 235, 0.3)';
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
} 