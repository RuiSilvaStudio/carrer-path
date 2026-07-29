// ── Sigil Lab — Tangle maturity timeline ─────────────────────────
// The shipping mark grows through six stages with longitudinal data.
// Stage-6 emotion dots use the Rhythm heatmap encoding (single accent,
// opacity = frequency). Prototype only; not linked in nav.

import { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAssessments } from '../hooks/useAssessments';
import { useDemoData } from '../hooks/useDemoData';
import { useTheme } from '../hooks/useTheme';
import { Sigil } from '../components/sigil/Sigil';
import { sigilInputFromData, type SigilInput } from '../lib/sigil';
import type { AssessmentScores, DemoPulse } from '../types';

// The six maturity stages (baseline + pulse milestones)
const STAGES = [
  { key: 'empty',    pulses: 0,  label: 'No baseline',  note: 'ring + dot' },
  { key: 'baseline', pulses: 0,  label: 'Baseline',     note: 'bloom outline' },
  { key: 'p1',       pulses: 1,  label: 'Pulse 1',      note: '+ weave dimmed' },
  { key: 'p5',       pulses: 5,  label: 'Pulse 5',      note: '+ weave color' },
  { key: 'p12',      pulses: 12, label: 'Pulse 12',     note: '+ more weave' },
  { key: 'p30',      pulses: 30, label: 'Pulse 30',     note: '+ ring + dots' },
] as const;

function demoToInput(pulses: DemoPulse[]): SigilInput | null {
  if (!pulses.length) return null;
  const latest = pulses[pulses.length - 1];
  const bigFive = {
    openness: latest.openness, conscientiousness: latest.conscientiousness,
    extraversion: latest.extraversion, agreeableness: latest.agreeableness,
    emotional_stability: latest.emotional_stability,
  };
  const facets: Record<string, number> = {};
  const facetRows = pulses.filter(p => p.facets).map(p => p.facets!) as Record<string, number>[];
  if (facetRows.length) {
    for (const k of Object.keys(facetRows[0])) {
      facets[k] = facetRows.reduce((a, r) => a + (r[k] ?? 0), 0) / facetRows.length;
    }
  }
  // Aggregate demo emotions (Record<string, number>)
  const emotions: Record<string, number> = {};
  for (const p of pulses) {
    if (p.emotions) for (const [e, c] of Object.entries(p.emotions)) emotions[e] = (emotions[e] || 0) + c;
  }
  let sum = 0, cnt = 0;
  for (let i = 1; i < pulses.length; i++) {
    for (const k of Object.keys(bigFive) as (keyof typeof bigFive)[]) {
      sum += Math.abs((pulses[i][k] as number) - (pulses[i - 1][k] as number)); cnt++;
    }
  }
  return { bigFive, facets, pulseCount: pulses.length, emotions, evolution: cnt ? sum / cnt : 0, mode: 'frozen' };
}

function atPulses(base: SigilInput, pulses: number): SigilInput {
  return { ...base, pulseCount: pulses, mode: 'frozen' };
}

export function SigilLabPage() {
  const { user } = useAuth();
  const { baseline, pulses, loading } = useAssessments(user?.id ?? null);
  const { demoData, loading: demoLoading } = useDemoData();
  const { theme, toggleTheme } = useTheme();

  const userInput = useMemo<SigilInput | null>(() => {
    if (!baseline) return null;
    return sigilInputFromData(baseline.scores as AssessmentScores, pulses.length, pulses);
  }, [baseline, pulses]);

  const demoInput = useMemo(() => demoToInput(demoData), [demoData]);

  const sources = [
    { name: 'Your data', sub: baseline ? `baseline + ${pulses.length} pulses` : 'no baseline', input: userInput },
    { name: 'Demo subject', sub: `${demoData.length} pulses`, input: demoInput },
  ];

  const toggleBtn = (active: boolean) => ({
    padding: '6px 14px', background: active ? 'var(--color-accent)' : 'none',
    color: active ? 'var(--color-bg)' : 'var(--color-text-dim)',
    border: '1px solid var(--color-border)', borderRadius: '6px', cursor: 'pointer',
    fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase',
    letterSpacing: '0.12em',
  } as const);

  return (
    <div className="atlas-page" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-page)' }}>
      <header style={{ marginBottom: '28px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-text-dim)', marginBottom: '8px' }}>
          Prototype — not linked in nav
        </p>
        <h1 className="atlas-h1" style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-h1)', fontWeight: 500, color: 'var(--color-text)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '8px' }}>
          Sigil Lab — maturity timeline
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'var(--color-text-muted)', maxWidth: '660px' }}>
          The mark grows a body as you feed it data: bloom (self) → weave (texture) → color → dominant-trait ring + emotion dots. Milestone pips sit on the frame.
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={toggleTheme} style={toggleBtn(false)}>
            {theme === 'dark' ? '☀ Light' : '☾ Dark'}
          </button>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 4px' }}>
            Stage-6 dots: Rhythm heatmap
          </span>
        </div>
      </header>

      {(loading || demoLoading) && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-muted)' }}>Loading data…</p>
      )}

      {!loading && !demoLoading && sources.map(src => (
        !src.input ? null : (
          <section key={src.name} style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '18px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 500, color: 'var(--color-text)' }}>{src.name}</h2>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{src.sub}</span>
            </div>

            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap' }}>
                {STAGES.map(stage => (
                  <div key={stage.key} style={{ textAlign: 'center', flex: '1 1 130px', maxWidth: '170px' }}>
                    {stage.key === 'empty' ? (
                      <Sigil input={atPulses(src.input!, 0)} size={130} empty animate={false} />
                    ) : (
                      <Sigil input={atPulses(src.input!, stage.pulses)} size={130} showInsignia animate={false} />
                    )}
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text)', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {stage.label}
                    </p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-text-dim)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {stage.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )
      ))}

      <footer style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '8px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-dim)', letterSpacing: '0.06em' }}>
          Stage-6 ring color = your dominant Big Five trait (same token as charts). Emotion dots: positions seeded by facets, single accent tone, opacity by frequency (Rhythm encoding). Animation disabled here; live draw-on runs in-app.
        </p>
      </footer>
    </div>
  );
}
