# Program pricing field + staff/trainer admin CMS

## Context

Going-live content audit found two structural gaps in the data model,
not just missing copy: `Program` has no `price` field at all, and staff
bios/photos are hardcoded in `content/fixtures/staff.ts` /
`trainers.ts` with no way to add a photo or edit copy without a code
deploy. The client has been asked (via WhatsApp) to send real staff
bios/photos, program pricing, and other content; this spec covers the
two places the current data model can't receive that content yet.

## Part A — Program pricing (bounded)

Add `price?: string` to `Program` (`lib/daydreams/types.ts`) — a
string, not a number, because real pricing here is display text like
"KES 8,000 / month", not a bare amount. Render it in
`components/daydreams/sections/ProgramsSection.tsx` next to the age
range, only when present. Leave every fixture's `price` unset until
the client sends real numbers — this is a schema change, not a content
fill-in. No migration needed; programs stay a static fixture.

## Part B — Staff/trainer admin CMS

### Goals

- An admin can create/edit/delete/reorder staff (Daydreams) and
  trainers (Dumbbells) — name, role, bio, accent color, photo — without
  a code deploy.
- Photos persist across redeploys (today's SQLite-file and
  static-fixture patterns in this repo don't survive a redeploy that
  rebuilds the working directory — this must not repeat that mistake).
- The public site's staff sections keep working exactly as they do
  today for anyone without a photo yet (colored initials badge).

### Non-goals

- Not building a general content-block CMS. Programs, testimonials,
  schedule, and site settings stay static fixtures — only staff/trainers
  move to the database, because photo upload is the actual requirement
  driving this change.
- No image resizing/cropping UI — a size cap + mime whitelist is
  suffient; if the client sends an oversized or wrong-aspect photo, an
  admin re-exports and re-uploads.

### Data model

New migration `lib/db/migrations/0005_staff.sql`, following the same
plain-SQL style as `0001_leads.sql`:

```sql
CREATE TABLE staff_members (
  id UUID PRIMARY KEY,
  brand TEXT NOT NULL CHECK (brand IN ('daydreams', 'dumbbells')),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT NOT NULL,
  accent_color TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  photo_data BYTEA,
  photo_mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_staff_members_brand ON staff_members (brand, display_order);
```

Photos are stored as `bytea` directly in Postgres — the same database
already used for leads — rather than the filesystem or a new object
storage service. This was chosen specifically because nothing on the
current deploy path guarantees a persistent, redeploy-safe directory
exists; the database is the one piece of storage in this repo that's
already backed up and known to survive redeploys.

The migration seeds all 8 current placeholder people (4 Daydreams
staff, 4 Dumbbells trainers) with their existing name/role/bio/
accent_color and `photo_data = NULL`, so the public site keeps showing
real-looking entries (minus photos) instead of going blank while real
content is collected — each row gets edited in place via the new admin
UI as real info arrives, rather than being typed from scratch.

### Data access — `lib/staff/store.ts`

Mirrors `lib/leads/store.ts`'s query style against `getDb()`:
- `listStaffByBrand(brand: "daydreams" | "dumbbells"): Promise<StaffMember[]>` — ordered by `display_order`, returns metadata + a `photoUrl` built from the id (not raw bytes).
- `getStaffPhoto(id): Promise<{ data: Buffer; mimeType: string } | null>` — bytes + mime only, for the photo route.
- `createStaff(input)`, `updateStaff(id, patch)`, `deleteStaff(id)`.
- `reorderStaff(brand, orderedIds: string[])` — bulk `display_order` update for the admin drag/reorder-by-buttons UI.

### Public photo serving

`app/staff-photo/[id]/route.ts` — a public (non-admin) GET route.
Looks up `getStaffPhoto(id)`, 404s if none, otherwise streams the
bytes with the stored `Content-Type` and a long `Cache-Control`.
Callers append `?v=<updatedAt>` to the URL wherever it's rendered, so
a cache-busting query param — not conditional-request logic — handles
the "admin replaced the photo" case.

### Admin UI

- `app/admin/staff/page.tsx` — list grouped by brand, with inline
  edit/delete forms and up/down reorder buttons (matching the
  zero-JS `<details>`-based inline-form pattern already used in
  `app/admin/classes/page.tsx`'s "Add classes" section, rather than
  introducing a new client-side form library).
- `app/admin/staff/actions.ts` — Server Actions
  (`createStaffAction`, `updateStaffAction`, `deleteStaffAction`,
  `reorderStaffAction`), each calling `requireAdminSession()` first
  and `logAdminAction` (`lib/admin/audit.ts`) after, exactly like
  `app/admin/kb/actions.ts`. Photo upload uses the same
  `formData.get("file") instanceof File` multipart pattern
  `createKbFileAction` already uses.
- Server-side validation: name/role/bio required; photo optional,
  capped at ~3MB, mime whitelist (`image/jpeg`, `image/png`,
  `image/webp`) — reject anything else with a clear inline error
  rather than silently dropping it.

### Public site wiring

`lib/daydreams/content.ts`'s `getStaff()` / `getTrainers()` switch
from reading `content/fixtures/staff.ts` / `trainers.ts` to calling
`listStaffByBrand("daydreams" | "dumbbells")`. `StaffMember`
(`lib/daydreams/types.ts`) gains `photoUrl?: string`.
`components/daydreams/sections/StaffSection.tsx` renders an `<img>`
when `photoUrl` is present; otherwise it keeps its existing
colored-initials-badge fallback unchanged — a person with no photo
yet still looks intentional, not broken.

Once this ships, `content/fixtures/staff.ts` and `trainers.ts` are
deleted — dead code once the database is the source of truth, not left
unused alongside their replacement.

### Error handling

- Missing/invalid photo mime or oversized file: reject server-side
  with an inline form error, no partial write.
- `app/staff-photo/[id]/route.ts` for an id with no `photo_data`:
  404 (not a broken image) — callers should already be omitting
  `photoUrl` in that case (checked at the `getStaff`/`getTrainers`
  layer), so this is a defensive fallback, not the normal path.
- Deleting a staff member removes their row (and photo bytes with it,
  same row) in one statement — no separate cleanup step to forget.

### Testing

- Unit tests for `lib/staff/store.ts` CRUD (create, list-by-brand
  ordering, update, delete, reorder) against the real Postgres DB,
  matching how `lib/leads` tests already run.
- Manual: create a staff member with a photo through the admin UI,
  confirm it renders on `/daydreams/site` (or `/dumbbells` for a
  trainer), edit it, delete it, and confirm the initials-badge
  fallback still renders correctly for photo-less entries.
