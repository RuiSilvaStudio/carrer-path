/* ============================================================
   Supabase Configuration — Personality Atlas
   Shared across all pages. Loaded via CDN <script> tag.
   ============================================================ */

const SUPABASE_URL = 'https://ncwtmagvjtpqnwroyuha.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jd3RtYWd2anRwcW53cm95dWhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3OTY5MzIsImV4cCI6MjEwMDM3MjkzMn0.6IgnKQZHy5_E1xQO1SAkZpbOJafAv9mfcGXWKg2cUQ4';

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
