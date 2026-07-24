import { useState, useEffect } from 'react';
import type { Assessment } from '../types';
import { supabase } from '../lib/supabase';

export function useAssessments(userId: string | null) {
  const [baseline, setBaseline] = useState<Assessment | null>(null);
  const [pulses, setPulses] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  // Track which userId the data was fetched for — prevents stale-data race condition
  const [fetchedForUserId, setFetchedForUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setBaseline(null);
      setPulses([]);
      setLoading(false);
      setFetchedForUserId(null);
      return;
    }

    setLoading(true);

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
      } catch (e) {
        console.error('Failed to fetch assessments:', e);
      }
      setFetchedForUserId(userId!);
      setLoading(false);
    }

    fetchAssessments();
  }, [userId]);

  // Data is only ready when fetched for the exact current userId
  const ready = fetchedForUserId === userId;

  return { baseline, pulses, loading: loading || !ready, ready };
}
