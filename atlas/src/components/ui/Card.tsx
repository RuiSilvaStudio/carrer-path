import type { CSSProperties, ReactNode } from 'react';
import { InfoTooltip } from './InfoTooltip';

interface CardProps {
  label?: string;
  title?: string;
  subtitle?: string;
  infoText?: string;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function Card({ label, title, subtitle, infoText, children, style, className }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '24px',
        ...style,
      }}
    >
      {(label || title) && (
        <div style={{ marginBottom: children ? '20px' : '0' }}>
          {label && (
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--color-text-dim)',
                marginBottom: title ? '6px' : '0',
              }}
            >
              {label}
            </p>
          )}
          {title && (
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '18px',
                fontWeight: 500,
                color: 'var(--color-text)',
                letterSpacing: '-0.01em',
                lineHeight: 1.3,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {title}
              {infoText && <InfoTooltip text={infoText} />}
            </p>
          )}
          {subtitle && (
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: 'var(--color-text-muted)',
                marginTop: '4px',
                lineHeight: 1.5,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
