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
      <div style={{ padding: '26px 6vw', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '17px', color: '#eef0ec', letterSpacing: '-.01em' }}>
          The Atlas <span style={{ color: '#b6c6c3' }}>Path</span>
        </span>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(null)} />
    </div>
  );
}
