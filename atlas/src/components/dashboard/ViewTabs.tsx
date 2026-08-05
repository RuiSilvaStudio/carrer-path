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
            data-active={active ? 'true' : 'false'}
            className={`atlas-tab-btn${active ? ' active' : ''}`}
          >
            <span>{tab.num}</span>
            <span className="atlas-tab-label">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
