import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useAssessments } from '../hooks/useAssessments';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sigil } from './sigil/Sigil';
import { sigilInputFromData, EMPTY_SIGIL_INPUT } from '../lib/sigil';
import type { AssessmentScores } from '../types';
import { HelpMenu } from './ui/HelpMenu';

// ── Theme pill switch — explicit, icon-only, no text ─────────────
// Sun (light) on one side, moon (dark) on the other; a knob slides to
// the active mode. Distinct enough to read as a toggle at a glance,
// quiet enough to not compete with the profile sigil.
function ThemeToggle({ theme, onToggle }: { theme: string; onToggle: () => void }) {
  const isDark = theme === 'dark';
  const icon = (color: string) => ({ fill: 'none', stroke: color, strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const });
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      style={{
        position: 'relative', display: 'flex', alignItems: 'center',
        width: '38px', height: '20px', padding: 0, cursor: 'pointer',
        background: 'none',
        border: '1px solid var(--color-border)',
        borderRadius: '999px', flexShrink: 0,
        transition: 'border-color 0.2s ease',
      }}
    >
      {/* track icons */}
      <span style={{ position: 'absolute', left: '4px', display: 'flex', opacity: isDark ? 0.4 : 0.9 }}>
        <svg width="9" height="9" viewBox="0 0 24 24" {...icon('var(--color-text-dim)')}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      </span>
      <span style={{ position: 'absolute', right: '4px', display: 'flex', opacity: isDark ? 0.9 : 0.4 }}>
        <svg width="9" height="9" viewBox="0 0 24 24" {...icon('var(--color-text-dim)')}>
          <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
        </svg>
      </span>
      {/* knob */}
      <span style={{
        position: 'absolute', top: '2px',
        left: isDark ? '20px' : '2px',
        width: '14px', height: '14px', borderRadius: '50%',
        background: 'var(--color-accent)',
        transition: 'left 0.2s ease',
      }} />
    </button>
  );
}

// Rui's user ID — only he sees the Cockpit link
// Read from env so it works across cloud and self-hosted Supabase (different user IDs)
const RUI_USER_ID = import.meta.env.VITE_RUI_USER_ID ?? '37d25257-5fcf-4318-b1b6-5bdb48288a71';

const NAV_LINKS = [
  { path: '/', label: 'Dashboard' },
  { path: '/baseline', label: 'Baseline' },
  { path: '/pulse', label: 'Pulse' },
  { path: '/career-direction', label: 'Career' },
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

  // Global `?` keyboard listener — opens the help menu (NN/g convention).
  // Skip when user is typing in an input/textarea/contenteditable.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '?') return;
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return;
      }
      const helpBtn = document.querySelector<HTMLButtonElement>('[aria-label="Open help menu"]');
      helpBtn?.click();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

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
        <div className="atlas-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <HelpMenu />
          {user && (
            <>
              {/* Identity first — sigil + name read as one unit */}
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
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}
              >
                {sigilInput
                  ? <Sigil input={sigilInput} size={30} minimal animate={false} />
                  : <Sigil input={EMPTY_SIGIL_INPUT} size={30} empty animate={false} />}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.displayName || user.email}</span>
              </button>
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
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
          {!user && <ThemeToggle theme={theme} onToggle={toggleTheme} />}
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
          <div style={{ display: 'flex', gap: '16px', paddingTop: '8px', alignItems: 'center' }}>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
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
