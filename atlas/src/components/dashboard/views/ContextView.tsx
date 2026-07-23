import { useDashboardState } from '../../../state/DashboardContext';
import type { DemoPulse, Assessment } from '../../../types';

interface ContextViewProps {
  demoData: DemoPulse[];
  baseline: Assessment | null;
  pulses: Assessment[];
}

const TRAIT_COLORS: Record<string, string> = {
  openness: 'var(--color-openness)',
  conscientiousness: 'var(--color-conscientiousness)',
  extraversion: 'var(--color-extraversion)',
  agreeableness: 'var(--color-agreeableness)',
  emotional_stability: 'var(--color-stability)',
};

export function ContextView({ demoData, baseline }: ContextViewProps) {
  const { mode } = useDashboardState();

  if (mode === 'demo') {
    // Aggregate contexts from demo data
    const contextCounts: Record<string, number> = {};
    const contextTraitMap: Record<string, Record<string, number[]>> = {};

    demoData.forEach(d => {
      const ctxs = d.contexts ?? d.raw_contexts ?? [];
      ctxs.forEach(c => {
        contextCounts[c] = (contextCounts[c] || 0) + 1;
        if (!contextTraitMap[c]) contextTraitMap[c] = { openness: [], conscientiousness: [], extraversion: [], agreeableness: [], emotional_stability: [] };
        contextTraitMap[c].openness.push(d.openness);
        contextTraitMap[c].conscientiousness.push(d.conscientiousness);
        contextTraitMap[c].extraversion.push(d.extraversion);
        contextTraitMap[c].agreeableness.push(d.agreeableness);
        contextTraitMap[c].emotional_stability.push(d.emotional_stability);
      });
    });

    const sortedContexts = Object.entries(contextCounts).sort((a, b) => b[1] - a[1]);

    // Aggregate stress levels
    const stressValues = demoData
      .filter(d => d.diamonds && d.diamonds.stress !== undefined)
      .map(d => d.diamonds!.stress);

    // Aggregate variance (mean of all trait variances)
    const allEmotions: Record<string, number> = {};
    demoData.forEach(d => {
      if (d.emotions) {
        for (const [k, v] of Object.entries(d.emotions)) {
          allEmotions[k] = (allEmotions[k] || 0) + v;
        }
      }
    });

    // Aggregate DIAMONDS
    const diamondsAgg: Record<string, number[]> = {};
    demoData.forEach(d => {
      if (d.diamonds) {
        for (const [k, v] of Object.entries(d.diamonds)) {
          if (!diamondsAgg[k]) diamondsAgg[k] = [];
          diamondsAgg[k].push(v);
        }
      }
    });

    return (
      <div>
        <SectionLabel>Context Heatmap — Demo</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {sortedContexts.map(([ctx, count]) => {
            const traitData = contextTraitMap[ctx];
            return (
              <div key={ctx} style={{
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: '8px', padding: '16px',
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-serif)', fontSize: '16px', fontWeight: 500,
                    color: 'var(--color-text)',
                  }}>{ctx}</span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-dim)',
                  }}>{count}×</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {Object.entries(traitData).map(([trait, values]) => {
                    const avg = values.reduce((a, b) => a + b, 0) / values.length;
                    return (
                      <div key={trait} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase',
                          color: 'var(--color-text-dim)', width: '24px',
                        }}>{trait[0].toUpperCase()}</span>
                        <div style={{ flex: 1, height: '4px', background: 'var(--color-surface-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${avg}%`,
                            background: TRAIT_COLORS[trait] || 'var(--color-accent)',
                            borderRadius: '2px',
                          }} />
                        </div>
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: '10px',
                          color: 'var(--color-text-muted)', width: '28px', textAlign: 'right',
                        }}>{Math.round(avg)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Variance section */}
        <div style={{ marginTop: '32px' }}>
          <SectionLabel>Variance</SectionLabel>
          <p style={{
            fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: 1.6,
            color: 'var(--color-text-muted)',
          }}>
            Trait variance across {demoData.length} demo pulses reveals how much your personality fluctuates. Higher variance = more context-sensitivity.
          </p>
        </div>

        {/* Stress section */}
        {stressValues.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <SectionLabel>Stress Level</SectionLabel>
            <div style={{ maxWidth: '400px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-muted)' }}>Average</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text)' }}>
                  {(stressValues.reduce((a, b) => a + b, 0) / stressValues.length).toFixed(1)}
                </span>
              </div>
              <div style={{ height: '6px', background: 'var(--color-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(stressValues.reduce((a, b) => a + b, 0) / stressValues.length) * 10}%`,
                  background: 'var(--color-warning)', borderRadius: '3px',
                }} />
              </div>
            </div>
          </div>
        )}

        {/* DIAMONDS section */}
        {Object.keys(diamondsAgg).length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <SectionLabel>DIAMONDS Context Dimensions</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
              {Object.entries(diamondsAgg).map(([dim, values]) => {
                const avg = values.reduce((a, b) => a + b, 0) / values.length;
                return (
                  <div key={dim} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 12px', background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)', borderRadius: '6px',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase',
                      letterSpacing: '0.08em', color: 'var(--color-text-muted)',
                    }}>{dim}</span>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600,
                      color: 'var(--color-accent)',
                    }}>{avg.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Emotions */}
        {Object.keys(allEmotions).length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <SectionLabel>Emotion Frequency</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.entries(allEmotions).sort((a, b) => b[1] - a[1]).map(([emotion, count]) => (
                <span key={emotion} style={{
                  padding: '4px 10px', background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)', borderRadius: '12px',
                  fontFamily: 'var(--font-mono)', fontSize: '11px',
                  color: 'var(--color-text-muted)',
                }}>
                  {emotion} <span style={{ color: 'var(--color-text-dim)' }}>·{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Baseline mode
  if (!baseline) return null;

  const contextAnswers = baseline.scores?.context;

  return (
    <div>
      <SectionLabel>Context — Baseline</SectionLabel>

      {contextAnswers && Object.keys(contextAnswers).length > 0 ? (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px',
        }}>
          {Object.entries(contextAnswers).map(([key, value]) => (
            <div key={key} style={{
              padding: '12px 16px', background: 'var(--color-surface)',
              border: '1px solid var(--color-border)', borderRadius: '8px',
            }}>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'var(--color-text-dim)', marginBottom: '6px',
              }}>{key.replace(/_/g, ' ')}</p>
              <p style={{
                fontFamily: 'var(--font-sans)', fontSize: '14px',
                color: 'var(--color-text)',
              }}>{String(value)}</p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: 1.6,
          color: 'var(--color-text-muted)',
        }}>
          No context data recorded in your baseline assessment.
        </p>
      )}

      <div style={{ marginTop: '24px' }}>
        <p style={{
          fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 500,
          color: 'var(--color-text)', marginBottom: '8px', letterSpacing: '-0.02em',
        }}>
          Context patterns appear with more pulses.
        </p>
        <p style={{
          fontFamily: 'var(--font-sans)', fontSize: '14px', lineHeight: 1.6,
          color: 'var(--color-text-muted)', maxWidth: '480px',
        }}>
          As you complete weekly pulses, context heatmaps, variance, stress levels, and DIAMONDS dimensions will emerge to reveal how different situations shape your personality expression.
        </p>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase',
      letterSpacing: '0.12em', color: 'var(--color-text-dim)', marginBottom: '16px',
    }}>
      {children}
    </p>
  );
}
