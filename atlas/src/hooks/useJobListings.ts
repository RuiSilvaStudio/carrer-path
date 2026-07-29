import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { JobListing, JobStatus } from '../types/cockpit';

export type NewJob = Omit<JobListing, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'scraped_at' | 'added_at'>;
export type JobUpdate = Partial<NewJob>;

export function useJobListings() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('job_listings')
      .select('*')
      .eq('user_id', user.id)
      .order('match_score', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setJobs((data as JobListing[]) || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const addJob = useCallback(async (job: NewJob) => {
    if (!user) return;
    const { data, error: insertError } = await supabase
      .from('job_listings')
      .insert({ ...job, user_id: user.id })
      .select()
      .single();
    if (insertError) {
      setError(insertError.message);
      return;
    }
    if (data) {
      setJobs(prev => [data as JobListing, ...prev]);
    }
  }, [user]);

  const updateJob = useCallback(async (id: number, updates: JobUpdate) => {
    const { data, error: updateError } = await supabase
      .from('job_listings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (updateError) {
      setError(updateError.message);
      return;
    }
    if (data) {
      setJobs(prev => prev.map(j => (j.id === id ? (data as JobListing) : j)));
    }
  }, []);

  const setJobStatus = useCallback(async (id: number, status: JobStatus) => {
    const { data, error: updateError } = await supabase
      .from('job_listings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (updateError) {
      setError(updateError.message);
      return;
    }
    if (data) {
      setJobs(prev => prev.map(j => (j.id === id ? (data as JobListing) : j)));
    }
  }, []);

  const deleteJob = useCallback(async (id: number) => {
    const { error: deleteError } = await supabase
      .from('job_listings')
      .delete()
      .eq('id', id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setJobs(prev => prev.filter(j => j.id !== id));
  }, []);

  return { jobs, loading, error, addJob, updateJob, setJobStatus, deleteJob, refetch: fetchJobs };
}
