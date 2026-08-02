import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

const links = [
  { path: '/career-direction', label: 'Career Direction' },
  { path: '/', label: 'Atlas Path' },
];

export function CareerNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const buttonStyle = (active = false): React.CSSProperties => ({
    background: 'none', border: 0, cursor: 'pointer', padding: '7px 0', minHeight: '32px',
    color: active ? 'var(--color-accent)' : 'var(--color-text-dim)',
    borderBottom: active ? '1px solid var(--color-accent)' : '1px solid transparent',
    fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase',
  });

  const go = (path: string) => { navigate(path); setOpen(false); };

  return <nav className="atlas-nav" style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
    <div className="atlas-nav-bar" style={{ height: '44px', display: 'flex', alignItems: 'center', gap: 'var(--nav-gap)', padding: '0 var(--nav-pad)' }}>
      <div className="atlas-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 'var(--nav-gap)' }}>
        {links.map((link) => <button key={link.path} onClick={() => go(link.path)} style={buttonStyle(location.pathname === link.path)}>{link.label}</button>)}
      </div>
      <button className="atlas-nav-hamburger" onClick={() => setOpen((value) => !value)} aria-label="Toggle career menu" aria-expanded={open} style={{ display: 'none', background: 'none', border: 0, color: 'var(--color-text)', fontSize: '18px', padding: '8px' }}>{open ? '✕' : '☰'}</button>
      <div style={{ flex: 1 }} />
      <div className="atlas-nav-actions" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <button onClick={toggleTheme} style={buttonStyle()}>{theme === 'dark' ? 'Light' : 'Dark'}</button>
        {user && <><span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', fontSize: '11px', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.displayName || user.email}</span><button onClick={() => signOut()} style={buttonStyle()}>Sign out</button></>}
      </div>
    </div>
    {open && <div className="atlas-nav-menu" style={{ padding: '8px var(--nav-pad)', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
      {links.map((link) => <button key={link.path} onClick={() => go(link.path)} style={{ ...buttonStyle(location.pathname === link.path), display: 'block', width: '100%', padding: '13px 0', textAlign: 'left' }}>{link.label}</button>)}
      <button onClick={toggleTheme} style={{ ...buttonStyle(), marginRight: '18px' }}>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</button>
      {user && <button onClick={() => signOut()} style={buttonStyle()}>Sign out</button>}
    </div>}
  </nav>;
}
