import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase env vars: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Base URL for Supabase Edge Functions.
 * Derived from VITE_SUPABASE_URL so it works with both cloud and self-hosted.
 * e.g. https://supabase.ruisilvastudio.com/functions/v1/
 */
export const EDGE_FUNCTIONS_BASE = `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1/`;
