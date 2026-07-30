import { useRef, useMemo } from 'react';
import { useGSAP } from '../../../lib/motion';
import gsap from 'gsap';
import type { DemoPulse, Assessment } from '../../../types';
import { Card } from '../../ui/Card';

interface RhythmViewProps {
  demoData: DemoPulse[];
  baseline?: Assessment | null;
  pulses?: Assessment[];
  dataSource: 'user' | 'demo';
}

const TRAIT_CONFIG = [
  { key: 'openness' as const, label: 'Openness', color: 'var(--color-openness)' },
  { key: 'conscientiousness' as const, label: 'Conscientiousness', color: 'var(--color-conscientiousness)' },
  { key: 'extraversion' as const, label: 'Extraversion', color: 'var(--color-extraversion)' },
  { key: 'agreeableness' as const, label: 'Agreeableness', color: 'var(--color-agreeableness)' },
  { key: 'emotional_stability' as const, label: 'Stability', color: 'var(--color-stability)' },
];

// ── Radial Clock Chart: avg trait value by hour of day ───────────
function RadialClock({ demoData, traitKey, traitLabel, color }: {
  demoData: DemoPulse[];
  traitKey: keyof DemoPulse;
  traitLabel: string;
  color: string;
}) {
  const polyRef = useRef<SVGPolygonElement>(null);
  const size = 180;
  const center = size / 2;
  const maxRadius = size * 0.36;

  // Group by hour
  const { hourAvgs, peakHour } = useMemo(() => {
    const hourMap: Record<number, number[]> = {};
    demoData.forEach(d => {
      const hour = d.hour;
      const val = d[traitKey] as number;
      if (typeof val === 'number') {
        if (!hourMap[hour]) hourMap[hour] = [];
        hourMap[hour].push(val);
      }
    });

    const avgs: { hour: number; avg: number }[] = [];
    for (let h = 0; h < 24; h++) {
      if (hourMap[h] && hourMap[h].length > 0) {
        avgs.push({ hour: h, avg: hourMap[h].reduce((a, b) => a + b, 0) / hourMap[h].length });
      }
    }

    let peak = -1;
    let peakVal = 0;
    avgs.forEach(a => { if (a.avg > peakVal) { peakVal = a.avg; peak = a.hour; } });

    return { hourAvgs: avgs, peakHour: peak };
  }, [demoData, traitKey]);

  const angleForHour = (hour: number) => (hour / 24) * Math.PI * 2 - Math.PI / 2;

  // Build polygon path
  const points = hourAvgs.map(h => {
    const radius = (h.avg / 100) * maxRadius;
    const angle = angleForHour(h.hour);
    return { x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle), hour: h.hour, avg: h.avg };
  });

  const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');

  // GSAP entrance
  useGSAP(() => {
    if (polyRef.current && polygonPath) {
      gsap.fromTo(polyRef.current,
        { opacity: 0, scale: 0.5, transformOrigin: `${center}px ${center}px` },
        { opacity: 1, scale: 1, duration: 0.8, ease: 'power2.out' }
      );
    }
  }, { dependencies: [polygonPath] });

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
            ref={polyRef}
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
      {peakHour >= 0 && (
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-text-dim)', marginTop: '2px',
        }}>
          peak @ {peakHour.toString().padStart(2, '0')}:00
        </p>
      )}
    </div>
  );
}

// ── Emotion Heatmap: time of day × emotions ──────────────────────
function EmotionHeatmap({ demoData }: { demoData: DemoPulse[] }) {
  const containerRef = useRef<SVGGElement>(null);

  const { emotions, matrix, maxVal } = useMemo(() => {
    const allEmotions = new Set<string>();
    demoData.forEach(d => {
      if (d.emotions) {
        Object.keys(d.emotions).forEach(e => allEmotions.add(e));
      }
    });

    const emos = Array.from(allEmotions).sort();
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const mat: Record<string, Record<number, number>> = {};
    emos.forEach(e => {
      mat[e] = {};
      hours.forEach(h => { mat[e][h] = 0; });
    });

    demoData.forEach(d => {
      if (d.emotions) {
        for (const [emotion, count] of Object.entries(d.emotions)) {
          if (mat[emotion]) {
            mat[emotion][d.hour] = (mat[emotion][d.hour] || 0) + count;
          }
        }
      }
    });

    const mx = Math.max(...emos.map(e => Math.max(...hours.map(h => mat[e][h]))), 1);

    return { emotions: emos, matrix: mat, maxVal: mx };
  }, [demoData]);

  useGSAP(() => {
    if (!containerRef.current) return;
    const cells = containerRef.current.querySelectorAll('rect[data-emo-cell]');
    gsap.fromTo(cells, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out', stagger: { each: 0.005, from: 'start' } });
  }, { scope: containerRef, dependencies: [demoData] });

  if (emotions.length === 0) return null;

  const cellSize = 16;
  const labelW = 90;
  const svgW = labelW + 24 * cellSize;
  const svgH = 28 + emotions.length * cellSize;

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={svgW} height={svgH}>
        <g ref={containerRef}>
          {/* Hour headers */}
          {Array.from({ length: 24 }, (_, h) => h).map(h => (
            <text key={h}
              x={90 + h * cellSize + cellSize / 2}
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
              {Array.from({ length: 24 }, (_, h) => h).map(h => {
                const val = matrix[emotion][h];
                const opacity = val / maxVal;
                return (
                  <rect
                    key={h}
                    data-emo-cell
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
        </g>
      </svg>
    </div>
  );
}

export function RhythmView({ demoData, dataSource }: RhythmViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter out missing pulses (all 0/0/0/0/100 pattern — no response data)
  const validData = demoData.filter(d => {
    return !(d.openness === 0 && d.conscientiousness === 0 &&
             d.extraversion === 0 && d.agreeableness === 0 &&
             d.emotional_stability === 100);
  });

  useGSAP(() => {
    const cards = containerRef.current?.querySelectorAll('[data-anim]');
    if (cards) {
      gsap.fromTo(cards, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.1 });
    }
  }, { scope: containerRef, dependencies: [dataSource] });

  // ═══════════════════════════════════════════════════════════════
  // USER MODE (baseline + pulses)
  // ═══════════════════════════════════════════════════════════════
  if (dataSource === 'user') {
    return (
      <div ref={containerRef}>
        <Card
          label="04 · Rhythm"
          title="Time-of-day patterns appear after more pulses."
          subtitle="Why the rhythm view is empty, and what it will show."
          infoText="Rhythm views need pulses at varied hours of day. Once you have them, radial clocks show your trait scores by hour; heatmaps show your emotional patterns by time."
        >
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: 1.6,
            color: 'var(--color-text-muted)', maxWidth: '480px', marginBottom: '16px',
          }}>
            As you complete pulses at different times of day, radial clock charts and emotion heatmaps will reveal your circadian personality rhythms — when you're most open, most focused, most sociable.
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 16px', background: 'var(--color-surface-elevated)',
            borderRadius: '8px', maxWidth: '400px',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-muted)',
            }}>
              Complete pulses at varying hours to populate rhythm data
            </span>
          </div>
        </Card>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // DEMO MODE
  // ═══════════════════════════════════════════════════════════════
  return (
    <div ref={containerRef}>
      {/* ── Radial Clock Charts ────────────────────────── */}
      <Card
        label="04 · Rhythm"
        title="Circadian Trait Patterns"
        subtitle="Average trait scores by hour of day across all demo pulses"
        infoTerm="chart-rhythm-radial-clock"
        data-anim
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '20px',
        }}>
          {TRAIT_CONFIG.map(trait => (
            <RadialClock
              key={trait.key}
              demoData={validData}
              traitKey={trait.key}
              traitLabel={trait.label}
              color={trait.color}
            />
          ))}
        </div>
      </Card>

      {/* ── Emotion Heatmap ────────────────────────────── */}
      <div style={{ marginTop: '20px' }} data-anim>
        <Card
          label="Emotions"
          title="Emotion Heatmap by Hour"
          subtitle="Frequency of emotions across hours of the day"
          infoTerm="chart-rhythm-heatmap"
        >
          <EmotionHeatmap demoData={validData} />
        </Card>
      </div>
    </div>
  );
}
