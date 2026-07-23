import { useDashboardState } from '../../../state/DashboardContext';
import { buildTrajectory } from '../../../lib/trajectory';
import type { DemoPulse, Assessment, TrajectoryPoint, BigFiveScores } from '../../../types';
import RadarChart from '../charts/RadarChart';

interface DistributionViewProps {
  demoData: DemoPulse[];
  baseline: Assessment | null;
  pulses: Assessment[];
}

const TRAIT_CONFIG = [
  { key: 'openness' as const, label: 'Openness', color: 'var(--color-openness)' },
  { key: 'conscientiousness' as const, label: 'Conscientiousness', color: 'var(--color-conscientiousness)' },
  { key: 'extraversion' as const, label: 'Extraversion', color: 'var(--color-extraversion)' },
  { key: 'agreeableness' as const, label: 'Agreeableness', color: 'var(--color-agreeableness)' },
  { key: 'emotional_stability' as const, label: 'Stability', color: 'var(--color-stability)' },
];

// Simple density estimate using kernel density estimation (gaussian)
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

  // Normalize
  const maxY = Math.max(...points.map(p => p.y));
  if (maxY > 0) {
    for (const p of points) p.y = p.y / maxY;
  }

  return points;
}

function DensityPlot({ values, label, color }: { values: number[]; label: string; color: string }) {
  const width = 300;
  const height = 120;
  const padding = { top: 10, right: 10, bottom: 20, left: 30 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const density = estimateDensity(values);
  const maxDensityY = Math.max(...density.map(d => d.y), 0.01);

  const path = density
    .map((d, i) => {
      const x = padding.left + (d.x / 100) * chartW;
      const y = padding.top + chartH - (d.y / maxDensityY) * chartH;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

  const areaPath = path
    ? `${path} L${padding.left + chartW},${padding.top + chartH} L${padding.left},${padding.top + chartH} Z`
    : '';

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px',
      }}>
        <span style={{ display: 'inline-block', width: '10px', height: '2px', background: color }} />
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--color-text-muted)',
        }}>
          {label}
        </span>
      </div>
      <svg width={width} height={height}>
        <line x1={padding.left} y1={padding.top + chartH} x2={padding.left + chartW} y2={padding.top + chartH} stroke="var(--color-grid)" />
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartH} stroke="var(--color-grid)" />
        {[0, 50, 100].map(v => (
          <text key={v} x={padding.left + (v / 100) * chartW} y={height - 6} textAnchor="middle" fontSize={9} fill="var(--color-text-dim)" fontFamily="var(--font-mono)">
            {v}
          </text>
        ))}
        {areaPath && <path d={areaPath} fill={color} fillOpacity={0.15} />}
        {path && <path d={path} fill="none" stroke={color} strokeWidth={2} />}
      </svg>
    </div>
  );
}

export function DistributionView({ demoData, baseline, pulses }: DistributionViewProps) {
  const { mode } = useDashboardState();

  if (mode === 'demo') {
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
      <div>
        <SectionLabel>Density Distributions — Demo ({demoData.length} pulses)</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {TRAIT_CONFIG.map(trait => (
            <DensityPlot
              key={trait.key}
              values={traitValues[trait.key]}
              label={trait.label}
              color={trait.color}
            />
          ))}
        </div>
      </div>
    );
  }

  // Baseline mode
  if (!baseline) return null;

  const dataPoints = pulses.length + 1;

  if (dataPoints < 3) {
    return (
      <div>
        <SectionLabel>Distribution</SectionLabel>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
          <RadarChart scores={baseline.scores.bigFive} size={300} />
          <div style={{ maxWidth: '320px' }}>
            <p style={{
              fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 500,
              color: 'var(--color-text)', marginBottom: '12px', letterSpacing: '-0.02em',
            }}>
              Need more data to see distributions.
            </p>
            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: 1.6,
              color: 'var(--color-text-muted)',
            }}>
              You have {dataPoints} data point{dataPoints === 1 ? '' : 's'}. Density distributions require at least 3 pulses to reveal meaningful patterns.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3+ data points: show distributions from trajectory
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
    <div>
      <SectionLabel>Density Distributions — Your Data ({dataPoints} points)</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {TRAIT_CONFIG.map(trait => (
          <DensityPlot
            key={trait.key}
            values={traitValues[trait.key]}
            label={trait.label}
            color={trait.color}
          />
        ))}
      </div>
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
