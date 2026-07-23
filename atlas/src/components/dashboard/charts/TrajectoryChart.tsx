import { useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import * as d3 from 'd3';
import type { TrajectoryPoint, BigFiveScores } from '../../../types';
import { useDashboardState } from '../../../state/DashboardContext';

// ── Trait metadata ──────────────────────────────────────────────
interface TraitMeta {
  key: keyof BigFiveScores;
  short: string;
  label: string;
  cssVar: string;
}

const TRAITS: TraitMeta[] = [
  { key: 'openness',           short: 'O',   label: 'Openness',            cssVar: '--color-openness' },
  { key: 'conscientiousness',  short: 'C',   label: 'Conscientiousness',   cssVar: '--color-conscientiousness' },
  { key: 'extraversion',       short: 'E',   label: 'Extraversion',        cssVar: '--color-extraversion' },
  { key: 'agreeableness',      short: 'A',   label: 'Agreeableness',       cssVar: '--color-agreeableness' },
  { key: 'emotional_stability', short: 'ES', label: 'Emotional Stability', cssVar: '--color-stability' },
];

// ── Emotion metadata ─────────────────────────────────────────────
interface EmotionMeta {
  key: string;
  short: string;
  label: string;
  color: string;
  group: 'positive' | 'neutral' | 'negative';
}

const EMOTIONS: EmotionMeta[] = [
  { key: 'happy',      short: 'Hap',  label: 'Happy',      color: '#e8b884', group: 'positive' },
  { key: 'content',    short: 'Con',  label: 'Content',    color: '#d4a574', group: 'positive' },
  { key: 'excited',    short: 'Exc',  label: 'Excited',    color: '#f0c896', group: 'positive' },
  { key: 'proud',      short: 'Prd',  label: 'Proud',      color: '#c4a06a', group: 'positive' },
  { key: 'purposeful', short: 'Pur',  label: 'Purposeful', color: '#d4b884', group: 'positive' },
  { key: 'attentive',  short: 'Att',  label: 'Attentive',  color: '#a89a87', group: 'neutral' },
  { key: 'goaldir',    short: 'Goal', label: 'Goal-Dir',  color: '#8a8a7a', group: 'neutral' },
  { key: 'guilty',     short: 'Glt',  label: 'Guilty',     color: '#c97757', group: 'negative' },
  { key: 'angry',      short: 'Ang',  label: 'Angry',      color: '#d98a6a', group: 'negative' },
  { key: 'afraid',     short: 'Afr',  label: 'Afraid',     color: '#b86747', group: 'negative' },
];

// ── Phase metadata (for demo data with day-based phases) ─────────
interface Phase {
  startDay: number;
  endDay: number;
  label: string;
  desc: string;
  color: string;
}

const DEMO_PHASES: Phase[] = [
  { startDay: 0,  endDay: 11, label: 'Semester',  desc: 'Active daily sampling during lecture period', color: '#7ba89b' },
  { startDay: 12, endDay: 16, label: 'Christmas',  desc: 'Christmas break — data becomes sparse',         color: '#c4a96a' },
  { startDay: 17, endDay: 27, label: 'Holiday',    desc: 'New Year holiday — irregular reporting',       color: '#d4a574' },
  { startDay: 28, endDay: 42, label: 'Exams',      desc: 'Exam period — sharp drop in reporting',        color: '#c97757' },
];

// ── Helper: read CSS variable ────────────────────────────────────
function cssVar(name: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// ── Props ────────────────────────────────────────────────────────
interface TrajectoryChartProps {
  data: TrajectoryPoint[];
  onScrub?: (index: number) => void;
}

// ── Chart dimensions ─────────────────────────────────────────────
const WIDTH = 760;
const HEIGHT = 340;
const MARGIN = { top: 20, right: 28, bottom: 40, left: 44 };
const INNER_W = WIDTH - MARGIN.left - MARGIN.right;
const INNER_H = HEIGHT - MARGIN.top - MARGIN.bottom;

// ── Line/marker styling ──────────────────────────────────────────
const LINE_STROKE = 1.5;
const LINE_OPACITY = 0.85;
// const POINT_RADIUS = 3;
const BASELINE_DIAMOND = 4;
const PULSE_RADIUS = 3;

// ── Tooltip state ────────────────────────────────────────────────
interface TooltipState {
  x: number;
  y: number;
  index: number;
  point: TrajectoryPoint;
}

// ── Phase info (derived from data) ───────────────────────────────
function derivePhases(data: TrajectoryPoint[]): Phase[] {
  // If data has `day` fields and spans the demo range, use DEMO_PHASES
  const hasDays = data.every(d => d.day !== undefined);
  if (hasDays && data.length > 10) {
    return DEMO_PHASES;
  }
  // For baseline data with few points, show a single "Baseline" phase
  return [{
    startDay: 0,
    endDay: Math.max(0, data.length - 1),
    label: 'Baseline',
    desc: 'Baseline assessment period',
    color: '#a89a87',
  }];
}

// ── Component ────────────────────────────────────────────────────
export default function TrajectoryChart({ data, onScrub }: TrajectoryChartProps) {
  const { trajectoryMode, setTrajectoryMode, scrubIndex, setScrubIndex } = useDashboardState();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const linesRef = useRef<(SVGPathElement | null)[]>([]);
  const pointsRef = useRef<(SVGGElement | null)[]>([]);
  const [colors, setColors] = useState<Record<string, string>>({});
  const [visibleTraits, setVisibleTraits] = useState<Set<keyof BigFiveScores>>(
    new Set(TRAITS.map(t => t.key)),
  );
  const [visibleEmotions, setVisibleEmotions] = useState<Set<string>>(
    new Set(EMOTIONS.map(e => e.key)),
  );
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);
  const [dragging, setDragging] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [smoothing, setSmoothing] = useState<'raw' | 'daily' | 'weekly'>('daily');
  const infoRef = useRef<HTMLSpanElement>(null);

  // Read CSS variables on mount / theme change
  useEffect(() => {
    const c: Record<string, string> = {};
    for (const t of TRAITS) c[t.key] = cssVar(t.cssVar);
    setColors(c);
  }, []);

  // Close info popover on outside click
  useEffect(() => {
    if (!infoOpen) return;
    const handler = (e: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
        setInfoOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [infoOpen]);

  // ── Determine active series (traits or emotions) ──────────────
  const isEmotions = trajectoryMode === 'emotions';

  // ── Smoothing: aggregate data by day or week ──────────────────
  const smoothedData = useMemo(() => {
    if (smoothing === 'raw' || data.length <= 1) return data;

    // Group by date (daily) or by week (weekly)
    const groups: Record<string, TrajectoryPoint[]> = {};
    data.forEach(d => {
      let groupKey: string;
      if (smoothing === 'daily') {
        groupKey = d.date;
      } else {
        // Weekly: group by ISO week
        const dt = new Date(d.date);
        const week = Math.floor(dt.getTime() / (7 * 24 * 60 * 60 * 1000));
        groupKey = 'w' + week;
      }
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(d);
    });

    // Average each group
    return Object.entries(groups).map(([_key, points]) => {
      const avgScores: any = {};
      for (const t of TRAITS) {
        const vals = points.map(p => p.scores[t.key]).filter(v => v != null && !isNaN(v));
        avgScores[t.key] = vals.length > 0 ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length : null;
      }
      return {
        type: points[0].type,
        date: points[0].date,
        scores: avgScores,
        contexts: points.flatMap(p => p.contexts ?? []),
        emotions: points.flatMap(p => p.emotions ?? []),
      } as TrajectoryPoint;
    });
  }, [data, smoothing]);

  // ── Scales ────────────────────────────────────────────────────
  // Use linear scale based on index — rescaled to smoothedData length
  const xScale = useMemo(() => {
    const len = smoothedData.length;
    if (len === 0) return d3.scaleLinear().range([0, INNER_W]);
    return d3.scaleLinear()
      .domain([0, Math.max(0, len - 1)])
      .range([0, INNER_W]);
  }, [smoothedData.length]);

  const yScale = useMemo(
    () => d3.scaleLinear().domain([0, 100]).range([INNER_H, 0]),
    [],
  );

  // ── Line generators (traits) ──────────────────────────────────
  const traitLineGens = useMemo(() => {
    const gens: Partial<Record<keyof BigFiveScores, d3.Line<TrajectoryPoint>>> = {};
    for (const t of TRAITS) {
      gens[t.key] = d3.line<TrajectoryPoint>()
        .defined((d) => d.scores[t.key] != null && !isNaN(d.scores[t.key]))
        .x((_d, i) => xScale(i))
        .y((d) => yScale(d.scores[t.key]))
        .curve(d3.curveCatmullRom.alpha(0.5));
    }
    return gens;
  }, [xScale, yScale]);

  // ── Line generators (emotions) ────────────────────────────────
  const emotionLineGens = useMemo(() => {
    const gens: Partial<Record<string, d3.Line<TrajectoryPoint>>> = {};
    for (const e of EMOTIONS) {
      gens[e.key] = d3.line<TrajectoryPoint>()
        .defined((d) => d.emotionScores?.[e.key] != null && !isNaN(d.emotionScores![e.key]))
        .x((_d, i) => xScale(i))
        .y((d) => yScale(d.emotionScores![e.key] ?? 0))
        .curve(d3.curveMonotoneX);
    }
    return gens;
  }, [xScale, yScale]);

  // ── Generate path strings ─────────────────────────────────────
  const traitPaths = useMemo(() => {
    const result: Partial<Record<keyof BigFiveScores, string>> = {};
    for (const t of TRAITS) {
      const gen = traitLineGens[t.key];
      if (gen) result[t.key] = gen(smoothedData) ?? '';
    }
    return result;
  }, [traitLineGens, smoothedData]);

  const emotionPaths = useMemo(() => {
    const result: Partial<Record<string, string>> = {};
    for (const e of EMOTIONS) {
      const gen = emotionLineGens[e.key];
      if (gen) result[e.key] = gen(smoothedData) ?? '';
    }
    return result;
  }, [emotionLineGens, smoothedData]);

  // ── Y-axis ticks ─────────────────────────────────────────────
  const yTicks = useMemo(() => yScale.ticks(5), [yScale]);

  // ── X-axis ticks ────────────────────────────────────────────
  // Use index-based ticks with date labels
  const xTicks = useMemo(() => {
    const len = smoothedData.length;
    if (len <= 1) return [];
    const tickCount = Math.min(8, len);
    const indices: number[] = [];
    for (let i = 0; i < tickCount; i++) {
      indices.push(Math.round((i / (tickCount - 1)) * (len - 1)));
    }
    return indices;
  }, [smoothedData.length]);

  // ── Phases ───────────────────────────────────────────────────
  const phases = useMemo(() => derivePhases(data), [data]);

  // ── GSAP entrance: lines draw left→right, then points fade in ─
  useGSAP(() => {
    const validLines = linesRef.current.filter(Boolean) as SVGPathElement[];
    if (!validLines.length) return;

    // Set initial state
    validLines.forEach(path => {
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    });

    // Animate lines
    const tl = gsap.timeline();
    tl.to(validLines, {
      strokeDashoffset: 0,
      duration: 1.0,
      ease: 'power2.out',
      stagger: 0.08,
    });

    // After lines complete, fade in points with stagger
    const pointGroups = pointsRef.current.filter(Boolean) as SVGGElement[];
    if (pointGroups.length) {
      tl.from(pointGroups, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
        stagger: 0.02,
      }, '-=0.2');
    }
  }, { scope: containerRef, dependencies: [traitPaths, emotionPaths, trajectoryMode, visibleTraits, visibleEmotions] });

  // ── Find nearest data index from mouse X ─────────────────────
  const findNearestIndex = useCallback(
    (mouseX: number): number => {
      if (data.length === 0) return -1;
      const idx = Math.round(xScale.invert(mouseX));
      const bestIdx = Math.max(0, Math.min(data.length - 1, idx));
      return bestIdx;
    },
    [data, xScale],
  );

  // ── Mouse handlers (tooltip + click-to-scrub) ─────────────────
  const handleMouseMove = useCallback(
    (evt: React.MouseEvent<SVGSVGElement>) => {
      const svg = evt.currentTarget;
      const rect = svg.getBoundingClientRect();
      const scaleX = WIDTH / rect.width;
      const scaleY = HEIGHT / rect.height;
      const mx = (evt.clientX - rect.left) * scaleX - MARGIN.left;
      const my = (evt.clientY - rect.top) * scaleY - MARGIN.top;
      const idx = findNearestIndex(mx);
      if (idx >= 0) {
        const pt = data[idx];
        const ptIdx = data.indexOf(pt); const px = xScale(ptIdx);
        setTooltip({ x: px + MARGIN.left, y: my + MARGIN.top, index: idx, point: pt });
        setHoveredIndex(idx);
      }
    },
    [data, findNearestIndex, xScale],
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
    setHoveredIndex(-1);
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
    [findNearestIndex, onScrub, setScrubIndex],
  );

  // ── Toggle trait/emotion visibility ──────────────────────────
  const toggleTrait = useCallback((key: keyof BigFiveScores) => {
    setVisibleTraits(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  const toggleEmotion = useCallback((key: string) => {
    setVisibleEmotions(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  // ── Scrub indicator position ─────────────────────────────────
  const currentScrubIndex = scrubIndex >= 0 && scrubIndex < smoothedData.length ? scrubIndex : -1;
  const scrubX = currentScrubIndex >= 0
    ? xScale(currentScrubIndex) + MARGIN.left
    : null;

  // ── Date formatting ──────────────────────────────────────────
  const fmtDate = useCallback((d: Date) => {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, []);

  const fmtDateLong = useCallback((d: Date) => {
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }, []);

  // ── Scrubber drag handlers ───────────────────────────────────
  const scrubberTrackRef = useRef<HTMLDivElement>(null);

  const pctToIndex = useCallback((pct: number): number => {
    if (data.length <= 1) return 0;
    return Math.max(0, Math.min(data.length - 1, Math.round(pct * (data.length - 1))));
  }, [data.length]);

  const handleScrubberClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const track = e.currentTarget;
    const rect = track.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const idx = pctToIndex(pct);
    setScrubIndex(idx);
    onScrub?.(idx);
  }, [pctToIndex, onScrub, setScrubIndex]);

  // Document-level drag listeners
  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e: MouseEvent) => {
      const track = scrubberTrackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const idx = pctToIndex(pct);
      setScrubIndex(idx);
      onScrub?.(idx);
    };
    const handleUp = () => setDragging(false);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [dragging, pctToIndex, onScrub, setScrubIndex]);

  const scrubberPct = currentScrubIndex >= 0 && smoothedData.length > 1
    ? (currentScrubIndex / (smoothedData.length - 1)) * 100
    : 0;

  // ── Active series for current mode ───────────────────────────
  // (restored for future use — currently using inline maps)

  // ── Get color for a series key ────────────────────────────────
  // (restored for future use — currently using inline maps)

  // ── Tooltip content: all trait scores or all emotion scores ──
  const tooltipEntries = useMemo(() => {
    if (!tooltip) return [];
    if (isEmotions) {
      return EMOTIONS.map(e => ({
        short: e.short,
        color: e.color,
        value: tooltip.point.emotionScores?.[e.key] ?? '—',
      }));
    }
    return TRAITS.map(t => ({
      short: t.short,
      color: colors[t.key] || cssVar(t.cssVar) || '#888',
      value: tooltip.point.scores[t.key] != null ? (typeof tooltip.point.scores[t.key] === 'number' ? tooltip.point.scores[t.key].toFixed(0) : tooltip.point.scores[t.key]) : '—',
    }));
  }, [tooltip, isEmotions, colors]);

  return (
    <div ref={containerRef} className="trajectory-chart-container w-full">
      {/* ── Header: Title + ⓘ + Traits/Emotions toggle ──────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '12px', flexWrap: 'wrap', gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase',
            letterSpacing: '0.12em', color: 'var(--color-text-dim)',
          }}>
            {isEmotions ? 'Emotion Trajectory' : 'Trait Trajectory'}
          </span>
          <span ref={infoRef} style={{ position: 'relative', display: 'inline-flex' }}>
            <button
              onClick={() => setInfoOpen(o => !o)}
              aria-label="Chart info"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '16px', height: '16px', borderRadius: '50%',
                border: '1px solid var(--color-border)', background: 'var(--color-surface)',
                color: 'var(--color-text-dim)', fontSize: '10px', cursor: 'pointer',
                padding: 0, lineHeight: 1, fontFamily: 'var(--font-sans)',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
                e.currentTarget.style.color = 'var(--color-accent)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.color = 'var(--color-text-dim)';
              }}
            >
              ⓘ
            </button>
            {infoOpen && (
              <span style={{
                position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
                borderRadius: '6px', padding: '10px 14px', maxWidth: '260px',
                fontFamily: 'var(--font-sans)', fontSize: '11px', lineHeight: 1.5,
                color: 'var(--color-text-muted)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                zIndex: 100, whiteSpace: 'normal', textAlign: 'left',
              }}>
                <p style={{ marginBottom: '6px' }}>
                  {isEmotions
                    ? 'Lines show daily emotion scores across the timeline. Each emotion is tracked independently.'
                    : 'Lines show Big Five trait scores over time. Colors map to traits (see legend).'}
                </p>
                <p style={{ marginBottom: '6px' }}>
                  The scrubber below lets you move through time. Phase bands mark natural periods.
                </p>
                <p style={{ color: 'var(--color-warning)' }}>
                  This is descriptive, not a clinical assessment. It shows how traits move over time.
                </p>
                <span style={{
                  position: 'absolute', top: '100%', left: '50%',
                  transform: 'translateX(-50%)', width: 0, height: 0,
                  borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
                  borderTop: '6px solid var(--color-border)',
                }} />
              </span>
            )}
          </span>
        </div>

        {/* ── Traits / Emotions pill toggle ────────────────── */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{
            display: 'flex', gap: 0,
            border: '1px solid var(--color-border)', borderRadius: '3px', overflow: 'hidden',
          }}>
            {(['traits', 'emotions'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setTrajectoryMode(mode)}
                style={{
                  background: trajectoryMode === mode ? 'var(--color-accent)' : 'var(--color-surface)',
                  color: trajectoryMode === mode ? 'var(--color-bg)' : 'var(--color-text-dim)',
                  border: 'none', fontFamily: 'var(--font-mono)', fontSize: '10px',
                  letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 12px',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {mode === 'traits' ? 'Traits' : 'Emotions'}
              </button>
            ))}
          </div>

          {/* ── Smoothing toggle ─────────────────────────────── */}
          {data.length > 10 && (
            <div style={{
              display: 'flex', gap: 0,
              border: '1px solid var(--color-border)', borderRadius: '3px', overflow: 'hidden',
            }}>
              {(['raw', 'daily', 'weekly'] as const).map(sm => (
                <button
                  key={sm}
                  onClick={() => setSmoothing(sm)}
                  style={{
                    background: smoothing === sm ? 'var(--color-accent)' : 'var(--color-surface)',
                    color: smoothing === sm ? 'var(--color-bg)' : 'var(--color-text-dim)',
                    border: 'none', fontFamily: 'var(--font-mono)', fontSize: '10px',
                    letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 10px',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {sm === 'raw' ? 'Raw' : sm === 'daily' ? 'Daily Avg' : 'Weekly Avg'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Legend ──────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 mb-2">
        {(isEmotions ? EMOTIONS : TRAITS).map((item) => {
          const key = (item as EmotionMeta).key || (item as TraitMeta).key;
          const short = (item as EmotionMeta).short || (item as TraitMeta).short;
          const label = (item as EmotionMeta).label || (item as TraitMeta).label;
          const visible = isEmotions ? visibleEmotions.has(key) : visibleTraits.has(key as keyof BigFiveScores);
          const color = isEmotions
            ? (item as EmotionMeta).color
            : colors[key] || cssVar((item as TraitMeta).cssVar) || '#888';
          return (
            <button
              key={key}
              onClick={() => isEmotions ? toggleEmotion(key) : toggleTrait(key as keyof BigFiveScores)}
              className="flex items-center gap-1.5 text-xs cursor-pointer transition-opacity"
              style={{ opacity: visible ? 1 : 0.35 }}
            >
              <span
                className="inline-block rounded-full"
                style={{ backgroundColor: color, width: '10px', height: '10px' }}
              />
              <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)', fontSize: '11px' }}>
                {short} — {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Chart SVG ───────────────────────────────────────── */}
      <svg
        ref={svgRef}
        width="100%"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        role="img"
        aria-label={isEmotions ? 'Emotion trajectory chart' : 'Big Five personality trajectory chart'}
        style={{ display: 'block' }}
      >
        {/* ── Phase background bands ──────────────────────── */}
        <g>
          {phases.map((phase, i) => {
            const hasDays = smoothedData.every(d => d.day !== undefined);
            let x1: number, x2: number;
            if (hasDays && data.length > 10) {
              // Use day-based positioning via xScale
              const start = smoothedData.find(d => (d.day ?? 0) >= phase.startDay);
              const end = smoothedData.find(d => (d.day ?? 0) >= phase.endDay);
              x1 = start ? xScale(smoothedData.indexOf(start)) : 0;
              x2 = end ? xScale(smoothedData.indexOf(end)) : INNER_W;
            } else {
              // For baseline / few points: single phase spans full width
              x1 = 0;
              x2 = INNER_W;
            }
            return (
              <rect
                key={`phase-${i}`}
                x={x1 + MARGIN.left}
                y={MARGIN.top}
                width={x2 - x1}
                height={INNER_H}
                fill={phase.color}
                opacity={0.06}
              />
            );
          })}
        </g>

        {/* ── Y grid lines + labels ─────────────────────────── */}
        {yTicks.map(tick => {
          const y = yScale(tick) + MARGIN.top;
          return (
            <g key={`y-${tick}`}>
              <line
                x1={MARGIN.left} y1={y}
                x2={WIDTH - MARGIN.right} y2={y}
                stroke="var(--color-grid)" strokeWidth={1} opacity={0.4}
              />
              <text
                x={MARGIN.left - 8} y={y}
                textAnchor="end" dominantBaseline="middle"
                fill="var(--color-text-dim)" fontSize={10} fontFamily="var(--font-mono)"
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
              x={x} y={HEIGHT - MARGIN.bottom + 16}
              textAnchor="middle"
              fill="var(--color-text-dim)" fontSize={10} fontFamily="var(--font-mono)"
            >
              {smoothedData[tick] ? fmtDate(new Date(smoothedData[tick].date)) : ''}
            </text>
          );
        })}

        {/* ── Lines ─────────────────────────────────────────── */}
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {isEmotions
            ? EMOTIONS.map((e, i) => {
                if (!visibleEmotions.has(e.key)) return null;
                return (
                  <path
                    key={e.key}
                    ref={el => { linesRef.current[i] = el; }}
                    d={emotionPaths[e.key] ?? ''}
                    fill="none"
                    stroke={e.color}
                    strokeWidth={LINE_STROKE}
                    strokeOpacity={LINE_OPACITY}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                );
              })
            : TRAITS.map((t, i) => {
                if (!visibleTraits.has(t.key)) return null;
                const color = colors[t.key] || cssVar(t.cssVar) || '#888';
                return (
                  <path
                    key={t.key}
                    ref={el => { linesRef.current[i] = el; }}
                    d={traitPaths[t.key] ?? ''}
                    fill="none"
                    stroke={color}
                    strokeWidth={LINE_STROKE}
                    strokeOpacity={LINE_OPACITY}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                );
              })
          }
        </g>

        {/* ── Point markers ─────────────────────────────────── */}
        {smoothedData.map((pt, idx) => {
          const x = xScale(smoothedData.indexOf(pt)) + MARGIN.left;
          const isBaseline = pt.type === 'baseline';
          return (
            <g
              key={`pt-${idx}`}
              ref={el => { pointsRef.current[idx] = el; }}
            >
              {isEmotions
                ? EMOTIONS.map(e => {
                    if (!visibleEmotions.has(e.key)) return null;
                    const val = pt.emotionScores?.[e.key];
                    if (val == null || isNaN(val)) return null;
                    const py = yScale(val) + MARGIN.top;
                    if (isBaseline) {
                      const s = BASELINE_DIAMOND;
                      return (
                        <rect
                          key={e.key}
                          x={x - s} y={py - s}
                          width={s * 2} height={s * 2}
                          transform={`rotate(45 ${x} ${py})`}
                          fill="var(--color-surface)"
                          stroke={e.color}
                          strokeWidth={1.5}
                        />
                      );
                    }
                    return (
                      <circle
                        key={e.key}
                        cx={x} cy={py} r={PULSE_RADIUS}
                        fill="var(--color-surface)"
                        stroke={e.color}
                        strokeWidth={1.5}
                      />
                    );
                  })
                : TRAITS.map(t => {
                    if (!visibleTraits.has(t.key)) return null;
                    const color = colors[t.key] || cssVar(t.cssVar) || '#888';
                    const py = yScale(pt.scores[t.key]) + MARGIN.top;
                    if (isBaseline) {
                      const s = BASELINE_DIAMOND;
                      return (
                        <rect
                          key={t.key}
                          x={x - s} y={py - s}
                          width={s * 2} height={s * 2}
                          transform={`rotate(45 ${x} ${py})`}
                          fill="var(--color-surface)"
                          stroke={color}
                          strokeWidth={1.5}
                        />
                      );
                    }
                    return (
                      <circle
                        key={t.key}
                        cx={x} cy={py} r={PULSE_RADIUS}
                        fill="var(--color-surface)"
                        stroke={color}
                        strokeWidth={1.5}
                      />
                    );
                  })
              }
            </g>
          );
        })}

        {/* ── Scrub indicator ──────────────────────────────── */}
        {scrubX !== null && (
          <line
            x1={scrubX} y1={MARGIN.top}
            x2={scrubX} y2={HEIGHT - MARGIN.bottom}
            stroke="var(--color-accent)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            opacity={0.8}
          />
        )}

        {/* ── Hover indicator (subtle highlight) ──────────── */}
        {hoveredIndex >= 0 && hoveredIndex !== currentScrubIndex && (
          <line
            x1={xScale(hoveredIndex) + MARGIN.left}
            y1={MARGIN.top}
            x2={xScale(hoveredIndex) + MARGIN.left}
            y2={HEIGHT - MARGIN.bottom}
            stroke="var(--color-text-dim)"
            strokeWidth={1}
            strokeDasharray="2 4"
            opacity={0.4}
          />
        )}

        {/* ── Tooltip ──────────────────────────────────────── */}
        {tooltip && (
          <foreignObject
            x={Math.min(tooltip.x + 12, WIDTH - 220)}
            y={Math.max(tooltip.y - 50, 4)}
            width={200}
            height={isEmotions ? 180 : 120}
            style={{ pointerEvents: 'none', overflow: 'visible' }}
          >
            <div
              style={{
                background: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '10px 12px',
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                color: 'var(--color-text)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                lineHeight: 1.5,
              }}
            >
              <div style={{
                fontWeight: 600, marginBottom: 2,
                fontFamily: 'var(--font-sans)', fontSize: 13,
                color: 'var(--color-text)',
              }}>
                {fmtDateLong(new Date(tooltip.point.date))}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 9,
                color: 'var(--color-text-dim)', textTransform: 'uppercase',
                letterSpacing: '0.08em', marginBottom: 8,
              }}>
                {tooltip.point.type === 'baseline' ? 'Baseline' : 'Pulse'}
              </div>
              {tooltipEntries.map((entry, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', justifyContent: 'space-between', gap: 12,
                    padding: '2px 0', alignItems: 'center',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: entry.color }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{entry.short}</span>
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600 }}>{entry.value}</span>
                </div>
              ))}
            </div>
          </foreignObject>
        )}
      </svg>

      {/* ── Phase bar (below chart, above scrubber) ──────────── */}
      <div style={{
        display: 'flex', gap: 0, marginTop: '8px', height: '24px',
        borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--color-border)',
      }}>
        {phases.map((phase, i) => {
          const hasDays = smoothedData.every(d => d.day !== undefined);
          let widthPct: number;
          if (hasDays && data.length > 10) {
            widthPct = ((phase.endDay - phase.startDay + 1) / (DEMO_PHASES[DEMO_PHASES.length - 1].endDay + 1)) * 100;
          } else {
            widthPct = 100 / phases.length;
          }
          const isActive = currentScrubIndex >= 0 && (() => {
            if (hasDays && data.length > 10) {
              const day = smoothedData[currentScrubIndex]?.day ?? 0;
              return day >= phase.startDay && day <= phase.endDay;
            }
            return i === 0;
          })();
          return (
            <div
              key={`phasebar-${i}`}
              style={{
                width: `${widthPct}%`,
                background: phase.color + '22',
                color: phase.color,
                borderRight: i < phases.length - 1 ? '1px solid var(--color-border)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontSize: 9,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                transition: 'box-shadow 0.2s',
                boxShadow: isActive ? 'inset 0 0 0 2px var(--color-accent)' : 'none',
                position: 'relative',
              }}
              title={phase.desc}
            >
              {phase.label}
            </div>
          );
        })}
      </div>

      {/* ── Scrubber (below phase bar) ──────────────────────── */}
      {smoothedData.length > 1 && (
        <div style={{ marginTop: '12px' }}>
          {/* Scrubber header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '8px',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase',
              letterSpacing: '0.12em', color: 'var(--color-text-dim)',
            }}>
              Timeline · Drag to scrub
            </span>
            <span style={{
              fontFamily: 'var(--font-serif)', fontSize: '13px', color: 'var(--color-accent)',
              fontVariationSettings: '"opsz" 20', fontWeight: 500,
            }}>
              {currentScrubIndex >= 0
                ? `${fmtDateLong(new Date(smoothedData[currentScrubIndex].date))} · ${smoothedData[currentScrubIndex].type}`
                : '—'}
            </span>
          </div>

          {/* Scrubber track */}
          <div
            ref={scrubberTrackRef}
            onClick={handleScrubberClick}
            style={{
              position: 'relative', height: '32px', cursor: 'pointer',
            }}
          >
            {/* Rail */}
            <div style={{
              position: 'absolute', top: '50%', left: 0, right: 0, height: '3px',
              background: 'var(--color-surface-elevated)', borderRadius: '2px',
              transform: 'translateY(-50%)',
            }} />
            {/* Fill */}
            <div style={{
              position: 'absolute', top: '50%', left: 0, height: '3px',
              width: `${scrubberPct}%`,
              background: 'var(--color-accent)', borderRadius: '2px',
              transform: 'translateY(-50%)',
              transition: 'width 0.1s ease',
            }} />
            {/* Date marks */}
            {smoothedData.map((d, i) => {
              const pct = smoothedData.length === 1 ? 50 : (i / (smoothedData.length - 1)) * 100;
              const isBaseline = d.type === 'baseline';
              return (
                <div
                  key={`mark-${i}`}
                  style={{
                    position: 'absolute', top: '50%', left: `${pct}%`,
                    width: isBaseline ? 2 : 1,
                    height: isBaseline ? 14 : 8,
                    background: isBaseline ? 'var(--color-accent)' : 'var(--color-text-dim)',
                    transform: 'translateY(-50%)',
                    opacity: 0.6,
                  }}
                />
              );
            })}
            {/* Handle */}
            {currentScrubIndex >= 0 && (
              <div
                onMouseDown={(e) => { e.preventDefault(); setDragging(true); }}
                style={{
                  position: 'absolute', top: '50%', left: `${scrubberPct}%`,
                  width: '14px', height: '24px',
                  background: 'var(--color-accent)', borderRadius: '3px',
                  transform: 'translate(-50%, -50%)',
                  cursor: dragging ? 'grabbing' : 'grab',
                  boxShadow: '0 0 10px rgba(212,165,116,0.5), 0 2px 6px rgba(0,0,0,0.3)',
                  border: '2px solid var(--color-accent-bright)',
                  zIndex: 10,
                  transition: 'left 0.1s ease',
                }}
              >
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  width: 2, height: 10, background: 'var(--color-bg)',
                  borderRadius: 1, transform: 'translate(-50%, -50%)',
                }} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
