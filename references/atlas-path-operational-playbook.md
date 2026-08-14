# Atlas Path — Operational Playbook

## Staging workflow
- Use branch-based staging.
- `main` = production. `staging` = preview.
- Feature/fix branches = PRs with preview deploys when possible.
- Promote staging → main via PR (branch protection on main).
- Never push directly to `main`.

## Credential hygiene
- Never hardcode Supabase or API credentials in source files.
- Use Vercel environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Read via `import.meta.env` with a guard clause that throws if missing.
- If credentials were ever committed before this rule, scrub git history.

## Regression gates
- vitest installed and running (11 regression tests as of 2026-08-03).
- Priority tests: profile save/load roundtrip, enrichment data integrity, career direction structure.
- Use `vitest` with Vite; keep tests focused on data-loss risks, not generic unit coverage.

## Pre-launch checklist
- Source of truth: `atlas-path-pre-launch-checklist.md`

---

## Sovereign Infrastructure

Atlas Path runs on a fully sovereign EU infrastructure. No US company has access to user data.

### Architecture (as of 2026-08-14)

```
Atlas (Vercel) ──HTTPS──► supabase.ruisilvastudio.com ──Cloudflare Tunnel──► Prod (Kong :18000 → Supabase Docker)
                        llm.ruisilvastudio.com        ──Cloudflare Tunnel──► Prod (Caddy :11435 → Ollama :11434)
```

Traffic enters via Cloudflare Tunnel (cloudflared daemon on Prod) which proxies public hostnames to localhost ports on the Prod server. No relay server required — traffic goes directly from Cloudflare's edge to Prod through the encrypted tunnel.

**Previous architecture (decommissioned 2026-08):** Scaleway Paris relay (51.158.127.103) + WireGuard tunnel (10.8.0.1 ↔ 10.8.0.2). The relay has been terminated and the WireGuard tunnel removed. All routing is now handled by Cloudflare Tunnel.

### Components

| Component | Location | URL / Address | Notes |
|---|---|---|---|
| Frontend | Vercel | `atlaspath.eu` (prod), `atlas.ruisilvastudio.com` (staging) | Static files only — no user data |
| Database + Auth | Prod server (self-hosted Supabase Docker) | `supabase.ruisilvastudio.com` → 127.0.0.1:18000 | 11 containers, Kong at localhost:18000 |
| LLM | Prod server (Ollama + Qwen 2.5 7B) | `llm.ruisilvastudio.com` → Caddy 127.0.0.1:11435 → Ollama :11434 | API key auth in Caddy, GPU (RTX 2060 6GB) |
| Tunnel | Cloudflare Tunnel (cloudflared) | Runs on Prod server | Two named tunnels: `rootlink` (covers supabase + llm + api subdomains) and `studio` (covers ruisilvastudio.com subdomains) |
| Backups | Prod server | `/home/rui/backups/` | Daily 2am cron, 7-day retention, `backup-supabase.sh` |

### SSH access

- **Prod server:** `ssh rui@192.168.1.229`

### Key file locations (Prod server)

- Supabase stack: `/home/rui/supabase/` (docker-compose.yml, .env)
- Supabase edge functions: `/home/rui/supabase/volumes/functions/`
- Ollama: systemd service, model `qwen2.5:7b`, listen `127.0.0.1:11434`
- Caddy (LLM API key gate): `/etc/caddy/Caddyfile`, listen `127.0.0.1:11435`, proxies to `127.0.0.1:11434`
- Cloudflare Tunnel: cloudflared daemon (systemd), config at `/etc/cloudflared/`
- Backups: `/home/rui/backups/` + `/home/rui/backup-supabase.sh`

### Edge functions (deployed on self-hosted Supabase)

| Function | Path | Purpose |
|---|---|---|
| `bright-worker` | `/functions/v1/bright-worker` | CV extraction (LLM) |
| `suggest-direction` | `/functions/v1/suggest-direction` | Career direction suggestions (LLM) |
| `enrich-direction` | `/functions/v1/enrich-direction` | Direction enrichment (LLM) |
| `suggest-actions` | `/functions/v1/suggest-actions` | Action items per direction (LLM) |
| `market-insight` | `/functions/v1/market-insight` | Market analysis per direction (LLM) |
| `delete-account` | `/functions/v1/delete-account` | GDPR account deletion (cascade) |

### Environment variables (Vercel)

| Var | Value | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://supabase.ruisilvastudio.com` | Self-hosted Supabase (via Cloudflare Tunnel) |
| `VITE_SUPABASE_ANON_KEY` | (from `/home/rui/supabase/.env`) | Self-hosted anon key |
| `LLM_API_KEY` | (in Supabase functions .env + Caddy) | LLM endpoint auth |

### Maintenance

- If Prod server reboots, everything auto-starts (Ollama, cloudflared, Supabase Docker, Caddy).
- If Cloudflare Tunnel goes down: `sudo systemctl restart cloudflared` on Prod server.
- To update edge functions: copy `.ts` files to `/home/rui/supabase/volumes/functions/<name>/index.ts` on Prod server.
- To pull a new LLM model: `ollama pull <model>` on Prod server (watch disk space — ~19GB free as of 2026-08-03).
- To restore from backup: `gunzip < backup.sql.gz | docker compose exec -T db psql -U postgres` in `/home/rui/supabase/`.
