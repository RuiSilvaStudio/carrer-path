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

### Architecture

```
Atlas (Vercel) → supabase.ruisilvastudio.com (Paris relay) → WireGuard tunnel → Office server (Supabase)
                → llm.ruisilvastudio.com (Paris relay) → WireGuard tunnel → Office server (Ollama)
```

### Components

| Component | Location | URL / Address | Notes |
|---|---|---|---|
| Frontend | Vercel | `atlaspath.eu` (prod), `atlas.ruisilvastudio.com` (staging) | Static files only — no user data |
| Database + Auth | Office server (self-hosted Supabase Docker) | `supabase.ruisilvastudio.com` | 11 containers, Kong bound to tunnel IP |
| LLM | Office server (Ollama + Qwen 2.5 7B) | `llm.ruisilvastudio.com` | API key auth in Caddy, GPU (RTX 2060 6GB) |
| Relay | Scaleway Paris (PAR-1, DEV1-S) | `51.158.127.103` | Caddy reverse proxy + TLS, delete-to-cancel |
| Tunnel | WireGuard | `10.8.0.1` (relay) ↔ `10.8.0.2` (office) | Auto-connects on boot, survives IP changes |
| DNS | Cloudflare | `*.ruisilvastudio.com` | DNS-only (grey cloud), no proxying |
| Backups | Office server | `/home/rui/backups/` | Daily 2am cron, 7-day retention, `backup-supabase.sh` |

### SSH access

- **Office server:** `ssh rui@192.168.1.228`
- **Relay:** `ssh -i /home/rui/.ssh/atlas-relay-key root@51.158.127.103`

### Key file locations (office server)

- Supabase stack: `/home/rui/supabase/` (docker-compose.yml, .env)
- Supabase edge functions: `/home/rui/supabase/volumes/functions/`
- Ollama: systemd service, model `qwen2.5:7b`
- WireGuard: `/etc/wireguard/wg0.conf`
- Caddy (relay): `/etc/caddy/Caddyfile`
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
| `VITE_SUPABASE_URL` | `https://supabase.ruisilvastudio.com` | Self-hosted Supabase |
| `VITE_SUPABASE_ANON_KEY` | (from `/home/rui/supabase/.env`) | Self-hosted anon key |
| `LLM_API_KEY` | (in Supabase functions .env + Caddy) | LLM endpoint auth |

### Maintenance

- If office server reboots, everything auto-starts (Ollama, WireGuard, Supabase Docker, Caddy).
- If tunnel breaks: `sudo systemctl restart wg-quick@wg0` on office server.
- To update edge functions: copy `.ts` files to `/home/rui/supabase/volumes/functions/<name>/index.ts` on office server.
- To pull a new LLM model: `ollama pull <model>` on office server (watch disk space — ~19GB free as of 2026-08-03).
- To restore from backup: `gunzip < backup.sql.gz | docker compose exec -T db psql -U postgres` in `/home/rui/supabase/`.
