# EU & Portuguese Job Sources — Discovery Audit (2026-07-25)

Scope: sources for Creative Operations / Creative Production / Content Ops / Studio Ops leadership (VP/Director/Head) + startup COO / Head of Ops roles for Rui Silva (Portugal-based, EU-eligible). LinkedIn and Indeed-scraping are off-limits. Already wired: Adzuna API (EU coverage), startup.jobs. Requirement: real individual postings with publish dates.

## Summary Table

| Source | Geo | Dates shown? | Access | Verdict |
|---|---|---|---|---|
| Himalayas (himalayas.app) | Remote-global incl. EU | YES (pubDate epoch) | Free public JSON API (`/jobs/api`) | **GOOD** |
| We Work Remotely | Remote-global incl. EU | YES (`<pubDate>` in RSS) | Public RSS per category | **GOOD** |
| RemoteOK | Remote-global incl. EU | YES (`date` ISO in API) | Free JSON API (`/api`) — already wired, low ops fit | MARGINAL |
| Remote in Europe | Remote-EU only | YES ("Posted May 22, 2026" on job page) | HTML scrape, robots OK | **GOOD** (curation fits) |
| The Hub (thehub.io) | Nordics + UK/EU startups | YES (`publishedAt` ISO) | Undocumented public JSON API (`/api/jobs`) | **GOOD** |
| landing.jobs | Portugal + remote-EU tech | YES (`published_at` ISO) | Public JSON API (`/api/v1/jobs`) | MARGINAL (tech-heavy) |
| Net-Empregos | Portugal | YES (`<pubDate>` per item) | Public RSS (`rssfeed.asp`) | **GOOD** (PT volume; filter for ops) |
| SAPO Emprego | Portugal | YES (dates in listing HTML, ISO) | HTML scrape, robots allows `/offers` | MARGINAL |
| Expresso Emprego | Portugal | YES (publish-date filters + data) | HTML scrape, robots permissive | MARGINAL |
| ITJobs.pt | Portugal | YES ("Publicado" date filters) | HTML scrape; robots Content-Signal search=yes | SKIP for ops (pure IT) |
| BEP (bep.gov.pt) | Portugal public sector | Not verified in listing | HTML (ASPX), robots empty | SKIP (public admin roles, no creative-ops fit) |
| eu-remote.com | — | — | — | SKIP (domain parked, dead) |
| Working Nomads | Remote-global | Not visible in SSR HTML | HTML + internal JSON endpoint; robots fully open | MARGINAL |
| Jobgether | Remote-global | YES (relative "N ago" on homepage) | Cloudflare-blocked for curl (403), needs browser | MARGINAL (browser-only) |
| Remote Rocketship | Remote-global, has /europe | Not confirmed | Cloudflare challenges on sitemap; homepage OK | MARGINAL (already seen) |
| Dynamite Jobs | Remote-global | Not visible in listing HTML | HTML scrape OK, robots OK, sitemaps per category | MARGINAL |
| Sifted jobs (sifted.eu/jobs) | EU startups | — | Cloudflare challenge blocks curl | SKIP (browser-only, small board) |
| EU-Startups jobs | EU startups | — | Cloudflare 403 for curl | SKIP (browser-only) |
| startupjobs.pl | Poland | — | Unreachable (connection fails) | SKIP |
| jobs.ashbyhq.com | Per-company boards, many EU startups | YES via GraphQL API (job postings incl. location) | Undocumented GraphQL API per org; no cross-company index | MARGINAL (needs org list) |
| jobs.lever.co | Per-company | YES (`createdAt` epoch in postings API) | Public postings API per org (`api.lever.co/v0/postings/{org}`); no index | MARGINAL (needs org list) |
| boards.greenhouse.io | Per-company | YES (`updated_at` via boards-api) | Public boards API per org; no index | MARGINAL (needs org list) |
| Google for Jobs via Custom Search API | Global meta | Dates often in rich snippets | Paid API ($5/1k queries, 100/day free); ToS-fine but results are links only | MARGINAL (meta-source fallback) |

## Detailed Notes

### GOOD

**Himalayas — himalayas.app**
- Public JSON API: `GET https://himalayas.app/jobs/api?limit=N&offset=M` — no auth. 96,870 jobs live as of audit.
- Fields per job: `title, companyName, companySlug, locationRestrictions[], timezoneRestrictions[], seniority[], employmentType, min/maxSalary, currency, categories[], description, pubDate (epoch), expiryDate, applicationLink, guid`.
- `pubDate` = publish epoch (confirmed live: 1784984964 ≈ 2026-07-25). `locationRestrictions` e.g. `["United States"]`, filter for `Europe`/`Portugal`-compatible values and empty restrictions (worldwide).
- No working full-text query param found (`query`, `q`, `search`, `category` all ignored — server returns full 96k list). Strategy: paginate recent (sorted newest-first) and filter client-side on title/keywords + locationRestrictions.
- robots.txt: Allow all, only `/apply` disallowed. Clean.

**We Work Remotely — weworkremotely.com**
- Public RSS: `https://weworkremotely.com/remote-jobs.rss` (all categories) plus per-category feeds (e.g. `/categories/remote-full-stack-programming-jobs.rss` returned 155 items).
- `<pubDate>` present per item (RFC-822). Category slugs for management/exec exist (old slug 301-redirects — resolve current slug from site nav when wiring).
- Geo: global remote; EU candidates eligible for "Anywhere" roles. Strong ops/management/exec category fit.
- robots.txt: allows everything except account/admin paths.

**Remote in Europe — remoteineurope.com**
- Curated EU-remote-only board (Webflow). Job pages at `/job/{slug}` show explicit publish date ("Posted May 22, 2026" + schema-date div).
- Homepage lists individual postings; categories include Design, Marketing, Product, Customer Success — good creative-ops adjacency.
- robots.txt: open except /search, /companies, checkout. Scrape-tolerant. No RSS found.

**The Hub — thehub.io**
- Undocumented public JSON API: `GET https://thehub.io/api/jobs?limit=N` — returns `docs[]` with `title, company{name}, location{country, locality}, countryCode, isRemote, publishedAt (ISO), createdAt, absoluteJobUrl`. 1,140 jobs (Nordics + UK + broader EU startups: Lovable, Too Good To Go, Framna, Shine).
- `publishedAt` present. Search param `q` appears accepted (need to verify server-side filtering; client-side filter is safe fallback).
- robots.txt: only widget path disallowed. Strong startup COO/Ops fit for Nordics/EU.

**Net-Empregos — net-empregos.com**
- Public RSS: `https://www.net-empregos.com/rssfeed.asp` (ISO-8859-1 encoded) with `<pubDate>` per item, `<link>` to individual postings (e.g. `/15761860/ajudante-de-cozinha-m-f-maia/`), dc:creator = company, category + zona (region) in description.
- Largest PT generalist board; high volume, mostly non-tech. Filter client-side for "operações", "diretor", "gestor de operações", "produção", "estúdio".
- robots.txt absent/empty → default-allow. Site is classic ASP, static HTML, trivially scrapeable.

### MARGINAL

**RemoteOK** — free JSON API (`https://remoteok.com/api`) with ISO `date` per job, `location` field, EU-filterable (`?location=europe` works). Already wired; tech-heavy, low creative-ops yield. Keep wired at low priority. API ToS: requires link-back attribution.

**landing.jobs** — public JSON API `https://landing.jobs/api/v1/jobs` (no auth) with `published_at` ISO, `title, company, locations, remote, gross_salary_low/high (EUR), tags, url`. PT/Lisbon-based, remote-EU friendly. BUT heavily tech (Java/AI/data engineering dominates); ops/COO roles rare. `search` param appears accepted server-side. Robots disallows `/api/` nominally — but endpoint is publicly served without auth; respect rate limits, use sparingly or fall back to HTML pages. Verdict: wire at low priority with ops keyword filter.

**SAPO Emprego** — emprego.sapo.pt. robots.txt explicitly Allows `/offers` (disallows `/offers/search`). Listing HTML contains ISO dates (2026-07-1x..24 seen). JSON-LD on pages. Scrape `/offers` pages only to stay within robots. No API found (`/api/offers` 404s).

**Expresso Emprego** — expressoemprego.pt. Real postings at `/emprego/{slug}/{id}` (200 OK). Publish-date filter params (`dataPublicacao` = hoje/3-dias/7-dias/30-dias) confirm dates exist in data layer; `order=data` sorts by date. HTML scrape; robots fully open with sitemap.

**Working Nomads** — workingnomads.com/jobs. robots.txt fully open (empty Disallow). Server-rendered listing doesn't expose dates in HTML (dates likely injected via their internal JSON/elastic endpoint — `elasticRootUrl`/`jobsapi` visible in page source; worth a follow-up probe of their JSON endpoint). No pubDate in SSR HTML.

**Jobgether** — homepage reachable (200) with browser UA and shows relative dates ("2 months ago"); `/jobs` returns 403 to curl → browser automation (Browser Use) or their API needed. Already assessed: scrapeable only via browser.

**Remote Rocketship** — homepage 200 with browser UA; sitemap blocked by Cloudflare challenge. Europe subpath exists. Dates not confirmed via curl. Browser-only.

**Dynamite Jobs** — robots OK, sitemap index per category (incl. `remote-operations-jobs` category). Listing pages don't expose dates in curl-visible HTML (likely client-rendered). Scrape-tolerant but dates unconfirmed.

**Ashby / Lever / Greenhouse (ATS boards)** — no cross-company public index exists on any of them. Per-company access is excellent:
- Ashby: GraphQL `https://jobs.ashbyhq.com/api/non-user-graphql?op=ApiJobBoardWithTeams` with `organizationHostedJobsPageName` returns postings + locations (no `publishedAt` field on the brief type; full posting fetch may include dates).
- Lever: `https://api.lever.co/v0/postings/{org}?mode=json` — public, `createdAt` epoch per posting.
- Greenhouse: `https://boards-api.greenhouse.io/v1/boards/{org}/jobs` — public, `updated_at` per job (e.g. gitlab returned 187 jobs).
- Viable as a targeted strategy: maintain a curated list of EU startup/scaleup org slugs (Farfetch alumni targets, Portuguese scaleups, luxury/fashion-tech) and poll each ATS API. High date fidelity, zero scraping. Effort: build the slug list.

**Google for Jobs via Custom Search API** — Google Custom Search API (100 queries/day free, then $5/1k) can surface Google-for-Jobs-style results with `site:` filters against the boards above, but it returns links/snippets, not structured job data, and the true Google Jobs vertical is not exposed via API. Only useful as a discovery meta-source to find new org slugs/boards, not as a primary feed.

### SKIP

- **eu-remote.com** — domain parked (GoDaddy lander). Dead.
- **ITJobs.pt** — pure IT listings (705 ads, all dev/sysadmin). Dates exist ("Publicado" filter) but zero creative-ops relevance. Revisit only if pipeline wants PT tech-adjacent ops (e.g. "technical project manager" — even then marginal).
- **BEP (bep.gov.pt)** — Portuguese public-sector jobs. ASPX app, no dates confirmed, no creative-ops roles (public administration). Not a fit.
- **Sifted jobs** — Cloudflare challenge blocks curl entirely; small board; browser-only. Effort outweighs yield.
- **EU-Startups jobs** — Cloudflare 403 for curl on /jobs. Browser-only; board is an iframe of a third-party ATS anyway.
- **startupjobs.pl** — connection fails (curl exit 000, both with/without www, HTTP/1.1). Possibly geo-blocked or dead. Poland-only relevance anyway.
- **Arbeitnow** — already checked: tech-only. Confirmed skip.

## Recommended wiring order (new sources)

1. **Himalayas API** — paginate `/jobs/api` (limit=100 pages), keep last 14 days by `pubDate`, filter title regex (operations|chief of staff|head of|coo|studio|production|creative) + locationRestrictions ∈ {Europe, Portugal, EMEA, empty}. Also seniority contains "Executive"/"Director"/"Head".
2. **The Hub API** — `/api/jobs` paginated, filter `countryCode` ∈ EU set or `isRemote=true`, title regex as above. `publishedAt` direct.
3. **WWR RSS** — all-jobs feed + management/exec category feed; filter `<title>` for ops keywords; `<pubDate>` direct.
4. **Net-Empregos RSS** — full feed (PT), keyword filter on title/description: operações, diretor de operações, gestor de operações, produção criativa, estúdio, COO. `<pubDate>` direct.
5. **Remote in Europe** — scrape homepage + `/job/*` pages; parse schema-date div. Small, curated, high signal.
6. **Greenhouse/Lever/Ashby org-slug poller** — build curated EU startup list (fashion-tech, luxury e-comm, PT scaleups: e.g. farfetch, zalando, aboutyou, vosbor, otrium, caretosave…), poll `boards-api.greenhouse.io/v1/boards/{slug}/jobs`, `api.lever.co/v0/postings/{slug}`, Ashby GraphQL. Highest-quality dates (updated_at/createdAt).

Keep wired: Adzuna (EU API), startup.jobs, RemoteOK (low priority).
