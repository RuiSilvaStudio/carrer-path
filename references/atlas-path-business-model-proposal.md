# Atlas Path — Business Model & Feature Roadmap Proposal

## Core Hypothesis

People pay for career direction when it reduces three specific anxieties:

1. "Am I moving in the right direction?" → Needs evidence, not vibes
2. "What will it actually take to get there?" → Needs quantified gap + timeline
3. "What if I'm wrong?" → Needs risk assessment + reversible experiments

The current V2 product addresses #1 lightly. #2 and #3 are almost entirely missing.

---

## Feature Roadmap: From Free to "I Need This"

### Phase 1 — Keep Free (User Acquisition & Feedback)

| Feature | Why Free | What You Learn |
|---|---|---|
| Profile builder | Entry point, trust building | Which fields users actually fill vs. skip |
| Explorer (3 directions) | Demonstrates value | Which suggestions users pursue vs. ignore |
| Basic fit badges | Shows methodology works | Whether the 5-dimension model resonates |
| Brief export (basic) | Creates shareable artifact | Do users actually download/use it? |

**Goal:** Prove people complete the full 4-step flow and return to it.

---

### Phase 2 — First Paid Trigger (The "Must-Have" Moment)

**Feature: Quantified skill proximity + live demand signal**

**What it delivers:**
- Skill proximity score (0–100) for each suggested direction, computed via ESCO/O*NET weighted Jaccard similarity
- Skill gap breakdown: "You have 7 of 12 core skills for this role. Here are the 5 missing skills, ranked by importance"
- Local demand signal: "In Portugal, 340 job postings in the last 30 days require these skills. Average salary: €X–Y"
- Specific learning path: Not "learn Python" but "these 3 courses + these 2 portfolio projects + expected timeline"

**Why this justifies payment:**
- It takes 20+ hours of manual research and delivers it in 30 seconds
- It's defensible — requires ESCO integration + LLM enrichment, not easily copied by a solo dev
- It's acquirable — the skill proximity engine + labor market data integration is valuable IP

**Pricing trigger:** Free gives you direction suggestions with qualitative fit. Paid unlocks quantified proximity + demand + learning path.

**Price point:** $29–49 one-time per brief, or $9.99/month for unlimited.

---

### Phase 3 — Lock-in and Retention

**Feature: Transition experiment designer**

**What it delivers:**
- 90-day reversible experiments for each direction (e.g., "Interview 3 people doing this role" / "Build one project using these skills" / "Freelance one small project in this domain")
- Signal tracking: "After your first experiment, update your profile. Re-run proximity to see if the score changed."
- Fallback planning: "If experiment 1 fails, here are 2 alternative paths with similar skill overlap"
- Progress dashboard: Skills gap closing over time, market demand trends

**Why this justifies retention:**
- Users return weekly to log experiment outcomes
- The tool becomes a career operating system, not a one-time report
- Higher LTV, lower churn

---

### Phase 4 — Premium / B2B Bridge

**Feature: Career brief as a professional deliverable**

Export a shareable career brief formatted like a strategy document:
- Executive summary of direction
- Skill proximity analysis with evidence
- Market demand data with sources
- 90-day transition plan
- Risk matrix

**Monetization:**
- Individual: $49 one-time for a polished PDF brief
- B2B: Sell to bootcamps, outplacement firms, universities as a "career outcomes" tool at $X/seat

This is your acquisition narrative: a product with proven user engagement and a clear institutional use case.

---

## What Makes This Defensible

| Asset | Why It's Hard to Copy |
|---|---|
| ESCO + EURES integration layer | Data engineering + ongoing API maintenance |
| LLM enrichment prompts | Crafted over months, tuned to your methodology |
| User workflow and UX | Design taste, not code |
| Transition experiment library | Curated knowledge, not just data |
| User trust and retention | Earned over time, not downloaded |

The code can be replicated. The curated data, tuned prompts, and user workflow cannot.

---

## What NOT to Build

| Feature | Why It's a Trap |
|---|---|
| Personality tests | Commodity, trust deficit, legally risky |
| Job board aggregator | LinkedIn/Indeed already do this better |
| Generic AI chat for career advice | Looks like free ChatGPT + worse UX |
| Coaching marketplace | Two-sided network effects you can't win |
| Resume builder | Crowded, low WTP, commoditized |

---

## Operational Readiness Assessment

Current state: **Sovereign EU infrastructure live and GDPR-compliant. Test group active.**

Completed:
1. ✅ Stable staging environment (staging branch + Vercel Preview)
2. ✅ Regression gates (vitest, 11 tests passing, build+lint gate)
3. ✅ Analytics for flow tracking (privacy-safe, RLS, 24-month auto-retention)
4. ✅ User feedback pipeline (laddered, 6 surfaces, 24-month auto-retention)
5. ✅ GDPR compliance (privacy policy, delete account, export all data, hard-delete)
6. ✅ Sovereign EU infrastructure (self-hosted LLM + Supabase, no US company in data path)

Remaining before Phase 2 pricing:
1. SEO-ready landing page (meta tags, OG image, sitemap)
2. Enrichment lifecycle rules for stale data handling
3. 10-user validation run with the test group

---

## Next Steps to Validate

1. Build the ESCO proximity engine (Phase 2) as a standalone Edge Function
2. Run 10 users through the full flow with the new quantified output
3. Measure: do they re-run the analysis? Do they export? Do they return?
4. If yes to all three, you have a paid feature. If no, iterate on the output format before pricing.

---

## Bottom Line

The paid version of Atlas Path is not "career advice." It's a career research engine that delivers quantified direction, labor market evidence, and action plans.

That's something professionals will pay for. That's something acquirers will buy. And it's something the scammy assessment sites can't replicate without fundamentally changing their business model.
