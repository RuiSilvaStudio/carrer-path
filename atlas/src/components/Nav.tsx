import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

// Rui's user ID — only he sees the Cockpit link
const RUI_USER_ID = '37d25257-5fcf-4318-b1b6-5bdb48288a71';

const NAV_LINKS = [
  { path: '/', label: 'Dashboard' },
  { path: '/baseline', label: 'Baseline' },
  { path: '/pulse', label: 'Pulse' },
  { path: '/docs', label: 'Docs' },
];

export function Nav() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isRui = user?.id === RUI_USER_ID;

  const navButtonStyle = (active: boolean): React.CSSProperties => ({
    background: 'none', border: 'none', cursor: 'pointer',
    color: active ? 'var(--color-accent)' : 'var(--color-text-dim)',
    borderBottom: active ? '1px solid var(--color-accent)' : '1px solid transparent',
    paddingBottom: '2px', fontFamily: 'var(--font-mono)',
    fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em',
    transition: 'color 0.2s ease',
  });

  return (
    <nav className="atlas-nav" style={{
      display: 'flex', alignItems: 'center', gap: 'var(--nav-gap)',
      padding: '0 var(--nav-pad)', height: '44px',
      background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)',
      fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase',
      letterSpacing: '0.12em', position: 'sticky', top: 0, zIndex: 100,
    }}>
      {NAV_LINKS.map(link => (
        <button
          key={link.path}
          onClick={() => navigate(link.path)}
          style={navButtonStyle(location.pathname === link.path)}
        >
          {link.label}
        </button>
      ))}

      {/* Cockpit — only visible to Rui */}
      {isRui && (
        <button
          onClick={() => navigate('/cockpit')}
          style={navButtonStyle(location.pathname === '/cockpit')}
        >
          Cockpit
        </button>
      )}

      <div style={{ flex: 1 }} />

      <button
        onClick={toggleTheme}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--color-text-dim)', fontFamily: 'var(--font-mono)',
          fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em',
        }}
      >
        {theme === 'dark' ? '☀ Light' : '☾ Dark'}
      </button>

      {user && (
        <button
          onClick={() => signOut()}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-text-dim)', fontFamily: 'var(--font-mono)',
            fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em',
          }}
        >
          Sign Out
        </button>
      )}
    </nav>
  );
}
