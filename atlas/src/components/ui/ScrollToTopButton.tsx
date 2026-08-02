/**
 * ScrollToTopButton — floating bottom-right "back to top" arrow.
 * Visible only on mobile (<1024px) via CSS; hidden when near the top.
 * Monochrome inline SVG per Atlas icon conventions.
 */
import { useState, useEffect } from 'react';

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Scroll back to top"
      data-scroll-top
      className="atlas-scroll-top"
      style={{
        position: 'fixed',
        right: '20px',
        bottom: '20px',
        zIndex: 50,
        display: visible ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
        width: '44px',
        height: '44px',
        padding: 0,
        cursor: 'pointer',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-pill)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        color: 'var(--color-text-dim)',
        transition: 'color 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--color-accent)';
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.14)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--color-text-dim)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}