import { useState, useEffect, useRef, useCallback } from 'react';
import { useGSAP } from '../../lib/motion';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { scorePulseResponses } from '../../lib/scoring';
import { IPIP_TEXTS } from '../../lib/assessment-data';
import type { BigFiveScores } from '../../types';
import RadarChart from '../dashboard/charts/RadarChart';

type Phase = 'intro' | 'items' | 'complete';

const PULSE_SCALE = [
  { value: 1, label: 'Not at all' },
  { value: 2, label: 'Slightly' },
  { value: 3, label: 'Moderately' },
  { value: 4, label: 'Very' },
  { value: 5, label: 'Extremely' },
];

const CONTEXT_OPTIONS = ['Work', 'Home', 'Social', 'Stressed', 'Leisure'];

const EMOTIONS = [
  'Focused', 'Calm', 'Energetic', 'Anxious', 'Frustrated',
  'Grateful', 'Bored', 'Motivated', 'Overwhelmed', 'Hopeful',
];

// Facet rotation for pulses — covers all 30 facets
const TRAIT_FACETS: Record<string, { facet: string; ipipIds: number[] }[]> = {
  N: [
    { facet: 'Anxiety', ipipIds: [1, 31, 61, 91] },
    { facet: 'Anger', ipipIds: [6, 36, 66, 96] },
    { facet: 'Depression', ipipIds: [11, 41, 71, 101] },
    { facet: 'Self-consciousness', ipipIds: [16, 46, 76, 106] },
    { facet: 'Immoderation', ipipIds: [21, 51, 81, 111] },
    { facet: 'Vulnerability', ipipIds: [26, 56, 86, 116] },
  ],
  E: [
    { facet: 'Friendliness', ipipIds: [2, 32, 62, 92] },
    { facet: 'Gregariousness', ipipIds: [7, 37, 67, 97] },
    { facet: 'Assertiveness', ipipIds: [12, 42, 72, 102] },
    { facet: 'Activity', ipipIds: [17, 47, 77, 107] },
    { facet: 'Excitement-seeking', ipipIds: [22, 52, 82, 112] },
    { facet: 'Cheerfulness', ipipIds: [27, 57, 87, 117] },
  ],
  O: [
    { facet: 'Imagination', ipipIds: [3, 33, 63, 93] },
    { facet: 'Artistic', ipipIds: [8, 38, 68, 98] },
    { facet: 'Emotionality', ipipIds: [13, 43, 73, 103] },
    { facet: 'Adventurousness', ipipIds: [18, 48, 78, 108] },
    { facet: 'Intellect', ipipIds: [23, 53, 83, 113] },
    { facet: 'Liberalism', ipipIds: [28, 58, 88, 118] },
  ],
  A: [
    { facet: 'Trust', ipipIds: [4, 34, 64, 94] },
    { facet: 'Morality', ipipIds: [9, 39, 69, 99] },
    { facet: 'Altruism', ipipIds: [14, 44, 74, 104] },
    { facet: 'Cooperation', ipipIds: [19, 49, 79, 109] },
    { facet: 'Modesty', ipipIds: [24, 54, 84, 114] },
    { facet: 'Sympathy', ipipIds: [29, 59, 89, 119] },
  ],
  C: [
    { facet: 'Self-efficacy', ipipIds: [5, 35, 65, 95] },
    { facet: 'Orderliness', ipipIds: [10, 40, 70, 100] },
    { facet: 'Dutifulness', ipipIds: [15, 45, 75, 105] },
    { facet: 'Achievement-striving', ipipIds: [20, 50, 80, 110] },
    { facet: 'Self-discipline', ipipIds: [25, 55, 85, 115] },
    { facet: 'Cautiousness', ipipIds: [30, 60, 90, 120] },
  ],
};

// Generate pulse items for a given pulse number and week
function generatePulseItems(pulseNumber: number): { ipipId: number; text: string; trait: string; facet: string }[] {
  const items: { ipipId: number; text: string; trait: string; facet: string }[] = [];
  const traits: ('N' | 'E' | 'O' | 'A' | 'C')[] = ['N', 'E', 'O', 'A', 'C'];

  // For each trait, select facets based on pulse number
  for (const trait of traits) {
    const facets = TRAIT_FACETS[trait];
    const facetIdx = (pulseNumber - 1) % facets.length;
    const secondFacetIdx = (facetIdx + 1) % facets.length;

    // Phase 1: 2 items per trait; Phase 2: 1 item per trait
    const itemCount = pulseNumber > 3 ? 1 : 2;
    const selectedFacets = [facets[facetIdx]];
    if (itemCount === 2) {
      selectedFacets.push(facets[secondFacetIdx]);
    }

    for (const fc of selectedFacets) {
      // Rotate within the 4 available ipip ids per facet
      const itemOffset = Math.floor((pulseNumber - 1) / facets.length) % fc.ipipIds.length;
      const ipipId = fc.ipipIds[itemOffset];
      const itemText = IPIP_TEXTS.find((it) => it.id === ipipId)?.text || '';
      items.push({ ipipId, text: itemText, trait, facet: fc.facet });
    }
  }

  return items;
}

export function WeeklyPulse() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('intro');
  const [pulseNumber, setPulseNumber] = useState(1);
  const [weekNumber, setWeekNumber] = useState(1);
  const [phaseLabel, setPhaseLabel] = useState<'Loading' | 'Maintenance'>('Loading');
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [context, setContext] = useState<string | null>(null);
  const [emotions, setEmotions] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [scores, setScores] = useState<BigFiveScores | null>(null);
  const [baselineScores, setBaselineScores] = useState<BigFiveScores | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [statusRetry, setStatusRetry] = useState(0);

  const itemsRef = useRef<HTMLDivElement>(null);

  // Determine pulse number and week from Supabase
  useEffect(() => {
    async function checkStatus() {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from('assessments')
          .select('id, type, timestamp, week, phase')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: true });

        if (error) throw error;

        const pulses = (data || []).filter((a: any) => a.type === 'pulse');
        const nextPulse = pulses.length + 1;
        setPulseNumber(nextPulse);
        const wk = nextPulse;
        setWeekNumber(wk);
        const ph = wk > 3 ? 'Maintenance' : 'Loading';
        setPhaseLabel(ph);

        // Cadence: 7 days (Loading phase, pulses 1-3), 14 days (Maintenance phase, pulse 4+)
        const cadenceDays = ph === 'Maintenance' ? 14 : 7;

        // Check if already completed this period
        const lastPulse = pulses[pulses.length - 1];
        if (lastPulse) {
          const lastDate = new Date(lastPulse.timestamp);
          const now = new Date();
          const daysSince = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSince < cadenceDays) {
            setAlreadyCompleted(true);
          }
        }

        // Fetch baseline scores for comparison
        const baseline = (data || []).find((a: any) => a.type === 'baseline');
        if (baseline) {
          const { data: fullBaseline } = await supabase
            .from('assessments')
            .select('scores')
            .eq('id', baseline.id)
            .single();
          if (fullBaseline?.scores?.bigFive) {
            setBaselineScores(fullBaseline.scores.bigFive);
          }
        }
      } catch (err) {
        console.error('Failed to check pulse status:', err);
        setStatusError('Could not load your pulse status. Check your connection and retry.');
      }
    }
    checkStatus();
  }, [user?.id, statusRetry]);

  const pulseItems = generatePulseItems(pulseNumber);
  const allItemsAnswered = pulseItems.every((item) => responses[`ipip_${item.ipipId}`] !== undefined);

  // GSAP entrance
  useGSAP(() => {
    if (itemsRef.current) {
      gsap.fromTo(
        itemsRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      );
    }
  }, { scope: itemsRef, dependencies: [phase] });

  const answerItem = useCallback((ipipId: number, value: number) => {
    setResponses((prev) => ({ ...prev, [`ipip_${ipipId}`]: value }));
  }, []);

  // Keyboard support
  useEffect(() => {
    if (phase !== 'items') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '5') {
        const value = parseInt(e.key);
        const firstUnanswered = pulseItems.find(
          (item) => responses[`ipip_${item.ipipId}`] === undefined,
        );
        if (firstUnanswered) {
          answerItem(firstUnanswered.ipipId, value);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, pulseItems, responses, answerItem]);

  const toggleEmotion = (emo: string) => {
    setEmotions((prev) =>
      prev.includes(emo) ? prev.filter((e) => e !== emo) : [...prev, emo],
    );
  };

  const handleSubmit = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const scored = scorePulseResponses(responses);
      setScores(scored);

      if (user?.id) {
        const { error } = await supabase.from('assessments').insert({
          user_id: user.id,
          type: 'pulse',
          timestamp: new Date().toISOString(),
          week: weekNumber,
          phase: phaseLabel,
          responses,
          scores: { bigFive: scored },
          contexts: context ? [context] : null,
          emotions: emotions.length > 0 ? emotions : null,
          note: note.trim() || null,
        });
        if (error) throw error;
      }

      setPhase('complete');
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save pulse');
    } finally {
      setSaving(false);
    }
  };

  // ── Intro screen ─────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div ref={itemsRef} className="atlas-page" style={{ padding: '60px 40px', maxWidth: '640px', margin: '0 auto' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'var(--color-accent)', opacity: 0.8, marginBottom: '16px',
        }}>
          Weekly Pulse
        </div>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-h1)', fontWeight: 400,
          color: 'var(--color-text)', letterSpacing: '-0.02em',
          lineHeight: 1.1, marginBottom: '16px',
        }}>
          How are you, right now?
        </h1>
        <p style={{
          fontSize: '15px', color: 'var(--color-text-muted)',
          lineHeight: 1.7, marginBottom: '32px', maxWidth: '520px',
        }}>
          A quick check-in that captures your current state — not who you are in general,
          but how you feel right now. This adds a new point to your trajectory.
        </p>

        {/* Pulse meta */}
        <div style={{
          padding: '18px 22px', background: 'var(--color-surface)',
          border: '1px solid var(--color-border)', borderLeft: '2px solid var(--color-accent)',
          borderRadius: 'var(--radius-element)', marginBottom: '32px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--color-text-dim)',
            }}>Pulse number</span>
            <span style={{
              fontFamily: 'var(--font-serif)', fontSize: '15px', color: 'var(--color-text)',
            }}>{pulseNumber}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--color-text-dim)',
            }}>Week</span>
            <span style={{
              fontFamily: 'var(--font-serif)', fontSize: '15px', color: 'var(--color-text)',
            }}>{weekNumber}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--color-text-dim)',
            }}>Phase</span>
            <span style={{
              fontFamily: 'var(--font-serif)', fontSize: '15px', color: 'var(--color-text)',
            }}>{phaseLabel}</span>
          </div>
        </div>

        {alreadyCompleted && (
          <div style={{
            padding: '14px 18px', background: 'var(--color-surface)',
            border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-element)',
            marginBottom: '24px', fontSize: '13px', color: 'var(--color-warning)',
          }}>
            You've already completed a pulse this period. You can submit another, but{' '}
            {phaseLabel === 'Loading' ? 'weekly' : 'bi-weekly'} spacing is recommended for best results.
          </div>
        )}

        <div style={{ marginBottom: '32px' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--color-text-dim)', marginBottom: '8px',
          }}>
            This pulse contains
          </div>
          <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            {phaseLabel === 'Loading' ? '10' : '5'} personality items · 1 context question · 1 emotion check · optional note
          </div>
        </div>

        {statusError && (
          <div style={{
            padding: '14px 18px', background: 'var(--color-surface)',
            border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-element)',
            marginBottom: '24px', fontSize: '13px', color: 'var(--color-danger)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
          }}>
            <span>{statusError}</span>
            <button
              onClick={() => { setStatusError(''); setStatusRetry(r => r + 1); }}
              style={{
                padding: '6px 14px', background: 'none', border: '1px solid var(--color-danger)',
                borderRadius: 'var(--radius-element)', color: 'var(--color-danger)', fontSize: '12px',
                cursor: 'pointer', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap',
              }}
            >
              Retry
            </button>
          </div>
        )}

        <button
          onClick={() => setPhase('items')}
          style={{
            padding: '14px 32px',
            background: 'var(--color-accent)',
            color: 'var(--color-bg)',
            border: 'none', borderRadius: 'var(--radius-button)',
            fontSize: '15px', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-sans)',
          }}
        >
          Begin Pulse →
        </button>
      </div>
    );
  }

  // ── Complete screen ──────────────────────────────────────────────
  if (phase === 'complete' && scores) {
    return (
      <div ref={itemsRef} className="atlas-page" style={{ padding: '60px 40px', maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'var(--color-accent)', opacity: 0.8, marginBottom: '16px',
        }}>
          Pulse {pulseNumber} Complete
        </div>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-h1)', fontWeight: 400,
          color: 'var(--color-text)', letterSpacing: '-0.02em',
          marginBottom: '8px', lineHeight: 1.1,
        }}>
          Your snapshot is recorded.
        </h1>
        <p style={{
          fontSize: '15px', color: 'var(--color-text-muted)',
          lineHeight: 1.6, marginBottom: '40px',
        }}>
          Pulse {pulseNumber} · Week {weekNumber} · {phaseLabel} phase
        </p>

        {/* Comparison radar charts */}
        {baselineScores && (
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '40px',
            marginBottom: '40px', flexWrap: 'wrap',
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '10px',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--color-text-dim)', marginBottom: '12px',
              }}>Baseline</div>
              <RadarChart scores={baselineScores} size={260} animate={false} />
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '10px',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--color-accent)', marginBottom: '12px',
              }}>This Pulse</div>
              <RadarChart scores={scores} size={260} />
            </div>
          </div>
        )}

        {!baselineScores && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
            <RadarChart scores={scores} size={340} />
          </div>
        )}

        {/* Score deltas */}
        {baselineScores && (
          <div className="atlas-score-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px', marginBottom: '40px', maxWidth: '520px', margin: '0 auto 40px',
          }}>
            {Object.entries(scores).map(([key, val]) => {
              const baseVal = baselineScores[key as keyof BigFiveScores];
              const delta = Math.round((val - baseVal) * 10) / 10;
              return (
                <div key={key} style={{
                  padding: '12px 8px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-button)',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '9px',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    color: 'var(--color-text-dim)', marginBottom: '4px',
                  }}>
                    {key.replace('_', ' ').slice(0, 8)}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-h3)',
                    color: 'var(--color-text)', fontWeight: 500,
                  }}>
                    {val}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '10px',
                    color: delta > 0 ? 'var(--color-success)' : delta < 0 ? 'var(--color-danger)' : 'var(--color-text-dim)',
                    marginTop: '2px',
                  }}>
                    {delta > 0 ? '▲ +' : delta < 0 ? '▼ ' : '· '}{delta}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '14px 32px',
              background: 'var(--color-accent)',
              color: 'var(--color-bg)',
              border: 'none', borderRadius: 'var(--radius-button)',
              fontSize: '15px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}
          >
            View Dashboard →
          </button>
          <button
            onClick={() => navigate('/pulse')}
            style={{
              padding: '14px 32px',
              background: 'none',
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-button)',
              fontSize: '15px', fontWeight: 500,
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}
          >
            Back to Pulse
          </button>
        </div>
      </div>
    );
  }

  // ── Items screen ─────────────────────────────────────────────────
  return (
    <div ref={itemsRef} className="atlas-page" style={{ padding: '60px 40px 80px', maxWidth: '680px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px',
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--color-accent)', opacity: 0.7, marginBottom: '8px',
        }}>
          Pulse {pulseNumber} · Week {weekNumber} · {phaseLabel}
        </div>
        <p style={{
          fontFamily: 'var(--font-serif)', fontSize: '17px',
          color: 'var(--color-text-muted)', lineHeight: 1.5, fontStyle: 'italic',
        }}>
          Answer each statement for how you feel <em>right now</em> — not in general.
        </p>
      </div>

      {/* Personality items */}
      <div style={{ marginBottom: '40px' }}>
        {pulseItems.map((item) => (
          <div key={item.ipipId} style={{
            padding: '18px 0',
            borderBottom: '1px solid var(--color-border)',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '9px',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--color-text-dim)', marginBottom: '6px',
            }}>
              {item.trait} · {item.facet}
            </div>
            <p style={{
              fontFamily: 'var(--font-serif)', fontSize: '17px',
              color: 'var(--color-text)', lineHeight: 1.45,
              marginBottom: '14px', fontWeight: 400,
            }}>
              <span style={{ color: 'var(--color-accent)', fontStyle: 'italic' }}>Right now, I </span>
              {item.text.toLowerCase().replace(/\.$/, '')}.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
              {PULSE_SCALE.map((opt) => {
                const selected = responses[`ipip_${item.ipipId}`] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => answerItem(item.ipipId, opt.value)}
                    style={{
                      padding: '14px 4px 10px',
                      background: selected ? 'var(--color-surface-elevated)' : 'var(--color-surface)',
                      border: `1px solid ${selected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-element)',
                      color: selected ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      fontSize: '11px', fontFamily: 'var(--font-sans)', fontWeight: 500,
                      cursor: 'pointer', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: '4px', lineHeight: 1.2,
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600,
                      color: selected ? 'var(--color-accent)' : 'var(--color-text-dim)',
                    }}>
                      {opt.value}
                    </span>
                    <span style={{ fontSize: '10px' }}>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Context question */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{
          fontFamily: 'var(--font-serif)', fontSize: '17px',
          color: 'var(--color-text)', lineHeight: 1.4,
          marginBottom: '14px', fontWeight: 400,
        }}>
          Where are you?
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CONTEXT_OPTIONS.map((opt) => {
            const selected = context === opt;
            return (
              <button
                key={opt}
                onClick={() => setContext(selected ? null : opt)}
                style={{
                  padding: '10px 18px',
                  background: selected ? 'var(--color-accent)' : 'var(--color-surface)',
                  border: `1px solid ${selected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-pill)',
                  color: selected ? 'var(--color-bg)' : 'var(--color-text-muted)',
                  fontSize: '13px', fontFamily: 'var(--font-sans)',
                  cursor: 'pointer', fontWeight: selected ? 600 : 400,
                  transition: 'all 0.18s ease',
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Emotion question */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{
          fontFamily: 'var(--font-serif)', fontSize: '17px',
          color: 'var(--color-text)', lineHeight: 1.4,
          marginBottom: '14px', fontWeight: 400,
        }}>
          How are you feeling?
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {EMOTIONS.map((emo) => {
            const selected = emotions.includes(emo);
            return (
              <button
                key={emo}
                onClick={() => toggleEmotion(emo)}
                style={{
                  padding: '10px 16px',
                  background: selected ? 'var(--color-surface-elevated)' : 'var(--color-surface)',
                  border: `1px solid ${selected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-pill)',
                  color: selected ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  fontSize: '13px', fontFamily: 'var(--font-sans)',
                  cursor: 'pointer', fontWeight: selected ? 600 : 400,
                  transition: 'all 0.18s ease',
                }}
              >
                {emo}
              </button>
            );
          })}
        </div>
      </div>

      {/* Note field */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{
          fontFamily: 'var(--font-serif)', fontSize: '17px',
          color: 'var(--color-text)', lineHeight: 1.4,
          marginBottom: '14px', fontWeight: 400,
        }}>
          Anything else? <span style={{ color: 'var(--color-text-dim)', fontSize: '14px' }}>(optional)</span>
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="A brief note about your week…"
          rows={3}
          style={{
            width: '100%', padding: '12px 14px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-button)',
            color: 'var(--color-text)', fontSize: '14px',
            fontFamily: 'var(--font-sans)', outline: 'none', resize: 'vertical',
          }}
        />
      </div>

      {/* Submit */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSubmit}
          disabled={!allItemsAnswered || saving}
          style={{
            padding: '14px 32px',
            background: allItemsAnswered && !saving ? 'var(--color-accent)' : 'var(--color-surface)',
            color: allItemsAnswered && !saving ? 'var(--color-bg)' : 'var(--color-text-dim)',
            border: 'none', borderRadius: 'var(--radius-button)',
            fontSize: '15px', fontWeight: 600,
            cursor: allItemsAnswered && !saving ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--font-sans)',
            transition: 'all 0.2s ease',
          }}
        >
          {saving ? 'Saving…' : 'Submit Pulse →'}
        </button>
      </div>

      {saveError && (
        <p style={{ color: 'var(--color-danger)', fontSize: '13px', marginTop: '16px', textAlign: 'right' }}>
          {saveError}
        </p>
      )}
    </div>
  );
}
