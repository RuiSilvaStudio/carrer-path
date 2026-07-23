import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ncwtmagvjtpqnwroyuha.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_MtH4laIgqpmwU1a5XpWmPg_-eOrrSxE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
