# Professional Assessment Tools: Landscape, Open-Source & Longitudinal Insight Tool

**Date:** July 22, 2026
**Status:** Research complete. Product direction emerging.
**Author:** Rui Silva (with Hermes career coach)

---

## Part 1: Commercial Assessment Tool Landscape (Executive/Senior Roles)

### Tier 1: Proven for Executive Selection & Succession

#### 1. Hogan Assessments
- **What it measures:** Bright-side personality (HPI), dark-side derailers under stress (HDS), values/motivators (MVPI)
- **Adoption:** 75% of Fortune 500. Validated in 50+ Fortune 500 companies across 30+ criterion-related validation studies
- **Validity coefficients:** 0.3–0.5 (standard for well-designed personality instruments)
- **Cost:**
  - Full suite (HPI + HDS + MVVI): $600–$900/candidate
  - Individual instruments: $200–$400 each
  - Volume enterprise licensing: under $200/assessment (significant annual commitment)
  - Executive coach debrief: +$200–$500
  - Full executive assessment process (Hogan + 360 + assessment center): $2,000–$5,000/candidate
- **Integration:** B2B only — sold through certified distributors/consultants. No direct native ATS API. Integration via consulting partner or middleware only.
- **Bottom line:** Strongest predictive validity for senior selection. Lack of native ATS integration is a real operational gap.

#### 2. Korn Ferry (Assess / Leadership Architect)
- **What it measures:** Competency-based assessment combining psychometrics, structured behavioral interviews, role simulations, and the Korn Ferry Leadership Architect framework (38 competencies, 4 leadership levels)
- **Adoption:** One of the most widely used enterprise competency frameworks
- **Cost:** Not publicly published. Quote-only. Executive search engagements run $95,000–$150,000+. Assessment-only is a fraction but still enterprise-priced (five-figure annual commitments)
- **Integration:** ✅ Native Workday marketplace app (Korn Ferry Assess). Also integrates with SAP SuccessFactors
- **Bottom line:** Best for large enterprises on Workday/SuccessFactors. Expensive but strong integration story.

#### 3. SHL (OPQ + Cognitive + Behavioral)
- **What it measures:** Occupational Personality Questionnaire (OPQ) — 32 personality traits across 3 domains. Combined with cognitive ability and behavioral/situational judgment tests
- **Adoption:** Massive global norm groups, localized delivery. Heavy in Europe and multinationals
- **Cost:** Not published — enterprise contracts only. Similar range to Hogan per-assessment, volume licensing brings per-seat costs down
- **Integration:** ✅ Strongest ATS integration of Tier 1 tools. Native: Workday, SAP SuccessFactors, Greenhouse, most major ATS via API
- **Bottom line:** Best balance of proven validity + operational integrability for productized B2B offering.

#### 4. DDI (Development Dimensions International)
- **What it measures:** Immersive assessment centers — role simulations, strategy presentations, crisis decision-making, stakeholder alignment. Measures demonstrated behavior, not just self-report
- **Adoption:** Enterprise staple for succession planning and executive assessment
- **Cost:** Quote-only. Assessment centers inherently expensive (facilitator time, simulation design, multi-day). $2,000–$5,000+ per candidate
- **Integration:** Limited — consulting service, not a platform. Results delivered as reports, not API-fed data
- **Bottom line:** Highest-fidelity for executive selection, but operationally heavy and not productizable.

#### 5. Heidrick & Struggles (Heidrick Consulting)
- **What it measures:** Adaptive leadership assessment — learning agility, strategic capability, culture fit
- **Cost:** Quote-only. Premium enterprise consulting engagement
- **Integration:** None — consulting service, not a platform

### Tier 2: Solid for Mid-to-Senior, Lighter for C-Suite

#### 6. The Predictive Index (PI)
- **What it measures:** Behavioral pattern (PI Behavioral Assessment) + cognitive ability (PI Cognitive Assessment). 4-factor behavioral model (simpler than Hogan)
- **Adoption:** Strong mid-market. Unlimited users/assessments on subscription
- **Cost:**
  - PI Hire: ~$7,550/year
  - PI Essentials: ~$8,500/year (unlimited users + assessments)
  - Mid-market (PI Inspire/Design): $15,000–$45,000/year
  - Entry as low as $4,950/year
- **Integration:** ✅ Open API + native Greenhouse, Workday, most major ATS/HCMS
- **Bottom line:** Best price-to-integration ratio. Shallower than Hogan — defensible for Director/Sr Dir, less for C-suite.

#### 7. Criteria Corp
- **What it measures:** Personality (16PF-based), cognitive ability, mechanical/interpersonal skills
- **Cost:** $1–$50/assessment, or $69–$83/month basic. Enterprise custom
- **Integration:** ✅ API-driven, wide ATS integrations
- **Bottom line:** Good for high-volume mid-level. Under-spec'd for executive assessment.

### ⚠️ Popular But Not Defensible for Senior Selection

| Tool | Issue |
|---|---|
| DISC | Negligible predictive validity for leadership. Easily gamed. Workshop only |
| MBTI | Weak test-retest reliability, arbitrary type boundaries, no predictive validity |
| CliftonStrengths | Development-only by design (Gallup's position). Does not surface risks |

### Integration Summary

| Tool | Workday | SAP SF | Greenhouse | Open API | Self-Serve |
|---|---|---|---|---|---|
| Hogan | ❌ (via partner) | ❌ (via partner) | ❌ | ❌ | ❌ |
| Korn Ferry | ✅ Native | ✅ | ❌ | Partial | ❌ |
| SHL | ✅ Native | ✅ | ✅ | ✅ | ✅ |
| DDI | ❌ | ❌ | ❌ | ❌ | ❌ |
| Predictive Index | ✅ | ✅ | ✅ | ✅ | ✅ |
| Criteria | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Part 2: Open-Source Alternatives

### Public-Domain Item Banks

#### IPIP (International Personality Item Pool)
- **What:** 3,300+ personality items, 250+ validated scales, maintained by Oregon Research Institute since 2001
- **License:** Public domain. No permission, no fee, commercial use allowed
- **What you can build:**
  - Big Five / IPIP-NEO (300-item or 120-item) — open-source equivalent of NEO-PI-R ($100+/administration commercially)
  - Hogan-equivalent bright-side personality scales
  - Values/motivators (partial proxy for Hogan MVPI)
  - Dark-side / derailers (partial proxy for Hogan HDS)
  - 250+ single-construct scales
- **Validity:** Peer-reviewed, α = 0.88 internal consistency. Hundreds of published validation papers
- **Website:** ipip.ori.org — scoring instructions, normative data, interpretation guides, programming tools

#### ICAR (International Cognitive Ability Resource)
- **What:** Public-domain cognitive ability items across 19 subdomains — matrix reasoning, letter/number series, verbal reasoning, 3D rotation
- **License:** Public domain, commercial use allowed
- **What it does:** Open-source equivalent of cognitive components in SHL, Korn Ferry, Wonderlic. Cognitive ability (g) is the single strongest predictor of job performance (validity ~0.5–0.6)
- **Validation:** Condon (2016), Dworak (2021) — cited 98+ times. ICAR16 (short form) and ICAR60 most used
- **Website:** icar-project.org

#### Short Dark Triad (SD3)
- **What:** 27-item assessment measuring Machiavellianism, Narcissism, Psychopathy — dark-side traits predicting derailment
- **License:** Public domain / open access
- **Why it matters:** Closest open-source proxy to Hogan's HDS. Covers 3 traits vs. Hogan's 11, but highest-impact derailers
- **Available at:** openpsychometrics.org/tests/SD3/

### Open-Source Delivery Platforms

#### bigfive-web (rubynor/bigfive-web)
- MIT-licensed web app for Big Five test. Built on IPIP-NEO items
- Repo: github.com/rubynor/bigfive-web
- Live demo: bigfive-test.com/test
- Forkable as starting point for assessment platform

#### TAO (Open Assessment Technologies)
- GPL v2 (Community Edition). Enterprise-grade e-testing platform
- Repo: github.com/tao-ce
- Item banking, test delivery, scoring, multi-tenancy, multilingual
- Caveat: GPL requires derivative works to be open-source

### What's Buildable vs. What Isn't

| Assessment Domain | Open Source | Commercial Equivalent | Gap |
|---|---|---|---|
| Personality (bright-side) | IPIP-NEO (120 or 300) | Hogan HPI, SHL OPQ, NEO-PI-R | Smaller |
| Cognitive ability | ICAR (16–60 items) | SHL, Wonderlic, Korn Ferry | Smaller |
| Dark-side / derailers | SD3 + IPIP dark-side scales | Hogan HDS | Moderate (3 vs 11 traits) |
| Values / motivators | IPIP values scales | Hogan MVPI | Moderate |
| Test delivery platform | TAO or bigfive-web | SHL/PI platform | Smaller for delivery; larger for analytics |
| Scoring & norms | IPIP norms, ICAR norms | Vendor proprietary norms | This is the gap |

### What You Can't Get For Free
1. **Validation against specific roles** — requires criterion-related validation study (6–12 months data collection)
2. **Executive-specific norm groups** — IPIP norms are general population
3. **Board-ready reporting** — raw scores need interpretation work
4. **Legal defensibility out of the box** — no validation study included

---

## Part 3: The Longitudinal Insight Tool (Product Direction)

### The Core Insight

Traditional assessment tools take a snapshot: assess once → get a score → that's "who you are." But personality is not a fixed point — it's a **density distribution of states over time**. A single assessment captures one point in the distribution. The longitudinal data — the *evolution* — is the actual signal that traditional tools throw away.

This tool would NOT be a predictive hiring tool. It would be a **longitudinal self-insight instrument** — living with the person, tracking who they're becoming over time and across contexts.

### The Science

#### 1. Whole Trait Theory (Fleeson, 2001 — cited 1,000+ times)
- A trait is not a point. It's a density distribution of states over time
- You're not "an extravert." You have a distribution of extraversion states — sometimes high, sometimes low — and the shape of that distribution (mean, width, skew) is the real personality signal
- Two people with the same mean score can have wildly different distributions
- Distribution parameters are highly stable week-to-week (r ≈ .8) — meaning your distribution shape is a stable individual difference, even as momentary states fluctuate
- States are assessed by reframing trait items: "Right now, I feel..." vs "In general, I am..." — same items, different time frame

#### 2. Personality Changes Meaningfully Over the Lifespan
- **Roberts, Walton & Viechtbauer (2006)** — meta-analysis of 92 longitudinal studies, cited 5,264 times:
  - 75% of personality traits show statistically significant mean-level change in middle age (40–60) and old age (60+)
  - Most change happens 20–40, but doesn't stop
  - Maturity principle: people become more agreeable, conscientious, emotionally stable over time, then decline in old age
- **Bleidorn et al. (2022)** — meta-analysis of 189 studies, N=178,503:
  - Rank-order stability plateaus after age 25 but never reaches unity — lifelong plasticity
  - 10-year test-retest: r = .4–.6. 40+ year: r = .02–.30
  - Emotional stability increases more substantially across lifespan than previously found

#### 3. Context Shapes Trait Expression — "Contextualized Personality"
- **Holtrop et al. (2025), Pletzer (2025):** Contextualized assessments ("how do you behave at work?") have higher predictive validity for work outcomes than decontextualized ("how do you behave in general?")
- Personality expression varies across contexts — work, home, social, stress
- The variance across contexts is itself a stable individual difference
- A person highly conscientious at work but not at home is a different profile from someone moderately conscientious everywhere

#### 4. Experience Sampling Method (ESM) / Ecological Momentary Assessment (EMA)
- Repeated short assessments — daily, weekly, or triggered by events — capturing personality states in real-time in real contexts
- Fleeson & Gallagher (2009): moment-to-moment personality state variability is large, meaningful, predictable
- Geukes et al. (2017 — cited 237 times): Big Five traits predict both the level and the variability of experience-sampled states
- Baird, Le & Lucas (2006): distribution parameters highly stable week-to-week (r ≈ .8)

### What the Tool Would Measure

| Dimension | What It Captures | Why It's Valuable |
|---|---|---|
| Mean level | Average trait score over time | Traditional snapshot — but tracked for drift |
| Variance (distribution width) | How much the person shifts across contexts/states | High variance = adaptive/flexible or unstable? Context tells you |
| Trajectory (slope) | Is the person trending up or down on a trait? | "Your emotional stability has increased 15% since starting this role" |
| Context sensitivity | How much trait expression changes by context | "You're highly conscientious at work, but not under stress — that gap has narrowed" |
| Inflection points | When did the trajectory change? | "Your openness dropped sharply after your layoff — and recovered 8 months later" |
| State-behavior links | What states predict what behaviors for this person | "When your extraversion state is high, your self-reported effectiveness is 30% higher" |

### Product Concept

1. **Baseline assessment** — full IPIP-NEO-120 + ICAR16 + SD3 (30 min, once)
2. **Weekly pulse** — 5–10 state items drawn from IPIP, 2 minutes. Tagged with context ("at work", "stressed", "post-meeting")
3. **Monthly deep pulse** — 30 items, 10 min. Tracks trait-level drift
4. **Event-triggered assessments** — major life event (job change, layoff, promotion) triggers full re-assessment
5. **Dashboard** — trait distributions, trajectories, context-sensitivity profile, inflection points over time
6. **Insights** — "Your conscientiousness has increased 12% since starting your new role. Your emotional stability dipped during the transition and is now 8% above your pre-transition baseline."

**Value proposition:** Not "this predicts whether you'll be hired." It's: "This shows you who you're becoming, and how your context is shaping you." Self-insight tool, not a selection tool. Different market, different buyer, different ethics.

### Building Blocks (All Open Source)

- **Items:** IPIP (ipip.ori.org), ICAR (icar-project.org), SD3 (openpsychometrics.org) — all public domain
- **Platform:** Fork bigfive-web (MIT license) — github.com/rubynor/bigfive-web
- **Scoring:** IPIP public scoring keys + published normative data
- **Change trajectories:** Roberts (2006) and Bleidorn (2022) meta-analyses provide population-level change trajectories by age — baseline for "is this change normal or anomalous?"
- **State assessment method:** Reframe IPIP trait items as state items (Fleeson's method). Same scoring keys, different time frame.

### Challenges

1. **Engagement.** ESM studies have 30–70% dropout rates. Getting people to do a 2-minute weekly pulse for months is a product design problem. Engagement will only happen if we have something to show and share. — *Rui's note*
2. **Interpretation.** Raw distribution data is meaningless to users. The insight layer — translating "your openness variance increased" into "you're exploring more possibilities, which correlates with creative output" — is where real product value lives. Requires a scoring/interpretation engine that doesn't exist in open source.
3. **Normative comparison.** "Your conscientiousness is 3.2" means nothing without a reference point. IPIP has public norms (general population). Longitudinal norms ("how much do people typically change?") are thinner but available from Roberts' meta-analysis.
4. **Causality vs correlation.** Longitudinal data shows what changed, not why. User needs to log context — which adds friction.

### Test User
Rui Silva — first test user. Start with 0 data, build up longitudinal profile over time.

### Public Individual-Level Data (To Investigate Later)
- Check if any public datasets exist with individual-level longitudinal personality data (not just aggregate meta-analysis data)
- Would be useful for demo/visualization before having own data
- Probably doesn't exist at individual level due to privacy/ethics, but worth checking

---

## Key Academic References

1. **Fleeson, W. (2001)** — "Toward a structure- and process-integrated view of personality: Traits as density distributions of states." *J. Personality & Social Psychology*, 80(6), 1011–1027. The foundational Whole Trait Theory paper.
2. **Roberts, B.W., Walton, K.E., & Viechtbauer, W. (2006)** — "Patterns of mean-level change in personality traits across the life course: A meta-analysis of longitudinal studies." *Psychological Bulletin*, 132(1), 1–25. Cited 5,264 times.
3. **Bleidorn, W. et al. (2022)** — "Personality Stability and Change: A Meta-Analysis of Longitudinal Studies." 189 studies, N=178,503. Cited 781 times.
4. **Fleeson, W. & Gallagher, P. (2009)** — "The implications of Big Five standing for the distribution of trait manifestation in behavior." *Psychological Science*, 20, 612–620.
5. **Geukes, K. et al. (2017)** — "Trait personality and state variability: Predicting individual differences in within- and cross-context variability." *Journal of Research in Personality*. Cited 237 times.
6. **Baird, B.M., Le, K., & Lucas, R.E. (2006)** — "On the nature of intraindividual personality variability." *Journal of Personality*.
7. **Condon, D.M. (2016)** — "Development and Initial Validation of the ICAR." *Intelligence*, 43, 52–64.
8. **Dworak, E.M. et al. (2021)** — "Using ICAR as an Open Source Cognitive Ability Measure." *Personality & Individual Differences*. Cited 98 times.
9. **Boateng, G.O. et al. (2018)** — "Best Practices for Developing and Validating Scales." *Health & Quality of Life Outcomes*. Cited 7,882 times.
10. **Schmidt, Oh & Shaffer (2016)** — Update to Schmidt-Hunter meta-analysis on selection method validity.
11. **Holtrop, D. et al. (2025)** — "Consequences of adding context in personality assessment." *PubMed*.
12. **Pletzer, J.L. (2025)** — "Personality and job performance: A review of trait models." Cited 23 times.
13. **Horstmann, K.T. (2020)** — "Assessing Personality States: What to Consider when Using Experience Sampling." Cited 216 times.

---

## Next Steps

1. ~~Save research document~~ ✅ Done
2. Investigate public individual-level longitudinal personality datasets (for demo before having own data)
3. Sketch assessment architecture / product spec
4. Rui as first test user — start collecting baseline data
5. Build prototype (fork bigfive-web, add state-assessment pulse, add longitudinal dashboard)
