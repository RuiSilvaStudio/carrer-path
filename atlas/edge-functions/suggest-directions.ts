// Supabase Edge Function: suggest-directions
// Deploy via Supabase Dashboard: Edge Functions → New Function
// Name: suggest-directions
// Paste this entire file as the function body.
//
// After deploying, set the secret (same as bright-worker):
//   OPENROUTER_API_KEY = sk-or-... (already set if bright-worker is deployed)

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') ?? '';
const MODEL = 'openai/gpt-4o-mini';

const SYSTEM_PROMPT = `You are a career direction advisor for senior professionals. You receive a user's career profile (skills, roles, work values, practical conditions) and suggest 3 career directions they may NOT have considered but could plausibly pursue given their skill overlap.

Rules:
- Suggest 3 directions. Each should be a real career path, not a generic category.
- Prioritise directions that leverage existing skills but apply them in a different context, sector, or seniority level.
- Do NOT suggest the user's current or recent role — the goal is exploration, not confirmation.
- For each direction, explain the skill overlap honestly and name what the user would need to prove or learn.
- Be specific and concrete. "Head of Content Operations at a D2C brand" is useful. "Operations leader" is not.
- If the user's profile suggests a narrow field, suggest directions that broaden scope without abandoning their core strengths.

Return ONLY valid JSON — no markdown, no commentary. This exact shape:
{
  "suggestions": [
    {
      "title": "string — specific direction title",
      "rationale": "string — 2-3 sentences: why this fits their skills and what's different about this direction",
      "skillOverlap": ["string — which of their skills transfer directly"],
      "skillGaps": ["string — what they'd need to prove or learn"],
      "whatIsUnknown": "string — the biggest open question for this direction",
      "suggestedTest": "string — a low-risk way to test this direction (conversation, project, research)"
    }
  ]
}`;

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
    const { profile, workValues } = await req.json();

    if (!profile || !profile.roles || profile.roles.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No career profile data provided. Complete your profile first.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Build a compact profile summary for the LLM
    const roleSummaries = profile.roles.map((r: any) =>
      `${r.title} at ${r.organisation} (${r.startYear ?? '?'}–${r.endYear ?? 'now'}): ${r.scope}. Highlights: ${(r.highlights || []).join('; ')}`
    ).join('\n');

    const skillsList = (profile.skills || []).join(', ');
    const languages = (profile.languages || []).join(', ');
    const situation = profile.currentSituation || 'unknown';
    const location = profile.location || 'not specified';
    const arrangement = profile.workArrangement || 'open';

    // Work values summary (if assessment completed)
    let valuesSummary = 'Not yet assessed.';
    if (workValues && workValues.values) {
      const top3 = workValues.values.slice(0, 3)
        .map((v: any) => `${v.value} (${v.score})`)
        .join(', ');
      valuesSummary = `Top work values: ${top3}`;
    }

    const userPrompt = `CAREER PROFILE:
Roles:
${roleSummaries}

Skills: ${skillsList}
Languages: ${languages}
Current situation: ${situation}
Location: ${location}
Work arrangement preference: ${arrangement}

${valuesSummary}

Suggest 3 career directions this person should consider exploring that are NOT their current or recent role. Leverage their skill overlap but push into new contexts, sectors, or adjacent fields.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://atlas.ruisilvastudio.com',
        'X-Title': 'Atlas Direction Advisor',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter error:', response.status, errText);
      return new Response(
        JSON.stringify({ error: `LLM request failed: ${response.status}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No content returned from LLM' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/```json?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Could not parse LLM response as JSON');
      }
    }

    return new Response(JSON.stringify(parsed), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (err) {
    console.error('Suggest error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
