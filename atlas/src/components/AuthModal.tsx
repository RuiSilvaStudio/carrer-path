import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export type AuthMode = 'signin' | 'signup';

interface Props {
  open: AuthMode | null;
  onClose: () => void;
}

/**
 * Sign-in / register as a modal over the landing page.
 * Same auth calls as the old AuthGate; styled on the ConfirmModal pattern.
 * Focus moves into the dialog on open and returns to the opener on close.
 */
export function AuthModal({ open, onClose }: Props) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      openerRef.current = document.activeElement as HTMLElement;
      setMode(open);
      setError('');
      setPassword('');
      const t = setTimeout(() => emailRef.current?.focus(), 60);
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
      document.addEventListener('keydown', onKey);
      return () => { clearTimeout(t); document.removeEventListener('keydown', onKey); };
    } else {
      openerRef.current?.focus?.();
      openerRef.current = null;
    }
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'signin') await signIn(email, password);
      else await signUp(email, password);
      // Success: the layout swaps to the app when the session arrives.
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setBusy(false);
    }
  };

  return (
    <div
      onClick={() => !busy && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(4,10,8,0.62)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '400px',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)', padding: '36px 32px',
          boxShadow: '0 30px 80px rgba(0,0,0,.5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
          <h2
            id="auth-modal-title"
            style={{
              fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-h2)', fontWeight: 500,
              color: 'var(--color-text)', letterSpacing: '-0.02em', margin: 0,
            }}
          >
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
              color: 'var(--color-text-dim)', fontSize: '20px', lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '28px', lineHeight: 1.5 }}>
          {mode === 'signin'
            ? 'Sign in to pick up where you left off.'
            : 'Free in full — no card, no trial clock, no paid tier.'}
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="auth-email" style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-dim)', marginBottom: '6px', letterSpacing: '.04em' }}>
            Email
          </label>
          <input
            id="auth-email"
            ref={emailRef}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              width: '100%', padding: '12px 14px', marginBottom: '16px',
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius-input)',
              color: 'var(--color-text)', fontSize: '15px',
              fontFamily: 'var(--font-sans)', outline: 'none', boxSizing: 'border-box',
            }}
          />
          <label htmlFor="auth-password" style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-dim)', marginBottom: '6px', letterSpacing: '.04em' }}>
            Password
          </label>
          <input
            id="auth-password"
            type="password"
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            style={{
              width: '100%', padding: '12px 14px', marginBottom: '20px',
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius-input)',
              color: 'var(--color-text)', fontSize: '15px',
              fontFamily: 'var(--font-sans)', outline: 'none', boxSizing: 'border-box',
            }}
          />
          {error && (
            <p role="alert" style={{ color: 'var(--color-danger)', fontSize: '13px', marginBottom: '16px', marginTop: 0 }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={busy}
            style={{
              width: '100%', padding: '13px',
              background: 'var(--color-accent)', color: 'var(--color-bg)',
              border: 'none', borderRadius: 'var(--radius-button)',
              fontSize: '15px', fontWeight: 600, cursor: busy ? 'wait' : 'pointer',
              fontFamily: 'var(--font-sans)', opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? 'One moment…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', marginBottom: 0, color: 'var(--color-text-dim)', fontSize: '13px' }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-accent)', fontSize: '13px', fontFamily: 'var(--font-sans)',
            }}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
