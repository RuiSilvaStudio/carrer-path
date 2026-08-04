import type { ReactNode } from 'react';

/**
 * Spinner — a small rotating circle used in loading states.
 * Reuses the atlas-spin keyframe already defined in LLMLoader.
 * Pass an optional message to show next to the spinner.
 */
interface SpinnerProps {
  message?: string;
  children?: ReactNode;
}

export function Spinner({ message, children }: SpinnerProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '40px',
    }}>
      <div style={{
        width: '20px',
        height: '20px',
        flexShrink: 0,
        borderRadius: '50%',
        border: '2px solid var(--color-border)',
        borderTopColor: 'var(--color-accent)',
        animation: 'atlas-spin 0.8s linear infinite',
      }} />
      {message && (
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          color: 'var(--color-text-muted)',
          margin: 0,
        }}>
          {message}
        </p>
      )}
      {children}
      {/* Keyframe — co-located so it works without a CSS import */}
      <style>{`@keyframes atlas-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
