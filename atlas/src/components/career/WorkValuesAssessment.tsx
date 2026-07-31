import { useState, useEffect, useCallback } from 'react';
import {
  NEED_ITEMS,
  INTENSITY_SCALE,
  VALUE_LABELS,
  VALUE_DESCRIPTIONS,
  generateShuffledBlocks,
  scoreWorkValues,
  type WorkValuesResult,
} from '../../lib/work-values-data';

// ── Props ──────────────────────────────────────────────────────
interface WorkValuesAssessmentProps {
  onComplete: (result: WorkValuesResult) => void;
  onBack: () => void;
  initialResult?: WorkValuesResult | null;
  saving?: boolean;
}

type Phase = 'intro' | 'ranking' | 'rating' | 'review';

const STORAGE_KEY = 'atlas_work_values_progress';

// ── Styles (matching Atlas design system) ───────────────────────
const ui = {
  page: { maxWidth: '760px', margin: '0 auto', padding: '52px 24px 100px' },
  kicker: {
    color: 'var(--color-accent)' as const,
    font: '11px var(--font-mono)' as const,
    letterSpacing: '.12em' as const,
    textTransform: 'uppercase' as const,
    marginBottom: '16px',
  },
  h1: {
    font: '400 42px/1.06 var(--font-serif)' as const,
    letterSpacing: '-.03em' as const,
    margin: '0 0 16px',
  },
  quiet: {
    color: 'var(--color-text-muted)' as const,
    fontSize: '15px' as const,
    lineHeight: 1.65 as const,
    maxWidth: '580px' as const,
    margin: '0 0 32px',
  },
  panel: {
    background: 'var(--color-surface)' as const,
    border: '1px solid var(--color-border)' as const,
    padding: '20px' as const,
  },
  card: {
    background: 'var(--color-surface)' as const,
    border: '1px solid var(--color-border)' as const,
    padding: '14px 16px' as const,
    cursor: 'grab' as const,
    font: '14px/1.5 var(--font-sans)' as const,
    color: 'var(--color-text)' as const,
    transition: 'border-color .15s, opacity .15s' as const,
  },
  cardActive: {
    borderColor: 'var(--color-accent)' as const,
    opacity: '0.5' as const,
  },
  primary: {
    border: '1px solid var(--color-accent)' as const,
    background: 'var(--color-accent)' as const,
    color: 'var(--color-bg)' as const,
    padding: '12px 24px' as const,
    font: '600 11px var(--font-mono)' as const,
    letterSpacing: '.08em' as const,
    textTransform: 'uppercase' as const,
    cursor: 'pointer' as const,
  },
  secondary: {
    border: '1px solid var(--color-border)' as const,
    background: 'transparent' as const,
    color: 'var(--color-text-muted)' as const,
    padding: '12px 20px' as const,
    font: '11px var(--font-mono)' as const,
    letterSpacing: '.08em' as const,
    textTransform: 'uppercase' as const,
    cursor: 'pointer' as const,
  },
  progressBar: {
    height: '3px' as const,
    background: 'var(--color-surface-elevated)' as const,
    borderRadius: '2px' as const,
    overflow: 'hidden' as const,
    margin: '0 0 24px' as const,
  },
  rankLabel: {
    font: '10px var(--font-mono)' as const,
    letterSpacing: '.1em' as const,
    textTransform: 'uppercase' as const,
    color: 'var(--color-text-dim)' as const,
    minWidth: '20px' as const,
    textAlign: 'right' as const,
  },
  ratingOption: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: '12px' as const,
    padding: '12px 16px' as const,
    border: '1px solid var(--color-border)' as const,
    cursor: 'pointer' as const,
    transition: 'border-color .15s, background .15s' as const,
  },
};

// ── Drag-and-drop ranking card ──────────────────────────────────
function RankCard({
  text,
  rankPos,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
}: {
  text: string;
  rankPos: number;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      style={{
        ...ui.card,
        ...(isDragging ? ui.cardActive : {}),
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
      }}
    >
      <span style={ui.rankLabel}>{rankPos + 1}</span>
      <span style={{ flex: 1 }}>{text}</span>
      <span style={{ color: 'var(--color-text-dim)', fontSize: '18px', cursor: 'grab' }}>⋮⋮</span>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────
export function WorkValuesAssessment({ onComplete, onBack, initialResult, saving }: WorkValuesAssessmentProps) {
  const [phase, setPhase] = useState<Phase>(initialResult ? 'review' : 'intro');
  const [blocks] = useState<number[][]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_blocks`);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return generateShuffledBlocks();
  });
  const [currentBlock, setCurrentBlock] = useState(0);
  const [rankings, setRankings] = useState<Record<number, number[]>>({});
  const [intensityRatings, setIntensityRatings] = useState<Record<number, number>>({});
  const [currentRatingIdx, setCurrentRatingIdx] = useState(0);
  const [result, setResult] = useState<WorkValuesResult | null>(initialResult ?? null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Persist blocks to localStorage
  useEffect(() => {
    try { localStorage.setItem(`${STORAGE_KEY}_blocks`, JSON.stringify(blocks)); } catch { /* ignore */ }
  }, [blocks]);

  // Auto-save progress
  const saveProgress = useCallback(() => {
    if (phase === 'intro' || phase === 'review') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ rankings, intensityRatings, currentBlock, currentRatingIdx, phase }));
    } catch { /* ignore */ }
  }, [rankings, intensityRatings, currentBlock, currentRatingIdx, phase]);

  useEffect(() => { saveProgress(); }, [saveProgress]);

  // Load saved progress on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.rankings) setRankings(data.rankings);
        if (data.intensityRatings) setIntensityRatings(data.intensityRatings);
        if (data.currentBlock) setCurrentBlock(data.currentBlock);
        if (data.currentRatingIdx) setCurrentRatingIdx(data.currentRatingIdx);
        if (data.phase && data.phase !== 'intro' && data.phase !== 'review') setPhase(data.phase);
      }
    } catch { /* ignore */ }
  }, []);

  // ── Ranking phase ───────────────────────────────────────────
  const blockItems = blocks[currentBlock] ?? [];
  const [localOrder, setLocalOrder] = useState<number[]>(blockItems);

  useEffect(() => { setLocalOrder(blockItems); }, [currentBlock]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    const newOrder = [...localOrder];
    const [moved] = newOrder.splice(draggedIdx, 1);
    newOrder.splice(targetIdx, 0, moved);
    setLocalOrder(newOrder);
    setDraggedIdx(null);
  };
  const handleDragEnd = () => setDraggedIdx(null);

  const confirmRanking = () => {
    const updated = { ...rankings, [currentBlock]: localOrder };
    setRankings(updated);
    if (currentBlock < blocks.length - 1) {
      setCurrentBlock(currentBlock + 1);
    } else {
      setPhase('rating');
    }
  };

  const goBackRanking = () => {
    if (currentBlock > 0) {
      // Load previous block's saved order
      const prevOrder = rankings[currentBlock - 1];
      if (prevOrder) setLocalOrder(prevOrder);
      setCurrentBlock(currentBlock - 1);
    } else {
      setPhase('intro');
    }
  };

  // ── Rating phase ────────────────────────────────────────────
  const ratingItems = NEED_ITEMS;
  const currentRatingItem = ratingItems[currentRatingIdx];

  const handleRating = (value: number) => {
    const updated = { ...intensityRatings, [currentRatingIdx]: value };
    setIntensityRatings(updated);
    if (currentRatingIdx < ratingItems.length - 1) {
      setCurrentRatingIdx(currentRatingIdx + 1);
    } else {
      // All rated — compute scores
      const computed = scoreWorkValues(updated ? { ...rankings } : rankings, updated);
      setResult(computed);
      setPhase('review');
      try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(`${STORAGE_KEY}_blocks`); } catch { /* ignore */ }
    }
  };

  const goBackRating = () => {
    if (currentRatingIdx > 0) {
      setCurrentRatingIdx(currentRatingIdx - 1);
    } else {
      setPhase('ranking');
      setCurrentBlock(blocks.length - 1);
      const lastOrder = rankings[blocks.length - 1];
      if (lastOrder) setLocalOrder(lastOrder);
    }
  };

  // ── Review phase ─────────────────────────────────────────────
  const handleComplete = () => {
    if (result) onComplete(result);
  };

  const handleRedo = () => {
    try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(`${STORAGE_KEY}_blocks`); } catch { /* ignore */ }
    setRankings({});
    setIntensityRatings({});
    setCurrentBlock(0);
    setCurrentRatingIdx(0);
    setResult(null);
    setPhase('intro');
  };

  // ── Progress bar ─────────────────────────────────────────────
  const totalSteps = blocks.length + ratingItems.length;
  const currentStep = phase === 'ranking'
    ? currentBlock + 1
    : phase === 'rating'
      ? blocks.length + currentRatingIdx + 1
      : totalSteps;
  const progressPct = phase === 'review' ? 100 : Math.round((currentStep / totalSteps) * 100);

  // ── Render ────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div style={ui.page}>
        <p style={ui.kicker}>Work preferences</p>
        <h1 style={ui.h1}>Name what matters most.</h1>
        <p style={ui.quiet}>
          These are editable statements about what you want from work. There are no right answers
          and no personality label at the end. You'll rank aspects of work by importance, then rate
          how essential each one is. Your choices stay editable and show where they influence a
          role comparison.
        </p>
        <div style={{ ...ui.panel, borderLeft: '3px solid var(--color-accent)', marginBottom: '32px' }}>
          <p style={{ ...ui.kicker, marginBottom: '8px' }}>How this works</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
            Two short phases, about 10 minutes. Phase 1: rank groups of statements by importance
            (drag to reorder). Phase 2: rate each statement individually. Your profile emerges from
            both together. Nothing here is permanent — you can revise at any time.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={() => setPhase('ranking')} style={ui.primary}>
            Begin →
          </button>
          <button onClick={onBack} style={ui.secondary}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'ranking') {
    return (
      <div style={ui.page}>
        <div style={ui.progressBar}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--color-accent)', transition: 'width .3s' }} />
        </div>
        <p style={ui.kicker}>Phase 1 of 2 · Block {currentBlock + 1} of {blocks.length}</p>
        <h1 style={{ ...ui.h1, fontSize: '32px' }}>Rank these by importance.</h1>
        <p style={{ ...ui.quiet, fontSize: '14px', marginBottom: '24px' }}>
          Drag to reorder. The top item matters most to you in your next role. The bottom item
          matters least.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {localOrder.map((itemIdx, displayPos) => {
            const item = NEED_ITEMS[itemIdx];
            if (!item) return null;
            return (
              <RankCard
                key={itemIdx}
                text={item.text}
                rankPos={displayPos}
                onDragStart={() => handleDragStart(displayPos)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(displayPos)}
                onDragEnd={handleDragEnd}
                isDragging={draggedIdx === displayPos}
              />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '28px' }}>
          <button onClick={goBackRanking} style={ui.secondary}>
            ← Back
          </button>
          <button
            onClick={confirmRanking}
            disabled={saving}
            style={{ ...ui.primary, opacity: saving ? 0.5 : 1 }}
          >
            {currentBlock < blocks.length - 1 ? 'Confirm →' : 'Next phase →'}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'rating') {
    const item = currentRatingItem;
    if (!item) return null;
    return (
      <div style={ui.page}>
        <div style={ui.progressBar}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--color-accent)', transition: 'width .3s' }} />
        </div>
        <p style={ui.kicker}>Phase 2 of 2 · Statement {currentRatingIdx + 1} of {ratingItems.length}</p>
        <h1 style={{ ...ui.h1, fontSize: '32px' }}>How important is this to you?</h1>
        <p style={{ ...ui.quiet, fontSize: '14px', marginBottom: '24px' }}>
          Rate each statement on its own — not relative to the others.
        </p>
        <div style={{ ...ui.panel, marginBottom: '24px', borderLeft: '3px solid var(--color-accent)' }}>
          <p style={{ font: '400 20px/1.4 var(--font-serif)', color: 'var(--color-text)', margin: 0 }}>
            {item.text}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {INTENSITY_SCALE.map((opt) => {
            const selected = intensityRatings[currentRatingIdx] === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleRating(opt.value)}
                style={{
                  ...ui.ratingOption,
                  borderColor: selected ? 'var(--color-accent)' : 'var(--color-border)',
                  background: selected ? 'var(--color-surface-elevated)' : 'var(--color-surface)',
                }}
              >
                <span style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  border: `2px solid ${selected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: selected ? 'var(--color-accent)' : 'transparent',
                  flexShrink: 0,
                }} />
                <span>
                  <span style={{ color: 'var(--color-text)', fontSize: '15px', fontWeight: 500 }}>{opt.label}</span>
                  <span style={{ color: 'var(--color-text-dim)', fontSize: '13px', marginLeft: '8px' }}>{opt.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '28px' }}>
          <button onClick={goBackRating} style={ui.secondary}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // ── Review phase ─────────────────────────────────────────────
  if (phase === 'review' && result) {
    const topValue = result.values[0];
    const consistencyLevel = result.consistency >= 0.8 ? 'high' : result.consistency >= 0.5 ? 'moderate' : 'low';
    return (
      <div style={ui.page}>
        <p style={ui.kicker}>Your work values profile</p>
        <h1 style={ui.h1}>What matters most to you.</h1>
        <p style={ui.quiet}>
          This profile emerged from both your rankings and your ratings. It's a starting point —
          editable, not a verdict. Your top values will appear in role comparisons so you can see
          where each direction aligns or conflicts with what matters to you.
        </p>

        {/* Value bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '0 0 32px' }}>
          {result.values.map((vs) => (
            <div key={vs.value}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <span style={{ font: '500 14px var(--font-sans)', color: 'var(--color-text)' }}>
                  {VALUE_LABELS[vs.value]}
                </span>
                <span style={{ font: '400 18px var(--font-serif)', color: vs === topValue ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                  {vs.score}
                </span>
              </div>
              <div style={{ height: '8px', background: 'var(--color-surface-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${vs.score}%`,
                  background: vs === topValue ? 'var(--color-accent)' : 'var(--color-text-dim)',
                  transition: 'width .4s ease',
                }} />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-dim)', margin: '4px 0 0', lineHeight: 1.5 }}>
                {VALUE_DESCRIPTIONS[vs.value]}
              </p>
            </div>
          ))}
        </div>

        {/* Consistency flag */}
        {consistencyLevel === 'low' && (
          <div style={{ ...ui.panel, borderLeft: '3px solid var(--color-warning)', marginBottom: '24px' }}>
            <p style={{ ...ui.kicker, color: 'var(--color-warning)', marginBottom: '6px' }}>Note</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              Your responses showed some inconsistency in ranking. That's natural when you're
              still clarifying what matters. Consider revisiting the assessment when you have more
              clarity.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={handleRedo} style={ui.secondary}>
            Redo assessment
          </button>
          <button
            onClick={handleComplete}
            disabled={saving}
            style={{ ...ui.primary, opacity: saving ? 0.5 : 1 }}
          >
            {saving ? 'Saving…' : 'Save and continue →'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
