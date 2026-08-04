import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { formatConnectionError } from '../lib/errors';
import { useAuth } from './useAuth';
import type { CockpitContact } from '../types/cockpit';

export type NewContact = Omit<CockpitContact, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type ContactUpdate = Partial<NewContact>;

export function useCockpit() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<CockpitContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('cockpit_data')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (fetchError) {
      setError(formatConnectionError(fetchError.message));
    } else {
      setContacts((data as CockpitContact[]) || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const addContact = useCallback(async (contact: NewContact) => {
    if (!user) return;
    const { data, error: insertError } = await supabase
      .from('cockpit_data')
      .insert({ ...contact, user_id: user.id })
      .select()
      .single();
    if (insertError) {
      setError(formatConnectionError(insertError.message));
      return;
    }
    if (data) {
      setContacts(prev => [data as CockpitContact, ...prev]);
    }
  }, [user]);

  const updateContact = useCallback(async (id: number, updates: ContactUpdate) => {
    const { data, error: updateError } = await supabase
      .from('cockpit_data')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (updateError) {
      setError(formatConnectionError(updateError.message));
      return;
    }
    if (data) {
      setContacts(prev => prev.map(c => (c.id === id ? (data as CockpitContact) : c)));
    }
  }, []);

  const deleteContact = useCallback(async (id: number) => {
    const { error: deleteError } = await supabase
      .from('cockpit_data')
      .delete()
      .eq('id', id);
    if (deleteError) {
      setError(formatConnectionError(deleteError.message));
      return;
    }
    setContacts(prev => prev.filter(c => c.id !== id));
  }, []);

  return { contacts, loading, error, addContact, updateContact, deleteContact, refetch: fetchContacts };
}
