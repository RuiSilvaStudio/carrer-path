import { useRef, useMemo } from 'react';
import { useGSAP } from '../../../lib/motion';
import gsap from 'gsap';
import { buildTrajectory } from '../../../lib/trajectory';
import type { DemoPulse, Assessment, TrajectoryPoint, BigFiveScores } from '../../../types';
import RadarChart from '../charts/RadarChart';
import { Card } from '../../ui/Card';

interface DistributionViewProps {
  demoData: DemoPulse[];
  baseline: Assessment | null;
  pulses: Assessment[];
  dataSource: 'user' | 'demo';
}

const TRAIT_CONFIG = [
  { key: 'openness' as const, label: 'Openness', color: 'var(--color-openness)' },
  { key: 'conscientiousness' as const, label: 'Conscientiousness', color: 'var(--color-conscientiousness)' },
  { key: 'extraversion' as const, label: 'Extraversion', color: 'var(--color-extraversion)' },
  { key: 'agreeableness' as const, label: 'Agreeableness', color: 'var(--color-agreeableness)' },
  { key: 'emotional_stability' as const, label: 'Stability', color: 'var(--color-stability)' },
];

// ── KDE (Gaussian kernel density estimation) ─────────────────────
function estimateDensity(values: number[], bandwidth = 8): { x: number; y: number }[] {
  if (values.length === 0) return [];
  const min = 0;
  const max = 100;
  const steps = 80;
  const stepSize = (max - min) / steps;
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i <= steps; i++) {
    const x = min + i * stepSize;
    let y = 0;
    for (const v of values) {
      const u = (x - v) / bandwidth;
      y += Math.exp(-0.5 * u * u) / (bandwidth * Math.sqrt(2 * Math.PI));
    }
    y /= values.length;
    points.push({ x, y });
  }

  // Normalize to max = 1
  const maxY = Math.max(...points.map(p => p.y));
  if (maxY > 0) {
    for (const p of points) p.y = p.y / maxY;
  }

  return points;
}

// ── Build histogram bins ─────────────────────────────────────────
function buildHistogram(values: number[], numBins = 20): { bin: number; count: number; x0: number; x1: number }[] {
  if (values.length === 0) return [];
  const binSize = 100 / numBins;
  const bins: { bin: number; count: number; x0: number; x1: number }[] = [];
  for (let i = 0; i < numBins; i++) {
    bins.push({ bin: i, count: 0, x0: i * binSize, x1: (i + 1) * binSize });
  }
  for (const v of values) {
    const idx = Math.min(Math.floor(v / binSize), numBins - 1);
    bins[idx].count++;
  }
  return bins;
}

// ── Density Chart: histogram bars + KDE curve + mean line ────────
function DensityChart({ values, label, color }: { values: number[]; label: string; color: string }) {
  const chartRef = useRef<SVGGElement>(null);

  const width = 300;
  const height = 160;
  const padding = { top: 12, right: 12, bottom: 24, left: 28 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const density = useMemo(() => estimateDensity(values), [values]);
  const histogram = useMemo(() => buildHistogram(values), [values]);
  const mean = useMemo(() => values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0, [values]);
  const maxCount = useMemo(() => Math.max(...histogram.map(h => h.count), 1), [histogram]);
  const maxDensityY = useMemo(() => Math.max(...density.map(d => d.y), 0.01), [density]);

  // Scale histogram counts to fit alongside density
  // We normalize histogram by maxCount, and density is already normalized to 1
  const histScale = (count: number) => (count / maxCount) * 0.7 * chartH; // 70% height for bars
  const densityScale = (y: number) => (y / maxDensityY) * chartH;

  // KDE path
  const densityPath = density
    .map((d, i) => {
      const x = padding.left + (d.x / 100) * chartW;
      const y = padding.top + chartH - densityScale(d.y);
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

  const areaPath = densityPath
    ? `${densityPath} L${padding.left + chartW},${padding.top + chartH} L${padding.left},${padding.top + chartH} Z`
    : '';

  // Mean line position
  const meanX = padding.left + (mean / 100) * chartW;

  // GSAP animate bars on entrance
  useGSAP(() => {
    if (!chartRef.current) return;
    const bars = chartRef.current.querySelectorAll('rect[data-bar]');
    gsap.fromTo(bars, { scaleY: 0, transformOrigin: 'bottom' }, { scaleY: 1, duration: 0.6, ease: 'power2.out', stagger: 0.02 });
    const curve = chartRef.current.querySelector('path[data-curve]');
    if (curve) {
      const len = (curve as SVGPathElement).getTotalLength();
      gsap.fromTo(curve, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1, ease: 'power2.out', delay: 0.3 });
    }
  }, { scope: chartRef, dependencies: [values] });

  return (
    <div>
      {/* Label + color swatch */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: 'var(--radius-element)', background: color }} />
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--color-text-muted)',
        }}>
          {label}
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-dim)',
          marginLeft: 'auto',
        }}>
          μ={mean.toFixed(1)}
        </span>
      </div>

      <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
        <g ref={chartRef}>
          {/* Grid lines */}
          <line x1={padding.left} y1={padding.top + chartH} x2={padding.left + chartW} y2={padding.top + chartH} stroke="var(--color-grid)" strokeWidth={1} />
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartH} stroke="var(--color-grid)" strokeWidth={1} />

          {/* X-axis labels */}
          {[0, 25, 50, 75, 100].map(v => (
            <text key={v} x={padding.left + (v / 100) * chartW} y={height - 6} textAnchor="middle" fontSize={9} fill="var(--color-text-dim)" fontFamily="var(--font-mono)">
              {v}
            </text>
          ))}

          {/* Histogram bars */}
          {histogram.map(h => {
            const barW = (chartW / histogram.length) - 1;
            const barX = padding.left + (h.bin / histogram.length) * chartW + 0.5;
            const barH = histScale(h.count);
            return (
              <rect
                key={h.bin}
                data-bar
                x={barX}
                y={padding.top + chartH - barH}
                width={Math.max(barW, 1)}
                height={barH}
                fill={color}
                fillOpacity={0.2}
                rx={1}
              />
            );
          })}

          {/* KDE area + curve */}
          {areaPath && <path d={areaPath} fill={color} fillOpacity={0.08} />}
          {densityPath && (
            <path
              data-curve
              d={densityPath}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinejoin="round"
            />
          )}

          {/* Mean line */}
          <line
            x1={meanX}
            y1={padding.top}
            x2={meanX}
            y2={padding.top + chartH}
            stroke="var(--color-text-muted)"
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.6}
          />
          <text
            x={meanX + 4}
            y={padding.top + 10}
            fontSize={9}
            fill="var(--color-text-dim)"
            fontFamily="var(--font-mono)"
          >
            μ
          </text>
        </g>
      </svg>
    </div>
  );
}

export function DistributionView({ demoData, baseline, pulses, dataSource }: DistributionViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP entrance for cards
  useGSAP(() => {
    const cards = containerRef.current?.querySelectorAll('[data-anim]');
    if (cards) {
      gsap.fromTo(cards, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.1 });
    }
  }, { scope: containerRef, dependencies: [dataSource] });

  // ═══════════════════════════════════════════════════════════════
  // DEMO MODE
  // ═══════════════════════════════════════════════════════════════
  if (dataSource === 'demo') {
    const traitValues: Record<keyof BigFiveScores, number[]> = {
      openness: [],
      conscientiousness: [],
      extraversion: [],
      agreeableness: [],
      emotional_stability: [],
    };
    demoData.forEach(d => {
      traitValues.openness.push(d.openness);
      traitValues.conscientiousness.push(d.conscientiousness);
      traitValues.extraversion.push(d.extraversion);
      traitValues.agreeableness.push(d.agreeableness);
      traitValues.emotional_stability.push(d.emotional_stability);
    });

    return (
      <div ref={containerRef}>
        <Card
          label="02 · Distribution"
          title="Density Distributions"
          subtitle={`${demoData.length} pulses — frequency histograms with kernel density estimates`}
          infoTerm="chart-distribution"
          data-anim
        >
          <div className="atlas-grid-auto" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
          }}>
            {TRAIT_CONFIG.map(trait => (
              <DensityChart
                key={trait.key}
                values={traitValues[trait.key]}
                label={trait.label}
                color={trait.color}
              />
            ))}
          </div>
        </Card>

        {/* Stats summary */}
        <div style={{ marginTop: '20px' }} data-anim>
          <Card
            label="Summary Statistics"
            title="Trait Ranges & Means"
            subtitle="Mean · std · min · max across all your pulses for each trait."
            infoTerm="concept-trait-score"
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}>
              {TRAIT_CONFIG.map(trait => {
                const vals = traitValues[trait.key];
                const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
                const min = Math.min(...vals);
                const max = Math.max(...vals);
                const std = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length);
                return (
                  <div key={trait.key} style={{
                    padding: '14px 16px', background: 'var(--color-surface-elevated)',
                    borderRadius: 'var(--radius-button)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: trait.color }} />
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase',
                        letterSpacing: '0.08em', color: 'var(--color-text-dim)',
                      }}>
                        {trait.label}
                      </span>
                    </div>
                    <p style={{
                      fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 500,
                      color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: '4px',
                    }}>
                      {mean.toFixed(1)}
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-dim)',
                    }}>
                      {min.toFixed(0)}–{max.toFixed(0)} · σ={std.toFixed(1)}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // USER MODE (baseline + pulses)
  // ═══════════════════════════════════════════════════════════════
  if (!baseline) return null;

  const dataPoints = pulses.length + 1;

  // ── Fewer than 3 data points: radar + message ─────────────────
  if (dataPoints < 3) {
    return (
      <div ref={containerRef}>
        <div className="atlas-2col" style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: '20px',
        }}>
          <Card
            label="02 · Distribution"
            title="Baseline Profile"
            subtitle="Trait score, 0–100, at your baseline (no pulses yet)."
            infoTerm="chart-distribution"
          >
            <RadarChart scores={baseline.scores.bigFive} size={300} />
          </Card>

          <Card
            label="Status"
            title="Need more data to see distributions."
            subtitle="Why your distribution view is empty, and what to do about it."
            infoText="Distribution views are most meaningful after 5+ weekly pulses. Until then, your baseline is the only point — a single sample, not a distribution."
          >
            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: 1.6,
              color: 'var(--color-text-muted)', marginBottom: '16px',
            }}>
              You have {dataPoints} data {dataPoints === 1 ? 'point' : 'points'}. Density distributions require at least 3 pulses to reveal meaningful patterns in how your traits spread and cluster.
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 16px', background: 'var(--color-surface-elevated)',
              borderRadius: 'var(--radius-button)',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 500,
                color: 'var(--color-accent)',
              }}>
                {3 - dataPoints}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-muted)',
              }}>
                more {3 - dataPoints === 1 ? 'pulse' : 'pulses'} needed
              </span>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ── 3+ data points: show density distributions ────────────────
  const trajectory: TrajectoryPoint[] = buildTrajectory(baseline, pulses);
  const traitValues: Record<keyof BigFiveScores, number[]> = {
    openness: [],
    conscientiousness: [],
    extraversion: [],
    agreeableness: [],
    emotional_stability: [],
  };
  trajectory.forEach(d => {
    traitValues.openness.push(d.scores.openness);
    traitValues.conscientiousness.push(d.scores.conscientiousness);
    traitValues.extraversion.push(d.scores.extraversion);
    traitValues.agreeableness.push(d.scores.agreeableness);
    traitValues.emotional_stability.push(d.scores.emotional_stability);
  });

  return (
    <div ref={containerRef}>
      <Card
        label="02 · Distribution"
        title="Density Distributions"
        subtitle={`${dataPoints} data points — frequency histograms with kernel density estimates`}
        infoTerm="chart-distribution"
        data-anim
      >
        <div className="atlas-grid-auto" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
        }}>
          {TRAIT_CONFIG.map(trait => (
            <DensityChart
              key={trait.key}
              values={traitValues[trait.key]}
              label={trait.label}
              color={trait.color}
            />
          ))}
        </div>
      </Card>

      {/* Stats summary */}
      <div style={{ marginTop: '20px' }} data-anim>
        <Card
          label="Summary Statistics"
          title="Trait Ranges & Means"
          subtitle="Mean · std · min · max across all your pulses for each trait."
          infoTerm="concept-trait-score"
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
          }}>
            {TRAIT_CONFIG.map(trait => {
              const vals = traitValues[trait.key];
              const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
              const min = Math.min(...vals);
              const max = Math.max(...vals);
              const std = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length);
              return (
                <div key={trait.key} style={{
                  padding: '14px 16px', background: 'var(--color-surface-elevated)',
                  borderRadius: 'var(--radius-button)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: trait.color }} />
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase',
                      letterSpacing: '0.08em', color: 'var(--color-text-dim)',
                    }}>
                      {trait.label}
                    </span>
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 500,
                    color: 'var(--color-text)', letterSpacing: '-0.02em', marginBottom: '4px',
                  }}>
                    {mean.toFixed(1)}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-dim)',
                  }}>
                    {min.toFixed(0)}–{max.toFixed(0)} · σ={std.toFixed(1)}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
