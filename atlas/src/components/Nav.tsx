import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useAssessments } from '../hooks/useAssessments';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sigil } from './sigil/Sigil';
import { sigilInputFromData, EMPTY_SIGIL_INPUT } from '../lib/sigil';
import type { AssessmentScores } from '../types';

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
  const { baseline, pulses } = useAssessments(user?.id ?? null);
  const navigate = useNavigate();
  const location = useLocation();
  const isRui = user?.id === RUI_USER_ID;
  const [menuOpen, setMenuOpen] = useState(false);
  const sigilInput = baseline
    ? sigilInputFromData(baseline.scores as AssessmentScores, pulses.length, pulses)
    : null;

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const links = isRui ? [...NAV_LINKS, { path: '/cockpit', label: 'Cockpit' }] : NAV_LINKS;

  const navButtonStyle = (active: boolean): React.CSSProperties => ({
    background: 'none', border: 'none', cursor: 'pointer',
    color: active ? 'var(--color-accent)' : 'var(--color-text-dim)',
    borderBottom: active ? '1px solid var(--color-accent)' : '1px solid transparent',
    padding: '6px 0', minHeight: '32px', fontFamily: 'var(--font-mono)',
    fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em',
    transition: 'color 0.2s ease',
  });

  return (
    <nav className="atlas-nav" style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)',
      fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase',
      letterSpacing: '0.12em',
    }}>
      {/* ── Bar row ── */}
      <div className="atlas-nav-bar" style={{
        display: 'flex', alignItems: 'center', gap: 'var(--nav-gap)',
        padding: '0 var(--nav-pad)', height: '44px',
      }}>
        {/* Desktop links (hidden on mobile via CSS) */}
        <div className="atlas-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 'var(--nav-gap)' }}>
          {links.map(link => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              style={navButtonStyle(location.pathname === link.path)}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Mobile: wordmark + hamburger */}
        <button
          className="atlas-nav-hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
          style={{
            display: 'none', background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-text)', fontSize: '18px', lineHeight: 1,
            padding: '8px', minHeight: '44px', minWidth: '44px',
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <div style={{ flex: 1 }} />

        {/* Desktop-only theme + sign out (hidden on mobile; they move into the menu) */}
        <div className="atlas-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--nav-gap)' }}>
          <button
            onClick={toggleTheme}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-dim)', fontFamily: 'var(--font-mono)',
              fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em',
              padding: '6px 0', minHeight: '32px',
            }}
          >
            {theme === 'dark' ? '☀ Light' : '☾ Dark'}
          </button>
          {user && (
            <>
              <button
                onClick={() => navigate('/profile')}
                title="Edit profile"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: location.pathname === '/profile' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em',
                  padding: '6px 0', minHeight: '32px',
                  maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                {sigilInput
                  ? <Sigil input={sigilInput} size={26} minimal animate={false} />
                  : <Sigil input={EMPTY_SIGIL_INPUT} size={26} empty animate={false} />}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.displayName || user.email}</span>
              </button>
              <button
                onClick={() => signOut()}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-dim)', fontFamily: 'var(--font-mono)',
                  fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em',
                }}
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Mobile dropdown menu ── */}
      {menuOpen && (
        <div className="atlas-nav-menu" style={{
          display: 'flex', flexDirection: 'column',
          borderTop: '1px solid var(--color-border)',
          padding: '8px var(--nav-pad)',
          background: 'var(--color-surface)',
        }}>
          {links.map(link => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              style={{
                ...navButtonStyle(location.pathname === link.path),
                textAlign: 'left', padding: '14px 0',
                borderBottom: '1px solid var(--color-border)',
                fontSize: '14px', minHeight: '44px',
              }}
            >
              {link.label}
            </button>
          ))}
          <div style={{ display: 'flex', gap: '16px', paddingTop: '8px' }}>
            <button
              onClick={toggleTheme}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-dim)', fontFamily: 'var(--font-mono)',
                fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.12em',
                padding: '12px 0', minHeight: '44px',
              }}
            >
              {theme === 'dark' ? '☀ Light' : '☾ Dark'}
            </button>
            {user && (
              <>
                <button
                  onClick={() => navigate('/profile')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)',
                    fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.12em',
                    padding: '12px 0', minHeight: '44px',
                    maxWidth: '50vw', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                >
                  {user.displayName || user.email}
                </button>
                <button
                  onClick={() => signOut()}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-text-dim)', fontFamily: 'var(--font-mono)',
                    fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.12em',
                    padding: '12px 0', minHeight: '44px',
                  }}
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
