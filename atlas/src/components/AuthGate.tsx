import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--color-text-muted)' }}>Loading…</div>;
  }

  if (user) {
    return <>{children}</>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg)', padding: '20px',
    }}>
      <div style={{
        width: '100%', maxWidth: '380px',
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)', padding: '40px 32px',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-h1)', fontWeight: 500,
          color: 'var(--color-text)', marginBottom: '8px', letterSpacing: '-0.02em',
        }}>
          Atlas Path
        </h1>
        <p style={{
          color: 'var(--color-text-muted)', fontSize: '14px',
          marginBottom: '32px', lineHeight: 1.5,
        }}>
          {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%', padding: '12px 14px',
                background: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-input)',
                color: 'var(--color-text)', fontSize: '15px',
                fontFamily: 'var(--font-sans)', outline: 'none',
              }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '12px 14px',
                background: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-input)',
                color: 'var(--color-text)', fontSize: '15px',
                fontFamily: 'var(--font-sans)', outline: 'none',
              }}
            />
          </div>
          {error && (
            <p style={{ color: 'var(--color-danger)', fontSize: '13px', marginBottom: '16px' }}>{error}</p>
          )}
          <button
            type="submit"
            style={{
              width: '100%', padding: '13px',
              background: 'var(--color-accent)', color: 'var(--color-bg)',
              border: 'none', borderRadius: 'var(--radius-button)',
              fontSize: '15px', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p style={{
          textAlign: 'center', marginTop: '20px',
          color: 'var(--color-text-dim)', fontSize: '13px',
        }}>
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
