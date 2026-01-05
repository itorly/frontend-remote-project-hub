import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/auth-context';

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { displayName, email, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <header
        style={{
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px rgba(15,23,42,0.05)'
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700 }}>
            <span style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white',
              fontWeight: 800
            }}>RPH</span>
            Remote Project Hub
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="button secondary" onClick={() => navigate('/')}>Organizations</button>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600 }}>{displayName || 'Authenticated User'}</div>
              <div className="text-muted" style={{ fontSize: '0.9rem' }}>{email}</div>
            </div>
            <button className="button" onClick={logout}>Log out</button>
          </div>
        </div>
      </header>
      <main className="container" style={{ paddingTop: '1rem' }}>
        {children}
      </main>
    </div>
  );
};
