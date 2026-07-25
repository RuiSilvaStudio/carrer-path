#!/usr/bin/env python3
"""
Job source adapters for the career-kb pipeline.

Each fetcher returns a list of normalized job dicts:
  {title, company, location, url, source, description, posted_at (YYYY-MM-DD|None), remote (bool)}

Sources:
  API/JSON : himalayas.app, thehub.io, adzuna (via adzuna_fetch module)
  RSS      : weworkremotely.com, net-empregos.com
  Scrape   : startup.jobs, ycombinator.com/jobs, remoteineurope.com

All sources were robots.txt/ToS-audited (see discovery/job-sources-*.md, 2026-07-25).
"""
import datetime
import email.utils
import json
import re
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

UA = "career-kb-job-fetcher/1.0 (+personal job search; contact: rui)"


def _get(url, timeout=30, accept="application/json,text/html,application/rss+xml,*/*"):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": accept})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        raw = resp.read()
        enc = resp.headers.get_content_charset() or "utf-8"
        return raw.decode(enc, errors="replace")


def _strip_html(text):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", text or "")).strip()


def _iso(d):
    return d.strftime("%Y-%m-%d") if d else None


# ── Himalayas (public JSON API, 96k jobs) ─────────────────────────
def fetch_himalayas(days=30, max_pages=12):
    """Paginate newest-first; keep last `days`; filter client-side later.
    Location filter is lenient here (lane scoring does the real work) —
    drop only clearly non-EU/non-remote restrictions like single US states."""
    out = []
    cutoff = datetime.date.today() - datetime.timedelta(days=days)
    for page in range(max_pages):
        url = f"https://himalayas.app/jobs/api?limit=100&offset={page * 100}"
        try:
            data = json.loads(_get(url))
        except Exception as e:
            print(f"  [himalayas] page {page} error: {e}")
            break
        jobs = data if isinstance(data, list) else data.get("jobs", data.get("data", []))
        if not jobs:
            break
        oldest_in_page = None
        for j in jobs:
            pub = j.get("pubDate")
            d = datetime.datetime.utcfromtimestamp(pub).date() if pub else None
            if d:
                oldest_in_page = d if oldest_in_page is None else min(oldest_in_page, d)
                if d < cutoff:
                    continue
            locs = [l.lower() for l in (j.get("locationRestrictions") or [])]
            # drop only if restricted to clearly non-EU geo
            NON_EU = ("united states", "usa", "us-only", "canada", "latin america", "latam",
                      "brazil", "mexico", "argentina", "asia", "india", "africa", "australia")
            if locs and not any(any(k in l for k in ("europe", "portugal", "emea", "worldwide", "anywhere", "global", "remote")) for l in locs):
                if any(any(k in l for k in NON_EU) for l in locs):
                    continue
            out.append({
                "title": (j.get("title") or "").strip(),
                "company": (j.get("companyName") or "").strip(),
                "location": ", ".join(j.get("locationRestrictions") or []) or "Worldwide (Remote)",
                "url": j.get("applicationLink") or j.get("guid") or "",
                "source": "Himalayas",
                "description": _strip_html(j.get("description"))[:4000],
                "posted_at": _iso(d),
                "remote": True,
            })
        # stop paging once the whole page is older than the window
        if oldest_in_page and oldest_in_page < cutoff:
            break
        time.sleep(0.5)
    return out


# ── The Hub (undocumented public JSON API) ────────────────────────
def fetch_thehub(max_pages=6):
    out = []
    EU = {"pt", "gb", "uk", "nl", "de", "fr", "es", "it", "ie", "se", "dk", "no", "fi", "pl", "be", "at", "ch", "lu", "cz", "gr"}
    for page in range(max_pages):
        url = f"https://thehub.io/api/jobs?limit=100&offset={page * 100}"
        try:
            data = json.loads(_get(url))
        except Exception as e:
            print(f"  [thehub] page {page} error: {e}")
            break
        docs = data.get("docs", [])
        if not docs:
            break
        for j in docs:
            cc = (j.get("countryCode") or "").lower()
            remote = bool(j.get("isRemote"))
            if not remote and cc not in EU:
                continue
            pub = (j.get("publishedAt") or "")[:10] or None
            loc = j.get("location") or {}
            loc_str = loc.get("locality") or loc.get("country") or ("Remote" if remote else "")
            out.append({
                "title": (j.get("title") or "").strip(),
                "company": ((j.get("company") or {}).get("name") or "").strip(),
                "location": loc_str,
                "url": j.get("absoluteJobUrl") or "",
                "source": "The Hub",
                "description": _strip_html(j.get("description"))[:4000],
                "posted_at": pub,
                "remote": remote,
            })
        time.sleep(0.5)
    return out


# ── We Work Remotely (official RSS) ───────────────────────────────
WWR_FEEDS = [
    "https://weworkremotely.com/remote-jobs.rss",
    "https://weworkremotely.com/categories/remote-design-jobs.rss",
    "https://weworkremotely.com/categories/remote-management-and-finance-jobs.rss",
]


def fetch_weworkremotely():
    out, seen = [], set()
    for feed in WWR_FEEDS:
        try:
            xml_txt = _get(feed)
            root = ET.fromstring(xml_txt)
        except Exception as e:
            print(f"  [wwr] {feed} error: {e}")
            continue
        for item in root.iter("item"):
            link = (item.findtext("link") or "").strip()
            if not link or link in seen:
                continue
            seen.add(link)
            pub_raw = item.findtext("pubDate") or ""
            d = None
            try:
                d = email.utils.parsedate_to_datetime(pub_raw).date()
            except Exception:
                pass
            title = (item.findtext("title") or "").strip()
            # WWR titles are "Company: Role"
            company = ""
            if ": " in title:
                company, title = title.split(": ", 1)
            out.append({
                "title": title.strip(),
                "company": company.strip(),
                "location": "Remote",
                "url": link,
                "source": "We Work Remotely",
                "description": _strip_html(item.findtext("description"))[:4000],
                "posted_at": _iso(d),
                "remote": True,
            })
        time.sleep(0.5)
    return out


# ── Net-Empregos (PT generalist RSS, ISO-8859-1) ──────────────────
def fetch_net_empregos():
    out = []
    try:
        xml_txt = _get("https://www.net-empregos.com/rssfeed.asp")
        root = ET.fromstring(xml_txt)
    except Exception as e:
        print(f"  [net-empregos] error: {e}")
        return out
    ns = {"dc": "http://purl.org/dc/elements/1.1/"}
    for item in root.iter("item"):
        link = (item.findtext("link") or "").strip()
        pub_raw = item.findtext("pubDate") or ""
        d = None
        try:
            d = email.utils.parsedate_to_datetime(pub_raw).date()
        except Exception:
            pass
        company = (item.findtext("dc:creator", namespaces=ns) or "").strip()
        out.append({
            "title": (item.findtext("title") or "").strip(),
            "company": company,
            "location": "Portugal",
            "url": link,
            "source": "Net-Empregos",
            "description": _strip_html(item.findtext("description"))[:4000],
            "posted_at": _iso(d),
            "remote": False,
        })
    return out


# ── startup.jobs (sitemap-driven; Cloudflare blocks curl on pages) ─
STARTUPJOBS_SITEMAPS = [
    "https://startup.jobs/sitemaps/startupjobs/posts.xml.gz",
    "https://startup.jobs/sitemaps/startupjobs/posts1.xml.gz",
    "https://startup.jobs/sitemaps/startupjobs/posts2.xml.gz",
    "https://startup.jobs/sitemaps/startupjobs/posts3.xml.gz",
    "https://startup.jobs/sitemaps/startupjobs/posts4.xml.gz",
    "https://startup.jobs/sitemaps/startupjobs/posts5.xml.gz",
]

# slug keywords that signal Rui's lanes (matched against the slug text)
SLUG_LANE_HINTS = [
    "creative-operations", "design-operations", "creative-production", "content-operations",
    "content-production", "studio-operations", "brand-operations", "creative-services",
    "production-director", "head-of-production", "head-of-content", "head-of-brand-creative",
    "head-of-operations", "chief-operating-officer", "operations-director",
    "director-of-operations", "vp-operations", "vp-of-operations", "head-of-ops",
    "svp-of-operations", "avp-operations", "head-of-studio",
]

_SLUG_ANCHORS = sorted(SLUG_LANE_HINTS, key=len, reverse=True)
_SLUG_NOISE_TAIL = {
    "remote", "hybrid", "onsite", "freelance", "contract", "part", "time", "full",
    "m", "w", "d", "f", "work", "from", "anywhere", "europe", "usa", "emea", "uk", "us",
    "hrs", "week", "hrs-week",
}
_SLUG_CITIES = {
    "london", "berlin", "paris", "amsterdam", "lisbon", "madrid", "barcelona", "milan",
    "new", "york", "san", "francisco", "los", "angeles", "mitte", "nyc", "la", "sf",
    "dublin", "stockholm", "copenhagen", "hamburg", "munich", "zurich", "porto",
}
_SLUG_ROLE_WORDS = {"head", "vp", "svp", "avp", "director", "of", "operations", "coo",
                    "track", "growth", "manager", "lead", "senior", "flight"}


def _parse_slug(slug):
    """Return (title, company) from a startup.jobs slug.
    Slug: {title-words}-{company}-{numeric-id}, possibly with salary/location noise
    between title and company. Anchor on the lane phrase; title = text up to the
    anchor end (+ trailing seniority suffix like 'manager'); company = first clean
    tokens after."""
    base = re.sub(r"-\d{3,}$", "", slug)
    for a in _SLUG_ANCHORS:
        idx = base.find(a)
        if idx < 0:
            continue
        title_end = idx + len(a)
        title = base[:title_end]
        rest = base[title_end:].strip("-")
        rest_tokens = rest.split("-") if rest else []
        # title may legitimately extend: "creative-operations-manager"
        if rest_tokens and rest_tokens[0] in ("manager", "lead", "director", "head", "svp"):
            title += "-" + rest_tokens[0]
            rest_tokens = rest_tokens[1:]
        # company = first non-noise, non-city, non-role tokens (up to 3)
        comp = []
        for t in rest_tokens:
            if not t or re.match(r"^\d+k?$", t) or t in _SLUG_NOISE_TAIL or t in _SLUG_CITIES:
                continue
            if t in _SLUG_ROLE_WORDS and not comp:
                continue
            comp.append(t)
            if len(comp) == 3:
                break
        company = " ".join(comp).replace("_", " ").strip()
        return title.replace("-", " ").title(), company.title()
    return None, None


def fetch_startupjobs(days=60):
    """Sitemap-based: slugs carry title+company, lastmod gives the date.
    Posting pages are Cloudflare-blocked for curl, so we match on slugs
    and store lastmod as posted_at (approximation of publish date)."""
    out, seen = [], set()
    cutoff = datetime.date.today() - datetime.timedelta(days=days)
    for sm in STARTUPJOBS_SITEMAPS:
        try:
            xml_txt = _get(sm)  # served as plain XML despite .gz name
        except Exception as e:
            print(f"  [startup.jobs] sitemap {sm.split('/')[-1]} error: {e}")
            continue
        # entries: <url><loc>...</loc><lastmod>...</lastmod></url>
        for entry in re.finditer(r"<url>\s*<loc>([^<]+)</loc>\s*(?:<lastmod>([^<]+)</lastmod>)?", xml_txt):
            loc, lastmod = entry.group(1), entry.group(2)
            slug = loc.rstrip("/").split("/")[-1]
            if slug in seen:
                continue
            # lane hint match on slug
            if not any(h in slug for h in SLUG_LANE_HINTS):
                continue
            d = None
            if lastmod:
                try:
                    d = datetime.date.fromisoformat(lastmod[:10])
                except Exception:
                    pass
            if d and d < cutoff:
                continue
            seen.add(slug)
            title, company = _parse_slug(slug)
            if not title:
                continue
            out.append({
                "title": title,
                "company": company or "",
                "location": "",
                "url": loc,
                "source": "startup.jobs",
                "description": "",
                "posted_at": _iso(d),
                "remote": "remote" in slug,
            })
        time.sleep(0.5)
    return out


# ── YC Work at a Startup (SSR scrape, robots-tolerant) ────────────
def fetch_ycombinator():
    """Job URLs are /companies/{company}/jobs/{id}-{title-slug} — parse title
    and company from the URL itself. Listing page has no dates (relative dates
    are client-rendered), so posted_at stays None."""
    out = []
    for path in ["/jobs/role/operations/remote", "/jobs/role/operations"]:
        url = f"https://www.ycombinator.com{path}"
        try:
            html = _get(url, accept="text/html")
        except Exception as e:
            print(f"  [yc] {path} error: {e}")
            continue
        for m in re.finditer(r'/companies/([a-z0-9-]+)/jobs/([a-zA-Z0-9_-]+)', html):
            company_slug, job_slug = m.group(1), m.group(2)
            # job_slug: {id}-{title-slug}
            parts = job_slug.split("-", 1)
            title_slug = parts[1] if len(parts) > 1 else parts[0]
            title = title_slug.replace("-", " ").title()
            company = company_slug.replace("-", " ").title()
            full_url = f"https://www.ycombinator.com/companies/{company_slug}/jobs/{job_slug}"
            out.append({
                "title": title,
                "company": company,
                "location": "Remote" if "remote" in path else "",
                "url": full_url,
                "source": "YC Work at a Startup",
                "description": "",
                "posted_at": None,
                "remote": "remote" in path,
            })
        time.sleep(1.0)
    # dedupe by url
    seen, deduped = set(), []
    for j in out:
        if j["url"] not in seen:
            seen.add(j["url"])
            deduped.append(j)
    return deduped


# ── Remote in Europe (Webflow SSR scrape, robots OK) ─────────────
def fetch_remoteineurope():
    out, seen = [], set()
    try:
        html = _get("https://www.remoteineurope.com/", accept="text/html")
    except Exception as e:
        print(f"  [remoteineurope] error: {e}")
        return out
    for m in re.finditer(r'href="(/job/[a-z0-9-]+)"', html):
        if m.group(1) not in seen:
            seen.add(m.group(1))
    for slug in list(seen)[:40]:
        url = f"https://www.remoteineurope.com{slug}"
        try:
            page = _get(url, accept="text/html")
        except Exception:
            continue
        t = re.search(r"<h1[^>]*>(.*?)</h1>", page, re.S)
        # company: Webflow job pages carry it in <title> ("Role at Company | ...") or og:site_name area
        title_tag = re.search(r"<title>(.*?)</title>", page, re.S)
        company = ""
        if title_tag:
            tt = title_tag.group(1)
            m_at = re.search(r"\bat\s+([^|<]{2,50})", tt)
            if m_at:
                company = m_at.group(1).strip()
        date_m = re.search(r"Posted\s+([A-Z][a-z]+ \d{1,2}, \d{4})", page)
        d = None
        if date_m:
            try:
                d = datetime.datetime.strptime(date_m.group(1), "%B %d, %Y").date()
            except Exception:
                pass
        out.append({
            "title": _strip_html(t.group(1)) if t else slug.replace("/job/", "").replace("-", " ").title(),
            "company": company,
            "location": "Remote (Europe)",
            "url": url,
            "source": "Remote in Europe",
            "description": _strip_html(page)[:4000],
            "posted_at": _iso(d),
            "remote": True,
        })
        time.sleep(1.0)
    return out
