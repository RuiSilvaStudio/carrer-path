/**
 * ChapterRail — floating-bar table of contents for /docs.
 *
 * Right-edge vertical stack of horizontal bars (one per section). The
 * active bar is wider and accent-coloured. Hovering (or pressing on
 * touch) opens a floating panel listing all sections with numbers and
 * labels — click an item to smooth-scroll. A Home icon at the top
 * scrolls back to the page top.
 *
 * Pattern adapted from the HeroUI Pro "Floating TOC" component:
 *   - Bars are visual indicators + the hover/press trigger
 *   - Panel contains the actual navigation items
 *   - open/close with hover delay (200ms open, 300ms close)
 *
 * Hidden on viewports <1024px via CSS (.atlas-chapter-rail).
 * The mobile ScrollToTopButton covers the mobile case.
 */
import { useState, useEffect, useRef } from 'react';

export interface RailSection {
  id: string;
  num: string;
  title: string;
  label: string;
}

interface ChapterRailProps {
  sections: RailSection[];
}

export function ChapterRail({ sections }: ChapterRailProps) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? '');
  const [open, setOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const openTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    observerRef.current?.disconnect();
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
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

  // ── Open/close with hover delays ────────────────────────────
  const scheduleOpen = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    if (!open && !openTimer.current) {
      openTimer.current = window.setTimeout(() => {
        setOpen(true);
        openTimer.current = null;
      }, 200);
    }
  };

  const scheduleClose = () => {
    if (openTimer.current) { clearTimeout(openTimer.current); openTimer.current = null; }
    if (open && !closeTimer.current) {
      closeTimer.current = window.setTimeout(() => {
        setOpen(false);
        closeTimer.current = null;
      }, 300);
    }
  };

  useEffect(() => {
    return () => {
      if (openTimer.current) clearTimeout(openTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  // ── Navigation ─────────────────────────────────────────────
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', `#${id}`);
      setActive(id);
    }
    setOpen(false);
  };

  const handleHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    history.replaceState(null, '', '#overview');
  };

  return (
    <div
      className="atlas-chapter-rail"
      data-chapter-rail
      style={{
        position: 'fixed',
        right: '24px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 50,
      }}
      onMouseEnter={scheduleOpen}
      onMouseLeave={scheduleClose}
    >
      {/* ── Rail (bars + home icon) ───────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px',
          padding: '14px 10px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-pill)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          transition: 'box-shadow 0.2s',
        }}
      >
        {/* Home — scrolls to top, own bubble */}
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

        {/* Divider */}
        <div style={{ width: '20px', height: '1px', background: 'var(--color-border)' }} />

        {/* Bars — visual indicators for each section */}
        <div
          aria-hidden="true"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '8px',
            padding: '2px 0',
          }}
        >
          {sections.map((s) => {
            const isActive = active === s.id;
            return (
              <span
                key={s.id}
                style={{
                  display: 'block',
                  width: isActive ? '24px' : '16px',
                  height: '2px',
                  borderRadius: '1px',
                  background: isActive ? 'var(--color-accent)' : 'var(--color-text-dim)',
                  transition: 'width 0.2s ease, background 0.2s ease',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* ── Floating panel (appears on hover) ─────────────────── */}
      {open && (
        <div
          role="navigation"
          aria-label="Table of contents"
          style={{
            position: 'absolute',
            right: 'calc(100% + 12px)',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: '16px 20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            minWidth: '220px',
            animation: 'atlas-toc-enter 0.15s ease',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--color-text-dim)',
              marginBottom: '12px',
            }}
          >
            Contents
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {sections.map((s) => {
              const isActive = active === s.id;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={(e) => handleClick(e, s.id)}
                  aria-current={isActive ? 'true' : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-element)',
                    textDecoration: 'none',
                    color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    transition: 'background 0.15s ease, color 0.15s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'var(--color-surface-elevated)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: 'var(--color-text-dim)',
                      minWidth: '18px',
                    }}
                  >
                    {s.num}
                  </span>
                  {s.label}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}