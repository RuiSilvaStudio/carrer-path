import { useDashboardState } from '../../state/DashboardContext';
import type { ViewName } from '../../types';

const TABS: { id: ViewName; num: string; label: string; hint: string }[] = [
  { id: 'trajectory', num: '01', label: 'Trajectory', hint: 'Over time' },
  { id: 'distribution', num: '02', label: 'Distribution', hint: 'Profile shape' },
  { id: 'context', num: '03', label: 'Context', hint: 'By situation' },
  { id: 'rhythm', num: '04', label: 'Rhythm', hint: 'Daily rhythm' },
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
            data-active={active ? 'true' : 'false'}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: active ? '2px solid var(--color-accent)' : '2px solid transparent',
              cursor: 'pointer',
              padding: '10px 20px 10px 0',
              marginRight: '24px',
              minHeight: 'var(--tap)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
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
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1px' }}>
              <span>{tab.label}</span>
              <span style={{
                fontSize: '9px', textTransform: 'none', letterSpacing: '0.02em',
                color: 'var(--color-text-dim)', fontFamily: 'var(--font-sans)',
              }}>
                {tab.hint}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
