// Supabase Edge Function: enrich-direction
// Takes a user-typed direction title + their career profile and returns
// the same insight structure as suggest-direction (rationale, skill overlap, gaps, unknowns, test).
// Deploy via Supabase Dashboard: Edge Functions → New Function
// Name: enrich-direction
//
// Uses the same OPENROUTER_API_KEY secret already set for bright-worker/suggest-direction.

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') ?? '';
const MODEL = 'openai/gpt-4o-mini';

const SYSTEM_PROMPT = `You are a career direction analyst. The user has typed a career direction they want to explore. Given their career profile (skills, roles, work values, practical conditions), analyse how well this specific direction fits across five dimensions.

Return ONLY valid JSON — no markdown, no commentary. This exact shape:
{
  "rationale": "string — 2-3 sentences: why this direction does or doesn't fit their skills, and what's different about this direction vs their current path",
  "skillOverlap": ["string — which of their existing skills transfer directly to this direction"],
  "skillGaps": ["string — what they'd need to prove or learn for this direction"],
  "workValuesAlignment": "string — 2-3 sentences: how well does this direction serve the user's top work values? Name each value and assess fit honestly",
  "workValuesBullets": { "strong": ["string — top work values this direction serves well, as short tags"], "stretch": ["string — top work values this direction may not serve well, as short tags"] },
  "practicalFit": "string — 2-3 sentences: given the user's practical conditions (location, remote preference, travel tolerance, income needs, availability), does this direction typically support them?",
  "practicalFitFlags": ["string — short tags: 'remote-friendly' or 'requires relocation', 'income match' or 'income may be lower', 'immediate start' or 'longer search', etc."],
  "practicalFitBullets": ["string — 1-2 short bullet points on practical fit, e.g. 'Remote-friendly · Income match', 'Longer search (3-6 months)'"],
  "whatIsUnknown": "string — the biggest open question or risk for this direction given their profile",
  "unknownBullet": "string — one short bullet capturing the biggest unknown, max 12 words",
  "suggestedTest": "string — a specific, low-risk way to test this direction (conversation, project, research) that takes under 2 hours",
  "testBullet": "string — one short bullet capturing the suggested test, max 15 words",
  "dimensionRatings": {
    "skills": "strong" | "good" | "stretch",
    "workValues": "strong" | "good" | "stretch",
    "practical": "strong" | "good" | "stretch",
    "evidence": "strong" | "good" | "stretch",
    "fit": "strong" | "good" | "stretch"
  }
}

Rating guide for dimensionRatings:
- "strong": this dimension is a clear advantage — the direction aligns well with the user's profile on this axis
- "good": reasonable alignment with some caveats — workable but not seamless
- "stretch": this dimension is a genuine challenge — the user would need to close a significant gap

Rules:
- Be honest. If the direction is a poor fit on any dimension, say so clearly.
- Skill overlap should reference the user's actual skills, not generic ones.
- Work values alignment must name the user's specific top values and assess each.
- Practical fit must reference the user's actual conditions (remote, location, income, travel).
- The suggested test should be something they can do in under 2 hours or one conversation.
- Return ONLY the JSON object.`;

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
      status: 405, headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { title, profile, workValues } = await req.json();

    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: 'A direction title is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (!profile || !profile.roles || profile.roles.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No career profile data provided.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const roleSummaries = profile.roles.map((r: any) =>
      `${r.title} at ${r.organisation} (${r.startYear ?? '?'}–${r.endYear ?? 'now'}): ${r.scope}.`
    ).join('\n');

    const skillsList = (profile.skills || []).join(', ');
    const situation = profile.currentSituation || 'unknown';

    let valuesSummary = 'Not yet assessed.';
    if (workValues && workValues.values) {
      const top3 = workValues.values.slice(0, 3)
        .map((v: any) => `${v.value} (${v.score})`)
        .join(', ');
      valuesSummary = `Top work values: ${top3}`;
    }

    const userPrompt = `DIRECTION TO ANALYSE:
"${title.trim()}"

CAREER PROFILE:
Roles:
${roleSummaries}

Skills: ${skillsList}
Current situation: ${situation}

${valuesSummary}

Analyse how well this direction fits their profile.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://atlas.ruisilvastudio.com',
        'X-Title': 'Atlas Direction Enricher',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 2000,
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
    console.error('Enrich error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
