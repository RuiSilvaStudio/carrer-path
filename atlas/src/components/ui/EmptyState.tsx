import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  body?: string;
  cta?: string;
  onCta?: () => void;
  children?: ReactNode;
}

// Warm editorial empty state. Every no-data / dead-end surface should funnel
// the user toward a concrete next action instead of a bare message or null.
export function EmptyState({ title, body, cta, onCta, children }: EmptyStateProps) {
  return (
    <div style={{
      maxWidth: '560px',
      margin: '0 auto',
      padding: '48px 32px',
      textAlign: 'center',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
    }}>
      <p style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '24px',
        fontWeight: 500,
        color: 'var(--color-text)',
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
        marginBottom: '12px',
      }}>
        {title}
      </p>
      {body && (
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '15px',
          lineHeight: 1.6,
          color: 'var(--color-text-muted)',
          marginBottom: cta ? '28px' : '0',
        }}>
          {body}
        </p>
      )}
      {children}
      {cta && onCta && (
        <button
          onClick={onCta}
          style={{
            padding: '13px 28px',
            background: 'var(--color-accent)',
            color: 'var(--color-bg)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            transition: 'opacity 0.2s ease',
          }}
        >
          {cta}
        </button>
      )}
    </div>
  );
}
