import { useRef, useState, useMemo } from 'react';
import { useGSAP } from '../../../lib/motion';
import gsap from 'gsap';
import { useDashboardState } from '../../../state/DashboardContext';
import { buildTrajectory } from '../../../lib/trajectory';
import type { DemoPulse, Assessment, TrajectoryPoint, BigFiveScores } from '../../../types';
import TrajectoryChart from '../charts/TrajectoryChart';
import RadarChart from '../charts/RadarChart';
import { SD3Bars } from '../charts/SD3Bars';
import { ICARScore } from '../charts/ICARScore';
import { Card } from '../../ui/Card';
import { EmptyState } from '../../ui/EmptyState';
import { InsightStrip } from '../../ui/InsightStrip';

interface TrajectoryViewProps {
  demoData: DemoPulse[];
  baseline: Assessment | null;
  pulses: Assessment[];
  dataSource: 'user' | 'demo';
}

const TRAIT_LABELS: { key: keyof BigFiveScores; label: string; short?: string; color: string }[] = [
  { key: 'openness', label: 'Openness', short: 'O', color: 'var(--color-openness)' },
  { key: 'conscientiousness', label: 'Conscientiousness', short: 'C', color: 'var(--color-conscientiousness)' },
  { key: 'extraversion', label: 'Extraversion', short: 'E', color: 'var(--color-extraversion)' },
  { key: 'agreeableness', label: 'Agreeableness', short: 'A', color: 'var(--color-agreeableness)' },
  { key: 'emotional_stability', label: 'Stability', short: 'ES', color: 'var(--color-stability)' },
];

// ── Generate insight text from trajectory data ───────────────────
// Bands chosen against whole-trait-theory variance (Fleeson 2001):
//   <2pt  week-to-week = within-noise
//   2-5pt = typical weekly drift
//   >5pt = notable movement worth flagging
function generateInsight(traj: TrajectoryPoint[], currentIdx: number): string {
  if (traj.length < 2) return 'Your trajectory is just beginning. Each pulse adds a new point to the map.';
  const point = traj[Math.min(currentIdx, traj.length - 1)] ?? traj[traj.length - 1];
  const first = traj[0];
  const changes: { trait: string; delta: number }[] = [];
  for (const t of TRAIT_LABELS) {
    const delta = point.scores[t.key] - first.scores[t.key];
    if (Math.abs(delta) >= 2) changes.push({ trait: t.label, delta });
  }
  changes.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  if (changes.length === 0) {
    return `No trait moved more than ±2pt since your ${first.type === 'baseline' ? 'baseline' : 'first pulse'} on ${first.date}. Movement this small is within the typical week-to-week noise band.`;
  }
  const top = changes.slice(0, 2);
  const parts = top.map(c => `${c.trait} ${c.delta > 0 ? '↑' : '↓'} ${Math.abs(c.delta).toFixed(1)}pts`);
  const notable = top.filter(c => Math.abs(c.delta) >= 5);
  const verdict = notable.length > 0
    ? `${notable[0].trait} crossed the ±5pt noise band — outside typical weekly drift.`
    : `All changes are within the typical ±5pt weekly drift band.`;
  return `Since ${first.date}: ${parts.join(' and ')}. ${verdict} Cross-reference the Context view to see if a particular situation drove the change.`;
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

export function TrajectoryView({ demoData, baseline, pulses, dataSource }: TrajectoryViewProps) {
  const { scrubIndex, setScrubIndex } = useDashboardState();
  const containerRef = useRef<HTMLDivElement>(null);
  const [smoothing, setSmoothing] = useState<'raw' | 'daily' | 'weekly'>('daily');
  const [showDetails, setShowDetails] = useState(false);

  // GSAP entrance for cards
  useGSAP(() => {
    const cards = containerRef.current?.querySelectorAll('[data-anim]');
    if (cards) {
      gsap.fromTo(cards, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.1 });
    }
  }, { scope: containerRef, dependencies: [dataSource] });

  // ── Smoothing helper: aggregates a trajectory by date (daily) or week (weekly) ──
  const smoothTrajectory = (traj: TrajectoryPoint[], smoothMode: 'raw' | 'daily' | 'weekly'): TrajectoryPoint[] => {
    if (smoothMode === 'raw' || traj.length <= 1) return traj;
    const groups: Record<string, TrajectoryPoint[]> = {};
    traj.forEach(d => {
      let groupKey: string;
      if (smoothMode === 'daily') {
        groupKey = d.date;
      } else {
        const dt = new Date(d.date);
        const week = Math.floor(dt.getTime() / (7 * 24 * 60 * 60 * 1000));
        groupKey = 'w' + week;
      }
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(d);
    });
    return Object.entries(groups).map(([_key, points]) => {
      const avgScores: any = {};
      for (const key of ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'emotional_stability']) {
        const vals = points.map(p => p.scores[key as keyof BigFiveScores]).filter(v => v != null && !isNaN(v as number)) as number[];
        avgScores[key] = vals.length > 0 ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length : null;
      }
      return { type: points[0].type, date: points[0].date, scores: avgScores, emotionScores: points[0].emotionScores } as TrajectoryPoint;
    });
  };

  // ── Build demo trajectory (top-level so useMemo can wrap it) ──
  const demoTrajectory: TrajectoryPoint[] = useMemo(() => {
    const validDemoData = demoData.filter(d => {
      return !(d.openness === 0 && d.conscientiousness === 0 &&
               d.extraversion === 0 && d.agreeableness === 0 &&
               d.emotional_stability === 100);
    });
    return validDemoData.map(d => ({
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
  }, [demoData]);

  // ── Smoothed trajectory for demo mode ──
  const smoothedTrajectory = useMemo(() => smoothTrajectory(demoTrajectory, smoothing), [demoTrajectory, smoothing, /* smoothTrajectory stable */]);

  // ── Build + smooth baseline trajectory (baseline + pulses) ──
  const baselineTrajectoryRaw = useMemo(() => baseline ? buildTrajectory(baseline, pulses) : [], [baseline, pulses]);
  const baselineTrajectory = useMemo(() => smoothTrajectory(baselineTrajectoryRaw, smoothing), [baselineTrajectoryRaw, smoothing]);

  // ═══════════════════════════════════════════════════════════════
  // DEMO MODE
  // ═══════════════════════════════════════════════════════════════
  if (dataSource === 'demo') {
    if (demoTrajectory.length === 0) {
      return (
        <EmptyState
          title="No trajectory data yet."
          body="Complete a few pulses and your trait trajectory will appear here."
        />
      );
    }

    const safeScrub = Math.min(scrubIndex, smoothedTrajectory.length - 1);
    const currentPoint = smoothedTrajectory[safeScrub] ?? smoothedTrajectory[smoothedTrajectory.length - 1];
    const insight = generateInsight(smoothedTrajectory, safeScrub);

    return (
      <div ref={containerRef}>
        {/* Row 1: Full-width trajectory chart */}
        <div style={{ marginBottom: '20px' }} data-anim>
          <Card
            label="01 · Trajectory"
            title="Trait Trajectory — Demo"
            subtitle="Trait score, 0–100 (mean × 20, IPIP-NEO-120, weekly avg). Click any point to scrub."
            infoText="Big Five trait scores over time. 0–100 = mean of Likert responses × 20. Higher = stronger expression of the trait. Source: IPIP-NEO-120."
          >
            <PhaseBar trajectory={smoothedTrajectory} currentIndex={scrubIndex} />
            <TrajectoryChart
              data={smoothedTrajectory}
              originalDataLength={demoTrajectory.length}
              onScrub={setScrubIndex}
              smoothing={smoothing}
              onSmoothingChange={(m) => { setSmoothing(m); setScrubIndex(0); }}
            />
          </Card>
        </div>

        {/* Row 2: Radar (50%) + Insights/Summary (50%) */}
        <div className="atlas-2col" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: '20px',
        }}>
          {/* Left: Radar */}
          <Card
            label="Current State"
            title="Big Five Profile"
            subtitle="Trait score, 0–100, at the scrubbed point."
            infoText="Five-axis snapshot of your trait scores at the current point. Each axis 0–100, higher = stronger. Click a vertex for the underlying value."
            data-anim
          >
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <RadarChart scores={currentPoint.scores} size={320} />
            </div>
            <p style={{ textAlign: 'center', marginTop: '8px', color: 'var(--color-text-dim)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
              Pulse {safeScrub + 1} of {smoothedTrajectory.length}
            </p>
          </Card>

          {/* Right: Insight + Trait Summary stacked */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <InsightStrip label="Pattern Insight">
              {insight}
            </InsightStrip>

            <Card label="Trait Summary" title="Scores at Current Point" data-anim>
              <div className="atlas-score-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '8px',
              }}>
                {TRAIT_LABELS.map(t => (
                  <div key={t.key} style={{
                    textAlign: 'center', padding: '12px 8px',
                    background: 'var(--color-surface-elevated)', borderRadius: '8px',
                  }}>
                    <p style={{ color: t.color, fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>
                      {t.short || t.label}
                    </p>
                    <p style={{ color: t.color, fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 500 }}>
                      {currentPoint.scores[t.key]?.toFixed(0) ?? '—'}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // USER MODE (baseline + pulses)
  // ═══════════════════════════════════════════════════════════════
  if (!baseline) return null;

  // ── Baseline only, no pulses ──────────────────────────────────
  if (pulses.length === 0) {
    return (
      <div ref={containerRef}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: '20px',
          marginBottom: '20px',
        }} className="atlas-2col">
          <Card
            label="Starting Point"
            title="Your Baseline Profile"
            subtitle="Trait score, 0–100, from your one-time baseline assessment."
            infoText="Your one-time baseline trait profile. Each axis 0–100 = mean × 20 from IPIP-NEO-120. Pulses will overlay this point."
          >
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <RadarChart scores={baseline.scores.bigFive} size={320} />
            </div>
          </Card>

          <Card
            label="Guidance"
            title="Your baseline is your starting point."
            subtitle="What pulses will reveal, and how to take your first one."
            infoText="Pulses add new points to your trajectory. Without them, your baseline is a single frame — useful but not yet a pattern."
          >
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
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-muted)',
              }}>
                A pulse is a short weekly check-in that re-measures your Big Five traits. Over time, pulses build a trajectory showing how your personality moves.
              </span>
            </div>
          </Card>
        </div>

        {/* ── SD3 + ICAR ────────────────────────────────── */}
        {(baseline.scores.sd3 || baseline.scores.icar) && (
          <div className="atlas-grid-auto" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
          }}>
            {baseline.scores.sd3 && (
              <Card
                label="Motivational Drivers"
                title="SD3 Scores"
                subtitle="Short Dark Triad (SD3) — relabelled 'Motivational Drivers'. 0–100."
                infoText="We label the SD3 'Motivational Drivers' to reduce the stigma of the original 'Dark Triad' name. The underlying constructs (Machiavellianism · Narcissism · Psychopathy) are unchanged."
              >
                <div style={{ maxWidth: '400px' }}>
                  <SD3Bars sd3={baseline.scores.sd3} />
                </div>
              </Card>
            )}
            {baseline.scores.icar && (
              <Card
                label="Cognitive"
                title="ICAR Score"
                subtitle="ICAR-16 cognitive ability score: (correct / total) × 100."
                infoText="ICAR-16 measures fluid cognitive ability across 4 item types: letter series, verbal reasoning, matrix reasoning, 3D rotation."
              >
                <ICARScore icar={baseline.scores.icar} />
              </Card>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Baseline + pulses ─────────────────────────────────────────
  const safeScrub = Math.min(scrubIndex, baselineTrajectory.length - 1);
  const scrubbedPoint = baselineTrajectory[safeScrub] ?? baselineTrajectory[baselineTrajectory.length - 1];
  const insight = generateInsight(baselineTrajectory, safeScrub);

  return (
    <div ref={containerRef}>
      {/* Row 1: Full-width trajectory chart */}
      <div style={{ marginBottom: '20px' }} data-anim>
        <Card
          label="01 · Trajectory"
          title="Trait Trajectory"
          subtitle="Trait score, 0–100 (mean × 20, IPIP-NEO-120, weekly avg). Click any point to scrub."
          infoText="Big Five trait scores over time. 0–100 = mean of Likert responses × 20. Higher = stronger expression of the trait. Source: IPIP-NEO-120."
        >
          <PhaseBar trajectory={baselineTrajectory} currentIndex={scrubIndex} />
          <TrajectoryChart
            data={baselineTrajectory}
            originalDataLength={baselineTrajectory.length}
            onScrub={setScrubIndex}
            smoothing={smoothing}
            onSmoothingChange={(m) => { setSmoothing(m); setScrubIndex(0); }}
          />
        </Card>
      </div>

      {/* Row 2: Radar (50%) + Insights/Summary (50%) */}
      <div className="atlas-2col" style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        gap: '20px',
      }}>
        {/* Left: Radar */}
        <Card
          label="Current State"
          title="Big Five Profile"
          subtitle="Trait score, 0–100, at the scrubbed point."
          infoText="Five-axis snapshot of your trait scores at the current point. Each axis 0–100, higher = stronger. Click a vertex for the underlying value."
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <RadarChart scores={scrubbedPoint.scores} size={320} />
          </div>
          <p style={{ textAlign: 'center', marginTop: '8px', color: 'var(--color-text-dim)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
            {scrubbedPoint.type === 'baseline' ? 'Baseline' : 'Pulse'} — {scrubbedPoint.date}
          </p>
        </Card>

        {/* Right: Insight + Trait Summary stacked */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <InsightStrip label="Pattern Insight">
            {insight}
          </InsightStrip>

          <Card
            label="Trait Summary"
            title="Scores at Current Point"
            subtitle="Trait scores at the scrubbed point. Click a value to scrub to that data."
            infoText="Numeric trait scores at the current point. Each value 0–100. Click to scrub to the underlying data."
          >
            <div className="atlas-score-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
            }}>
              {TRAIT_LABELS.map(t => (
                <div key={t.key} style={{
                  textAlign: 'center', padding: '12px 8px',
                  background: 'var(--color-surface-elevated)', borderRadius: '8px',
                }}>
                  <p style={{ color: t.color, fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>
                    {t.short || t.label}
                  </p>
                  <p style={{ color: t.color, fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 500 }}>
                    {scrubbedPoint.scores[t.key]?.toFixed(0) ?? '—'}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ── SD3 + ICAR (progressive disclosure — collapsed by default) ── */}
      {(baseline.scores.sd3 || baseline.scores.icar) && (
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={() => setShowDetails(d => !d)}
            aria-expanded={showDetails}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: '11px',
              textTransform: 'uppercase', letterSpacing: '0.12em',
              color: 'var(--color-text-dim)', padding: '8px 0',
              minHeight: 'var(--tap)',
            }}
          >
            <span style={{
              display: 'inline-block',
              transform: showDetails ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}>▸</span>
            Baseline details (SD3 · ICAR)
          </button>
          {showDetails && (
            <div className="atlas-grid-auto" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
              marginTop: '8px',
            }}>
              {baseline.scores.sd3 && (
                <Card
                  label="Motivational Drivers"
                  title="SD3 Scores"
                  subtitle="Short Dark Triad (SD3) — relabelled 'Motivational Drivers'. 0–100, weekly aggregate."
                  infoText="We label the SD3 'Motivational Drivers' to reduce the stigma of the original 'Dark Triad' name. The underlying constructs (Machiavellianism · Narcissism · Psychopathy) are unchanged."
                >
                  <div style={{ maxWidth: '400px' }}>
                    <SD3Bars sd3={baseline.scores.sd3} />
                  </div>
                </Card>
              )}
              {baseline.scores.icar && (
                <Card
                  label="Cognitive"
                  title="ICAR Score"
                  subtitle="ICAR-16 cognitive ability score: (correct / total) × 100."
                  infoText="ICAR-16 measures fluid cognitive ability across 4 item types: letter series, verbal reasoning, matrix reasoning, 3D rotation. Score is percent correct."
                >
                  <ICARScore icar={baseline.scores.icar} />
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
