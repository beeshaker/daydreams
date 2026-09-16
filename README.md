This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

See [`docs/architecture.md`](docs/architecture.md) for how the app is put together (Postgres schema, admin auth, rate limiting, etc.) and [`docs/deployment.md`](docs/deployment.md) for where it currently runs and how to redeploy it.

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   Copy `.env.example` to `.env.local` and fill in the values you have. At minimum for local dev you'll need:

   - `DATABASE_URL` — a Postgres connection string. The project currently targets a hosted [Neon](https://neon.tech) free-tier database (no permanent VPS to run Postgres on yet); a local Postgres/Docker instance also works fine for development.
   - `SESSION_SECRET` — a random 32+ character string, e.g. `openssl rand -base64 32`.
   - `ADMIN_BOOTSTRAP_USERNAME` / `ADMIN_BOOTSTRAP_PASSWORD` — used once to create the first admin account.

   Everything else (`ELEVENLABS_*`, `RESEND_API_KEY`, `TURNSTILE_*`, rate-limit tuning) is optional for local dev — those features degrade gracefully (skipped/logged) when unset. See the comments in `.env.example` for what each one does.

3. **Apply database migrations and create your first admin**

   ```bash
   npm run db:migrate
   npm run db:seed-admin
   ```

   Both are safe to re-run — migrations are idempotent, and seeding skips an already-existing username. If you have leads sitting in an old `.data/leads.json` file from before the Postgres migration, import them once with `npm run leads:import-legacy`.

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. Admin routes are at `/admin/login` — sign in with the bootstrap credentials, then optionally enable MFA at `/admin/settings/mfa`.

5. **Run tests / lint / typecheck** (useful before pushing)

   ```bash
   npm run test
   npm run lint
   npx tsc --noEmit
   ```

The public routes are:

| Route | Experience |
| --- | --- |
| `/` | Shared Daydreams / Dumbbells entrance |
| `/daydreams` | Interactive Daydreams game |
| `/daydreams/site` | Daydreams daycare website and visit enquiries |
| `/dumbbells` | Dumbbells gym website and session enquiries |
| `/site` | Choice between the two traditional websites |

Old `/site#...` bookmarks forward to the matching brand and section in the browser.
Each traditional website uses its own content, navigation, FAQs, and contact details.

Admin routes (require signing in at `/admin/login`):

| Route | Purpose |
| --- | --- |
| `/admin/login` | Sign in (username + password, plus a TOTP code if MFA is enabled) |
| `/admin/leads` | Lead table, filters, CSV export, retry/purge maintenance actions |
| `/admin/kb` | ElevenLabs voice-agent knowledge base |
| `/admin/settings/mfa` | Enable two-factor authentication |
| `/admin/logout` | Sign out |

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment

This app is not deployed on Vercel — it runs as a `next start` process behind Nginx on a VPS (currently a temporary one, since a permanent VPS hasn't been purchased yet). See [`docs/deployment.md`](docs/deployment.md) for server details and the redeploy steps, and [`docs/production-technical-todo.md`](docs/production-technical-todo.md) for the production-readiness checklist.
