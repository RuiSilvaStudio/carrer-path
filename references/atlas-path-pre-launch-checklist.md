# Atlas Path — Pre-Launch Checklist

## Status Key
- `pending` — not started
- `in_progress` — active work
- `completed` — done and verified
- `blocked` — waiting on dependency/decision

---

## 1. Stable staging environment
Status: completed
Goal: A separate staging deployment that mirrors production without affecting live users.
Notes:
- Done 2026-08-02. staging branch → atlas.ruisilvastudio.com (Vercel-protected), main → atlaspath.eu. Promote via PR (branch protection on main).
- Gotcha logged: env vars must be ticked for BOTH Preview and Production in Vercel — preview-only vars made staging work while prod crashed.

## 2. Regression gates preventing data loss
Status: completed
Goal: Automated checks that catch profile/enrichment loss before deploy.
Notes:
- Done 2026-08-03. vitest with 11 regression tests covering:
  - Profile field preservation through normalisation
  - CV extraction → profile conversion (no dropped fields)
  - Enrichment field preservation (skill overlap, gaps, ratings, bullets)
  - Career direction V1 → V2 stage migration
  - Staleness detection (explorer, brief, market)
- Build + lint + test gate runs before every merge (`npm run build && npm run test`).
- Future improvement: database roundtrip tests (save → fetch → verify). Not a launch blocker for a small test group — unit tests already catch the most common data-loss bugs in transformation logic.

## 3. Analytics for flow completion tracking
Status: completed
Goal: Know whether users complete the intended flow and where they drop off.
Notes:
- `analytics_events` table with RLS (owner-only, fire-and-forget `track()`).
- Funnel events: signup → profile completion → direction generated → brief opened → return visit.
- Privacy-safe: no third-party analytics, no cookies, no PII beyond user_id.
- Auto-retention: events purged after 24 months via `purge_old_analytics_events()`.

## 4. User feedback pipeline
Status: completed
Goal: Collect structured user feedback without disrupting the workflow.
Notes:
- `feedback_events` table with laddered feedback across 6 surfaces (insight, pulse, direction, docs, baseline, nps).
- Boolean, dropdown, ranking, text, and dismiss kinds supported.
- `feedback_summary` view for aggregate analysis.
- Auto-retention: events purged after 24 months via `purge_old_feedback_events()`.

## 5. SEO-ready landing page
Status: pending
Goal: Basic discoverability and correct metadata for atlaspath.eu.
Notes:
- Meta tags, semantic HTML, OG image, sitemap.
- Landing content must match Atlas Path positioning.

## 6. GitHub repo review + privacy
Status: in_progress
Goal: Private repo, no secrets in history, maintain access.
Notes:
- Repo is private. Old cloud Supabase credentials remain in legacy files (`supabase-config.js`, `scripts/*.py`) — these reference the now-decommissioned cloud project and will be cleaned up.
- Legacy CDN config files (`supabase-config.js`, `atlas/public/supabase-config.js`) still point to old cloud Supabase — to be removed or updated.
- No active credentials exposed: cloud Supabase project is decommissioned, self-hosted credentials are in env vars only.

## 7. GDPR compliance
Status: completed
Goal: EU-ready legal and data-handling baseline.
Notes:
- Privacy policy live at `atlaspath.eu/privacy` (13 sections, accessible logged in and logged out).
- Delete account: Profile → type "DELETE" → edge function cascades to all tables (hard delete, not soft).
- Export all data: Profile → "Download all my data" → 7 CSV files (assessments, career profile, contacts, contact log, job listings, feedback, analytics).
- Individual record deletion: baseline, pulses, contacts, job listings all have hard-delete with confirmation modals.
- No cookie consent banner needed — only essential session cookie, no third-party tracking.
- No terms of service yet — not required for free tool with no user-generated public content.

## 8. Sovereign EU infrastructure
Status: completed
Goal: No US company in the user data path.
Notes:
- LLM: self-hosted Ollama (Qwen 2.5 7B) on Prod server, exposed via `llm.ruisilvastudio.com` (API key auth).
- Database + Auth: self-hosted Supabase on Prod server, exposed via `supabase.ruisilvastudio.com`.
- Both proxied through Cloudflare Tunnel → Prod server (192.168.1.229).
- Frontend: Vercel (static files only, no user data). DNS + tunnel: Cloudflare (via Cloudflare Tunnel).
- Daily Postgres backups at 2am, 7-day retention.
- Full infra details: see `atlas-path-operational-playbook.md` → Sovereign Infrastructure.

## 9. Atlas Path brand/UI-UX documentation
Status: in_progress
Goal: Single source of truth for theme, tone, layout rules, and component behavior.
Notes:
- Design tokens documented in `atlas-design-system` skill.
- Keep tokens/rules in one place.
- Use as review checklist for visual/UX changes.

---

## Execution rule
Work on exactly one item at a time, verify it, then move to the next.
