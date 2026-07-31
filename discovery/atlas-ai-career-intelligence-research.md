# Atlas Evolution — AI Labor-Market Intelligence Layer

**Research note for Rui · discovery/ folder per AGENTS.md guardrails · 2026-07-30**

Purpose: grounding research for a new Atlas capability — *"given a known user
context (profile, prior roles, current situation), predict the most defensible
near-future job-market moves under AI-driven labor change."* This is
deliberately evidence-led. Claims are tagged to the source they came from so we
can keep / drop them when we design the feature.

---

## 1. What the credible sources actually agree on

There is real scientific disagreement on magnitudes (because the field is moving
fast and forecasting labor markets is genuinely hard), but on **structure** the
evidence is converging. That structural consensus is what Atlas should encode.

### 1.1 Net effect on jobs: small-positive, but mostly in the rear-view mirror
| Source | Headline figure | What it measures |
|---|---|---|
| **WEF Future of Jobs 2025** | **92M displaced, 170M created, net +78M by 2030** | Employer-reported hiring plans across 55 economies, ~14M workers surveyed |
| **WEF Four Futures (Jan 2026)** | 4 scenarios for 2030; "Age of Displacement" vs "Innovation & Productivity" diverge on reskilling success | Scenario modelling, executive opinion survey of 10,000+ execs |
| **McKinsey (earlier baseline)** | 400–800M workers may need to switch occupations by 2030 | Occupational transitions required, midpoint–fast-adoption |
| **McKinsey US (2024)** | **12M additional occupational shifts in the US by 2030** | US-specific, post-ChatGPT acceleration |
| **Acemoglu (NBER 32487, 2024)** | **TFP gain ≤ 0.66% over 10 years, more realistically ≤ 0.53%** | Macroeconomic forecast from task-level experimental evidence |
| **ILO "Work Transformed" (2025)** | "Globally 1 in 4 workers in an occupation with some GenAI exposure" | Refined global index of occupational exposure |
| **OECD (Korea study, 2025)** | "Little evidence of negative aggregate employment outcomes due to AI" so far | 8 OECD-country firm surveys |
| **Goldman Sachs (2024)** | ~300M jobs globally affected; 18% of work-hours | Generative-AI exposure estimate |
| **Unais Ali / ResearchGate (Nov 2025)** | 85M displaced, 97M created, net +12M | Synthesis citing WEF, McKinsey, St Louis Fed |
| **Harvard Chen/Srinivasan/Zakerinia (Dec 2024)** | Firm-level: **17% decline in automation-prone jobs, 22% rise in augmentation-prone jobs** | Lightcast + Burning Glass posting analysis, US |

**Convergent point:** the *headline* is small-positive net. But it
disaggregates **badly** — most of the +78M is in new roles that don't yet
exist; most of the −92M is in existing roles that will be restructured, not
extinguished in one day. The **churn rate** (WEF: 22% of the workforce will
move roles) is the more important number than the net.

### 1.2 What gets automated vs. augmented
The most useful framing comes from the academic literature:

- **Felten/Raj/Seamans AIOE** (2018, 2021) — maps AI progress to worker
  *abilities* in O*NET. High exposure = managers, professionals, office &
  admin support. Low = service, production, construction.
- **Eloundou et al. "GPTs are GPTs"** (Science, 2024) — task-level
  LLM-exposure. ~80% of US workers have ≥10% of tasks exposed; ~19% have ≥50%.
- **Gmyrek/Berg/Buffington et al. (ILO, 2025) Refined Global Index** — moves
  beyond a binary "exposed / not" into **six gradients** based on μ (mean task
  score) and σ (task variability). Gradient 4 = "highest exposure, low task
  variability" = most at risk of full automation. Gradient 2 = "moderate,
  high variability" = uneven impact, requires worker adaptation.
- **Chen/Srinivasan/Zakerinia (HBS 25-039)** — first paper to empirically
  split **displacement-prone** vs **augmentation-prone** occupations using
  real US job-posting data. Net firm-level signal: −17% automation, +22%
  augmentation. **This is the framework Atlas should adopt.**

### 1.3 The Brynjolfsson productivity evidence is *too clean to ignore*
- **Brynjolfsson, Li, Raymond (QJE 2025)** — 5,179 customer-support agents.
  **+14% productivity overall; +34% for novices; minimal for top-skill agents.**
  AI *compresses* the skill distribution: it disseminates the tacit knowledge
  of top performers to everyone else.
- **Noy & Zhang (Science 2023)**, **Peng et al.**, **Choi & Schwarcz**,
  **Dell'Acqua et al.** — convergent: lower-skilled writers/consultants benefit
  most.
- **Brynjolfsson et al. follow-on** — *early-career* workers (22–25) in the
  most AI-exposed occupations experienced a **13% relative decline in
  employment** after GenAI's spread. AI isn't just augmenting the young; it's
  closing off the rung they used to climb.

**The non-obvious finding Atlas should encode:** "AI exposure + low AI-related
job performance requirements = highest vulnerability" (White House CEA, July
2024). This is the *worker-level* version of Gmyrek's Gradient 4. It's not
"AI-exposed occupations" that lose; it's "AI-exposed occupations whose tasks
don't require what AI is good at."

### 1.4 Real-world labor signal (now, not 2030)
- **LinkedIn (Oct 2025 / Jan 2026):** AI/ML Engineer hiring **+75%**; AI talent
  pipelines **8.2× larger** when skills-over-degrees hiring is used.
- **54,000+ US layoffs in 2025** attributed to AI (LinkedIn-tracked).
- **Cedefop "Skills empower workers in the AI revolution" (2025):** 28% of EU
  adult workforce already experimenting with AI at work. Two-tier Europe
  emerging (Western > Southern/Central in adoption). Cedefop projects up to
  **5% employment reduction by 2035** in the EU under an aggressive AI
  scenario vs. baseline.
- **Federal Reserve Bank of Dallas (2024):** firms planning AI-driven hiring
  changes mostly plan to **reduce low/mid-skill and increase high-skill**.

### 1.5 The timeline is short — but not "in six months everything is different"
WEF's employer survey: **39% of workers' core skills will change by 2030**.
Harvard Business Review / McKinsey **12-month reskilling** as the realistic
unit of time for a meaningful pivot (half-academic-year in the US retraining
literature, LaLonde/Sullivan). **Displaced workers who don't retrain in
technical fields see ~25% earnings loss 5–10 years later.** So the window to
re-skill is *now to next 24 months*, not 2030.

---

## 2. The disagreement zone (so we don't oversell certainty)

This is where I push back on the loudest market narrative, because it's
critical for us not to over-claim:

- **Headline productivity claims are inflated.** Acemoglu's careful
  task-level number (≤0.66% TFP over 10y) is **an order of magnitude lower**
  than industry forecasts (Korinek & Suh 100% over 10y; Acemoglu calls this
  unrealistic). Most "AI will change everything" claims come from easy-task
  experimental studies extrapolated to the whole economy.
- **Most current evidence is *augmentation*, not displacement.** OECD 2025,
  ILO 2025, multiple firm surveys: no significant aggregate employment losses
  *yet*. WEF's own respondents are split — **54% expect AI to displace
  existing jobs; only 24% expect it to create new jobs**. Executives are more
  pessimistic than the data warrants so far.
- **Wage inequality is the under-discussed risk.** Acemoglu 2024:
  productivity gains for low-skill workers can *increase* inequality, not
  reduce it. Capital-labor income gap likely widens. Cedefop 2025: AI skill
  premium in Europe is already measurable.
- **Geographic asymmetry matters.** Cedefop: "two-tier Europe" emerging
  (Western vs Southern/Central). Portugal/Rui's market is in the lower-adoption
  tier today, which means *more lead time* but *less reskilling infrastructure*
  to catch up. This is double-edged for our Atlas user.

---

## 3. What this means for what Atlas should actually do

### 3.1 The "career path insight" feature is really four sub-features

I'll lay them out as separate, debatable chunks so we can decide what to
build:

**A. Personal AI Exposure Score** (per-user, deterministic, no LLM needed)
- Inputs: user's stated current role, past 5–10 roles, industries, education,
  seniority.
- Engine: maps each role to O*NET/SOC → AIOE + Gmyrek gradient + CEA "vulnerable"
  flag. Output: a per-user **Composite Exposure Profile** with a "what kind
  of exposure" tag (high-exposure-and-vulnerable / high-exposure-and-
  augmented / low-exposure-stable / low-exposure-skill-gap).
- Comparable to: Treasury (2024), Gmyrek/ILO gradient table, Felten AIOE.
- Confidence: **HIGH** — all inputs are peer-reviewed task-level indices.
- Caveat: indices were built mostly from US O*NET data; EU mapping via ISCO-08
  exists but has lower fidelity. We should *show our confidence*.

**B. Adjacent Path Recommendations** (per-user, semi-deterministic)
- Logic: given current role and exposure profile, find roles in lower-exposure
  bands that share ≥X% of the user's transferable skills (using the user's
  CV-extracted skills + the WEF "growing roles" list as a target catalogue).
- Output: ranked list of 5–10 "next career moves" with **why** (skills gap,
  exposure delta, demand trend).
- Source data: WEF Future of Jobs growing roles list (clean, public); McKinsey
  US 12M occupational shifts data; LinkedIn Economic Graph public subsets.
- Caveat: this *is* where LLM reasoning adds value, but **grounded retrieval**
  (RAG over the indices + the user's CV) beats open-ended generation.

**C. Probabilistic Outlook** (per-user, LLM + structured data)
- The trickiest one. The user asked specifically for "probabilities of the
  best guess predictable job markets needs." **Be careful here:** the academic
  community is divided on whether we can put clean probability bounds on this.
- What *is* defensible: scenario-weighted forecasts. WEF's "Four Futures"
  framework gives us 4 named scenarios (Innovation & Productivity, Age of
  Displacement, Talent-Driven Bifurcation, Stalled Progress). Atlas can show
  a user *"in Scenario X your current role is +5% net demand by 2030; in
  Scenario Y it's −20%"*. That's honest.
- What is *not* defensible: "you have a 73% chance of being a Director of AI
  Ops by 2028." Anyone selling that is lying.
- Confidence: **MEDIUM**. We can publish a scenario model with named
  assumptions and not pretend it's a posterior.

**D. Skill-Gap & Reskilling Route** (per-user, deterministic)
- Inputs: current skills (from CV), target role (from B), distance in skill
  space.
- Output: "to move from Role A to Role B you need to add Skills X, Y, Z;
  at your seniority, retraining programmes Z1/Z2 take 6–12 months and cost
  €K; LinkedIn / Coursera / FSE / IEFP (PT) offer pathways."
- This is where we tie Atlas back to its **Companies, ContactLog, and
  JobListings** data — a target role recommendation that doesn't link to
  actual openings and contacts is paper.
- Confidence: **HIGH** — feasible today, mostly data engineering.

### 3.2 What Atlas should NOT do (hard pushback)

- **Don't generate free-text "you should be a Chief AI Officer" content.** The
  recent ResearchGate and Instagram slop about "70% of new EU jobs by 2030
  will be AI-enabled" is unsourced. We need named sources for any forward
  statement.
- **Don't present one number as the answer.** Displacement and augmentation
  move *together* in different parts of the same occupation (HBS 25-039).
  A single "AI exposure %" hides that.
- **Don't pretend Portugal/EU is a uniform market.** Cedefop's data shows it
  isn't. We should bias toward EU/PT-default data with US as supplementary.
- **Don't moralize or hype.** This is a strategic tool. The output is "given
  this evidence base, here are your defensible moves," not motivation.

### 3.3 Where Atlas's existing structure gives us leverage
- **KnowledgeBaseView** already has a "BaselineCV" / assessment pipeline → we
  can attach exposure scoring to the existing role data.
- **JobListingsView** is real-time signal → we can cross-reference live
  postings vs the "growing roles" catalogue to validate forecasts.
- **CompaniesView** → target companies by exposure-adjusted growth.
- **Companies/ContactLog/InterviewPrep** → once a target role is chosen, the
  existing playbook is already wired up. The new feature *completes* the loop.

### 3.4 Source catalogue (what we should pull in)

**Tier-1 institutional (must use):**
- WEF Future of Jobs Report 2025 + 2026 Four Futures (public, structured data)
- OECD Employment Outlook 2023 + Korea 2025 study
- ILO "Work Transformed" brief (2025) + Gmyrek Refined Global Index
- Cedefop AI Skills Survey 2025 + EU Skills Foresight
- McKinsey Superagency in the Workplace 2025 + US Future of Work report
- US White House CEA July 2024 report
- US Treasury (2024) Occupational Exposure methodology

**Tier-2 academic (frameworks, not raw data):**
- Brynjolfsson, Li, Raymond QJE 2025 (productivity mechanism)
- Felten, Raj, Seamans AIOE (mapping methodology)
- Gmyrek et al. (gradient taxonomy — directly applicable)
- Acemoglu NBER 32487 (macro guardrails — prevents us over-claiming)
- Chen/Srinivasan/Zakerinia HBS 25-039 (displacement-vs-augmentation split)

**Tier-3 real-time signal:**
- LinkedIn Economic Graph AI reports
- Lightcast / Burning Glass skill demand feeds (if accessible)
- Eurostat / OECD employment by occupation (EU/PT fallback)

---

## 4. Open questions for the discussion

These are what I'd want Rui to weigh in on before any code:

1. **Confidence in EU-specific data vs US-centric indices.** Felten AIOE,
   Gmyrek Gradient, CEA vulnerability — all built from US O*NET. Mapping to
   EU ESCO/ISCO-08 exists but is lossy. Do we accept this trade-off, or do
   we build our own EU-tuned indices from Cedefop microdata?
2. **How much LLM reasoning do we inject, and where?** Pure retrieval over
   indices + user data is more honest but less fluent. Free-form generation
   is more readable but exposes us to hallucinated probabilities. The
   disciplined answer is "structured outputs only, every claim cited to a
   named source, scenario-weighted — not point-forecast." But that's a UX
   choice the user should validate.
3. **What does "probabilities of best-guess predictable job markets needs"
   actually mean to Rui?** If it means "give me point estimates of future
   demand by role," the literature says we can't honestly do that. If it
   means "give me scenario-weighted, source-cited outlooks per role for
   *my* profile, with the assumptions visible," that's exactly what we can
   build. **I think Rui means the second, but worth confirming.**
4. **Cadence / data freshness.** WEF and OECD update annually; LinkedIn
   quarterly; Cedefop ad-hoc. We need a refresh strategy (cron? on-demand?
   cached JSON?) and it should match the credibility tier of each source.
5. **Privacy / data boundary.** The user's CV (real names, real companies)
   becomes input to an "AI-exposure score." Who can see it? Self-only by
   default? Same as the cockpit auth posture? Worth deciding up-front.

---

## 5. TL;DR for the discussion

- The science is **clear on structure** (tasks > occupations; augmentation +
  displacement co-exist; worker skill-level matters more than job-title) and
  **contested on magnitude** (Acemoglu's 0.66% TFP vs the industry's 100%
  GDP scenarios — orders of magnitude apart).
- The defensible Atlas feature is a **four-part composite**: exposure score
  (deterministic), adjacent paths (semi-deterministic), scenario outlook
  (probabilistic but bounded), skill-gap route (deterministic). Each layer
  cites its sources; none makes a free-text claim without them.
- Rui's position is **good for this**: he's in the lower-AI-adoption tier
  (Portugal), has multi-industry experience (operations, hospitality,
  creative, leadership), and his documented track record is *operational
  delivery* — the exact skill-cluster the augmentation literature says
  benefits from GenAI (Brynjolfsson's top-skill agents see less boost because
  they're already at the ceiling; mid- and senior-operators with cross-domain
  experience are the winners).
- The honest move is to **build the structured layer first** (A + D above)
  and add the probabilistic outlook (C) only once we have a defensible
  scenario model and the user is comfortable with the uncertainty framing.

---

**Sources (canonical):**
- WEF FoJ 2025: https://reports.weforum.org/docs/WEF_Future_of_Jobs_Report_2025.pdf
- WEF Four Futures 2026: https://reports.weforum.org/docs/WEF_Four_Futures_for_Jobs_in_the_New_Economy_AI_and_Talent_in_2030_2025.pdf
- McKinsey Superagency 2025: https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/superagency-in-the-workplace-empowering-people-to-unlock-ais-full-potential-at-work
- OECD Korea 2025: https://www.oecd.org/en/publications/artificial-intelligence-and-the-labour-market-in-korea_68ab1a5a-en.html
- OECD AI and Work hub: https://www.oecd.org/en/topics/sub-issues/ai-and-work.html
- ILO Work Transformed 2025: https://www.ilo.org/sites/default/files/2025-07/ilo%20brief%20work%20transformed%20promise%20and%20peril%20of%20ai.pdf
- ILO/Gmyrek Refined Global Index: https://webapps.ilo.org/static/english/intserv/working-papers/wp140/index.html
- White House CEA July 2024: https://bidenwhitehouse.archives.gov/wp-content/uploads/2024/07/Potential-Labor-Market-Impacts-of-Artificial-Intelligence-An-Empirical-Analysis-July-2024.pdf
- US Treasury 2024 Occupational Exposure: https://home.treasury.gov/system/files/136/AI-Combined-PDF.pdf
- Brynjolfsson/Li/Raymond QJE 2025: https://academic.oup.com/qje/article/140/2/889/7990658
- Acemoglu NBER 32487 (2024): https://www.nber.org/system/files/working_papers/w32487/w32487.pdf
- Acemoglu Economic Policy 2024: https://academic.oup.com/economicpolicy/article-abstract/40/121/13/7728473
- Chen/Srinivasan/Zakerinia HBS 25-039: https://www.hbs.edu/ris/download.aspx?name=25-039.pdf
- Felten/Raj/Seamans AIOE (SSRN): https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4414065
- Cedefop AI Skills Survey 2025: https://www.cedefop.europa.eu/files/9201_en.pdf
- LinkedIn AI Workforce Reports: https://economicgraph.linkedin.com/research/ai-skills-resources
- Brookings retraining limits (2017, still cited): https://www.brookings.edu/articles/ai-labor-displacement-and-the-limits-of-worker-retraining/
- Hamilton Project / LaLonde-Sullivan (2010) retraining earnings-loss: https://www.hamiltonproject.org/assets/legacy/files/downloads_and_links/10_displaced_workers_lalonde.pdf