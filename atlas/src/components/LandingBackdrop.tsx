import { useState } from 'react';
import { AuthModal, type AuthMode } from './AuthModal';

/**
 * Minimal dark backdrop for logged-out deep links (e.g. /career-direction):
 * the auth modal over a quiet branded layer instead of the full landing page.
 */
export function LandingBackdrop() {
  const [authOpen, setAuthOpen] = useState<AuthMode | null>('signin');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse 90% 90% at 50% 40%, #0d1a18 0%, #08110f 70%)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ padding: '26px 6vw', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" style={{ width: '26px', height: '26px' }}>
          <circle cx="20" cy="20" r="18.5" stroke="#d08a63" strokeWidth="1.3"/>
          <path d="M20 5 C25.5 12.5,25.5 27.5,20 35 C14.5 27.5,14.5 12.5,20 5Z" stroke="#d08a63" strokeWidth="1.1"/>
          <circle cx="20" cy="20" r="4" stroke="#e9e5df" strokeWidth="1.1"/>
          <circle cx="20" cy="20" r="1.2" fill="#d08a63"/>
        </svg>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '17px', color: '#eef0ec', letterSpacing: '-.01em' }}>
          The Atlas <span style={{ color: '#b6c6c3' }}>Path</span>
        </span>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(null)} />
    </div>
  );
}
