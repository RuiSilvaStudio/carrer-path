import { useRef, useMemo } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import type { DemoPulse, Assessment } from '../../../types';
import { Card } from '../../ui/Card';
import { EmptyState } from '../../ui/EmptyState';
import { InfoTooltip } from '../../ui/InfoTooltip';

interface ContextViewProps {
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

/* DIAMONDS_DIMENSIONS removed — unused */

// ── Context Heatmap: traits × contexts ───────────────────────────
function ContextHeatmap({ demoData }: { demoData: DemoPulse[] }) {
  const containerRef = useRef<SVGGElement>(null);

  const { contextList, matrix } = useMemo(() => {
    const ctxCounts: Record<string, number> = {};
    const ctxTraits: Record<string, Record<string, number[]>> = {};

    demoData.forEach(d => {
      const ctxs = d.contexts ?? d.raw_contexts ?? [];
      ctxs.forEach(c => {
        ctxCounts[c] = (ctxCounts[c] || 0) + 1;
        if (!ctxTraits[c]) ctxTraits[c] = { openness: [], conscientiousness: [], extraversion: [], agreeableness: [], emotional_stability: [] };
        ctxTraits[c].openness.push(d.openness);
        ctxTraits[c].conscientiousness.push(d.conscientiousness);
        ctxTraits[c].extraversion.push(d.extraversion);
        ctxTraits[c].agreeableness.push(d.agreeableness);
        ctxTraits[c].emotional_stability.push(d.emotional_stability);
      });
    });

    const sorted = Object.entries(ctxCounts).sort((a, b) => b[1] - a[1]).slice(0, 12);
    const ctxList = sorted.map(([c]) => c);

    // matrix[context][trait] = avg score
    const mat: Record<string, Record<string, number>> = {};
    let mx = 0;
    ctxList.forEach(ctx => {
      mat[ctx] = {};
      TRAIT_CONFIG.forEach(t => {
        const vals = ctxTraits[ctx][t.key];
        const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        mat[ctx][t.key] = avg;
        if (avg > mx) mx = avg;
      });
    });

    return { contextList: ctxList, matrix: mat, maxVal: mx };
  }, [demoData]);

  const cellW = 60;
  const cellH = 32;
  const labelW = 100;
  const labelH = 50;
  const svgW = labelW + TRAIT_CONFIG.length * cellW + 10;
  const svgH = labelH + contextList.length * cellH + 10;

  useGSAP(() => {
    if (!containerRef.current) return;
    const cells = containerRef.current.querySelectorAll('rect[data-cell]');
    gsap.fromTo(cells, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out', stagger: { each: 0.02, from: 'start' } });
  }, { scope: containerRef, dependencies: [demoData] });

  if (contextList.length === 0) {
    return (
      <EmptyState
        title="No context patterns yet."
        body="Tag a context (Work, Home, Social…) when you complete pulses. After a few, this heatmap shows how your traits shift by situation."
      />
    );
  }

  return (
    <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
      <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} style={{ minWidth: svgW, display: 'block' }}>
        <g ref={containerRef}>
          {TRAIT_CONFIG.map((t, ci) => (
            <text
              key={t.key}
              x={labelW + ci * cellW + cellW / 2}
              y={labelH - 8}
              textAnchor="middle"
              fontSize={9}
              fill="var(--color-text-muted)"
              fontFamily="var(--font-mono)"
              style={{ textTransform: "uppercase" }}
            >
              {t.label.slice(0, 4)}
            </text>
          ))}

          {/* Context rows + cells */}
          {contextList.map((ctx, ri) => (
            <g key={ctx}>
              <text
                x={labelW - 8}
                y={labelH + ri * cellH + cellH / 2 + 3}
                textAnchor="end"
                fontSize={10}
                fill="var(--color-text-muted)"
                fontFamily="var(--font-sans)"
              >
                {ctx.length > 14 ? ctx.slice(0, 13) + '…' : ctx}
              </text>
              {TRAIT_CONFIG.map((t, ci) => {
                const val = matrix[ctx][t.key];
                const opacity = val / 100;
                return (
                  <g key={t.key}>
                    <rect
                      data-cell
                      x={labelW + ci * cellW}
                      y={labelH + ri * cellH}
                      width={cellW - 2}
                      height={cellH - 2}
                      fill={t.color}
                      fillOpacity={opacity * 0.6 + 0.05}
                      rx={3}
                    />
                    <text
                      x={labelW + ci * cellW + cellW / 2}
                      y={labelH + ri * cellH + cellH / 2 + 3}
                      textAnchor="middle"
                      fontSize={10}
                      fill="var(--color-text)"
                      fontFamily="var(--font-mono)"
                    >
                      {val.toFixed(0)}
                    </text>
                  </g>
                );
              })}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

// ── Context Variance Bar Chart ───────────────────────────────────
function VarianceChart({ demoData }: { demoData: DemoPulse[] }) {
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  const varianceData = useMemo(() => {
    const traitVals: Record<string, number[]> = {
      openness: [], conscientiousness: [], extraversion: [], agreeableness: [], emotional_stability: [],
    };
    demoData.forEach(d => {
      traitVals.openness.push(d.openness);
      traitVals.conscientiousness.push(d.conscientiousness);
      traitVals.extraversion.push(d.extraversion);
      traitVals.agreeableness.push(d.agreeableness);
      traitVals.emotional_stability.push(d.emotional_stability);
    });

    return TRAIT_CONFIG.map(t => {
      const vals = traitVals[t.key];
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length;
      const std = Math.sqrt(variance);
      return { ...t, std, mean };
    }).sort((a, b) => b.std - a.std);
  }, [demoData]);

  const maxStd = Math.max(...varianceData.map(v => v.std), 1);

  useGSAP(() => {
    barRefs.current.forEach((el, i) => {
      if (el) {
        gsap.fromTo(el, { width: '0%' }, { width: `${(varianceData[i].std / maxStd) * 100}%`, duration: 0.8, ease: 'power2.out', delay: i * 0.1 });
      }
    });
  }, { dependencies: [varianceData] });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {varianceData.map((v, i) => (
        <div key={v.key}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              letterSpacing: '0.08em', color: 'var(--color-text-muted)',
            }}>
              {v.label}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text)' }}>
              σ={v.std.toFixed(1)}
            </span>
          </div>
          <div style={{ height: '6px', background: 'var(--color-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              ref={el => { barRefs.current[i] = el; }}
              style={{ height: '100%', width: '0%', background: v.color, borderRadius: '3px' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Stress Delta Chart ───────────────────────────────────────────
function StressDeltaChart({ demoData }: { demoData: DemoPulse[] }) {
  const containerRef = useRef<SVGGElement>(null);

  const { highData, lowData } = useMemo(() => {
    const stressValues = demoData.filter(d => d.diamonds && d.diamonds.stress !== undefined);
    if (stressValues.length === 0) return { highData: null, lowData: null };

    const median = stressValues
      .map(d => d.diamonds!.stress)
      .sort((a, b) => a - b)[Math.floor(stressValues.length / 2)];

    const high = stressValues.filter(d => (d.diamonds!.stress ?? 0) >= median);
    const low = stressValues.filter(d => (d.diamonds!.stress ?? 0) < median);

    const avg = (arr: typeof high) => {
      if (arr.length === 0) return null;
      const result: Record<string, number> = {};
      TRAIT_CONFIG.forEach(t => {
        const key = t.key as keyof DemoPulse;
        const vals = arr.map(d => d[key] as number);
        result[t.key] = vals.reduce((a, b) => a + b, 0) / vals.length;
      });
      return result;
    };

    return { highData: avg(high), lowData: avg(low) };
  }, [demoData]);

  if (!highData || !lowData) return null;

  const width = 360;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const traitKeys = TRAIT_CONFIG.map(t => t.key);
  const groupW = chartW / traitKeys.length;
  const barW = groupW * 0.3;
  const gap = 4;

  useGSAP(() => {
    if (!containerRef.current) return;
    const bars = containerRef.current.querySelectorAll('rect[data-stress-bar]');
    gsap.fromTo(bars, { scaleY: 0, transformOrigin: 'bottom' }, { scaleY: 1, duration: 0.6, ease: 'power2.out', stagger: 0.05 });
  }, { scope: containerRef });

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
      <g ref={containerRef}>
        {/* Y axis */}
        {[0, 25, 50, 75, 100].map(v => (
          <g key={v}>
            <line x1={padding.left} y1={padding.top + chartH - (v / 100) * chartH} x2={padding.left + chartW} y2={padding.top + chartH - (v / 100) * chartH} stroke="var(--color-grid)" strokeWidth={1} opacity={0.3} />
            <text x={padding.left - 6} y={padding.top + chartH - (v / 100) * chartH + 3} textAnchor="end" fontSize={9} fill="var(--color-text-dim)" fontFamily="var(--font-mono)">{v}</text>
          </g>
        ))}

        {/* Bars */}
        {traitKeys.map((key, i) => {
          const groupX = padding.left + i * groupW;
          const highVal = highData[key];
          const lowVal = lowData[key];
          const highH = (highVal / 100) * chartH;
          const lowH = (lowVal / 100) * chartH;

          return (
            <g key={key}>
              <rect data-stress-bar x={groupX + groupW / 2 - barW - gap / 2} y={padding.top + chartH - lowH} width={barW} height={lowH} fill="var(--color-success)" fillOpacity={0.6} rx={2} />
              <rect data-stress-bar x={groupX + groupW / 2 + gap / 2} y={padding.top + chartH - highH} width={barW} height={highH} fill="var(--color-danger)" fillOpacity={0.6} rx={2} />
              <text x={groupX + groupW / 2} y={height - 10} textAnchor="middle" fontSize={9} fill="var(--color-text-dim)" fontFamily="var(--font-mono)">
                {TRAIT_CONFIG[i].label.slice(0, 4)}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <rect x={padding.left + chartW - 80} y={4} width={8} height={8} fill="var(--color-success)" fillOpacity={0.6} rx={1} />
        <text x={padding.left + chartW - 68} y={12} fontSize={9} fill="var(--color-text-dim)" fontFamily="var(--font-mono)">Low stress</text>
        <rect x={padding.left + chartW - 80} y={16} width={8} height={8} fill="var(--color-danger)" fillOpacity={0.6} rx={1} />
        <text x={padding.left + chartW - 68} y={24} fontSize={9} fill="var(--color-text-dim)" fontFamily="var(--font-mono)">High stress</text>
      </g>
    </svg>
  );
}

// ── DIAMONDS Dimensions Grid ─────────────────────────────────────
function DiamondsGrid({ demoData }: { demoData: DemoPulse[] }) {
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  const dims = useMemo(() => {
    const agg: Record<string, number[]> = {};
    demoData.forEach(d => {
      if (d.diamonds) {
        for (const [k, v] of Object.entries(d.diamonds)) {
          if (!agg[k]) agg[k] = [];
          agg[k].push(v);
        }
      }
    });
    return Object.entries(agg).map(([dim, values]) => ({
      dim,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      high: values.filter(v => v >= 5).length,
      low: values.filter(v => v < 5).length,
      total: values.length,
    })).sort((a, b) => b.avg - a.avg);
  }, [demoData]);

  useGSAP(() => {
    barRefs.current.forEach((el, i) => {
      if (el) {
        gsap.fromTo(el, { width: '0%' }, { width: `${(dims[i].avg / 10) * 100}%`, duration: 0.8, ease: 'power2.out', delay: i * 0.05 });
      }
    });
  }, { dependencies: [dims] });

  if (dims.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {dims.map((d, i) => (
        <div key={d.dim}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              letterSpacing: '0.08em', color: 'var(--color-text-muted)',
            }}>
              {d.dim}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text)' }}>
              {d.avg.toFixed(1)}
            </span>
          </div>
          <div style={{ height: '5px', background: 'var(--color-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
            <div
              ref={el => { barRefs.current[i] = el; }}
              style={{ height: '100%', width: '0%', background: 'var(--color-accent)', borderRadius: '3px' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Context Tag Chips ────────────────────────────────────────────
function ContextTags({ demoData }: { demoData: DemoPulse[] }) {
  const tags = useMemo(() => {
    const counts: Record<string, number> = {};
    demoData.forEach(d => {
      const ctxs = d.contexts ?? d.raw_contexts ?? [];
      ctxs.forEach(c => { counts[c] = (counts[c] || 0) + 1; });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [demoData]);

  if (tags.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {tags.map(([tag, count]) => (
        <span key={tag} style={{
          padding: '5px 12px', background: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border)', borderRadius: '14px',
          fontFamily: 'var(--font-mono)', fontSize: '11px',
          color: 'var(--color-text-muted)',
        }}>
          {tag} <span style={{ color: 'var(--color-text-dim)' }}>·{count}</span>
        </span>
      ))}
    </div>
  );
}

export function ContextView({ demoData, baseline, dataSource }: ContextViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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
    return (
      <div ref={containerRef}>
        {/* ── Heatmap + Variance ─────────────────────────── */}
        <div className="atlas-grid-auto" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '20px',
        }}>
          <Card
            label="03 · Context"
            title="Context Heatmap"
            subtitle="Average trait scores by context"
            data-anim
          >
            <ContextHeatmap demoData={demoData} />
          </Card>

          <Card
            label="Variance"
            title="Trait Flexibility"
            subtitle="Which traits flex most across contexts"
            data-anim
          >
            <VarianceChart demoData={demoData} />
          </Card>
        </div>

        {/* ── Stress Delta + DIAMONDS ────────────────────── */}
        <div className="atlas-grid-auto" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '20px',
        }}>
          <Card
            label="Stress"
            title="Stress Delta"
            subtitle="How traits shift under high vs low stress"
            data-anim
          >
            <StressDeltaChart demoData={demoData} />
          </Card>

          <Card
            label="DIAMONDS"
            title="Situational Dimensions"
            subtitle="Average scores across 8 situational factors"
            data-anim
          >
            <DiamondsGrid demoData={demoData} />
          </Card>
        </div>

        {/* ── Context Tags ───────────────────────────────── */}
        <Card
          label="Raw Contexts"
          title="Context Tags"
          subtitle="Frequency of situational contexts across all pulses"
          data-anim
        >
          <ContextTags demoData={demoData} />
        </Card>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // USER MODE (baseline + pulses)
  // ═══════════════════════════════════════════════════════════════
  if (!baseline) return null;

  const contextAnswers = baseline.scores?.context;

  return (
    <div ref={containerRef}>
      {contextAnswers && Object.keys(contextAnswers).length > 0 ? (
        <Card
          label="03 · Context"
          title="Baseline Context"
          subtitle="Your self-reported situational context at baseline"
          data-anim
        >
          <div className="atlas-grid-auto" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
          }}>
            {Object.entries(contextAnswers).map(([key, value]) => (
              <div key={key} style={{
                padding: '16px', background: 'var(--color-surface-elevated)',
                borderRadius: '8px',
              }}>
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px',
                  letterSpacing: '0.08em', color: 'var(--color-text-dim)', marginBottom: '8px',
                }}>
                  {key.replace(/_/g, ' ')}
                </p>
                <p style={{
                  fontFamily: 'var(--font-sans)', fontSize: '15px',
                  color: 'var(--color-text)', fontWeight: 500,
                }}>
                  {String(value)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card label="03 · Context" title="Baseline Context" data-anim>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: 1.6,
            color: 'var(--color-text-muted)',
          }}>
            No context data recorded in your baseline assessment.
          </p>
        </Card>
      )}

      {/* Placeholder for future context patterns */}
      <div style={{ marginTop: '20px' }} data-anim>
        <Card label="Pending" title="Context patterns appear with more pulses.">
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: 1.6,
            color: 'var(--color-text-muted)', maxWidth: '480px',
          }}>
            As you complete weekly pulses, context heatmaps, variance, stress levels, and DIAMONDS dimensions will emerge to reveal how different situations shape your personality expression.
          </p>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InfoTooltip text="DIAMONDS is a framework for characterizing situations along 8 dimensions: Diversity, Novelty, Depth, Adversity, Deception, Sociality, Stress, and Performance." />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-muted)',
            }}>
              What is DIAMONDS?
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
