# Atlas KB — UX Pattern Research (2026 best practice)

**For Rui · discovery/ · 2026-07-30**
**No code, no schema. Just the patterns and tradeoffs so you can pick.**

---

## Context the user is the system

- New user lands → empty KB.
- They populate from CV upload, past roles, docs, assessments (Strong + work-values + aptitudes), O*NET exploration, then ongoing via weekly + monthly pulse.
- KB is the input to the markets pulse personalization.
- KB has to be **comfortable to live in for years** (not just a one-shot intake) but **also light enough that the user doesn't dread opening it** (engagement is the historical failure mode of every PKM tool — see `assessment-tools-research.md` Part 3 §5.1).

That's the constraint the pattern has to satisfy. Everything below is in service of that tension.

---

## The four patterns I found in 2026

I deliberately looked at four different design traditions, not four
near-identical PKM tools. The categories below represent genuinely
different bets about *what a knowledge base is for*.

### Pattern A — "The Notion-flavoured workspace" (blocks / pages / databases)

**What it is.** A blank-ish canvas. The user creates pages, blocks, databases.
Strong opinions on linked structure (relations, rollups, filters).
Reference products: Notion, Anytype, Tana, Coda.

**How a user populates it.** A mix of *free creation* (user writes a page)
and *guided sections* (a templated "Roles" or "Goals" database the user
adds rows to). The user decides how much structure to impose.

**Strengths.**
- Scales forever — KB can grow into anything the user needs.
- User feels ownership because they literally shaped it.
- Familiar to anyone who's used Notion (a non-trivial chunk of 2026 professionals).

**Weaknesses for Atlas.**
- High cognitive cost on day one. Empty canvas = "what do I do?" paralysis.
  This is the well-documented second-brain failure mode: users abandon because
  they don't know what shape to give it. (Tana's own 2026 review: "the
  structure is yours to build and keep current" — they cite this as a
  *tradeoff*, not a feature.)
- The KB *we* need has a defined schema (interests, work values, aptitudes,
  history, goals, constraints). If the user's KB is unstructured, Atlas
  can't reliably read it for the markets pulse.
- Maintenance burden. Most Notion setups rot within 6 months.

**Verdict.** Wrong primary shape. Could be the *optional power-user layer*
behind a more guided default — but as the default it fails the day-one
"empty KB, no assessments" constraint.

---

### Pattern B — "The LinkedIn-style profile with a strength meter"

**What it is.** Sections on a single page, each with a clear input pattern.
A profile-completeness meter across the top shows % done. The user's job is
to fill the sections; the system's job is to encourage completion.
Reference products: LinkedIn (Profile Strength Meter — Beginner /
Intermediate / Advanced / Expert / All-Star tiers), About.me,
Kudoswall, Resume.io.

**How a user populates it.** Click a section → fill the form → meter ticks
up. Sections are fixed (Identity, About, Experience, Education, Skills,
Interests, Goals, Constraints). The user can rearrange, edit, leave some
blank, but the slots are predefined.

**Strengths.**
- **Lowest cognitive cost on day one.** New user knows exactly what to do.
  Not "design your KB" — "fill in your basics."
- The meter is a proven engagement device. LinkedIn built a whole business
  on it. Gives the user a sense of progress without forcing them to take an
  assessment.
- Maps cleanly to a defined schema — Atlas can reliably read each section
  for the markets pulse because every section has a stable meaning.
- Supports both *required* and *optional* fields. Some sections count
  toward the meter; some don't.

**Weaknesses for Atlas.**
- Can feel transactional. "Just another profile to fill in." Doesn't match
  the "this is *my* KB" emotional ownership the user wants.
- Doesn't naturally accommodate free-form docs, notes, or attachments beyond
  the predefined slots. If the user wants to keep a PDF, they need a
  separate filing surface.

**Verdict.** Strong candidate for the default. Solves day-one. The meter is
proven. The fixed schema is what Atlas needs to read. The "feels
transactional" weakness is real but addressable — see Pattern D below.

---

### Pattern C — "The wizard / staged onboarding" (one section at a time)

**What it is.** First-time experience is a 4–7 step wizard. Each step adds
one meaningful section to the KB (e.g. "Tell us about your last role" →
"Take this short interests quiz" → "What are you optimizing for in your
next move"). After the wizard completes, the user lands in a normal KB
view where they can keep editing.
Reference products: Duolingo onboarding, Typeform-style assessment
intake, most modern B2C onboarding (Notion's *new user* flow, Linear,
Carta), every "Let's get to know you" modal from 2025–2026 SaaS.

**How a user populates it.** One focused task at a time. The user commits
to step N before seeing step N+1. The wizard ends when the system has
enough KB to personalize, OR when the user dismisses it.

**Strengths.**
- **Highest completion rate for the first-time experience.** 2026 form
  research: multi-step forms convert 13.9% vs 4.5% single-step on long
  intakes (Formstack benchmark, directional). Duolingo proved this in
  consumer onboarding. The pattern is now default for any non-trivial
  intake.
- Cognitive load stays low per screen. The user answers *one category* at
  a time.
- Allows mixing modalities: one step is "upload your CV" (file drop),
  next is "answer 5 questions about your last role" (form), next is
  "rate these 8 work values" (Strong-style items). All in one flow.

**Weaknesses for Atlas.**
- Wizards feel *prescribed*. "Did the system make me fill this, or am I
  building my own KB?" — important for the user's sense of ownership.
- Doesn't continue into the day-30 / day-90 / day-365 experience. You need
  a separate "ongoing KB" view after the wizard is done.
- The temptation is to never let the user off the rails. The wizard has
  to end at a real stopping point, and after that the user is in Pattern B
  (or whatever the steady-state KB is).

**Verdict.** Best for the *first-time experience only*. The wizard is the
onboarding into the KB; it is not the KB itself.

---

### Pattern D — "Guided blocks with progressive disclosure" (hybrid)

**What it is.** Sections on a single page (Pattern B), but each section
behaves like a *smart block* — the user can click to expand it, fill it,
collapse it. Some sections are *system-defined* (Experience, Skills,
Interests, Goals — these are the schema Atlas reads); others are
*user-defined* (Notes, Docs, Reflections — these are the user's filing
cabinet). The system surfaces the right section at the right time
("Looks like you haven't added your last role yet — open the Experience
block?"). Sections also appear contextually in the pulse and assessment
flows.
Reference products: Reflect.app, Capacities (the "object"-based PKM),
Mem's evolution toward typed cards, Tana's supertags, Notion's
*templates-with-fields* pattern.

**How a user populates it.** Open the KB. See a calm overview with
collapsible sections. Click into a section to expand it; either fill the
structured form (Experience) or write freely (Notes, Reflections). Smart
prompts nudge the user toward sections they're missing, but never force
them. Assessment results drop *into* sections automatically (Strong scores
appear in the Interests block; pulse history appears in a "Pulse
history" block).

**Strengths.**
- **Day-one is calm.** A new user sees a page with titled sections, not
  a blank canvas and not a wall of inputs. They click one.
- **Year-one is still calm.** The user adds sections, expands, collapses,
  ignores. They don't have to "maintain" anything — the system knows
  what's optional.
- **Both schema and freedom.** Atlas reads the structured sections
  reliably. The user has free-form space for the filing-cabinet stuff.
- **Aligns with 2026 PKM consensus.** The divide in 2026 (per Tana's
  review, per Atlas Workspace's 2026 PKM guide, per Capacities) is
  exactly this: typed objects on a flexible canvas, not free-form notes
  on a blank page, not rigid forms on a single screen.

**Weaknesses for Atlas.**
- More engineering than Pattern B. Needs a section model, an expansion
  model, a nudge engine.
- Smart prompts can become annoying if over-tuned. Need to be
  unobtrusive-by-default.
- The "section per construct" view might not match what the user
  mentally thinks of as "their KB" if they came from Notion.

**Verdict.** This is the strongest candidate as the *steady-state* KB.
Pattern B is essentially a strict subset of Pattern D — D adds the
ability to add free-form sections and to hide/skip sections.

---

## What I'd actually recommend — and what I want from you

If I had to pick *one* approach without consulting you, I'd say:

- **First-time experience = Pattern C (wizard).** New user lands, gets a
  4–6 step flow: identity → experience → assessment → goals. After the
  wizard, the user has a working KB and lands in the steady-state view.
- **Steady-state KB = Pattern D (guided blocks).** Calm, sectioned,
  progressive disclosure. Each section is a structured block Atlas can
  read; free-form blocks exist for the user's own filing. Smart prompts
  appear at low intensity.

This is the Notion 2026 onboarding pattern + Capacities-style objects +
LinkedIn profile-meter as the progress device. It's the convergent
best-practice in 2026 from independent sources (Tana, Reflect, Capacities,
LinkedIn B2B research, Baymard/NNG form research).

But that's *my* read. **The brief you gave me was: don't tell you what to
do — surface the patterns and tradeoffs, you pick.** So I won't pick.
Below is what I want you to weigh in on.

---

## Decisions for you

1. **First-time experience: wizard or direct-to-KB?**
   - *Wizard (C)* — recommended. Higher completion, lower day-one
     friction, allows mixing CV upload + assessment + free-text in one
     flow. Tradeoff: feels prescribed, must end at a real stopping point.
   - *Direct-to-KB (B or D)* — user lands in their KB and figures it out.
     Tradeoff: day-one paralysis, lower completion of the *important*
     schema sections.

2. **Steady-state KB shape: Pattern B or Pattern D?**
   - *Pattern B (LinkedIn-style with meter)* — simplest, cleanest schema,
     lowest engineering. Tradeoff: no free-form space; user feels it's a
     "form" not "their KB."
   - *Pattern D (guided blocks)* — more flexible, matches 2026 PKM
     consensus, handles the "filing cabinet" use case. Tradeoff: more
     engineering, more surface area for smart-prompt misfires.

3. **Profile-strength meter: yes / no / subtle?**
   - LinkedIn's pattern is in your face. The 2026 consensus has moved
     toward *subtler* completeness signals — Reflect and Capacities
     don't even have one. The risk is the meter becomes the goal instead
     of the means.
   - Want a meter at all? If yes, where does it live (top of KB page /
     sidebar / only in onboarding)?

4. **Free-form sections: allowed from day one or unlocked later?**
   - If Pattern D wins: do users get a "Notes" block the moment they
     start, or only after they've filled the structured schema? The
     former respects ownership; the latter protects against the user
     hiding in free-form and never doing assessments.

5. **Onboarding length: how many steps before the user lands in the KB?**
   - The 2026 multi-step form research says 3–5 steps for long forms,
     but this isn't a form — it's a *profile*. Duolingo-style onboarding
     can run 7–10 steps and still retain. Where's our line?
   - My instinct: 4 (identity → experience → goals → first assessment).
     But if Pattern D includes free-form, you might want a "go play"
     step before the first assessment so the user feels ownership first.

---

## What I will NOT decide without you

- The exact section list for the KB. (This is the schema — we'll design
  it from your four instruments: identity, history, interests, work
  values, aptitudes, O*NET targets, goals, constraints, pulse history,
  and any free-form blocks the user adds.)
- The wizard step sequence.
- Whether Pattern A's free-form Notion mode exists as a "power user"
  layer behind the default.
- Anything about the cockpit (your admin area) — not in scope here.

---

## Sources

- Tana, "Best second brain apps in 2026": https://tana.inc/blog/best-second-brain-apps-2026
- Tana, "Best personal knowledge management tools in 2026": https://tana.inc/blog/best-pkm-tools-2026
- Atlas Workspace, "Personal Knowledge Management (2026)": https://www.atlasworkspace.ai/blog/personal-knowledge-management
- buildin.ai, "16 Best Second Brain Apps in 2026 (Tested & Ranked)": https://buildin.ai/blog/best-second-brain-apps-2026
- NNG, "Progressive Disclosure" (updated 2026): https://www.nngroup.com/articles/progressive-disclosure/
- IxDF, "What is Progressive Disclosure? (2026)": https://ixdf.org/literature/topics/progressive-disclosure
- Userpilot, "13 Progressive Disclosure Examples and Best Practices for SaaS" (2026): https://userpilot.com/blog/progressive-disclosure-examples/
- StaticForms, "Multi Step Forms: A Guide to Design, UX, and Implementation" (2026): https://www.staticforms.dev/blog/multi-step-forms
- IvyForms, "Multi-Step vs Single-Step Forms: Which Converts Better (Data)" (March 2026): https://ivyforms.com/blog/multi-step-forms-single-step-forms/
- LinkedIn Help, "Use the profile level meter": https://www.linkedin.com/help/linkedin/answer/a594698
- MyPersonalRecruiter, "LinkedIn Profile Optimization for Executives in 2026": https://mypersonalrecruiter.com/linkedin-profile-optimization-for-executives-in-2026-step-by-step/