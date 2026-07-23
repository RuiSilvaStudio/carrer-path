import { useState, useEffect } from 'react';
import type { DemoPulse } from '../types';
import { supabase } from '../lib/supabase';

export function useDemoData() {
  const [demoData, setDemoData] = useState<DemoPulse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDemo() {
      try {
        const { data, error } = await supabase
          .from('demo_data')
          .select('*')
          .order('pulse', { ascending: true });

        if (error) throw error;

        const pulses = (data || []).map(row => {
          const traits = row.traits || {};
          return {
            ...row,
            openness: traits.openness,
            conscientiousness: traits.conscientiousness,
            extraversion: traits.extraversion,
            agreeableness: traits.agreeableness,
            emotional_stability: traits.emotional_stability,
          } as DemoPulse;
        });

        setDemoData(pulses);
      } catch (e) {
        console.error('Failed to fetch demo data:', e);
      }
      setLoading(false);
    }

    fetchDemo();
  }, []);

  return { demoData, loading };
}
