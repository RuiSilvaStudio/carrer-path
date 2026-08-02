/**
 * ChapterRail — sticky right-edge vertical navigation rail for /docs.
 * Modelled on the chapter-rail pattern (community-org "About" pages, FT
 * long-reads, Stripe docs). One dot per section; active dot is filled
 * in the accent colour; click smooth-scrolls. A Home icon at the top
 * scrolls back to the top of the page.
 *
 * Hidden on viewports <1024px — the mobile ScrollToTopButton covers that case.
 */
import { useState, useEffect, useRef } from 'react';

export interface RailSection {
  id: string;
  num: string;
  title: string;
}

interface ChapterRailProps {
  sections: RailSection[];
}

export function ChapterRail({ sections }: ChapterRailProps) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? '');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current?.disconnect();
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the top of the viewport that is intersecting
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    observerRef.current = observer;
    return () => observer.disconnect();
  }, [sections]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', `#${id}`);
      setActive(id);
    }
  };

  const handleHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.replaceState(null, '', '#overview');
  };

  return (
    <nav
      aria-label="Documentation chapter navigation"
      data-chapter-rail
      className="atlas-chapter-rail"
      style={{
        position: 'fixed',
        right: '24px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 50,
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '10px',
        padding: '14px 8px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-pill)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.14)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
      }}
    >
      {/* Home — scrolls to top of the page, in its own bubble */}
      <a
        href="#overview"
        onClick={handleHome}
        aria-label="Back to top"
        title="Back to top"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px',
          borderRadius: '50%',
          cursor: 'pointer',
          textDecoration: 'none',
          color: 'var(--color-text-dim)',
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-dim)'; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11l9-8 9 8" />
          <path d="M5 10v10h14V10" />
        </svg>
      </a>
      {/* Divider between Home and section dots */}
      <div style={{ width: '16px', height: '1px', background: 'var(--color-border)', margin: '2px 0' }} />
      {sections.map((s) => {
        const isActive = active === s.id;
        const isHovered = hoveredId === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={(e) => handleClick(e, s.id)}
            onMouseEnter={() => setHoveredId(s.id)}
            onMouseLeave={() => setHoveredId(null)}
            onFocus={() => setHoveredId(s.id)}
            onBlur={() => setHoveredId(null)}
            aria-label={`Jump to ${s.num} — ${s.title}`}
            aria-current={isActive ? 'true' : undefined}
            data-active={isActive ? 'true' : 'false'}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '8px',
              padding: '4px',
              borderRadius: '50%',
              cursor: 'pointer',
              textDecoration: 'none',
              outline: 'none',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                display: 'inline-block',
                width: isActive ? '12px' : '8px',
                height: isActive ? '12px' : '8px',
                borderRadius: '50%',
                background: isActive ? 'var(--color-accent)' : 'var(--color-text-dim)',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
            />
            {isHovered && (
              <span
                role="tooltip"
                style={{
                  position: 'absolute',
                  right: 'calc(100% + 12px)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: '6px 12px',
                  background: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-button)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  pointerEvents: 'none',
                }}
              >
                {s.num} — {s.title}
              </span>
            )}
          </a>
        );
      })}
    </nav>
  );
}