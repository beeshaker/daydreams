# Program pricing field + staff/trainer admin CMS — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a display-text `price` field to `Program`, and replace the hardcoded staff/trainer fixtures with a Postgres-backed admin CMS (create/edit/delete/reorder, with photo upload stored as `bytea`) so an admin can update staff content without a code deploy.

**Architecture:** Part A is a pure type + rendering change to the existing static `Program` fixture pipeline. Part B adds a new `staff_members` Postgres table (mirroring the existing `leads`/`admin_users` migration style), a `lib/staff/store.ts` data-access module mirroring `lib/leads/store.ts`, a public binary-streaming route for photos, and a zero-JS admin CRUD UI mirroring the `<details>`-based inline-form pattern and Server Action conventions already used by `app/admin/kb`. `lib/daydreams/content.ts`'s `getStaff()`/`getTrainers()` switch from static fixture imports to the new store, and the fixture files are deleted once nothing reads them.

**Tech Stack:** Next.js (App Router, Server Actions, Route Handlers), TypeScript, `pg` (node-postgres) against Postgres, Vitest for tests.

**Spec:** `docs/superpowers/specs/2026-09-14-staff-cms-and-program-pricing-design.md`

## Global Constraints

- `Program.price` is `price?: string` — a display string like `"KES 8,000 / month"`, never a number. Every existing fixture's `price` stays unset; this is a schema change only, not a content fill-in.
- `staff_members` schema is exactly (copy verbatim into `lib/db/migrations/0005_staff.sql`):
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
- Photos are stored as `bytea` in the same Postgres database already used for leads — never the filesystem — because nothing on the current deploy path guarantees a persistent, redeploy-safe directory.
- The migration itself seeds all 8 current placeholder people (4 `daydreams`, 4 `dumbbells`) with `photo_data = NULL`, using the exact name/role/bio/accent_color values already in `content/fixtures/staff.ts` / `trainers.ts` (reproduced in Task 2 below).
- Photo upload validation (server-side, no partial write on failure): required fields are name/role/bio; photo is optional, capped at 3MB, mime whitelist `image/jpeg`, `image/png`, `image/webp` — anything else is rejected with a clear inline error.
- `app/staff-photo/[id]/route.ts` is a **public** (non-admin) route: 404 when there's no `photo_data`, otherwise streams the bytes with the stored `Content-Type` and a long, immutable `Cache-Control`. Callers append `?v=<updatedAt>` for cache-busting after a photo replace.
- Every admin Server Action calls `requireAdminSession()` first and `logAdminAction()` (`lib/admin/audit.ts`) after, exactly like `app/admin/kb/actions.ts`.
- `StaffSection.tsx` renders an `<img>` when `photoUrl` is present; otherwise it keeps its existing colored-initials-badge fallback completely unchanged.
- Once wired, `content/fixtures/staff.ts` and `content/fixtures/trainers.ts` are deleted.
- Not building a general content-block CMS — programs, testimonials, schedule, and site settings stay static fixtures. No image resizing/cropping UI.

### Plan-level rulings (deviations from the spec's literal text, decided up front)

- **Ruling — `app/admin/classes/page.tsx` doesn't exist on `main`.** The spec cites it as the precedent for the zero-JS `<details>`-based inline-form pattern, but that file only exists in an unmerged worktree (`.claude/worktrees/class-booking-whatsapp`). This plan reproduces the same pattern (native `<details>`/`<summary>` for progressive disclosure, plain `<form action={serverAction}>` Server Actions, no client-side form library) directly against `main`'s actual conventions (`app/admin/kb/page.tsx`, `app/admin/kb/[documentId]/page.tsx`, `app/admin/leads/page.tsx`) — plain Tailwind utility classes, no shared `Button`/`Card`/`Field` components (those also only exist in the worktree). Cost if wrong: the admin staff UI looks slightly different from a future merge of that worktree; trivially reconcilable later.
- **Ruling — inline validation errors use a redirect + `?error=` query param banner**, not `useActionState` (used only by the login/MFA forms in this codebase, which are client components) and not silently dropping invalid input (which is what `app/admin/kb/actions.ts` currently does). This keeps every staff form a plain zero-JS `<form action={...}>` while still surfacing a clear inline error, per the spec's error-handling section. Cost if wrong: an admin rejected for a bad photo sees a page-level banner instead of a per-field error; acceptable for a single-operator admin tool matching this repo's existing bar.
- **Ruling — `/dumbbells` doesn't currently render any staff/trainer section** (it's a bespoke scroll-craft HTML page authored directly in `app/dumbbells/page.tsx`, not composed from `lib/daydreams/content.ts` getters — `getTrainers()` is currently only consumed by `lib/knowledge-base/buildSeedMarkdown.ts`). The spec's manual test step ("confirm it renders on `/dumbbells` for a trainer") doesn't apply as written. This plan's manual verification instead checks the admin list view and (for trainers) the `buildSeedMarkdown()` output, and confirms the Daydreams-side rendering (`/daydreams/site`, `/daydreams`) end-to-end. Cost if wrong: none — this only affects which manual check is performed, not what ships.
- **Ruling — store CRUD tests run against the real local Postgres** the project already uses for dev (`DATABASE_URL` in `.env`, backed by the `daydreams-postgres` Docker container on `127.0.0.1:5434`), per the spec's explicit instruction, even though no prior `lib/leads` test actually does this (the spec's claim that one does is inaccurate — there is no precedent test file). Vitest does not load `.env` by default, so Task 3 first adds `loadEnv` wiring to `vitest.config.ts`. Cost if wrong: store tests fail in an environment without that Postgres instance reachable; this matches how the app itself already requires `DATABASE_URL` to run at all.
- **Ruling — the migration generates seed row ids with `gen_random_uuid()`** (built into Postgres core since v13, no extension needed) rather than the app-level `crypto.randomUUID()` pattern `lib/leads/store.ts` uses for runtime inserts — the seed rows are raw SQL in a migration file, not app code, so there's no JS runtime to call `crypto.randomUUID()` from. Runtime-created staff (via `createStaff`) still generates ids the same way `saveLead` does. Cost if wrong: none — this is just where the UUID is generated, not a behavior difference.

---

## Task 1: Program pricing field

**Files:**
- Modify: `lib/daydreams/types.ts`
- Modify: `components/daydreams/sections/ProgramsSection.tsx`
- Test: `components/daydreams/sections/ProgramsSection.test.tsx`

**Interfaces:**
- Produces: `Program.price?: string` on the existing `Program` type — later tasks don't depend on this (Part A is independent of Part B).

- [ ] **Step 1: Write the failing test**

Create `components/daydreams/sections/ProgramsSection.test.tsx`:

```tsx
import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ProgramsSection } from "./ProgramsSection";
import type { Program } from "@/lib/daydreams/types";

afterEach(cleanup);

const basProgram: Program = {
  id: "wobblers",
  title: "Wobblers",
  shortDescription: "Short desc",
  description: "Full desc",
  ageRange: "6-18 months",
  accentColor: "#F4A259",
};

describe("ProgramsSection", () => {
  it("renders the age range without a price when price is unset", () => {
    render(<ProgramsSection programs={[basProgram]} />);
    expect(screen.getByText("6-18 months")).toBeInTheDocument();
    expect(screen.queryByText(/KES/)).not.toBeInTheDocument();
  });

  it("renders the price next to the age range when present", () => {
    render(<ProgramsSection programs={[{ ...basProgram, price: "KES 8,000 / month" }]} />);
    expect(screen.getByText(/6-18 months/)).toHaveTextContent("KES 8,000 / month");
  });

  it("renders the price for an image-backed program card too", () => {
    render(
      <ProgramsSection
        programs={[{ ...basProgram, src: "/programs/wobblers.jpg", price: "KES 8,000 / month" }]}
      />,
    );
    expect(screen.getByText(/6-18 months/)).toHaveTextContent("KES 8,000 / month");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/daydreams/sections/ProgramsSection.test.tsx`
Expected: FAIL — `price` doesn't exist on `Program`, and the rendered text doesn't include it.

- [ ] **Step 3: Add `price` to the `Program` type**

In `lib/daydreams/types.ts`, find:

```ts
export type Program = {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  ageRange: string;
  accentColor: string;
  /** Falls back to accentColor as a flat card treatment when absent. */
  src?: string;
};
```

Replace with:

```ts
export type Program = {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  ageRange: string;
  accentColor: string;
  /** Display text, e.g. "KES 8,000 / month" — never a bare number. */
  price?: string;
  /** Falls back to accentColor as a flat card treatment when absent. */
  src?: string;
};
```

- [ ] **Step 4: Render the price next to the age range in `ProgramsSection.tsx`**

In `components/daydreams/sections/ProgramsSection.tsx`, replace both age-range paragraphs:

```tsx
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/70">
              {program.ageRange}
            </p>
```

with:

```tsx
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/70">
              {program.ageRange}
              {program.price ? ` · ${program.price}` : ""}
            </p>
```

and:

```tsx
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand-ink/60 zone-dark:text-white/50">
              {program.ageRange}
            </p>
```

with:

```tsx
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand-ink/60 zone-dark:text-white/50">
              {program.ageRange}
              {program.price ? ` · ${program.price}` : ""}
            </p>
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run components/daydreams/sections/ProgramsSection.test.tsx`
Expected: PASS (3/3)

- [ ] **Step 6: Commit**

```bash
git add lib/daydreams/types.ts components/daydreams/sections/ProgramsSection.tsx components/daydreams/sections/ProgramsSection.test.tsx
git commit -m "feat: add optional display-text price to Program"
```

---

## Task 2: `staff_members` migration + seed data

**Files:**
- Create: `lib/db/migrations/0005_staff.sql`
- Modify: `lib/db/migrate.ts`
- Test: `lib/db/migrations/0005_staff.test.ts`

**Interfaces:**
- Produces: a `staff_members` table (schema exactly as in Global Constraints) seeded with 8 rows (4 `brand = 'daydreams'`, 4 `brand = 'dumbbells'`), each with `photo_data IS NULL` and a distinct `display_order` per brand starting at 0. Task 3's `lib/staff/store.ts` reads/writes this table.
- Consumes: nothing new — `lib/db/migrate.ts`'s existing `MIGRATIONS` array and `runMigrations()` mechanism (unchanged behavior, just one more entry).

**Context:** `getDb()` (`lib/db/client.ts`) runs `runMigrations()` automatically on first connect, so simply adding this migration file and registering it is enough for it to apply the next time any code calls `getDb()` — including these tests. `DATABASE_URL` must be set in the environment (already true via `.env` in this project for local dev, pointed at a Postgres instance the `daydreams-postgres` Docker container serves on `127.0.0.1:5434` — start it with `docker start daydreams-postgres` if it's not running).

- [ ] **Step 1: Write the failing test**

Create `lib/db/migrations/0005_staff.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { getDb } from "@/lib/db/client";

describe("0005_staff migration", () => {
  it("creates staff_members seeded with 4 daydreams and 4 dumbbells placeholders", async () => {
    const pool = await getDb();
    const { rows } = await pool.query<{ brand: string; count: string }>(
      "SELECT brand, COUNT(*) FROM staff_members GROUP BY brand",
    );
    const counts = Object.fromEntries(rows.map((row) => [row.brand, Number(row.count)]));
    expect(counts.daydreams).toBe(4);
    expect(counts.dumbbells).toBe(4);
  });

  it("seeds every row with no photo and a per-brand display_order starting at 0", async () => {
    const pool = await getDb();
    const { rows } = await pool.query<{
      brand: string;
      display_order: number;
      photo_data: Buffer | null;
    }>("SELECT brand, display_order, photo_data FROM staff_members ORDER BY brand, display_order");

    expect(rows.every((row) => row.photo_data === null)).toBe(true);

    const daydreamsOrders = rows.filter((row) => row.brand === "daydreams").map((row) => row.display_order);
    const dumbbellsOrders = rows.filter((row) => row.brand === "dumbbells").map((row) => row.display_order);
    expect(daydreamsOrders).toEqual([0, 1, 2, 3]);
    expect(dumbbellsOrders).toEqual([0, 1, 2, 3]);
  });

  it("rejects a brand outside the daydreams/dumbbells check constraint", async () => {
    const pool = await getDb();
    await expect(
      pool.query(
        `INSERT INTO staff_members (id, brand, name, role, bio, accent_color, display_order)
         VALUES (gen_random_uuid(), 'not-a-brand', 'X', 'X', 'X', '#000000', 0)`,
      ),
    ).rejects.toThrow();
  });
});
```

**Important:** this test file needs `DATABASE_URL` visible to Vitest. Before running it, apply Step 1 of Task 3's `vitest.config.ts` change first if it hasn't landed yet — or, to unblock this task standalone, temporarily run with the env var exported directly:

Run: `export $(grep -v '^#' .env | xargs -d '\n') && npx vitest run lib/db/migrations/0005_staff.test.ts`
Expected: FAIL — `relation "staff_members" does not exist`.

- [ ] **Step 2: Create the migration file**

Create `lib/db/migrations/0005_staff.sql`:

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

INSERT INTO staff_members (id, brand, name, role, bio, accent_color, display_order) VALUES
  (gen_random_uuid(), 'daydreams', 'Maria Chen', 'Lead Teacher, Wobblers', 'Maria has spent eight years specializing in infant care and loves narrating everything she does so little ones start soaking up language early.', '#F4A259', 0),
  (gen_random_uuid(), 'daydreams', 'James Okafor', 'Lead Teacher, Explorers', 'A former camp counselor, James turns snack time and cleanup into games and always has a pocket full of surprising facts about bugs.', '#5FA8D3', 1),
  (gen_random_uuid(), 'daydreams', 'Priya Nair', 'Lead Teacher, Dreambuilders', 'Priya designs the weekly themes that tie together stories, art, and counting games, and leads our monthly family show-and-tell.', '#9B5DE5', 2),
  (gen_random_uuid(), 'daydreams', 'Sam Torres', 'Center Director', 'Sam oversees day-to-day operations and is usually the first friendly face you meet at drop-off.', '#2EC4B6', 3),
  (gen_random_uuid(), 'dumbbells', 'Marcus Webb', 'Head Strength Coach', 'Marcus competed as a powerlifter for a decade and now geeks out over fixing your deadlift setup more than his own PRs.', '#c4214b', 0),
  (gen_random_uuid(), 'dumbbells', 'Dana Okafor', 'HIIT & Conditioning Coach', 'Dana builds every bootcamp playlist herself and swears the right song can shave ten seconds off your mile.', '#7443a3', 1),
  (gen_random_uuid(), 'dumbbells', 'Leo Fischer', 'Mobility Coach', 'A former physical therapist assistant, Leo can spot a tight hip flexor from across the room and will absolutely call yours out.', '#a39093', 2),
  (gen_random_uuid(), 'dumbbells', 'Renee Ibarra', 'Gym Manager', 'Renee runs the front desk, the class schedule, and — most mornings — the espresso machine, usually all at once.', '#8a3352', 3);
```

- [ ] **Step 3: Register the migration**

In `lib/db/migrate.ts`, change:

```ts
const MIGRATIONS: Migration[] = [
  "0001_leads",
  "0002_admin_users",
  "0003_audit_log",
  "0004_rate_limit",
].map((id) => ({
```

to:

```ts
const MIGRATIONS: Migration[] = [
  "0001_leads",
  "0002_admin_users",
  "0003_audit_log",
  "0004_rate_limit",
  "0005_staff",
].map((id) => ({
```

- [ ] **Step 4: Run test to verify it passes**

Run: `export $(grep -v '^#' .env | xargs -d '\n') && npx vitest run lib/db/migrations/0005_staff.test.ts`
Expected: PASS (3/3)

- [ ] **Step 5: Commit**

```bash
git add lib/db/migrations/0005_staff.sql lib/db/migrate.ts lib/db/migrations/0005_staff.test.ts
git commit -m "feat: add staff_members migration with placeholder seed data"
```

---

## Task 3: `lib/staff/store.ts` data access layer

**Files:**
- Create: `lib/staff/store.ts`
- Test: `lib/staff/store.test.ts`
- Modify: `vitest.config.ts`

**Interfaces:**
- Consumes: the `staff_members` table from Task 2; `getDb()` and `withTransaction()` from `lib/db/client.ts` / `lib/db/withTransaction.ts`.
- Produces (used by Tasks 4, 5, 6, 7):
  - `export type StaffBrand = "daydreams" | "dumbbells";`
  - `export type StoredStaffMember = { id: string; brand: StaffBrand; name: string; role: string; bio: string; accentColor: string; displayOrder: number; photoUrl?: string; createdAt: string; updatedAt: string };`
  - `export type StaffPhoto = { data: Buffer; mimeType: string };`
  - `export type CreateStaffInput = { brand: StaffBrand; name: string; role: string; bio: string; accentColor: string; photo?: StaffPhoto };`
  - `export type UpdateStaffPatch = { name?: string; role?: string; bio?: string; accentColor?: string; photo?: StaffPhoto };`
  - `export async function listStaffByBrand(brand: StaffBrand): Promise<StoredStaffMember[]>` — ordered by `display_order` ascending.
  - `export async function getStaffPhoto(id: string): Promise<StaffPhoto | null>`.
  - `export async function createStaff(input: CreateStaffInput): Promise<StoredStaffMember>`.
  - `export async function updateStaff(id: string, patch: UpdateStaffPatch): Promise<StoredStaffMember | null>` — an omitted `patch.photo` leaves the stored photo untouched (no way to remove a photo without replacing it — out of scope per the spec's non-goals).
  - `export async function deleteStaff(id: string): Promise<void>`.
  - `export async function reorderStaff(brand: StaffBrand, orderedIds: string[]): Promise<void>` — sets `display_order` to each id's index in `orderedIds`, scoped to `brand`.
  - `photoUrl` is built as `` `/staff-photo/${id}?v=${updatedAt.getTime()}` `` whenever the row has photo bytes, `undefined` otherwise.

**Context:** Vitest doesn't load `.env` by default (verified: a bare `process.env.DATABASE_URL` check fails under the current config). Step 1 below fixes that globally for the test suite using Vite's `loadEnv`, which has been confirmed to work in this repo. This lets these tests — and Task 2's, if not already run with the manual `export` workaround — pick up `DATABASE_URL` automatically with plain `npx vitest run`.

- [ ] **Step 1: Wire `.env` loading into Vitest**

Replace the full contents of `vitest.config.ts` with:

```ts
import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import path from "node:path";

export default defineConfig(({ mode }) => ({
  test: {
    environment: "jsdom",
    globals: false,
    exclude: ["**/node_modules/**", "**/.next/**", ".claude/worktrees/**"],
    env: loadEnv(mode, process.cwd(), ""),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
}));
```

- [ ] **Step 2: Confirm the whole suite still runs after the config change**

Run: `npx vitest run`
Expected: same pass/fail results as before this change for every existing test file (no regressions from the config edit itself). `lib/db/migrations/0005_staff.test.ts` from Task 2 should now pass without the manual `export` workaround.

- [ ] **Step 3: Write the failing tests**

Create `lib/staff/store.test.ts`:

```ts
import { describe, it, expect, afterEach } from "vitest";
import {
  createStaff,
  listStaffByBrand,
  updateStaff,
  deleteStaff,
  reorderStaff,
  getStaffPhoto,
} from "./store";

const createdIds: string[] = [];

afterEach(async () => {
  while (createdIds.length > 0) {
    const id = createdIds.pop();
    if (id) await deleteStaff(id);
  }
});

function track<T extends { id: string }>(member: T): T {
  createdIds.push(member.id);
  return member;
}

describe("lib/staff/store", () => {
  it("creates a staff member and lists it by brand", async () => {
    const created = track(
      await createStaff({
        brand: "daydreams",
        name: "Test Teacher",
        role: "Test Role",
        bio: "Test bio",
        accentColor: "#112233",
      }),
    );

    const list = await listStaffByBrand("daydreams");
    const found = list.find((member) => member.id === created.id);
    expect(found).toBeDefined();
    expect(found?.name).toBe("Test Teacher");
    expect(found?.photoUrl).toBeUndefined();
  });

  it("orders newly created staff after existing rows within the same brand", async () => {
    const first = track(
      await createStaff({ brand: "dumbbells", name: "First", role: "R", bio: "B", accentColor: "#000000" }),
    );
    const second = track(
      await createStaff({ brand: "dumbbells", name: "Second", role: "R", bio: "B", accentColor: "#000000" }),
    );

    const list = await listStaffByBrand("dumbbells");
    const firstIndex = list.findIndex((member) => member.id === first.id);
    const secondIndex = list.findIndex((member) => member.id === second.id);
    expect(firstIndex).toBeLessThan(secondIndex);
  });

  it("stores and serves photo bytes separately from list metadata", async () => {
    const data = Buffer.from([9, 9, 9]);
    const created = track(
      await createStaff({
        brand: "daydreams",
        name: "Photo Person",
        role: "R",
        bio: "B",
        accentColor: "#abcdef",
        photo: { data, mimeType: "image/png" },
      }),
    );

    expect(created.photoUrl).toContain(created.id);

    const photo = await getStaffPhoto(created.id);
    expect(photo?.mimeType).toBe("image/png");
    expect(photo?.data.equals(data)).toBe(true);
  });

  it("updates fields without touching an unspecified photo", async () => {
    const data = Buffer.from([1]);
    const created = track(
      await createStaff({
        brand: "daydreams",
        name: "Before",
        role: "R",
        bio: "B",
        accentColor: "#111111",
        photo: { data, mimeType: "image/jpeg" },
      }),
    );

    const updated = await updateStaff(created.id, { name: "After" });
    expect(updated?.name).toBe("After");

    const photo = await getStaffPhoto(created.id);
    expect(photo?.data.equals(data)).toBe(true);
  });

  it("returns null from updateStaff for an id that doesn't exist", async () => {
    const updated = await updateStaff("00000000-0000-0000-0000-000000000000", { name: "Nope" });
    expect(updated).toBeNull();
  });

  it("deletes a staff member", async () => {
    const created = await createStaff({
      brand: "daydreams",
      name: "To Delete",
      role: "R",
      bio: "B",
      accentColor: "#222222",
    });

    await deleteStaff(created.id);
    const list = await listStaffByBrand("daydreams");
    expect(list.find((member) => member.id === created.id)).toBeUndefined();
  });

  it("returns null from getStaffPhoto when there's no photo", async () => {
    const created = track(
      await createStaff({ brand: "daydreams", name: "No Photo", role: "R", bio: "B", accentColor: "#333333" }),
    );
    const photo = await getStaffPhoto(created.id);
    expect(photo).toBeNull();
  });

  it("reorders staff within a brand", async () => {
    const a = track(await createStaff({ brand: "dumbbells", name: "A", role: "R", bio: "B", accentColor: "#000000" }));
    const b = track(await createStaff({ brand: "dumbbells", name: "B", role: "R", bio: "B", accentColor: "#000000" }));

    const before = await listStaffByBrand("dumbbells");
    const beforeIds = before.map((member) => member.id);

    await reorderStaff("dumbbells", [...beforeIds].reverse());

    const after = await listStaffByBrand("dumbbells");
    expect(after.map((member) => member.id)).toEqual([...beforeIds].reverse());
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx vitest run lib/staff/store.test.ts`
Expected: FAIL — `Cannot find module './store'`.

- [ ] **Step 5: Implement `lib/staff/store.ts`**

```ts
import { getDb } from "@/lib/db/client";
import { withTransaction } from "@/lib/db/withTransaction";

export type StaffBrand = "daydreams" | "dumbbells";

export type StoredStaffMember = {
  id: string;
  brand: StaffBrand;
  name: string;
  role: string;
  bio: string;
  accentColor: string;
  displayOrder: number;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type StaffPhoto = { data: Buffer; mimeType: string };

export type CreateStaffInput = {
  brand: StaffBrand;
  name: string;
  role: string;
  bio: string;
  accentColor: string;
  photo?: StaffPhoto;
};

export type UpdateStaffPatch = {
  name?: string;
  role?: string;
  bio?: string;
  accentColor?: string;
  photo?: StaffPhoto;
};

type StaffRow = {
  id: string;
  brand: StaffBrand;
  name: string;
  role: string;
  bio: string;
  accent_color: string;
  display_order: number;
  has_photo: boolean;
  created_at: Date;
  updated_at: Date;
};

const STAFF_ROW_COLUMNS = `
  id, brand, name, role, bio, accent_color, display_order,
  (photo_data IS NOT NULL) AS has_photo, created_at, updated_at
`;

function rowToStaffMember(row: StaffRow): StoredStaffMember {
  return {
    id: row.id,
    brand: row.brand,
    name: row.name,
    role: row.role,
    bio: row.bio,
    accentColor: row.accent_color,
    displayOrder: row.display_order,
    photoUrl: row.has_photo ? `/staff-photo/${row.id}?v=${row.updated_at.getTime()}` : undefined,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function listStaffByBrand(brand: StaffBrand): Promise<StoredStaffMember[]> {
  const pool = await getDb();
  const { rows } = await pool.query<StaffRow>(
    `SELECT ${STAFF_ROW_COLUMNS} FROM staff_members WHERE brand = $1 ORDER BY display_order ASC, created_at ASC`,
    [brand],
  );
  return rows.map(rowToStaffMember);
}

export async function getStaffPhoto(id: string): Promise<StaffPhoto | null> {
  const pool = await getDb();
  const { rows } = await pool.query<{ photo_data: Buffer; photo_mime_type: string }>(
    "SELECT photo_data, photo_mime_type FROM staff_members WHERE id = $1 AND photo_data IS NOT NULL",
    [id],
  );
  const row = rows[0];
  return row ? { data: row.photo_data, mimeType: row.photo_mime_type } : null;
}

export async function createStaff(input: CreateStaffInput): Promise<StoredStaffMember> {
  const pool = await getDb();
  const { rows } = await pool.query<StaffRow>(
    `INSERT INTO staff_members (id, brand, name, role, bio, accent_color, display_order, photo_data, photo_mime_type)
     VALUES ($1, $2, $3, $4, $5, $6, (SELECT COALESCE(MAX(display_order), -1) + 1 FROM staff_members WHERE brand = $2), $7, $8)
     RETURNING ${STAFF_ROW_COLUMNS}`,
    [
      crypto.randomUUID(),
      input.brand,
      input.name,
      input.role,
      input.bio,
      input.accentColor,
      input.photo?.data ?? null,
      input.photo?.mimeType ?? null,
    ],
  );
  return rowToStaffMember(rows[0]);
}

export async function updateStaff(id: string, patch: UpdateStaffPatch): Promise<StoredStaffMember | null> {
  const pool = await getDb();
  const { rows } = await pool.query<StaffRow>(
    `UPDATE staff_members
     SET name = COALESCE($2, name),
         role = COALESCE($3, role),
         bio = COALESCE($4, bio),
         accent_color = COALESCE($5, accent_color),
         photo_data = COALESCE($6, photo_data),
         photo_mime_type = COALESCE($7, photo_mime_type),
         updated_at = now()
     WHERE id = $1
     RETURNING ${STAFF_ROW_COLUMNS}`,
    [
      id,
      patch.name ?? null,
      patch.role ?? null,
      patch.bio ?? null,
      patch.accentColor ?? null,
      patch.photo?.data ?? null,
      patch.photo?.mimeType ?? null,
    ],
  );
  return rows[0] ? rowToStaffMember(rows[0]) : null;
}

export async function deleteStaff(id: string): Promise<void> {
  const pool = await getDb();
  await pool.query("DELETE FROM staff_members WHERE id = $1", [id]);
}

export async function reorderStaff(brand: StaffBrand, orderedIds: string[]): Promise<void> {
  await withTransaction(async (client) => {
    for (let index = 0; index < orderedIds.length; index += 1) {
      await client.query(
        "UPDATE staff_members SET display_order = $3, updated_at = now() WHERE id = $1 AND brand = $2",
        [orderedIds[index], brand, index],
      );
    }
  });
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run lib/staff/store.test.ts`
Expected: PASS (8/8)

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts lib/staff/store.ts lib/staff/store.test.ts
git commit -m "feat: add lib/staff/store.ts data access layer for staff_members"
```

---

## Task 4: Public photo-serving route

**Files:**
- Create: `app/staff-photo/[id]/route.ts`
- Test: `app/staff-photo/[id]/route.test.ts`

**Interfaces:**
- Consumes: `getStaffPhoto(id: string): Promise<{ data: Buffer; mimeType: string } | null>` from `lib/staff/store.ts` (Task 3).
- Produces: `GET /staff-photo/[id]` — 404 (empty body) when no photo, otherwise 200 with the photo bytes, `Content-Type` set to the stored mime type, and a long-lived immutable `Cache-Control`.

- [ ] **Step 1: Write the failing test**

Create `app/staff-photo/[id]/route.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("@/lib/staff/store", () => ({
  getStaffPhoto: vi.fn(),
}));

import { getStaffPhoto } from "@/lib/staff/store";
import { GET } from "./route";

afterEach(() => {
  vi.mocked(getStaffPhoto).mockReset();
});

describe("GET /staff-photo/[id]", () => {
  it("returns 404 when there's no photo", async () => {
    vi.mocked(getStaffPhoto).mockResolvedValueOnce(null);

    const response = await GET(new Request("http://test/staff-photo/missing"), {
      params: Promise.resolve({ id: "missing" }),
    });

    expect(response.status).toBe(404);
  });

  it("streams the photo bytes with the stored content type and a long cache lifetime", async () => {
    const data = Buffer.from([1, 2, 3]);
    vi.mocked(getStaffPhoto).mockResolvedValueOnce({ data, mimeType: "image/png" });

    const response = await GET(new Request("http://test/staff-photo/abc"), {
      params: Promise.resolve({ id: "abc" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.get("Cache-Control")).toContain("immutable");
    const body = Buffer.from(await response.arrayBuffer());
    expect(body.equals(data)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/staff-photo/[id]/route.test.ts`
Expected: FAIL — `Cannot find module './route'`.

- [ ] **Step 3: Implement the route**

Create `app/staff-photo/[id]/route.ts`:

```ts
import { getStaffPhoto } from "@/lib/staff/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const photo = await getStaffPhoto(id);

  if (!photo) {
    return new Response(null, { status: 404 });
  }

  return new Response(photo.data, {
    headers: {
      "Content-Type": photo.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/staff-photo/[id]/route.test.ts`
Expected: PASS (2/2)

- [ ] **Step 5: Commit**

```bash
git add app/staff-photo/[id]/route.ts app/staff-photo/[id]/route.test.ts
git commit -m "feat: add public staff photo serving route"
```

---

## Task 5: Admin Server Actions for staff CRUD

**Files:**
- Create: `app/admin/staff/actions.ts`

**Interfaces:**
- Consumes: `createStaff`, `updateStaff`, `deleteStaff`, `reorderStaff`, `type StaffBrand` from `lib/staff/store.ts` (Task 3); `requireAdminSession`, `type AdminSessionData` from `lib/admin/session.ts`; `logAdminAction` from `lib/admin/audit.ts`.
- Produces (consumed by Task 6's `app/admin/staff/page.tsx`):
  - `export async function createStaffAction(formData: FormData): Promise<void>` — reads `brand`, `name`, `role`, `bio`, `accentColor`, `photo` (a `File` under key `"photo"`, optional).
  - `export async function updateStaffAction(formData: FormData): Promise<void>` — reads `id`, `brand` (for the error-redirect target), `name`, `role`, `bio`, `accentColor`, `photo` (optional; omitted/empty keeps the existing photo).
  - `export async function deleteStaffAction(formData: FormData): Promise<void>` — reads `id`.
  - `export async function reorderStaffAction(formData: FormData): Promise<void>` — reads `brand` and repeated `orderedIds` fields (`formData.getAll("orderedIds")`), in the desired final order.
  - On validation failure, every action redirects to `` `/admin/staff?error=<message>&brand=<brand>` `` (no partial write happens before the redirect). On success, each redirects to `/admin/staff` after revalidating `/admin/staff`, `/daydreams/site`, and `/daydreams`.

**Context:** This mirrors `app/admin/kb/actions.ts`'s shape (`"use server"`, `requireAdminSession()` first, `logAdminAction` after, `revalidatePath` + `redirect` on success) but adds inline validation with an error redirect, per this plan's ruling on zero-JS error banners (see Global Constraints). There is no test for this file, matching `app/admin/kb/actions.ts`'s own lack of one — validation is exercised indirectly by Task 6's manual verification.

- [ ] **Step 1: Implement `app/admin/staff/actions.ts`**

```ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdminSession, type AdminSessionData } from "@/lib/admin/session";
import { logAdminAction } from "@/lib/admin/audit";
import {
  createStaff,
  updateStaff,
  deleteStaff,
  reorderStaff,
  type StaffBrand,
  type StaffPhoto,
} from "@/lib/staff/store";

const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
const ALLOWED_PHOTO_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
const BRANDS: StaffBrand[] = ["daydreams", "dumbbells"];

function isStaffBrand(value: string): value is StaffBrand {
  return (BRANDS as string[]).includes(value);
}

function audit(session: AdminSessionData, action: string, targetId?: string) {
  return logAdminAction({
    actorId: session.userId ?? null,
    actorUsername: session.username ?? "unknown",
    action,
    targetType: "staff_member",
    targetId,
  });
}

function failWith(brand: string, message: string): never {
  redirect(`/admin/staff?error=${encodeURIComponent(message)}&brand=${encodeURIComponent(brand)}`);
}

function revalidateStaffPaths(): void {
  revalidatePath("/admin/staff");
  revalidatePath("/daydreams/site");
  revalidatePath("/daydreams");
}

async function readOptionalPhoto(formData: FormData, brand: string): Promise<StaffPhoto | undefined> {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return undefined;

  if (file.size > MAX_PHOTO_BYTES) {
    failWith(brand, "Photo must be 3MB or smaller.");
  }
  if (!ALLOWED_PHOTO_MIME_TYPES.has(file.type)) {
    failWith(brand, "Photo must be a JPEG, PNG, or WebP image.");
  }

  const data = Buffer.from(await file.arrayBuffer());
  return { data, mimeType: file.type };
}

function readRequiredFields(formData: FormData, brand: string) {
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const accentColor = String(formData.get("accentColor") ?? "").trim();

  if (!name || !role || !bio) {
    failWith(brand, "Name, role, and bio are required.");
  }
  if (!HEX_COLOR_PATTERN.test(accentColor)) {
    failWith(brand, "Accent color must be a hex color, e.g. #5FA8D3.");
  }

  return { name, role, bio, accentColor };
}

export async function createStaffAction(formData: FormData): Promise<void> {
  const session = await requireAdminSession();
  const brandValue = String(formData.get("brand") ?? "");
  if (!isStaffBrand(brandValue)) {
    failWith("daydreams", "Invalid brand.");
  }

  const fields = readRequiredFields(formData, brandValue);
  const photo = await readOptionalPhoto(formData, brandValue);

  const created = await createStaff({ brand: brandValue, ...fields, photo });
  await audit(session, "staff.create", created.id);
  revalidateStaffPaths();
  redirect("/admin/staff");
}

export async function updateStaffAction(formData: FormData): Promise<void> {
  const session = await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const brandValue = String(formData.get("brand") ?? "daydreams");
  if (!id) {
    failWith(brandValue, "Missing staff id.");
  }

  const fields = readRequiredFields(formData, brandValue);
  const photo = await readOptionalPhoto(formData, brandValue);

  const updated = await updateStaff(id, { ...fields, photo });
  if (!updated) {
    failWith(brandValue, "Staff member not found.");
  }
  await audit(session, "staff.update", id);
  revalidateStaffPaths();
  redirect("/admin/staff");
}

export async function deleteStaffAction(formData: FormData): Promise<void> {
  const session = await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await deleteStaff(id);
  await audit(session, "staff.delete", id);
  revalidateStaffPaths();
  redirect("/admin/staff");
}

export async function reorderStaffAction(formData: FormData): Promise<void> {
  const session = await requireAdminSession();
  const brandValue = String(formData.get("brand") ?? "");
  if (!isStaffBrand(brandValue)) return;

  const orderedIds = formData.getAll("orderedIds").map((value) => String(value));
  if (orderedIds.length === 0) return;

  await reorderStaff(brandValue, orderedIds);
  await audit(session, "staff.reorder", brandValue);
  revalidateStaffPaths();
  redirect("/admin/staff");
}
```

- [ ] **Step 2: Sanity-check the module compiles**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep "app/admin/staff/actions.ts" || echo "no errors in this file"`
Expected: `no errors in this file` (some pre-existing unrelated errors elsewhere in the repo, if any, are not this task's concern).

- [ ] **Step 3: Commit**

```bash
git add app/admin/staff/actions.ts
git commit -m "feat: add admin staff CRUD/reorder Server Actions"
```

---

## Task 6: Admin staff UI

**Files:**
- Create: `app/admin/staff/page.tsx`
- Modify: `app/admin/kb/page.tsx`
- Modify: `app/admin/leads/page.tsx`

**Interfaces:**
- Consumes: `listStaffByBrand`, `type StaffBrand`, `type StoredStaffMember` from `lib/staff/store.ts` (Task 3); `createStaffAction`, `updateStaffAction`, `deleteStaffAction`, `reorderStaffAction` from `./actions` (Task 5).
- Produces: the `/admin/staff` page, and a "Staff" nav link added to the other two admin pages' header nav (matching the existing `Link` list pattern each already has).

**Context:** `/admin/staff` needs Next's generated `PageProps<"/admin/staff">` type (the same helper `app/admin/kb/page.tsx` and `app/admin/leads/page.tsx` already use). These types are generated by `next dev`/`next build`/`next typegen` scanning the `app/` directory — if TypeScript can't resolve `PageProps<"/admin/staff">` yet, run `npx next typegen` once after creating the file.

- [ ] **Step 1: Create `app/admin/staff/page.tsx`**

```tsx
import Link from "next/link";
import { listStaffByBrand, type StaffBrand, type StoredStaffMember } from "@/lib/staff/store";
import { createStaffAction, updateStaffAction, deleteStaffAction, reorderStaffAction } from "./actions";

export const metadata = {
  title: "Admin — Staff",
};

export const dynamic = "force-dynamic";

const SECTIONS: { brand: StaffBrand; heading: string; addLabel: string }[] = [
  { brand: "daydreams", heading: "Daydreams staff", addLabel: "Add staff member" },
  { brand: "dumbbells", heading: "Dumbbells trainers", addLabel: "Add trainer" },
];

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function swap(ids: string[], i: number, j: number): string[] {
  const copy = [...ids];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export default async function AdminStaffPage(props: PageProps<"/admin/staff">) {
  const searchParams = await props.searchParams;
  const error = firstParam(searchParams.error);
  const erroredBrand = firstParam(searchParams.brand);

  const [daydreamsStaff, dumbbellsStaff] = await Promise.all([
    listStaffByBrand("daydreams"),
    listStaffByBrand("dumbbells"),
  ]);
  const staffByBrand: Record<StaffBrand, StoredStaffMember[]> = {
    daydreams: daydreamsStaff,
    dumbbells: dumbbellsStaff,
  };

  return (
    <div className="min-h-screen bg-brand-bg px-6 py-10 text-brand-ink">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Staff</h1>
          <div className="flex gap-3 text-sm">
            <Link href="/admin/leads" className="text-brand-lavender-strong underline">
              Leads
            </Link>
            <Link href="/admin/kb" className="text-brand-lavender-strong underline">
              Knowledge base
            </Link>
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {SECTIONS.map(({ brand, heading, addLabel }) => {
          const members = staffByBrand[brand];
          const ids = members.map((member) => member.id);

          return (
            <section key={brand} className="mt-8">
              <h2 className="text-lg font-bold">{heading}</h2>

              <div className="mt-4 divide-y divide-brand-ink/10 rounded-lg border border-brand-ink/10 bg-white">
                {members.map((member, index) => {
                  const orderMovedUp = index > 0 ? swap(ids, index, index - 1) : null;
                  const orderMovedDown = index < ids.length - 1 ? swap(ids, index, index + 1) : null;

                  return (
                    <div key={member.id} className="p-4">
                      <div className="flex items-center gap-4">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt=""
                            className="h-12 w-12 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                            style={{ backgroundColor: member.accentColor }}
                            aria-hidden="true"
                          >
                            {initials(member.name)}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-sm text-brand-ink/60">{member.role}</p>
                        </div>
                        <div className="flex gap-1 text-xs">
                          <form action={reorderStaffAction}>
                            <input type="hidden" name="brand" value={brand} />
                            {(orderMovedUp ?? ids).map((id) => (
                              <input key={id} type="hidden" name="orderedIds" value={id} />
                            ))}
                            <button
                              type="submit"
                              disabled={!orderMovedUp}
                              className="rounded border border-brand-ink/15 px-2 py-1 disabled:opacity-30"
                              aria-label={`Move ${member.name} up`}
                            >
                              ↑
                            </button>
                          </form>
                          <form action={reorderStaffAction}>
                            <input type="hidden" name="brand" value={brand} />
                            {(orderMovedDown ?? ids).map((id) => (
                              <input key={id} type="hidden" name="orderedIds" value={id} />
                            ))}
                            <button
                              type="submit"
                              disabled={!orderMovedDown}
                              className="rounded border border-brand-ink/15 px-2 py-1 disabled:opacity-30"
                              aria-label={`Move ${member.name} down`}
                            >
                              ↓
                            </button>
                          </form>
                        </div>
                      </div>

                      <details className="mt-3">
                        <summary className="cursor-pointer select-none text-sm font-semibold text-brand-lavender-strong marker:content-none">
                          ▸ Edit
                        </summary>
                        <form
                          action={updateStaffAction}
                          encType="multipart/form-data"
                          className="mt-3 grid gap-3 sm:grid-cols-2"
                        >
                          <input type="hidden" name="id" value={member.id} />
                          <input type="hidden" name="brand" value={brand} />
                          <label className="flex flex-col gap-1 text-sm font-medium">
                            Name
                            <input
                              type="text"
                              name="name"
                              defaultValue={member.name}
                              required
                              className="rounded-md border border-brand-ink/20 px-3 py-2 text-sm"
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-sm font-medium">
                            Role
                            <input
                              type="text"
                              name="role"
                              defaultValue={member.role}
                              required
                              className="rounded-md border border-brand-ink/20 px-3 py-2 text-sm"
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-sm font-medium sm:col-span-2">
                            Bio
                            <textarea
                              name="bio"
                              defaultValue={member.bio}
                              rows={3}
                              required
                              className="rounded-md border border-brand-ink/20 px-3 py-2 text-sm"
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-sm font-medium">
                            Accent color
                            <input
                              type="color"
                              name="accentColor"
                              defaultValue={member.accentColor}
                              className="h-10 w-20 rounded-md border border-brand-ink/20"
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-sm font-medium">
                            Replace photo
                            <input
                              type="file"
                              name="photo"
                              accept="image/jpeg,image/png,image/webp"
                              className="text-sm"
                            />
                          </label>
                          <div className="sm:col-span-2">
                            <button
                              type="submit"
                              className="rounded-md bg-brand-pink-strong px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
                            >
                              Save
                            </button>
                          </div>
                        </form>
                        <form action={deleteStaffAction} className="mt-2">
                          <input type="hidden" name="id" value={member.id} />
                          <button
                            type="submit"
                            className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-red-600 ring-1 ring-red-200 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </form>
                      </details>
                    </div>
                  );
                })}
                {members.length === 0 && (
                  <p className="px-4 py-8 text-center text-sm text-brand-ink/50">No entries yet.</p>
                )}
              </div>

              <details className="mt-4 rounded-lg border border-brand-ink/10 bg-white" open={erroredBrand === brand}>
                <summary className="cursor-pointer select-none px-4 py-3 text-sm font-bold marker:content-none">
                  ▸ {addLabel}
                </summary>
                <form
                  action={createStaffAction}
                  encType="multipart/form-data"
                  className="grid gap-3 border-t border-brand-ink/10 p-4 sm:grid-cols-2"
                >
                  <input type="hidden" name="brand" value={brand} />
                  <label className="flex flex-col gap-1 text-sm font-medium">
                    Name
                    <input type="text" name="name" required className="rounded-md border border-brand-ink/20 px-3 py-2 text-sm" />
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-medium">
                    Role
                    <input type="text" name="role" required className="rounded-md border border-brand-ink/20 px-3 py-2 text-sm" />
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-medium sm:col-span-2">
                    Bio
                    <textarea name="bio" rows={3} required className="rounded-md border border-brand-ink/20 px-3 py-2 text-sm" />
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-medium">
                    Accent color
                    <input
                      type="color"
                      name="accentColor"
                      defaultValue="#5FA8D3"
                      required
                      className="h-10 w-20 rounded-md border border-brand-ink/20"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm font-medium">
                    Photo (optional)
                    <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" className="text-sm" />
                  </label>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="rounded-md bg-brand-pink-strong px-4 py-2 text-sm font-semibold text-white hover:brightness-95"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </details>
            </section>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add a "Staff" nav link to `app/admin/kb/page.tsx`**

Find:

```tsx
          <div className="flex gap-3 text-sm">
            <Link href="/admin/leads" className="text-brand-lavender-strong underline">
              Leads
            </Link>
            <Link
```

Replace with:

```tsx
          <div className="flex gap-3 text-sm">
            <Link href="/admin/leads" className="text-brand-lavender-strong underline">
              Leads
            </Link>
            <Link href="/admin/staff" className="text-brand-lavender-strong underline">
              Staff
            </Link>
            <Link
```

- [ ] **Step 3: Add a "Staff" nav link to `app/admin/leads/page.tsx`**

Find:

```tsx
            <Link href="/admin/kb" className="text-brand-lavender-strong underline">
              Knowledge base
            </Link>
            <Link href="/admin/settings/mfa" className="text-brand-lavender-strong underline">
```

Replace with:

```tsx
            <Link href="/admin/kb" className="text-brand-lavender-strong underline">
              Knowledge base
            </Link>
            <Link href="/admin/staff" className="text-brand-lavender-strong underline">
              Staff
            </Link>
            <Link href="/admin/settings/mfa" className="text-brand-lavender-strong underline">
```

- [ ] **Step 4: Generate route types and typecheck**

Run: `npx next typegen && npx tsc --noEmit -p tsconfig.json 2>&1 | grep "app/admin" || echo "no errors under app/admin"`
Expected: `no errors under app/admin`.

- [ ] **Step 5: Manual verification**

Run: `npm run dev` (ensure `daydreams-postgres` Docker container is running and `DATABASE_URL`/`SESSION_SECRET`/admin bootstrap env vars are set per `README.md`), then in a browser:
1. Log in at `/admin/login`, visit `/admin/staff`.
2. Confirm both sections list their 4 seeded placeholder rows with initials badges (no photos yet).
3. Add a new staff member with a photo under "Add staff member" — confirm it appears at the end of the Daydreams list with the uploaded photo rendered.
4. Click "Edit" on that new row, change its name, upload a different photo, save — confirm the name and photo both updated.
5. Click ↑/↓ on a row — confirm the list order changes and persists on reload.
6. Delete the new row — confirm it disappears.
7. Try adding a member with an empty bio — confirm you're redirected back with an inline error banner and the "Add staff member" section still open.
8. Try uploading a `.txt` file as a photo — confirm the mime-whitelist error banner appears.

- [ ] **Step 6: Commit**

```bash
git add app/admin/staff/page.tsx app/admin/kb/page.tsx app/admin/leads/page.tsx
git commit -m "feat: add admin staff CRUD/reorder UI"
```

---

## Task 7: Wire the public site to the staff store, delete fixtures

**Files:**
- Modify: `lib/daydreams/types.ts`
- Modify: `lib/daydreams/content.ts`
- Modify: `components/daydreams/sections/StaffSection.tsx`
- Test: `components/daydreams/sections/StaffSection.test.tsx`
- Delete: `content/fixtures/staff.ts`
- Delete: `content/fixtures/trainers.ts`

**Interfaces:**
- Consumes: `listStaffByBrand` from `lib/staff/store.ts` (Task 3).
- Produces: `StaffMember` (public type) gains `photoUrl?: string`; `getStaff()`/`getTrainers()` now read from Postgres instead of the deleted fixture files.

- [ ] **Step 1: Write the failing test for `StaffSection`**

Create `components/daydreams/sections/StaffSection.test.tsx`:

```tsx
import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { StaffSection } from "./StaffSection";
import type { StaffMember } from "@/lib/daydreams/types";

afterEach(cleanup);

const baseMember: StaffMember = {
  id: "maria",
  name: "Maria Chen",
  role: "Lead Teacher",
  bio: "Bio text",
  accentColor: "#F4A259",
};

describe("StaffSection", () => {
  it("falls back to an initials badge when there's no photo", () => {
    render(<StaffSection staff={[baseMember]} />);
    expect(screen.getByText("MC")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders an img when photoUrl is present", () => {
    render(<StaffSection staff={[{ ...baseMember, photoUrl: "/staff-photo/maria?v=1" }]} />);
    const img = screen.getByRole("presentation", { hidden: true }) as HTMLImageElement | null;
    const imgBySrc = document.querySelector('img[src="/staff-photo/maria?v=1"]');
    expect(imgBySrc).not.toBeNull();
    expect(screen.queryByText("MC")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/daydreams/sections/StaffSection.test.tsx`
Expected: FAIL — no `<img>` is rendered yet.

- [ ] **Step 3: Add `photoUrl` to the public `StaffMember` type**

In `lib/daydreams/types.ts`, find:

```ts
export type StaffMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  accentColor: string;
};
```

Replace with:

```ts
export type StaffMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  accentColor: string;
  photoUrl?: string;
};
```

- [ ] **Step 4: Render the photo in `StaffSection.tsx`**

Replace the full contents of `components/daydreams/sections/StaffSection.tsx` with:

```tsx
import type { StaffMember } from "@/lib/daydreams/types";

export function StaffSection({ staff }: { staff: StaffMember[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {staff.map((member) => (
        <div key={member.id} className="flex gap-4 rounded-xl border border-brand-ink/10 bg-white p-5 zone-dark:border-white/10 zone-dark:bg-white/5">
          {member.photoUrl ? (
            <img
              src={member.photoUrl}
              alt=""
              className="h-14 w-14 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
              // Darkened relative to the fixture's raw accentColor: several
              // accent colors (e.g. #F4A259, #5FA8D3) fail WCAG contrast
              // against white text at their original brightness. Mixing in
              // black keeps each badge's distinct hue while guaranteeing
              // sufficient contrast for the white initials on top.
              style={{ backgroundColor: `color-mix(in srgb, ${member.accentColor} 60%, black)` }}
              aria-hidden="true"
            >
              {member.name
                .split(" ")
                .map((part) => part[0])
                .join("")}
            </div>
          )}
          <div>
            <h3 className="font-bold text-brand-ink zone-dark:text-white">{member.name}</h3>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink/60 zone-dark:text-white/50">
              {member.role}
            </p>
            <p className="mt-2 text-sm text-brand-ink/80 zone-dark:text-white/70">{member.bio}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run components/daydreams/sections/StaffSection.test.tsx`
Expected: PASS (2/2)

- [ ] **Step 6: Switch `getStaff()`/`getTrainers()` to the database**

In `lib/daydreams/content.ts`, remove these two import lines:

```ts
import { staff } from "@/content/fixtures/staff";
```
```ts
import { trainers } from "@/content/fixtures/trainers";
```

Add this import alongside the other `@/lib/...` imports:

```ts
import { listStaffByBrand } from "@/lib/staff/store";
```

Replace:

```ts
export async function getStaff(): Promise<StaffMember[]> {
  return staff;
}
```

with:

```ts
export async function getStaff(): Promise<StaffMember[]> {
  const members = await listStaffByBrand("daydreams");
  return members.map(({ id, name, role, bio, accentColor, photoUrl }) => ({
    id,
    name,
    role,
    bio,
    accentColor,
    photoUrl,
  }));
}
```

Replace:

```ts
export async function getTrainers(): Promise<StaffMember[]> {
  return trainers;
}
```

with:

```ts
export async function getTrainers(): Promise<StaffMember[]> {
  const members = await listStaffByBrand("dumbbells");
  return members.map(({ id, name, role, bio, accentColor, photoUrl }) => ({
    id,
    name,
    role,
    bio,
    accentColor,
    photoUrl,
  }));
}
```

- [ ] **Step 7: Delete the now-unused fixtures**

```bash
git rm content/fixtures/staff.ts content/fixtures/trainers.ts
```

- [ ] **Step 8: Run the full test suite**

Run: `npx vitest run`
Expected: all tests pass, including the ones from earlier tasks.

- [ ] **Step 9: Manual verification**

Run: `npm run dev`, then:
1. Visit `/daydreams/site` — confirm the "Meet the Teachers" section shows the 4 seeded Daydreams staff (initials badges, since none have photos yet from Task 2's seed), and that any photo/edits made in Task 6's manual verification for the `daydreams` brand are reflected here.
2. Visit `/daydreams` (the game) and open the "staff" destination panel — confirm the same data renders there via `ContentPanel`/`StaffSection`.
3. Run `npx tsx -e "import('./lib/knowledge-base/buildSeedMarkdown').then(m => m.buildSeedMarkdown()).then((md) => console.log(md.includes('Marcus Webb') ? 'trainers present' : 'MISSING'))"` (or open `scripts/seed-knowledge-base.ts`'s output) and confirm the "Trainers" section still lists the 4 seeded Dumbbells trainers — this is the only place `getTrainers()` output is currently consumed (see this plan's ruling on `/dumbbells` not rendering a trainer UI).

- [ ] **Step 10: Commit**

```bash
git add lib/daydreams/types.ts lib/daydreams/content.ts components/daydreams/sections/StaffSection.tsx components/daydreams/sections/StaffSection.test.tsx
git commit -m "feat: wire public staff/trainer sections to the staff store, drop static fixtures"
```
