import { useState, useEffect } from 'react';

/**
 * LLM loading indicator — spinner + live elapsed timer + message.
 * Shows real elapsed time so users know the request is working, not frozen.
 * Used by the self-hosted LLM calls which take 10-30+ seconds.
 */

interface Props {
  /** Loading message, e.g. "Finding directions that match your profile…" */
  message: string;
  /** Whether the request is in progress */
  loading: boolean;
}

export function LLMLoader({ message, loading }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!loading) {
      setElapsed(0);
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [loading]);

  if (!loading) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '20px 0',
    }}>
      {/* Spinner */}
      <div style={{
        width: '20px',
        height: '20px',
        flexShrink: 0,
        borderRadius: '50%',
        border: '2px solid var(--color-border)',
        borderTopColor: 'var(--color-accent)',
        animation: 'atlas-spin 0.8s linear infinite',
      }} />

      {/* Message + timer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <p style={{
          ...{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'var(--color-text-muted)', margin: 0 },
        }}>
          {message}
        </p>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--color-text-dim)',
          margin: 0,
          letterSpacing: '0.04em',
        }}>
          {elapsed}s
        </p>
      </div>

      {/* Keyframe — injected once per component instance */}
      <style>{`
        @keyframes atlas-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}