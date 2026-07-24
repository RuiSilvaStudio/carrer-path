import { useState, useEffect, useRef, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { scoreBaselineResponses } from '../../lib/scoring';
import {
  IPIP_SECTIONS,
  ICAR_ITEMS,
  SD3_ITEMS,
  CONTEXT_QUESTIONS,
  IPIP_TITLE,
  ICAR_TITLE,
  ICAR_DESCRIPTION,
  SD3_DESCRIPTION,
  type IPIPItem,
  type SD3Item,
} from '../../lib/assessment-data';
import type { BigFiveScores } from '../../types';
import RadarChart from '../dashboard/charts/RadarChart';

interface BaselineAssessmentProps {
}

type Phase = 'welcome' | 'ipip' | 'icar' | 'sd3' | 'context' | 'complete';

const STORAGE_KEY = 'atlas_baseline_progress';

const LIKERT_SCALE = [
  { value: 1, label: 'Very Inaccurate' },
  { value: 2, label: 'Moderately Inaccurate' },
  { value: 3, label: 'Neither' },
  { value: 4, label: 'Moderately Accurate' },
  { value: 5, label: 'Very Accurate' },
];

const SD3_SCALE = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neither' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];

const ITEMS_PER_SCREEN = 6;

// Section descriptions for IPIP
const TRAIT_DESCRIPTIONS: Record<string, string> = {
  'Neuroticism (N)': 'Sensitivity to negative emotions. This is measured as emotional stability (higher = more stable).',
  'Extraversion (E)': 'Engagement with the external world — sociability, activity, positive emotions.',
  'Openness (O)': 'Curiosity, imagination, and openness to new experiences and ideas.',
  'Agreeableness (A)': 'Interpersonal orientation — cooperation, sympathy, trust, morality.',
  'Conscientiousness (C)': 'Organization, self-discipline, and goal-directed behavior.',
  'Cross-Trait Items': 'A mixed set covering all five domains in varied order.',
};

export function BaselineAssessment({}: BaselineAssessmentProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('welcome');
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [ipipSectionIdx, setIpipSectionIdx] = useState(0);
  const [ipipScreenIdx, setIpipScreenIdx] = useState(0); // screen within section
  const [icarIdx, setIcarIdx] = useState(0);
  const [sd3Idx, setSd3Idx] = useState(0);
  const [contextValues, setContextValues] = useState<Record<string, string | number>>({});
  const [scores, setScores] = useState<{ bigFive: BigFiveScores; sd3: any; icar: any } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const sectionRef = useRef<HTMLDivElement>(null);

  // Load saved progress
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.responses) setResponses(data.responses);
        if (data.phase) setPhase(data.phase);
        if (data.ipipSectionIdx !== undefined) setIpipSectionIdx(data.ipipSectionIdx);
        if (data.ipipScreenIdx !== undefined) setIpipScreenIdx(data.ipipScreenIdx);
        if (data.icarIdx !== undefined) setIcarIdx(data.icarIdx);
        if (data.sd3Idx !== undefined) setSd3Idx(data.sd3Idx);
        if (data.contextValues) setContextValues(data.contextValues);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Auto-save to localStorage
  const saveProgress = useCallback(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ responses, phase, ipipSectionIdx, ipipScreenIdx, icarIdx, sd3Idx, contextValues }),
      );
    } catch {
      // ignore
    }
  }, [responses, phase, ipipSectionIdx, ipipScreenIdx, icarIdx, sd3Idx, contextValues]);

  useEffect(() => {
    if (phase !== 'complete' && phase !== 'welcome') {
      saveProgress();
    }
  }, [responses, phase, ipipSectionIdx, ipipScreenIdx, icarIdx, sd3Idx, contextValues, saveProgress]);

  // GSAP transition between sections
  useGSAP(() => {
    if (sectionRef.current) {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      );
    }
  }, { scope: sectionRef, dependencies: [phase, ipipSectionIdx, ipipScreenIdx, icarIdx, sd3Idx] });

  // ── Total progress calculation ──────────────────────────────────
  const totalItems = 120 + 16 + 27; // 163 rated items + 5 context
  const answeredCount = Object.keys(responses).filter((k) =>
    k.startsWith('ipip_') || k.startsWith('sd3_') || k.startsWith('icar_'),
  ).length;
  const progressPct = Math.round((answeredCount / totalItems) * 100);

  // ── IPIP current screen items ───────────────────────────────────
  const currentIPIPSection = IPIP_SECTIONS[ipipSectionIdx];
  const ipipScreensInSection = Math.ceil(currentIPIPSection.items.length / ITEMS_PER_SCREEN);
  const ipipScreenItems = currentIPIPSection.items.slice(
    ipipScreenIdx * ITEMS_PER_SCREEN,
    (ipipScreenIdx + 1) * ITEMS_PER_SCREEN,
  );

  const allIPIPScreenAnswered = ipipScreenItems.every(
    (item) => responses[`ipip_${item.id}`] !== undefined,
  );

  // ── Handle IPIP answer ──────────────────────────────────────────
  const answerIPIP = (itemId: number, value: number) => {
    setResponses((prev) => ({ ...prev, [`ipip_${itemId}`]: value }));
  };

  const handleIPIPNext = () => {
    if (ipipScreenIdx < ipipScreensInSection - 1) {
      setIpipScreenIdx(ipipScreenIdx + 1);
    } else if (ipipSectionIdx < IPIP_SECTIONS.length - 1) {
      setIpipSectionIdx(ipipSectionIdx + 1);
      setIpipScreenIdx(0);
    } else {
      setPhase('icar');
    }
  };

  const handleIPIPBack = () => {
    if (ipipScreenIdx > 0) {
      setIpipScreenIdx(ipipScreenIdx - 1);
    } else if (ipipSectionIdx > 0) {
      setIpipSectionIdx(ipipSectionIdx - 1);
      const prevSection = IPIP_SECTIONS[ipipSectionIdx - 1];
      setIpipScreenIdx(Math.ceil(prevSection.items.length / ITEMS_PER_SCREEN) - 1);
    } else {
      setPhase('welcome');
    }
  };

  // ── Keyboard support for IPIP ───────────────────────────────────
  useEffect(() => {
    if (phase !== 'ipip') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '5') {
        const value = parseInt(e.key);
        // Find first unanswered item on screen
        const firstUnanswered = ipipScreenItems.find(
          (item) => responses[`ipip_${item.id}`] === undefined,
        );
        if (firstUnanswered) {
          answerIPIP(firstUnanswered.id, value);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, ipipScreenItems, responses]);

  // ── ICAR handling ───────────────────────────────────────────────
  const currentICAR = ICAR_ITEMS[icarIdx];
  const handleICARAnswer = (optionIdx: number) => {
    setResponses((prev) => ({ ...prev, [`icar_${currentICAR.id}`]: optionIdx }));
    if (icarIdx < ICAR_ITEMS.length - 1) {
      setIcarIdx(icarIdx + 1);
    } else {
      setPhase('sd3');
    }
  };

  // ── SD3 handling ────────────────────────────────────────────────
  const sd3ScreenItems = SD3_ITEMS.slice(sd3Idx * ITEMS_PER_SCREEN, (sd3Idx + 1) * ITEMS_PER_SCREEN);
  const allSD3ScreenAnswered = sd3ScreenItems.every(
    (item) => responses[`sd3_${item.id}`] !== undefined,
  );
  const sd3TotalScreens = Math.ceil(SD3_ITEMS.length / ITEMS_PER_SCREEN);

  const answerSD3 = (itemId: number, value: number) => {
    setResponses((prev) => ({ ...prev, [`sd3_${itemId}`]: value }));
  };

  const handleSD3Next = () => {
    if (sd3Idx < sd3TotalScreens - 1) {
      setSd3Idx(sd3Idx + 1);
    } else {
      setPhase('context');
    }
  };

  const handleSD3Back = () => {
    if (sd3Idx > 0) {
      setSd3Idx(sd3Idx - 1);
    } else {
      setPhase('icar');
      setIcarIdx(ICAR_ITEMS.length - 1);
    }
  };

  // ── SD3 keyboard ────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'sd3') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '5') {
        const value = parseInt(e.key);
        const firstUnanswered = sd3ScreenItems.find(
          (item) => responses[`sd3_${item.id}`] === undefined,
        );
        if (firstUnanswered) {
          answerSD3(firstUnanswered.id, value);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, sd3ScreenItems, responses]);

  // ── Context handling ─────────────────────────────────────────────
  const allContextAnswered = CONTEXT_QUESTIONS.every((q) => contextValues[q.id] !== undefined);

  const handleContextAnswer = (id: string, value: string | number) => {
    setContextValues((prev) => ({ ...prev, [id]: value }));
  };

  // ── Completion ───────────────────────────────────────────────────
  const handleComplete = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const scored = scoreBaselineResponses(responses);
      // Convert context values to numbers where needed for saving
      const contextForSave = {
        current_role: contextValues.current_role as string,
        life_event: contextValues.life_event as string,
        stress_level: contextValues.stress_level as number,
        energy_level: contextValues.energy_level as number,
        primary_context: contextValues.primary_context as string,
      };

      const scoresPayload = {
        bigFive: scored.bigFive,
        facets: scored.facets,
        sd3: scored.sd3,
        icar: scored.icar,
        context: contextForSave,
      };

      if (user?.id) {
        const { error } = await supabase.from('assessments').insert({
          user_id: user.id,
          type: 'baseline',
          timestamp: new Date().toISOString(),
          responses,
          scores: scoresPayload,
          contexts: null,
          emotions: null,
          note: null,
        });
        if (error) throw error;
      }

      setScores(scored);
      setPhase('complete');
      localStorage.removeItem(STORAGE_KEY);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────
  if (phase === 'welcome') {
    return (
      <div ref={sectionRef} style={{ padding: '60px 40px', maxWidth: '720px', margin: '0 auto' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'var(--color-accent)', opacity: 0.8, marginBottom: '16px',
        }}>
          Baseline Assessment
        </div>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: '42px', fontWeight: 400,
          color: 'var(--color-text)', letterSpacing: '-0.02em',
          lineHeight: 1.1, marginBottom: '20px',
        }}>
          Your starting point.
        </h1>
        <p style={{
          fontSize: '15px', color: 'var(--color-text-muted)',
          lineHeight: 1.7, maxWidth: '560px', marginBottom: '40px',
        }}>
          This assessment captures a comprehensive snapshot of your personality across four domains.
          It takes approximately 15–20 minutes. Your responses establish the baseline against which
          all future pulses will be compared.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
          <SectionCard label="01" title={IPIP_TITLE} desc="120 statements about your typical behavior. 6 sections, 20 items each." count="120 items" />
          <SectionCard label="02" title={ICAR_TITLE} desc="16 cognitive ability questions. Multiple choice, no time limit." count="16 items" />
          <SectionCard label="03" title="Motivational Drivers" desc={SD3_DESCRIPTION} count="27 items" />
          <SectionCard label="04" title="Context" desc="5 quick questions about your current life situation." count="5 items" />
        </div>

        <button
          onClick={() => {
            // Check if there's saved progress
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
              setPhase(JSON.parse(saved).phase || 'ipip');
            } else {
              setPhase('ipip');
            }
          }}
          style={{
            padding: '14px 32px',
            background: 'var(--color-accent)',
            color: 'var(--color-bg)',
            border: 'none', borderRadius: '6px',
            fontSize: '15px', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-sans)',
            letterSpacing: '0.02em',
          }}
        >
          Begin Assessment
        </button>
        <button
          onClick={() => navigate('/docs')}
          style={{
            padding: '14px 28px',
            background: 'none',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            fontSize: '14px', fontWeight: 500,
            cursor: 'pointer', fontFamily: 'var(--font-sans)',
            marginLeft: '12px',
          }}
        >
          Explore Dashboard (Demo Data) →
        </button>
      </div>
    );
  }

  if (phase === 'complete' && scores) {
    return (
      <div ref={sectionRef} style={{ padding: '60px 40px', maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 500,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          color: 'var(--color-accent)', opacity: 0.8, marginBottom: '16px',
        }}>
          Assessment Complete
        </div>
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 400,
          color: 'var(--color-text)', letterSpacing: '-0.02em',
          marginBottom: '8px', lineHeight: 1.1,
        }}>
          Your baseline is set.
        </h1>
        <p style={{
          fontSize: '15px', color: 'var(--color-text-muted)',
          lineHeight: 1.6, marginBottom: '32px',
        }}>
          This snapshot will serve as the reference point for all future pulses.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <RadarChart scores={scores.bigFive} size={360} />
        </div>

        {/* Score summary */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '8px', marginBottom: '40px', maxWidth: '520px', margin: '0 auto 40px',
        }}>
          {Object.entries(scores.bigFive).map(([key, val]) => (
            <div key={key} style={{
              padding: '12px 8px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '9px',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                color: 'var(--color-text-dim)', marginBottom: '4px',
              }}>
                {key.replace('_', ' ').slice(0, 8)}
              </div>
              <div style={{
                fontFamily: 'var(--font-serif)', fontSize: '22px',
                color: 'var(--color-text)', fontWeight: 500,
              }}>
                {val}
              </div>
            </div>
          ))}
        </div>

        {/* SD3 + ICAR */}
        <div style={{
          display: 'flex', gap: '16px', justifyContent: 'center',
          marginBottom: '40px', flexWrap: 'wrap',
        }}>
          <div style={{
            padding: '16px 20px', background: 'var(--color-surface)',
            border: '1px solid var(--color-border)', borderRadius: '6px',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '9px',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              color: 'var(--color-text-dim)', marginBottom: '8px',
            }}>Motivational Drivers</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              {Object.entries(scores.sd3).map(([k, v]) => (
                <div key={k}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-dim)' }}>
                    {k.slice(0, 4)}
                  </span>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--color-text)', marginLeft: '4px' }}>
                    {v as number}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div style={{
            padding: '16px 20px', background: 'var(--color-surface)',
            border: '1px solid var(--color-border)', borderRadius: '6px',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '9px',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              color: 'var(--color-text-dim)', marginBottom: '8px',
            }}>Cognitive (ICAR)</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--color-text)' }}>
              {scores.icar.correct}/{scores.icar.total} ({scores.icar.percent}%)
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          style={{
            padding: '14px 32px',
            background: 'var(--color-accent)',
            color: 'var(--color-bg)',
            border: 'none', borderRadius: '6px',
            fontSize: '15px', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font-sans)',
          }}
        >
          View Dashboard →
        </button>
      </div>
    );
  }

  // ── Active assessment view (progress bar + content) ──────────
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Progress bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: '3px', background: 'var(--color-border)', zIndex: 200,
      }}>
        <div style={{
          height: '100%', background: 'var(--color-accent)',
          width: `${progressPct}%`,
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 0 8px rgba(212, 165, 116, 0.4)',
        }} />
      </div>

      <div ref={sectionRef} style={{ padding: '60px 40px 80px', maxWidth: '720px', margin: '0 auto' }}>
        {/* Phase header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--color-accent)', opacity: 0.7, marginBottom: '8px',
          }}>
            {phase === 'ipip' && `Section ${ipipSectionIdx + 1} / ${IPIP_SECTIONS.length} — ${currentIPIPSection.title}`}
            {phase === 'icar' && ICAR_TITLE}
            {phase === 'sd3' && 'Motivational Drivers'}
            {phase === 'context' && 'Context'}
            <span style={{ marginLeft: '12px', color: 'var(--color-text-dim)' }}>
              {progressPct}% complete
            </span>
          </div>
          {(phase === 'ipip' || phase === 'icar' || phase === 'sd3' || phase === 'context') && (
            <p style={{
              fontFamily: 'var(--font-serif)', fontSize: '17px',
              color: 'var(--color-text-muted)', lineHeight: 1.5,
              fontStyle: 'italic',
            }}>
              {phase === 'ipip' && (TRAIT_DESCRIPTIONS[currentIPIPSection.title] || '')}
              {phase === 'icar' && ICAR_DESCRIPTION}
              {phase === 'sd3' && '27 statements about your attitudes and behaviors. Rate how much you agree with each.'}
              {phase === 'context' && 'A few quick questions about your current life situation.'}
            </p>
          )}
        </div>

        {/* ── IPIP Phase ──────────────────────────────────────── */}
        {phase === 'ipip' && (
          <div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'baseline', marginBottom: '6px',
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px',
                color: 'var(--color-text-dim)',
              }}>
                Items {(ipipScreenIdx * ITEMS_PER_SCREEN) + 1}–
                {Math.min((ipipScreenIdx + 1) * ITEMS_PER_SCREEN, currentIPIPSection.items.length)}
                {' '}of {currentIPIPSection.items.length}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px',
                color: 'var(--color-text-dim)',
              }}>
                Screen {ipipScreenIdx + 1} / {ipipScreensInSection}
              </span>
            </div>

            {ipipScreenItems.map((item) => (
              <IPIPItemRow
                key={item.id}
                item={item}
                value={responses[`ipip_${item.id}`]}
                onAnswer={(v) => answerIPIP(item.id, v)}
              />
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
              <button onClick={handleIPIPBack} style={btnGhostStyle}>
                ← Back
              </button>
              <button
                onClick={handleIPIPNext}
                disabled={!allIPIPScreenAnswered}
                style={allIPIPScreenAnswered ? btnPrimaryStyle : { ...btnPrimaryStyle, opacity: 0.4, cursor: 'not-allowed' }}
              >
                {ipipSectionIdx === IPIP_SECTIONS.length - 1 && ipipScreenIdx === ipipScreensInSection - 1
                  ? 'Continue to ICAR →'
                  : 'Next →'}
              </button>
            </div>
          </div>
        )}

        {/* ── ICAR Phase ──────────────────────────────────────── */}
        {phase === 'icar' && currentICAR && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px',
              color: 'var(--color-text-dim)', marginBottom: '20px',
            }}>
              Question {icarIdx + 1} of {ICAR_ITEMS.length}
            </div>

            <p style={{
              fontFamily: 'var(--font-serif)', fontSize: '20px',
              color: 'var(--color-text)', lineHeight: 1.4,
              marginBottom: '24px', fontWeight: 400,
            }}>
              {currentICAR.text}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentICAR.options.map((opt, idx) => {
                const selected = responses[`icar_${currentICAR.id}`] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleICARAnswer(idx)}
                    style={{
                      padding: '16px 20px',
                      background: selected ? 'var(--color-surface-elevated)' : 'var(--color-surface)',
                      border: `1px solid ${selected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      borderRadius: '6px',
                      color: selected ? 'var(--color-text)' : 'var(--color-text-muted)',
                      fontSize: '15px', fontFamily: 'var(--font-sans)',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '12px',
                      color: 'var(--color-accent)', marginRight: '12px',
                    }}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '32px' }}>
              <button onClick={() => {
                if (icarIdx > 0) setIcarIdx(icarIdx - 1);
                else setPhase('ipip');
              }} style={btnGhostStyle}>
                ← Back
              </button>
            </div>
          </div>
        )}

        {/* ── SD3 Phase ──────────────────────────────────────── */}
        {phase === 'sd3' && (
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px',
              color: 'var(--color-text-dim)', marginBottom: '20px',
            }}>
              Items {(sd3Idx * ITEMS_PER_SCREEN) + 1}–
              {Math.min((sd3Idx + 1) * ITEMS_PER_SCREEN, SD3_ITEMS.length)}
              {' '}of {SD3_ITEMS.length}
            </div>

            {sd3ScreenItems.map((item) => (
              <SD3ItemRow
                key={item.id}
                item={item}
                value={responses[`sd3_${item.id}`]}
                onAnswer={(v) => answerSD3(item.id, v)}
              />
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
              <button onClick={handleSD3Back} style={btnGhostStyle}>
                ← Back
              </button>
              <button
                onClick={handleSD3Next}
                disabled={!allSD3ScreenAnswered}
                style={allSD3ScreenAnswered ? btnPrimaryStyle : { ...btnPrimaryStyle, opacity: 0.4, cursor: 'not-allowed' }}
              >
                {sd3Idx === sd3TotalScreens - 1 ? 'Continue to Context →' : 'Next →'}
              </button>
            </div>
          </div>
        )}

        {/* ── Context Phase ───────────────────────────────────── */}
        {phase === 'context' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            {CONTEXT_QUESTIONS.map((q) => (
              <div key={q.id} style={{ marginBottom: '28px' }}>
                <p style={{
                  fontFamily: 'var(--font-serif)', fontSize: '17px',
                  color: 'var(--color-text)', lineHeight: 1.4,
                  marginBottom: '14px', fontWeight: 400,
                }}>
                  {q.text}
                </p>

                {q.type === 'select' && q.options && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.options.map((opt) => {
                      const selected = contextValues[q.id] === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => handleContextAnswer(q.id, opt)}
                          style={{
                            padding: '12px 18px',
                            background: selected ? 'var(--color-surface-elevated)' : 'var(--color-surface)',
                            border: `1px solid ${selected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                            borderRadius: '6px',
                            color: selected ? 'var(--color-text)' : 'var(--color-text-muted)',
                            fontSize: '14px', fontFamily: 'var(--font-sans)',
                            cursor: 'pointer', textAlign: 'left',
                            transition: 'all 0.18s ease',
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {q.type === 'scale' && q.min !== undefined && q.max !== undefined && (
                  <div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: '8px',
                    }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-dim)' }}>
                        {q.labels?.[String(q.min)] || ''}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-dim)' }}>
                        {q.labels?.[String(q.max)] || ''}
                      </span>
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${q.max - q.min + 1}, 1fr)`,
                      gap: '6px',
                    }}>
                      {Array.from({ length: q.max - q.min + 1 }, (_, i) => q.min! + i).map((n) => {
                        const selected = contextValues[q.id] === n;
                        return (
                          <button
                            key={n}
                            onClick={() => handleContextAnswer(q.id, n)}
                            style={{
                              padding: '12px 4px',
                              background: selected ? 'var(--color-accent)' : 'var(--color-surface)',
                              border: `1px solid ${selected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                              borderRadius: '6px',
                              color: selected ? 'var(--color-bg)' : 'var(--color-text-muted)',
                              fontSize: '15px', fontWeight: selected ? 600 : 400,
                              fontFamily: 'var(--font-mono)', cursor: 'pointer',
                              transition: 'all 0.18s ease',
                            }}
                          >
                            {n}
                          </button>
                        );
                      })}
                    </div>
                    {q.labels?.['5'] && (
                      <div style={{ textAlign: 'center', marginTop: '6px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-dim)' }}>
                          {q.labels['5']}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
              <button onClick={() => setPhase('sd3')} style={btnGhostStyle}>
                ← Back
              </button>
              <button
                onClick={handleComplete}
                disabled={!allContextAnswered || saving}
                style={allContextAnswered && !saving ? btnPrimaryStyle : { ...btnPrimaryStyle, opacity: 0.4, cursor: 'not-allowed' }}
              >
                {saving ? 'Saving…' : 'Complete Assessment →'}
              </button>
            </div>

            {saveError && (
              <p style={{ color: 'var(--color-danger)', fontSize: '13px', marginTop: '16px' }}>
                {saveError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function SectionCard({ label, title, desc, count }: { label: string; title: string; desc: string; count: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '20px',
      padding: '18px 22px', background: 'var(--color-surface)',
      border: '1px solid var(--color-border)', borderRadius: '6px',
    }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 500,
        color: 'var(--color-accent)', marginTop: '2px', flexShrink: 0,
      }}>
        {label}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: 'var(--font-serif)', fontSize: '17px', fontWeight: 400,
          color: 'var(--color-text)', marginBottom: '4px',
        }}>
          {title}
        </div>
        <div style={{
          fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5,
        }}>
          {desc}
        </div>
      </div>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '10px',
        color: 'var(--color-text-dim)', flexShrink: 0, marginTop: '4px',
      }}>
        {count}
      </span>
    </div>
  );
}

function IPIPItemRow({ item, value, onAnswer }: {
  item: IPIPItem;
  value: number | undefined;
  onAnswer: (v: number) => void;
}) {
  return (
    <div style={{
      padding: '18px 0',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '9px',
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'var(--color-text-dim)', marginBottom: '6px',
      }}>
        {item.facet} {item.reverse && '· (reverse)'}
      </div>
      <p style={{
        fontFamily: 'var(--font-serif)', fontSize: '17px',
        color: 'var(--color-text)', lineHeight: 1.45,
        marginBottom: '14px', fontWeight: 400,
      }}>
        {item.text}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
        {LIKERT_SCALE.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onAnswer(opt.value)}
              style={{
                padding: '14px 4px 10px',
                background: selected ? 'var(--color-surface-elevated)' : 'var(--color-surface)',
                border: `1px solid ${selected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: '4px',
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
  );
}

function SD3ItemRow({ item, value, onAnswer }: {
  item: SD3Item;
  value: number | undefined;
  onAnswer: (v: number) => void;
}) {
  return (
    <div style={{
      padding: '18px 0',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '9px',
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'var(--color-text-dim)', marginBottom: '6px',
      }}>
        {item.facet} {item.reverse && '· (reverse)'}
      </div>
      <p style={{
        fontFamily: 'var(--font-serif)', fontSize: '17px',
        color: 'var(--color-text)', lineHeight: 1.45,
        marginBottom: '14px', fontWeight: 400,
      }}>
        {item.text}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
        {SD3_SCALE.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onAnswer(opt.value)}
              style={{
                padding: '14px 4px 10px',
                background: selected ? 'var(--color-surface-elevated)' : 'var(--color-surface)',
                border: `1px solid ${selected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: '4px',
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
  );
}

// ── Shared styles ───────────────────────────────────────────────
const btnPrimaryStyle: React.CSSProperties = {
  padding: '12px 28px',
  background: 'var(--color-accent)',
  color: 'var(--color-bg)',
  border: 'none', borderRadius: '4px',
  fontSize: '14px', fontWeight: 600,
  cursor: 'pointer', fontFamily: 'var(--font-sans)',
  letterSpacing: '0.02em',
  transition: 'all 0.2s ease',
};

const btnGhostStyle: React.CSSProperties = {
  padding: '12px 24px',
  background: 'none',
  color: 'var(--color-text-muted)',
  border: '1px solid var(--color-border)',
  borderRadius: '4px',
  fontSize: '14px', fontWeight: 500,
  cursor: 'pointer', fontFamily: 'var(--font-sans)',
  transition: 'all 0.2s ease',
};
