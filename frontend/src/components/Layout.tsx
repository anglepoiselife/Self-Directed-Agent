import React from 'react';
import { useAuth } from '../context/AuthContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout } = useAuth();

  const handleLogout = (e: React.MouseEvent) => {
    logout();
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>
      <header
        style={{
          height: '48px',
          background: '#1a1a2e',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          flexShrink: 0,
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '16px', letterSpacing: '0.5px' }}>
          Sheets
        </span>
        <a
          href="/login"
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#fff',
            padding: '6px 14px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
            textDecoration: 'none',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          Logout
        </a>
      </header>
      <main style={{ flex: 1, overflow: 'auto', background: '#f5f5f5' }}>
        {children}
      </main>
    </div>
  );
};