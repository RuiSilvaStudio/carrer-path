# Atlas Work Values Instrument — design specification

Research conducted 2026-07-31. Full instrument research (Minnesota TWA, MIQ, PathwayU, O*NET WIL): see `references/career-assessment-instruments.md` in the career-coaching skill.

## Theory base

Minnesota Theory of Work Adjustment (Dawis & Lofquist, 1984). 20-21 vocational needs → 6 work values. Person-environment fit: correspondence between individual's needs/values and occupational reinforcers predicts satisfaction. Values stability ρ = .69 (Jin & Rounds, 2012 meta-analysis). P-E fit predicts satisfaction AND persistence (Kristof-Brown et al., 2005 meta-analysis).

## Format: Two-phase hybrid

### Phase 1 — Comparative ranking (ipsative)
- 20-21 need statements in balanced incomplete blocks of 5
- Each statement appears in exactly 5 blocks; every pair co-occurs in exactly one block
- Respondent rank-orders 5 statements within each block (drag-to-reorder, no typing)
- 21 blocks × 5 items = ~5-7 min
- Produces: relative priority profile + circular triad consistency check (coefficient of consistency; flag if < 0.50)

### Phase 2 — Absolute rating (normative)
- Each of the 20-21 need statements rated individually on 5-point importance scale
- 5 = Essential (non-negotiable), 4 = Important (strongly prefer), 3 = Desirable (can flex), 2 = Neutral, 1 = Unimportant (prefer opposite)
- Tap-to-select, no typing
- ~3-4 min
- Produces: absolute intensity scores (solves the "everything is important" Likert skew)

### Why both phases
- Phase 1 alone: relative priority only — can't tell if "most important" means "essential" or "slightly more than others"
- Phase 2 alone: everyone rates everything "important" — negative skew, lose relative priority
- Both: rank order + intensity. This is the original MIQ dual-scoring design.

## The 21 need statements — Atlas wording (senior audience)

Each statement is a structured item. No free-text fields anywhere in the flow.

| # | Atlas wording | MIQ original | Value |
|---|---|---|---|
| 1 | The work lets me fully use my strongest professional abilities | I make use of my abilities | Achievement |
| 2 | The work delivers tangible outcomes I can take pride in | Feeling of accomplishment | Achievement |
| 3 | The role demands sustained intensity and full engagement | I could be busy all the time | Working Conditions |
| 4 | There is clear room for career progression and greater responsibility | Opportunity for advancement | Recognition |
| 5 | I can set direction and guide how others work | Give directions and instructions to others | Recognition |
| 6 | The organization acts with fairness and integrity in how it treats people | Treated fairly by the company | Support |
| 7 | Compensation reflects the value I bring relative to the market | Pay would compare well with other workers | Working Conditions |
| 8 | I work alongside people I respect and genuinely collaborate well with | Co-workers easy to get along with | Relationships |
| 9 | I can originate and test new approaches, not just execute established ones | I could try out my own ideas | Independence |
| 10 | I can work independently when I need to focus deeply | I could work alone | Working Conditions |
| 11 | The work never requires me to act against my professional ethics or conscience | Never pressured against conscience | Relationships |
| 12 | My contributions are visible and acknowledged by decision-makers | Receive recognition for the work I do | Recognition |
| 13 | I have authority to make consequential decisions without seeking approval | I could make decisions on my own | Independence |
| 14 | The role offers stability and continuity — not constant restructuring | The job would provide steady employment | Working Conditions |
| 15 | The work creates meaningful impact for others — customers, society, teams | I could do things for other people | Relationships |
| 16 | The role carries professional standing and credibility in my field or industry | I would be looked up to by others | Recognition |
| 17 | Leadership backs the team — sponsors, protects, and removes obstacles | Supervisors who back up workers with management | Support |
| 18 | Leadership invests in developing people and builds capability deliberately | Supervisors who train workers well | Support |
| 19 | The work varies enough to stay intellectually stimulating across time | I could do something different every day | Working Conditions |
| 20 | The working environment — physical, digital, operational — is well-resourced | The job would have good working conditions | Working Conditions |
| 21 | I can shape how my work is planned and executed with minimal oversight | I could plan my work with little supervision | Independence |

Note: Item 16 was dropped in O*NET WIL to simplify paper scoring. In a digital instrument there's no scoring constraint, and for senior audiences, professional standing is a genuine differentiator. Restored to give Recognition a fourth item and improve internal consistency.

## Value structure (O*NET WIL labels, what PathwayU uses)

| Value | Needs | Captures |
|---|---|---|
| Achievement | 1, 2 | Ability use, accomplishment |
| Independence | 9, 13, 21 | Creativity, decisions, autonomy |
| Recognition | 4, 5, 12, 16 | Advancement, authority, recognition, standing |
| Relationships | 8, 11, 15 | Co-workers, ethics, service |
| Support | 6, 17, 18 | Company policies, supervision quality |
| Working Conditions | 3, 7, 10, 14, 19, 20 | Activity, pay, focus, security, variety, conditions |

## Scoring

### Per-need scores
- Rank score (0-1): average position across 5 blocks, normalized
- Intensity score (1-5): from Phase 2 rating
- Combined = (rank_score × 2 - 1) × intensity_score

### Per-value scores
- value_score = average(combined_need_scores for all needs in that value)
- Normalized to 0-100 for display

### Consistency check
- circular_triads = count of A>B, B>C, C>A patterns across all possible triads
- coefficient_of_consistency = 1 - (circular_triads / total_possible_triads)
- ≥ 0.80: high consistency; 0.50-0.79: moderate (flag); < 0.50: low (warn)

## Block design

(21, 5, 1)-balanced incomplete block design. Generated algorithmically using cyclic development from a base block. Block order and within-block order randomized per respondent to prevent position bias. Server-side generation.

## What the user never sees

- No mention of "Minnesota," "MIQ," "TWA," "RIASEC," "Holland," "psychometric," "assessment," or "test"
- No clinical or diagnostic language
- No free-text fields anywhere
- No "right" or "wrong" answers
- All interactions: drag-to-rank (Phase 1), tap-to-select (Phase 2), tap-to-edit (review)

## Total user time

| Phase | Screens | Est. time |
|---|---|---|
| Phase 1: Comparative ranking | 21 blocks × 5 cards | 5-7 min |
| Phase 2: Absolute rating | 20-21 items | 3-4 min |
| Review & adjust | 1 profile screen | 2 min |
| **Total** | | **~10-13 min** |

## Scientific backing

| Property | Source |
|---|---|
| Ipsative scoring | MIQ MRO5 design (Rounds, Miller & Dawis, 1978) |
| Normative scoring | MIQ absolute-zero section |
| Circular triad detection | MIQ consistency check (coefficient of consistency) |
| Balanced incomplete block design | MIQ MRO5 combinatorial structure |
| Value stability ρ = .69 | Jin & Rounds (2012) meta-analysis |
| P-E fit predicts satisfaction & persistence | Kristof-Brown et al. (2005) meta-analysis |
| 20 needs → 6 values | Dawis & Lofquist (1984), factor-analyzed |
| O*NET WIL value labels user-tested | McCloy et al. (1999), PathwayU adoption |

## Output profile

6 work values ranked, each with 0-100 score. Plain-English interpretation per value (not labels like "you are Type X"). User can edit any individual rating and see profile recalculate.
