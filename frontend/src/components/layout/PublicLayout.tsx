import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password' || location.pathname === '/reset-password';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100vw', background: 'var(--bg-primary)' }}>
      {/* Public Top Nav */}
      <header
        style={{
          height: '80px',
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: 'rgba(8, 3, 21, 0.5)',
          backdropFilter: 'blur(8px)',
          position: 'sticky',
          top: 0,
          zIndex: 90
        }}
      >
        <div 
          onClick={() => navigate('/')} 
          style={{ 
            fontSize: '20px', 
            fontWeight: 700, 
            background: 'var(--accent)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            cursor: 'pointer'
          }}
        >
          Mentor.AI
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {isAuthPage ? (
            <Button variant="ghost" onClick={() => navigate('/')}>Home</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>Sign In</Button>
              <Button onClick={() => navigate('/register')}>Get Started</Button>
            </>
          )}
        </div>
      </header>

      {/* Main Body */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: '40px 24px',
          borderTop: '1px solid var(--border-glass)',
          background: 'var(--bg-secondary)',
          textAlign: 'center'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Mentor.AI — Empowering students from school to employment.
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} Mentor.AI. All rights reserved. All recommendations are AI assistance models.
          </p>
        </div>
      </footer>
    </div>
  );
};
