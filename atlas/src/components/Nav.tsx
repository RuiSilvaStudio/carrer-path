import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';

interface NavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

// Rui's user ID — only he sees the Cockpit link
const RUI_USER_ID = '37d25257-5fcf-4318-b1b6-5bdb48288a71';

const NAV_LINKS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'baseline', label: 'Baseline' },
  { id: 'pulse', label: 'Pulse' },
  { id: 'docs', label: 'Docs' },
];

export function Nav({ currentPage, onNavigate }: NavProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const isRui = user?.id === RUI_USER_ID;

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', gap: '24px',
      padding: '0 40px', height: '44px',
      background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)',
      fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase',
      letterSpacing: '0.12em', position: 'sticky', top: 0, zIndex: 100,
    }}>
      {NAV_LINKS.map(link => (
        <button
          key={link.id}
          onClick={() => onNavigate(link.id)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: currentPage === link.id ? 'var(--color-accent)' : 'var(--color-text-dim)',
            borderBottom: currentPage === link.id ? '1px solid var(--color-accent)' : '1px solid transparent',
            paddingBottom: '2px', fontFamily: 'var(--font-mono)',
            fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em',
            transition: 'color 0.2s ease',
          }}
        >
          {link.label}
        </button>
      ))}

      {/* Cockpit — only visible to Rui */}
      {isRui && (
        <a
          href="/cockpit.html"
          style={{
            color: currentPage === 'cockpit' ? 'var(--color-accent)' : 'var(--color-text-dim)',
            borderBottom: currentPage === 'cockpit' ? '1px solid var(--color-accent)' : '1px solid transparent',
            paddingBottom: '2px', fontFamily: 'var(--font-mono)',
            fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em',
            textDecoration: 'none', transition: 'color 0.2s ease',
          }}
        >
          Cockpit
        </a>
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
