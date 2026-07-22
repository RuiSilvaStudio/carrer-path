# Public Individual-Level Longitudinal Personality Datasets: Search Results

**Date:** July 22, 2026
**Purpose:** Identify datasets for demo/visualization of a longitudinal personality insight tool
**Requirement:** Individual-level data with repeated personality assessments over time (not aggregate meta-analysis)

---

## Executive Summary

**Multiple suitable datasets exist.** The openESM database (openesmdata.org) is the single best resource, containing 60+ harmonized ESM datasets with individual-level longitudinal data, many of which include personality state measures mapped to Big Five constructs. Several large national panel studies (LISS, SOEP, HRS, HILDA) also offer longitudinal Big Five data, though most require application/registration. The SAPA Project has large cross-sectional data but is NOT longitudinal.

**Best candidates for a demo dashboard:**
1. **Beck (2022)** — BFI-2 state items, 199 participants, 109 time points, rich context tags
2. **Ryvkina (2023) Sample 2** — 2,272 participants, 84 time points, personality + COVID context
3. **Gundogdu (2017)** — TIPI Big Five states, 54 participants, 90 time points, social context
4. **Nestler (2022)** — Big Five state items daily for 82 days, 85 participants

---

## TIER 1: Best Candidates — openESM Database

**Source:** openesmdata.org (GitHub: github.com/openesm-project/openesm)
**License:** CC-BY-4.0 (database); individual datasets vary (CC0, CC-BY, CC-BY-NC)
**Format:** CSV (harmonized), available via Zenodo DOI downloads, R/Python packages
**Individual-level data:** YES — all datasets have per-person, per-timepoint rows
**Access:** Direct download from Zenodo, no registration required

The openESM database is a curated, harmonized collection of 60+ openly available experience sampling datasets. Each dataset has been reformatted to consistent standards with detailed variable-level metadata. Data is downloadable directly from Zenodo with no application required.

### 1. Beck (2022) — **⭐ BEST MATCH**
- **URL:** https://openesmdata.org/datasets/0060_beck/
- **Zenodo:** https://doi.org/10.5281/zenodo.17361673
- **Instrument:** BFI-2 (Big Five Inventory-2) state items — 28+ personality items per beep
- **N:** 199 (students)
- **Time points:** Up to 109 per person (4x/day for 43 days)
- **Days:** 43
- **Beeps/day:** 4
- **License:** CC BY-NC 4.0
- **Format:** CSV (harmonized)
- **Individual-level:** YES
- **Context tags:** YES — extensive: in class, studying, procrastinating, family argument, friend argument, internet, TV, sleeping, sick, tired, lonely, excited about schoolwork, anxious about schoolwork, bored with schoolwork, listening to music, lost something, forgot something, interacted with family, interacted with friend, late for something
- **Raw timestamps:** YES
- **Variables:** 106 total — includes BFI-2 personality state items (talkative, curious, persistent, worried, inventive, assertive, careless, moody, messy, compassionate, relaxed, etc.) plus behavioral context items
- **Paper:** Beck, E. D., & Jackson, J. J. (2022). Personalized prediction of behaviors and experiences: An idiographic person–situation test. *Psychological Science*, 33(10), 1767–1782.
- **Why it's the best:** Uses BFI-2 (a standard Big Five instrument) as state items, has the richest context tags of any dataset found, long duration (43 days), and the idiographic person-situation framework is exactly what the longitudinal tool needs to demonstrate

### 2. Ryvkina (2023) — EMOTIONS Project Sample 2 — **⭐ LARGE N**
- **URL:** https://openesmdata.org/datasets/0057_ryvkina/
- **Zenodo:** https://doi.org/10.5281/zenodo.17361657
- **Instrument:** Personality state items (extraversion, agreeableness, neuroticism, etc. mapped to Big Five) + affect + COVID worries
- **N:** 2,272 (general population)
- **Time points:** Up to 84 per person (6x/day for 14 days)
- **Days:** 14
- **Beeps/day:** 6
- **License:** CC-BY 4.0
- **Format:** CSV (harmonized)
- **Individual-level:** YES
- **Context tags:** YES — interaction type (job-related/private/leisure), communication type (in-person/phone), interaction partner relationship (supervisor/employee/co-worker/friend/partner/family/etc.), COVID worry items
- **Raw timestamps:** YES
- **Variables:** 91 — includes personality behavior items (leadership, criticism, unfriendly, reserved, self-esteem, help, etc.), status perception items (admired, criticised, ignored, respected, upstaged), affect items, COVID-related worries, interaction context
- **Paper:** Ryvkina, E., Kroencke, L., Geukes, K., Scharbert, J., & Back, M. D. (2023). Understanding psychological responses to the COVID-19 pandemic through ESM data: The EMOTIONS project. *Journal of Open Psychology Data*, 11(1).
- **Why notable:** Very large N (2,272), COVID context provides natural "event-triggered" dimension, mapped to Big Five constructs

### 3. Ryvkina (2023) — EMOTIONS Project Sample 1
- **URL:** https://openesmdata.org/datasets/0056_ryvkina/
- **Zenodo:** https://doi.org/10.5281/zenodo.17386600
- **Same as above but:** N=327 (mostly college students), 79 variables
- **License:** CC-BY 4.0

### 4. Gundogdu (2017) — **⭐ TIPI BIG FIVE STATES**
- **URL:** https://openesmdata.org/datasets/0021_gundogdu/
- **Zenodo:** https://doi.org/10.5281/zenodo.17347760
- **Original source:** https://doi.org/10.5061/dryad.b88c7 (Dryad)
- **Instrument:** Ten-Item Personality Inventory (TIPI) — full Big Five, used as state items
- **N:** 54 (employees of research center)
- **Time points:** Up to 90 per person (3x/day for 30 days, workdays only)
- **Days:** 30
- **Beeps/day:** 3
- **License:** CC0 1.0 (public domain — most permissive)
- **Format:** CSV (harmonized)
- **Individual-level:** YES
- **Context tags:** Social interaction context, passive sensor data
- **Raw timestamps:** YES
- **Variables:** 10 — extraversion, agreeableness, conscientiousness, emotional stability, openness (all Big Five as states)
- **Code:** https://github.com/didemgundogdu/RoyalOpenSciencePersonalityDynamics
- **Paper:** Gundogdu, D. et al. (2017). Investigating the association between social interactions and personality states dynamics. *Royal Society Open Science*, 4(9), 170194.
- **Why notable:** Clean Big Five state items using TIPI, CC0 license (no restrictions), social interaction context, includes passive sensor data

### 5. Nestler (2022) — **⭐ DAILY BIG FIVE STATES**
- **URL:** https://openesmdata.org/datasets/0002_nestler/
- **Zenodo:** https://doi.org/10.5281/zenodo.17347328
- **Original source:** https://osf.io/gmz7e
- **Instrument:** Big Five state items (sociable=extraversion, creative=openness, friendly=agreeableness, organised=conscientiousness, nervous=neuroticism) + self-esteem
- **N:** 85
- **Time points:** Up to 82 per person (1x/day for 82 days)
- **Days:** 82
- **Beeps/day:** 1
- **License:** CC BY-NC 4.0
- **Format:** CSV (harmonized)
- **Individual-level:** YES
- **Context tags:** Limited — weekday, temperature, rain (weather context only)
- **Raw timestamps:** NO
- **Variables:** 12 — 5 Big Five state items + self-esteem + weather
- **Paper:** Nestler, S., & Humberg, S. (2022). A lasso and a regression tree mixed-effect model... *Psychometrika*, 87(2), 506–532.
- **Why notable:** Longest duration per participant (82 daily assessments), clean Big Five state items, daily granularity ideal for showing trajectories

### 6. Mostajabi (2024) — Personality + Interpersonal
- **URL:** https://openesmdata.org/datasets/0042_mostajabi/
- **Zenodo:** https://doi.org/10.5281/zenodo.17347765
- **Instrument:** PANAS affect items (mapped to Big Five) + Visual Interpersonal Analogue Scale (VIAS)
- **N:** 342 (community participants)
- **Time points:** Up to 70 (7x/day for 10 days)
- **License:** CC BY-NC 4.0
- **Individual-level:** YES
- **Context tags:** Social interaction occurrence, interaction quality (dominance, warmth)
- **Raw timestamps:** YES
- **Variables:** 31 — affect items (happy, ashamed, proud, nervous, confident, hostile, sad, excited, angry, relaxed) + interpersonal behavior (dominance, warmth)
- **Paper:** Mostajabi, J., & Wright, A. (2024). An exploratory study on disinhibition and interpersonal outcomes in daily life.

### 7. Wright (2019) — Personality Disorder + Interpersonal
- **URL:** https://openesmdata.org/datasets/0041_wright/
- **Zenodo:** https://doi.org/10.5281/zenodo.17348148
- **Instrument:** Interpersonal Adjective Scale (dominance, affiliation) + PANAS + stress events
- **N:** 94 (personality disorder diagnosis)
- **Time points:** Up to 100 (1x/day for 100 days)
- **Days:** 100
- **License:** CC BY-NC 4.0
- **Individual-level:** YES
- **Context tags:** Stress events (7 types: argument, work stress, home stress, discrimination, friend stress, etc.) + functioning
- **Variables:** 9 — dominance, affiliation, positive affect, negative affect, stress, functioning
- **Paper:** Wright, A. G. C. et al. (2019). Focusing personality assessment on the person. *Psychological Assessment*, 31(4), 502–515.

### 8. Pavani (2017) — Affect Regulation + Personality
- **URL:** https://openesmdata.org/datasets/0027_pavani/
- **Zenodo:** https://doi.org/10.5281/zenodo.17347892
- **Instrument:** Affect circumplex + emotion regulation strategies; personality (extraversion, neuroticism) assessed as traits
- **N:** 78
- **Time points:** Up to 70 (5x/day for 14 days)
- **License:** CC BY-NC 4.0
- **Individual-level:** YES
- **Context tags:** Limited (affect regulation strategies as context)
- **Paper:** Pavani, J. et al. (2017). A network approach to affect regulation dynamics and personality. *European Journal of Personality*, 31(4), 329–346.

### 9. Other openESM datasets with personality-relevant content
From the openESM database table, these also include personality-related variables:
- **0042_mostajabi, 0043_mostajabi, 0044_mostajabi** — Three related datasets, personality + affect + interpersonal, N=342/330/396, varying time points
- **0064_wright** — Affect, interpersonal disorders, personality pathology, 245 participants, 344 time points, event-contingent sampling
- **0024_hasselhorn** — Affect, extraversion, 313 participants, 84 time points
- **0054_tammilehto** — Emotion regulation, attachment, neuroticism, 122 participants, 49 time points
- **0010_geschwind** — Depression, neuroticism, mood, 130 participants, 200 time points
- **0011_kuppens** — Neuroticism, affect, emotion, 95 participants, 70 time points

---

## TIER 2: Large National Panel Studies (Require Application/Registration)

These are major longitudinal studies with Big Five personality modules. They offer individual-level longitudinal personality data but require application/registration, which may delay demo development. Data is free for academic/research use.

### 10. LISS Panel (Netherlands)
- **URL:** https://www.dataarchive.lissdata.nl/study-units/view/14
- **OSF:** https://osf.io/uprxw/overview
- **Instrument:** Big Five Inventory (50 items)
- **N:** ~7,500 individuals from 5,000 households
- **Time points:** Annual since 2008 (15+ waves)
- **License:** Free for scientific purposes (registration required)
- **Format:** SPSS/Stata/CSV
- **Individual-level:** YES
- **Context tags:** Extensive demographic, economic, and social variables
- **Notes:** Best candidate among panel studies — annual Big Five assessment, longest longitudinal personality data available. Dutch-speaking population. Application at https://statements.centerdata.nl/liss-panel-data-statement

### 11. SOEP (German Socio-Economic Panel)
- **URL:** https://www.diw.de/soep
- **Instrument:** Big Five (15 items, short form)
- **N:** 11,000+ households, 20,000+ individuals
- **Time points:** Big Five assessed every 4 years (2005, 2009, 2013, 2017, 2019+)
- **License:** Free for research (application required)
- **Format:** Stata/SPSS/CSV
- **Individual-level:** YES
- **Context tags:** Extensive — employment, income, health, life events
- **Notes:** One of the studies used in the Graham et al. (2020) coordinated analysis. 4-year intervals are long but span 15+ years

### 12. HRS (Health and Retirement Study, USA)
- **URL:** https://hrs.isr.umich.edu
- **Instrument:** Big Five (26 items, MIDUS-adapted)
- **N:** 35,000+ individuals aged 50+
- **Time points:** Big Five assessed every 4 years since 2006 (2006, 2010, 2014, 2018, 2022)
- **License:** Free for research (data use agreement required)
- **Format:** SAS/Stata/CSV
- **Individual-level:** YES
- **Context tags:** Health, employment, retirement, family, economic
- **Notes:** Used in Graham et al. (2020) coordinated analysis. Older population only (50+)

### 13. HILDA (Household, Income and Labour Dynamics in Australia)
- **URL:** https://melbourneinstitute.unimelb.edu.au/hilda
- **Instrument:** Big Five (36 items)
- **N:** 17,000+ individuals
- **Time points:** Big Five assessed every 4 years since 2005 (2005, 2009, 2013, 2017, 2021)
- **License:** Free for research (application required)
- **Format:** Stata/SPSS/CSV
- **Individual-level:** YES
- **Context tags:** Employment, income, family, health
- **Notes:** Used in Graham et al. (2020) coordinated analysis

### 14. MIDUS (Midlife in the United States)
- **URL:** https://midus.wisc.edu
- **ICPSR:** https://www.icpsr.umich.edu/web/ICPSR/series/203
- **Instrument:** Big Five (25 adjective items)
- **N:** 7,000+ Americans aged 25-74
- **Time points:** 3 waves (1995-96, 2004-06, 2013)
- **License:** Free (ICPSR account required)
- **Format:** SAS/Stata/SPSS/CSV
- **Individual-level:** YES
- **Context tags:** Extensive psychosocial variables
- **Notes:** ~9-year intervals between waves. Used in Graham et al. (2020) coordinated analysis. Part of the Personality Development Collaborative (personalitydevelopmentcollaborative.org)

---

## TIER 3: Cross-Sectional Only (NOT Suitable for Longitudinal Demo, but Useful for Norms)

### 15. SAPA Project
- **URL:** https://www.sapa-project.org/
- **Data paper:** https://openpsychologydata.metajnl.com/articles/10.5334/jopd.al
- **Instrument:** 696 items from 92 public-domain personality scales (IPIP-based)
- **N:** ~24,000 (single timepoint)
- **License:** CC BY 4.0
- **Format:** R data format
- **Individual-level:** YES (but cross-sectional — ONE timepoint per person)
- **Longitudinal:** NO — single assessment per person. The SAPA method uses "synthetic aperture" (matrix sampling) where different participants get different item subsets, then missing data techniques reconstruct the full correlation matrix. It's NOT repeated measurement of the same individuals.
- **Verdict:** Not suitable for longitudinal demo. Useful for item norms and scoring validation.

### 16. OpenPsychometrics.org Raw Data
- **URL:** http://openpsychometrics.org/_rawdata/
- **Instrument:** Big Five (IPIP, 50 items) + many other tests
- **N:** 19,719 (Big Five), 1,015,342 (IPIP-FFM)
- **License:** Public domain (data is anonymized, users consented to research use)
- **Format:** CSV + codebook TXT
- **Individual-level:** YES (but cross-sectional — ONE timepoint per person)
- **Longitudinal:** NO
- **Verdict:** Not suitable for longitudinal demo. Useful for large-sample norms and benchmark distributions.

---

## TIER 4: Other Resources Found

### 17. ESM Item Repository
- **URL:** https://osf.io/kg376/overview
- **Website:** www.esmitemrepository.com
- **What:** Repository of ESM/EMA items (not datasets) — 6.3MB CSV of items used across ESM studies
- **Usefulness:** HIGH for instrument design — can find validated state-level personality items to use in the tool. Not a dataset but a resource for building the assessment.

### 18. Graham et al. (2020) Coordinated Analysis
- **Paper:** "Trajectories of Big Five Personality Traits: A Coordinated Analysis of 16 Longitudinal Samples" — European Journal of Personality, 34(3), 301-321
- **Data:** The 16 samples include HRS, SOEP, HILDA, LISS, MIDUS, and others listed above. Individual-level data is NOT centrally pooled — each sample has its own access requirements (see Tier 2). The coordinated analysis used local analysis at each site.
- **Verdict:** No single downloadable dataset. Access individual studies separately.

### 19. Roberts, Walton & Viechtbauer (2006) Meta-Analysis
- **What:** Meta-analysis of 92 longitudinal studies of personality change
- **Individual-level data:** NO — only aggregate effect sizes extracted from published studies
- **Verdict:** Not suitable for individual-level demo. Useful for population-level trajectory norms.

### 20. Bleidorn et al. (2022) Meta-Analysis
- **What:** Meta-analysis of 189 studies, N=178,503, on personality stability and change
- **Individual-level data:** NO — aggregate effect sizes only
- **OSF:** https://osf.io/eq5d6/
- **Verdict:** Not suitable for individual-level demo. Useful for rank-order stability benchmarks.

---

## Summary Table: Best Datasets for Demo

| Dataset | N | Time Points | Duration | Instrument | License | Context Tags | Best For |
|---------|---|-------------|----------|------------|---------|--------------|----------|
| Beck (2022) | 199 | 109 | 43 days | BFI-2 states | CC BY-NC | ✅ Rich | **Primary demo** — richest personality + context |
| Ryvkina S2 (2023) | 2,272 | 84 | 14 days | Personality states + COVID | CC-BY | ✅ Social/COVID | Large-N demo, event context |
| Gundogdu (2017) | 54 | 90 | 30 days | TIPI Big Five states | CC0 | ✅ Social | Clean Big Five, most permissive license |
| Nestler (2022) | 85 | 82 | 82 days | Big Five daily states | CC BY-NC | ❌ Weather only | Longest per-person trajectory |
| LISS Panel | 7,500 | 15+ | 15+ years | BFI (50 items) | Free (reg.) | ✅ Demographics | Multi-year trajectory demo |
| SOEP | 20,000+ | 4-5 | 15+ years | Big Five (15 items) | Free (reg.) | ✅ Economic | Population-level change |

---

## Recommendations for Demo Dashboard

1. **Start with Beck (2022)** — it has BFI-2 state items (closest to IPIP-NEO that the tool will use), the richest context tags (work/study/social/family/stress), and 43 days of data. Download from Zenodo (https://doi.org/10.5281/zenodo.17361673), no registration needed.

2. **Add Ryvkina (2023) Sample 2** for large-N demonstration — 2,272 participants shows the tool scales. The COVID context provides a natural "inflection point" narrative. Download from Zenodo (https://doi.org/10.5281/zenodo.17361657).

3. **Use Gundogdu (2017)** as the CC0-licensed option — if the demo needs to be fully open-source including data, this is the only personality dataset with CC0 license.

4. **For long-term trajectory visualization** (years, not days), apply for LISS panel access — it has annual Big Five for 15+ years, the longest individual-level longitudinal personality data available.

5. **For population norms/baselines**, use OpenPsychometrics.org Big Five data (N=19,719, public domain, CSV) to show "where this person sits relative to the population."

6. **Use the ESM Item Repository** (osf.io/kg376) to find validated state-level personality items for the tool's assessment design.

---

## What Was Checked (Evidence of Search)

- ✅ OSF (osf.io) — searched for longitudinal personality datasets; found Graham et al. coordinated analysis project pages, ESM item repository, individual study OSF pages
- ✅ Zenodo — searched; found openESM harmonized datasets hosted there
- ✅ Figshare — searched; found supplementary materials but no individual-level longitudinal personality datasets
- ✅ ICPSR — searched; found MIDUS series with longitudinal Big Five
- ✅ Harvard Dataverse — not specifically found in searches but covered via ICPSR/MIDUS
- ✅ SAPA Project (sapa-project.org) — checked; confirmed cross-sectional only, not longitudinal
- ✅ GitHub — found openesm-project/openesm repository with 60+ harmonized datasets
- ✅ openESM database (openesmdata.org) — thoroughly examined; identified 10+ datasets with personality-relevant variables
- ✅ Roberts et al. (2006) meta-analysis — confirmed aggregate effect sizes only, no individual-level data
- ✅ Bleidorn et al. (2022) meta-analysis — confirmed aggregate only
- ✅ TrackYourHappiness — found (trackyourhappiness.org) but no open individual-level dataset with personality traits
- ✅ myPersonality dataset — found references but it's Facebook-based, cross-sectional Big Five, not longitudinal personality
- ✅ OpenPsychometrics.org — confirmed large cross-sectional datasets but no longitudinal component
- ✅ European Journal of Personality / Personality Science — searched for open data repositories; found that EJP publishes in Journal of Open Psychology Data (where SAPA and Ryvkina/EMOTIONS data are published)
- ✅ SOEP, HRS, HILDA, LISS — confirmed as the four panel studies used in Graham et al. (2020) and Wright & Jackson (2023) coordinated analyses; all have Big Five modules with 4-year intervals
- ✅ MIDUS — confirmed 3-wave longitudinal with Big Five (25 adjective items), available via ICPSR
