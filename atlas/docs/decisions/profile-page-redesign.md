# Profile Page Redesign (agreed 2026-08-11)

## Where things go

| Section | Location | Notes |
|---------|----------|-------|
| **Career History** | Profile page (`/profile`) | Moved out of Career tab |
| **What Matters (Work Values)** | Top nav (new item) | Promoted, no dependencies |
| **Explorer** | Career tab (tab 02) | Gated on having career history |
| **Market & Action** | Career tab (tab 03) | Gated on having a chosen direction |

## Profile page structure

Horizontal numbered tabs (matching `01 Profile / 02 Explorer / 03 Market & Action` pattern):

- `01 Identity` — sigil, name, email, member stats
- `02 Career History` — ProfileBuilder (roles, skills, education, languages)
- `03 Situation` — current situation, change driver, practical conditions
- `04 Feedback` — NPS score
- `05 Account` — password, export, delete

On mobile: the tabs become a bottom nav bar with the same sections.

## Nav order

```
[Dashboard] [Baseline] [Pulse] [What Matters] [Career] [Docs]
```

The user's name (right side) links to `/profile` and is highlighted when on that page.

## Gating rules

- **Career History required** to access Explorer and Market & Action
- **Work Values** is independent — doesn't gate anything
- **Explorer completion** (chosen direction) required for Market & Action

## Data model

Keep the single `CareerDirectionData` record for now. Profile page, What Matters page, and Career tab all write to the same blob. Split later if load speed or edit isolation becomes a real problem.