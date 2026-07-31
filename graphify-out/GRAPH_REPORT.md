# Graph Report - career-kb  (2026-07-31)

## Corpus Check
- 138 files · ~439,626 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1298 nodes · 1842 edges · 85 communities (80 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `41117a1b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- BaselineAssessment.tsx
- index.ts
- Cockpit.tsx
- react
- DashboardPage.tsx
- compilerOptions
- package.json
- devDependencies
- cockpitData.ts
- compilerOptions
- public/auth.js
- auth.js
- TrajectoryChart.tsx
- plugins
- public/supabase-config.js
- tsconfig.json
- vercel.json
- supabase-config.js
- serve.sh
- Part 3: The Longitudinal Insight Tool (Product Direction)
- Atlas — Production Foundation Proposal
- glossary.ts
- CareerDirectionPage.tsx
- TIER 1: Best Candidates — openESM Database
- Networking Methodologies for Network-Averse Senior Professionals
- sigil.ts
- Per-source detail
- Profile Set (12 profiles)
- JobListingsView.tsx
- index.ts
- Portuguese Creative/Content Operations Target Companies (Additional List)
- Senior Creative Operations Leaders — LinkedIn Certifications Research
- App.tsx
- Adjacent Skills — Courses & Certifications for Content Supply Chain / Creative Ops Repositioning
- 4. Startup opportunities
- What Rui GAINS joining a startup
- Atlas V1 — Plain-English product plan
- Channels to use (ranked by priority for Rui)
- ContactLogView.tsx
- 1. What the credible sources actually agree on
- react
- KnowledgeBaseView.tsx
- FirstChartTour.tsx
- Atlas — Career Assessment Round (scope-locked)
- Company watchlist
- Sectors with Strongest Demand for Senior Creative Operations Leadership
- Rui Silva — Career Knowledge Base
- Compensation Patterns — Cash + Equity for Creative Ops Leadership
- RUI SILVA
- Atlas KB — UX Pattern Research (2026 best practice)
- Gaps to fix
- Research Summary: Chalhoub Group — Opportunity Analysis for Rui Silva
- AGENTS.md
- EmptyState.tsx
- ProfilePage.tsx
- Strengths & development areas — UNIFIED PROFILE
- Courses & certifications for Content Supply Chain repositioning
- DistributionView.tsx
- Rui Silva Studio — knowledge base
- Target Startups — Part 2: Marketplaces, D2C, Content Platforms
- useJobListings.ts
- RadarChart.tsx
- Target Startups — Part 1: AI-Content & Generative Video
- Titles Startups Use for Creative/Content Operations Leadership
- Portuguese Executive Search & Recruitment — Creative Ops / Studio / COO targets
- Detailed Notes
- Target roles — where Rui fits tight
- How to use this asset
- LinkedIn revisions — copy-paste ready
- PRIVATE COACHING NOTE — not for interviews, not for sharing
- Card.tsx
- Narrative variants
- Founder Outreach Templates for Rui
- Research for Rui Silva (ex-SVP Creative Operations, FARFETCH)
- Stage Fit — Which Startup Stages Need a Senior Creative Ops Leader
- Atlas — Current recommended discovery flow
- Search log
- Leadership assessments — extraction guide
- React + TypeScript + Vite
- tsconfig.json
- 17-writing-standards.md

## God Nodes (most connected - your core abstractions)
1. `react` - 49 edges
2. `useAuth()` - 32 edges
3. `useGSAP()` - 27 edges
4. `main()` - 21 edges
5. `Per-source detail` - 20 edges
6. `compilerOptions` - 18 edges
7. `BigFiveScores` - 15 edges
8. `compilerOptions` - 15 edges
9. `useDashboardState()` - 13 edges
10. `Profile Set (12 profiles)` - 13 edges

## Surprising Connections (you probably didn't know these)
- `ProtectedLayout()` --calls--> `useAuth()`  [EXTRACTED]
  atlas/src/App.tsx → atlas/src/hooks/useAuth.ts
- `Nav()` --calls--> `useAuth()`  [EXTRACTED]
  atlas/src/components/Nav.tsx → atlas/src/hooks/useAuth.ts
- `BaselineAssessment()` --calls--> `useAuth()`  [EXTRACTED]
  atlas/src/components/baseline/BaselineAssessment.tsx → atlas/src/hooks/useAuth.ts
- `BaselineAssessment()` --calls--> `useGSAP()`  [EXTRACTED]
  atlas/src/components/baseline/BaselineAssessment.tsx → atlas/src/lib/motion.ts
- `Cockpit()` --calls--> `useCockpit()`  [EXTRACTED]
  atlas/src/components/cockpit/Cockpit.tsx → atlas/src/hooks/useCockpit.ts

## Import Cycles
- None detected.

## Communities (85 total, 5 thin omitted)

### Community 0 - "BaselineAssessment.tsx"
Cohesion: 0.07
Nodes (29): BaselineAssessment(), BaselineAssessmentProps, btnGhostStyle, btnPrimaryStyle, LIKERT_SCALE, Phase, SD3_SCALE, TRAIT_DESCRIPTIONS (+21 more)

### Community 1 - "index.ts"
Cohesion: 0.15
Nodes (14): ICARScore(), ICARScoreProps, SD3Bars(), SD3BarsProps, TRAIT_LABELS, generateInsight(), TRAIT_LABELS, TrajectoryView() (+6 more)

### Community 2 - "Cockpit.tsx"
Cohesion: 0.09
Nodes (19): Cockpit(), COCKPIT_TABS, CockpitTab, ghostBtnStyle, GoalsEditor(), inputStyle, labelStyle, MESSAGE_TEMPLATES (+11 more)

### Community 3 - "react"
Cohesion: 0.11
Nodes (16): TABS, ViewTabs(), ChapterRail(), ChapterRailProps, RailSection, CopyButton(), CopyButtonProps, DemoViews() (+8 more)

### Community 4 - "DashboardPage.tsx"
Cohesion: 0.18
Nodes (17): ContextHeatmap(), ContextView(), ContextViewProps, DiamondsGrid(), StressDeltaChart(), TRAIT_CONFIG, VarianceChart(), DistributionViewProps (+9 more)

### Community 5 - "compilerOptions"
Cohesion: 0.08
Nodes (23): ES2023, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module (+15 more)

### Community 6 - "package.json"
Cohesion: 0.04
Nodes (45): dependencies, d3, gsap, @gsap/react, react, react-dom, react-router-dom, @supabase/supabase-js (+37 more)

### Community 7 - "devDependencies"
Cohesion: 0.10
Nodes (43): adzuna_search(), load_env(), main(), normalize(), score_job(), canonical_url(), db_connect(), dedupe_best() (+35 more)

### Community 8 - "cockpitData.ts"
Cohesion: 0.17
Nodes (17): AI_NAMES, COMPANIES, Company, companyGroup, FASHION_RETAIL_NAMES, FILTER_GROUPS, INACTIVE_STATUSES, INTERNATIONAL_NAMES (+9 more)

### Community 9 - "compilerOptions"
Cohesion: 0.10
Nodes (19): ES2023, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit (+11 more)

### Community 10 - "public/auth.js"
Cohesion: 0.28
Nodes (12): addLogoutLink(), buildOverlay(), doSignIn(), doSignUp(), hideLoading(), hideOverlay(), injectCSS(), _notifyAuthed() (+4 more)

### Community 11 - "auth.js"
Cohesion: 0.28
Nodes (12): addLogoutLink(), buildOverlay(), doSignIn(), doSignUp(), hideLoading(), hideOverlay(), injectCSS(), _notifyAuthed() (+4 more)

### Community 12 - "TrajectoryChart.tsx"
Cohesion: 0.20
Nodes (12): cssVar(), DEMO_PHASES, derivePhases(), EmotionMeta, EMOTIONS, fireChartInteractedOnce(), MARGIN, Phase (+4 more)

### Community 13 - "plugins"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 15 - "tsconfig.json"
Cohesion: 0.05
Nodes (39): 10. Sword Health, 11. Defined.ai, 12. Coverflex, 13. Prozis, 14. Salsa Jeans (Sonae Group), 15. Parfois, 16. SmartBuyGlasses, 17. Fashion Clinic (Amorim Luxury Group) (+31 more)

### Community 16 - "vercel.json"
Cohesion: 0.50
Nodes (3): buildCommand, outputDirectory, rewrites

### Community 21 - "Part 3: The Longitudinal Insight Tool (Product Direction)"
Cohesion: 0.05
Nodes (38): 1. Hogan Assessments, 1. Whole Trait Theory (Fleeson, 2001 — cited 1,000+ times), 2. Korn Ferry (Assess / Leadership Architect), 2. Personality Changes Meaningfully Over the Lifespan, 3. Context Shapes Trait Expression — "Contextualized Personality", 3. SHL (OPQ + Cognitive + Behavioral), 4. DDI (Development Dimensions International), 4. Experience Sampling Method (ESM) / Ecological Momentary Assessment (EMA) (+30 more)

### Community 22 - "Atlas — Production Foundation Proposal"
Cohesion: 0.05
Nodes (36): 1. The decision, 2. What ships first, 3. Work-preferences foundation: native, reflective, and editable, 4. Role and skill reference foundation: EU first, 5. Portugal/EU market and AI-task-change evidence, 6. Privacy, control, and explanation, 7. Non-negotiable operating rules, 8. Decisions needed before implementation starts (+28 more)

### Community 23 - "glossary.ts"
Cohesion: 0.06
Nodes (30): HelpMenu(), MenuItem, a_facets, agreeableness, c_facets, conscientiousness, context_heatmap, diamonds (+22 more)

### Community 24 - "CareerDirectionPage.tsx"
Cohesion: 0.11
Nodes (22): useCareerDirection(), advanceStage(), CAREER_STAGES, CareerDirection, CareerDirectionData, CareerStage, createEmptyCareerDirection(), directionCountForComparison() (+14 more)

### Community 25 - "TIER 1: Best Candidates — openESM Database"
Cohesion: 0.07
Nodes (29): 10. LISS Panel (Netherlands), 11. SOEP (German Socio-Economic Panel), 12. HRS (Health and Retirement Study, USA), 13. HILDA (Household, Income and Labour Dynamics in Australia), 14. MIDUS (Midlife in the United States), 15. SAPA Project, 16. OpenPsychometrics.org Raw Data, 17. ESM Item Repository (+21 more)

### Community 26 - "Networking Methodologies for Network-Averse Senior Professionals"
Cohesion: 0.07
Nodes (27): 1. The Academic Foundation: What the Evidence Actually Says, 1a. Mark Granovetter — "The Strength of Weak Ties" (1973, Stanford), 1b. Daniel Z. Levin — "Dormant Ties: The Value of Reconnecting" (2011, Organization Science), 1c. Adam Grant — "Give and Take" (2013, Wharton), 1d. Daniel McFarland — Social Network Formation (Stanford GSE), 2. What the Data Says About Senior Executive Job Search, 3. Five Candidate Methodologies, 4. Network Mapping for a 600+ Contact Dormant Network (+19 more)

### Community 27 - "sigil.ts"
Cohesion: 0.14
Nodes (25): cssVar(), Sigil(), SigilProps, buildSigil(), clamp01(), dominantTraitIndex(), facetAt(), hashNumbers() (+17 more)

### Community 28 - "Per-source detail"
Cohesion: 0.08
Nodes (24): 4dayweek.io — SKIP, behance.net/joblist — MARGINAL, Crypto/web3 boards — SKIP, dribbble.com/jobs — MARGINAL, dynamitejobs.com — MARGINAL, Global / Remote Job Sources — Creative Ops, Production & Ops Leadership, himalayas.app — GOOD, ifyoucouldjobs.com — MARGINAL (+16 more)

### Community 29 - "Profile Set (12 profiles)"
Cohesion: 0.08
Nodes (24): 10. Jesse Sinkiewicz — Airbnb → Apple  ⭐ COMP, 11. Bianca Medina Cundari — adidas, 12. Emily Goldmann — Amazon, 1. Jo Ennever — NET-A-PORTER → Charlotte Tilbury → Graff, 1. Move all hard numbers OUT of the About section; replace with a narrative opening., 2. Add a short positioning tagline to the headline., 2. Camille Gilbert-Trepanier — SSENSE, 3. Keep the headline metric-free — Rui's instinct was correct. (+16 more)

### Community 30 - "JobListingsView.tsx"
Cohesion: 0.13
Nodes (20): actionBtnStyle, addedLabel(), daysSince(), deleteBtnStyle, ghostBtnStyle, inputStyle, isRecentlyAdded(), JobCard() (+12 more)

### Community 31 - "index.ts"
Cohesion: 0.18
Nodes (17): Nav(), NAV_LINKS, useAssessments(), useDemoData(), Theme, useTheme(), sigilInputFromData(), DashboardPage() (+9 more)

### Community 32 - "Portuguese Creative/Content Operations Target Companies (Additional List)"
Cohesion: 0.09
Nodes (22): 10. Media Capital (TVI), 11. RTP (Rádio e Televisão de Portugal), 12. LightHouse Publishing (Vogue Portugal, GQ Portugal), 13. Dentsu Creative Portugal, 14. BBDO Portugal, 15. Vista Alegre Atlantis, 1. Prozis, 2. Sonae MC (Continente, Note, Bagga) (+14 more)

### Community 33 - "Senior Creative Operations Leaders — LinkedIn Certifications Research"
Cohesion: 0.10
Nodes (20): A. VP/SVP-Level Creative Operations Leaders (Closest Seniority Match to Rui), B. Director / Head-Level Creative Operations Leaders, C. Profiles Where Certifications ARE Prominently Displayed, Differentiators (Rare and Valued), FINAL RECOMMENDATIONS FOR RUI, Frequency Table (sorted by frequency across all profiles examined, ~40+), Methodology Notes & Limitations, Overall Assessment (+12 more)

### Community 34 - "App.tsx"
Cohesion: 0.20
Nodes (14): ProtectedLayout(), AuthGate(), CmdItem, CommandPalette(), DOC_ANCHORS, navigateWithHash(), scrollToHash(), AuthUser (+6 more)

### Community 35 - "Adjacent Skills — Courses & Certifications for Content Supply Chain / Creative Ops Repositioning"
Cohesion: 0.10
Nodes (19): 1. Digital Asset Management (DAM), 2. Content Operations / Content Strategy at Scale, 3. AI for Content Production / AI-Driven Content Workflows, 4. Localization / Global Content Operations, 5. Lean / Six Sigma for Creative & Service Operations, Adjacent Skills — Courses & Certifications for Content Supply Chain / Creative Ops Repositioning, Free, Free / Low-Cost (+11 more)

### Community 36 - "4. Startup opportunities"
Cohesion: 0.11
Nodes (18): 15 target startups, 1. Cross-industry transferability — your skills map wider than "Creative Operations", 2. LinkedIn peer comparison — 12 senior profiles, 3. Market reality — 2025-2026 senior hiring trends, 4. Startup opportunities, 8-week action plan, Comp (Europe, Series B, your seniority), How to find these roles (most NOT on LinkedIn) (+10 more)

### Community 37 - "What Rui GAINS joining a startup"
Cohesion: 0.11
Nodes (18): 1. Cash haircut (real and immediate), 1. Equity upside (the primary reason), 2. Job security, 2. Scope and ownership, 3. Speed and impact, 3. Structure and resources, 4. AI-native operating model, 4. Benefits and stability (+10 more)

### Community 38 - "Atlas V1 — Plain-English product plan"
Cohesion: 0.11
Nodes (17): 1. Builds a career picture, 2. Makes work preferences explicit, 3. Chooses directions worth attention, 4. Compares a few directions honestly, 5. Opens one direction as a working brief, 6. Runs a short evidence cycle, 7. Reviews market evidence only when it matters, 8. Reassesses without pretending the past disappeared (+9 more)

### Community 39 - "Channels to use (ranked by priority for Rui)"
Cohesion: 0.12
Nodes (16): 1. Direct founder outreach (HIGHEST YIELD), 2. VC talent partners / portfolio talent teams, 3. Company career pages (on ATS platforms, not LinkedIn), 4. Niche startup job boards, 5. LinkedIn — but used strategically, not passively, 6. Executive search / retained recruiters, 7. Warm network reactivation, 8. Sifted Leaderboards as a prospecting tool (+8 more)

### Community 40 - "ContactLogView.tsx"
Cohesion: 0.18
Nodes (11): CHANNELS, ContactLogView(), inputStyle, labelStyle, smallAddBtn, smallGhostBtn, smallSaveBtn, useContactLog() (+3 more)

### Community 41 - "1. What the credible sources actually agree on"
Cohesion: 0.12
Nodes (15): 1.1 Net effect on jobs: small-positive, but mostly in the rear-view mirror, 1.2 What gets automated vs. augmented, 1.3 The Brynjolfsson productivity evidence is *too clean to ignore*, 1.4 Real-world labor signal (now, not 2030), 1.5 The timeline is short — but not "in six months everything is different", 1. What the credible sources actually agree on, 2. The disagreement zone (so we don't oversell certainty), 3.1 The "career path insight" feature is really four sub-features (+7 more)

### Community 42 - "react"
Cohesion: 0.23
Nodes (5): PulseReminder(), PulseReminderState, usePulseReminder(), supabase, react

### Community 43 - "KnowledgeBaseView.tsx"
Cohesion: 0.15
Nodes (10): bodyText, decisionStyle, faintNote, KB_SECTIONS, KBSection, pillStyle, cvBody, cvRole (+2 more)

### Community 44 - "FirstChartTour.tsx"
Cohesion: 0.22
Nodes (12): arrowPos(), clamp(), Coachmark(), CoachmarkPlacement, CoachmarkProps, pickAutoPlacement(), Position, FirstChartTour() (+4 more)

### Community 45 - "Atlas — Career Assessment Round (scope-locked)"
Cohesion: 0.14
Nodes (13): 1. Top nav rename: `Baseline` → `Assessments`, 2. Page becomes a tab container, 3. Career assessment tab — what it does, 4. O\*NET tab — what it is, what it isn't, 5. Docs page — what gets added, Atlas — Career Assessment Round (scope-locked), Open questions (your call), The plan — what changes, in plain English (+5 more)

### Community 46 - "Company watchlist"
Cohesion: 0.14
Nodes (13): AI-content / generative video (your strongest fit), Automated weekly check (cron job), Company watchlist, Founder outreach tracker (separate from watchlist), How to use this watchlist, Larger tech / consumer brands with creative orgs, Manual touch (when you have time), Marketplaces with active creative ops hiring (+5 more)

### Community 47 - "Sectors with Strongest Demand for Senior Creative Operations Leadership"
Cohesion: 0.14
Nodes (13): 1. AI-content / generative video / AI creative startups, 2. Creator economy platforms, 3. D2C brands scaling content engine, 4. E-commerce infrastructure / marketplace startups, 5. Healthtech with patient content needs, 6. Edtech with curriculum/content production, 7. Fintech with content needs, 8. Climate tech / deeptech (+5 more)

### Community 48 - "Rui Silva — Career Knowledge Base"
Cohesion: 0.15
Nodes (12): 0. Situation (read first), 10. Files in this KB, 1. Target, 2. Contact, 3. Career arc (chronological), 4. Quantified achievements (the hiring ammunition), 5. Core competencies (verified), 6. Education & certifications (+4 more)

### Community 49 - "Compensation Patterns — Cash + Equity for Creative Ops Leadership"
Cohesion: 0.15
Nodes (12): Carta H1 2025 macro trends (critical context), Compensation Patterns — Cash + Equity for Creative Ops Leadership, Europe (Euro/GBP), Europe vs US comparison for Rui, European Head of Operations (TopStartups.io, 2023-2025), Key takeaways for Rui, Realistic Europe bands for Rui (senior, SVP-level), Sifted COO survey (81 COOs, mostly UK, seed→Series B+) (+4 more)

### Community 50 - "RUI SILVA"
Cohesion: 0.17
Nodes (11): AWARDS, CORE COMPETENCIES, Earlier Experience, EDUCATION & CERTIFICATIONS, EXECUTIVE SUMMARY, FARFETCH | 2009 – February 2024 (15 years 2 months), LANGUAGES, PROFESSIONAL EXPERIENCE (+3 more)

### Community 51 - "Atlas KB — UX Pattern Research (2026 best practice)"
Cohesion: 0.17
Nodes (11): Atlas KB — UX Pattern Research (2026 best practice), Context the user is the system, Decisions for you, Pattern A — "The Notion-flavoured workspace" (blocks / pages / databases), Pattern B — "The LinkedIn-style profile with a strength meter", Pattern C — "The wizard / staged onboarding" (one section at a time), Pattern D — "Guided blocks with progressive disclosure" (hybrid), Sources (+3 more)

### Community 52 - "Gaps to fix"
Cohesion: 0.17
Nodes (11): 1. The 16-month employment gap (Feb 2024 → now), 2. No clear target title / headline mismatch, 3. Team leadership detail is thin, 4. "Self-made executive" framing, 5. No scope/geo clarity, 6. Studio section is too long relative to FARFETCH, 7. Missing: scope of "Creative Operations" at FARFETCH, Gaps to fix (+3 more)

### Community 53 - "Research Summary: Chalhoub Group — Opportunity Analysis for Rui Silva"
Cohesion: 0.17
Nodes (11): 1. Company Profile — Chalhoub Group, 2. Brand Portfolio & Partnerships, 3. Portugal Operations, 4. Threads Styling "New Chapter" — What's Happening, 5. Current Hiring — Senior Creative Ops / Content / Brand Roles, 6. How to Apply, 7. Key Leadership — Who Rui Might Know, 8. Digital/Content Strategy — Building In-House Creative (+3 more)

### Community 54 - "AGENTS.md"
Cohesion: 0.18
Nodes (10): Deployment, Directory Routing Map, Editable copy convention, graphify, Guardrails & Safety Rules, Lessons learned \(read first\), Planning Mode, Project Boundary (+2 more)

### Community 55 - "EmptyState.tsx"
Cohesion: 0.20
Nodes (6): EmptyState(), EmptyStateProps, inferMode(), Mode, MODE_ACCENT, MODE_BADGE

### Community 56 - "ProfilePage.tsx"
Cohesion: 0.20
Nodes (10): EMPTY_SIGIL_INPUT, cardStyle, inputStyle, labelStyle, msgStyle(), primaryBtnStyle, ProfilePage(), sectionDescStyle (+2 more)

### Community 57 - "Strengths & development areas — UNIFIED PROFILE"
Cohesion: 0.18
Nodes (10): 1. CliftonStrengths 34 (Gallup, Nov 2021), 2. DiSC Classic 2.0, 3. Leadership Circle Profile (360°, Jun 2021), 4. Convergent analysis — where all 3 agree, 5. Confirmed strengths (with evidence) → CV / outreach language, 6. Development areas (honest, for interviews) → pre-empted, 7. Interview calibration (how to show up), 8. What the assessments DON'T cover (still unknown) (+2 more)

### Community 58 - "Courses & certifications for Content Supply Chain repositioning"
Cohesion: 0.18
Nodes (10): Courses & certifications for Content Supply Chain repositioning, ⚠️ Key finding: my original recommendations were wrong for your seniority, Priority 1 — High-prestige executive credentials (matches your peer set), Priority 2 — Operations-specific credentials, Priority 3 — If you want a premium differentiator, The honest takeaway, What actually appears on senior creative-ops LinkedIn profiles (ranked by frequency), What NOT to display on LinkedIn (if you complete them for learning) (+2 more)

### Community 59 - "DistributionView.tsx"
Cohesion: 0.31
Nodes (8): TrajectoryChartProps, buildHistogram(), DensityChart(), DistributionView(), estimateDensity(), TRAIT_CONFIG, buildTrajectory(), TrajectoryPoint

### Community 60 - "Rui Silva Studio — knowledge base"
Cohesion: 0.20
Nodes (9): How to talk about it (the right framing), In interviews (the honest, framing-aware answer), In the CV / LinkedIn (short, side-venture framing), Key phrases from the studio site (reusable language), Rui Silva Studio — knowledge base, The origin story (in Rui's words, from the site), What it proves about Rui (for the job search), What NOT to say (the traps) (+1 more)

### Community 61 - "Target Startups — Part 2: Marketplaces, D2C, Content Platforms"
Cohesion: 0.20
Nodes (9): 10. Back Market (Paris) — refurbished electronics marketplace, 11. Upway (Paris) — Sifted 250 #112, 12. Heuritech (Paris) — AI fashion trend forecasting, 13. Yazen (Malmö) — Sifted 250 #2, 14. Holafy (Sifted 250) — travel/content, 15. Tl;dv (Cologne) — Sifted 250 #3, 8. Vinted (Berlin/Vilnius) — secondhand fashion marketplace, 9. Wallapop (Barcelona) — marketplace (+1 more)

### Community 62 - "useJobListings.ts"
Cohesion: 0.33
Nodes (7): Props, JobUpdate, NewJob, CockpitContact, JobListing, JobStatus, PipelineStatus

### Community 63 - "RadarChart.tsx"
Cohesion: 0.31
Nodes (8): cssVar(), GRID_LEVELS, RadarChart(), RadarChartProps, TraitMeta, TRAITS, TraitMeta, BigFiveScores

### Community 64 - "Target Startups — Part 1: AI-Content & Generative Video"
Cohesion: 0.22
Nodes (8): 1. Synthesia (London, remote Europe) — CONFIRMED HIRING, 2. HeyGen (US/remote) — AI video, direct competitor to Synthesia, 3. Colossyan (London) — Sifted 250 #65, 4. Bambuser (Stockholm) — live video commerce, 5. LaLaLand (Amsterdam) — AI virtual models, 6. The Fabricant (Amsterdam) — digital fashion house, 7. Bigthinx (Milan) — AI fashion tech, Target Startups — Part 1: AI-Content & Generative Video

### Community 65 - "Titles Startups Use for Creative/Content Operations Leadership"
Cohesion: 0.22
Nodes (8): 1. General operations leadership (most common at early-mid stage), 2. Creative/content-specific operations (best fit for Rui's niche), 3. Adjacent titles worth searching, Search terms for job boards, Title categories, Title red flags, Titles Startups Use for Creative/Content Operations Leadership, What Rui should target

### Community 66 - "Portuguese Executive Search & Recruitment — Creative Ops / Studio / COO targets"
Cohesion: 0.25
Nodes (7): Adjacent — global but relevant specialisms, Best fit — Portugal-based, creative/retail/ops focus, Notes, Outreach — LinkedIn invite to Pedro Borges Caroço (SENT 2026-07-28), Portuguese Executive Search & Recruitment — Creative Ops / Studio / COO targets, Public job offerings (see live research below), Strong fit — top-tier, with a Consumer/Retail practice

### Community 67 - "Detailed Notes"
Cohesion: 0.25
Nodes (7): Detailed Notes, EU & Portuguese Job Sources — Discovery Audit (2026-07-25), GOOD, MARGINAL, Recommended wiring order (new sources), SKIP, Summary Table

### Community 68 - "Target roles — where Rui fits tight"
Cohesion: 0.25
Nodes (7): A. Primary job titles to search (highest fit), B. Adjacent titles (strong fit, wider pool), C. Industry archetypes (in order of fit), D. Geographic filter, E. Search terms (LinkedIn / job boards), F. Red flags — roles to skip (waste of time), Target roles — where Rui fits tight

### Community 69 - "How to use this asset"
Cohesion: 0.25
Nodes (7): 1. Henry Stewart DAM Conference — Creative Ops Interview (2018), How to use this asset, In interviews, In outreach, On LinkedIn, Public speaking & conference talks, TODO — find more

### Community 70 - "LinkedIn revisions — copy-paste ready"
Cohesion: 0.25
Nodes (7): About section, Experience section — FARFETCH (replace existing), Experience section — Rui Silva Studio (replace existing), Headline, LinkedIn revisions — copy-paste ready, Open to work settings, Skills section (update to match target)

### Community 71 - "PRIVATE COACHING NOTE — not for interviews, not for sharing"
Cohesion: 0.25
Nodes (7): PRIVATE COACHING NOTE — not for interviews, not for sharing, The dual truth, The interview rule, The moral injury, The real story behind the departure, What the coach should watch for, What this means for the job search

### Community 72 - "Card.tsx"
Cohesion: 0.38
Nodes (5): Card(), CardProps, InfoTooltip(), InfoTooltipProps, lookupGlossary()

### Community 73 - "Narrative variants"
Cohesion: 0.29
Nodes (6): 15-second (LinkedIn about, cold outreach opener), 30-second (recruiter call, networking intro), Cover letter / outreach paragraph (the gap, framed), Interview answer: "Tell me about yourself", Interview answer: "Why did you leave Farfetch / what have you been doing?", Narrative variants

### Community 74 - "Founder Outreach Templates for Rui"
Cohesion: 0.29
Nodes (6): Founder Outreach Templates for Rui, Template 1: AI-content/video startup (Synthesia, HeyGen, Colossyan), Template 2: D2C/fashion-tech startup (LaLaLand, The Fabricant, Heuritech, Bigthinx), Template 3: Marketplace/e-commerce startup (Vinted, Back Market, Wallapop), Template 4: Short LinkedIn connection note (max 300 chars), Tips for outreach

### Community 75 - "Research for Rui Silva (ex-SVP Creative Operations, FARFETCH)"
Cohesion: 0.29
Nodes (6): Files in this research, Key findings summary, Profile fit, Research for Rui Silva (ex-SVP Creative Operations, FARFETCH), Sources, Startup Opportunities for Senior Creative Operations Leader

### Community 76 - "Stage Fit — Which Startup Stages Need a Senior Creative Ops Leader"
Cohesion: 0.29
Nodes (6): Growth / Series C+ (~$50M+ raised, 200-1000 employees), Seed stage (~$1-5M raised, 1-10 employees), Series A (~$5-15M raised, 10-50 employees), Series B (~$15-50M raised, 50-200 employees), Stage Fit — Which Startup Stages Need a Senior Creative Ops Leader, Stage ranking for Rui

### Community 77 - "Atlas — Current recommended discovery flow"
Cohesion: 0.33
Nodes (5): Atlas — Current recommended discovery flow, Current flow status, Older exploration screens, The user journey, What stays separate across every screen

### Community 78 - "Search log"
Cohesion: 0.33
Nodes (5): Applications, Outreach (LinkedIn / email / referral), Responses / interviews, Search log, Status

### Community 79 - "Leadership assessments — extraction guide"
Cohesion: 0.33
Nodes (5): 1. Leadership Circle Profile (LCP), 2. DiSC Classic 2.0, 3. CliftonStrengths (formerly StrengthsFinder), Extraction plan when photos arrive, Leadership assessments — extraction guide

### Community 80 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + TypeScript + Vite

## Knowledge Gaps
- **709 isolated node(s):** `$schema`, `typescript`, `oxc`, `react/rules-of-hooks`, `warn` (+704 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `BaselineAssessment.tsx`, `index.ts`, `Cockpit.tsx`, `react`, `DashboardPage.tsx`, `cockpitData.ts`, `TrajectoryChart.tsx`, `plugins`, `glossary.ts`, `CareerDirectionPage.tsx`, `sigil.ts`, `JobListingsView.tsx`, `index.ts`, `App.tsx`, `ContactLogView.tsx`, `KnowledgeBaseView.tsx`, `FirstChartTour.tsx`, `EmptyState.tsx`, `ProfilePage.tsx`, `DistributionView.tsx`, `useJobListings.ts`, `RadarChart.tsx`, `Card.tsx`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `App.tsx` to `BaselineAssessment.tsx`, `Cockpit.tsx`, `ContactLogView.tsx`, `react`, `CareerDirectionPage.tsx`, `ProfilePage.tsx`, `useJobListings.ts`, `index.ts`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Why does `useGSAP()` connect `DashboardPage.tsx` to `BaselineAssessment.tsx`, `index.ts`, `sigil.ts`, `TrajectoryChart.tsx`, `DistributionView.tsx`, `RadarChart.tsx`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `main()` (e.g. with `fetch_himalayas()` and `fetch_net_empregos()`) actually correct?**
  _`main()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `typescript`, `oxc` to the rest of the system?**
  _709 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `BaselineAssessment.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07112375533428165 - nodes in this community are weakly interconnected._
- **Should `Cockpit.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08547008547008547 - nodes in this community are weakly interconnected._