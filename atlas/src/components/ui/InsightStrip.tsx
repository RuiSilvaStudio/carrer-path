import type { CSSProperties, ReactNode } from 'react';
import { FeedbackPrompt } from './FeedbackPrompt';

interface InsightStripProps {
  label?: string;
  children: ReactNode;
  style?: CSSProperties;
  /**
   * Optional stable id for this insight. When provided, a quiet
   * "Was this useful?" control appears under the content. Omit to
   * render the strip with no feedback prompt.
   */
  feedbackId?: string;
}

export function InsightStrip({ label = 'Insight', children, style, feedbackId }: InsightStripProps) {
  return (
    <div
      className="atlas-insight-strip"
      style={{
        background: 'var(--color-surface-elevated)',
        borderLeft: '3px solid var(--color-accent)',
        borderRadius: `0 var(--radius-button) var(--radius-button) 0`,
        padding: '14px 20px',
        ...style,
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--color-text-dim)',
          marginBottom: '6px',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '15px',
          fontWeight: 400,
          color: 'var(--color-text)',
          lineHeight: 1.5,
          letterSpacing: '-0.005em',
        }}
      >
        {children}
      </p>
      {feedbackId && (
        <div style={{ marginTop: '10px' }}>
          <FeedbackPrompt surface="insight" itemId={feedbackId} />
        </div>
      )}
    </div>
  );
}
