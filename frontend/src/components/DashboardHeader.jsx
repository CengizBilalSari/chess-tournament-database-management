import { FiLogOut } from 'react-icons/fi';
import { useEffect, useState } from 'react';

export default function DashboardHeader({ title, onLogout, logOutColor = "#d32f2f" }) {
  const [isDarkMode, setIsDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setIsDarkMode(e.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Dynamic background and text colors based on mode
  const backgroundColor = isDarkMode ? '#202121' : '#f5f5f5';
  const textColor = isDarkMode ? '#ffffff' : '#333333';

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%',
      zIndex: 100,
      backgroundColor,
      borderBottom: `1px solid ${isDarkMode ? '#333' : '#ddd'}`,
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px'
      }}>
        <h2 style={{ margin: 0, color: textColor }}>{title}</h2>
        <button
          onClick={onLogout}
          title="Log Out"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 8, display: 'flex', alignItems: 'center'
          }}
        >
          <FiLogOut size={28} color={logOutColor} />
        </button>
      </div>
    </div>
  );
}