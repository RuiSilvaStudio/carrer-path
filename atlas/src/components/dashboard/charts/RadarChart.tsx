import { useRef, useState, useMemo, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import * as d3 from 'd3';
import type { BigFiveScores } from '../../../types';

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

const GRID_LEVELS = [20, 40, 60, 80, 100];

// ── Helper: read CSS variable ───────────────────────────────────
function cssVar(name: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// ── Props ───────────────────────────────────────────────────────
interface RadarChartProps {
  scores: BigFiveScores;
  size?: number;
  animate?: boolean;
}

// ── Component ───────────────────────────────────────────────────
export default function RadarChart({ scores, size = 400, animate = true }: RadarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shapeRef = useRef<SVGPolygonElement>(null);
  const pointsRef = useRef<(SVGCircleElement | null)[]>([]);
  const [colors, setColors] = useState<Record<keyof BigFiveScores, string>>({
    openness: '',
    conscientiousness: '',
    extraversion: '',
    agreeableness: '',
    emotional_stability: '',
  });

  // Read CSS variables on mount + observe theme changes
  useGSAP(() => {
    const readColors = () => {
      const c: Record<string, string> = {};
      for (const t of TRAITS) c[t.key] = cssVar(t.cssVar);
      setColors(c as Record<keyof BigFiveScores, string>);
    };
    readColors();
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'data-theme') {
          readColors();
          break;
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, { scope: containerRef });

  // ── Geometry ──────────────────────────────────────────────────
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const labelOffset = 28;

  // Angle for each trait axis (start at top, go clockwise)
  const angleFor = (i: number) => (i * 2 * Math.PI) / TRAITS.length - Math.PI / 2;

  // Radial scale 0-100 → 0-radius
  const rScale = useMemo(() => d3.scaleLinear().domain([0, 100]).range([0, radius]), [radius]);

  // Vertex coordinates for the data shape
  const vertices = useMemo(() => {
    return TRAITS.map((t, i) => {
      const val = scores[t.key];
      const r = rScale(val);
      const a = angleFor(i);
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), val, trait: t, angle: a };
    });
  }, [scores, rScale, cx, cy]);

  // Polygon points string
  const polygonPoints = useMemo(
    () => vertices.map((v) => `${v.x},${v.y}`).join(' '),
    [vertices],
  );

  // Grid ring polygons
  const gridRings = useMemo(() => {
    return GRID_LEVELS.map((level) => {
      const r = rScale(level);
      const pts = TRAITS.map((_, i) => {
        const a = angleFor(i);
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
      }).join(' ');
      return { level, points: pts };
    });
  }, [rScale, cx, cy]);

  // Axis lines from center to outer ring
  const axisLines = useMemo(() => {
    return TRAITS.map((t, i) => {
      const a = angleFor(i);
      const x2 = cx + radius * Math.cos(a);
      const y2 = cy + radius * Math.sin(a);
      return { x1: cx, y1: cy, x2, y2, trait: t, angle: a };
    });
  }, [cx, cy, radius]);

  // Label positions
  const labelPos = useMemo(() => {
    return TRAITS.map((t, i) => {
      const a = angleFor(i);
      const r = radius + labelOffset;
      return {
        x: cx + r * Math.cos(a),
        y: cy + r * Math.sin(a),
        trait: t,
        val: scores[t.key],
      };
    });
  }, [cx, cy, radius, scores]);

  // Accent fill color (translucent)
  const accentColor = colors.openness || cssVar('--color-accent') || '#d4a574';

  // ── GSAP entrance — animate only on mount or when scores materially change ──
  const animateRef = animate;
  const prevScoresRef = useRef<BigFiveScores>(scores);
  useGSAP(() => {
    if (!animateRef) return;

    // Only re-animate if scores actually changed by a meaningful amount
    const prev = prevScoresRef.current;
    const changed = (Object.keys(scores) as (keyof BigFiveScores)[]).some(
      k => Math.abs((scores[k] as number) - (prev[k] as number)) > 0.5,
    );
    if (!changed && shapeRef.current) return;
    prevScoresRef.current = scores;

    // Shape: scale from 0.5 → 1 around center
    if (shapeRef.current) {
      gsap.fromTo(
        shapeRef.current,
        { scale: 0.5, opacity: 0, transformOrigin: `${cx}px ${cy}px` },
        { scale: 1, opacity: 1, duration: 0.8, ease: 'power2.out' },
      );
    }

    // Points: pop in with stagger
    const validPoints = pointsRef.current.filter(Boolean) as SVGCircleElement[];
    if (validPoints.length) {
      gsap.fromTo(
        validPoints,
        { scale: 0, opacity: 0, transformOrigin: 'center' },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)', stagger: 0.08 },
      );
    }
  }, { scope: containerRef, dependencies: [scores, colors, animateRef] });

  // ── Click handler: nearest vertex ─────────────────────────────
  const handleClick = useCallback((evt: React.MouseEvent<SVGSVGElement>) => {
    const svg = evt.currentTarget;
    const rect = svg.getBoundingClientRect();
    const scaleX = size / rect.width;
    const scaleY = size / rect.height;
    const mx = (evt.clientX - rect.left) * scaleX;
    const my = (evt.clientY - rect.top) * scaleY;
    // For now just a no-op — could highlight nearest axis
    void mx; void my;
  }, [size]);

  return (
    <div ref={containerRef} className="radar-chart-container">
      <svg
        width="100%"
        viewBox={`-20 -20 ${size + 40} ${size + 40}`}
        onClick={handleClick}
        role="img"
        aria-label="Big Five personality radar chart"
        style={{ maxWidth: size, height: 'auto', display: 'block', margin: '0 auto' }}
      >
        {/* Grid rings */}
        {gridRings.map((ring) => (
          <polygon
            key={ring.level}
            points={ring.points}
            fill="none"
            stroke="var(--color-grid)"
            strokeWidth={1}
            opacity={ring.level === 100 ? 0.6 : 0.35}
          />
        ))}

        {/* Grid ring labels (on the top axis) */}
        {gridRings.map((ring) => {
          const r = rScale(ring.level);
          return (
            <text
              key={`glabel-${ring.level}`}
              x={cx + 4}
              y={cy - r}
              fill="var(--color-text-dim)"
              fontSize={10}
              fontFamily="var(--font-mono)"
              dominantBaseline="middle"
            >
              {ring.level}
            </text>
          );
        })}

        {/* Axis lines */}
        {axisLines.map((line) => (
          <line
            key={line.trait.key}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="var(--color-axis)"
            strokeWidth={1}
            opacity={0.5}
          />
        ))}

        {/* Data shape */}
        <polygon
          ref={shapeRef}
          points={polygonPoints}
          fill={accentColor}
          fillOpacity={0.12}
          stroke={accentColor}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Vertex points */}
        {vertices.map((v, i) => (
          <circle
            key={v.trait.key}
            ref={(el) => { pointsRef.current[i] = el; }}
            cx={v.x}
            cy={v.y}
            r={5}
            fill={colors[v.trait.key] || accentColor}
            stroke="var(--color-surface)"
            strokeWidth={1.5}
          />
        ))}

        {/* Labels */}
        {labelPos.map((lp) => {
          const isTop = lp.y < cy - 10;
          const isBottom = lp.y > cy + 10;
          const isRight = lp.x > cx + 10;
          const isLeft = lp.x < cx - 10;
          const anchor = isRight ? 'start' : isLeft ? 'end' : 'middle';
          const dy = isTop ? -6 : isBottom ? 14 : 4;
          return (
            <g key={lp.trait.key}>
              <text
                x={lp.x}
                y={lp.y + dy}
                textAnchor={anchor}
                fill={colors[lp.trait.key] || 'var(--color-text)'}
                fontSize={13}
                fontFamily="var(--font-sans)"
                fontWeight={600}
              >
                {lp.trait.short}
              </text>
              <text
                x={lp.x}
                y={lp.y + dy + 14}
                textAnchor={anchor}
                fill="var(--color-text-muted)"
                fontSize={10}
                fontFamily="var(--font-mono)"
              >
                {Math.round(lp.val)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
