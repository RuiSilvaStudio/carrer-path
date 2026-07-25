#!/usr/bin/env python3
"""
Multi-source job fetcher — the twice-weekly pipeline entry point.

Flow:
  1. Fetch all sources (API/RSS/scrape adapters in job_sources.py + Adzuna)
  2. Filter + score against the KB keyword profile
  3. Dedupe (title+company) and insert new listings into Supabase
  4. Expiry check: HEAD every existing listing's URL; auto-dismiss 404/closed
     (only for status='New' — anything Rui touched is never modified)

Usage:
  python3 scripts/job_fetch_all.py            # full run (fetch + insert + expiry)
  python3 scripts/job_fetch_all.py --dry-run  # fetch + score, no DB writes
  python3 scripts/job_fetch_all.py --expiry-only  # just the expiry pass

Env: ADZUNA_APP_ID/ADZUNA_APP_KEY from .env; SUPABASE_DB_PASSWORD from env.
"""
import argparse
import datetime
import html as html_lib
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from job_sources import (  # noqa: E402
    fetch_himalayas, fetch_thehub, fetch_weworkremotely,
    fetch_net_empregos, fetch_startupjobs, fetch_ycombinator, fetch_remoteineurope,
)

CAREER_KB = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RUI_USER_ID = "37d25257-5fcf-4318-b1b6-5bdb48288a71"
MIN_SCORE = 0.30

# Reuse the exact scoring profile from adzuna_fetch.py
from adzuna_fetch import WEIGHTED_KWS, NEGATIVE, LEADERSHIP, load_env, score_job  # noqa: E402

# Portuguese lane anchors live in LANE_CORE below; PT_KWS kept for reference.
PT_KWS = {}


def passes_leadership_filter(title, description):
    """Skip obvious IC/junior roles before scoring."""
    t = title.lower()
    if any(n in t for n in NEGATIVE):
        return False
    return True


# ── Lane-based scoring (two target lanes, not one keyword soup) ───
LANE_CORE = {
    "creative_ops": [
        "creative operations", "design operations", "creative production",
        "content operations", "content production", "studio operations",
        "brand operations", "creative services", "production director",
        "head of production", "head of content", "head of brand creative",
        "digital asset management", "content supply chain",
        "diretor de operações", "director de operações", "produção criativa",
        "gestor de operações", "diretor criativo", "director criativo",
    ],
    "startup_ops": [
        "head of operations", "chief operating officer", "coo",
        "vp of operations", "vp operations", "director of operations",
        "operations director", "head of ops", "founding operations",
        "general manager", "managing director",
    ],
}
# Roles that look ops-y but aren't Rui's lanes
LANE_POISON = [
    "revenue operations", "sales operations", "revops", "payroll",
    "accounting", "finance", "facility", "it operations", "devops",
    "security officer", "alliance manager", "analyst relations",
    "data center", "google ads", "media buyer", "technical program manager",
    "product design", "product manager", "engineering director",
    "customer care", "technical lead", "field technical",
]


def lane_score(title, company, location, description):
    """Score against the two lanes. Returns (score, reasons) or (0, 'no lane match').
    A job must hit a lane anchor to score at all."""
    text = f"{title} {company} {description}".lower()
    title_l = title.lower()

    # Poison check — kills non-fit roles regardless of other keywords
    if any(p in title_l for p in LANE_POISON):
        return 0.0, "Poison title (non-fit role type)"

    # Normalize separators so "&" doesn't break anchors ("creative & design operations")
    title_norm = title_l.replace("&", "and")

    lane = None
    anchor = None
    for lane_name, anchors in LANE_CORE.items():
        for a in anchors:
            if a in title_l or a in title_norm:
                lane, anchor = lane_name, a
                break
        if lane:
            break
    # creative_ops anchors can also match in body for strong titles like "Director"
    if not lane:
        for a in LANE_CORE["creative_ops"]:
            if a in text and any(s in title_l for s in LEADERSHIP):
                lane, anchor = "creative_ops", a
                break

    if not lane:
        return 0.0, "No lane anchor"

    # Base: lane anchor in title
    pts = 8.0 if anchor in title_l else 5.0
    reasons = [f"lane: {lane}"]

    # Seniority
    if "svp" in title_l or "vp" in title_l or "chief" in title_l or "coo" in title_l:
        pts += 4
        reasons.append("C-level/VP")
    elif "head" in title_l or "director" in title_l:
        pts += 3
        reasons.append("Head/Director")
    elif "lead" in title_l or "senior manager" in title_l or "manager" in title_l:
        pts += 1.5
        reasons.append("Lead/Manager")

    # Domain richness from the KB profile (reuse the existing weighted map)
    domain_hits = []
    for kw, w in WEIGHTED_KWS.items():
        if kw in text and kw not in LANE_CORE["creative_ops"] and kw not in LANE_CORE["startup_ops"]:
            pts += min(w, 2.0)
            if w >= 1.5 and len(domain_hits) < 5:
                domain_hits.append(kw.strip())
    if domain_hits:
        reasons.append("domain: " + ", ".join(domain_hits))

    # Geo
    loc_l = (location or "").lower()
    if "portugal" in text:
        pts += 2
        reasons.append("Portugal")
    elif any(k in loc_l for k in ("europe", "emea", "remote", "worldwide", "anywhere")):
        pts += 1.5
        reasons.append("EU/remote")

    s = max(0.0, min(1.0, pts / 25.0))
    return round(s, 3), "; ".join(reasons)


def fetch_adzuna_all(env):
    """Reuse adzuna_fetch machinery across all its countries/queries."""
    from adzuna_fetch import adzuna_search, normalize, COUNTRIES, QUERIES, MAX_PAGES_PER_QUERY
    app_id = env.get("ADZUNA_APP_ID")
    app_key = env.get("ADZUNA_APP_KEY")
    if not app_id or not app_key:
        print("  [adzuna] missing creds, skipping")
        return []
    out, seen = [], set()
    for country in COUNTRIES:
        for query in QUERIES:
            for page in range(1, MAX_PAGES_PER_QUERY + 1):
                try:
                    data = adzuna_search(app_id, app_key, country, query, page)
                except Exception as e:
                    print(f"  [adzuna] {country}/{query}/p{page}: {e}")
                    time.sleep(2)
                    continue
                results = data.get("results", [])
                if not results:
                    break
                for job in results:
                    rec = normalize(job, country, query)
                    if not rec["title"] or not rec["url"] or rec["url"] in seen:
                        continue
                    seen.add(rec["url"])
                    out.append({
                        "title": rec["title"], "company": rec["company"],
                        "location": rec["location"], "url": rec["url"],
                        "source": f"Adzuna ({country})",
                        "description": rec["description"], "posted_at": rec["posted_at"],
                        "remote": "remote" in rec["location"].lower(),
                    })
                time.sleep(0.4)
    return out


def canonical_url(url):
    """Strip tracking params (Adzuna ?se=, utm_*) so the same ad fetched via
    different queries/countries dedupes correctly."""
    if not url:
        return url
    url = re.sub(r"[?&]se=[^&]+", "", url)
    url = re.sub(r"[?&]utm_[^&]+", "", url)
    return url.rstrip("?&")


def dedupe_best(candidates):
    best = {}
    for r in candidates:
        tkey = re.sub(r"[^a-z0-9 ]", "", (r["title"] or "").lower())[:60]
        ckey = re.sub(r"[^a-z0-9]", "", (r["company"] or "").lower())[:25]
        key = (tkey, ckey)
        if key not in best or r["match_score"] > best[key]["match_score"]:
            best[key] = r
    return sorted(best.values(), key=lambda r: r["match_score"], reverse=True)


def db_connect():
    pw = os.environ.get("SUPABASE_DB_PASSWORD") or load_env().get("SUPABASE_DB_PASSWORD")
    if not pw:
        sys.exit("Set SUPABASE_DB_PASSWORD (env or .env).")
    import psycopg2
    conn = psycopg2.connect(
        host="db.ncwtmagvjtpqnwroyuha.supabase.co", port=5432, dbname="postgres",
        user="postgres", password=pw, connect_timeout=15,
    )
    conn.autocommit = True
    return conn


def expiry_pass(conn, dry_run=False):
    """HEAD-check every 'New' listing URL; auto-dismiss dead ones."""
    cur = conn.cursor()
    cur.execute(
        "select id, url, title from job_listings where user_id=%s and status='New' and url <> ''",
        (RUI_USER_ID,),
    )
    rows = cur.fetchall()
    dead, checked = [], 0
    for jid, url, title in rows:
        checked += 1
        status = None
        try:
            req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "career-kb-expiry-check/1.0"})
            with urllib.request.urlopen(req, timeout=15) as resp:
                status = resp.status
        except urllib.error.HTTPError as e:
            status = e.code
        except Exception:
            status = None  # network error — leave alone (conservative)
        if status in (404, 410):
            dead.append((jid, title[:60]))
        time.sleep(0.3)
    dismissed = 0
    if not dry_run:
        for jid, _ in dead:
            cur.execute(
                "update job_listings set status='Dismissed', notes = trim(both from coalesce(notes,'') || ' [auto-dismissed: posting expired ' || %s || ']') where id=%s",
                (datetime.date.today().isoformat(), jid),
            )
            dismissed += cur.rowcount
    print(f"  expiry: checked {checked}, dead {len(dead)}, dismissed {dismissed}")
    for jid, t in dead:
        print(f"    DEAD #{jid}: {t}")
    return dead


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--expiry-only", action="store_true")
    args = ap.parse_args()

    env = load_env()
    os.environ.setdefault("ADZUNA_APP_ID", env.get("ADZUNA_APP_ID", ""))
    os.environ.setdefault("ADZUNA_APP_KEY", env.get("ADZUNA_APP_KEY", ""))

    if args.expiry_only:
        conn = db_connect()
        expiry_pass(conn, dry_run=args.dry_run)
        conn.close()
        return

    SOURCES = [
        ("Himalayas", fetch_himalayas),
        ("The Hub", fetch_thehub),
        ("We Work Remotely", fetch_weworkremotely),
        ("Net-Empregos", fetch_net_empregos),
        ("startup.jobs", fetch_startupjobs),
        ("YC", fetch_ycombinator),
        ("Remote in Europe", fetch_remoteineurope),
        ("Adzuna", lambda: fetch_adzuna_all(env)),
    ]

    all_jobs, per_source = [], {}
    for name, fn in SOURCES:
        try:
            jobs = fn()
        except Exception as e:
            print(f"[{name}] FAILED: {e}")
            jobs = []
        per_source[name] = len(jobs)
        for j in jobs:
            # unescape HTML entities in title/company (e.g. "&amp;" → "&")
            if j.get("title"):
                j["title"] = html_lib.unescape(j["title"]).strip()
            if j.get("company"):
                j["company"] = html_lib.unescape(j["company"]).strip()
        all_jobs.extend(jobs)
        print(f"[{name}] {len(jobs)} raw postings")

    # Filter + score (lane-based: must anchor to a target lane to score)
    candidates = []
    for j in all_jobs:
        if not j.get("title") or not j.get("url"):
            continue
        if not passes_leadership_filter(j["title"], j.get("description", "")):
            continue
        s, reasons = lane_score(j["title"], j.get("company", ""), j.get("location", ""), j.get("description", ""))
        if s < MIN_SCORE:
            continue
        j["match_score"] = s
        j["match_reasons"] = reasons
        candidates.append(j)

    candidates = dedupe_best(candidates)

    # Cap per source per run: keep the mix balanced so one high-volume
    # source (startup.jobs ~290) can't swamp the others.
    PER_SOURCE_CAP = 40
    by_source = {}
    for r in candidates:
        by_source.setdefault(r["source"], []).append(r)
    capped = []
    for src, rows in by_source.items():
        rows.sort(key=lambda r: r["match_score"], reverse=True)
        capped.extend(rows[:PER_SOURCE_CAP])
    candidates = sorted(capped, key=lambda r: r["match_score"], reverse=True)
    print(f"\nTotal raw: {len(all_jobs)} | above threshold after dedupe: {len(candidates)}")
    for r in candidates[:30]:
        print(f"  {r['match_score']:.3f} | {r['title'][:55]} @ {r.get('company','')[:22]} | {r['source'][:18]} | {r.get('posted_at')}")

    if args.dry_run:
        out = os.path.join(CAREER_KB, ".audit-tmp", "fetch-all-dry-run.json")
        json.dump({"per_source": per_source, "candidates": candidates}, open(out, "w"), indent=2)
        print(f"\nDry run — wrote {out}")
        return

    conn = db_connect()
    cur = conn.cursor()

    # Canonicalize URLs in-table first (strip tracking params) so on-conflict
    # dedupe works against previously-inserted tracking-laden URLs.
    cur.execute(
        "update job_listings set url = regexp_replace(url, '[?&](se|utm_[^=]+)=[^&]+', '', 'g') where user_id=%s and url ~ '[?&](se|utm_)='",
        (RUI_USER_ID,),
    )
    cleaned = cur.rowcount
    if cleaned:
        print(f"Canonicalized {cleaned} existing URLs")

    inserted = 0
    for r in candidates:
        r["url"] = canonical_url(r["url"])
        cur.execute(
            """
            insert into public.job_listings
              (user_id, title, company, location, url, source, description, posted_at, match_score, match_reasons, status)
            values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'New')
            on conflict (user_id, url) where url <> '' do nothing
            """,
            (RUI_USER_ID, r["title"], r.get("company", ""), r.get("location", ""), r["url"],
             r["source"], r.get("description", "")[:4000], r.get("posted_at"),
             r["match_score"], r["match_reasons"]),
        )
        inserted += cur.rowcount
    print(f"\nInserted {inserted} new listings")

    expiry_pass(conn)

    cur.execute("select count(*) from job_listings where user_id=%s", (RUI_USER_ID,))
    row = cur.fetchone()
    print(f"Table total: {row[0] if row else 0}")
    conn.close()


if __name__ == "__main__":
    main()
