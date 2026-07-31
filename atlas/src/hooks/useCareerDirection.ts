import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  createEmptyCareerDirection,
  normaliseCareerDirection,
  updateTimestamp,
  type CareerDirectionData,
} from '../lib/careerDirection';
import { useAuth } from './useAuth';

export function useCareerDirection() {
  const { user } = useAuth();
  const [data, setData] = useState<CareerDirectionData>(createEmptyCareerDirection());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setData(createEmptyCareerDirection());
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const { data: row, error: loadError } = await supabase
      .from('career_direction_profiles')
      .select('data')
      .eq('user_id', user.id)
      .maybeSingle();

    if (loadError) {
      setError(loadError.message);
    } else {
      setData(normaliseCareerDirection(row?.data));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(async (next: CareerDirectionData, message = 'Saved.') => {
    if (!user) return false;
    const timestamped = updateTimestamp(next);
    setSaving(true);
    setError(null);
    setNotice(null);
    const { error: saveError } = await supabase
      .from('career_direction_profiles')
      .upsert({ user_id: user.id, data: timestamped }, { onConflict: 'user_id' });

    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return false;
    }
    setData(timestamped);
    setNotice(message);
    return true;
  }, [user]);

  const deleteCareerData = useCallback(async () => {
    if (!user) return false;
    setSaving(true);
    setError(null);
    setNotice(null);
    const { error: deleteError } = await supabase
      .from('career_direction_profiles')
      .delete()
      .eq('user_id', user.id);
    setSaving(false);
    if (deleteError) {
      setError(deleteError.message);
      return false;
    }
    setData(createEmptyCareerDirection());
    setNotice('Career direction data deleted.');
    return true;
  }, [user]);

  const resetNotice = useCallback(() => setNotice(null), []);

  return { data, setData, loading, saving, error, notice, save, deleteCareerData, resetNotice, reload: load };
}
