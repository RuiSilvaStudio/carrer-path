import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '../../../lib/motion';
import type { FacetScores } from '../../../types';

interface Props {
  facets: FacetScores;
  /** Optional: the trait-level summary scores, shown as a header per section */
  bigFive?: { openness: number; conscientiousness: number; extraversion: number; agreeableness: number; emotional_stability: number };
}

interface FacetDef {
  key: string; // e.g. 'N_Anxiety'
  label: string;
}

interface TraitSection {
  traitKey: string;
  label: string;
  cssVar: string;
  bigFiveKey?: string;
  facets: FacetDef[];
}

// Ordered to match the radar chart: O, C, E, A, N(→ES)
const SECTIONS: TraitSection[] = [
  {
    traitKey: 'O', label: 'Openness', cssVar: '--color-openness', bigFiveKey: 'openness',
    facets: [
      { key: 'O_Imagination', label: 'Imagination' },
      { key: 'O_Artistic', label: 'Artistic' },
      { key: 'O_Emotionality', label: 'Emotionality' },
      { key: 'O_Adventurousness', label: 'Adventurousness' },
      { key: 'O_Intellect', label: 'Intellect' },
      { key: 'O_Liberalism', label: 'Liberalism' },
    ],
  },
  {
    traitKey: 'C', label: 'Conscientiousness', cssVar: '--color-conscientiousness', bigFiveKey: 'conscientiousness',
    facets: [
      { key: 'C_Self-efficacy', label: 'Self-efficacy' },
      { key: 'C_Orderliness', label: 'Orderliness' },
      { key: 'C_Dutifulness', label: 'Dutifulness' },
      { key: 'C_Achievement-striving', label: 'Achievement-striving' },
      { key: 'C_Self-discipline', label: 'Self-discipline' },
      { key: 'C_Cautiousness', label: 'Cautiousness' },
    ],
  },
  {
    traitKey: 'E', label: 'Extraversion', cssVar: '--color-extraversion', bigFiveKey: 'extraversion',
    facets: [
      { key: 'E_Friendliness', label: 'Friendliness' },
      { key: 'E_Gregariousness', label: 'Gregariousness' },
      { key: 'E_Assertiveness', label: 'Assertiveness' },
      { key: 'E_Activity', label: 'Activity' },
      { key: 'E_Excitement-seeking', label: 'Excitement-seeking' },
      { key: 'E_Cheerfulness', label: 'Cheerfulness' },
    ],
  },
  {
    traitKey: 'A', label: 'Agreeableness', cssVar: '--color-agreeableness', bigFiveKey: 'agreeableness',
    facets: [
      { key: 'A_Trust', label: 'Trust' },
      { key: 'A_Morality', label: 'Morality' },
      { key: 'A_Altruism', label: 'Altruism' },
      { key: 'A_Cooperation', label: 'Cooperation' },
      { key: 'A_Modesty', label: 'Modesty' },
      { key: 'A_Sympathy', label: 'Sympathy' },
    ],
  },
  {
    traitKey: 'N', label: 'Emotional Stability', cssVar: '--color-stability', bigFiveKey: 'emotional_stability',
    facets: [
      { key: 'N_Anxiety', label: 'Anxiety' },
      { key: 'N_Anger', label: 'Anger' },
      { key: 'N_Depression', label: 'Depression' },
      { key: 'N_Self-consciousness', label: 'Self-consciousness' },
      { key: 'N_Immoderation', label: 'Immoderation' },
      { key: 'N_Vulnerability', label: 'Vulnerability' },
    ],
  },
];

export function FacetBreakdown({ facets, bigFive }: Props) {
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = useReducedMotion();

  useEffect(() => {
    let idx = 0;
    for (const section of SECTIONS) {
      for (const facet of section.facets) {
        const el = barRefs.current[idx];
        const val = facets[facet.key];
        if (el && val !== undefined) {
          if (reduced) {
            el.style.width = `${val}%`;
          } else {
            gsap.fromTo(
              el,
              { width: '0%' },
              { width: `${val}%`, duration: 0.6, ease: 'power2.out', delay: idx * 0.03 },
            );
          }
        }
        idx++;
      }
    }
  }, [facets, reduced]);

  let globalIdx = 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {SECTIONS.map((section) => (
        <div key={section.traitKey}>
          {/* Section header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'var(--fs-h3-sm)',
                fontWeight: 500,
                color: 'var(--color-text)',
              }}
            >
              {section.label}
            </span>
            {bigFive && section.bigFiveKey && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: `var(${section.cssVar})`,
                }}
              >
                {bigFive[section.bigFiveKey as keyof typeof bigFive]}
              </span>
            )}
          </div>

          {/* Facet bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {section.facets.map((facet) => {
              const val = facets[facet.key];
              const idx = globalIdx++;
              return (
                <div
                  key={facet.key}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '140px 1fr 36px',
                    gap: '12px',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {facet.label}
                  </span>
                  <div
                    style={{
                      height: '8px',
                      background: 'var(--color-surface-elevated)',
                      borderRadius: 'var(--radius-element)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      ref={(el) => { barRefs.current[idx] = el; }}
                      style={{
                        height: '100%',
                        width: '0%',
                        background: `var(${section.cssVar})`,
                        borderRadius: 'var(--radius-element)',
                        opacity: 0.85,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--color-text-dim)',
                      textAlign: 'right',
                    }}
                  >
                    {val !== undefined ? val : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
