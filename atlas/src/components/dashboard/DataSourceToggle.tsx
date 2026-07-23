import { useDashboardState } from '../../state/DashboardContext';

interface DataSourceToggleProps {
  hasBaseline: boolean;
  onNavigate: (page: string) => void;
}

export function DataSourceToggle({ hasBaseline, onNavigate }: DataSourceToggleProps) {
  const { mode, setMode } = useDashboardState();

  const handleBaselineClick = () => {
    if (!hasBaseline) {
      onNavigate('baseline');
      return;
    }
    setMode('baseline');
  };

  const handleDemoClick = () => {
    setMode('demo');
  };

  const buttonStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 16px',
    background: 'none',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: active ? 'var(--color-accent)' : 'var(--color-text-dim)',
    borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
    transition: 'all 0.2s ease',
  });

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button style={buttonStyle(mode === 'demo')} onClick={handleDemoClick}>
        Demo Data
      </button>
      <button style={buttonStyle(mode === 'baseline')} onClick={handleBaselineClick}>
        My Baseline
      </button>
    </div>
  );
}
