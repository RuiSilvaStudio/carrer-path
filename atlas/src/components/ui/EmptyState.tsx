import type { ReactNode } from 'react';

/**
 * Atlas empty states — four explicit modes per Carbon Design System's
 * empty-states pattern. The 4 modes are visually distinct so a user
 * seeing "No data" can tell whether they haven't done X yet
 * (first-time), are filtered to zero matches (no-results), the
 * import failed (error), or the feature exists but they have no
 * data (no-data).
 *
 * Reference: https://carbondesignsystem.com/patterns/empty-states-pattern/
 * Audit report: /tmp/atlas-ux-audit-report.html (Phase 1.B)
 */

type Mode = 'first-time' | 'no-data' | 'no-results' | 'error';

interface EmptyStateProps {
  /** Short headline — must answer "what's happening" in ≤10 words. */
  title: string;
  /** Optional body — 1-2 sentences explaining why + what to do. */
  body?: string;
  /** Single primary CTA label. */
  cta?: string;
  /** Primary CTA action. */
  onCta?: () => void;
  /** Secondary CTA (e.g. "Learn more"). */
  secondaryCta?: string;
  onSecondaryCta?: () => void;
  /** Force a specific mode (otherwise inferred from props). */
  mode?: Mode;
  /** Optional icon/illustration slot. */
  children?: ReactNode;
}

// Mode-specific accent colors so users can distinguish them at a glance.
const MODE_ACCENT: Record<Mode, string> = {
  'first-time': 'var(--color-accent)',       // warm gold — "we're getting started"
  'no-data': 'var(--color-text-dim)',       // muted — "data exists, you have none"
  'no-results': 'var(--color-text-dim)',    // muted — "filter excluded everything"
  'error': 'var(--color-danger)',           // warm red — "something failed"
};

const MODE_BADGE: Record<Mode, string> = {
  'first-time': 'GETTING STARTED',
  'no-data': 'NO DATA YET',
  'no-results': 'NO MATCHES',
  'error': 'ERROR',
};

function inferMode(props: Pick<EmptyStateProps, 'title' | 'body' | 'cta' | 'mode'>): Mode {
  if (props.mode) return props.mode;
  const t = (props.title || '').toLowerCase();
  if (t.includes('error') || t.includes('failed') || t.includes('could not')) return 'error';
  if (t.includes('no matches') || t.includes('no results')) return 'no-results';
  if (t.includes('start') || t.includes('begin') || t.includes('first')) return 'first-time';
  return 'no-data';
}

export function EmptyState(props: EmptyStateProps) {
  const {
    title,
    body,
    cta,
    onCta,
    secondaryCta,
    onSecondaryCta,
    children,
  } = props;
  const mode = inferMode(props);
  const accent = MODE_ACCENT[mode];
  const badge = MODE_BADGE[mode];

  return (
    <div
      role={mode === 'error' ? 'alert' : 'status'}
      aria-live={mode === 'error' ? 'assertive' : 'polite'}
      style={{
        maxWidth: '560px',
        margin: '0 auto',
        padding: '48px 32px',
        textAlign: 'center',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderTop: `3px solid ${accent}`,
        borderRadius: '12px',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
          color: accent,
          marginBottom: '16px',
        }}
      >
        {badge}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '24px',
          fontWeight: 500,
          color: 'var(--color-text)',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
          marginBottom: '12px',
        }}
      >
        {title}
      </p>
      {body && (
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            lineHeight: 1.6,
            color: 'var(--color-text-muted)',
            marginBottom: cta ? '28px' : '0',
          }}
        >
          {body}
        </p>
      )}
      {children}
      {(cta || secondaryCta) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
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
          {secondaryCta && onSecondaryCta && (
            <button
              onClick={onSecondaryCta}
              style={{
                padding: '13px 24px',
                background: 'none',
                color: 'var(--color-text-muted)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {secondaryCta}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Convenience wrappers — preferred over the bare <EmptyState> ──────
// These force the correct mode and add a tiny string-typed contract.

export function FirstTimeState(props: Omit<EmptyStateProps, 'mode'>) {
  return <EmptyState {...props} mode="first-time" />;
}

export function NoDataState(props: Omit<EmptyStateProps, 'mode'>) {
  return <EmptyState {...props} mode="no-data" />;
}

export function NoResultsState(props: Omit<EmptyStateProps, 'mode'>) {
  return <EmptyState {...props} mode="no-results" />;
}

export function ErrorState(props: Omit<EmptyStateProps, 'mode'>) {
  return <EmptyState {...props} mode="error" />;
}