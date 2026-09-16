# Production Technical TODO

This checklist covers the development, infrastructure, security, accessibility, performance, testing, and release work required before the Daydreams & Dumbbells website is ready for production.

Client-supplied business information, testimonials, legal approvals, policies, and media assets are tracked separately.

## P0 — Before launch

- [x] Replace the JSON lead store with PostgreSQL.
- [x] Add database migrations, unique IDs, timestamps, and appropriate indexes.
- [x] Make lead creation and updates transactional.
- [ ] Encrypt database backups and test restoring them. _(Depends on the final Postgres host — currently a Neon free-tier database chosen to avoid provisioning this on the temp VPS; revisit backup/restore procedure once hosting is finalized.)_
- [x] Define automated data-retention and deletion procedures. _(Policy + deletion mechanism implemented — `lib/leads/retention.ts`, `npm run leads:purge`, admin "Purge expired leads" action, gated by `LEAD_RETENTION_DAYS`. Not yet **scheduled** automatically — no permanent server to run cron/systemd timers on yet.)_
- [x] Replace HTTP Basic Auth with secure session authentication.
- [x] Add admin roles, MFA support, logout, and audit logging.
- [x] Make every admin and export response `private, no-store`.
- [x] Neutralize spreadsheet-formula injection in CSV exports.
- [x] Add durable rate limiting to `/api/leads`.
- [x] Add durable rate limiting and quotas to `/api/conversation-token`.
- [x] Configure trusted proxy handling for client IP addresses.
- [x] Add Cloudflare Turnstile or equivalent bot protection to forms. _(Implemented and wired end-to-end — inactive until `TURNSTILE_SITE_KEY`/`TURNSTILE_SECRET_KEY` are supplied; see `.env.example`.)_
- [x] Enforce request-body size limits in Nginx and the application. _(Application-level limit done; the Nginx-level limit is VPS/deployment work, tracked below.)_
- [x] Add timeouts to Resend and ElevenLabs API requests.
- [x] Add retries or a job queue for failed notification emails.
- [x] Fix the game's WASD handler so it does not block typing in form fields.
- [x] Add proper focus trapping, Escape handling, and focus restoration to dialogs.
- [x] Fix the Lighthouse color-contrast failures. _(Audited `/`, `/daydreams`, `/daydreams/site`, `/dumbbells`, `/site` with Lighthouse against a production build — all now score 1.0 on accessibility with zero color-contrast failures.)_
- [x] Add a `<main>` landmark to the entrance page.

## VPS and deployment

- [ ] Upgrade the VPS from Node.js 20 to Node.js 24 LTS.
- [ ] Run the application as a dedicated, unprivileged system user.
- [ ] Restrict `.env` files to `600` and secret/data directories to `700`.
- [ ] Isolate the application from unrelated services on the shared VPS.
- [ ] Review UFW/firewall rules and expose only required ports.
- [ ] Disable SSH password login and root SSH access.
- [ ] Confirm unattended security updates are enabled.
- [ ] Add systemd hardening such as `NoNewPrivileges` and filesystem restrictions.
- [ ] Add Nginx connection, request-size, and request-rate limits.
- [ ] Hide Nginx and Next.js version headers.
- [ ] Add HSTS, CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and clickjacking protection.
- [ ] Confirm TLS certificate auto-renewal and renewal alerts.
- [ ] Move sensitive server details into a restricted internal runbook.
- [ ] Create an atomic deployment process with health checks and rollback.
- [ ] Stop building directly over the live release directory.
- [ ] Add a `/health` endpoint.
- [ ] Add uptime, disk-space, certificate, and API-quota monitoring.
- [ ] Add privacy-safe error reporting and structured logs.
- [ ] Establish encrypted off-site backups and perform a restore drill.

## Voice assistant and privacy implementation

- [ ] Show an AI-assistant disclosure before a conversation begins.
- [ ] Show recording, transcription, and third-party-processing disclosures before microphone access.
- [ ] Link the privacy policy inside the voice modal.
- [ ] Record the privacy-notice version and consent timestamp for voice leads.
- [ ] Do not hardcode voice consent solely because the AI invoked a tool.
- [ ] Configure ElevenLabs audio saving and retention after receiving client approval.
- [ ] Prevent the assistant from providing medical, childcare-safety, or contractual advice.
- [ ] Add deterministic confirmation before the assistant saves contact information.
- [ ] Test the assistant against prompt injection, hallucinations, and unauthorized tool calls.
- [ ] Add a clear human-contact fallback.

## Forms and lead handling

- [ ] Add a privacy-policy link beside every consent checkbox.
- [ ] Record consent timestamp, source, and privacy-notice version.
- [ ] Add server-side bot verification.
- [ ] Normalize and validate phone numbers.
- [ ] Reject control characters and unsafe CSV prefixes.
- [ ] Add idempotency protection against duplicate submissions.
- [ ] Add clear error recovery and retry states.
- [ ] Add staff alerts for failed email notifications.
- [ ] Add lead deletion, correction, and export workflows for privacy requests.
- [ ] Confirm whether buttons should say "Request a Visit/Session" instead of "Book" until actual scheduling exists.

## Performance

- [ ] Convert and resize the 1.7 MB logo to responsive WebP/AVIF assets.
- [ ] Remove unnecessary `unoptimized` image usage.
- [ ] Dynamically load the ElevenLabs SDK only when the widget is opened.
- [ ] Prevent the entrance and traditional site from prefetching the full 3D application.
- [ ] Optimize or lazy-load the bear animation frames.
- [ ] Compress the hero video and provide WebM/MP4 variants.
- [ ] Add appropriate video preload behavior.
- [ ] Re-run mobile Lighthouse with a target LCP below 2.5 seconds.
- [ ] Test on slow Android devices and constrained mobile networks.

## Testing and release engineering

- [ ] Add unit tests for validation, authentication, rate limiting, and CSV escaping.
- [ ] Add database integration tests.
- [ ] Add API tests for valid, invalid, oversized, and abusive requests.
- [ ] Add Playwright tests for all public routes and forms.
- [ ] Test admin authentication and authorization.
- [ ] Test keyboard navigation, reduced motion, and screen readers.
- [ ] Test mobile layouts across common breakpoints.
- [ ] Add tests proving form fields accept W, A, S, and D on the game route.
- [ ] Add CI for lint, type checking, tests, build, and dependency auditing.
- [ ] Fix ESLint exclusions so `npm run lint` works consistently.
- [ ] Add Dependabot or equivalent dependency monitoring.
- [ ] Run OWASP ZAP against staging.
- [ ] Arrange a penetration test before handling production customer information.
- [ ] Run a load test for forms and voice-token issuance.

## SEO and public-site completeness

- [ ] Add `robots.txt`.
- [ ] Add `sitemap.xml`.
- [ ] Add canonical URLs.
- [ ] Add branded Open Graph and social preview images.
- [ ] Add a web manifest where appropriate.
- [ ] Add verified LocalBusiness, ChildCare, and Gym structured data.
- [ ] Configure a branded production domain.
- [ ] Add a custom 404 page.
- [ ] Add analytics only after the client approves the provider and consent requirements.
- [ ] Keep staging environments password-protected and `noindex`.

## Production release gate

Do not release publicly until all applicable P0 items are complete and the following checks pass:

- [ ] The production build, linting, type checking, and automated test suite pass in CI.
- [ ] The staging environment passes accessibility, mobile, security, and browser testing.
- [ ] The database backup has been restored successfully in a test environment.
- [ ] Monitoring, alerts, and rollback have been tested.
- [ ] A staging security review or penetration test has no unresolved critical or high-risk findings.
- [ ] All client-provided content and legal documents have received final approval.
