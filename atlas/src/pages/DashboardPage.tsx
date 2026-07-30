import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../hooks/useAuth';
import { useAssessments } from '../hooks/useAssessments';
import { useDemoData } from '../hooks/useDemoData';
import { useDashboardState } from '../state/DashboardContext';
import { ViewTabs } from '../components/dashboard/ViewTabs';
import { TrajectoryView } from '../components/dashboard/views/TrajectoryView';
import { DistributionView } from '../components/dashboard/views/DistributionView';
import { ContextView } from '../components/dashboard/views/ContextView';
import { RhythmView } from '../components/dashboard/views/RhythmView';
import { Sigil } from '../components/sigil/Sigil';
import { sigilInputFromData, EMPTY_SIGIL_INPUT } from '../lib/sigil';
import type { AssessmentScores } from '../types';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { baseline, pulses, loading, error: loadError, refetch } = useAssessments(user?.id ?? null);
  const { demoData, loading: demoLoading } = useDemoData();
  const { view } = useDashboardState();

  const sigilInput = useMemo(() => (
    baseline ? sigilInputFromData(baseline.scores as AssessmentScores, pulses.length, pulses) : null
  ), [baseline, pulses]);

  // Compute header metadata — data-point count + date range
  const meta = useMemo(() => {
    const count = pulses.length;
    const allDates: string[] = [];
    if (baseline) allDates.push(baseline.timestamp.split('T')[0]);
    pulses.forEach(p => allDates.push(p.timestamp.split('T')[0]));
    allDates.sort();
    const fmt = (d: string) => {
      const dt = new Date(d);
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    const dateRange = allDates.length > 1 ? `${fmt(allDates[0])} — ${fmt(allDates[allDates.length - 1])}` : allDates.length === 1 ? fmt(allDates[0]) : '';
    return { count, dateRange };
  }, [pulses, baseline]);

  if (loadError) {
    return (
      <div style={{ padding: '60px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <EmptyState
          title="Could not load your data."
          body={loadError}
          cta="Retry"
          onCta={refetch}
        />
      </div>
    );
  }

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
    <div className="atlas-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-page)' }}>
      {/* ── Header ────────────────────────────────────────── */}
      <header style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          flexWrap: 'wrap', gap: '20px',
        }}>
          <div style={{ flex: '1 1 400px', minWidth: 0, display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ flexShrink: 0 }}>
              {sigilInput
                ? <Sigil input={sigilInput} size={60} showInsignia />
                : <Sigil input={EMPTY_SIGIL_INPUT} size={60} empty animate={false} />}
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 className="atlas-h1" style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'var(--fs-h1)',
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
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {!baseline && (
              <button
                onClick={() => navigate('/baseline')}
                style={{
                  padding: '6px 16px',
                  background: 'var(--color-accent)',
                  color: 'var(--color-bg)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                Take Baseline
              </button>
            )}
            <button
              onClick={() => navigate('/pulse')}
              style={{
                padding: '6px 16px',
                background: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--color-text-dim)',
                transition: 'all 0.2s ease',
              }}
            >
              Pulse
            </button>
          </div>
        </div>
      </header>

      {/* ── View Tabs ─────────────────────────────────────── */}
      <div style={{ marginBottom: '28px' }}>
        <ViewTabs />
      </div>

      {/* ── Active View ──────────────────────────────────── */}
      <main id="atlas-main" tabIndex={-1}>
        {!baseline ? (
          <EmptyState
            title="No baseline yet — this is where you start."
            body="The baseline is a one-time, ~25-minute assessment that establishes your starting trait profile. Every pulse after it builds your trajectory."
            cta="Take your baseline →"
            onCta={() => navigate('/baseline')}
          />
        ) : (
          <>
            {view === 'trajectory' && (
              <TrajectoryView demoData={demoData} baseline={baseline} pulses={pulses} dataSource="user" />
            )}
            {view === 'distribution' && (
              <DistributionView demoData={demoData} baseline={baseline} pulses={pulses} dataSource="user" />
            )}
            {view === 'context' && (
              <ContextView demoData={demoData} baseline={baseline} pulses={pulses} dataSource="user" />
            )}
            {view === 'rhythm' && (
              <RhythmView demoData={demoData} baseline={baseline} pulses={pulses} dataSource="user" />
            )}
          </>
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
          Data source: Your recorded assessments
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
