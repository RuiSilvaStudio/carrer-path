import { useDashboardState } from '../../../state/DashboardContext';
import { buildTrajectory } from '../../../lib/trajectory';
import type { DemoPulse, Assessment, TrajectoryPoint } from '../../../types';
import TrajectoryChart from '../charts/TrajectoryChart';
import RadarChart from '../charts/RadarChart';
import { SD3Bars } from '../charts/SD3Bars';
import { ICARScore } from '../charts/ICARScore';

interface TrajectoryViewProps {
  demoData: DemoPulse[];
  baseline: Assessment | null;
  pulses: Assessment[];
}

export function TrajectoryView({ demoData, baseline, pulses }: TrajectoryViewProps) {
  const { mode, scrubIndex, setScrubIndex } = useDashboardState();

  if (mode === 'demo') {
    const demoTrajectory: TrajectoryPoint[] = demoData.map(d => ({
      type: 'pulse',
      date: d.date,
      scores: {
        openness: d.openness,
        conscientiousness: d.conscientiousness,
        extraversion: d.extraversion,
        agreeableness: d.agreeableness,
        emotional_stability: d.emotional_stability,
      },
    }));

    return (
      <div>
        <SectionLabel>Trait Trajectory — Demo</SectionLabel>
        <TrajectoryChart data={demoTrajectory} onScrub={setScrubIndex} />
        {scrubIndex > 0 && scrubIndex <= demoTrajectory.length && (
          <p style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-muted)' }}>
            Point {scrubIndex}: {demoTrajectory[scrubIndex - 1]?.date}
          </p>
        )}
      </div>
    );
  }

  // Baseline mode
  if (!baseline) return null;

  const trajectory = buildTrajectory(baseline, pulses);

  // Only baseline, no pulses
  if (pulses.length === 0) {
    return (
      <div>
        <SectionLabel>Starting Point</SectionLabel>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
          <RadarChart scores={baseline.scores.bigFive} size={320} />
          <div style={{ maxWidth: '320px' }}>
            <p style={{
              fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 500,
              color: 'var(--color-text)', marginBottom: '12px', letterSpacing: '-0.02em',
            }}>
              Your baseline is your starting point.
            </p>
            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: 1.6,
              color: 'var(--color-text-muted)',
            }}>
              Complete weekly pulses to see how your personality moves over time. Each pulse adds a new point to the trajectory.
            </p>
          </div>
        </div>

        {baseline.scores.sd3 && (
          <div style={{ marginTop: '32px' }}>
            <SectionLabel>Dark Triad (SD3)</SectionLabel>
            <div style={{ maxWidth: '400px' }}>
              <SD3Bars sd3={baseline.scores.sd3} />
            </div>
          </div>
        )}
        {baseline.scores.icar && (
          <div style={{ marginTop: '24px', maxWidth: '400px' }}>
            <ICARScore icar={baseline.scores.icar} />
          </div>
        )}
      </div>
    );
  }

  // Baseline + pulses
  const scrubbedPoint = trajectory[scrubIndex] ?? trajectory[trajectory.length - 1];

  return (
    <div>
      <SectionLabel>Trait Trajectory</SectionLabel>
      <TrajectoryChart data={trajectory} onScrub={setScrubIndex} />

      <div style={{ display: 'flex', gap: '32px', marginTop: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <RadarChart scores={scrubbedPoint?.scores ?? baseline.scores.bigFive} size={280} />
        <div>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase',
            letterSpacing: '0.12em', color: 'var(--color-text-dim)', marginBottom: '6px',
          }}>
            {scrubbedPoint?.type === 'baseline' ? 'Baseline' : 'Pulse'} — {scrubbedPoint?.date}
          </p>
          <input
            type="range"
            min={0}
            max={trajectory.length - 1}
            value={Math.min(scrubIndex, trajectory.length - 1)}
            onChange={e => setScrubIndex(parseInt(e.target.value))}
            style={{ width: '240px', accentColor: 'var(--color-accent)' }}
          />
        </div>
      </div>

      {baseline.scores.sd3 && (
        <div style={{ marginTop: '32px' }}>
          <SectionLabel>Dark Triad (SD3)</SectionLabel>
          <div style={{ maxWidth: '400px' }}>
            <SD3Bars sd3={baseline.scores.sd3} />
          </div>
        </div>
      )}
      {baseline.scores.icar && (
        <div style={{ marginTop: '24px', maxWidth: '400px' }}>
          <ICARScore icar={baseline.scores.icar} />
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase',
      letterSpacing: '0.12em', color: 'var(--color-text-dim)', marginBottom: '16px',
    }}>
      {children}
    </p>
  );
}
