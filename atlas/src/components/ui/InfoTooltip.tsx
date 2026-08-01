import { useState, useRef, useEffect, useId } from 'react';
import { lookupGlossary } from '../../data/glossary';

interface InfoTooltipProps {
  /** Direct tooltip body. Used for one-off copy. ≤150 chars per NN/g. */
  text?: string;
  /** Glossary term id (e.g. 'trait-openness', 'facet-n-anxiety'). Looked up at render. */
  term?: string;
  /** Accessible label override; defaults to "More info". */
  ariaLabel?: string;
}

/**
 * The canonical Atlas tooltip. Two modes:
 *   - `text="…"` — direct one-off copy (legacy, still works for ad-hoc strings).
 *   - term="…"   — looked up in the glossary data file. Preferred.
 *
 * Accessibility:
 *   - Hover + focus both open. Mouse-out + blur both close.
 *   - Esc closes when open (WCAG 1.4.13 dismissible).
 *   - aria-describedby ties the trigger to the popup.
 *   - Hit area ≥32px via backgroundClip trick (matches Fitts's Law minimum).
 */
export function InfoTooltip({ text, term, ariaLabel = 'More info' }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const popupId = useId();

  const body = term ? lookupGlossary(term)?.short ?? text : text;

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        // Restore focus to the trigger so keyboard users don't get stranded.
        const trigger = ref.current?.querySelector<HTMLButtonElement>('button[data-atlas-tooltip-trigger]');
        trigger?.focus();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  if (!body) return null;

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-flex', marginLeft: '6px' }}>
      <button
        data-atlas-tooltip-trigger
        onClick={() => setOpen(o => !o)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label={ariaLabel}
        aria-describedby={open ? popupId : undefined}
        aria-expanded={open}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '18px',
          height: '18px',
          /* Enlarge hit area to ≥32px without changing the 18px visual. */
          padding: '7px',
          margin: '-7px',
          backgroundClip: 'content-box',
          borderRadius: '50%',
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          color: 'var(--color-text-dim)',
          fontSize: '11px',
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
          lineHeight: 1,
          transition: 'border-color 0.2s, color 0.2s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-accent)';
          e.currentTarget.style.color = 'var(--color-accent)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)';
          e.currentTarget.style.color = 'var(--color-text-dim)';
        }}
        onFocusCapture={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-accent)';
          e.currentTarget.style.color = 'var(--color-accent)';
        }}
        onBlurCapture={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)';
          e.currentTarget.style.color = 'var(--color-text-dim)';
        }}
      >
        ⓘ
      </button>
      {open && (
        <span
          id={popupId}
          role="tooltip"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--color-tooltip-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-button)',
            padding: '10px 14px',
            maxWidth: '280px',
            minWidth: '180px',
            fontFamily: 'var(--font-sans)',
            fontSize: '12px',
            lineHeight: 1.5,
            color: 'var(--color-text-muted)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            zIndex: 100,
            whiteSpace: 'normal',
            textAlign: 'left',
          }}
        >
          {body}
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid var(--color-border)',
            }}
          />
        </span>
      )}
    </span>
  );
}