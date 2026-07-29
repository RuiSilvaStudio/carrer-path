// ── Sigil component — Tangle mark that grows with your data ──────
// Six maturity stages (see lib/sigil.ts). Geometry frozen by scores;
// weave/emotion layers + milestone pips accumulate with pulses. The
// stage-5 ring takes the dominant Big Five trait's color. Emotion dots
// use the Rhythm heatmap encoding (single accent, opacity = frequency).
// Draw-on entrance via GSAP; reduced-motion users get the final state.
//
// `empty` renders the pre-baseline state: dashed ring + center dot.

import { useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '../../lib/motion';
import {
  buildSigil, insigniaFor, dominantTraitIndex,
  TRAIT_CSS_VARS, type SigilInput, type SigilVariant,
} from '../../lib/sigil';

function cssVar(name: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

interface SigilProps {
  variant?: SigilVariant;
  input: SigilInput;
  size?: number;
  animate?: boolean;
  showInsignia?: boolean;
  empty?: boolean;
  minimal?: boolean; // nav-avatar render: bloom outline + center dot only
}

const VB = 100;

export function Sigil({
  variant = 'tangle', input, size = 96, animate = true,
  showInsignia = false, empty = false, minimal = false,
}: SigilProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [tick, setTick] = useState(0);

  useGSAP(() => {
    const obs = new MutationObserver(ms => {
      if (ms.some(m => m.attributeName === 'data-theme')) setTick(t => t + 1);
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, { scope: ref });

  const layers = useMemo(
    () => (empty ? [] : buildSigil(variant, input, VB).filter(l => !minimal || l.kind === 'ring' || l.kind === 'node')),
    [variant, input, empty, minimal],
  );
  const pips = useMemo(() => insigniaFor(input.pulseCount), [input.pulseCount]);

  const strokeFor = (traitIndex: number, emphasis?: boolean) => {
    void tick;
    if (emphasis) return cssVar('--color-accent-bright') || cssVar('--color-accent');
    return cssVar(TRAIT_CSS_VARS[traitIndex % TRAIT_CSS_VARS.length]);
  };
  const accent = () => { void tick; return cssVar('--color-accent-bright') || cssVar('--color-accent'); };
  const dim = () => { void tick; return cssVar('--color-text-dim'); };
  const mutedWeave = () => { void tick; return cssVar('--color-text-dim'); };

  const frameR = VB * 0.47;
  const pipR = 2.2;
  const established = pips.some(p => p.established);
  // Stage-5 ring: dominant Big Five trait color (same token as charts)
  const dominantVar = TRAIT_CSS_VARS[dominantTraitIndex(input.bigFive)];
  const dominantColor = () => { void tick; return cssVar(dominantVar); };
  const showRing = showInsignia || empty;

  useGSAP(() => {
    if (!animate || !ref.current) return;
    const paths = ref.current.querySelectorAll<SVGPathElement>('path[data-sigil]');
    paths.forEach((p, i) => {
      const len = p.getTotalLength();
      gsap.fromTo(p,
        { strokeDasharray: len, strokeDashoffset: len, opacity: 0 },
        { strokeDashoffset: 0, opacity: 1, duration: 1.1, delay: i * 0.06, ease: 'power2.out',
          onComplete: () => { p.style.strokeDasharray = 'none'; } });
    });
    const dots = ref.current.querySelectorAll<SVGCircleElement>('circle[data-sigil-fill]');
    if (dots.length) {
      gsap.fromTo(dots, { scale: 0, opacity: 0, transformOrigin: 'center' },
        { scale: 1, duration: 0.4, delay: 0.7, stagger: 0.008, ease: 'back.out(2)',
          opacity: (_i, el) => parseFloat((el as Element).getAttribute('data-opacity') || '1') });
    }
    const nodes = ref.current.querySelectorAll<SVGCircleElement>('circle[data-sigil-node]');
    if (nodes.length) {
      gsap.fromTo(nodes, { scale: 0, opacity: 0, transformOrigin: 'center' },
        { scale: 1, opacity: 1, duration: 0.5, delay: 0.4, ease: 'back.out(2)' });
    }
    const pipEls = ref.current.querySelectorAll<SVGCircleElement>('circle[data-insignia-earned="true"]');
    if (pipEls.length) {
      gsap.fromTo(pipEls, { scale: 0, transformOrigin: 'center' },
        { scale: 1, duration: 0.4, delay: 0.9, stagger: 0.1, ease: 'back.out(3)' });
    }
  }, { scope: ref, dependencies: [variant, input, animate, tick, showInsignia, empty] });

  return (
    <svg
      ref={ref}
      width={size} height={size}
      viewBox={`0 0 ${VB} ${VB}`}
      role="img"
      aria-label={empty ? 'Sigil placeholder — forms after baseline' : `Identity sigil, ${input.pulseCount} pulses`}
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* Frame ring — dashed until established (25+), then dominant-trait color */}
      {showRing && (
        <circle
          cx={VB / 2} cy={VB / 2} r={frameR}
          fill="none"
          stroke={established && !empty ? dominantColor() : 'var(--color-grid)'}
          strokeWidth={established && !empty ? 1.5 : 0.5}
          strokeDasharray={established && !empty ? 'none' : '2 3'}
          opacity={established && !empty ? 0.95 : 1}
        />
      )}

      {/* Fingerprint layers */}
      {!empty && layers.map((layer, i) => {
        if (layer.kind === 'node') {
          return (
            <circle key={`n${i}`} data-sigil-node
              cx={layer.cx} cy={layer.cy} r={layer.r}
              fill={strokeFor(layer.traitIndex)} opacity={0.9} />
          );
        }
        if (layer.kind === 'dot') {
          return (
            <circle key={`d${i}`} data-sigil-fill
              cx={layer.cx} cy={layer.cy} r={layer.r}
              fill={accent()}
              data-opacity={layer.opacityScale ?? 1}
              opacity={layer.opacityScale ?? 1} />
          );
        }
        const color = layer.muted ? mutedWeave() : strokeFor(layer.traitIndex, layer.emphasis);
        return (
          <path key={`p${i}`} data-sigil
            d={layer.d} fill="none" stroke={color}
            strokeWidth={layer.emphasis ? 1.5 : 0.9}
            strokeLinecap="round" strokeLinejoin="round"
            opacity={layer.emphasis ? 0.95 : layer.muted ? 0.4 : 0.6} />
        );
      })}

      {/* Empty state: ring + center dot only */}
      {empty && (
        <circle data-sigil-node cx={VB / 2} cy={VB / 2} r={2} fill={dim()} opacity={0.7} />
      )}

      {/* Milestone pips */}
      {showInsignia && !empty && pips.map((pip, i) => {
        const x = VB / 2 + frameR * Math.cos(pip.angle);
        const y = VB / 2 + frameR * Math.sin(pip.angle);
        return (
          <circle key={`pip${i}`}
            data-insignia-earned={pip.earned}
            cx={x} cy={y} r={pipR}
            fill={pip.earned ? accent() : 'none'}
            stroke={pip.earned ? accent() : dim()}
            strokeWidth={0.7}
            opacity={pip.earned ? 1 : 0.45}
          />
        );
      })}
    </svg>
  );
}
