# Atlas — Career Assessment Round (scope-locked)

**For Rui · discovery/ · 2026-07-30**
**Plain English, no schema. What we're building, what we're not, how it lines up with what already exists.**

---

## The scope of this round (locked)

**Build only the career assessment.** Focus on making it work well, document it properly.

Out of scope this round (kept out so we don't drift again):

- The KB (Knowledge Base) page
- The markets pulse (monthly signal)
- The weekly personality pulse changes (already exists, untouched)
- The cockpit (your admin area, untouched)
- The O*NET exploration tab — **read below for the one nuance**

---

## What's already on disk (so we don't reinvent)

| Thing | File(s) | What it is |
|---|---|---|
| Top nav | `atlas/src/components/Nav.tsx` | 4 items: Dashboard / Baseline / Pulse / Docs + Cockpit for you. Real Atlas IBM Plex Mono, 12px, uppercase, sticky. |
| Baseline page route | `atlas/src/pages/BaselinePage.tsx` (5 lines, just renders BaselineAssessment) | The existing personality/leadership baseline lives here |
| Baseline assessment flow | `atlas/src/components/baseline/BaselineAssessment.tsx` (1,006 lines) | Multi-phase flow: welcome → IPIP → ICAR → SD3 → context → complete. Uses localStorage autosave, GSAP section transitions, BigFive radar chart at end. **This is the pattern the career assessment mirrors.** |
| Tabs CSS | `atlas/src/index.css` `.atlas-tabs` (line ~170) | Already styled — single-row, inactive tabs collapse to numbers, active expands to label |
| Command palette | `atlas/src/components/ui/CommandPalette.tsx` | ⌘K jump-to-anything |
| Help menu | `atlas/src/components/ui/HelpMenu.tsx` | `?` keyboard help |
| Design tokens | `atlas/src/index.css` (lines 1–80) | Warm dark `#18120e`, accent `#d4a574`, Fraunces serif + IBM Plex Sans/Mono, full light-mode pair. **Use these. Don't invent new ones.** |
| Chapter rail | `atlas/src/components/ui/ChapterRail.tsx` | Right-side table-of-contents on wide screens. Used by Docs. |

---

## The plan — what changes, in plain English

### 1. Top nav rename: `Baseline` → `Assessments`

In `Nav.tsx`, the third nav item (currently `Baseline`) becomes `Assessments`. The route stays `/baseline` for now — only the label changes. This is the single edit that makes the assessment home the entry point for *all* assessments.

### 2. Page becomes a tab container

The current `BaselinePage.tsx` (5 lines, just renders `BaselineAssessment`) becomes the **Assessments page** — it owns the tab strip and decides which tab's content to render.

Three tabs, in this order:

- **Tab 01 — Personality** (the existing BaselineAssessment, untouched, renamed in copy only)
- **Tab 02 — Career** (the new instrument, this round's focus)
- **Tab 03 — O\*NET** (occupational exploration)

Reuses the existing `.atlas-tabs` styling. Sticky under the existing sticky top nav. The active tab expands to show its label; inactive tabs collapse to numbers (this is *already* how Atlas tabs work — verified in `index.css` line ~189). Single row on desktop, horizontal scroll fallback on narrow viewports (already styled at line 167).

### 3. Career assessment tab — what it does

Mirrors the existing `BaselineAssessment.tsx` shape exactly. Same multi-phase flow, same autosave pattern, same GSAP section transitions, same "complete → results render" model.

**Phases:**

1. **Welcome** — what this is, how long (~15–20 min), skip-anywhere notice, "Begin"
2. **Interests** — Strong-style items. Likert 1–5, ~60 items shown 6 per screen. (Strong's full instrument is 297; we use a shorter open equivalent or we license — flagged in Open Questions.)
3. **Work values** — independence / achievement / recognition / support / relationships / working conditions. ~30 items.
4. **Aptitudes** — short ICAR-style cognitive items (~16) or self-reported aptitude ratings if we want zero cognitive-load. See Open Questions.
5. **Context** — 4–6 short prompts ("what fields have you worked in," "are you open to relocation," etc.). Mirrors `CONTEXT_QUESTIONS` in the existing baseline flow.
6. **Complete** — results render. Two charts + a written summary:
   - **Interest profile** — 6 General Occupational Themes (RIASEC: Realistic, Investigative, Artistic, Social, Enterprising, Conventional) shown as a radar chart (reuse `RadarChart.tsx` if it fits)
   - **Work-values profile** — 6 dimensions shown as bars
   - **Written summary** — what the pattern suggests, in plain English

**Persistence:** localStorage autosave keyed `atlas_career_progress` (parallel to `atlas_baseline_progress`). On completion, save to Supabase (parallel to how BaselineAssessment saves its results — needs the same hookup, schema to be defined when we get to it, but the *contract* is identical).

**Time budget:** 15–20 minutes if user does it in one sitting. Pause-and-resume works (autosave makes this free).

### 4. O\*NET tab — what it is, what it isn't

This is the nuance I want to flag clearly.

**O\*NET is not an assessment the user "takes."** It's a reference database from the US Department of Labor: for any occupation, it tells you what aptitudes the work requires, what work activities it involves, what work values people in that role hold, and the role's context (e.g. physical demands, exposure to hazards). The user explores it.

**In this tab, the user can:**
- Browse occupations (free-text search + filter by RIASEC code, by industry, by "matches my interests")
- Open an occupation's profile page (a summary card, not a deep dive)
- Tag it: *target / interesting / not for me / not now*
- See which tagged occupations fit their career-assessment RIASEC score

**The tagged occupations flow into the KB** — but the KB is out of scope this round. So in this round, tagging writes to a `user_onet_targets` table (or equivalent) that's dormant until the KB round.

**Why I'm proposing tab 03 even though you said "career assessment only":** because the career assessment without O\*NET feels half-built. The user takes the assessment, gets their RIASEC, and then… can't look up "which occupations match this?" without leaving the page. O\*NET is the natural completion of the assessment experience. It's also a single-tab addition (one more sibling under `/assessments`), not a separate home.

**If you want strictly assessment-only this round**, we drop tab 03 and the assessment alone ships. Tab 03 becomes a future tab that adds itself when the user lands on it later. I'd lean toward including it because it makes the career assessment feel *finished*, but it's your call.

### 5. Docs page — what gets added

The Docs page is where Atlas documents itself (you already have this pattern: `atlas/src/pages/DocsPage.tsx` + glossary data). The new section lives under a new heading:

> **Career Assessment** (under existing "Assessments" doc heading, if there is one — to verify)

Contents:
- **What it measures** — RIASEC + work values + aptitudes, in one paragraph
- **Why these instruments** — short citations to the open-source items used (IPIP-style framing for Strong substitute; ICAR framing for aptitudes; published work-values inventories)
- **How long it takes** — 15–20 min, pause-and-resume works
- **What's done with the results** — currently: stored in your profile, available for KB/insights later. **No markets-pulse, no third-party sharing.**
- **Privacy** — your data, your Supabase row, no external transmission
- **Re-take cadence** — recommended every 12–24 months or after a major career event
- **Limitations** — short, honest: "This measures interest/values/aptitude patterns, not skills or experience. Pair with the personality baseline for a fuller picture."

Same doc shape as existing entries. Uses the existing ChapterRail for in-page anchors.

---

## What I deliberately did NOT propose

- ❌ A wizard/forced onboarding. The existing baseline pattern (welcome → optional sections → context → complete) is what the career assessment follows. User can skip any section.
- ❌ A new schema. Existing `atlas_baseline_progress` and the BigFive save pattern are the template. New code reuses the *contract*; new SQL is a copy-with-rename.
- ❌ Free-form sections in the KB. Out of scope.
- ❌ Markets pulse. Out of scope.
- ❌ Changing the cockpit. Out of scope.
- ❌ Mobile-first redesign. Existing responsive styles are reused; the new tab strip follows them.

---

## Open questions (your call)

1. **O\*NET tab in this round or next?** See §4 above. I'd include it for completeness; you may want strictly assessment-only.
2. **Strong substitute or license?** Strong Interest Inventory is proprietary (~297 items, licensed through CPP/Career Assessment Solutions at roughly $15–$25/user for online delivery, with volume discounts). Two paths:
   - **(a)** Use a Strong substitute built from open-source RIASEC items (IPIP-RIASEC proxies or Holland's Self-Directed Search, which is the open-science version). Free, defensible, ~60 items. **My recommendation.**
   - **(b)** License Strong proper. More psychometric credibility, real occupational scales (130+), but adds $ + a vendor dependency.
3. **Aptitudes — tested or self-reported?** Tested = short ICAR-style cognitive items (~16 items, ~10 min, real signal). Self-reported = "rate yourself 1–5 on numerical / verbal / spatial reasoning" (~2 min, weaker signal). Existing baseline already uses ICAR for cognitive, so tested fits the Atlas pattern.
4. **Where does the assessment live in nav?** The rename `Baseline → Assessments` is the cleanest mental model (one home for all assessments). Worth confirming before any code moves.

---

## What "done" looks like for this round

A user can:

1. Open Atlas, click **Assessments** in the top nav
2. Land on the page, see the tab strip: `01 Personality · 02 Career · 03 O*NET` (with 01 active if they have personality data, 02 active if they don't)
2. Click **Career** → see the welcome screen → begin
3. Fill interests → work values → aptitudes → context (or skip any section, leave it for later)
4. Close the tab mid-way → come back → resume where they left off (localStorage)
5. Complete → see RIASEC radar + work-values bars + written summary
6. Save → results persisted to their Supabase row
7. Switch to **O\*NET** tab → browse occupations, tag a few targets
8. Open **Docs** → read the Career Assessment page → understand what they just did and why

If you confirm scope (especially O\*NET tab in/out + Strong substitute/license + aptitudes tested/self-reported), the next step is a fresh todo list for the build itself.

---

## What I'd want from you to move

Just three decisions, and I'm building:

1. O\*NET tab — in this round, or pushed to next?
2. Strong substitute or license?
3. Aptitudes — tested (ICAR-style) or self-reported?

After those three, the build list is straightforward and the design inherits from what's already in the codebase.