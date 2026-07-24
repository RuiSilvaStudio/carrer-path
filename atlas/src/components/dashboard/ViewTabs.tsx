import { useDashboardState } from '../../state/DashboardContext';
import type { ViewName } from '../../types';

const TABS: { id: ViewName; num: string; label: string }[] = [
  { id: 'trajectory', num: '01', label: 'Trajectory' },
  { id: 'distribution', num: '02', label: 'Distribution' },
  { id: 'context', num: '03', label: 'Context' },
  { id: 'rhythm', num: '04', label: 'Rhythm' },
];

export function ViewTabs() {
  const { view, setView } = useDashboardState();

  return (
    <div className="atlas-tabs" style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--color-border)' }}>
      {TABS.map(tab => {
        const active = view === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: active ? '2px solid var(--color-accent)' : '2px solid transparent',
              cursor: 'pointer',
              padding: '10px 20px 10px 0',
              marginRight: '24px',
              minHeight: 'var(--tap)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: active ? 'var(--color-accent)' : 'var(--color-text-dim)',
              transition: 'color 0.2s ease, border-color 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ color: active ? 'var(--color-accent)' : 'var(--color-text-dim)' }}>
              {tab.num}
            </span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
