# Daydreams & Dumbbells — Phase 1 Recommendations

## Overall Assessment

The Phase 1 plan is strong and buildable. The scope decomposition is sensible, the technology choices fit the experience, and keeping the gym site out of Phase 1 prevents the first release from becoming too large.

**Overall implementation-plan rating: 8.5/10**

The core architecture should remain, but several areas should be tightened before implementation because they would be expensive to change later.

---

## 1. Keep the Core Architecture

The following decisions are well aligned with the project and should remain:

- Next.js App Router + TypeScript
- React Three Fiber for 3D experiences
- Tailwind CSS
- Procedural low-poly geometry for v1
- Sanity as the headless CMS
- React state/context before introducing a separate state library
- Simple collision detection rather than a physics engine
- Lead capture rather than accounts/payments
- Code-splitting so Three.js only loads where needed
- Persistent access to the traditional Daydreams experience
- Daycare-first implementation
- Shared content between the gamified and traditional experiences

The most important architectural idea is that `/daydreams` and `/daydreams/site` should be two interfaces over the same underlying content.

```text
Sanity
  |
Shared Daydreams Content Layer
  |------------------------|
  |                        |
Gamified Experience    Traditional Site
```

---

## 2. Make the Driving Experience More Structured

The biggest UX risk is the current free-steering auto-forward mechanic.

If users can miss content blocks and continue driving past them, the game can become frustrating rather than playful.

A better approach is a constrained **lane-based driving experience**.

```text
LEFT        CENTRE        RIGHT
  <-           CAR            ->
```

Recommended controls:

### Desktop
- A / Left Arrow = move one lane left
- D / Right Arrow = move one lane right

### Mobile
- Tap left/right controls
- Optional swipe left/right

The car can still animate smoothly between lanes so the experience feels fluid.

### Destination Recovery

Users must never permanently miss content.

Recommended approaches:

- recycle missed destinations later in the road,
- provide a destination menu,
- allow the same content blocks to reappear,
- or combine these approaches.

The game should feel exploratory without making information difficult to reach.

---

## 3. Introduce a Shared Content/Data Layer

UI components should not query Sanity directly.

Instead of:

```text
ContentPanel -> Sanity
TraditionalPage -> Sanity
```

use:

```text
                    Sanity
                      |
               DaydreamsData
                /        \
               /          \
       Game experience   Traditional site
```

Suggested structure:

```text
/lib/daydreams/
  content.ts
  programs.ts
  staff.ts
  testimonials.ts
  gallery.ts
  site-settings.ts
  types.ts
```

Example content model:

```ts
type Program = {
  id: string
  title: string
  shortDescription: string
  description: string
  ageRange?: string
  image?: ImageData
}
```

The UI should not care whether data comes from Sanity, local fixtures, or another CMS.

Benefits:

- easier testing,
- easier mocking,
- simpler CMS migration,
- reusable content,
- cleaner caching,
- easier preview support,
- easier future localization.

---

## 4. Define the Game State Before Building

Plain React state/context is appropriate, but the state model should be defined early.

Example:

```ts
type DaydreamsGameState = {
  status: 'loading' | 'playing' | 'paused' | 'panel-open'
  lane: -1 | 0 | 1
  activeDestination: Destination | null
  discoveredDestinations: DestinationId[]
  reducedMotion: boolean
}
```

Destinations should also be data-driven.

```ts
type Destination = {
  id:
    | 'programs'
    | 'staff'
    | 'schedule'
    | 'gallery'
    | 'testimonials'
    | 'enroll'
  label: string
  contentType: string
}
```

Avoid hard-coded logic such as:

```ts
if (hitPrograms) ...
if (hitStaff) ...
if (hitGallery) ...
```

Prefer reusable destination components such as:

```tsx
<GameBlock destination="programs" />
```

---

## 5. Separate the 3D World from the HTML Interface

Important information should live in accessible DOM elements, not inside WebGL.

Recommended layout:

```text
+--------------------------------------+
| DOM UI                               |
|                                      |
| Logo                 Traditional Site|
|                                      |
|            +----------------+        |
|            | THREE.JS WORLD |        |
|            |                |        |
|            |      CAR       |        |
|            +----------------+        |
|                                      |
| Controls                    Progress |
+--------------------------------------+
```

When the player hits a destination:

```text
3D world
   |
pause
   |
DOM drawer/modal opens
```

This is better for:

- SEO,
- accessibility,
- forms,
- responsive layouts,
- text rendering,
- keyboard focus,
- screen readers.

Use 3D for the experience and normal React/HTML for information.

---

## 6. Use a Real `/dumbbells` Coming-Soon Route

Do not redirect the Dumbbells choice to Daydreams.

Instead:

```text
/
├── Daydreams -> /daydreams
└── Dumbbells -> /dumbbells
                  |
                  v
              Coming Soon
```

The temporary Dumbbells page can still feel polished and on-brand.

Optional launch CTA:

> Want to know when Dumbbells launches?

This could use a simple gym-interest lead form.

---

## 7. Improve the Landing Interaction

The split-screen landing page is a good choice.

Suggested structure:

```text
+----------------------+----------------------+
|                      |                      |
|      DUMBBELLS       |      DAYDREAMS       |
|                      |                      |
|     3D DUMBBELL      |      3D TOY/CAR      |
|                      |                      |
|    BUILD STRONG      |      DREAM BIG       |
|                      |                      |
|      ENTER ->        |       PLAY ->        |
|                      |                      |
+----------------------+----------------------+
```

### Dumbbells Hover/Focus

- Dumbbell lifts slightly
- Camera subtly pushes forward
- Lighting intensifies
- Typography expands slightly

### Daydreams Hover/Focus

- Toy car moves forward
- Blocks wobble gently
- Decorative shapes float upward
- Background becomes more animated

This gives both sides distinct personalities immediately.

---

## 8. Do Not Make Early UI Work Depend on Sanity

Production content should come from Sanity, but the first UI implementation should use local fixture data.

Suggested structure:

```text
/content/fixtures/
  programs.ts
  staff.ts
  testimonials.ts
  gallery.ts
```

Then expose content through stable functions:

```ts
getPrograms()
getStaff()
getTestimonials()
```

Initially these can return fixtures.

Later the implementation can switch to Sanity without rewriting UI components.

This prevents CMS setup from blocking game and interface work.

---

## 9. Strengthen the Lead-Capture Architecture

Recommended endpoint:

```text
POST /api/leads
```

Using:

```text
/app/api/leads/route.ts
```

Suggested payload:

```ts
{
  leadType: 'daycare-enrollment',
  source: 'game' | 'traditional-site',
  parentName: string,
  email: string,
  phone?: string,
  childAge?: string,
  message?: string
}
```

The endpoint should include:

- server-side validation,
- request throttling,
- honeypot/bot protection,
- input sanitization,
- database timestamps,
- email-delivery status,
- privacy/consent language,
- clear error handling.

### Recommended Processing Order

```text
FORM
 |
VALIDATE
 |
DATABASE WRITE
 |
EMAIL NOTIFICATION
 |
SUCCESS
```

The database should be the primary persistence mechanism.

If the email provider fails after the lead is stored successfully, the user should still receive a successful submission response.

Suggested lead schema:

```text
lead
-----------------------
id
type
source
name
email
phone
message
status
emailNotificationStatus
createdAt
```

---

## 10. Keep Childcare Lead Forms Minimal

Because this is childcare-related, avoid collecting unnecessary child information through a public lead form.

Recommended v1 fields:

- Parent/guardian name
- Email
- Phone
- Child age or age range
- Preferred contact method
- Message
- Privacy/consent acknowledgement

Detailed child records should belong in a more secure enrollment workflow later.

---

## 11. Make Reduced-Motion Behaviour Explicit

When:

```css
prefers-reduced-motion: reduce
```

the experience should:

- disable camera bob,
- disable decorative particles,
- reduce idle animation,
- remove bouncing/popping effects,
- keep lane changes short and smooth,
- keep the interactive experience available,
- prominently expose the traditional-site option.

Do not automatically redirect reduced-motion users.

---

## 12. Add an Accessible Explore Menu

The game should remain the primary navigation mechanism, but it should not become an accessibility barrier.

Add a lightweight menu such as:

```text
Explore

Programs
Teachers
Daily Schedule
Gallery
Testimonials
Book a Visit
```

This gives users a direct way to access every content area while remaining within the interactive experience.

---

## 13. Add Loading and Failure States

3D experiences need explicit fallback behaviour.

### Loading

```text
Loading Daydreams...
████████░░
```

### WebGL Failure

```text
We couldn't start the interactive experience.

[Open Daydreams website]
```

The traditional site should always be available as the reliable fallback.

---

## 14. Recommended Project Structure

```text
/app
  page.tsx

  /daydreams
    page.tsx
    loading.tsx
    error.tsx

    /site
      page.tsx

  /dumbbells
    page.tsx

  /api
    /leads
      route.ts

/components
  /landing
    LandingSplit.tsx
    GymPreview.tsx
    DaydreamsPreview.tsx

  /daydreams
    DaydreamsGame.tsx
    GameHUD.tsx
    ContentPanel.tsx
    DestinationMenu.tsx
    TraditionalToggle.tsx
    EnrollForm.tsx

  /three
    /daydreams
      World.tsx
      Car.tsx
      DestinationBlock.tsx
      Road.tsx
      CameraRig.tsx

    /landing
      Dumbbell.tsx
      ToyStack.tsx

/lib
  /daydreams
    content.ts
    destinations.ts
    types.ts

  /sanity
    client.ts
    queries.ts

  /leads
    schema.ts
    submit.ts

/content
  /fixtures

/sanity
  /schemas
```

This keeps application UI, 3D rendering, content, and infrastructure cleanly separated.

---

## 15. Introduce a Destination Manifest

Use a single source of truth for the interactive destinations.

Example:

```ts
export const destinations = [
  {
    id: 'programs',
    label: 'Programs',
    blockLabel: 'PLAY',
    panel: 'programs',
  },
  {
    id: 'staff',
    label: 'Meet the Teachers',
    blockLabel: 'MEET',
    panel: 'staff',
  },
  {
    id: 'schedule',
    label: 'Our Day',
    blockLabel: 'DAY',
    panel: 'schedule',
  },
  {
    id: 'gallery',
    label: 'Gallery',
    blockLabel: 'LOOK',
    panel: 'gallery',
  },
  {
    id: 'testimonials',
    label: 'Parents Say',
    blockLabel: 'LOVE',
    panel: 'testimonials',
  },
  {
    id: 'enroll',
    label: 'Book a Visit',
    blockLabel: 'GO!',
    panel: 'enroll',
  },
]
```

The same manifest can drive:

- the 3D world,
- navigation menus,
- progress tracking,
- analytics,
- panel routing,
- accessibility shortcuts.

---

## 16. Rename the Primary Daycare CTA

If the launch form is only a lead form and does not complete enrollment, avoid presenting it as a full online enrollment process.

Recommended CTA:

**Book a Visit**

or

**Register Your Interest**

Suggested conversion path:

```text
Play
 |
Discover Daydreams
 |
Meet Teachers
 |
Explore Programs
 |
Book a Visit
 |
Staff Follow-Up
```

---

## 17. Add Analytics from the Start

Because the navigation is unconventional, analytics will be important.

Recommended events:

```text
landing_daydreams_selected
landing_dumbbells_selected

daydreams_game_started
daydreams_traditional_selected

destination_programs_opened
destination_staff_opened
destination_schedule_opened
destination_gallery_opened
destination_testimonials_opened
destination_enroll_opened

lead_started
lead_submitted
```

This will help answer questions such as:

- Are users engaging with the game?
- Are they abandoning it?
- Which content gets opened most?
- Are visitors switching immediately to the traditional site?
- Does the gamified version convert into leads?

---

## 18. Add Two Acceptance Tests

Add these to the existing verification checklist.

### 10. WebGL Failure/Fallback

Disable or break WebGL and verify that the visitor is given a usable route to:

```text
/daydreams/site
```

### 11. Missed Destination Recovery

Verify that a user who passes a destination can still access that content later without reloading the page.

---

## Recommended Phase 1 Architecture

```text
                        DAYDREAMS & DUMBBELLS
                                  |
                                  v
                        +------------------+
                        | Landing Splitter |
                        +--------+---------+
                         /                \
                        /                  \
                       v                    v
              +----------------+    +----------------+
              |   DAYDREAMS    |    |   DUMBBELLS    |
              | Interactive    |    |  Coming Soon   |
              +-------+--------+    +----------------+
                      |
             +--------+--------+
             |                 |
             v                 v
       3D Driving Game   Traditional Website
             |                 |
             +--------+--------+
                      |
                      v
             Shared Content Layer
                      |
                      v
                    Sanity

Game / Traditional
       |
       v
   Book a Visit
       |
       v
 POST /api/leads
       |
       +----> Database
       |
       +----> Staff Email
```

---

## Recommended Build Order

1. Project shell, routing, typography, and design tokens
2. Fixture content and shared content interfaces
3. Traditional Daydreams website
4. Lead form, API, database, and email notification
5. Landing splitter
6. Basic 3D Daydreams world
7. Car movement and input system
8. Destination/collision system
9. Connect content panels to destinations
10. Game HUD, progress, and traditional-site toggle
11. Sanity integration
12. Mobile, reduced-motion, and WebGL fallbacks
13. Animation and visual polish
14. Lighthouse, accessibility, and performance checks
15. Deployment

Building the traditional site before the game is useful because it establishes the content model, responsive components, forms, and content panels first. The 3D game can then act as an alternative navigation system around components that are already proven.

---

## Final Recommendation

Keep the overall concept and technology stack.

Before implementation, refine these areas:

1. make the driving mechanic constrained and lane-based,
2. introduce a shared content layer,
3. formalize the destination and game-state architecture,
4. keep informational UI outside WebGL,
5. add reliable fallbacks,
6. make lead capture more robust,
7. treat the traditional site as a first-class experience,
8. add analytics from day one,
9. ensure every destination is recoverable,
10. use the interactive experience as the brand differentiator without allowing it to become a usability barrier.

With these changes, the Phase 1 plan is strong enough to move into implementation.
