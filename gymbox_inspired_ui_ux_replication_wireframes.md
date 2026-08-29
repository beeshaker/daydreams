# Gymbox-Inspired Gym Website
## UI/UX Replication Brief + Wireframes

**Purpose:**  
Create a gym website that captures the same *design language, energy, structure, interaction style, and conversion flow* as Gymbox, while using original branding, photography, copy, and assets.

**Reference:** https://gymbox.com/

> The aim is to reproduce the **experience and design principles**, not to duplicate Gymbox's trademarks, copy, photography, or proprietary assets.

---

# 1. Overall Creative Direction

The website should feel like:

- an underground performance club;
- a nightlife brand;
- a modern fitness lifestyle brand;
- an energetic sports venue;
- a premium but rebellious gym.

The visual tone should be:

**LOUD + URBAN + DARK + HIGH-CONTRAST + CONFIDENT + PLAYFUL**

Avoid:

- generic gym templates;
- excessive red/black bodybuilding styling;
- overly corporate layouts;
- rounded SaaS-style cards;
- long text blocks;
- stock fitness photography;
- excessive icons.

The site should sell the **energy of being inside the gym**, not only the equipment.

---

# 2. Core Visual Characteristics

## Typography

Use oversized uppercase typography as a primary visual element.

Example direction:

```text
TRAIN
WITHOUT
LIMITS
```

Recommended display CSS:

```css
.hero-title {
  font-size: clamp(4.5rem, 11vw, 11rem);
  line-height: 0.82;
  letter-spacing: -0.055em;
  text-transform: uppercase;
  font-weight: 900;
}
```

Suggested display font direction:

- Anton
- Archivo Black
- League Spartan
- Druk-style licensed alternative
- Compacta-style licensed alternative

Body font:

- Inter
- Helvetica Neue
- Neue Haas Grotesk
- Space Grotesk

---

# 3. Colour Direction

Recommended starting palette:

```css
:root {
  --black: #080808;
  --black-soft: #151515;

  --white: #F6F5EF;
  --grey-light: #D9D9D4;
  --grey-mid: #868681;

  --accent: #FFE500;

  --border-dark: rgba(255,255,255,.18);
}
```

Use the accent colour mainly for:

- Join Now;
- promotional strips;
- active filters;
- hover states;
- campaign messaging;
- small highlight labels.

Do not use it across every section.

---

# 4. Layout System

Desktop:

```text
Maximum content width: 1440–1600px
Page padding: 32–56px
Grid: 12 columns
Section spacing: 100–180px
```

Tablet:

```text
Padding: 24–32px
Section spacing: 80–120px
```

Mobile:

```text
Padding: 18–22px
Section spacing: 64–96px
```

Important:

- media sections can run full-bleed;
- avoid placing the whole website in a narrow centered container;
- favour wide editorial layouts;
- use asymmetric grids.

---

# 5. Global Navigation

## Desktop

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ LOGO       GYMS   MEMBERSHIPS   CLASSES   FACILITIES   PT      JOIN NOW │
└──────────────────────────────────────────────────────────────────────────┘
```

Behaviour:

- transparent over hero;
- sticky after scroll;
- background becomes solid black;
- Join Now remains strongly visible;
- optional secondary Free Trial action.

---

# 6. Mobile Navigation

```text
┌───────────────────────────────┐
│ LOGO                 JOIN  ☰ │
└───────────────────────────────┘
```

The hamburger should open a full-screen menu.

```text
GYMS

MEMBERSHIPS

CLASSES

FACILITIES

PERSONAL TRAINING

FREE TRIAL

JOIN NOW
```

Menu typography should be oversized and bold.

---

# 7. Homepage Information Architecture

Recommended sequence:

```text
01 Header
02 Hero
03 Promotional strip
04 Brand proposition
05 Capability / stat strip
06 Classes
07 Facilities / innovations
08 Community / social wall
09 Find your gym
10 Membership teaser
11 Conversion CTA
12 FAQ
13 Footer
14 Sticky mobile conversion bar
```

---

# 8. DESKTOP HOMEPAGE WIREFRAME

Target width: **1440px**

```text
╔══════════════════════════════════════════════════════════════════════════╗
║ LOGO     GYMS  MEMBERSHIPS  CLASSES  FACILITIES  PT         JOIN NOW   ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║ TRAIN                                                                    ║
║ WITHOUT                                                                  ║
║ LIMITS                                                                   ║
║                                                                          ║
║ Premium equipment. High-energy classes.                                 ║
║ Serious training without the serious attitude.                          ║
║                                                                          ║
║ [ FREE TRIAL ]    [ JOIN NOW ]                                          ║
║                                                                          ║
║                                             FULL-SCREEN CINEMATIC VIDEO   ║
║                                                                          ║
║                                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║ JOIN THIS MONTH — ZERO JOINING FEE                         VIEW OFFER →  ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║ NOT YOUR                                                                 ║
║ AVERAGE GYM.                                                             ║
║                                                                          ║
║ Short 2–3 line brand proposition.                                       ║
║                                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║ PREMIUM KIT        60+ CLASSES        RECOVERY        EXPERT COACHING   ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║ CLASSES                                                                  ║
║ FIND YOUR THING.                                                         ║
║                                                                          ║
║ ┌─────────────────────────────────┐ ┌──────────────────────────────┐     ║
║ │                                 │ │                              │     ║
║ │          STRENGTH               │ │            FIGHT             │     ║
║ │                                 │ │                              │     ║
║ │  [FULL IMAGE]                   │ │ [FULL IMAGE]                 │     ║
║ │                      VIEW →     │ │                    VIEW →    │     ║
║ └─────────────────────────────────┘ └──────────────────────────────┘     ║
║                                                                          ║
║ ┌──────────────────────┐ ┌─────────────────────────────────────────┐     ║
║ │                      │ │                                         │     ║
║ │        RIDE          │ │                  SWEAT                  │     ║
║ │                      │ │                                         │     ║
║ │ [IMAGE]       VIEW → │ │ [IMAGE]                         VIEW →  │     ║
║ └──────────────────────┘ └─────────────────────────────────────────┘     ║
║                                                                          ║
║ ┌──────────────────────────────────────┐ ┌─────────────────────────┐     ║
║ │              HOLISTIC                │ │        MOBILITY         │     ║
║ │ [IMAGE]                      VIEW →  │ │ [IMAGE]         VIEW → │     ║
║ └──────────────────────────────────────┘ └─────────────────────────┘     ║
║                                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║ MORE THAN                                                                ║
║ A GYM.                                                                   ║
║                                                                          ║
║ ← [RECOVERY] [SAUNA] [BODY SCAN] [COLD PLUNGE] [NEXT CARD...] →         ║
║                                                                          ║
║ Horizontal draggable facility carousel                                  ║
║                                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║ SEEN IN                                                                  ║
║ THE GYM                                                                  ║
║                                                                          ║
║ [PORTRAIT] [SQUARE] [VIDEO] [PORTRAIT] [SQUARE]                         ║
║                                                                          ║
║ TAG @OURGYM TO GET FEATURED                                              ║
║                                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║ FIND YOUR GYM                                                            ║
║                                                                          ║
║ WESTLANDS  →                         ┌──────────────────────────────┐     ║
║ KAREN                                │                              │     ║
║ KILIMANI                             │    LOCATION IMAGE            │     ║
║ CBD                                  │                              │     ║
║                                      │    OPEN TODAY 05:00–23:00   │     ║
║                                      └──────────────────────────────┘     ║
║                                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║ MEMBERSHIPS                                                              ║
║                                                                          ║
║ JOIN THE CLUB.                                                           ║
║                                                                          ║
║ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐ ║
║ │ 12 MONTH            │ │ 3 MONTH             │ │ FLEXIBLE            │ ║
║ │                     │ │                     │ │                     │ ║
║ │ KES XX,XXX / MONTH  │ │ KES XX,XXX / MONTH  │ │ KES XX,XXX / MONTH  │ ║
║ │                     │ │                     │ │                     │ ║
║ │ JOIN →              │ │ JOIN →              │ │ JOIN →              │ ║
║ └─────────────────────┘ └─────────────────────┘ └─────────────────────┘ ║
║                                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║ READY TO                                                                 ║
║ TRAIN?                                                                   ║
║                                                                          ║
║ Try the gym before you commit.                   [ FREE TRIAL ]          ║
║                                                   [ JOIN NOW ]           ║
║                                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║ QUESTIONS,                                                               ║
║ ANSWERED.                                                                ║
║                                                                          ║
║ + WHAT IS INCLUDED?                                                      ║
║ ───────────────────────────────────────────────────────────────────────  ║
║ + CAN I TRY THE GYM FIRST?                                               ║
║ ───────────────────────────────────────────────────────────────────────  ║
║ + ARE CLASSES INCLUDED?                                                  ║
║ ───────────────────────────────────────────────────────────────────────  ║
║ + CAN I USE EVERY LOCATION?                                              ║
║                                                                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║                                                                          ║
║ TRAIN                                                                    ║
║ WITH US.                                                                 ║
║                                                                          ║
║ [ JOIN NOW ]                                                             ║
║                                                                          ║
║ LOCATIONS       EXPLORE       INFO          SOCIAL                       ║
║ Westlands       Classes       About         Instagram                    ║
║ Karen           Facilities    Careers       TikTok                       ║
║ Kilimani        Membership    Contact       YouTube                      ║
║                                                                          ║
║ © 2026 OUR GYM               PRIVACY     TERMS                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

# 9. MOBILE HOMEPAGE WIREFRAME

Target width: **390px**

```text
┌───────────────────────────────┐
│ LOGO                 JOIN  ☰ │
├───────────────────────────────┤
│                               │
│ TRAIN                         │
│ WITHOUT                       │
│ LIMITS                        │
│                               │
│ Premium equipment.            │
│ High-energy classes.          │
│                               │
│ [ FREE TRIAL ]                │
│ [ JOIN NOW ]                  │
│                               │
│     VERTICAL HERO VIDEO       │
│                               │
├───────────────────────────────┤
│ ZERO JOINING FEE       →      │
├───────────────────────────────┤
│                               │
│ NOT YOUR                      │
│ AVERAGE                       │
│ GYM.                          │
│                               │
│ Short introduction.           │
│                               │
├───────────────────────────────┤
│ 60+                           │
│ CLASSES                       │
│ ─────────────────────────     │
│ PREMIUM                       │
│ EQUIPMENT                     │
│ ─────────────────────────     │
│ RECOVERY                      │
│ ZONE                          │
├───────────────────────────────┤
│                               │
│ CLASSES                       │
│ FIND YOUR THING.              │
│                               │
│ ┌─────────────────────────┐   │
│ │                         │   │
│ │       STRENGTH          │   │
│ │                         │   │
│ │                 VIEW →  │   │
│ └─────────────────────────┘   │
│                               │
│ ┌─────────────────────────┐   │
│ │        FIGHT            │   │
│ │                 VIEW →  │   │
│ └─────────────────────────┘   │
│                               │
│ [ VIEW ALL CLASSES ]          │
│                               │
├───────────────────────────────┤
│                               │
│ MORE THAN                     │
│ A GYM.                        │
│                               │
│ ┌───────────────────────┐     │
│ │ RECOVERY              │     │
│ │ [IMAGE]               │     │
│ └───────────────────────┘     │
│      [NEXT CARD PEEK]         │
│                               │
├───────────────────────────────┤
│                               │
│ SEEN IN                       │
│ THE GYM                       │
│                               │
│ [POST] [POST] →               │
│                               │
├───────────────────────────────┤
│                               │
│ FIND YOUR                     │
│ GYM                           │
│                               │
│ WESTLANDS               →     │
│ KAREN                   →     │
│ KILIMANI                →     │
│ CBD                     →     │
│                               │
│ ┌─────────────────────────┐   │
│ │ LOCATION IMAGE          │   │
│ └─────────────────────────┘   │
│                               │
├───────────────────────────────┤
│                               │
│ MEMBERSHIPS                   │
│                               │
│ ┌─────────────────────────┐   │
│ │ 12 MONTH                │   │
│ │                         │   │
│ │ KES XX,XXX / MONTH      │   │
│ │                         │   │
│ │ JOIN →                  │   │
│ └─────────────────────────┘   │
│                               │
│ [ VIEW ALL MEMBERSHIPS ]      │
│                               │
├───────────────────────────────┤
│                               │
│ READY TO                      │
│ TRAIN?                        │
│                               │
│ [ FREE TRIAL ]                │
│                               │
├───────────────────────────────┤
│                               │
│ QUESTIONS,                    │
│ ANSWERED.                     │
│                               │
│ + WHAT IS INCLUDED?           │
│ + CAN I TRY FIRST?            │
│ + ARE CLASSES INCLUDED?       │
│                               │
├───────────────────────────────┤
│ FOOTER                        │
│                               │
│ TRAIN WITH US.                │
│                               │
│ LOCATIONS                     │
│ EXPLORE                       │
│ INFO                          │
│ SOCIAL                        │
│                               │
└───────────────────────────────┘

┌───────────────────────────────┐
│ FREE TRIAL     │   JOIN NOW  │  ← STICKY MOBILE BAR
└───────────────────────────────┘
```

---

# 10. Hero Design Specification

Desktop:

```text
Height: 90–100svh
Media: full-screen video
Text alignment: left
Text width: 50–65%
Headline: 3 lines maximum
CTA count: 2
```

Suggested hero:

```text
TRAIN
WITHOUT
LIMITS

Premium equipment. High-energy classes.
Serious training without the serious attitude.

[ FREE TRIAL ] [ JOIN NOW ]
```

Use authentic footage:

1. plates being loaded;
2. deadlift;
3. boxing;
4. spin class;
5. coach interaction;
6. strength floor;
7. recovery;
8. wide club shot.

---

# 11. Promotional Strip

```text
────────────────────────────────────────────────────
JOIN THIS MONTH — ZERO JOINING FEE     VIEW OFFER →
────────────────────────────────────────────────────
```

Recommended:

- full width;
- accent background;
- black text;
- upper-case;
- compact;
- clickable.

---

# 12. Brand Proposition Section

Use a large statement:

```text
NOT YOUR
AVERAGE GYM.
```

Then no more than 2–3 lines of supporting text.

This section should feel like an editorial manifesto rather than an About Us section.

---

# 13. Capability Strip

Avoid normal icon cards.

Desktop:

```text
PREMIUM KIT │ 60+ CLASSES │ RECOVERY │ EXPERT COACHING
```

Mobile:

```text
60+
CLASSES
────────────────────
PREMIUM
EQUIPMENT
────────────────────
RECOVERY
ZONE
```

---

# 14. Classes Section

Gymbox's class experience is category-led rather than a generic class list.

Suggested categories:

```text
STRENGTH
FIGHT
RIDE
SWEAT
HOLISTIC
MOBILITY
DANCE
```

## Card behaviour

Hover:

- image zoom 3–5%;
- darker overlay;
- arrow shifts right;
- category label remains fixed.

Recommended:

```css
.card img {
  transition: transform .6s cubic-bezier(.2,.8,.2,1);
}

.card:hover img {
  transform: scale(1.05);
}
```

---

# 15. CLASSES PAGE — DESKTOP WIREFRAME

```text
╔════════════════════════════════════════════════════════════╗
║ HEADER                                                     ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║ CLASSES                                                    ║
║                                                            ║
║ FIND                                                       ║
║ YOUR THING.                                                ║
║                                                            ║
║ [ALL] [STRENGTH] [FIGHT] [RIDE] [SWEAT] [HOLISTIC]        ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║ ┌──────────────────────┐ ┌──────────────────────┐          ║
║ │ IMAGE                │ │ IMAGE                │          ║
║ │                      │ │                      │          ║
║ │ BOXING               │ │ HYROX                │          ║
║ │ FIGHT                │ │ STRENGTH             │          ║
║ │ VIEW →               │ │ VIEW →               │          ║
║ └──────────────────────┘ └──────────────────────┘          ║
║                                                            ║
║ ┌──────────────────────┐ ┌──────────────────────┐          ║
║ │ IMAGE                │ │ IMAGE                │          ║
║ │ PILATES              │ │ CYCLE                │          ║
║ │ HOLISTIC             │ │ RIDE                 │          ║
║ └──────────────────────┘ └──────────────────────┘          ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║ TRY A CLASS                                   FREE TRIAL → ║
╚════════════════════════════════════════════════════════════╝
```

---

# 16. CLASSES PAGE — MOBILE WIREFRAME

```text
┌────────────────────────────┐
│ HEADER                     │
├────────────────────────────┤
│                            │
│ CLASSES                    │
│ FIND                       │
│ YOUR                       │
│ THING.                     │
│                            │
│ [ALL] [STRENGTH] [FIGHT] →│
│                            │
├────────────────────────────┤
│ ┌────────────────────────┐ │
│ │ IMAGE                  │ │
│ │ BOXING                 │ │
│ │ FIGHT           VIEW → │ │
│ └────────────────────────┘ │
│                            │
│ ┌────────────────────────┐ │
│ │ IMAGE                  │ │
│ │ HYROX                  │ │
│ │ STRENGTH        VIEW → │ │
│ └────────────────────────┘ │
│                            │
├────────────────────────────┤
│ TRY A CLASS                │
│ [ FREE TRIAL ]             │
└────────────────────────────┘
```

---

# 17. Individual Class Page Wireframe

```text
╔════════════════════════════════════════════════════════════╗
║ FULL WIDTH CLASS VIDEO / IMAGE                             ║
║                                                            ║
║ BOXING                                                     ║
║ FIGHT                                                      ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║ Short energetic class description                          ║
║                                                            ║
║ DURATION       LEVEL       CATEGORY                         ║
║ 45 MIN         ALL         FIGHT                            ║
║                                                            ║
║ [ VIEW TIMETABLE ] [ FREE TRIAL ]                         ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║ UPCOMING CLASSES                                           ║
║                                                            ║
║ 06:30  BOXING  JAMES  3 SPOTS LEFT         BOOK →         ║
║ 18:00  BOXING  SARAH  7 SPOTS LEFT         BOOK →         ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║ RELATED CLASSES                                            ║
║ [CARD] [CARD] [CARD]                                       ║
╚════════════════════════════════════════════════════════════╝
```

---

# 18. Facilities / Innovations Section

This section should make the gym feel like it is constantly adding new experiences.

Examples:

- recovery zone;
- sauna;
- cold plunge;
- red-light therapy;
- body scan;
- nutrition station;
- premium strength equipment;
- reformer studio.

Use a draggable horizontal carousel.

Desktop:

```text
← [CARD] [CARD] [CARD] [HALF OF NEXT CARD] →
```

Mobile:

```text
[CARD] [PARTIAL NEXT CARD] →
```

---

# 19. Location Selector Interaction

Desktop:

```text
WESTLANDS  →
KAREN
KILIMANI
CBD

                         [LOCATION IMAGE]
                         OPEN TODAY
                         05:00–23:00
```

Hovering a location should:

1. switch the image;
2. show opening hours;
3. show address;
4. reveal View Gym CTA.

Mobile:

- no hover dependence;
- tap location;
- image/details expand beneath it.

---

# 20. LOCATION DETAIL PAGE — DESKTOP WIREFRAME

```text
╔════════════════════════════════════════════════════════════╗
║ HEADER                                                     ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║ WESTLANDS                                                  ║
║                                                            ║
║ THE GYM                                                    ║
║ THAT DOESN'T                                               ║
║ DO BORING.                                                 ║
║                                                            ║
║ [ FREE TRIAL ] [ JOIN NOW ]                               ║
║                                      FULL-WIDTH PHOTO       ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║ OPEN TODAY        ADDRESS                                  ║
║ 05:00–23:00       ABC ROAD, NAIROBI                        ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║ TRAINING ZONES                                             ║
║                                                            ║
║ [STRENGTH] [CARDIO] [FUNCTIONAL] [BOXING]                 ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║ FACILITIES                                                 ║
║                                                            ║
║ [RECOVERY] [SAUNA] [BODY SCAN] [CAFE] →                   ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║ CLASSES AT WESTLANDS                                       ║
║                                                            ║
║ [CLASS] [CLASS] [CLASS]                                    ║
║                                                            ║
║ VIEW TIMETABLE →                                           ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║ TRAINERS                                                   ║
║ [TRAINER] [TRAINER] [TRAINER]                              ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║ MAP / DIRECTIONS                                           ║
║                                                            ║
║ [MAP]                                                      ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║ READY TO TRAIN?                           [ FREE TRIAL ]    ║
╚════════════════════════════════════════════════════════════╝
```

---

# 21. Membership Page Structure

Recommended order:

```text
01 Membership hero
02 What is included
03 Membership plans
04 Facility benefits
05 Classes
06 Multi-location access
07 Trial CTA
08 FAQ
```

Do not open immediately with a dense pricing table.

---

# 22. MEMBERSHIP PAGE — DESKTOP WIREFRAME

```text
╔════════════════════════════════════════════════════════════╗
║ HEADER                                                     ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║ MEMBERSHIPS                                                ║
║                                                            ║
║ JOIN                                                       ║
║ THE CLUB.                                                  ║
║                                                            ║
║ Pick the plan that fits how you train.                     ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║ WHAT YOU GET                                               ║
║                                                            ║
║ UNLIMITED GYM │ CLASSES │ RECOVERY │ APP ACCESS           ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────┐ ║
║ │ 12 MONTH         │ │ 3 MONTH          │ │ FLEXIBLE     │ ║
║ │                  │ │                  │ │              │ ║
║ │ BEST VALUE       │ │ SHORT TERM       │ │ NO CONTRACT  │ ║
║ │                  │ │                  │ │              │ ║
║ │ KES XX,XXX       │ │ KES XX,XXX       │ │ KES XX,XXX   │ ║
║ │ / month          │ │ / month          │ │ / month      │ ║
║ │                  │ │                  │ │              │ ║
║ │ JOIN →           │ │ JOIN →           │ │ JOIN →       │ ║
║ └──────────────────┘ └──────────────────┘ └──────────────┘ ║
║                                                            ║
╠════════════════════════════════════════════════════════════╣
║ CLASSES INCLUDED                                           ║
║ [STRENGTH] [FIGHT] [RIDE] [HOLISTIC]                      ║
╠════════════════════════════════════════════════════════════╣
║ TRY BEFORE YOU JOIN                        [ FREE TRIAL ]  ║
╠════════════════════════════════════════════════════════════╣
║ FAQ                                                        ║
║ + CAN I CANCEL?                                            ║
║ + ARE CLASSES INCLUDED?                                    ║
║ + CAN I CHANGE PLANS?                                      ║
╚════════════════════════════════════════════════════════════╝
```

---

# 23. Free Trial Flow

Keep this very short.

```text
FREE TRIAL
   ↓
CHOOSE GYM
   ↓
SELECT DATE / TIME
   ↓
NAME
EMAIL
PHONE
   ↓
CONFIRMATION
```

Do not redirect through multiple marketing pages.

---

# 24. FREE TRIAL — MOBILE WIREFRAME

```text
┌────────────────────────────┐
│ ← FREE TRIAL               │
├────────────────────────────┤
│                            │
│ TRY THE                    │
│ GYM.                       │
│                            │
│ 1 OF 3                     │
│                            │
│ CHOOSE YOUR GYM            │
│                            │
│ ○ WESTLANDS                │
│ ○ KAREN                    │
│ ○ KILIMANI                 │
│                            │
│ [ CONTINUE ]               │
│                            │
└────────────────────────────┘
```

Next:

```text
┌────────────────────────────┐
│ 2 OF 3                     │
│                            │
│ CHOOSE DATE                │
│ [CALENDAR]                 │
│                            │
│ CHOOSE TIME                │
│ [06:30] [08:00] [18:00]   │
│                            │
│ [ CONTINUE ]               │
└────────────────────────────┘
```

Final:

```text
┌────────────────────────────┐
│ 3 OF 3                     │
│                            │
│ YOUR DETAILS               │
│                            │
│ Name                       │
│ [____________________]     │
│ Email                      │
│ [____________________]     │
│ Phone                      │
│ [____________________]     │
│                            │
│ [ BOOK FREE TRIAL ]        │
└────────────────────────────┘
```

---

# 25. Social / Community Wall

Heading:

```text
SEEN
IN THE GYM
```

Layout:

- mix square and portrait media;
- include videos;
- continuous horizontal reel or grid;
- Instagram/TikTok visual feel;
- original customer/member content only.

---

# 26. FAQ Pattern

```text
QUESTIONS,
ANSWERED.

+ WHAT IS INCLUDED?
────────────────────────────
+ CAN I TRY THE GYM FIRST?
────────────────────────────
+ ARE CLASSES INCLUDED?
────────────────────────────
+ CAN I USE EVERY LOCATION?
```

Open:

```text
− WHAT IS INCLUDED?

  Membership includes gym access,
  classes and selected facilities.
```

Animation:

```text
200–300ms
```

---

# 27. Buttons

Avoid heavily rounded buttons.

Recommended:

```css
.button {
  border-radius: 0;
  padding: 16px 22px;
  text-transform: uppercase;
  font-weight: 800;
}
```

Primary:

```text
yellow background
black text
```

Secondary:

```text
transparent
white border
white text
```

Hover:

- arrow moves;
- colours invert;
- transition 200–300ms.

---

# 28. Motion Specification

Use:

- image zoom on hover;
- clipped text reveals;
- horizontal marquees;
- carousel dragging;
- subtle parallax;
- scroll-triggered headline reveals;
- CTA arrow movement;
- menu transitions;
- number count-ups.

Avoid:

- random flying elements;
- bouncing buttons;
- long page transitions;
- animation on every paragraph;
- exaggerated cursor gimmicks.

---

# 29. Scroll Reveal

Recommended:

```css
.reveal {
  opacity: 0;
  transform: translateY(28px);
}

.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
  transition: 700ms cubic-bezier(.16,1,.3,1);
}
```

Stagger headline lines by 60–100ms.

---

# 30. Sticky Mobile Conversion

After the user leaves the hero:

```text
┌──────────────────────────────┐
│ FREE TRIAL     │   JOIN NOW │
└──────────────────────────────┘
```

Height:

```text
56–64px
```

Hide this while a user is actively filling a signup form.

---

# 31. Image Direction

Photography should feel real and intense.

Capture:

- equipment close-ups;
- plates;
- chalk;
- trainers coaching;
- group classes;
- boxing;
- cycling;
- motion blur;
- sweat;
- lighting;
- gym architecture;
- recovery;
- wide floor shots.

Avoid:

- generic stock gym imagery;
- white studio backgrounds;
- constant smiling at camera;
- obviously different gym interiors.

---

# 32. Video Direction

Hero video:

```text
8–15 second loop
muted
autoplay
playsinline
```

Shot length:

```text
0.6–1.8 seconds
```

Use poster image first, then load video.

Prefer separate desktop/mobile crops.

---

# 33. Footer

Large editorial footer.

```text
TRAIN
WITH US.

[ JOIN NOW ]

LOCATIONS
Westlands
Karen
Kilimani

EXPLORE
Classes
Facilities
Membership
Personal Training

INFO
About
Careers
Contact
FAQ

SOCIAL
Instagram
TikTok
YouTube
```

---

# 34. Suggested Component Architecture

```text
Header
MobileMenu
HeroCampaign
PromoStrip
IntroStatement
StatStrip
ClassGrid
ClassCard
ClassFilter
FacilityCarousel
FacilityCard
SocialWall
LocationSelector
LocationCard
MembershipGrid
MembershipCard
TrainerGrid
FAQAccordion
ConversionBanner
Footer
StickyMobileCTA
```

---

# 35. Suggested React Structure

```text
app/
  page.tsx

  gyms/
    page.tsx
    [slug]/
      page.tsx

  classes/
    page.tsx
    [slug]/
      page.tsx

  memberships/
    page.tsx

  facilities/
    page.tsx

  personal-training/
    page.tsx

  free-trial/
    page.tsx
```

---

# 36. Suggested Technical Stack

High-control custom build:

```text
Next.js
React
TypeScript
Tailwind CSS
GSAP
Framer Motion
Sanity / Strapi / Contentful
Cloudinary
```

Alternative:

```text
Webflow
GSAP
CMS collections
booking integration
```

WordPress:

```text
WordPress
custom Gutenberg blocks
ACF
GSAP
minimal plugins
```

Avoid an overloaded generic gym theme.

---

# 37. Responsive Breakpoints

```css
mobile: 0–639px
tablet: 640–1023px
desktop: 1024–1439px
wide: 1440px+
```

Prefer fluid values through `clamp()`.

---

# 38. Figma Component List

Create:

```text
Button / Primary
Button / Secondary
Button / Text Arrow

Header / Desktop / Transparent
Header / Desktop / Sticky
Header / Mobile

Mobile Menu / Open

Hero / Desktop
Hero / Mobile

Promo Strip

Stat / Item

Card / Class
Card / Facility
Card / Location
Card / Membership
Card / Trainer

Filter / Default
Filter / Active

Carousel / Desktop
Carousel / Mobile

Accordion / Closed
Accordion / Open

CTA / Full Width

Footer / Desktop
Footer / Mobile

Sticky CTA / Mobile
```

---

# 39. Figma Frames Required

Before development, design:

1. Desktop homepage — 1440px
2. Mobile homepage — 390px
3. Classes desktop
4. Classes mobile
5. Individual class page
6. Gym locations page
7. Gym detail page
8. Membership page
9. Free trial flow
10. Mobile menu
11. Navigation states
12. Card hover states
13. Carousel states
14. FAQ open/closed
15. Form states

---

# 40. Content Tone

Avoid:

> Our state-of-the-art facility offers a comprehensive range of wellness solutions.

Prefer:

> Serious kit. Loud sessions. Zero boring workouts.

Tone:

- short;
- confident;
- energetic;
- witty;
- slightly provocative;
- human;
- never corporate.

---

# 41. Original Headline Directions

```text
TRAIN
LOUDER.
```

```text
YOUR GYM
SHOULDN'T
BE BORING.
```

```text
SERIOUS
TRAINING.
ZERO
PRETENCE.
```

```text
BUILT
FOR MORE.
```

```text
FIND
YOUR THING.
```

```text
COME FOR
THE WORKOUT.
STAY FOR
THE ENERGY.
```

---

# 42. What We Are Replicating From the Gymbox Experience

## Visual system

- oversized condensed typography;
- black/light/highlighter palette;
- edge-to-edge photography;
- nightlife-inspired imagery;
- asymmetric editorial grids;
- square cards;
- high section contrast.

## Information architecture

- class categories;
- strong facilities positioning;
- gym/location discovery;
- membership funnel;
- repeated free-trial/join CTAs;
- FAQ support.

## Interaction model

- sticky header;
- large mobile menu;
- visual hover states;
- image zoom;
- horizontal carousels;
- interactive location selector;
- fast filtering;
- accordion FAQs;
- sticky mobile CTA.

## Commercial logic

The visitor should feel:

```text
I WANT TO TRAIN HERE
```

before they start thinking:

```text
HOW MUCH DOES IT COST?
```

---

# 43. Build Order

## Phase 1

1. Header
2. Mobile menu
3. Hero
4. Promo strip
5. Intro
6. Stat strip
7. Classes grid
8. Facility carousel
9. Location selector
10. Membership cards
11. FAQ
12. Footer
13. Sticky mobile CTA

## Phase 2

14. Classes filtering
15. location interactions
16. social wall
17. advanced scroll animation
18. marquee
19. trainer pages
20. booking integration

---

# 44. Final Acceptance Criteria

- [ ] personality is clear within 3 seconds;
- [ ] hero contains a primary CTA;
- [ ] Free Trial is reachable from every core page;
- [ ] classes are browsable by category;
- [ ] facility imagery dominates over text;
- [ ] site does not resemble a template;
- [ ] mobile is intentionally designed;
- [ ] mobile conversion CTA remains accessible;
- [ ] no functionality relies solely on hover;
- [ ] motion respects reduced-motion settings;
- [ ] media is optimised;
- [ ] selected gym/location can affect relevant content;
- [ ] join/trial flows are short;
- [ ] brand content and photography are original.

---

# 45. Summary

The website should be built around this hierarchy:

```text
TYPOGRAPHY = ATTITUDE

PHOTOGRAPHY = PRODUCT

CLASSES = DISCOVERY

FACILITIES = DIFFERENTIATION

LOCATIONS = CONVENIENCE

FREE TRIAL = PRIMARY CONVERSION

JOIN NOW = COMMERCIAL GOAL
```

The goal is not to make a literal clone.

The goal is to capture the strongest characteristics of the Gymbox experience and apply them to a new gym brand with its own content, visual identity, photography, offers, locations, and conversion funnel.
