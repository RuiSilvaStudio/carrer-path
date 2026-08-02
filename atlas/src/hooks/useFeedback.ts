import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { FeedbackKind, FeedbackSurface } from '../lib/feedback';

// ────────────────────────────────────────────────────────────────
// useFeedback
// One hook per feedback instance (surface + item). Handles the
// laddered flow, the "already answered" guard, and fire-and-forget
// inserts. Like track(), a failed insert never surfaces an error.
// ────────────────────────────────────────────────────────────────

export type FeedbackState =
  | 'idle'        // not yet answered, prompt visible
  | 'answered'    // completed (at least the primary question)
  | 'hidden';     // dismissed or already answered previously

interface InsertRow {
  surface: FeedbackSurface;
  item_id: string | null;
  kind: FeedbackKind;
  value: Record<string, unknown>;
  parent_id?: number | null;
}

export function useFeedback(surface: FeedbackSurface, itemId: string | null) {
  const { user } = useAuth();
  const [state, setState] = useState<FeedbackState>('idle');
  /** id of the boolean/ranking row, used as parent for follow-ups. */
  const [responseId, setResponseId] = useState<number | null>(null);
  /** the boolean vote, so the component knows whether to offer the dropdown. */
  const [vote, setVote] = useState<boolean | null>(null);
  /** whether the negative-path dropdown was answered. */
  const [dropdownAnswered, setDropdownAnswered] = useState(false);

  // ── Already-answered guard: never re-ask on an answered item. ──
  useEffect(() => {
    if (!user || !itemId) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('feedback_events')
          .select('id')
          .eq('user_id', user.id)
          .eq('surface', surface)
          .eq('item_id', itemId)
          .in('kind', ['boolean', 'ranking', 'dismiss'])
          .limit(1);
        if (!cancelled && !error && data && data.length > 0) setState('hidden');
      } catch {
        // guard must never break rendering
      }
    })();
    return () => { cancelled = true; };
  }, [user, surface, itemId]);

  const insert = useCallback(
    async (row: InsertRow): Promise<number | null> => {
      if (!user) return null;
      try {
        const { data, error } = await supabase
          .from('feedback_events')
          .insert({ user_id: user.id, ...row })
          .select('id')
          .single();
        if (error) return null;
        return (data?.id as number) ?? null;
      } catch {
        return null;
      }
    },
    [user],
  );

  const submitBoolean = useCallback(
    async (value: boolean) => {
      const id = await insert({ surface, item_id: itemId, kind: 'boolean', value: { vote: value } });
      setResponseId(id);
      setVote(value);
      // Positive completes immediately. Negative opens the dropdown path.
      if (value) setState('answered');
    },
    [insert, surface, itemId],
  );

  const submitDropdown = useCallback(
    async (choice: string) => {
      await insert({ surface, item_id: itemId, kind: 'dropdown', value: { choice }, parent_id: responseId });
      setDropdownAnswered(true);
      setState('answered');
    },
    [insert, surface, itemId, responseId],
  );

  const submitRanking = useCallback(
    async (score: number) => {
      const id = await insert({ surface, item_id: itemId, kind: 'ranking', value: { score } });
      setResponseId(id);
      setState('answered');
    },
    [insert, surface, itemId],
  );

  const submitText = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      await insert({ surface, item_id: itemId, kind: 'text', value: { text: text.trim() }, parent_id: responseId });
    },
    [insert, surface, itemId, responseId],
  );

  /** Dismissal is a signal too. Log it, then hide. */
  const dismiss = useCallback(async () => {
    await insert({ surface, item_id: itemId, kind: 'dismiss', value: {}, parent_id: responseId });
    setState('hidden');
  }, [insert, surface, itemId, responseId]);

  return {
    state,
    vote,
    dropdownAnswered,
    submitBoolean,
    submitDropdown,
    submitRanking,
    submitText,
    dismiss,
  };
}
