import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  createEmptyCareerDirection,
  normaliseCareerDirection,
  updateTimestamp,
  type CareerDirectionData,
} from '../lib/careerDirection';
import { useAuth } from './useAuth';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const AUTOSAVE_DEBOUNCE_MS = 1500;
const SAVED_FADE_MS = 2500;

export function useCareerDirection() {
  const { user } = useAuth();
  const [data, setData] = useState<CareerDirectionData>(createEmptyCareerDirection());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Refs for auto-save coordination
  const dataRef = useRef(data);
  const skipAutoSaveRef = useRef(false);     // true when a direct save() is in-flight
  const savedFadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstLoadRef = useRef(true);

  // Keep dataRef in sync with state
  useEffect(() => { dataRef.current = data; }, [data]);

  // ── Core persist function (no state for saving/notice — that's handled by caller) ──
  const persist = useCallback(async (next: CareerDirectionData): Promise<boolean> => {
    if (!user) return false;
    const timestamped = updateTimestamp(next);
    const { error: saveError } = await supabase
      .from('career_direction_profiles')
      .upsert({ user_id: user.id, data: timestamped }, { onConflict: 'user_id' });
    if (saveError) {
      setError(saveError.message);
      return false;
    }
    setData(timestamped);
    return true;
  }, [user]);

  // ── Explicit save (immediate, not debounced) ──
  // Used by steps 02 & 04 for actions that need instant persistence (add direction, toggle action, etc.)
  const save = useCallback(async (next: CareerDirectionData, message = 'Saved.'): Promise<boolean> => {
    if (!user) return false;
    // Cancel any pending debounced auto-save — we're saving NOW
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    skipAutoSaveRef.current = true;
    setSaving(true);
    setSaveStatus('saving');
    setError(null);
    setNotice(null);
    const ok = await persist(next);
    setSaving(false);
    if (ok) {
      setSaveStatus('saved');
      setNotice(message);
      // Fade "saved" back to idle after a delay
      if (savedFadeTimer.current) clearTimeout(savedFadeTimer.current);
      savedFadeTimer.current = setTimeout(() => setSaveStatus('idle'), SAVED_FADE_MS);
    } else {
      setSaveStatus('error');
    }
    skipAutoSaveRef.current = false;
    return ok;
  }, [user, persist]);

  // ── Debounced auto-save ──
  // Triggers when `data` changes and no explicit save() is in-flight.
  // Skips the very first data set (initial load from DB).
  useEffect(() => {
    if (firstLoadRef.current) return;
    if (skipAutoSaveRef.current) return;
    if (!user) return;

    // Clear any existing debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      debounceTimer.current = null;
      if (skipAutoSaveRef.current) return;
      setSaveStatus('saving');
      setError(null);
      const ok = await persist(dataRef.current);
      if (ok) {
        setSaveStatus('saved');
        if (savedFadeTimer.current) clearTimeout(savedFadeTimer.current);
        savedFadeTimer.current = setTimeout(() => setSaveStatus('idle'), SAVED_FADE_MS);
      } else {
        setSaveStatus('error');
      }
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
    };
  }, [data, user, persist]);

  // ── Load from DB ──
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
    // Mark first load complete so auto-save can start watching
    firstLoadRef.current = true;  // still true; will be flipped to false on next change
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Flip firstLoadRef after the initial load effect runs.
  // The first data change AFTER load will set it to false, enabling auto-save.
  useEffect(() => {
    // This runs after every data change. If we're still on "first load",
    // flip it to false so the NEXT data change triggers auto-save.
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
    }
  }, [data]);

  const deleteCareerData = useCallback(async () => {
    if (!user) return false;
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    skipAutoSaveRef.current = true;
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
      setSaveStatus('error');
      skipAutoSaveRef.current = false;
      return false;
    }
    setData(createEmptyCareerDirection());
    setNotice('Career direction data deleted.');
    setSaveStatus('idle');
    skipAutoSaveRef.current = false;
    return true;
  }, [user]);

  const resetNotice = useCallback(() => setNotice(null), []);

  // flushPendingSave: await any in-flight debounced auto-save before navigating away
  const flushPendingSave = useCallback(async (): Promise<void> => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
      // Execute the save immediately
      setSaveStatus('saving');
      const ok = await persist(dataRef.current);
      if (ok) {
        setSaveStatus('saved');
        if (savedFadeTimer.current) clearTimeout(savedFadeTimer.current);
        savedFadeTimer.current = setTimeout(() => setSaveStatus('idle'), SAVED_FADE_MS);
      } else {
        setSaveStatus('error');
      }
    }
  }, [persist]);

  return {
    data,
    setData,
    loading,
    saving,
    error,
    notice,
    save,
    saveStatus,
    deleteCareerData,
    resetNotice,
    reload: load,
    flushPendingSave,
  };
}
