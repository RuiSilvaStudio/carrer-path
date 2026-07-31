# Atlas — Production Foundation Proposal

**Status:** approved product foundation — 30 July 2026  
**Audience:** product owner  
**Scope:** what Atlas needs underneath the approved screens before it becomes a live product

> **Decision recorded:** the product owner approved all six decisions in Section 8. Atlas will lead with its own clearly labelled, non-diagnostic work-preferences exploration—not a claimed RIASEC assessment. Official downloadable O*NET Database data may provide supplementary, versioned US work-environment/task reference; O*NET Web Services are unavailable for now because Atlas cannot meet account-registration eligibility. The official O*NET Interest Profiler remains an optional future, unchanged supplementary instrument, not the product gateway. Atlas will pursue full GDPR compliance for EU/Portugal operation. This document is now the operating foundation for implementation planning; final data-licence/delivery review and formal privacy review remain launch gates.

---

## 1. The decision

Build Atlas as an **EU-first, user-owned career decision-support product**.

It helps a person understand their interests and evidence, choose career directions, test them against credible role and market information, take low-risk action, and revisit the decision when evidence changes.

It does **not**:

- tell a person what career they should choose;
- predict whether they will be hired, earn a given salary, be replaced by AI, or succeed in a role;
- assess ability, diagnose personality, or make a hiring decision;
- let employers, recruiters, managers, or training providers rank or exclude people using Atlas results.

### The evidence model

Atlas must keep these signals separate throughout the product:

| Signal | The question it answers | What it must never be mistaken for |
|---|---|---|
| **Stated activity and work preferences** | “What kinds of work, environments, and trade-offs does this person say they want more or less of?” | A validated psychometric profile, ability, competence, eligibility, demand, or success likelihood |
| **Career evidence** | “What have I actually done or delivered?” | A claim that a job title automatically proves every associated skill |
| **Role reference** | “What skills and activities are commonly associated with this role family?” | A universal job specification or pass/fail list |
| **Preferences and constraints** | “What matters and what is possible in this person’s real life?” | A hidden personality score |
| **Market evidence** | “What do recent sources indicate at this geography and occupation level?” | A forecast for one person or a specific employer |
| **AI/task-change evidence** | “Which tasks may change and what human work may become more valuable?” | A job-loss or replacement prediction |

The comparison screen must remain a **structured argument**, not a composite “career fit” score.

---

## 2. What ships first

The approved user journey remains:

> Career profile → reflective work preferences → user chooses directions → comparison → direction detail/gaps → evidence workspace → market pulse → reassess.

The recommended production order is deliberately narrower than the full vision.

### Release 1 — Honest, useful foundation

Ship:

1. **Career profile and editable preferences**
   - career history, accomplishments, role context, location and practical constraints;
   - optional, user-written priorities and deal-breakers;
   - no attempt to infer hidden characteristics from gaps or free text.

2. **Atlas work-preferences exploration**
   - original, plain-language reflection on activities, environment, values, trade-offs, and practical conditions;
   - user-controlled stated preferences, not hidden personality labels or normative scores;
   - a transparent explanation of how a preference appears in a later role comparison;
   - the official O*NET Interest Profiler remains an optional, unchanged future reference tool—not a requirement to use Atlas.

3. **User-led role shortlist**
   - Atlas can suggest directions, but users can remove them and add their own;
   - user titles stay visible even when Atlas suggests a standard reference role.

4. **Role comparison without live market claims**
   - demonstrated evidence;
   - role-skill reference;
   - user-stated preferences alongside bounded optional role-side work-context reference where a documented crosswalk supports it;
   - constraints and practical gaps;
   - source and uncertainty disclosure.

5. **Direction workspace**
   - a contained 30–60 day evidence cycle;
   - collected evidence, open assumptions, and a reassessment decision;
   - no project-management board.

Do **not** ship in Release 1:

- automated adjudication of ambiguous role titles;
- an overall employability or career-fit score;
- a “safe from AI” or replacement-risk label;
- title-level Portugal demand claims when only broad occupational data exist;
- generic course recommendations;
- employer-facing or candidate-ranking workflows.

### Release 2 — Credible EU/Portugal role and market context

Add:

- Portugal/EU role references, labour-market signals, and market-pulse evidence where source coverage permits;
- user-correctable role mapping;
- an explicit local/broader-group/Europe-wide coverage label;
- live source records and data-age status.

### Release 3 — Task change and targeted learning experiments

Add:

- carefully sourced task-change evidence;
- human complements and AI-enabled evidence-building experiments;
- targeted learning pointers only when a gap is real and meaningful;
- regulated-profession checks.

No release should progress merely because the UI exists. It progresses when the evidence policy and explanation rules below are working end-to-end.

---

## 3. Work-preferences foundation: native, reflective, and editable

### Recommended choice

Atlas starts with an **original work-preferences exploration**. It asks users what they want more or less of in work; it does not claim to measure their personality, ability, or a validated RIASEC profile.

The reflection covers:

- activities and contribution style — making, investigating, creating, helping, influencing, or organising;
- environment — autonomy, collaboration, experimentation, structure, depth of focus, and operating rhythm;
- practical reality — location, travel, income floor, retraining time, and appetite for a gradual test;
- non-negotiables and deal-breakers.

Every answer is an editable statement. It can be muted from a role comparison. Atlas must say exactly where it influenced a comparison.

### What it is not

Atlas must not call the outcome:

- an O*NET Interest Profiler result;
- a RIASEC result, code, or psychometric score;
- a personality type, capability score, hiring signal, or local market forecast.

It is a structured reflection aid. A useful uncertainty is better than a forced answer.

### O*NET's new supplementary role

Atlas may use the versioned, downloadable **O*NET Database** under CC BY 4.0 as a supplementary occupation-side US reference for interest/work-context and task information. It is not the user assessment, the EU/Portugal role backbone, or a market source.

- ESCO + ISCO-08 + CPP-2010 remain the core role and market bridge.
- An O*NET reference appears only where a documented crosswalk supports it.
- Atlas keeps the crosswalk relationship and uncertainty visible.
- A broad, close, or unavailable crosswalk never becomes a confident work-environment claim.
- O*NET Web Services are not a dependency.

The official O*NET Interest Profiler remains an optional future supplementary instrument only if delivered unchanged under its separate licence. It is not required for Atlas or used as a product gateway.

### Work-preferences release checks

- [ ] Before answering, the user sees: “This is a reflection tool, not a psychological assessment. It does not measure ability, employability, or predict your future.”
- [ ] Users can skip, edit, remove, or mute every preference.
- [ ] The UI shows the user's statements, not a hidden personality label or normative score.
- [ ] Each role comparison identifies the preference it considered and keeps it separate from career evidence, market evidence, and role reference.
- [ ] Atlas does not use SDS, Strong, O*NET Interest Profiler, or other proprietary/validated instrument items, scoring, reports, or labels in its native flow.
- [ ] O*NET Database attribution, version, licence link, and modification notice are visible wherever its adapted data is used.
- [ ] O*NET information is never presented as Portugal/EU labour-market evidence.

---

## 4. Role and skill reference foundation: EU first

### Recommended source hierarchy

| Need | Source | Atlas use |
|---|---|---|
| Role title, role family, skill terminology | **ESCO** | Primary European reference layer; multilingual roles and skills |
| Stable occupational grouping | **ISCO-08** | Common bridge for labour statistics |
| Portugal-facing grouping and labels | **CPP-2010** | Local statistical bridge and presentation layer |
| Interest/work-environment and richer task context | **O*NET**, only through a documented crosswalk | Supplementary exploration reference—not Portugal market evidence |
| Current market evidence | **INE, IEFP, Eurostat, Cedefop** | Separate, source-cited market context |

### How a role is stored

Atlas should preserve the user’s language rather than erase it with a taxonomy label.

Each role holds:

1. **The user’s title** — for example, “Product Operations Lead.”
2. **Context** — sector, seniority, country, key activities, team/scope where relevant.
3. **Reference role** — selected ESCO occupation or occupations, including version and source identifier.
4. **Statistical bridge** — ISCO-08 and CPP-2010 where applicable.
5. **Match state** — confirmed, broad, close, provisional, hybrid, or unmapped.
6. **Optional O*NET reference** — only with documented crosswalk relationship type.

### Ambiguity is a product state, not an error

Job titles are unreliable alone. “Architect,” “manager,” or “lead” can describe very different work.

Atlas must ask for short role context before assigning a reference role:

- What did you actually create, improve, analyse, sell, support, or lead?
- Which sector and level does this describe?
- Which description best resembles the work you mean?

If uncertainty remains, Atlas should behave as follows:

| Situation | Atlas behaviour |
|---|---|
| One obvious reference role | Show it and ask the user to confirm |
| Several plausible roles | Offer 2–4 plain-language alternatives; do not silently choose |
| Hybrid/new/internal role | Preserve the title and create a “role recipe” with several references or activity shares |
| Broad mapping only | Label all skill and market information as broad context |
| No safe mapping | Keep the user title and allow the evidence workspace to work without a benchmark |
| Regulated profession | Show an official eligibility/recognition check; do not reduce the issue to a skills gap |

### The comparison must show four separate cards

1. **What you already show** — direct evidence from the user’s history.  
   Labels: demonstrated / mentioned but not evidenced / not yet assessed.

2. **Stated preferences and optional role-side work context** — what the user says they want, alongside any clearly bounded occupational reference.  
   State whether an optional O*NET reference comes through an exact, broad, narrow, or close crosswalk; never call the result RIASEC fit.

3. **Role skills to examine** — ESCO skills, grouped into 3–5 actionable themes.  
   Distinguish essential from optional/context-dependent. Neither means automatic qualification or disqualification.

4. **Portugal/EU market pulse** — only evidence at the available occupational, sectoral, and geographic level.

### Role-reference release checks

- [ ] A user’s original title never disappears.
- [ ] An ambiguous title produces choices or a provisional state, not false certainty.
- [ ] An unmapped or hybrid role can still be explored.
- [ ] A skill is never called “demonstrated” just because it belongs to a role reference.
- [ ] Preference/context comparison is visibly a user-stated input plus a bounded reference, not a hiring, ability, or psychometric score.
- [ ] O*NET crosswalk labels retain their relationship type and are never converted into Portugal demand, pay, shortage, or hiring claims.

---

## 5. Portugal/EU market and AI-task-change evidence

### Source policy

| Evidence layer | Primary sources | Refresh | Supports | Does not support |
|---|---|---:|---|---|
| Portugal employment baseline | INE Labour Force Survey | Quarterly | employment, unemployment, participation, broad occupation/sector context | current title-level hiring demand or individual odds |
| Portugal registered activity | IEFP statistics | Monthly | registered vacancies, jobseekers, placements, regional signals | the entire labour market |
| Comparable EU context | Eurostat | monthly/quarterly depending on series | EU comparison, broad sector vacancy/employment direction | exact-role demand, salary offers, real-time results |
| Role and skills terminology | ESCO | version-pinned; review quarterly | role/skills matching | current demand or proof the user has a skill |
| Online-ad signals | Cedefop Skills-OVATE | Quarterly at most, only on a documented release | changing advertised skills/titles when coverage is adequate | total vacancy counts, whole-market demand, absence of demand |
| AI adoption | Eurostat enterprise AI-use data | Annual | country/sector/enterprise-size adoption context | job-loss counts, personal displacement or task exposure |
| AI/task-change scenarios | Cedefop research | Annual or substantive release | skill and task-change scenarios | deterministic automation claims |

### Refresh rhythm

- **Monthly:** IEFP and relevant Eurostat headline updates, with provisional/coverage labels.
- **Quarterly:** INE, Eurostat labour/vacancy releases, Skills-OVATE review.
- **Annual:** Eurostat AI-adoption evidence and Cedefop AI/task research.

A pulse should publish only after a material evidence change. Otherwise it says:

> “No material evidence update since [date].”

That is a feature, not a failure. It prevents noise from being confused with intelligence.

### Claim threshold

A statement like “the market signal appears to be strengthening” requires **at least two compatible sources**. A single source may still appear, but only as a qualified observation with its limitation.

### Mandatory evidence label

Every displayed claim needs:

- publisher, canonical URL, dataset/report version, and retrieval date;
- geography and population/coverage;
- reference period, release date, and data age;
- role mapping and aggregation level;
- unit, provisional or revised status where relevant;
- evidence type: official statistic, administrative register, online-ad signal, forecast/scenario, or user observation;
- confidence: high, medium, or low, with a plain-language reason;
- known limitations.

Suggested freshness labels:

- **Current** — within normal release cycle;
- **Aging** — one expected cycle missed;
- **Stale** — two or more cycles old; suppress or visibly downgrade it.

### AI language rules

Never say:

- “AI will replace this job.”
- “This career is AI-proof.”
- “You are likely to be displaced.”

Use:

> “Evidence suggests some tasks may be more exposed to AI-enabled change. Exposure does not establish local adoption, job loss, or hiring impact.”

Every AI claim must identify whether it describes:

- enterprise adoption;
- task exposure;
- automation potential;
- augmentation;
- a scenario or forecast.

US evidence may explain a method or a task-reference source. It must be labelled as such and must never quantify Portugal/EU demand, wages, shortages, or personal outcomes.

### Market-pulse release checks

- [ ] Every claim shows source, date, geography, reference period, occupational level, and limitations.
- [ ] Portugal is the default geography; EU comparison is visibly labelled.
- [ ] A broad ISCO/NACE signal is labelled as broad context, not title-specific evidence.
- [ ] IEFP and online-ad evidence state coverage limits.
- [ ] No UI or API response exposes personal hiring, salary, redundancy, or automation probabilities.
- [ ] User observations are personal context only; they cannot overwrite official indicators.
- [ ] Stale, sparse, revised, or low-confidence data are downgraded or withheld rather than made precise.

---

## 6. Privacy, control, and explanation

Career histories, stated preferences, and derived comparison records are personal data. Free-text career material can also reveal sensitive facts or proxies for them.

### Product rules

1. **Collect less, not more**  
   Every field is tied to a clear user benefit. Optional really means optional.

2. **No sensitive inference**  
   Atlas must not infer protected characteristics, health, disability, religion, union membership, sexuality, family status, or employability risk from CVs, career gaps, or assessment patterns.

3. **No model training by default**  
   User CVs, free text, preference statements, and derived comparison records are not used to train models or make shared market data without a separate explicit opt-in and governance review.

4. **User ownership and control**  
   Users can view, correct, export, and delete the information Atlas holds. They can change a role mapping, remove a suggested direction, add counter-evidence, or turn off a preference.

5. **Separate identity from analysis**  
   Keep account identity separate from assessment/derived records internally; encrypt data in transit and at rest; restrict and audit staff access.

6. **Clear retention**  
   Publish a concrete retention schedule. Delete or anonymise data once it is no longer needed, including backups on a documented timetable.

7. **Advisory only**  
   Atlas results cannot be used for recruitment screening, access to work/training, promotion, dismissal, or any similarly significant automated decision.

### Every personalised conclusion needs a “Why this?” view

It shows:

- what the user told Atlas;
- which role mapping was used and how certain it is;
- which market/task evidence was used;
- what Atlas does not know;
- source date, scope, and limitations;
- how to correct or delete an input.

Before launch, commission a data-protection impact assessment and Portuguese/EU privacy review. This is necessary because the product profiles career information and can influence meaningful life decisions—even though it is not an employment selection tool.

---

## 7. Non-negotiable operating rules

These rules should become product acceptance tests, editorial rules, and QA checks:

1. No individual outcome forecasts.
2. No overall score that hides conflicting evidence.
3. No stated preference or optional O*NET role reference used as ability, competence, hiring, or market evidence.
4. No US source presented as Portugal/EU market evidence.
5. No claim without source, date, geography, scope, and limitation.
6. No title-only role mapping presented as certain.
7. No skill called demonstrated without user-specific evidence.
8. No “AI will replace” language; task change stays separate from employment outcome.
9. No user observation overwrites a cited external indicator.
10. No sensitive inference or training reuse by default.
11. Every recommendation can be inspected, corrected, ignored, or deleted by the user.
12. If evidence is weak or missing, Atlas says **“insufficient evidence”**.

---

## 8. Decisions needed before implementation starts

These are product/legal decisions, not coding details:

1. **Preference and O*NET route**  
   Confirm the native reflective work-preferences flow for V1. O*NET Web Services are excluded; optional downloaded O*NET Database enrichment remains distinct from the user flow.

2. **Initial geography**  
   Confirm Portugal-first, with EU comparison where available. This keeps claims coherent.

3. **Initial audience boundary**  
   Confirm self-directed individual career exploration only—no employer dashboards or recruitment use.

4. **Initial role-reference scope**  
   Confirm ESCO + ISCO-08 + CPP-2010 as the base. O*NET is supplementary US work-context and task reference only.

5. **Privacy promise**  
   Confirm: no training on identifiable user content by default; editable/exportable/deletable user data; explicit retention schedule.

6. **Evidence threshold**  
   Confirm: two compatible sources for an Atlas market interpretation; one source can appear only as a qualified observation.

---

## 9. Source register

### O*NET database and optional future instrument

- O*NET Database: https://www.onetcenter.org/database.html
- O*NET Database licence: https://www.onetcenter.org/license_db.html
- O*NET Interest Profiler (optional future instrument): https://www.onetcenter.org/IP.html
- O*NET Career Exploration Tools licence: https://www.onetcenter.org/license_tools.html

### EU/Portugal role references

- ESCO: https://esco.ec.europa.eu/en/classification/occupation_main
- ESCO FAQ and data: https://esco.ec.europa.eu/en/about-esco/faq
- ESCO–O*NET crosswalk: https://esco.ec.europa.eu/en/about-esco/data-science-and-esco/crosswalk-between-esco-and-onet
- Portugal CPP-2010: https://www.ine.pt/xurl/pub/107961853
- EU regulated professions database: https://ec.europa.eu/growth/tools-databases/regprof/

### Labour market and AI context

- Statistics Portugal labour-market statistics: https://www.ine.pt/xportal/xmain?xpgid=ine_tema&xpid=INE&tema_cod=1114
- IEFP statistics: https://www.iefp.pt/estatisticas
- Eurostat job vacancy statistics: https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Job_vacancy_statistics
- Cedefop Skills-OVATE: https://www.cedefop.europa.eu/en/tools/skills-online-vacancies
- Cedefop Portugal skills forecast: https://www.cedefop.europa.eu/en/country-reports/portugal-skills-forecasts-2025
- Eurostat enterprise AI use: https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Use_of_artificial_intelligence_in_enterprises
- Cedefop digitalisation and future work: https://www.cedefop.europa.eu/en/projects/digitalisation-and-future-work

### Rights and safeguards

- GDPR: https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02016R0679-20160504
- EU AI Act: https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng
- EDPB data-protection basics: https://www.edpb.europa.eu/sme/learn-the-basics/data-protection-basics_en

---

## Bottom line

Atlas should not become a machine that tells users who they are or predicts what will happen to them.

It should become a product that makes a hard career choice easier to inspect:

> **Here is what you have demonstrated. Here is the work environment you may enjoy. Here is the role reference. Here is what the available Portugal/EU evidence does and does not say. Here is what remains unknown. Here is the smallest useful next test.**

That is both more honest and more valuable than a career score.
