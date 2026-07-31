# Atlas V1 — Plain-English product plan

**Status:** proposed build plan based on the approved discovery flow  
**Audience:** product owner  
**Purpose:** define what a first useful Atlas experience does for one person, without pretending the product can predict their career.

## The promise

Atlas helps a person make a career direction easier to inspect.

It starts with what they have actually done, what they currently want from work, and what they cannot or do not want to trade away. It then helps them choose a few directions worth examining, compare the evidence fairly, run a small real-world test, and revisit the decision when they learn something new.

Atlas does **not** tell someone which career to choose. It does not predict hiring, salary, success, redundancy, or AI replacement.

## Who V1 is for

The first version is for an experienced professional who is employed or otherwise stable enough to examine a possible pivot deliberately.

They may be asking:

- “Should I deepen what I already do, move sideways, or test a different direction?”
- “Which options are plausible given my actual experience and life constraints?”
- “What would I need to prove before I invest time, money, or reputation?”

A job seeker can still use the product, but V1 is not a job-application tracker, recruitment tool, or vacancy search engine.

## What the user does

### 1. Builds a career picture

The user records their own version of their career: roles, meaningful work, outcomes, current situation, location, constraints, and directions already on their mind.

They do not need to complete every field. Atlas should show what is missing without treating an incomplete profile as a failure.

### 2. Makes work preferences explicit

The user completes a short, skippable reflection form about:

- kinds of contribution they want more or less of;
- working conditions that help or hinder them;
- practical realities such as travel, location, income, and time available to retrain.

The result is a set of editable statements in the user’s own control. It is not a personality label, ability test, or score.

### 3. Chooses directions worth attention

Atlas presents a small set of possible directions. Each one explains why it appeared using three visible inputs:

- what the user says they want;
- what they have demonstrated;
- how certain the role reference is.

The user can remove any suggestion, add their own direction, or decide not to compare yet.

### 4. Compares a few directions honestly

The comparison places directions side by side. It does not rank them or calculate a “best fit.”

For every direction, the user sees separately:

- what resembles their stated preferences;
- what they already have evidence for;
- what they may need to demonstrate, learn, or clarify;
- what the EU/Portugal role reference actually supports;
- what market evidence says at its real geographic and occupational level;
- the smallest useful action that could make the direction clearer.

If a role mapping is broad, a market source is old, or a conclusion cannot be supported, Atlas says so plainly.

### 5. Opens one direction as a working brief

When a direction is worth further examination, Atlas turns it into a living brief.

The brief records:

- what makes it plausible;
- what remains unproven;
- what may be a practical blocker;
- one low-risk evidence-building test.

A user should leave this page knowing the next useful move, not feeling ordered into a career change.

### 6. Runs a short evidence cycle

The user has a light 30–60 day cycle to test a material assumption. Examples include speaking with practitioners, turning an accomplishment into a credible case, sampling target-role language, or testing a small relevant piece of work.

This is not a task-management system. An action belongs here only if its result could strengthen, weaken, or change the direction.

### 7. Reviews market evidence only when it matters

Market Pulse presents dated Portugal-first evidence linked to active directions. It may show a material change, a qualified observation, or “no material evidence update.”

A market update must state:

- the source and date;
- the geography and occupational level;
- what it supports;
- what it does not support;
- whether it changes the user’s next evidence test.

### 8. Reassesses without pretending the past disappeared

At the end of a cycle, the user can continue, adjust, pause, or deprioritise a direction.

Atlas keeps the rationale, evidence, and unknowns. Pausing or deprioritising is a valid learning outcome, not a failed workflow.

## What Atlas uses behind the scenes

Atlas uses a European role-and-skills backbone first:

- **ESCO** for occupation and skill language;
- **ISCO-08** for stable occupational grouping;
- **CPP-2010** where a Portugal-facing bridge is useful.

It may use the downloadable **O*NET Database** only as a versioned supplementary US reference for occupational task or work-context information, and only where a documented role crosswalk supports that connection.

O*NET does not assess the user in V1, does not generate direction suggestions, and does not provide Portugal market claims.

Portugal and EU evidence is kept separate from US reference material. Atlas never turns a broad source into a specific local hiring conclusion.

## What ships in V1

V1 should deliver the complete decision loop for a deliberately small, manageable role scope:

1. career profile and editable work-preference form;
2. preference brief and user-controlled direction shortlist;
3. transparent comparison of up to four directions;
4. direction brief with demonstrated evidence, gaps, unknowns, and one next test;
5. evidence workspace and reassessment;
6. source-aware role reference with user-correctable uncertainty;
7. an initial Market Pulse only where usable Portugal/EU evidence exists—otherwise an honest unavailable/no-material-update state;
8. user ability to edit, export, and delete their information.

## What waits until later

These are not V1 features:

- full real-time vacancy intelligence;
- generic course recommendations;
- an overall fit, employability, or AI-risk score;
- title-level demand claims where only broad data exists;
- automatic resolution of ambiguous job titles;
- employer, recruiter, manager, or candidate-ranking features;
- an Atlas-made psychometric assessment or a disguised RIASEC quiz;
- individual salary, hiring, or career-success forecasts.

## Conditions before a real release

The product is not ready merely because the screens work. Before real users rely on it, Atlas needs:

1. **Evidence discipline working end to end** — source, date, geography, level, limitations, and uncertainty shown wherever an external claim appears.
2. **Role-reference integrity** — user titles preserved; mappings confirmable or correctable; broad mappings visibly broad.
3. **Data rights and privacy controls** — clear notice, export, correction, deletion, retention policy, access control, and no training on identifiable content by default.
4. **Data-source governance** — versioned imports, attribution, change records, and review schedules for ESCO, O*NET Database, and market sources.
5. **Consumer-language review** — no assessment, diagnostic, prediction, or recruitment framing hidden in product copy.
6. **Portugal/EU legal and privacy review** — including a DPIA before launch, because the product handles sensitive career context and may influence meaningful decisions.

## The V1 test of value

V1 is successful if a user can honestly say:

> “I can see why this direction is plausible, what is uncertain, what I need to test next, and why Atlas is not claiming more than the evidence supports.”

If Atlas cannot provide that clarity, it should show less—not fabricate confidence.
