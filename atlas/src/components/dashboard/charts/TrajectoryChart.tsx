import { useRef, useState, useMemo, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import * as d3 from 'd3';
import type { TrajectoryPoint, BigFiveScores } from '../../../types';

// ── Trait metadata ──────────────────────────────────────────────
interface TraitMeta {
  key: keyof BigFiveScores;
  short: string;
  label: string;
  cssVar: string;
}

const TRAITS: TraitMeta[] = [
  { key: 'openness',            short: 'O',  label: 'Openness',            cssVar: '--color-openness' },
  { key: 'conscientiousness',    short: 'C',  label: 'Conscientiousness',    cssVar: '--color-conscientiousness' },
  { key: 'extraversion',         short: 'E',  label: 'Extraversion',         cssVar: '--color-extraversion' },
  { key: 'agreeableness',        short: 'A',  label: 'Agreeableness',        cssVar: '--color-agreeableness' },
  { key: 'emotional_stability',  short: 'ES', label: 'Emotional Stability',  cssVar: '--color-stability' },
];

// ── Helper: read CSS variable ───────────────────────────────────
function cssVar(name: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// ── Props ───────────────────────────────────────────────────────
interface TrajectoryChartProps {
  data: TrajectoryPoint[];
  onScrub?: (index: number) => void;
}

// ── Chart dimensions ────────────────────────────────────────────
const WIDTH = 760;
const HEIGHT = 360;
const MARGIN = { top: 24, right: 32, bottom: 48, left: 48 };
const INNER_W = WIDTH - MARGIN.left - MARGIN.right;
const INNER_H = HEIGHT - MARGIN.top - MARGIN.bottom;

// ── Tooltip state ───────────────────────────────────────────────
interface TooltipState {
  x: number;
  y: number;
  index: number;
  point: TrajectoryPoint;
}

// ── Component ───────────────────────────────────────────────────
export default function TrajectoryChart({ data, onScrub }: TrajectoryChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<(SVGPathElement | null)[]>([]);
  const [colors, setColors] = useState<Record<string, string>>({});
  const [visibleTraits, setVisibleTraits] = useState<Set<keyof BigFiveScores>>(
    new Set(TRAITS.map((t) => t.key)),
  );
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [scrubIndex, setScrubIndex] = useState<number>(-1);

  // Read CSS variables on mount / theme change
  useGSAP(() => {
    const c: Record<string, string> = {};
    for (const t of TRAITS) c[t.key] = cssVar(t.cssVar);
    setColors(c);
  }, { scope: containerRef });

  // ── Scales ────────────────────────────────────────────────────
  const dates = useMemo(() => data.map((d) => new Date(d.date)), [data]);

  const xScale = useMemo(() => {
    if (dates.length === 0) return d3.scaleTime().range([0, INNER_W]);
    return d3
      .scaleTime()
      .domain(d3.extent(dates) as [Date, Date])
      .range([0, INNER_W]);
  }, [dates]);

  const yScale = useMemo(
    () => d3.scaleLinear().domain([0, 100]).range([INNER_H, 0]),
    [],
  );

  // ── Line generators ────────────────────────────────────────────
  const lineGens = useMemo(() => {
    const gens: Partial<Record<keyof BigFiveScores, d3.Line<TrajectoryPoint>>> = {};
    for (const t of TRAITS) {
      gens[t.key] = d3
        .line<TrajectoryPoint>()
        .x((d) => xScale(new Date(d.date)))
        .y((d) => yScale(d.scores[t.key]))
        .curve(d3.curveMonotoneX);
    }
    return gens;
  }, [xScale, yScale]);

  // ── Generate path strings ─────────────────────────────────────
  const paths = useMemo(() => {
    const result: Partial<Record<keyof BigFiveScores, string>> = {};
    for (const t of TRAITS) {
      const gen = lineGens[t.key];
      if (gen) result[t.key] = gen(data) ?? '';
    }
    return result;
  }, [lineGens, data]);

  // ── Y-axis ticks ─────────────────────────────────────────────
  const yTicks = useMemo(() => yScale.ticks(5), [yScale]);

  // ── X-axis ticks (up to ~8) ──────────────────────────────────
  const xTicks = useMemo(() => {
    if (dates.length <= 1) return dates;
    const tickCount = Math.min(8, dates.length);
    return d3
      .scaleTime()
      .domain(d3.extent(dates) as [Date, Date])
      .range([0, INNER_W])
      .ticks(tickCount);
  }, [dates]);

  // ── GSAP entrance: lines draw left→right ─────────────────────
  useGSAP(() => {
    const valid = linesRef.current.filter(Boolean) as SVGPathElement[];
    if (!valid.length) return;

    valid.forEach((path) => {
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    });

    gsap.to(valid, {
      strokeDashoffset: 0,
      duration: 1.2,
      ease: 'power2.out',
      stagger: 0.12,
    });
  }, { scope: containerRef, dependencies: [paths, visibleTraits] });

  // ── Find nearest data index from mouse X ─────────────────────
  const findNearestIndex = useCallback(
    (mouseX: number): number => {
      if (data.length === 0) return -1;
      // mouseX is relative to inner chart area (0..INNER_W)
      const date = xScale.invert(mouseX);
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let i = 0; i < data.length; i++) {
        const d = new Date(data[i].date);
        const dist = Math.abs(d.getTime() - date.getTime());
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }
      return bestIdx;
    },
    [data, xScale],
  );

  // ── Mouse handlers ───────────────────────────────────────────
  const handleMouseMove = useCallback(
    (evt: React.MouseEvent<SVGSVGElement>) => {
      const svg = evt.currentTarget;
      const rect = svg.getBoundingClientRect();
      const scaleX = WIDTH / rect.width;
      const mx = (evt.clientX - rect.left) * scaleX - MARGIN.left;
      const my = (evt.clientY - rect.top) * (HEIGHT / rect.height) - MARGIN.top;
      const idx = findNearestIndex(mx);
      if (idx >= 0) {
        const pt = data[idx];
        const px = xScale(new Date(pt.date));
        setTooltip({ x: px + MARGIN.left, y: my + MARGIN.top, index: idx, point: pt });
      }
    },
    [data, findNearestIndex, xScale],
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const handleClick = useCallback(
    (evt: React.MouseEvent<SVGSVGElement>) => {
      const svg = evt.currentTarget;
      const rect = svg.getBoundingClientRect();
      const scaleX = WIDTH / rect.width;
      const mx = (evt.clientX - rect.left) * scaleX - MARGIN.left;
      const idx = findNearestIndex(mx);
      if (idx >= 0) {
        setScrubIndex(idx);
        onScrub?.(idx);
      }
    },
    [findNearestIndex, onScrub],
  );

  // ── Toggle trait ─────────────────────────────────────────────
  const toggleTrait = useCallback((key: keyof BigFiveScores) => {
    setVisibleTraits((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // ── Scrub indicator position ─────────────────────────────────
  const scrubX = scrubIndex >= 0 && scrubIndex < data.length
    ? xScale(new Date(data[scrubIndex].date)) + MARGIN.left
    : null;

  // ── Date formatting ──────────────────────────────────────────
  const fmtDate = useCallback((d: Date) => {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  return (
    <div ref={containerRef} className="trajectory-chart-container w-full">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-3">
        {TRAITS.map((t) => {
          const active = visibleTraits.has(t.key);
          const color = colors[t.key] || cssVar(t.cssVar) || '#888';
          return (
            <button
              key={t.key}
              onClick={() => toggleTrait(t.key)}
              className="flex items-center gap-1.5 text-xs cursor-pointer transition-opacity"
              style={{ opacity: active ? 1 : 0.35 }}
            >
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)' }}>
                {t.short} — {t.label}
              </span>
            </button>
          );
        })}
      </div>

      <svg
        width="100%"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        role="img"
        aria-label="Big Five personality trajectory chart"
        style={{ display: 'block' }}
      >
        {/* ── Y grid lines + labels ─────────────────────────── */}
        {yTicks.map((tick) => {
          const y = yScale(tick) + MARGIN.top;
          return (
            <g key={`y-${tick}`}>
              <line
                x1={MARGIN.left}
                y1={y}
                x2={WIDTH - MARGIN.right}
                y2={y}
                stroke="var(--color-grid)"
                strokeWidth={1}
                opacity={0.4}
              />
              <text
                x={MARGIN.left - 8}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                fill="var(--color-text-dim)"
                fontSize={10}
                fontFamily="var(--font-mono)"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* ── X axis labels ─────────────────────────────────── */}
        {xTicks.map((tick, i) => {
          const x = xScale(tick) + MARGIN.left;
          return (
            <text
              key={`x-${i}`}
              x={x}
              y={HEIGHT - MARGIN.bottom + 18}
              textAnchor="middle"
              fill="var(--color-text-dim)"
              fontSize={10}
              fontFamily="var(--font-mono)"
            >
              {fmtDate(tick)}
            </text>
          );
        })}

        {/* ── Lines ─────────────────────────────────────────── */}
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {TRAITS.map((t, i) => {
            if (!visibleTraits.has(t.key)) return null;
            const color = colors[t.key] || cssVar(t.cssVar) || '#888';
            return (
              <path
                key={t.key}
                ref={(el) => { linesRef.current[i] = el; }}
                d={paths[t.key] ?? ''}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            );
          })}
        </g>

        {/* ── Point markers ─────────────────────────────────── */}
        {data.map((pt, idx) => {
          const x = xScale(new Date(pt.date)) + MARGIN.left;
          const isBaseline = pt.type === 'baseline';
          return (
            <g key={`pt-${idx}`}>
              {TRAITS.map((t) => {
                if (!visibleTraits.has(t.key)) return null;
                const color = colors[t.key] || cssVar(t.cssVar) || '#888';
                const py = yScale(pt.scores[t.key]) + MARGIN.top;
                if (isBaseline) {
                  // Diamond marker
                  const s = 5;
                  return (
                    <rect
                      key={t.key}
                      x={x - s}
                      y={py - s}
                      width={s * 2}
                      height={s * 2}
                      transform={`rotate(45 ${x} ${py})`}
                      fill="var(--color-surface)"
                      stroke={color}
                      strokeWidth={2}
                    />
                  );
                }
                // Pulse = circle
                return (
                  <circle
                    key={t.key}
                    cx={x}
                    cy={py}
                    r={3.5}
                    fill="var(--color-surface)"
                    stroke={color}
                    strokeWidth={2}
                  />
                );
              })}
            </g>
          );
        })}

        {/* ── Scrub indicator ──────────────────────────────── */}
        {scrubX !== null && (
          <line
            x1={scrubX}
            y1={MARGIN.top}
            x2={scrubX}
            y2={HEIGHT - MARGIN.bottom}
            stroke="var(--color-accent)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            opacity={0.8}
          />
        )}

        {/* ── Tooltip ──────────────────────────────────────── */}
        {tooltip && (
          <foreignObject
            x={Math.min(tooltip.x + 12, WIDTH - 180)}
            y={Math.max(tooltip.y - 60, 4)}
            width={168}
            height={120}
            style={{ pointerEvents: 'none', overflow: 'visible' }}
          >
            <div
              style={{
                background: 'var(--color-tooltip-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 6,
                padding: '8px 10px',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--color-text)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4, fontFamily: 'var(--font-sans)' }}>
                {fmtDate(new Date(tooltip.point.date))}
              </div>
              {TRAITS.map((t) => (
                <div key={t.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ color: colors[t.key] || cssVar(t.cssVar) || '#888' }}>
                    {t.short}
                  </span>
                  <span>{tooltip.point.scores[t.key]}</span>
                </div>
              ))}
            </div>
          </foreignObject>
        )}
      </svg>
    </div>
  );
}
