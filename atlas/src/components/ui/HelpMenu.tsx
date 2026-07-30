import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GLOSSARY } from '../../data/glossary';

/**
 * HelpMenu — the permanent `?` affordance in the Atlas header.
 * Surfaces the glossary, lets the user restart the first-tour,
 * link to docs, and contact. Modelled on Linear / Pitch / Notion.
 *
 * Audit report: /tmp/atlas-ux-audit-report.html (Phase 3.B)
 */

interface MenuItem {
  label: string;
  description: string;
  shortcut?: string;
  action: () => void;
}

export function HelpMenu() {
  const [open, setOpen] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [glossaryFilter, setGlossaryFilter] = useState('');
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const glossaryInputRef = useRef<HTMLInputElement>(null);

  // Click outside + Esc to close
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setGlossaryOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (glossaryOpen) setGlossaryOpen(false);
        else setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, glossaryOpen]);

  // Focus the glossary search input when it opens
  useEffect(() => {
    if (glossaryOpen) {
      setTimeout(() => glossaryInputRef.current?.focus(), 50);
    } else {
      setGlossaryFilter('');
    }
  }, [glossaryOpen]);

  const restartTour = () => {
    localStorage.removeItem('atlas_tour_v1');
    window.dispatchEvent(new CustomEvent('atlas:restart-tour'));
    setOpen(false);
    // Navigate to dashboard so the chart is visible when tour re-shows
    navigate('/');
  };

  const menuItems: MenuItem[] = [
    {
      label: 'Glossary',
      description: 'Search 58 terms: traits, facets, charts, instruments.',
      action: () => {
        setGlossaryOpen(true);
      },
    },
    {
      label: 'Restart intro tour',
      description: 'Replay the 5-step first-chart tour from the beginning.',
      shortcut: 'T',
      action: restartTour,
    },
    {
      label: 'Documentation',
      description: 'Science, scoring methodology, privacy — the receipt behind every chart.',
      shortcut: '?',
      action: () => {
        navigate('/docs');
        setOpen(false);
      },
    },
    {
      label: 'Contact',
      description: 'Report a bug, request a feature, or ask a question.',
      action: () => {
        window.location.href = 'mailto:rui.fc.silva@proton.me?subject=Atlas feedback';
        setOpen(false);
      },
    },
  ];

  const filteredGlossary = useMemo(() => {
    const q = glossaryFilter.trim().toLowerCase();
    const all = Object.values(GLOSSARY);
    if (!q) return all.slice(0, 30);
    return all.filter(
      (e) =>
        e.term.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.short.toLowerCase().includes(q),
    );
  }, [glossaryFilter]);

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        aria-label="Open help menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '22px',
          borderRadius: '999px',
          border: '1px solid var(--color-border)',
          background: open ? 'var(--color-surface-elevated)' : 'var(--color-surface)',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-sans)',
          fontSize: '12px',
          cursor: 'pointer',
          lineHeight: 1,
          padding: 0,
          transition: 'border-color 0.2s, color 0.2s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-accent)';
          e.currentTarget.style.color = 'var(--color-accent)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)';
          e.currentTarget.style.color = 'var(--color-text-muted)';
        }}
        title="Help"
      >
        ?
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: glossaryOpen ? '420px' : '320px',
            maxHeight: '80vh',
            overflowY: 'auto',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            boxShadow: '0 12px 40px -12px rgba(0,0,0,0.3)',
            padding: glossaryOpen ? '20px' : '12px',
            zIndex: 200,
          }}
        >
          {!glossaryOpen && (
            <>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  color: 'var(--color-text-dim)',
                  padding: '4px 8px 12px',
                  margin: 0,
                }}
              >
                Help
              </p>
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  role="menuitem"
                  onClick={item.action}
                  style={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '10px 12px',
                    background: 'none',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'var(--color-surface-elevated)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                    <span style={{ fontWeight: 500 }}>{item.label}</span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                      {item.description}
                    </span>
                  </span>
                  {item.shortcut && (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: 'var(--color-text-dim)',
                        padding: '2px 6px',
                        border: '1px solid var(--color-border)',
                        borderRadius: '3px',
                        alignSelf: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {item.shortcut}
                    </span>
                  )}
                </button>
              ))}
              <div
                style={{
                  marginTop: '12px',
                  padding: '10px 12px',
                  borderTop: '1px solid var(--color-border)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--color-text-dim)',
                  textAlign: 'center',
                }}
              >
                Press <kbd>?</kbd> or <kbd>Esc</kbd> to close
              </div>
            </>
          )}

          {glossaryOpen && (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <p
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.18em',
                    color: 'var(--color-text-dim)',
                    margin: 0,
                  }}
                >
                  Glossary · {filteredGlossary.length} of {Object.keys(GLOSSARY).length}
                </p>
                <button
                  onClick={() => setGlossaryOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-dim)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '4px 8px',
                  }}
                  aria-label="Back to help menu"
                >
                  ← Back
                </button>
              </div>
              <input
                ref={glossaryInputRef}
                type="text"
                value={glossaryFilter}
                onChange={(e) => setGlossaryFilter(e.target.value)}
                placeholder="Filter terms…"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  outline: 'none',
                  marginBottom: '12px',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {filteredGlossary.length === 0 ? (
                  <p
                    style={{
                      padding: '20px',
                      textAlign: 'center',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '13px',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    No matches.
                  </p>
                ) : (
                  filteredGlossary.slice(0, 30).map((entry) => (
                    <div
                      key={entry.id}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '4px',
                        background: 'transparent',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-surface-elevated)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          marginBottom: '4px',
                          fontFamily: 'var(--font-serif)',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: 'var(--color-text)',
                        }}
                      >
                        {entry.term}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontFamily: 'var(--font-sans)',
                          fontSize: '12px',
                          color: 'var(--color-text-muted)',
                          lineHeight: 1.45,
                        }}
                      >
                        {entry.short}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}