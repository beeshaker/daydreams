# Architecture

How the Daydreams & Dumbbells app is put together: the app layers, the database schema, the admin auth flow, and where each piece of hardening from `docs/production-technical-todo.md` lives. For where this currently runs and how to redeploy it, see `docs/deployment.md`.

## High-level layout

```
Next.js 16 (App Router, Turbopack)
├─ Public site (app/, components/)
│   ├─ "/"                — entrance (LandingSplit)
│   ├─ "/daydreams"       — 3D game (react-three-fiber)
│   ├─ "/daydreams/site"  — Daydreams traditional site + lead form
│   ├─ "/dumbbells"       — Dumbbells traditional site + lead form
│   └─ "/site"            — chooser between the two traditional sites
│
├─ Public API (app/api/)
│   ├─ POST /api/leads               — lead capture (rate-limited, Turnstile-checked)
│   └─ POST /api/conversation-token  — mints a signed ElevenLabs conversation URL
│
├─ Admin app (app/admin/), gated by proxy.ts
│   ├─ /admin/login            — username + password (+ TOTP if enabled)
│   ├─ /admin/logout
│   ├─ /admin/settings/mfa     — TOTP enrollment (QR code)
│   ├─ /admin/leads            — table, filters, CSV export, retry/purge actions
│   └─ /admin/kb               — ElevenLabs knowledge base CRUD
│
├─ proxy.ts (Next 16's renamed middleware, Node.js runtime)
│   — gates every /admin/:path* request on a valid session cookie
│
└─ Postgres (lib/db/)
    — leads, admin_users, audit_log, rate_limit_events, schema_migrations
```

External services: **Neon Postgres** (data), **Resend** (lead notification email, optional), **ElevenLabs** (voice agent + knowledge base), **Cloudflare Turnstile** (bot protection on lead forms, optional but recommended).

## Data layer (`lib/db/`)

- `lib/db/client.ts` — a singleton `pg.Pool` (`getDb()`), lazily created from `DATABASE_URL` on first use. Runs pending migrations before handing back the pool, so a fresh database is always brought up to date automatically — no separate "provision" step beyond setting the connection string.
- `lib/db/migrate.ts` + `lib/db/migrations/*.sql` — hand-written SQL migrations, tracked in a `schema_migrations` table, applied in order inside a `pg_advisory_lock` so two app instances booting at once can't race each other creating the same tables. No ORM: the schema is small (4 tables) and this keeps full control over indexes and constraints. `npm run db:migrate` runs this manually — there's no deploy pipeline yet to run it automatically (see "What's deferred" below).
- `lib/db/withTransaction.ts` — wraps a callback in `BEGIN`/`COMMIT`/`ROLLBACK` on one checked-out client, used wherever two writes must succeed or fail together (e.g. an admin lead update + its audit-log row).

### Schema

| Table | Purpose |
|---|---|
| `leads` | One row per form/voice-agent submission. `id` (UUID, generated in app code via `crypto.randomUUID()` — no `pgcrypto` dependency), `status`, `email_notification_status`, `notes`. Indexed on `email`, `status`, `created_at`. |
| `admin_users` | One row per admin. `password_hash` (bcrypt), `role`, `totp_secret`/`totp_enabled`, `session_version` (bumped to invalidate all of that admin's sessions at once — not currently exposed in the UI, but the column exists for it). |
| `audit_log` | Append-only. Every login/logout/lead update/KB edit writes a row here (`actor_id`, `action`, `target_type`/`target_id`, `metadata` jsonb, `ip`). |
| `rate_limit_events` | Backs the durable rate limiter and the conversation-token daily quota — see below. |

## Lead flow (`app/api/leads/route.ts`)

1. `getClientIp()` (`lib/http/clientIp.ts`) — trusts `X-Real-IP`, else the rightmost `TRUSTED_PROXY_HOPS` entries of `X-Forwarded-For`, so a client can't spoof its way past rate limiting by forging earlier hops.
2. `isRateLimited("leads", ip, ...)` (`lib/ratelimit/postgresRateLimit.ts`) — 5 requests / 10 minutes per IP, backed by `rate_limit_events` (durable across restarts, unlike the old in-memory `Map` it replaced).
3. `assertBodySizeFromHeader()` (`lib/http/bodyLimit.ts`) — rejects oversized bodies before parsing.
4. `parseLeadPayload()` (`lib/leads/schema.ts`, zod) — validates shape; the honeypot field (`companyWebsite`) short-circuits to a fake success for bots.
5. `verifyTurnstileToken()` (`lib/turnstile/verify.ts`) — server-side Cloudflare check. No-ops (returns `true`, logs a warning) when `TURNSTILE_SECRET_KEY` is unset, so local dev and the current temp deployment aren't blocked before real keys exist.
6. `saveLead()` (`lib/leads/store.ts`) — single atomic `INSERT ... RETURNING *`.
7. `sendLeadNotification()` (`lib/leads/email.ts`) — best-effort Resend email with a 9s timeout; failure never fails the request. On failure, `retryNotificationWithBackoff()` (`lib/leads/emailRetry.ts`) is scheduled via `next/server`'s `after()` so a couple of backoff retries happen post-response.

Leads still stuck at `email_notification_status = 'failed'` after that can be bulk-retried from the admin UI ("Retry failed notification emails" button on `/admin/leads`) or via `npm run leads:retry-emails`.

## Admin auth (`lib/admin/`, `proxy.ts`)

Replaces the old single-shared-credential HTTP Basic Auth with per-admin accounts:

- `lib/admin/passwords.ts` — bcrypt hash/verify.
- `lib/admin/totp.ts` — TOTP secret generation, QR code (via `otplib`'s functional API + `qrcode`), verification with a 30s tolerance window.
- `lib/admin/session.ts` — `iron-session`-backed encrypted cookie (`getAdminSession()` for Server Components/Actions/Route Handlers, `getAdminSessionFromRequest()` for `proxy.ts`). `requireAdminSession(role?)` is the **authoritative** check: it re-reads `session_version` from Postgres so a revoked/deleted admin's existing cookie stops working immediately, not just at cookie expiry.
- `lib/admin/audit.ts` — `logAdminAction()`, called by every login attempt, lead update, and KB edit.
- `proxy.ts` — the cheap, request-level gate: checks the session cookie is present and well-formed (no DB round trip) before allowing a request through to `/admin/:path*`. This is defense-in-depth's outer layer, not the authoritative one — **Server Actions are POSTs that can bypass a middleware matcher**, so every admin Server Action calls `requireAdminSession()` itself regardless of what `proxy.ts` already checked.

Login flow: `/admin/login` collects username + password (+ TOTP code, resent together, if the account has MFA enabled) via a single `useActionState`-backed form. First login for a fresh deployment is bootstrapped by `npm run db:seed-admin` (reads `ADMIN_BOOTSTRAP_USERNAME`/`ADMIN_BOOTSTRAP_PASSWORD`, idempotent). MFA is opt-in per admin via `/admin/settings/mfa` — the TOTP secret is only persisted after the admin proves they can generate a valid code with it, so enrollment can't half-complete into a locked-out account.

## Voice agent token minting (`app/api/conversation-token/route.ts`)

Previously fully open (no auth, no rate limit) — any caller could mint ElevenLabs conversation URLs and burn API quota. Now:
- Per-IP rate limit (`CONVERSATION_TOKEN_RATE_MAX` per 5 minutes).
- A global daily quota (`CONVERSATION_TOKEN_DAILY_QUOTA`) via `lib/ratelimit/quota.ts`, independent of which IP is asking — catches a distributed/rotating-IP abuser a per-IP limit alone would miss.

## Outbound HTTP hardening (`lib/http/`)

- `fetchWithTimeout.ts` — wraps `fetch` with an `AbortController` (composes with a caller-supplied `signal` rather than overwriting it), used by both the Resend call (`lib/leads/email.ts`) and every ElevenLabs call (`lib/elevenlabs/client.ts`, including Turnstile verification).
- `bodyLimit.ts` — `Content-Length`-based request size guard.
- `clientIp.ts` — see "Lead flow" above.

## Frontend accessibility (`hooks/`, `components/`)

- `hooks/useWalkingInput.ts` — the game's WASD/arrow-key handler now skips key handling entirely when focus is on an input/textarea/select/contenteditable element, so typing in a lead form no longer fights the game's movement controls.
- `hooks/useFocusTrap.ts` — shared hook used by both modal dialogs (`ContentPanel`, `VoiceAgentModal`): traps Tab/Shift+Tab inside the dialog, closes on Escape, restores focus to the trigger element on close.

## Testing

Vitest (`vitest.config.ts`, jsdom environment) covers the pieces that don't require a live database: HTTP utilities, password/TOTP helpers, CSV escaping, client-IP parsing, and the frontend hooks. Run with `npm run test`. Anything touching Postgres directly (the lead store, rate limiter, session revocation) is written against the real `pg` client and needs `DATABASE_URL` set to exercise — there's no mocked DB layer, by design, since the whole point of moving off the JSON file was to test against real transactional behavior.

## What's deferred (needs a permanent VPS)

Everything in `docs/production-technical-todo.md`'s "VPS and deployment" section — Nginx hardening, systemd sandboxing, firewall rules, TLS auto-renewal alerts, and **scheduling** the maintenance scripts below — is out of scope until a permanent VPS exists. Until then, these are manual/on-demand:

| Script | Purpose |
|---|---|
| `npm run db:migrate` | Apply pending Postgres migrations |
| `npm run db:seed-admin` | Create the first admin (idempotent) |
| `npm run leads:import-legacy` | One-time import of any leads still in the old `.data/leads.json` file |
| `npm run leads:purge` | Delete leads older than `LEAD_RETENTION_DAYS` |
| `npm run leads:retry-emails` | Bulk-retry leads stuck at `email_notification_status = 'failed'` |

See `docs/production-technical-todo.md` for the full checklist and `docs/deployment.md` for where this currently runs.
