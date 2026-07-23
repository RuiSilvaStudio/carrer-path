import { useEffect, useMemo } from 'react';
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

  // Compute metadata for header
  const meta = useMemo(() => {
    if (mode === 'demo') {
      const count = demoData.length;
      if (count === 0) return { count, dateRange: '', participant: 'Demo Participant', assessmentType: 'Demo Data', phase: '' };
      const dates = demoData.map(d => d.date).sort();
      const fmt = (d: string) => {
        const dt = new Date(d);
        return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      };
      return {
        count,
        dateRange: count > 1 ? `${fmt(dates[0])} — ${fmt(dates[dates.length - 1])}` : fmt(dates[0]),
        participant: 'Demo Participant',
        assessmentType: 'Longitudinal Pulse Series',
        phase: `${count} pulses over ~6 months`,
      };
    }
    // Baseline mode
    const count = pulses.length;
    const participant = user?.email?.split('@')[0] ?? 'You';
    const assessmentType = baseline ? 'Baseline + Pulses' : 'Baseline';
    const allDates: string[] = [];
    if (baseline) allDates.push(baseline.timestamp.split('T')[0]);
    pulses.forEach(p => allDates.push(p.timestamp.split('T')[0]));
    allDates.sort();
    const fmt = (d: string) => {
      const dt = new Date(d);
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    const dateRange = allDates.length > 1 ? `${fmt(allDates[0])} — ${fmt(allDates[allDates.length - 1])}` : allDates.length === 1 ? fmt(allDates[0]) : '';
    return {
      count,
      dateRange,
      participant,
      assessmentType,
      phase: count === 0 ? 'Baseline only' : `${count + 1} data points`,
    };
  }, [mode, demoData, pulses, baseline, user]);

  if (loading || demoLoading) {
    return (
      <div style={{ padding: '60px 40px', maxWidth: '1200px', margin: '0 auto', color: 'var(--color-text-muted)' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Loading…
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px' }}>
      {/* ── Header ────────────────────────────────────────── */}
      <header style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          flexWrap: 'wrap', gap: '20px',
        }}>
          <div style={{ flex: '1 1 400px', minWidth: 0 }}>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '36px',
              fontWeight: 500,
              color: 'var(--color-text)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: '8px',
            }}>
              Who You Are Becoming
            </h1>
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              lineHeight: 1.5,
              color: 'var(--color-text-muted)',
              maxWidth: '520px',
            }}>
              {meta.count > 0
                ? `${meta.count} data ${meta.count === 1 ? 'point' : 'points'} · ${meta.dateRange}`
                : 'A longitudinal view of your personality — observe how traits, contexts, and rhythms shift over time.'}
            </p>
          </div>
          <DataSourceToggle hasBaseline={!!baseline} onNavigate={onNavigate} />
        </div>

        {/* ── Subject Metadata Strip ─────────────────────── */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0',
          marginTop: '20px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--color-border)',
        }}>
          <MetaItem label="Subject" value={meta.participant} />
          <MetaItem label="Assessment" value={meta.assessmentType} />
          <MetaItem label="Data Points" value={String(meta.count)} />
          {meta.dateRange && <MetaItem label="Date Range" value={meta.dateRange} />}
          {meta.phase && <MetaItem label="Phase" value={meta.phase} />}
        </div>
      </header>

      {/* ── View Tabs ─────────────────────────────────────── */}
      <div style={{ marginBottom: '28px' }}>
        <ViewTabs />
      </div>

      {/* ── Active View ──────────────────────────────────── */}
      <main>
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
          <RhythmView demoData={demoData} baseline={baseline} pulses={pulses} />
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer style={{
        marginTop: '48px',
        paddingTop: '20px',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--color-text-dim)',
        }}>
          {mode === 'demo'
            ? 'Data source: Synthetic demo dataset (158 pulses)'
            : 'Data source: Your recorded assessments'}
        </p>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--color-text-dim)',
        }}>
          Atlas — Personality Intelligence Dashboard
        </p>
      </footer>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ paddingRight: '32px', marginRight: '0' }}>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: 'var(--color-text-dim)',
        marginBottom: '4px',
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        color: 'var(--color-text)',
      }}>
        {value}
      </p>
    </div>
  );
}
