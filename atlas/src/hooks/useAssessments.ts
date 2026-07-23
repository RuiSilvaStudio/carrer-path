import { useState, useEffect } from 'react';
import type { Assessment } from '../types';
import { supabase } from '../lib/supabase';

export function useAssessments(userId: string | null) {
  const [baseline, setBaseline] = useState<Assessment | null>(null);
  const [pulses, setPulses] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setBaseline(null);
      setPulses([]);
      setLoading(false);
      return;
    }

    async function fetchAssessments() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('assessments')
          .select('*')
          .eq('user_id', userId)
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
      setLoading(false);
    }

    fetchAssessments();
  }, [userId]);

  return { baseline, pulses, loading };
}
