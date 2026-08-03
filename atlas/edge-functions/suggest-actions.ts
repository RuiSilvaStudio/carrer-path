// Supabase Edge Function: suggest-actions
// Deploy via Supabase Dashboard: Edge Functions → New Function
// Name: suggest-actions
// Uses the same LLM_API_KEY secret.

const LLM_API_KEY = Deno.env.get('LLM_API_KEY') ?? '';
const LLM_URL = Deno.env.get('LLM_URL') ?? 'https://llm.ruisilvastudio.com/v1/chat/completions';
const MODEL = 'qwen2.5:7b';

const SYSTEM_PROMPT = `You are a career action advisor. Given a career direction, generate 4 specific, intentional actions the user should take to move forward. These should feel relevant to the direction without being hyper-personalized — generic enough to always produce useful output, specific enough to feel intentional.

Return ONLY valid JSON — no markdown. This exact shape:
{
  "actions": [
    {
      "title": "string — short action title (max 8 words)",
      "description": "string — 1 sentence: what to do and why",
      "category": "search" | "network" | "learn" | "prepare"
    }
  ]
}

Action categories and guidelines:
- "search": Find and review real job postings, role descriptions, or company career pages for this direction
- "network": Identify and reach out to people doing this role — LinkedIn, alumni networks, professional communities
- "learn": Identify a skill, course, certification, or knowledge area that would strengthen positioning for this direction
- "prepare": Prepare a concrete artefact — update CV section, draft an outreach message, build a portfolio piece

Rules:
- Exactly 4 actions, one per category
- Each action should be doable in under 2 hours
- Be specific to the direction (e.g., "Search for 'Head of Content Operations' roles on LinkedIn in e-learning and D2C sectors" not "Search for jobs")
- Do NOT reference the user's personal profile — keep it about the direction, not about them
- Do NOT include disclaimers or caveats — just the action
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
    const { direction } = await req.json();

    if (!direction || typeof direction !== 'string' || direction.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: 'A direction title is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const userPrompt = `DIRECTION: "${direction.trim()}"\n\nGenerate 4 actions for this direction.`;

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
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 1500,
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
    console.error('Suggest actions error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
