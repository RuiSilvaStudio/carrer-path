# Global / Remote Job Sources — Creative Ops, Production & Ops Leadership

**Purpose:** Board-by-board vetting for Rui's job pipeline (Creative Operations / Creative Production / Content Ops leadership, VP/Director/Head; startup COO/ops as secondary). EU-remote-first, non-EU acceptable only if fully remote + English. LinkedIn excluded by design.

**Verified:** 2026-07-25 (live checks: robots.txt, RSS probes, real searches for "creative operations").

## Summary Table

| Source | Dates shown? | Access | Creative-ops presence | Verdict |
|---|---|---|---|---|
| startup.jobs | Yes — relative ("2 days ago") + filters for 24h/7d/30d | Scrape-tolerant (robots allows, only /apply blocked); Algolia-backed search | HIGH — live search returned Global Head of Creative & Design Operations (Logitech), Creative & Design Operations Lead (Enova), Creative Productions Operations Manager (Parachute Home) | **GOOD** |
| himalayas.app | Yes — relative ("6 days ago", "1 month ago") | Scrape-tolerant; official RSS (/rss page) + remote jobs API (/api) + MCP server documented | HIGH — dedicated /jobs/creative-operations landing page with 29 live jobs, director/manager sub-pages | **GOOD** |
| weworkremotely.com | Yes — exact date on postings; "Latest post 15 hours ago" header | Official RSS per category (verified 200 on design + management feeds); robots allows all | LOW–MED — "creative operations" search returned 0; design + management categories worth RSS-monitoring for keyword hits | **MARGINAL** |
| ycombinator.com/jobs (Work at a Startup) | Yes — relative ("2 days ago") per posting | Scrape-tolerant (robots allows); no public API/RSS, but static listing pages work | MED — /jobs/role/operations/remote has Founding/COO-style ops roles (e.g. Founding Growth & Brand Lead); few creative-ops titles but strong startup-ops fit | **GOOD** |
| justremote.co | Yes — day+month ("25 Jul") on cards | Scrape-tolerant (only /l/ /a/ blocked) | LOW — no creative-ops search hits in top listings; has Business/Exec + Design + Project Manager categories that occasionally carry ops leads | **MARGINAL** |
| dribbble.com/jobs | Yes — "Posted N days ago" | Scrape-tolerant (robots allows /jobs; only apply endpoints blocked) | LOW–MED — design-heavy; has "Leadership" specialty filter; occasional studio/ops leads (Studio Manager, Head of Design) but few Director-of-creative-ops | **MARGINAL** |
| behance.net/joblist | Yes (on cards) — "New Job" badge seen | JS-rendered, sign-in wall on scroll; public API v2 returns 403; scraping unreliable | MED — 27 results for "creative operations" query (creative-industry fit is real) but access is painful | **MARGINAL** |
| dynamitejobs.com | Yes — "Opened N days ago" | robots allows listings (blocks /api/, /app/); pages server-rendered | LOW — 37k "matching" for the query is loose keyword match; content/marketing ops appear, few creative-ops leadership | **MARGINAL** |
| remoterocketship.com | Yes — "Date Added" sort, per-card freshness | robots permissive for /jobs; Next.js SSR pages scrapeable | MED — large DB (172k jobs) and "36% not on LinkedIn"; aggregator freshness varies, individual-card dates need per-card check | **MARGINAL** |
| workingnomads.com | Filter for posted date (Today/3d/7d); cards show dates | robots fully open; /jobs SSR; /jobs/feed is NOT RSS (HTML) | LOW — categories include Design/Marketing/Management but creative-ops leadership rare in sampling | **MARGINAL** |
| 4dayweek.io | Yes — "11h", "1d", "2d" on cards | Scrape-tolerant (robots allows /job/, blocks /api/) | LOW — niche filter (reduced-hours companies); ops leadership occasional, creative-ops nearly absent | **SKIP** (unless 4-day-week becomes a goal) |
| wellfound.com | Relative ("today") on cards | Heavily JS + Cloudflare; robots blocks many query combos; no public API/RSS | MED — startup COO/Head-of-ops volume is good, but automation-hostile | **MARGINAL** (manual/browser-only) |
| jobgether.com | Unknown (JS app) | Hostile: 403 to curl, 404 to non-browser; LinkedIn/Google OAuth wall for some flows; no RSS/API found | Unknown — could not verify listings without browser auth | **SKIP** (for pipeline; revisit via browser extension if desired) |
| nodesk.co | Relative ("3d") on cards | Scrape-tolerant (robots allows); Algolia search | LOW — 81 results sampled mostly eng/support; creative-ops rare | **SKIP** |
| remote.co | "30+ days ago" coarse labels | WordPress SSR, scrapeable | VERY LOW — search for creative operations returned 2 interpreter roles | **SKIP** |
| remotehub.com | Unknown | robots explicitly blocks /jobs/search | Unknown — board is thin and search disallowed | **SKIP** |
| ifyoucouldjobs.com (It's Nice That) | Sorted "Newest"; no per-card date seen | Scrape-tolerant static pages | MED — real creative-industry board: Studio/Resource Manager, PM luxury fashion, Design Director; London-centric, hybrid/on-site mostly | **MARGINAL** (great for agency/studio-ops radar; weak on remote) |
| peas.london | No dates on cards | Scrape-tolerant (Webflow SSR); sitemap available | MED — luxury-fashion creative agency recruiter; categories include Operations + Producer & Production; mostly London hybrid | **MARGINAL** (excellent niche fit for FARFETCH-adjacent studio/production roles; no dates = freshness risk) |
| Crypto/web3 boards (cryptocurrencyjobs.co etc.) | — | — | Irrelevant to Rui's target roles | **SKIP** |

## Per-source detail

### startup.jobs — GOOD
- Already wired into the pipeline; confirmed healthy.
- **Publish dates:** relative stamps on every card ("2 days ago", "4 weeks ago") + sidebar filters (Last 24h / 7d / 30d). Individual job page shows same relative stamp. Freshness confirmed — today's homepage full of "2 days ago".
- **Access:** robots.txt allows everything except /apply and /metrics. Server-rendered search (`/?q=creative+operations&page=N`) paginates cleanly. Algolia powers the backend; HTML scrape is sufficient.
- **Creative-ops signal:** live query returned Global Head of Creative & Design Operations (Logitech, hybrid San Jose — posted 2 weeks ago), Creative & Design Operations Lead (Enova), Creative Productions Operations Manager (Parachute Home, LA). Verdict: one of the best title-match sources for this niche despite startup branding.

### himalayas.app — GOOD
- **Publish dates:** relative on every card ("6 days ago", "23 days ago", "1 month ago").
- **Access:** robots allows all except /apply. Official free RSS documented at himalayas.app/rss, public jobs API documented at /api, even an MCP server at /mcp. Sitemaps per category/location. Most automation-friendly board in this list.
- **Creative-ops signal:** dedicated landing page /jobs/creative-operations with 29 jobs + sub-pages by seniority (senior-, manager-, director-, executive-creative-operations). Roles seen: Director, Creative Operations (Kettle, $150–180K, US-only); Creative Producer / Creative Operations Manager (Paired, remote). Caveat: many are US- or LatAm-only — need "worldwide/Europe" location filter.

### weworkremotely.com — MARGINAL
- **Publish dates:** exact publish date on each posting; header shows "Latest post 15 hours ago". Time filters (24h/week/2 weeks).
- **Access:** official RSS feeds per category — verified 200: /remote-jobs.rss, /categories/remote-design-jobs.rss, /categories/remote-management-and-finance-jobs.rss. RSS items carry title, region, category, description.
- **Creative-ops signal:** direct "creative operations" search returned zero today. Strategy: subscribe design + management RSS and keyword-filter for "operations / production / studio / creative ops".

### ycombinator.com/jobs — GOOD
- **Publish dates:** relative per posting ("2 days ago", "8 days ago", "11 days ago").
- **Access:** robots allows /jobs; static server-rendered listing pages. No official API/RSS, but pages scrape cleanly (verified). Application flow requires YC account — fine, we only need discovery.
- **Creative-ops signal:** /jobs/role/operations/remote listing is alive (Founding Growth & Brand Lead, ops specialists at S23/W23 companies). Creative-ops titles are rare, but this is the best source for the secondary target (startup COO / Head of Ops / Founding ops). EU-remote roles exist (e.g. Rollstack hiring PT/GB remote).

### justremote.co — MARGINAL
- **Publish dates:** "25 Jul" style on every card.
- **Access:** robots blocks only /l/ and /a/; listing pages are SSR.
- **Creative-ops signal:** low direct title match; Business/Exec and Project Manager categories occasionally carry Head of Design / ops leads (e.g. Gusto Head of Design seen today). Worth a weekly keyword scan.

### dribbble.com/jobs — MARGINAL
- **Publish dates:** "Posted 1 day ago" etc.
- **Access:** robots allows /jobs (blocks apply_now + social routes). SSR listing pages.
- **Creative-ops signal:** heavily IC design roles; "Leadership" specialty filter exists. Studio Manager / ops-leadership appears occasionally but Director Creative Operations is rare. Use as low-frequency radar only.

### behance.net/joblist — MARGINAL
- **Publish dates:** cards show "New Job" badges and dates on detail pages.
- **Access:** JS-rendered; login wall on scroll; public v2 API returns 403 without key. Not pipeline-friendly — browser/manual only.
- **Creative-ops signal:** 27 results for "creative operations" — the creative-industry audience makes hit quality decent when reachable. Keep as manual weekly check, not automated.

### dynamitejobs.com — MARGINAL
- **Publish dates:** "Opened 3 days ago" per card.
- **Access:** robots blocks /api/ /app/ only; listing pages SSR and scrapeable; sitemaps provided.
- **Creative-ops signal:** loose keyword matching inflates counts (37k "matches"); real content-ops / marketing-ops roles exist, but creative-ops leadership is thin and salaries skew low/LatAm-focused.

### remoterocketship.com — MARGINAL
- **Publish dates:** "Date Added" sort; per-card dates on detail pages; "19,193 new jobs this week" freshness counter.
- **Access:** robots allows /jobs + /company pages (blocks account/onboarding routes); Next.js SSR scrapeable.
- **Creative-ops signal:** 172k-job aggregator, 36% claimed not on LinkedIn — useful as a dedupe/catch-all layer. Aggregator risk: stale or re-posted listings; must verify date on the card, not the scrape date.

### workingnomads.com — MARGINAL
- **Publish dates:** posted-date filter (Today / 3d / 7d); dates on cards.
- **Access:** robots fully open (Disallow: empty); /jobs SSR; no RSS (the /jobs/feed URL returns HTML, not XML).
- **Creative-ops signal:** low — category mix skews dev/support. Skip automation unless a keyword alert proves yield.

### 4dayweek.io — SKIP
- Dates on cards ("11h", "1d") and robots allows /job/, but the 4-day-week filter makes the addressable set tiny and creative-ops leadership nearly absent. Revisit only if Rui explicitly wants reduced-hours companies.

### wellfound.com — MARGINAL (manual only)
- Relative dates ("today") on cards. Content quality for startup COO/Head-of-ops is high (130k startup jobs), but Cloudflare + heavy JS + robots disallows on query-string combos make scraping fragile. No API/RSS. Recommend manual weekly browse or browser-automation with care.

### jobgether.com — SKIP
- Hostile to automation: 403 for curl on /en/jobs, 404 for the marketing-page URL pattern, robots.txt unreachable ("Forbidden"), login via LinkedIn/Google promoted. No RSS/API discovered. Not worth the effort given alternatives.

### nodesk.co — SKIP
- Open robots and SSR, relative dates ("3d"), but sampled 81 listings were dev/support/gig-heavy. Creative-ops presence effectively nil.

### remote.co — SKIP
- "Creative operations" search returned 2 interpreter roles. Coarse "30+ days ago" labels. Not a fit.

### remotehub.com — SKIP
- robots.txt explicitly Disallows /jobs/search; thin inventory; category URL returned 404 content. Disqualified.

### ifyoucouldjobs.com — MARGINAL
- It's Nice That's creative-industry board. Real postings (Studio/Resource Manager, PM luxury fashion, Design Director, Marketing Manager Bloomsbury). Sorted by newest but no per-card publish date visible — freshness must be inferred from order. Mostly London on-site/hybrid; low remote yield. Good radar for studio-ops leadership; weak for remote-first.

### peas.london — MARGINAL
- Luxury-fashion creative recruiter (directly adjacent to FARFETCH world). Categories include Operations, Producer & Production, Director, C-Suite levels. No publish dates on cards — freshness unverifiable from listing; sitemap exists. Mostly London/hybrid. Worth a manual weekly glance for Head of Production / Studio Director briefs; recruiter relationship likely beats scraping here.

### Crypto/web3 boards — SKIP
- Out of scope for creative-ops/production leadership in luxury/fashion/e-comm. (nodesk cross-promotes cryptocurrencyjobs.co; ignored.)

## Recommended wiring (priority order)

1. **Automated, high yield:** startup.jobs (already wired), himalayas.app (RSS/API), weworkremotely category RSS (design + management, keyword-filtered), ycombinator.com/jobs/role/operations/remote (weekly scrape).
2. **Automated, low yield / dedupe layer:** remoterocketship (verify per-card dates), justremote, dynamitejobs, dribbble (Leadership filter).
3. **Manual weekly:** wellfound, behance joblist, ifyoucouldjobs, peas.london.
4. **Dropped:** jobgether, nodesk, remote.co, remotehub, 4dayweek, crypto boards.

## Notes for the pipeline
- "Publish date available" everywhere except peas.london (no dates) and ifyoucouldjobs (order-only).
- For aggregators (remoterocketship, workingnomads, dynamitejobs), always store the *posting's* date, never the scrape date, and dedupe against startup.jobs/himalayas by canonical URL or company+title.
- Location filtering matters more than keyword filtering on himalayas/remoterocketship — both index many US-only or LatAm-only creative-ops roles; Rui needs Europe/worldwide-remote only.
