import { useDashboardState } from '../../../state/DashboardContext';
import type { DemoPulse } from '../../../types';

interface RhythmViewProps {
  demoData: DemoPulse[];
}

const TRAIT_CONFIG = [
  { key: 'openness' as const, label: 'Openness', color: 'var(--color-openness)' },
  { key: 'conscientiousness' as const, label: 'Conscientiousness', color: 'var(--color-conscientiousness)' },
  { key: 'extraversion' as const, label: 'Extraversion', color: 'var(--color-extraversion)' },
  { key: 'agreeableness' as const, label: 'Agreeableness', color: 'var(--color-agreeableness)' },
  { key: 'emotional_stability' as const, label: 'Stability', color: 'var(--color-stability)' },
];

// Radial clock chart: shows average trait value by hour of day
function RadialClock({ demoData, traitKey, traitLabel, color }: {
  demoData: DemoPulse[];
  traitKey: keyof DemoPulse;
  traitLabel: string;
  color: string;
}) {
  const size = 180;
  const center = size / 2;
  const maxRadius = size * 0.36;

  // Group by hour
  const hourMap: Record<number, number[]> = {};
  demoData.forEach(d => {
    const hour = d.hour;
    const val = d[traitKey] as number;
    if (typeof val === 'number') {
      if (!hourMap[hour]) hourMap[hour] = [];
      hourMap[hour].push(val);
    }
  });

  // Average per hour
  const hourAvgs: { hour: number; avg: number }[] = [];
  for (let h = 0; h < 24; h++) {
    if (hourMap[h] && hourMap[h].length > 0) {
      hourAvgs.push({ hour: h, avg: hourMap[h].reduce((a, b) => a + b, 0) / hourMap[h].length });
    }
  }

  const angleForHour = (hour: number) => (hour / 24) * Math.PI * 2 - Math.PI / 2;

  // Build polygon path
  const points = hourAvgs.map(h => {
    const radius = (h.avg / 100) * maxRadius;
    const angle = angleForHour(h.hour);
    return { x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle), hour: h.hour, avg: h.avg };
  });

  const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} style={{ overflow: 'visible' }}>
        {/* Hour grid */}
        {[6, 12, 18].map(r => {
          const radius = (r / 24) * maxRadius;
          return (
            <circle key={r} cx={center} cy={center} r={radius} fill="none" stroke="var(--color-grid)" strokeWidth={1} />
          );
        })}

        {/* Hour labels */}
        {[0, 6, 12, 18].map(h => {
          const angle = angleForHour(h);
          const labelR = maxRadius + 12;
          return (
            <text key={h}
              x={center + labelR * Math.cos(angle)}
              y={center + labelR * Math.sin(angle)}
              textAnchor="middle" dominantBaseline="middle"
              fill="var(--color-text-dim)" fontSize={9} fontFamily="var(--font-mono)"
            >
              {h.toString().padStart(2, '0')}
            </text>
          );
        })}

        {/* Data polygon */}
        {polygonPath && (
          <polygon
            points={polygonPath}
            fill={color}
            fillOpacity={0.15}
            stroke={color}
            strokeWidth={2}
          />
        )}

        {/* Data points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
        ))}
      </svg>
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase',
        letterSpacing: '0.08em', color: 'var(--color-text-muted)', marginTop: '4px',
      }}>
        {traitLabel}
      </p>
    </div>
  );
}

// Emotion heatmap by hour
function EmotionHeatmap({ demoData }: { demoData: DemoPulse[] }) {
  // Collect all emotions
  const allEmotions = new Set<string>();
  demoData.forEach(d => {
    if (d.emotions) {
      Object.keys(d.emotions).forEach(e => allEmotions.add(e));
    }
  });

  const emotions = Array.from(allEmotions).sort();
  if (emotions.length === 0) return null;

  // Build heatmap matrix: emotion x hour
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const matrix: Record<string, Record<number, number>> = {};
  emotions.forEach(e => {
    matrix[e] = {};
    hours.forEach(h => { matrix[e][h] = 0; });
  });

  demoData.forEach(d => {
    if (d.emotions) {
      for (const [emotion, count] of Object.entries(d.emotions)) {
        if (matrix[emotion]) {
          matrix[emotion][d.hour] = (matrix[emotion][d.hour] || 0) + count;
        }
      }
    }
  });

  const maxVal = Math.max(...emotions.map(e => Math.max(...hours.map(h => matrix[e][h]))), 1);

  const cellSize = 16;

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={40 + 24 * cellSize} height={20 + emotions.length * cellSize}>
        {/* Hour headers */}
        {hours.map(h => (
          <text key={h}
            x={40 + h * cellSize + cellSize / 2}
            y={12}
            textAnchor="middle"
            fontSize={8}
            fill="var(--color-text-dim)"
            fontFamily="var(--font-mono)"
          >
            {h % 6 === 0 ? h.toString().padStart(2, '0') : ''}
          </text>
        ))}
        {/* Emotion rows */}
        {emotions.map((emotion, ri) => (
          <g key={emotion}>
            <text
              x={36}
              y={20 + ri * cellSize + cellSize / 2 + 3}
              textAnchor="end"
              fontSize={9}
              fill="var(--color-text-muted)"
              fontFamily="var(--font-mono)"
            >
              {emotion}
            </text>
            {hours.map(h => {
              const val = matrix[emotion][h];
              const opacity = val / maxVal;
              return (
                <rect
                  key={h}
                  x={40 + h * cellSize}
                  y={20 + ri * cellSize}
                  width={cellSize - 1}
                  height={cellSize - 1}
                  fill="var(--color-accent)"
                  fillOpacity={val > 0 ? opacity : 0.05}
                  rx={2}
                />
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}

export function RhythmView({ demoData }: RhythmViewProps) {
  const { mode } = useDashboardState();

  if (mode === 'baseline') {
    return (
      <div>
        <SectionLabel>Rhythm</SectionLabel>
        <p style={{
          fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 500,
          color: 'var(--color-text)', marginBottom: '12px', letterSpacing: '-0.02em',
        }}>
          Time-of-day patterns appear after more pulses.
        </p>
        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: 1.6,
          color: 'var(--color-text-muted)', maxWidth: '480px',
        }}>
          As you complete pulses at different times of day, radial clock charts and emotion heatmaps will reveal your circadian personality rhythms — when you're most open, most focused, most sociable.
        </p>
      </div>
    );
  }

  // Demo mode
  return (
    <div>
      <SectionLabel>Radial Clock Charts — Demo</SectionLabel>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '20px', marginBottom: '32px',
      }}>
        {TRAIT_CONFIG.map(trait => (
          <RadialClock
            key={trait.key}
            demoData={demoData}
            traitKey={trait.key}
            traitLabel={trait.label}
            color={trait.color}
          />
        ))}
      </div>

      <SectionLabel>Emotion Heatmap by Hour</SectionLabel>
      <EmotionHeatmap demoData={demoData} />
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
