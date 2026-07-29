import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from '../../../lib/motion';
import type { ICARScores } from '../../../types';

interface ICARScoreProps {
  icar: ICARScores;
}

export function ICARScore({ icar }: ICARScoreProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      if (barRef.current) barRef.current.style.width = `${icar.percent}%`;
      if (numberRef.current) numberRef.current.textContent = String(Math.round(icar.correct));
      return;
    }
    if (barRef.current) {
      gsap.fromTo(
        barRef.current,
        { width: '0%' },
        { width: `${icar.percent}%`, duration: 1, ease: 'power2.out' }
      );
    }
    if (numberRef.current) {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: icar.correct,
        duration: 1,
        ease: 'power2.out',
        onUpdate: () => {
          if (numberRef.current) {
            numberRef.current.textContent = String(Math.round(obj.val));
          }
        },
      });
    }
  }, [icar, reduced]);

  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '28px',
          fontWeight: 500,
          color: 'var(--color-text)',
          letterSpacing: '-0.02em',
          marginBottom: '8px',
        }}
      >
        <span ref={numberRef}>0</span>/{icar.total} correct{' '}
        <span style={{ color: 'var(--color-text-muted)', fontSize: '22px' }}>
          ({Math.round(icar.percent)}%)
        </span>
      </div>
      <div
        style={{
          height: '4px',
          background: 'var(--color-surface-elevated)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          ref={barRef}
          style={{
            height: '100%',
            width: '0%',
            background: 'var(--color-accent)',
            borderRadius: '2px',
          }}
        />
      </div>
      <p
        style={{
          marginTop: '6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: 'var(--color-text-dim)',
        }}
      >
        ICAR Cognitive Ability
      </p>
    </div>
  );
}
