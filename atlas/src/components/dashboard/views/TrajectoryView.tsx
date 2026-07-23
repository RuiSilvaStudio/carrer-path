import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useDashboardState } from '../../../state/DashboardContext';
import { buildTrajectory } from '../../../lib/trajectory';
import type { DemoPulse, Assessment, TrajectoryPoint, BigFiveScores } from '../../../types';
import TrajectoryChart from '../charts/TrajectoryChart';
import RadarChart from '../charts/RadarChart';
import { SD3Bars } from '../charts/SD3Bars';
import { ICARScore } from '../charts/ICARScore';
import { Card } from '../../ui/Card';
import { InsightStrip } from '../../ui/InsightStrip';
import { InfoTooltip } from '../../ui/InfoTooltip';

interface TrajectoryViewProps {
  demoData: DemoPulse[];
  baseline: Assessment | null;
  pulses: Assessment[];
}

const TRAIT_LABELS: { key: keyof BigFiveScores; label: string }[] = [
  { key: 'openness', label: 'Openness' },
  { key: 'conscientiousness', label: 'Conscientiousness' },
  { key: 'extraversion', label: 'Extraversion' },
  { key: 'agreeableness', label: 'Agreeableness' },
  { key: 'emotional_stability', label: 'Stability' },
];

// ── Generate insight text from trajectory data ───────────────────
function generateInsight(traj: TrajectoryPoint[], currentIdx: number): string {
  if (traj.length < 2) return 'Your trajectory is just beginning. Each pulse adds a new point to the map.';
  const point = traj[Math.min(currentIdx, traj.length - 1)] ?? traj[traj.length - 1];
  const first = traj[0];
  const changes: { trait: string; delta: number }[] = [];
  for (const t of TRAIT_LABELS) {
    const delta = point.scores[t.key] - first.scores[t.key];
    if (Math.abs(delta) >= 5) changes.push({ trait: t.label, delta });
  }
  changes.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  if (changes.length === 0) return `Traits remain stable through ${point.date}. No significant movement from baseline.`;
  const top = changes.slice(0, 2);
  const parts = top.map(c => `${c.trait} ${c.delta > 0 ? '↑' : '↓'} ${Math.abs(c.delta).toFixed(0)}pts`);
  const direction = top[0].delta > 0 ? 'rising' : 'shifting';
  return `Since baseline, ${parts.join(' and ')}. ${top[0].trait} is ${direction} — watch for patterns in the distribution view.`;
}

// ── Phase Bar ────────────────────────────────────────────────────
function PhaseBar({ trajectory, currentIndex }: { trajectory: TrajectoryPoint[]; currentIndex: number }) {
  if (trajectory.length === 0) return null;
  const progress = trajectory.length > 1 ? currentIndex / (trajectory.length - 1) : 0;
  const phaseLabel = currentIndex === 0 ? 'Baseline' : `Pulse ${currentIndex}`;
  const dateLabel = trajectory[currentIndex]?.date ?? '';

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase',
          letterSpacing: '0.12em', color: 'var(--color-text-muted)',
        }}>
          {phaseLabel}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-dim)',
        }}>
          {dateLabel}
        </span>
      </div>
      {/* Phase track */}
      <div style={{
        height: '4px', background: 'var(--color-surface-elevated)', borderRadius: '2px', overflow: 'hidden', position: 'relative',
      }}>
        <div style={{
          height: '100%', width: `${progress * 100}%`,
          background: 'var(--color-accent)', borderRadius: '2px',
          transition: 'width 0.3s ease',
        }} />
      </div>
      {/* Tick markers */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginTop: '6px',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-text-dim)' }}>Start</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-text-dim)' }}>
          {trajectory.length} points
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-text-dim)' }}>Now</span>
      </div>
    </div>
  );
}

// ── Scrubber (unused — chart has built-in scrubber) ──────────────
// @ts-expect-error — Scrubber is defined for future use but not currently rendered
function Scrubber({
  trajectory,
  scrubIndex,
  setScrubIndex,
}: {
  trajectory: TrajectoryPoint[];
  scrubIndex: number;
  setScrubIndex: (i: number) => void;
}) {
  if (trajectory.length <= 1) return null;
  const safeIndex = Math.min(scrubIndex, trajectory.length - 1);
  const current = trajectory[safeIndex];

  return (
    <div style={{ marginTop: '16px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase',
          letterSpacing: '0.12em', color: 'var(--color-text-dim)',
        }}>
          {current?.type === 'baseline' ? 'Baseline' : 'Pulse'} — {current?.date}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-muted)',
        }}>
          {safeIndex + 1} / {trajectory.length}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={trajectory.length - 1}
        value={safeIndex}
        onChange={e => setScrubIndex(parseInt(e.target.value))}
        style={{
          width: '100%', accentColor: 'var(--color-accent)', cursor: 'pointer',
        }}
      />
    </div>
  );
}

export function TrajectoryView({ demoData, baseline, pulses }: TrajectoryViewProps) {
  const { mode, scrubIndex, setScrubIndex } = useDashboardState();
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP entrance for cards
  useGSAP(() => {
    const cards = containerRef.current?.querySelectorAll('[data-anim]');
    if (cards) {
      gsap.fromTo(cards, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.1 });
    }
  }, { scope: containerRef, dependencies: [mode] });

  // ═══════════════════════════════════════════════════════════════
  // DEMO MODE
  // ═══════════════════════════════════════════════════════════════
  if (mode === 'demo') {
    // Filter out missing pulses (all 0/0/0/0/100 pattern — no response data)
    const validDemoData = demoData.filter(d => {
      return !(d.openness === 0 && d.conscientiousness === 0 &&
               d.extraversion === 0 && d.agreeableness === 0 &&
               d.emotional_stability === 100);
    });
    const demoTrajectory: TrajectoryPoint[] = validDemoData.map(d => ({
      type: 'pulse' as const,
      date: d.date,
      day: d.day,
      scores: {
        openness: d.openness,
        conscientiousness: d.conscientiousness,
        extraversion: d.extraversion,
        agreeableness: d.agreeableness,
        emotional_stability: d.emotional_stability,
      },
      emotionScores: d.emotions ?? undefined,
    }));

    if (demoTrajectory.length === 0) {
      return <div style={{ color: 'var(--color-text-muted)', padding: '40px' }}>No demo data available.</div>;
    }

    const safeScrub = Math.min(scrubIndex, demoTrajectory.length - 1);
    const currentPoint = demoTrajectory[safeScrub] ?? demoTrajectory[demoTrajectory.length - 1];
    const insight = generateInsight(demoTrajectory, safeScrub);

    return (
      <div ref={containerRef}>
        {/* ── Two-column grid: trajectory + radar ─────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.6fr) minmax(280px, 1fr)',
          gap: '20px',
          marginBottom: '20px',
        }}>
          {/* Trajectory chart card — chart includes phase bar, scrubber, traits/emotions toggle internally */}
          <Card label="01 · Trajectory" title="Trait Trajectory — Demo" data-anim
            infoText="Lines show Big Five trait scores over time. Phase bands mark natural periods (Semester, Christmas, Holiday, Exams). The scrubber lets you move through time. This is descriptive, not a clinical assessment."
          >
            <PhaseBar trajectory={demoTrajectory} currentIndex={scrubIndex} />
          <TrajectoryChart data={demoTrajectory} onScrub={setScrubIndex} />
          </Card>

          {/* Radar panel */}
          <Card label="Current State" title="Big Five Profile" data-anim>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <RadarChart scores={currentPoint.scores} size={280} />
            </div>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase',
              letterSpacing: '0.12em', color: 'var(--color-text-dim)',
              textAlign: 'center', marginTop: '8px',
            }}>
              Pulse {safeScrub + 1} of {demoTrajectory.length}
            </p>
          </Card>
        </div>

        {/* ── Insight Strip ──────────────────────────────── */}
        <div data-anim style={{ marginBottom: '20px' }}>
          <InsightStrip label="Pattern Insight">
            {insight}
          </InsightStrip>
        </div>

        {/* ── Trait Summary Strip ────────────────────────── */}
        <Card label="Trait Summary" title="Scores at Current Point" data-anim>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px',
          }}>
            {TRAIT_LABELS.map(t => (
              <div key={t.key} style={{
                padding: '12px 16px', background: 'var(--color-surface-elevated)',
                borderRadius: '8px',
              }}>
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: 'var(--color-text-dim)', marginBottom: '4px',
                }}>
                  {t.label}
                </p>
                <p style={{
                  fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 500,
                  color: 'var(--color-text)', letterSpacing: '-0.02em',
                }}>
                  {currentPoint.scores[t.key].toFixed(0)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // BASELINE MODE
  // ═══════════════════════════════════════════════════════════════
  if (!baseline) return null;

  const trajectory = buildTrajectory(baseline, pulses);

  // ── Baseline only, no pulses ──────────────────────────────────
  if (pulses.length === 0) {
    return (
      <div ref={containerRef}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 1fr)',
          gap: '20px',
          marginBottom: '20px',
        }}>
          <Card label="Starting Point" title="Your Baseline Profile" data-anim>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <RadarChart scores={baseline.scores.bigFive} size={320} />
            </div>
          </Card>

          <Card label="Guidance" title="Your baseline is your starting point." data-anim>
            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: 1.6,
              color: 'var(--color-text-muted)', marginBottom: '16px',
            }}>
              Complete weekly pulses to see how your personality moves over time. Each pulse adds a new point to the trajectory, revealing patterns in how traits shift with context and time.
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 16px', background: 'var(--color-surface-elevated)',
              borderRadius: '8px',
            }}>
              <InfoTooltip text="A pulse is a short weekly check-in that re-measures your Big Five traits. Over time, pulses build a trajectory showing how your personality moves." />
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-muted)',
              }}>
                What is a pulse?
              </span>
            </div>
          </Card>
        </div>

        {/* ── SD3 + ICAR ────────────────────────────────── */}
        {(baseline.scores.sd3 || baseline.scores.icar) && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
          }}>
            {baseline.scores.sd3 && (
              <Card label="Dark Triad" title="SD3 Scores" data-anim>
                <div style={{ maxWidth: '400px' }}>
                  <SD3Bars sd3={baseline.scores.sd3} />
                </div>
              </Card>
            )}
            {baseline.scores.icar && (
              <Card label="Cognitive" title="ICAR Score" data-anim>
                <ICARScore icar={baseline.scores.icar} />
              </Card>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Baseline + pulses ─────────────────────────────────────────
  const safeScrub = Math.min(scrubIndex, trajectory.length - 1);
  const scrubbedPoint = trajectory[safeScrub] ?? trajectory[trajectory.length - 1];
  const insight = generateInsight(trajectory, safeScrub);

  return (
    <div ref={containerRef}>
      {/* ── Two-column grid: trajectory + radar ─────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.6fr) minmax(280px, 1fr)',
        gap: '20px',
        marginBottom: '20px',
      }}>
        <Card label="01 · Trajectory" title="Trait Trajectory" data-anim
          infoText="Lines show Big Five trait scores over time. The scrubber lets you move through time. This is descriptive, not a clinical assessment."
        >
          <PhaseBar trajectory={trajectory} currentIndex={scrubIndex} />
          <TrajectoryChart data={trajectory} onScrub={setScrubIndex} />
          </Card>

        <Card label="Current State" title="Big Five Profile" data-anim>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <RadarChart scores={scrubbedPoint.scores} size={280} />
            </div>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase',
            letterSpacing: '0.12em', color: 'var(--color-text-dim)',
            textAlign: 'center', marginTop: '8px',
          }}>
            {scrubbedPoint.type === 'baseline' ? 'Baseline' : 'Pulse'} — {scrubbedPoint.date}
          </p>
        </Card>
      </div>

      {/* ── Insight Strip ──────────────────────────────── */}
      <div data-anim style={{ marginBottom: '20px' }}>
        <InsightStrip label="Pattern Insight">
          {insight}
        </InsightStrip>
      </div>

      {/* ── SD3 + ICAR ─────────────────────────────────── */}
      {(baseline.scores.sd3 || baseline.scores.icar) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}>
          {baseline.scores.sd3 && (
            <Card label="Dark Triad" title="SD3 Scores" data-anim>
              <div style={{ maxWidth: '400px' }}>
                <SD3Bars sd3={baseline.scores.sd3} />
              </div>
            </Card>
          )}
          {baseline.scores.icar && (
            <Card label="Cognitive" title="ICAR Score" data-anim>
              <ICARScore icar={baseline.scores.icar} />
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
