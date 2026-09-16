# Server Architecture & Deployment

How this app is hosted, how to redeploy it, and the gotchas we hit getting it there.

## Overview

```
GitHub (beeshaker/daydreams, private)
        │  git pull
        ▼
VPS 167.86.81.124 (Ubuntu, shared with other projects)
        │
        ├─ Node.js 20.x (NodeSource — NOT the distro's apt package, which is too old)
        ├─ /var/www/daydreams/daydreams  ← actual app root (see "Nested clone dir" below)
        ├─ systemd unit: daydreams.service, runs `npm run start` on 127.0.0.1:3001
        └─ Nginx reverse proxy
                ├─ :80  → redirects to :443
                └─ :443 → proxies to 127.0.0.1:3001, TLS via the existing
                          *.whats2manage.com wildcard cert
                ▼
        https://daydreams.whats2manage.com
```

## Server details

- **IP**: `167.86.81.124`
- **OS**: Ubuntu
- **SSH user**: `deploy`
- **App root**: `/var/www/daydreams/daydreams` — note the double `daydreams`. The initial clone landed a nested folder inside the intended directory; rather than un-nest it, we standardized on this path. If setting up fresh elsewhere, a plain `git clone <url> /var/www/daydreams` avoids the nesting.
- **This is a shared box.** Other things already running here (don't reuse these ports): Docker containers on `8001-8005`, `2001-2004`, `9000`; Streamlit on `8501`; Ollama on `11434`. Our app uses **port 3001**. Check `sudo ss -tlnp | grep LISTEN` before picking a port for anything new.
- **fail2ban is active on SSH.** A handful of failed login attempts (e.g. guessing usernames) will get an IP banned. If you get locked out: use your VPS provider's web console (bypasses SSH/fail2ban entirely) or wait out the ban, then `sudo fail2ban-client set sshd unbanip <ip>`. Add your own IP to `ignoreip` in `/etc/fail2ban/jail.local` to avoid repeat bans.

## Domain / TLS

- **Public URL**: https://daydreams.whats2manage.com
- **DNS**: an A record for `daydreams` → `167.86.81.124`, managed wherever `whats2manage.com`'s DNS lives.
- **TLS**: this box already has a **wildcard certificate** for `*.whats2manage.com` from an earlier project (`/etc/letsencrypt/live/whats2manage.com/{fullchain,privkey}.pem`, issued via DNS-01 so it covers every subdomain). We reused it directly — **no per-subdomain `certbot --nginx` run was needed.**
- **Gotcha**: a new Nginx site file needs an *explicit* `listen 443 ssl` block referencing that cert. A site with only a `listen 80` block will silently fall through to whatever *other* `server_name` block is handling port 443 on this box once DNS points here — which is exactly what happened on first deploy (browser showed a completely different app, "Ops Ticketing," until the 443 block was added).

## Files that make up this deployment

- `/etc/systemd/system/daydreams.service` — runs the app
- `/etc/nginx/sites-available/daydreams.whats2manage.com` (symlinked into `sites-enabled/`) — reverse proxy + TLS
- `/var/www/daydreams/daydreams/.env.local` — real secrets, never committed to git

## Redeploying after a push

```bash
cd /var/www/daydreams/daydreams
git pull
npm ci
npm run db:migrate
npm run build
sudo systemctl restart daydreams
```

Worth saving as `deploy.sh` in that directory for a one-command redeploy. `npm run db:migrate` is a no-op if there's nothing new to apply, so it's safe to run on every deploy — see `docs/architecture.md` for how migrations work.

Lead storage moved from a local JSON file (`.data/leads.json`) to Postgres (see "Environment variables" below and `docs/architecture.md`) — that file is no longer read by the app. If it still has leads in it from before the migration, import them once with `npm run leads:import-legacy` after `DATABASE_URL` is set and migrations have run.

## Environment variables

Copied from `.env.example` into `.env.local` on the server (real values, never in git):

| Variable | Required for |
|---|---|
| `DATABASE_URL` | All lead storage, admin accounts, audit log, rate limiting — the app cannot start without this. Currently a hosted Neon connection string, not a database on this VPS (no permanent VPS to run Postgres on yet). |
| `SESSION_SECRET` | Admin session cookies (`/admin/*`) — random 32+ char string, e.g. `openssl rand -base64 32`. |
| `ADMIN_BOOTSTRAP_USERNAME`, `ADMIN_BOOTSTRAP_PASSWORD` | Consumed once by `npm run db:seed-admin` to create the first admin account. Safe to leave set (re-running the script is a no-op once that username exists) or unset afterward. |
| `TRUSTED_PROXY_HOPS` | Client-IP extraction for rate limiting (`lib/http/clientIp.ts`). Leave at `1` here — this Nginx sits directly in front of the app. |
| `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile bot protection on the lead forms. Without these, the widget doesn't render and server-side verification is skipped (logged) — get these before going live publicly. |
| `ELEVENLABS_API_KEY`, `ELEVENLABS_AGENT_ID` | Voice agent widget + `/api/conversation-token` (503s cleanly without them) |
| `RESEND_API_KEY`, `LEADS_NOTIFICATION_EMAIL`, `LEADS_FROM_EMAIL` | Optional — lead notification emails are skipped (logged instead) if unset |
| `LEAD_RETENTION_DAYS`, `CONVERSATION_TOKEN_RATE_MAX`, `CONVERSATION_TOKEN_DAILY_QUOTA`, `LEADS_MAX_BODY_BYTES` | Optional tuning — see `.env.example` for defaults |

`ADMIN_USERNAME`/`ADMIN_PASSWORD` (HTTP Basic Auth) are retired — admin auth is now per-account sessions with optional TOTP MFA. Remove them from `.env.local` once the first admin has been seeded.

## Common operations

```bash
sudo systemctl status daydreams        # is it running?
sudo systemctl restart daydreams       # restart after a config/env change
sudo journalctl -u daydreams -f        # tail live logs
sudo nginx -t && sudo systemctl reload nginx   # after editing the Nginx site file
```

## Getting the code onto the server (first time only)

The repo is private. Options, from simplest to most "proper":

```bash
# Plain HTTPS clone — prompts for username + a GitHub Personal Access Token
# (not your actual password) at the password prompt, nothing saved to shell history
git clone https://github.com/beeshaker/daydreams.git /var/www/daydreams

# Or: gh CLI (device-code browser auth, no token ever touches a command line)
gh auth login --hostname github.com --git-protocol https --web
gh repo clone beeshaker/daydreams /var/www/daydreams

# Or: SSH deploy key (read-only, scoped to just this repo — best for a long-lived server)
ssh-keygen -t ed25519 -C "daydreams-deploy" -f ~/.ssh/daydreams_deploy -N ""
cat ~/.ssh/daydreams_deploy.pub   # add under repo Settings → Deploy keys
GIT_SSH_COMMAND="ssh -i ~/.ssh/daydreams_deploy" git clone git@github.com:beeshaker/daydreams.git /var/www/daydreams
```

## GitHub repo

- **URL**: https://github.com/beeshaker/daydreams (private)
- Briefly made public once to sidestep auth friction for the very first clone, then switched back to private immediately — worth remembering if a fast unauthenticated clone is ever needed again, but flip it back right after.

## Known gaps / not done yet

- ElevenLabs agent hasn't been created yet — `ELEVENLABS_API_KEY`/`ELEVENLABS_AGENT_ID` still need real values, then `npm run configure:agent` and `npm run seed:kb` (see main README/plan history) to wire up the voice agent's lead-capture tool and knowledge base.
- `DATABASE_URL` needs a real Neon connection string, then `npm run db:migrate` and `npm run db:seed-admin` (with `ADMIN_BOOTSTRAP_USERNAME`/`ADMIN_BOOTSTRAP_PASSWORD` set) before `/admin/leads` and `/admin/kb` are usable.
- `SESSION_SECRET` needs a real random value — admin sessions won't work without it.
- `TURNSTILE_SITE_KEY`/`TURNSTILE_SECRET_KEY` haven't been created yet (needs a Cloudflare account) — until then the lead forms have no bot-protection widget beyond the honeypot field and rate limiting.
- Postgres itself is hosted (Neon), not on this VPS — see `docs/architecture.md`. Once a permanent VPS exists, revisit whether to keep it hosted or move it in-house, and wire up the remaining "VPS and deployment" checklist items from `docs/production-technical-todo.md` (systemd hardening, Nginx security headers, scheduled backups/retention/email-retry scripts, monitoring).
