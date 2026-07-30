/**
 * CopyButton — a small icon button that copies its `text` prop to the
 * clipboard and shows "Copied" feedback for 1.2s. Modelled on the
 * pattern used by Stripe Docs, Linear, and GitHub README code blocks.
 */
import { useState, useEffect, useRef } from 'react';

interface CopyButtonProps {
  text: string;
  /** Accessible label override. */
  ariaLabel?: string;
  /** Visual variant. */
  variant?: 'inline' | 'block';
}

export function CopyButton({ text, ariaLabel = 'Copy to clipboard', variant = 'inline' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
  }, []);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // Fallback: select-and-execCommand for older browsers
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch {}
      document.body.removeChild(ta);
      setCopied(true);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setCopied(false), 1200);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={ariaLabel}
      title={copied ? 'Copied!' : ariaLabel}
      data-copied={copied ? 'true' : 'false'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: variant === 'block' ? '4px 8px' : '2px 6px',
        background: 'transparent',
        border: '1px solid var(--color-border)',
        borderRadius: '4px',
        color: copied ? 'var(--color-accent)' : 'var(--color-text-dim)',
        fontFamily: 'var(--font-mono)',
        fontSize: variant === 'block' ? '10px' : '9px',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'color 0.15s, border-color 0.15s',
        lineHeight: 1,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
    >
      {copied ? (
        <>
          <span aria-hidden="true">✓</span>
          <span>Copied</span>
        </>
      ) : (
        <>
          <span aria-hidden="true">⧉</span>
          <span>Copy</span>
        </>
      )}
    </button>
  );
}