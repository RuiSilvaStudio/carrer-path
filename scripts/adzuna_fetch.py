#!/usr/bin/env python3
"""
Adzuna → Supabase job_listings backfill.

Fetches roles matching Rui's KB target titles (Creative Ops / Production /
Content Ops / startup ops leadership) across Adzuna's European markets,
scores them against the KB keyword profile, dedupes against existing
listings, and inserts new ones.

Usage:
    python3 scripts/adzuna_fetch.py            # fetch + insert
    python3 scripts/adzuna_fetch.py --dry-run  # fetch + score, print only

Reads ADZUNA_APP_ID / ADZUNA_APP_KEY from career-kb/.env.
DB password comes from the same place migrations get it (prompt or env SUPABASE_DB_PASSWORD).
"""
import argparse
import datetime
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

# ── Config ────────────────────────────────────────────────────────
CAREER_KB = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(CAREER_KB, ".env")
RUI_USER_ID = "37d25257-5fcf-4318-b1b6-5bdb48288a71"

# Adzuna country codes worth scanning for Rui (EU eligibility + remote)
COUNTRIES = ["gb", "pt", "nl", "de", "fr", "es", "it", "ie", "se", "pl"]

QUERIES = [
    "creative operations",
    "creative production director",
    "content operations director",
    "head of content production",
    "studio operations",
    "brand operations director",
    "head of operations creative",
    "director of operations content",
]

RESULTS_PER_PAGE = 50
MAX_PAGES_PER_QUERY = 2  # 50x2x11 countriesx8 queries is plenty; rate-limit friendly

# ── Scoring (same profile as the Google-scrape seed) ─────────────
WEIGHTED_KWS = {
    "creative operations": 3, "creative production": 3, "content operations": 3,
    "content production": 2.5, "studio operations": 3, "production director": 3,
    "head of content": 2, "brand operations": 2.5, "creative services": 2.5,
    "digital asset management": 2, "content supply chain": 2,
    "vp": 2, "svp": 2.5, "head of": 2, "director": 1.5, "lead": 1, "senior manager": 1,
    "team leadership": 1.5, "direct reports": 1.5, "scale": 1,
    "e-commerce": 1.5, "ecommerce": 1.5, "luxury": 2, "fashion": 1.5, "marketplace": 1.5,
    "d2c": 1, "dtc": 1, "retail": 1, "photography": 1.5, "photo studio": 2, "retouching": 1.5,
    "workflow": 1, "process": 0.75, "automation": 1, "ai ": 0.75,
    "remote": 1.5, "europe": 1.5, "emea": 1.5, "portugal": 2, "london": 1, "amsterdam": 1, "berlin": 1,
}
NEGATIVE = ["junior", "intern", "entry level", "coordinator", "assistant", "associate", "data entry", "graduate"]
LEADERSHIP = ["vp", "svp", "head", "director", "lead", "chief", "manager"]


def load_env():
    env = {}
    if os.path.exists(ENV_PATH):
        for line in open(ENV_PATH):
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env


def score_job(title, company, location, description):
    text = f"{title} {company} {location} {description}".lower()
    title_l = title.lower()
    pts, reasons = 0.0, []
    for kw, w in WEIGHTED_KWS.items():
        if kw in text:
            boost = 1.5 if kw in title_l else 1.0
            pts += w * boost
            if len(reasons) < 6 and w >= 1.5:
                reasons.append(kw.strip())
    neg = [n for n in NEGATIVE if n in title_l]
    if neg:
        pts -= 6
        reasons.append(f"junior signal: {neg[0]}")
    if not any(s in title_l for s in LEADERSHIP):
        pts -= 4
    s = max(0.0, min(1.0, pts / 22.0))
    return round(s, 3), ("Matched: " + ", ".join(reasons) if reasons else "Weak keyword overlap")


def adzuna_search(app_id, app_key, country, query, page):
    params = urllib.parse.urlencode({
        "app_id": app_id,
        "app_key": app_key,
        "results_per_page": RESULTS_PER_PAGE,
        "what": query,
        "content-type": "application/json",
    })
    url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/{page}?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": "career-kb-job-fetcher/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())


def normalize(job, country, query):
    desc = re.sub(r"<[^>]+>", " ", job.get("description", "") or "")
    desc = re.sub(r"\s+", " ", desc).strip()
    loc = job.get("location", {}) or {}
    loc_str = loc.get("display_name", "") or ""
    cat = (job.get("category", {}) or {}).get("label", "")
    created = (job.get("created") or "")[:10] or None
    return {
        "title": job.get("title", "").strip(),
        "company": (job.get("company", {}) or {}).get("display_name", "").strip(),
        "location": loc_str + (" (Remote)" if "remote" in desc.lower()[:600] and "remote" not in loc_str.lower() else ""),
        "url": job.get("redirect_url", "") or "",
        "source": f"Adzuna ({country}: {query})",
        "description": desc[:4000],
        "posted_at": created,
        "category": cat,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--min-score", type=float, default=0.30, help="skip jobs scoring below this")
    args = ap.parse_args()

    env = load_env()
    app_id = env.get("ADZUNA_APP_ID") or os.environ.get("ADZUNA_APP_ID")
    app_key = env.get("ADZUNA_APP_KEY") or os.environ.get("ADZUNA_APP_KEY")
    if not app_id or not app_key:
        sys.exit("Missing ADZUNA_APP_ID / ADZUNA_APP_KEY in .env")

    seen_urls = set()
    candidates = []
    errors = 0

    for country in COUNTRIES:
        for query in QUERIES:
            for page in range(1, MAX_PAGES_PER_QUERY + 1):
                try:
                    data = adzuna_search(app_id, app_key, country, query, page)
                except Exception as e:
                    errors += 1
                    print(f"  ERR {country}/{query}/p{page}: {e}", file=sys.stderr)
                    time.sleep(2)
                    continue
                results = data.get("results", [])
                if not results:
                    break  # no more pages
                for job in results:
                    rec = normalize(job, country, query)
                    if not rec["title"] or not rec["url"] or rec["url"] in seen_urls:
                        continue
                    seen_urls.add(rec["url"])
                    s, reasons = score_job(rec["title"], rec["company"], rec["location"], rec["description"])
                    if s < args.min_score:
                        continue
                    rec["match_score"] = s
                    rec["match_reasons"] = reasons
                    candidates.append(rec)
                time.sleep(0.4)  # polite pacing

    # Dedupe same-role-different-country postings (e.g. one role posted per market)
    # Key: normalized title + normalized company. Keep the highest-scoring instance.
    best_by_role = {}
    for r in candidates:
        tkey = re.sub(r"[^a-z0-9 ]", "", r["title"].lower())[:60]
        ckey = re.sub(r"[^a-z0-9]", "", r["company"].lower())[:25]
        key = (tkey, ckey)
        if key not in best_by_role or r["match_score"] > best_by_role[key]["match_score"]:
            best_by_role[key] = r
    candidates = sorted(best_by_role.values(), key=lambda r: r["match_score"], reverse=True)

    print(f"\nFetched {len(seen_urls)} unique postings, {len(candidates)} above min score {args.min_score}, {errors} fetch errors")
    for r in candidates[:25]:
        print(f"  {r['match_score']:.3f} | {r['title'][:58]} @ {r['company'][:25]} | {r['location'][:28]} | {r['posted_at']}")

    if args.dry_run:
        out = os.path.join(CAREER_KB, ".audit-tmp", "adzuna-dry-run.json")
        json.dump(candidates, open(out, "w"), indent=2)
        print(f"\nDry run — wrote {out}, nothing inserted.")
        return

    # Insert into Supabase
    db_password = os.environ.get("SUPABASE_DB_PASSWORD")
    if not db_password:
        sys.exit("Set SUPABASE_DB_PASSWORD env var to insert into Supabase.")

    import psycopg2
    conn = psycopg2.connect(
        host="db.ncwtmagvjtpqnwroyuha.supabase.co", port=5432, dbname="postgres",
        user="postgres", password=db_password, connect_timeout=15,
    )
    conn.autocommit = True
    cur = conn.cursor()
    inserted = 0
    for r in candidates:
        cur.execute(
            """
            insert into public.job_listings
              (user_id, title, company, location, url, source, description, posted_at, match_score, match_reasons, status)
            values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,'New')
            on conflict (user_id, url) where url <> '' do nothing
            """,
            (RUI_USER_ID, r["title"], r["company"], r["location"], r["url"], r["source"],
             r["description"], r["posted_at"], r["match_score"], r["match_reasons"]),
        )
        inserted += cur.rowcount
    cur.execute("select count(*) from public.job_listings where user_id=%s", (RUI_USER_ID,))
    row = cur.fetchone()
    total = row[0] if row else 0
    conn.close()
    print(f"\nInserted {inserted} new listings (table now holds {total}).")


if __name__ == "__main__":
    main()
