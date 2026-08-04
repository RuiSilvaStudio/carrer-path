import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatConnectionError } from '../lib/errors';
import { useAuth } from './useAuth';
import { scoreWorkValues, type WorkValuesResult } from '../lib/work-values-data';

// ── Types ──────────────────────────────────────────────────────
export interface DraftState {
  blocks: number[][];
  rankings: Record<number, number[]>;
  intensityRatings: Record<number, number>;
  currentBlock: number;
  currentRatingIdx: number;
  phase: string;
}

interface WorkValuesRow {
  id: number;
  user_id: string;
  status: 'draft' | 'completed';
  result: WorkValuesResult | null;
  draft_state: DraftState | null;
  created_at: string;
  completed_at: string | null;
}

export type WorkValuesPhase = 'loading' | 'intro' | 'draft-resume' | 'assessment' | 'review';

export function useWorkValues() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<WorkValuesPhase>('loading');
  const [activeResult, setActiveResult] = useState<WorkValuesResult | null>(null);
  const [draft, setDraft] = useState<WorkValuesRow | null>(null);
  const [draftState, setDraftState] = useState<DraftState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const draftIdRef = useRef<number | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftStateRef = useRef<DraftState | null>(null);

  // Keep ref in sync
  useEffect(() => { draftStateRef.current = draftState; }, [draftState]);

  // ── Load on mount ────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!user) {
      setPhase('intro');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('work_values_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const rows = (data || []) as unknown as WorkValuesRow[];
      const latestCompleted = rows.find(r => r.status === 'completed') ?? null;
      const latestDraft = rows.find(r => r.status === 'draft') ?? null;

      // ── Migration: if no completed rows exist in the new table, check
      // career_direction_profiles for a legacy workValues result and copy it. ──
      if (!latestCompleted && !latestDraft) {
        const { data: cdRow } = await supabase
          .from('career_direction_profiles')
          .select('data')
          .eq('user_id', user.id)
          .maybeSingle();

        const legacyResult = (cdRow?.data as any)?.preferences?.workValues as WorkValuesResult | undefined;
        if (legacyResult) {
          // Insert as a completed row
          await supabase
            .from('work_values_assessments')
            .insert({
              user_id: user.id,
              status: 'completed',
              result: legacyResult,
              completed_at: legacyResult.completedAt || new Date().toISOString(),
            });

          // Re-fetch
          const { data: refetched } = await supabase
            .from('work_values_assessments')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          const refetchedRows = (refetched || []) as unknown as WorkValuesRow[];
          const migratedCompleted = refetchedRows.find(r => r.status === 'completed') ?? null;
          if (migratedCompleted) {
            setActiveResult(migratedCompleted.result);
            setPhase('review');
            setLoading(false);
            return;
          }
        }
      }

      setActiveResult(latestCompleted?.result ?? null);

      if (latestDraft) {
        setDraft(latestDraft);
        draftIdRef.current = latestDraft.id;
        setDraftState(latestDraft.draft_state);
        setPhase('draft-resume');
      } else if (latestCompleted) {
        setPhase('review');
      } else {
        setPhase('intro');
      }
    } catch (e: any) {
      setError(formatConnectionError(e?.message || 'Could not load work values.'));
      setPhase('intro');
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // ── Create a new draft ───────────────────────────────────────
  const startAssessment = useCallback(async (blocks: number[][]) => {
    if (!user) return;

    // If there's already a draft, reuse it
    if (draftIdRef.current) {
      setPhase('assessment');
      return;
    }

    const initialDraft: DraftState = {
      blocks,
      rankings: {},
      intensityRatings: {},
      currentBlock: 0,
      currentRatingIdx: 0,
      phase: 'ranking',
    };

    try {
      const { data, error: insertError } = await supabase
        .from('work_values_assessments')
        .insert({
          user_id: user.id,
          status: 'draft',
          draft_state: initialDraft,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const row = data as unknown as WorkValuesRow;
      draftIdRef.current = row.id;
      setDraft(row);
      setDraftState(initialDraft);
      setPhase('assessment');
    } catch (e: any) {
      setError(formatConnectionError(e?.message || 'Could not start assessment.'));
    }
  }, [user]);

  // ── Debounced draft save ─────────────────────────────────────
  const saveDraft = useCallback(async (state: DraftState) => {
    if (!user || !draftIdRef.current) return;

    const { error: updateError } = await supabase
      .from('work_values_assessments')
      .update({ draft_state: state })
      .eq('id', draftIdRef.current);

    if (updateError) {
      console.error('Failed to save draft:', updateError.message);
    }
  }, [user]);

  const scheduleDraftSave = useCallback((state: DraftState) => {
    setDraftState(state);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveDraft(state);
    }, 1000);
  }, [saveDraft]);

  // ── Resume draft ─────────────────────────────────────────────
  const resumeDraft = useCallback(() => {
    if (draftState) setPhase('assessment');
  }, [draftState]);

  // ── Discard draft ────────────────────────────────────────────
  const discardDraft = useCallback(async () => {
    if (!user || !draftIdRef.current) return;

    const idToDelete = draftIdRef.current;
    draftIdRef.current = null;
    setDraft(null);
    setDraftState(null);

    if (activeResult) {
      setPhase('review');
    } else {
      setPhase('intro');
    }

    await supabase
      .from('work_values_assessments')
      .delete()
      .eq('id', idToDelete);
  }, [user, activeResult]);

  // ── Complete assessment ──────────────────────────────────────
  const completeAssessment = useCallback(async (
    rankings: Record<number, number[]>,
    intensityRatings: Record<number, number>,
  ): Promise<WorkValuesResult | null> => {
    if (!user || !draftIdRef.current) return null;

    const computed = scoreWorkValues(rankings, intensityRatings);

    try {
      // Mark draft as completed
      const { error: updateError } = await supabase
        .from('work_values_assessments')
        .update({
          status: 'completed',
          result: computed,
          completed_at: new Date().toISOString(),
          draft_state: null,
        })
        .eq('id', draftIdRef.current);

      if (updateError) throw updateError;

      // Flush the debounced save timer if pending
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }

      draftIdRef.current = null;
      setDraft(null);
      setDraftState(null);
      setActiveResult(computed);
      setPhase('review');

      return computed;
    } catch (e: any) {
      setError(formatConnectionError(e?.message || 'Could not save completed assessment.'));
      return null;
    }
  }, [user]);

  // ── Redo (start a new assessment) ────────────────────────────
  const redo = useCallback(async (blocks: number[][]) => {
    // Don't start a new draft if one already exists
    if (draftIdRef.current) {
      setPhase('assessment');
      return;
    }
    await startAssessment(blocks);
  }, [startAssessment]);

  return {
    phase,
    activeResult,
    draft,
    draftState,
    loading,
    error,
    startAssessment,
    scheduleDraftSave,
    resumeDraft,
    discardDraft,
    completeAssessment,
    redo,
  };
}
