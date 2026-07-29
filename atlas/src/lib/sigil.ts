// ── Sigil: deterministic generative identity mark ────────────────
// A user's sigil is derived ONLY from their assessment data — no
// randomness that isn't seeded by the data itself. Same scores in →
// same mark out, on any machine.
//
// The shipping mark is TANGLE: a bloom-style closed outline (trait-
// weighted harmonics + facet texture) that GROWS with longitudinal
// data through six maturity stages:
//   0  no baseline   → dashed frame + center dot (handled by component)
//   1  baseline      → bloom outline only
//   2  pulse ≥ 1     → + inner weave, dimmed single (muted) color
//   3  pulse ≥ 5     → + weave gains trait colors
//   4  pulse ≥ 12    → + more weave strands
//   5  pulse ≥ 25    → + solid ring in dominant-trait color + emotion
//                      dot fill (positions seeded by facets, opacity
//                      by emotion frequency — same encoding as the
//                      Rhythm emotion heatmap)
// Milestone pips (1/5/12/25) sit on the frame ring and are identical
// for every user — the shared status channel outside the fingerprint.
//
// Design constraints (Atlas design system):
//   - strokes 1.5px max, nodes 3px max
//   - colors only from existing tokens (trait Tol palette + accent)
//   - legible at 48px, holds up at 320px
//   - reduced-motion: final state rendered statically

import type { AssessmentScores, BigFiveScores } from '../types';

export type SigilVariant = 'tangle';

export interface SigilInput {
  bigFive: BigFiveScores;
  facets: Record<string, number>; // ~30 entries, 0–100
  sd3?: { Machiavellianism: number; Narcissism: number; Psychopathy: number };
  icarPercent?: number;   // 0–100
  pulseCount: number;     // drives maturity stages + insignia pips
  // Emotion frequencies aggregated across pulses (name → count), as
  // used by the Rhythm emotion heatmap. Drives the stage-5 dot fill.
  emotions?: Record<string, number>;
  // Average absolute trait delta across pulses — reserved texture cue.
  evolution: number;
  mode?: 'frozen';
}

// ── Maturity stages ──────────────────────────────────────────────
export type SigilStage = 0 | 1 | 2 | 3 | 4 | 5;
export function stageFor(hasBaseline: boolean, pulseCount: number): SigilStage {
  if (!hasBaseline) return 0;
  if (pulseCount >= 25) return 5;
  if (pulseCount >= 12) return 4;
  if (pulseCount >= 5) return 3;
  if (pulseCount >= 1) return 2;
  return 1;
}

// ── Milestone insignia ───────────────────────────────────────────
export const MILESTONE_TIERS = [1, 5, 12, 25] as const;
export interface InsigniaPip {
  angle: number;
  tier: number;
  earned: boolean;
  established: boolean;
}
export function insigniaFor(pulseCount: number): InsigniaPip[] {
  const bottom = Math.PI / 2;
  const spread = (50 * Math.PI) / 180;
  const n: number = MILESTONE_TIERS.length;
  return MILESTONE_TIERS.map((tier, i) => {
    const t = i / (n - 1);
    return {
      angle: bottom - spread + t * spread * 2,
      tier,
      earned: pulseCount >= tier,
      established: pulseCount >= 25,
    };
  });
}

// ── Dominant trait (stage 5 ring color) ──────────────────────────
const TRAIT_KEYS: (keyof BigFiveScores)[] = [
  'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'emotional_stability',
];
export function dominantTraitIndex(bigFive: BigFiveScores): number {
  let best = 0;
  let bestVal = -Infinity;
  TRAIT_KEYS.forEach((k, i) => { if (bigFive[k] > bestVal) { bestVal = bigFive[k]; best = i; } });
  return best;
}

// ── Seeded PRNG (mulberry32) — deterministic across machines ─────
function hashNumbers(nums: number[]): number {
  let h = 2166136261 >>> 0;
  for (const n of nums) {
    const v = Math.round(n * 1000);
    h ^= v & 0xffff;
    h = Math.imul(h, 16777619);
    h ^= (v >>> 16) & 0xffff;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Norm {
  traits: number[];
  facets: number[];
  sd3: number[];
  icar: number;
  evolution: number;
  emotions: Record<string, number>;
  rng: () => number;
}
function normalize(input: SigilInput): Norm {
  const traits = TRAIT_KEYS.map(k => clamp01(input.bigFive[k] / 100));
  const facets = Object.keys(input.facets).sort().map(k => clamp01(input.facets[k] / 100));
  const sd3 = input.sd3
    ? [input.sd3.Machiavellianism, input.sd3.Narcissism, input.sd3.Psychopathy].map(v => clamp01(v / 100))
    : [0.5, 0.5, 0.5];
  const icar = clamp01((input.icarPercent ?? 50) / 100);
  const evolution = clamp01(input.evolution / 10);
  const rng = mulberry32(hashNumbers([...traits, ...facets, ...sd3, icar]));
  return { traits, facets, sd3, icar, evolution, emotions: input.emotions ?? {}, rng };
}
function clamp01(v: number): number {
  return Math.max(0, Math.min(1, isFinite(v) ? v : 0.5));
}

interface Pt { x: number; y: number }
function polar(cx: number, cy: number, r: number, angle: number): Pt {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}
function toPath(pts: Pt[], close = true): string {
  if (pts.length === 0) return '';
  const parts = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`);
  return parts.join(' ') + (close ? ' Z' : '');
}
function smoothClosed(pts: Pt[]): string {
  if (pts.length < 3) return toPath(pts);
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const p0 = pts[i];
    const p1 = pts[(i + 1) % n];
    const mx = (p0.x + p1.x) / 2;
    const my = (p0.y + p1.y) / 2;
    if (i === 0) {
      const prev = pts[n - 1];
      const startX = (prev.x + p0.x) / 2;
      const startY = (prev.y + p0.y) / 2;
      d = `M${startX.toFixed(2)},${startY.toFixed(2)} `;
    }
    d += `Q${p0.x.toFixed(2)},${p0.y.toFixed(2)} ${mx.toFixed(2)},${my.toFixed(2)} `;
  }
  return d + 'Z';
}
function facetAt(n: Norm, i: number): number {
  if (n.facets.length === 0) return 0.5;
  return n.facets[i % n.facets.length];
}

// ── Public layer model ───────────────────────────────────────────
export interface SigilLayer {
  d: string;
  kind: 'ring' | 'strand' | 'node' | 'dot';
  traitIndex: number;
  emphasis?: boolean;
  muted?: boolean;        // stage-2 weave renders in a single muted tone
  opacityScale?: number;  // stage-5 emotion dots: frequency → opacity
  cx?: number; cy?: number; r?: number;
}

export const TRAIT_CSS_VARS = [
  '--color-openness',
  '--color-conscientiousness',
  '--color-extraversion',
  '--color-agreeableness',
  '--color-stability',
];

// Neutral pre-baseline input — renders the empty state (ring + dot).
export const EMPTY_SIGIL_INPUT: SigilInput = {
  bigFive: { openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, emotional_stability: 0 },
  facets: {},
  pulseCount: 0,
  evolution: 0,
  mode: 'frozen',
};

// ── TANGLE builder — stage-aware ─────────────────────────────────
export function buildSigil(
  _variant: SigilVariant,
  input: SigilInput,
  size: number,
): SigilLayer[] {
  const n = normalize(input);
  const stage = stageFor(true, input.pulseCount); // caller handles stage 0 via `empty`
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.42;
  const layers: SigilLayer[] = [];

  // ── Outer bloom outline (stage ≥ 1) ───────────────────────────
  const samples = 120;
  const phase = n.sd3[1] * Math.PI;
  const baseR = maxR * 0.78;
  const petalAmp = maxR * 0.18;
  const outline: Pt[] = [];
  for (let i = 0; i < samples; i++) {
    const angle = (i / samples) * Math.PI * 2 - Math.PI / 2;
    let r = baseR;
    r += Math.sin(angle * 3 + phase) * petalAmp * n.traits[0] * 0.9;
    r += Math.sin(angle * 5 + phase * 1.3) * petalAmp * n.traits[1] * 0.7;
    r += Math.sin(angle * 7 + phase * 0.7) * petalAmp * n.traits[2] * 0.6;
    r += Math.sin(angle * 11 + phase * 1.7) * petalAmp * n.traits[3] * 0.5;
    const f = facetAt(n, Math.floor((i / samples) * 30));
    r += (f - 0.5) * petalAmp * 0.6;
    outline.push(polar(cx, cy, Math.max(2, r), angle));
  }
  layers.push({ d: smoothClosed(outline), kind: 'ring', traitIndex: 0, emphasis: true });

  // ── Inner weave (stage ≥ 2) ────────────────────────────────────
  // Strand count grows with stage; color treatment depends on stage.
  if (stage >= 2) {
    const weaveCount = stage >= 4 ? 11 : stage >= 3 ? 8 : 5;
    const steps = 22;
    const wild = 0.3 + n.sd3[2] * 0.6 + n.evolution * 0.3;
    const calm = n.traits[4];
    for (let w = 0; w < weaveCount; w++) {
      const startAngle = (w / weaveCount) * Math.PI * 2 - Math.PI / 2 + n.rng() * 0.5;
      const f0 = facetAt(n, w * 3);
      const reach = maxR * (0.4 + f0 * 0.4);
      let angle = startAngle;
      const pts: Pt[] = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const r = (1 - Math.pow(1 - t, 2)) * reach;
        const f = facetAt(n, w * steps + i);
        angle += (f - 0.5) * 0.55 * wild * (1 - calm * 0.55);
        pts.push(polar(cx, cy, r, angle));
      }
      layers.push({
        d: toPath(pts, false),
        kind: 'strand',
        traitIndex: (w % 4) + 1,
        emphasis: false,
        muted: stage === 2, // dimmed single color until stage 3
      });
    }
  }

  // ── Emotion dot fill (stage ≥ 5) ───────────────────────────────
  // Positions seeded by facets (deterministic, yours). Single accent
  // tone; opacity from emotion frequency — the Rhythm heatmap encoding.
  if (stage >= 5) {
    const emoNames = Object.keys(n.emotions).sort();
    const maxCount = Math.max(1, ...emoNames.map(e => n.emotions[e]));
    const dotCount = Math.max(emoNames.length * 3, 18);
    for (let i = 0; i < dotCount; i++) {
      const f = facetAt(n, i * 7);
      const angle = n.rng() * Math.PI * 2;
      const rr = Math.sqrt(n.rng()) * baseR * 0.9 * (0.4 + f * 0.6);
      const p = polar(cx, cy, rr, angle);
      const emo = emoNames.length ? emoNames[i % emoNames.length] : '';
      const freq = emo ? n.emotions[emo] / maxCount : 0.4;
      layers.push({
        d: '',
        kind: 'dot',
        traitIndex: 4,              // unused — dots render in accent
        cx: p.x, cy: p.y, r: 0.9 + f * 0.9,
        opacityScale: 0.25 + freq * 0.75, // Rhythm-style: frequency → opacity
      });
    }
  }

  // Center node (always present once baseline exists)
  layers.push({ d: '', kind: 'node', cx, cy, r: 1.5 + n.icar * 2.5, traitIndex: 4 });
  return layers;
}

// ── Convenience: derive SigilInput from Assessment + pulses ──────
export function sigilInputFromData(
  scores: AssessmentScores,
  pulseCount: number,
  pulses?: { scores: AssessmentScores; emotions?: string[] | null }[],
): SigilInput {
  let evolution = 0;
  if (pulses && pulses.length > 1) {
    const series = pulses.map(p => p.scores.bigFive);
    let sum = 0, cnt = 0;
    for (let i = 1; i < series.length; i++) {
      for (const k of TRAIT_KEYS) {
        sum += Math.abs(series[i][k] - series[i - 1][k]);
        cnt++;
      }
    }
    evolution = cnt > 0 ? sum / cnt : 0;
  }
  // Aggregate emotion frequencies across pulses (Assessment.emotions: string[])
  const emotions: Record<string, number> = {};
  if (pulses) {
    for (const p of pulses) {
      if (Array.isArray(p.emotions)) {
        for (const e of p.emotions) emotions[e] = (emotions[e] || 0) + 1;
      }
    }
  }
  return {
    bigFive: scores.bigFive,
    facets: scores.facets ?? {},
    sd3: scores.sd3,
    icarPercent: scores.icar?.percent,
    pulseCount,
    emotions,
    evolution,
    mode: 'frozen',
  };
}
