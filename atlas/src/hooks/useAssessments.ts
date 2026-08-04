import { useState, useEffect } from 'react';
import type { Assessment } from '../types';
import { supabase } from '../lib/supabase';
import { formatConnectionError } from '../lib/errors';

export function useAssessments(userId: string | null) {
  const [baseline, setBaseline] = useState<Assessment | null>(null);
  const [pulses, setPulses] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  // Track which userId the data was fetched for — prevents stale-data race condition
  const [fetchedForUserId, setFetchedForUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setBaseline(null);
      setPulses([]);
      setLoading(false);
      setError(null);
      setFetchedForUserId(null);
      return;
    }

    setLoading(true);
    setError(null);

    async function fetchAssessments() {
      try {
        const { data, error } = await supabase
          .from('assessments')
          .select('*')
          .eq('user_id', userId!)
          .order('timestamp', { ascending: true });

        if (error) throw error;

        const assessments = (data || []) as Assessment[];
        const bl = assessments.find(a => a.type === 'baseline') ?? null;
        const ps = assessments.filter(a => a.type === 'pulse');
        setBaseline(bl);
        setPulses(ps);
      } catch (e: any) {
        console.error('Failed to fetch assessments:', e);
        setError(formatConnectionError(e?.message || 'Could not load your data.'));
      }
      setFetchedForUserId(userId!);
      setLoading(false);
    }

    fetchAssessments();
  }, [userId, retryCount]);

  // Data is only ready when fetched for the exact current userId
  const ready = fetchedForUserId === userId;

  return {
    baseline,
    pulses,
    loading: loading || !ready,
    ready,
    error,
    refetch: () => setRetryCount(c => c + 1),
  };
}
