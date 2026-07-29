import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '../../../lib/motion';
import type { SD3Scores } from '../../../types';

interface SD3BarsProps {
  sd3: SD3Scores;
}

const TRAIT_LABELS: { key: keyof SD3Scores; label: string }[] = [
  { key: 'Machiavellianism', label: 'Machiavellianism' },
  { key: 'Narcissism', label: 'Narcissism' },
  { key: 'Psychopathy', label: 'Psychopathy' },
];

export function SD3Bars({ sd3 }: SD3BarsProps) {
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = useReducedMotion();

  useEffect(() => {
    TRAIT_LABELS.forEach((trait, i) => {
      const el = barRefs.current[i];
      if (el) {
        const value = sd3[trait.key];
        if (reduced) {
          el.style.width = `${value}%`;
        } else {
          gsap.fromTo(
            el,
            { width: '0%' },
            { width: `${value}%`, duration: 0.8, ease: 'power2.out', delay: i * 0.1 }
          );
        }
      }
    });
  }, [sd3, reduced]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {TRAIT_LABELS.map((trait, i) => (
        <div key={trait.key}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            <span style={{ color: 'var(--color-text-muted)' }}>{trait.label}</span>
            <span style={{ color: 'var(--color-text)' }}>{sd3[trait.key]}</span>
          </div>
          <div
            style={{
              height: '6px',
              background: 'var(--color-surface-elevated)',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <div
              ref={el => { barRefs.current[i] = el; }}
              style={{
                height: '100%',
                width: '0%',
                background: 'var(--color-danger)',
                borderRadius: '3px',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
