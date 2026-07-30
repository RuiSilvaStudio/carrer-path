import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useDashboardState } from '../../state/DashboardContext';
import type { ViewName } from '../../types';

type CmdItem = {
  id: string;
  title: string;
  group: 'Navigate' | 'View' | 'Action';
  keywords: string[];
  shortcut?: string;
  action: () => void;
};

// Map each doc sub-anchor to a friendly title + keywords
const DOC_ANCHORS: Array<{ anchor: string; title: string; keywords: string[] }> = [
  { anchor: 'overview', title: 'Overview', keywords: ['overview', 'intro', 'introduction', 'start', 'about'] },
  { anchor: 'science', title: 'The Science', keywords: ['science', 'big five', 'trait', 'research', 'psychology'] },
  { anchor: 'instruments', title: 'Assessment Instruments', keywords: ['instruments', 'ipip', 'neo', 'bfi', 'questionnaire'] },
  { anchor: 'scoring', title: 'Scoring Methodology', keywords: ['scoring', 'score', 'percentile', 'normalize', 'methodology'] },
  { anchor: 'pulse-design', title: 'Pulse Design', keywords: ['pulse', 'design', 'short', 'micro'] },
  { anchor: 'visualization', title: 'Data Visualization', keywords: ['visualization', 'chart', 'graph', 'plot', 'viz'] },
  { anchor: 'data-sources', title: 'Data Sources', keywords: ['data', 'sources', 'import', 'csv'] },
  { anchor: 'privacy', title: 'Privacy & Ethics', keywords: ['privacy', 'ethics', 'security', 'data', 'consent'] },
  { anchor: 'future', title: 'Future: Smoothing', keywords: ['future', 'smoothing', 'roadmap', 'plan'] },
  { anchor: 'accessibility', title: 'Accessibility', keywords: ['accessibility', 'a11y', 'wcag', 'screen reader', 'keyboard'] },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const { setView } = useDashboardState();

  const close = () => {
    setOpen(false);
    setQuery('');
    setActiveIdx(0);
  };

  // Build the items list inside the component so we can call hooks-based actions
  const items = useMemo<CmdItem[]>(() => {
    const out: CmdItem[] = [];

    // View tabs (Dashboard) — set the view via DashboardContext, then navigate to '/'
    const viewTabs: Array<{ name: ViewName; title: string; keywords: string[]; shortcut: string }> = [
      { name: 'trajectory', title: 'Trajectory', keywords: ['trajectory', 'longitudinal', 'over time', 'history', 'dashboard'], shortcut: '1' },
      { name: 'distribution', title: 'Distribution', keywords: ['distribution', 'spread', 'variance', 'histogram', 'dashboard'], shortcut: '2' },
      { name: 'context', title: 'Context', keywords: ['context', 'heatmap', 'environment', 'situation', 'dashboard'], shortcut: '3' },
      { name: 'rhythm', title: 'Rhythm', keywords: ['rhythm', 'circadian', 'cycle', 'time of day', 'dashboard'], shortcut: '4' },
    ];
    for (const t of viewTabs) {
      out.push({
        id: `view-${t.name}`,
        title: t.title,
        group: 'View',
        keywords: t.keywords,
        shortcut: t.shortcut,
        action: () => {
          setView(t.name);
          navigate('/');
        },
      });
    }

    // Top-level routes
    out.push({
      id: 'route-baseline',
      title: 'Baseline',
      group: 'Navigate',
      keywords: ['baseline', 'initial', 'first assessment', 'starting'],
      action: () => navigate('/baseline'),
    });
    out.push({
      id: 'route-pulse',
      title: 'Pulse',
      group: 'Navigate',
      keywords: ['pulse', 'check-in', 'quick', 'micro'],
      action: () => navigate('/pulse'),
    });
    out.push({
      id: 'route-docs',
      title: 'Docs',
      group: 'Navigate',
      keywords: ['docs', 'documentation', 'guide', 'help', 'read'],
      action: () => navigate('/docs'),
    });
    out.push({
      id: 'route-profile',
      title: 'Profile',
      group: 'Navigate',
      keywords: ['profile', 'account', 'settings', 'me'],
      action: () => navigate('/profile'),
    });

    // Docs sub-anchors — "Docs · <Title>"
    for (const a of DOC_ANCHORS) {
      out.push({
        id: `docs-${a.anchor}`,
        title: `Docs · ${a.title}`,
        group: 'Navigate',
        keywords: ['docs', 'documentation', ...a.keywords],
        action: () => navigate(`/docs#${a.anchor}`),
      });
    }

    // Actions
    out.push({
      id: 'action-theme',
      title: 'Toggle theme',
      group: 'Action',
      keywords: ['theme', 'dark', 'light', 'mode', 'toggle', 'appearance'],
      action: () => toggleTheme(),
    });
    out.push({
      id: 'action-signout',
      title: 'Sign out',
      group: 'Action',
      keywords: ['sign out', 'logout', 'log out', 'exit', 'quit'],
      action: () => signOut(),
    });

    return out;
  }, [navigate, setView, toggleTheme, signOut]);

  // Filter items by query (case-insensitive; prefix boost)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    const scored: Array<{ item: CmdItem; score: number }> = [];
    for (const item of items) {
      const title = item.title.toLowerCase();
      const kw = item.keywords.map(k => k.toLowerCase());
      let score = 0;
      if (title.startsWith(q)) score = 100;
      else if (title.includes(q)) score = 50;
      else if (kw.some(k => k.startsWith(q))) score = 25;
      else if (kw.some(k => k.includes(q))) score = 10;
      if (score > 0) scored.push({ item, score });
    }
    scored.sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title));
    return scored.map(s => s.item);
  }, [items, query]);

  // Group filtered items for rendering
  const grouped = useMemo(() => {
    const groups: Record<CmdItem['group'], CmdItem[]> = {
      Navigate: [],
      View: [],
      Action: [],
    };
    for (const item of filtered) groups[item.group].push(item);
    return groups;
  }, [filtered]);

  // Flatten for arrow-key navigation (preserves group order: Navigate, View, Action)
  const flat = useMemo(() => filtered, [filtered]);

  // Reset active index when query changes
  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  // Global ⌘K / Ctrl+K listener — ignore when typing in an input/textarea/contenteditable
  useEffect(() => {
    const isEditable = (el: EventTarget | null): boolean => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
      if (el.isContentEditable) return true;
      return false;
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        // Only swallow if we're not in an editable field. Allow the user
        // to still trigger ⌘K from an input if they want to navigate.
        if (isEditable(e.target)) return;
        e.preventDefault();
        setOpen(o => !o);
        return;
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      // small timeout so the input is mounted
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Scroll active row into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [activeIdx, open]);

  // Backdrop click closes
  const onBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) close();
  };

  const runItem = (item: CmdItem) => {
    item.action();
    close();
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, Math.max(flat.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = flat[activeIdx];
      if (item) runItem(item);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  if (!open) return null;

  // Build a flat index per group so we can attach data-idx to each row
  let runningIdx = 0;
  const groupOrder: CmdItem['group'][] = ['Navigate', 'View', 'Action'];

  return (
    <div
      onMouseDown={onBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '580px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          fontFamily: 'var(--font-sans)',
          color: 'var(--color-text)',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={onInputKey}
          placeholder="Type a command or search…"
          autoComplete="off"
          spellCheck={false}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-sans)',
            fontSize: '17px',
            padding: '18px 20px',
            borderBottom: '1px solid var(--color-border)',
          }}
        />
        <div
          ref={listRef}
          style={{
            maxHeight: '60vh',
            overflowY: 'auto',
            padding: '6px 0',
          }}
        >
          {flat.length === 0 ? (
            <div
              style={{
                padding: '24px 20px',
                color: 'var(--color-text-muted)',
                fontSize: '13px',
                fontFamily: 'var(--font-sans)',
              }}
            >
              No matches
            </div>
          ) : (
            groupOrder.map(group => {
              const list = grouped[group];
              if (list.length === 0) return null;
              return (
                <div key={group} style={{ marginBottom: '4px' }}>
                  <div
                    style={{
                      padding: '8px 20px 4px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      color: 'var(--color-text-dim)',
                    }}
                  >
                    {group}
                  </div>
                  {list.map(item => {
                    const idx = runningIdx++;
                    const active = idx === activeIdx;
                    return (
                      <button
                        key={item.id}
                        data-idx={idx}
                        type="button"
                        onMouseEnter={() => setActiveIdx(idx)}
                        onClick={() => runItem(item)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          width: '100%',
                          boxSizing: 'border-box',
                          textAlign: 'left',
                          background: active ? 'var(--color-surface-elevated)' : 'transparent',
                          border: 'none',
                          borderLeft: active ? '2px solid var(--color-accent)' : '2px solid transparent',
                          padding: '10px 18px 10px 18px',
                          minHeight: '44px',
                          cursor: 'pointer',
                          color: active ? 'var(--color-accent)' : 'var(--color-text)',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '14px',
                          transition: 'background 0.1s ease, color 0.1s ease',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            color: active ? 'var(--color-accent)' : 'var(--color-text-dim)',
                            minWidth: '90px',
                          }}
                        >
                          {group === 'Navigate' && item.title.startsWith('Docs · ') ? 'DOCS' : group.toUpperCase()}
                        </span>
                        <span style={{ flex: 1 }}>{item.title}</span>
                        {item.shortcut && (
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '11px',
                              color: 'var(--color-text-dim)',
                              padding: '2px 6px',
                              border: '1px solid var(--color-border)',
                              borderRadius: '4px',
                            }}
                          >
                            {item.shortcut}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 20px',
            borderTop: '1px solid var(--color-border)',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'var(--color-text-dim)',
          }}
        >
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
          <span style={{ marginLeft: 'auto' }}>⌘K</span>
        </div>
      </div>
    </div>
  );
}