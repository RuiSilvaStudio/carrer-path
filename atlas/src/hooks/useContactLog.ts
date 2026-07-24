import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { ContactLogEntry, NewLogEntry, LogEntryUpdate } from '../types/contactLog';

export function useContactLog(contactId: number | null) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ContactLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!user || !contactId) {
      setLogs([]);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('contact_log')
      .select('*')
      .eq('contact_id', contactId)
      .order('sent_date', { ascending: false });
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setLogs((data as ContactLogEntry[]) || []);
    }
    setLoading(false);
  }, [user, contactId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const addLog = useCallback(async (entry: Omit<NewLogEntry, 'contact_id'>) => {
    if (!user || !contactId) return;
    const { data, error: insertError } = await supabase
      .from('contact_log')
      .insert({ ...entry, user_id: user.id, contact_id: contactId })
      .select()
      .single();
    if (insertError) {
      setError(insertError.message);
      return;
    }
    if (data) {
      setLogs(prev => [data as ContactLogEntry, ...prev]);
    }
  }, [user]);

  const updateLog = useCallback(async (id: number, updates: LogEntryUpdate) => {
    const { data, error: updateError } = await supabase
      .from('contact_log')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (updateError) {
      setError(updateError.message);
      return;
    }
    if (data) {
      setLogs(prev => prev.map(l => (l.id === id ? (data as ContactLogEntry) : l)));
    }
  }, []);

  const deleteLog = useCallback(async (id: number) => {
    const { error: deleteError } = await supabase
      .from('contact_log')
      .delete()
      .eq('id', id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setLogs(prev => prev.filter(l => l.id !== id));
  }, []);

  return { logs, loading, error, addLog, updateLog, deleteLog, refetch: fetchLogs };
}
