// Supabase Edge Function: market-insight
// Deploy via Supabase Dashboard: Edge Functions → New Function
// Name: market-insight
// Uses the same OPENROUTER_API_KEY secret already set.

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') ?? '';
const MODEL = 'openai/gpt-4o-mini';

const SYSTEM_PROMPT = `You are a career market analyst. Given a specific career direction and the user's location/practical conditions, provide a market insight summary.

You must be honest about what you know and don't know. Do not fabricate specific statistics. If you cite a trend, name the general source type (e.g., "LinkedIn hiring data shows..." or "industry reports indicate...").

Return ONLY valid JSON — no markdown. This exact shape:
{
  "summary": "string — 2-3 sentences: overall market state for this type of role",
  "demandTrend": "string — 1 sentence: is demand growing, stable, or shrinking? Be specific about what's driving it",
  "hiringSectors": ["string — sectors actively hiring for this type of role, max 5"],
  "frozenSectors": ["string — sectors that have pulled back on this type of role, max 3"],
  "salaryRange": "string — broad salary range for this role type at senior level, with 'varies significantly by location and company size' caveat",
  "aiImpact": "string — 1-2 sentences: how is AI/automation changing the tasks in this role? Focus on augmentation and task change, not replacement",
  "confidence": "low" | "moderate" | "high",
  "sources": [
    {"name": "string — source name", "url": "string — source URL", "note": "string — what this source covers"}
  ]
}

Rules:
- Be specific about sectors (e.g., "AI/tech companies building creative studios" not "tech")
- If you don't have reliable data for the user's region, say so and provide general context
- Sources should be real, well-known sources (LinkedIn Economic Graph, Robert Half, Hays, Cedefop, Eurostat, OECD, etc.) — NOT fabricated URLs
- Confidence: "high" only if you have strong, recent data. Default to "moderate". Use "low" if the direction is niche or emerging
- Never claim a specific number of job openings unless you are certain
- AI impact: describe what tasks are being automated vs augmented, not whether the role will be replaced
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
    const { direction, profile } = await req.json();

    if (!direction || typeof direction !== 'string' || direction.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: 'A direction title is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const location = profile?.location ?? 'not specified';
    const arrangement = profile?.workArrangement ?? 'not specified';
    const skills = (profile?.skills ?? []).join(', ');

    const userPrompt = `DIRECTION: "${direction.trim()}"

USER CONTEXT:
Location: ${location}
Work arrangement: ${arrangement}
Key skills: ${skills}

Provide a market insight for this direction.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://atlas.ruisilvastudio.com',
        'X-Title': 'Atlas Market Insight',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2500,
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
      if (jsonMatch) parsed = JSON.parse(jsonMatch[1]);
      else throw new Error('Could not parse LLM response as JSON');
    }

    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (err) {
    console.error('Market insight error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
