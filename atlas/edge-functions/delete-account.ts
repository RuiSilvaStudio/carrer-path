// Supabase Edge Function: delete-account
// Deletes a user's auth account. All user data is cascaded via on-delete-cascade FKs.
// The caller must provide a valid JWT (Authorization: Bearer) — we verify
// the JWT and then delete the corresponding auth.users row using the
// service role key.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? 'http://kong:8000';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Extract JWT from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing authorization.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const jwt = authHeader.replace('Bearer ', '');

    // Verify the JWT by calling auth/v1/user — this confirms the token is valid
    // and belongs to a real user.
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'apikey': SERVICE_ROLE_KEY,
      },
    });

    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userData = await userRes.json();
    const userId = userData.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Could not identify user.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Delete the user using the admin API
    // This cascades to all tables with on-delete-cascade FKs:
    // assessments, career_direction_profiles, cockpit_data, contact_log,
    // job_listings, feedback_events, analytics_events
    const deleteRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
      },
    });

    if (!deleteRes.ok) {
      const errText = await deleteRes.text();
      console.error('Delete user error:', deleteRes.status, errText);
      return new Response(JSON.stringify({ error: 'Failed to delete account.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Delete account error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
