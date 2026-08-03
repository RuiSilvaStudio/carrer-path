/* ============================================================
   Supabase Configuration — LEGACY (Personality Atlas prototype)
   This file is from the pre-Atlas-Path prototype era.
   The Atlas Path now uses env vars (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)
   via src/lib/supabase.ts, pointing to the self-hosted Supabase at
   https://supabase.ruisilvastudio.com

   The cloud Supabase project (ncwtmagvjtpqnwroyuha) is decommissioned.
   This file is kept for historical reference only. Do not use it.
   ============================================================ */

const SUPABASE_URL = 'DECOMMISSIONED — use VITE_SUPABASE_URL env var';
const SUPABASE_ANON_KEY = 'DECOMMISSIONED — use VITE_SUPABASE_ANON_KEY env var';

// supabaseClient is created once the @supabase/supabase-js CDN loads.
// We use a global variable + a ready promise so other scripts can await it.
let supabaseClient = null;
let _supabaseReady = null;

function initSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
    console.error('Supabase JS SDK not loaded. Ensure the CDN script tag is present.');
    return null;
  }
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
}

// Returns a promise that resolves with the supabase client once ready.
function getSupabase() {
  if (supabaseClient) return Promise.resolve(supabaseClient);
  if (!_supabaseReady) {
    _supabaseReady = new Promise((resolve, reject) => {
      const check = () => {
        const c = initSupabaseClient();
        if (c) resolve(c);
        else setTimeout(check, 50);
      };
      check();
    });
  }
  return _supabaseReady;
}

// Initialise as early as possible (the CDN script may already be loaded).
initSupabaseClient();
