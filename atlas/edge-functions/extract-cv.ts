// Supabase Edge Function: extract-cv
// Deploy via Supabase Dashboard: Edge Functions → New Function
// Name: extract-cv
// Paste this entire file as the function body.
//
// After deploying, set the secret:
// After deploying, set the secrets:
//   LLM_API_KEY = atlas_... (the Atlas LLM API key)
//   LLM_URL = https://llm.ruisilvastudio.com/v1/chat/completions (optional, has default)
//
// The function receives raw CV text (from PDF extraction or paste),
// sends it to an LLM, and returns structured JSON.

const LLM_API_KEY = Deno.env.get('LLM_API_KEY') ?? '';
const LLM_URL = Deno.env.get('LLM_URL') ?? 'https://llm.ruisilvastudio.com/v1/chat/completions';
const MODEL = 'qwen2.5:7b';

const SYSTEM_PROMPT = `You are a career CV extraction assistant. You receive raw text from a CV, LinkedIn profile, or career summary. Extract structured information and return ONLY valid JSON — no markdown, no commentary.

Return this exact JSON shape:
{
  "roles": [
    {
      "title": "string — job title",
      "organisation": "string — company/org",
      "startYear": "number or null",
      "endYear": "number or null (null = current)",
      "location": "string or null",
      "scope": "string — 1-line summary of scope (team size, budget, scale)",
      "highlights": ["string — quantified achievement or key responsibility, max 5 items"]
    }
  ],
  "skills": ["string — distinct skills/competencies, max 20"],
  "education": [
    {
      "qualification": "string",
      "institution": "string or null",
      "year": "number or null"
    }
  ],
  "languages": ["string"],
  "summary": "string — 2-3 sentence career summary in third person",
  "currentSituation": "string — inferred from dates/gaps. One of: 'employed_exploring', 'employed_urgent', 'unemployed_short', 'unemployed_medium', 'unemployed_long', 'freelancing', 'sabbatical', 'returning'"
}

Rules:
- If you cannot determine a field, use null or empty array, never guess.
- Extract quantified metrics verbatim (€50M, 900+ team, 10%→1%, etc.).
- Skills should be distinct competencies, not generic adjectives.
- The summary should be factual, not promotional.
- Return ONLY the JSON object. No markdown fences, no explanation.`;

Deno.serve(async (req: Request) => {
  // Handle CORS
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
    const { text } = await req.json();

    if (!text || typeof text !== 'string' || text.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: 'Text too short or missing. Need at least 50 characters of CV text.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Truncate to 15000 chars to stay within token limits
    const truncated = text.slice(0, 15000);

    const response = await fetch(LLM_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LLM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: truncated },
        ],
        temperature: 0.1,
        max_tokens: 4000,
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

    // Parse the JSON content (LLM should return clean JSON with response_format)
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Fallback: try to extract JSON from markdown fences
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
    console.error('Extract error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
