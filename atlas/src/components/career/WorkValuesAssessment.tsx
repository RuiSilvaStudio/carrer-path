import { useState, useEffect, useCallback } from 'react';
import {
  NEED_ITEMS,
  INTENSITY_SCALE,
  VALUE_LABELS,
  VALUE_DESCRIPTIONS,
  generateShuffledBlocks,
  type WorkValuesResult,
} from '../../lib/work-values-data';
import { useWorkValues } from '../../hooks/useWorkValues';
import { Spinner } from '../ui/Spinner';

// ── Props ──────────────────────────────────────────────────────
interface WorkValuesAssessmentProps {
  onComplete: (result: WorkValuesResult) => void;
}

// ── Styles (matching Atlas design system) ───────────────────────
const ui = {
  page: { maxWidth: '760px', margin: '0 auto', padding: '0 0 0' },
  kicker: {
    color: 'var(--color-accent)' as const,
    font: '11px var(--font-mono)' as const,
    letterSpacing: '.12em' as const,
    textTransform: 'uppercase' as const,
    marginBottom: '16px',
  },
  h1: {
    font: '400 var(--fs-h3)/1.06 var(--font-serif)' as const,
    letterSpacing: '-.025em' as const,
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
    opacity: '0.4' as const,
  },
  primary: {
    border: '1px solid var(--color-accent)' as const,
    background: 'var(--color-accent)' as const,
    color: 'var(--color-bg)' as const,
    borderRadius: 'var(--radius-button)' as const,
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
    borderRadius: 'var(--radius-button)' as const,
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
  dropLine: {
    height: '2px',
    background: 'var(--color-accent)',
    borderRadius: '1px',
    margin: '-4px 0',
    boxShadow: '0 0 6px 0 var(--color-accent)',
    transition: 'opacity .1s',
  },
};

// ── Drag-and-drop ranking card ──────────────────────────────────
function RankCard({
  text, rankPos, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd,
  isDragging, showDropBefore, showDropAfter,
}: {
  text: string; rankPos: number;
  onDragStart: () => void; onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void; onDrop: () => void; onDragEnd: () => void;
  isDragging: boolean; showDropBefore: boolean; showDropAfter: boolean;
}) {
  return (
    <>
      {showDropBefore && <div style={ui.dropLine} />}
      <div
        draggable onDragStart={onDragStart} onDragOver={onDragOver}
        onDragLeave={onDragLeave} onDrop={onDrop} onDragEnd={onDragEnd}
        style={{ ...ui.card, ...(isDragging ? ui.cardActive : {}), display: 'flex', alignItems: 'center', gap: '14px' }}
      >
        <span style={ui.rankLabel}>{rankPos + 1}</span>
        <span style={{ flex: 1 }}>{text}</span>
        <span style={{ color: 'var(--color-text-dim)', fontSize: '18px', cursor: 'grab' }}>⋮⋮</span>
      </div>
      {showDropAfter && <div style={ui.dropLine} />}
    </>
  );
}

// ── Main component ──────────────────────────────────────────────
export function WorkValuesAssessment({ onComplete }: WorkValuesAssessmentProps) {
  const {
    phase: hookPhase, activeResult, draftState, loading, error,
    startAssessment, scheduleDraftSave, resumeDraft, discardDraft,
    completeAssessment, redo,
  } = useWorkValues();

  // Local assessment state — initialized from draft or fresh
  const [blocks, setBlocks] = useState<number[][]>([]);
  const [currentBlock, setCurrentBlock] = useState(0);
  const [rankings, setRankings] = useState<Record<number, number[]>>({});
  const [intensityRatings, setIntensityRatings] = useState<Record<number, number>>({});
  const [currentRatingIdx, setCurrentRatingIdx] = useState(0);
  const [localOrder, setLocalOrder] = useState<number[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dropTargetIdx, setDropTargetIdx] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);
  const [assessmentStarted, setAssessmentStarted] = useState(false);

  // ── Initialize from draft when entering assessment ─────────
  useEffect(() => {
    if (hookPhase === 'assessment' && !assessmentStarted) {
      if (draftState) {
        // Resume from draft
        setBlocks(draftState.blocks);
        setRankings(draftState.rankings);
        setIntensityRatings(draftState.intensityRatings);
        setCurrentBlock(draftState.currentBlock);
        setCurrentRatingIdx(draftState.currentRatingIdx);
        // Set local order for the current block
        const blockItems = draftState.blocks[draftState.currentBlock] ?? [];
        const savedOrder = draftState.rankings[draftState.currentBlock];
        setLocalOrder(savedOrder ?? blockItems);
      } else {
        // Fresh start
        const freshBlocks = generateShuffledBlocks();
        setBlocks(freshBlocks);
        setLocalOrder(freshBlocks[0] ?? []);
      }
      setAssessmentStarted(true);
    }
  }, [hookPhase, draftState, assessmentStarted]);

  // ── Update local order when block changes ──────────────────
  useEffect(() => {
    if (blocks.length > 0 && assessmentStarted) {
      const blockItems = blocks[currentBlock] ?? [];
      const savedOrder = rankings[currentBlock];
      setLocalOrder(savedOrder ?? blockItems);
    }
  }, [currentBlock]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persist draft to DB (debounced) ────────────────────────
  const persistDraft = useCallback((updates: {
    rankings?: Record<number, number[]>;
    intensityRatings?: Record<number, number>;
    currentBlock?: number;
    currentRatingIdx?: number;
    phase?: string;
  }) => {
    if (!blocks.length) return;
    const state = {
      blocks,
      rankings: updates.rankings ?? rankings,
      intensityRatings: updates.intensityRatings ?? intensityRatings,
      currentBlock: updates.currentBlock ?? currentBlock,
      currentRatingIdx: updates.currentRatingIdx ?? currentRatingIdx,
      phase: updates.phase ?? 'ranking',
    };
    scheduleDraftSave(state);
  }, [blocks, rankings, intensityRatings, currentBlock, currentRatingIdx, scheduleDraftSave]);

  // ── Ranking phase handlers ─────────────────────────────────
  const handleDragStart = (idx: number) => setDraggedIdx(idx);

  const handleDragOver = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null) return;
    if (draggedIdx === targetIdx) {
      setDropTargetIdx(null);
      setDropPosition(null);
      return;
    }
    const cardEl = e.currentTarget as HTMLDivElement;
    const rect = cardEl.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    setDropTargetIdx(targetIdx);
    setDropPosition(e.clientY < midpoint ? 'before' : 'after');
  };

  const handleDragLeave = () => { /* let next card's dragover handle it */ };

  const handleDrop = () => {
    if (draggedIdx === null || dropTargetIdx === null || dropPosition === null) {
      setDraggedIdx(null); setDropTargetIdx(null); setDropPosition(null);
      return;
    }
    let insertAt = dropTargetIdx;
    if (dropPosition === 'after') insertAt = dropTargetIdx + 1;
    if (draggedIdx < insertAt) insertAt -= 1;
    if (draggedIdx === insertAt || (draggedIdx === insertAt + 1 && dropPosition === 'before')) {
      setDraggedIdx(null); setDropTargetIdx(null); setDropPosition(null);
      return;
    }
    const newOrder = [...localOrder];
    const [moved] = newOrder.splice(draggedIdx, 1);
    newOrder.splice(insertAt, 0, moved);
    setLocalOrder(newOrder);
    setDraggedIdx(null); setDropTargetIdx(null); setDropPosition(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null); setDropTargetIdx(null); setDropPosition(null);
  };

  const confirmRanking = () => {
    const updated = { ...rankings, [currentBlock]: localOrder };
    setRankings(updated);
    if (currentBlock < blocks.length - 1) {
      const nextBlock = currentBlock + 1;
      setCurrentBlock(nextBlock);
      persistDraft({ rankings: updated, currentBlock: nextBlock, phase: 'ranking' });
    } else {
      // Move to rating phase
      persistDraft({ rankings: updated, phase: 'rating' });
      // Trigger re-render to rating phase via a local state
      setRatingPhaseActive(true);
    }
  };

  const goBackRanking = () => {
    if (currentBlock > 0) {
      const prevBlock = currentBlock - 1;
      const prevOrder = rankings[prevBlock];
      if (prevOrder) setLocalOrder(prevOrder);
      setCurrentBlock(prevBlock);
    }
    // If at first block, we can't go back further in assessment
    // (the resume/discard decision was already made before entering)
  };

  // ── Rating phase ────────────────────────────────────────────
  const [ratingPhaseActive, setRatingPhaseActive] = useState(false);
  const ratingItems = NEED_ITEMS;
  const currentRatingItem = ratingItems[currentRatingIdx];

  const handleRating = (value: number) => {
    const updated = { ...intensityRatings, [currentRatingIdx]: value };
    setIntensityRatings(updated);
    if (currentRatingIdx < ratingItems.length - 1) {
      const nextIdx = currentRatingIdx + 1;
      setCurrentRatingIdx(nextIdx);
      persistDraft({ intensityRatings: updated, currentRatingIdx: nextIdx, phase: 'rating' });
    } else {
      // All rated — complete the assessment
      completeAssessment(rankings, updated).then(result => {
        if (result) {
          onComplete(result);
          setRatingPhaseActive(false);
        }
      });
    }
  };

  const goBackRating = () => {
    if (currentRatingIdx > 0) {
      setCurrentRatingIdx(currentRatingIdx - 1);
    } else {
      // Back to ranking
      setRatingPhaseActive(false);
      setCurrentBlock(blocks.length - 1);
      const lastOrder = rankings[blocks.length - 1];
      if (lastOrder) setLocalOrder(lastOrder);
    }
  };

  // ── Progress bar ─────────────────────────────────────────────
  const totalSteps = blocks.length + ratingItems.length;
  const currentStep = !ratingPhaseActive
    ? currentBlock + 1
    : blocks.length + currentRatingIdx + 1;
  const progressPct = ratingPhaseActive && currentRatingIdx >= ratingItems.length - 1
    ? 100
    : Math.round((currentStep / totalSteps) * 100);

  // ── Handlers for intro/redo ─────────────────────────────────
  const handleBegin = () => {
    const freshBlocks = generateShuffledBlocks();
    setBlocks(freshBlocks);
    setLocalOrder(freshBlocks[0] ?? []);
    setRankings({});
    setIntensityRatings({});
    setCurrentBlock(0);
    setCurrentRatingIdx(0);
    setRatingPhaseActive(false);
    setAssessmentStarted(false);
    void startAssessment(freshBlocks);
  };

  const handleRedo = () => {
    setRankings({});
    setIntensityRatings({});
    setCurrentBlock(0);
    setCurrentRatingIdx(0);
    setRatingPhaseActive(false);
    setAssessmentStarted(false);
    const freshBlocks = generateShuffledBlocks();
    setBlocks(freshBlocks);
    setLocalOrder(freshBlocks[0] ?? []);
    void redo(freshBlocks);
  };

  // ── Loading state ────────────────────────────────────────────
  if (loading || hookPhase === 'loading') {
    return (
      <div style={ui.page}>
        <Spinner message="Loading…" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={ui.page}>
        <div style={{ ...ui.panel, borderLeft: '3px solid var(--color-danger)', marginBottom: '16px' }}>
          <p style={{ ...ui.quiet, fontSize: '13px', margin: 0, color: 'var(--color-danger)' }}>{error}</p>
        </div>
      </div>
    );
  }

  // ── Draft resume prompt ─────────────────────────────────────
  if (hookPhase === 'draft-resume') {
    return (
      <div style={ui.page}>
        <p style={ui.kicker}>Work preferences</p>
        <h1 style={ui.h1}>Unfinished assessment.</h1>
        <p style={ui.quiet}>
          You started a work values assessment but didn't finish it. Your progress is saved —
          you can pick up where you left off, or discard it and start fresh.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={resumeDraft} style={ui.primary}>Resume →</button>
          <button onClick={() => void discardDraft()} style={ui.secondary}>Discard and start fresh</button>
        </div>
      </div>
    );
  }

  // ── Intro phase ──────────────────────────────────────────────
  if (hookPhase === 'intro') {
    return (
      <div style={ui.page}>
        <p style={ui.kicker}>Work preferences</p>
        <h1 style={ui.h1}>Name what matters most.</h1>
        <p style={ui.quiet}>
          These are editable statements about what you want from work. There are no right answers
          and no personality label at the end. You'll rank aspects of work by importance, then rate
          how essential each one is. Your choices stay editable and show where they influence a
          role comparison. Your progress saves automatically.
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
          <button onClick={handleBegin} style={ui.primary}>Begin →</button>
        </div>
      </div>
    );
  }

  // ── Assessment: ranking phase ────────────────────────────────
  if (hookPhase === 'assessment' && !ratingPhaseActive) {
    return (
      <div style={ui.page}>
        <div style={ui.progressBar}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--color-accent)', transition: 'width .3s' }} />
        </div>
        <p style={ui.kicker}>Phase 1 of 2 · Block {currentBlock + 1} of {blocks.length}</p>
        <h1 style={{ ...ui.h1, fontSize: '32px' }}>Rank these by importance.</h1>
        <p style={{ ...ui.quiet, fontSize: '14px', marginBottom: '24px' }}>
          Drag to reorder. The top item matters most to you in your next role. The bottom item
          matters least. A line shows where the item will land.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {localOrder.map((itemIdx, displayPos) => {
            const item = NEED_ITEMS[itemIdx];
            if (!item) return null;
            const showDropBefore = dropTargetIdx === displayPos && dropPosition === 'before' && draggedIdx !== displayPos;
            const showDropAfter = dropTargetIdx === displayPos && dropPosition === 'after' && draggedIdx !== displayPos;
            return (
              <RankCard
                key={itemIdx} text={item.text} rankPos={displayPos}
                onDragStart={() => handleDragStart(displayPos)}
                onDragOver={(e) => handleDragOver(e, displayPos)}
                onDragLeave={handleDragLeave} onDrop={handleDrop} onDragEnd={handleDragEnd}
                isDragging={draggedIdx === displayPos}
                showDropBefore={showDropBefore} showDropAfter={showDropAfter}
              />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '28px' }}>
          <button onClick={goBackRanking} style={ui.secondary}>← Back</button>
          <button onClick={confirmRanking} style={ui.primary}>
            {currentBlock < blocks.length - 1 ? 'Confirm →' : 'Next phase →'}
          </button>
        </div>
      </div>
    );
  }

  // ── Assessment: rating phase ─────────────────────────────────
  if (hookPhase === 'assessment' && ratingPhaseActive) {
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
          <button onClick={goBackRating} style={ui.secondary}>← Back</button>
        </div>
      </div>
    );
  }

  // ── Review phase ─────────────────────────────────────────────
  if (hookPhase === 'review' && activeResult) {
    const topValue = activeResult.values[0];
    const consistencyLevel = activeResult.consistency >= 0.8 ? 'high' : activeResult.consistency >= 0.5 ? 'moderate' : 'low';
    return (
      <div style={ui.page}>
        <p style={ui.kicker}>Your work values profile</p>
        <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'var(--fs-h1)', fontWeight: 400,
            color: 'var(--color-text)', letterSpacing: '-0.02em',
            lineHeight: 1.1, marginBottom: '12px',
          }}>What matters most to you.</h1>
        <p style={ui.quiet}>
          This profile emerged from both your rankings and your ratings. It's a starting point —
          editable, not a verdict. Your top values will appear in role comparisons so you can see
          where each direction aligns or conflicts with what matters to you.
        </p>

        {/* Value bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '0 0 32px' }}>
          {activeResult.values.map((vs) => (
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
                  height: '100%', width: `${vs.score}%`,
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

        <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={handleRedo} style={ui.secondary}>Redo assessment</button>
        </div>
      </div>
    );
  }

  return null;
}
