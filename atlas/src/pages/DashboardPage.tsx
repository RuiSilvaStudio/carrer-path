import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAssessments } from '../hooks/useAssessments';
import { useDemoData } from '../hooks/useDemoData';
import { useDashboardState } from '../state/DashboardContext';
import { DataSourceToggle } from '../components/dashboard/DataSourceToggle';
import { ViewTabs } from '../components/dashboard/ViewTabs';
import { TrajectoryView } from '../components/dashboard/views/TrajectoryView';
import { DistributionView } from '../components/dashboard/views/DistributionView';
import { ContextView } from '../components/dashboard/views/ContextView';
import { RhythmView } from '../components/dashboard/views/RhythmView';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user } = useAuth();
  const { baseline, pulses, loading } = useAssessments(user?.id ?? null);
  const { demoData, loading: demoLoading } = useDemoData();
  const { mode, view } = useDashboardState();

  // If mode is baseline but no baseline exists, redirect to baseline page
  useEffect(() => {
    if (mode === 'baseline' && !loading && !baseline) {
      onNavigate('baseline');
    }
  }, [mode, loading, baseline, onNavigate]);

  if (loading || demoLoading) {
    return (
      <div style={{ padding: '60px 40px', color: 'var(--color-text-muted)' }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 500,
              color: 'var(--color-text)', letterSpacing: '-0.03em',
              marginBottom: '8px', lineHeight: 1.1,
            }}>
              Who You Are Becoming
            </h1>
            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: '15px', lineHeight: 1.5,
              color: 'var(--color-text-muted)', maxWidth: '520px',
            }}>
              A longitudinal view of your personality — observe how traits, contexts, and rhythms shift over time.
            </p>
          </div>
          <DataSourceToggle hasBaseline={!!baseline} onNavigate={onNavigate} />
        </div>
      </div>

      {/* View Tabs */}
      <div style={{ marginBottom: '24px' }}>
        <ViewTabs />
      </div>

      {/* Active View */}
      <div>
        {view === 'trajectory' && (
          <TrajectoryView demoData={demoData} baseline={baseline} pulses={pulses} />
        )}
        {view === 'distribution' && (
          <DistributionView demoData={demoData} baseline={baseline} pulses={pulses} />
        )}
        {view === 'context' && (
          <ContextView demoData={demoData} baseline={baseline} pulses={pulses} />
        )}
        {view === 'rhythm' && (
          <RhythmView demoData={demoData} />
        )}
      </div>
    </div>
  );
}
