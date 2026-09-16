# Dumbbells — premium scroll page

Build folder: `scrollcraft/builds/dumbbells-premium/`. Ships as a standalone
static HTML page, kept fully separate from the live Next.js `/dumbbells` route
so nothing about the current site changes.

## 1. Vibe

User's words: "premium and trusted", "impactful", built around a woman doing
exercise with a dumbbell and a quote like "your journey starts now." No named
references were given (interview kept to the essentials the user cared about).
Taken together with the aesthetic-range answer below, the vibe is: **quiet
confidence, not hype** — a gym that trusts its coaching rather than shouting
about it.

## 2. Scroll journey (user's sequence, filled in with real fixture content)

1. Hero: the woman with the dumbbell, "your journey starts now."
2. The honest reason people stop (no real gym markets this, but every member
   has lived it).
3. The turn: real coaching, not headcount — built from the actual member
   testimonial already in the codebase ("the first one where the coaches
   actually watch your form instead of just counting reps").
4. The range: the four real classes (Sunrise Spin, HIIT Bootcamp, Strength
   Foundations, Mobility & Recovery).
5. Real member voices.
6. Commitment: join, with the real schedule and hours.

## 3. Energy curve

Calm open (a held breath, not a shout) → quiet dip (naming the past failure) →
warm rise (the coaching truth) → brighter, faster (the class range) → settled
(member voices) → resolved, confident close. Loud the whole way was explicitly
not asked for; "premium and trusted" reads as restraint, not volume.

## 4. Feeling curve (written before acts, see feel.md)

```
1  Confidence     the woman performing a full dumbbell snatch, floor to overhead lockout,
                  held long enough to land, "your journey starts now" on a greet cue
2  Trust          PEAK. a coach spotting a real lift, close and exact, paired with the real
                  member line about coaches who watch your form instead of counting reps
3  Curiosity      four classes travelling sideways, each with its own energy and accent colour
4  Warmth         real member quotes, settled, quieter than the peak
5  Resolve        the barbell (signature move) fully loaded, schedule + hours, one CTA, holds
```

Revised: act 2 (Recognition, the "you've joined before" quiet flow section) was cut at the
user's request. The curve now goes straight from the hero's confidence into the peak's trust,
losing the deliberate dip but tightening the page — five acts instead of six. The hero's own
clip absorbs a little of that quiet-before-the-turn function on replay, since it now holds
on the lockout for a beat before handing off.

## 5. The peak

**"The coach's hand stops your bar an inch before it would have hurt you, and
that's the exact moment you stop shopping for gyms."** Lives in act 3 (Turn).
Gets the biggest generated asset, the quiet act 2 in front of it for silence,
and the largest `data-sc-span` on the page.

## 6. The signature move: The Loadout

A fixed barbell glyph, bottom-left, present the entire page. Empty at the top.
Every act the visitor completes racks one plate on it, with a small label
("Set 1 of 5" … "Set 5 of 5"). By the close the bar is fully loaded, at the
exact moment the CTA appears, so the visitor has already "finished a set"
before they've joined anything. Coded in the page's own JS off `sc:actchange`-
style progress reads of `--sc-p` per section boundary, not a kit parameter.

Tell-someone sentence: **"It's the site where a barbell in the corner loads a
plate every time you finish a chapter, so by the time you hit join, you've
already done a full set."**

## 7. Aesthetic range

Premium-minimal, per the interview answer. Dark canvas, one accent (the
brand's existing `#c4214b` crimson-pink, pulled from the live site's own
palette so the new page still reads as the same gym, just far more confident),
restrained motion, real photography.

## 8. Structure: distinct scenes, not one world

Explicit answer: **distinct scenes**, not a continuous worldflight. Six acts,
hard content beats, smooth ground `drift` between them so the handoffs don't
clash, but each act is its own moment with its own device.

## 9. Assets

No existing photography of the space, trainers or members exists in the repo
(the current site ships colour-block placeholder cards, no real photos). User
confirmed: generate everything. `KIE_AI_API_KEY` is not configured on this
machine, so imagery is generated via the Higgsfield tools available in this
environment instead of the skill's default kie.ai pipeline, following the same
discipline: one reused style preamble, a named negative list, named empty
space per shot, and layered/alpha-cutout planes for the hero. Cost checked
against the user's account balance (268 credits; stills ~2 credits each) before
spending; noted in the final report rather than asked per-image.

## 10. Grammar

**Filmic one-shot.** Justification in the build report: the user's own hero
direction — one full-bleed photographic image, a woman mid-lift, a direct
quote — is exactly this grammar's defined hero device and nothing else's. The
other seven were checked and rejected for the same reason each time:
chaptered editorial's hero is banned from carrying a photograph above the fold;
live surface bans marketing chrome and hero claims entirely; continuous world
requires literal worldflight geography, which the interview explicitly ruled
out; typographic poster bans a photographic ground; gallery/catalog wants
object labels, not one claim; split stage bans a full-bleed hero before the
resolve; rhythmic cutlist wants twelve-plus short cuts, not one held opener.
Filmic one-shot is the only grammar whose hero device does not fight the asset
the client asked for by name.

Revised after first ship: the user asked explicitly for video over the static
hero, calling out that they wanted it "buttery smooth." Generated two `scrub`
clips (hero and the act-3 peak) via image-to-video from approved stills, camera
pushing in slowly and continuously with no cuts, encoded at a dense GOP for
scrubbing per assets.md. That is the two-scrub cap for the whole page.

Revised again: the user asked for the hero to specifically show a dumbbell
snatch, and for the video itself to carry the motion rather than a camera push
over a held pose. The hero is now a static locked-off camera watching her
perform the full lift, floor to overhead lockout, in one continuous take — the
scroll scrubs through the rep itself rather than through a dolly move. Two
real defects were caught and fixed before shipping: the first take's dumbbell
went completely out of frame at the lockout because the starting composition
had no headroom for her to stand to full height (fixed by recomposing the
still with two-thirds empty space above her before generating video again),
and the clip was trimmed a few tenths of a second before its actual end
because she kept rising past the clean catch and the dumbbell drifted out of
frame again near the very last frames. The old `hero-fg` foreground parallax
layer (a floor-texture image built for the original held-pose hero) was
removed entirely once it started floating mid-frame against the new footage's
different background — it no longer served the new content, so it was cut
rather than patched. The `hero-glow` colour-wash parallax layer stays. The
peak clip (coach/bar) is unchanged.

Revised again, third pass: the user reported the hero clip going by too fast
right as she stands up, and asked to cut the Recognition act entirely, and
flagged excess empty space at the bottom of the classes rail.

- **Hero pacing.** The trimmed clip ended the instant she reached lockout,
  with no footage of her actually holding it — so under scroll the payoff
  arrived and vanished in the same instant. Padded the clip with 1.4s of the
  final frame held (via `ffmpeg tpad`, not a new generation — the frame
  already existed and was already clean), taking it from 91 to 125 frames
  (5.2s), and raised `data-sc-span` from 2.6 to 3.1 so the whole lift, not
  just the hold, has more scroll room per beat. Dwell nudged down from 0.34
  to 0.3 since a longer span already supplies more of the settling this was
  doing.
- **Recognition act removed.** Cut per direct request. This does put two
  `scrub` acts back to back (hero, then the peak) for the first time on this
  page, which trades away the device-variety rule in exchange for a tighter
  page; the two clips are different enough in subject and grade that it reads
  as two moments rather than one device repeated. Five acts now, not six.
- **Pan section whitespace.** `.rail` was `align-items: stretch`, which forced
  every column (lead text, cards, closing note) to fill the pinned stage's
  full 100vh, while none of their actual content was that tall — the visible
  symptom was a wall of empty black under a normal-height row of cards.
  Changed to `align-items: center`; nothing else needed touching.

Revised a fourth time: the user flagged the peak section (a close-up of a
man's hand near a woman's grip, his face staring intently in soft focus
behind the bar, headline "The coaches actually watch your form.") as creepy —
the tight proximity and intent gaze read as surveillance rather than support,
independent of what the copy actually meant. Replaced the concept entirely
rather than just recomposing the same shot:

- **New visual.** A female coach (matching the gym's real trainer roster —
  Dana Okafor, HIIT & Conditioning Coach) spotting a lifter at a squat rack
  from a respectful mid-distance, her hand near the bar's collar rather than
  the lifter's body, her gaze on the bar path rather than on the other
  person. Both women fully and plainly clothed, no logos, generated with the
  same guardrail prompt language this build already needed twice before.
- **New copy.** Headline changed to "World-class coaching, not a headcount."
  and the body to an original philosophy line ("Every class here is run by
  someone who spent years getting good at this one specific thing, not a
  generalist reading off a whiteboard.") — not a testimonial, so no invented
  numbers or claims, matching how the rest of the page states its position.
- **The real quote was moved, not deleted.** Jordan K.'s testimonial ("the
  coaches actually watch your form instead of just counting reps") is genuine
  member content — it now lives in the Warmth act's three-quote grid
  alongside Priya S. and Marcus T., away from any image.
- **The close section's echo fixed too.** Its body copy ("...someone's
  actually watching your form") repeated the same word the peak was retired
  for, so it was reworded to "...the coaching is actually good."
- **Device simplified as a side effect.** The peak no longer needs to be a
  `scrub` clip (no camera move or subject motion to carry) — it's a `pin`
  over a still, which also undoes the two-scrub-adjacent tradeoff from the
  previous revision: the hero is now the only scrub act on the page.

Revised a fifth time: the user pointed out the coaching still didn't react to
scroll at all, and separately proposed a new concept — carry the story on from
the hero directly. The same woman just finished her snatch; this section is
the dumbbell she was holding hitting the floor, chalk bursting on impact.

- **New visual, no second person needed.** A low, floor-level shot: two
  dumbbells settling on the rubber floor, chalk dust bursting and billowing
  on impact, her bare feet landing at the top of frame. Generated as a
  `scrub` clip again (image-to-video, static camera, object physics rather
  than human biomechanics — lower risk than the earlier lift generations,
  and it came back clean on the first attempt). This removes the coaching
  concept, and any proximity-to-a-person question, entirely.
- **New copy, moved off coaching per the user's direction.** Headline is now
  "That's what one real rep sounds like.", body "The weight comes down loud
  when it was actually heavy. Nobody here is going to look over." Original
  site copy, not a testimonial, carrying a quiet no-judgment positioning
  instead of a coaching claim.
- **Back to two scrub acts.** The page returns to hero + this act both being
  `scrub`, which is the skill's own two-clip cap — restoring the pattern from
  before the coaching-image detour rather than a new tradeoff.
- **The coaching still and its copy are gone.** `assets/peak-poster.webp`
  (the coach-and-lifter photo) was fully superseded; Dana Okafor is no
  longer depicted anywhere on the page. Jordan K.'s testimonial, already
  relocated to the Warmth section in the previous revision, stays there
  untouched.

Revised a sixth time: the user watched the hero and trust acts back to back
and correctly called out that they read as two different shots pretending to
be one story — because they were: two independent generations, two different
starting stills, two different camera framings. Asked directly whether to
merge them into one section with the video literally extended, rather than
two lookalike clips. Confirmed: yes.

- **True single continuous clip, not a lookalike.** Uploaded the actual hero
  footage (`out/raw-snatch-held.mp4`, the pre-encode version with the settle
  hold) via `media_upload`/`media_confirm`, then extended it forward with
  `seedance_2_5` in `video_extension` mode. This continues the *real* video —
  same subject, same lighting, same wardrobe, because it's the same file, not
  a new generation matched to look similar. It worked cleanly on the first
  attempt: the extension's first frame is pixel-identical to the original's
  last frame, and the seam is invisible on inspection.
  - The API call returns only the new appended segment (5s), not the full
    combined video, so the original clip and the extension were concatenated
    locally with `ffmpeg` (scaling the extension from its native 720x1280 up
    to match the original's 1080x1920) into one 245-frame, 10.2s file.
  - Per a follow-up request, the extension prompt also asked the camera to
    slowly arc/rotate during the drop so she ends up positioned in the right
    third of the frame — this is what lets both copy moments now anchor
    `sc-copy--lead` (left) instead of the old lead/trail split, since the
    open frame space is on the left throughout.
- **Two acts merged into one.** The hero and trust sections are now a single
  `<section data-sc-act="scrub">` (span 5.4, dwell 0.26) with **two
  sequential `.sc-copy` blocks** sharing one stage: the hero copy
  (`data-sc-cue="0 0.38 0"`) and the trust copy (`data-sc-cue="0.55 0.88"`).
  The page drops from 5 acts to 4; the Loadout's plate count reads act
  elements live off the DOM, so "Set N of 4" needed no code change.
- **A deliberate quiet stretch, not a gap.** Between 0.38 and 0.55 progress,
  no copy is on screen at all — the explosive middle of the lift carries
  itself without text competing for attention. Between 0.88 and 1.0, the
  dumbbell settles in silence before handoff to the pan section. Both are
  authored, not accidental; noted here so the verification pass doesn't
  mistake either for dead scroll.
- **Assets retired.** `peak.mp4` / `peak-m.mp4` / `peak-poster.webp` (the
  dumbbell-drop clip generated as its own independent clip) are gone,
  superseded by the merged `hero-snatch.mp4` carrying both beats. The now-
  unused `.turn-figure` and `.turn-scrim` CSS rules were removed; `.turn-copy`
  and `.turn-quote` stayed, now styling the second copy block in the merged
  stage instead of a separate section.

Revised a seventh time: the user pointed out this page had dropped two real
pieces of functionality the live `/dumbbells` site has — a schedule/calendar
view and an actual booking form — in favor of pure marketing copy. Both were
added back as new `flow` acts (logistics content, so unpinned, per
`pacing.md`'s "compress the administrative parts" guidance):

- **Schedule act** (new, after the pan/classes act, id `schedule`): the same
  seven real time blocks from `content/fixtures/gym-schedule.ts`, verbatim,
  in a simple list — not a calendar grid, matching what the live site's own
  `ScheduleSection` component actually is. The pan section's "See the full
  week" link, previously a dead pointer at `#join`, now correctly anchors
  here.
- **Book a Session act** (new, replaces the old bare mailto CTA, id moved to
  here as `join`): a real form — name, email, phone (optional), preferred
  contact (optional), message (optional), a required consent checkbox, and a
  honeypot field — that POSTs JSON to `/api/leads`, the same endpoint
  `components/dumbbells/BookASessionForm.tsx` uses, with the same payload
  shape (`leadType: "gym-interest"`, `source: "traditional-site"`, Turnstile
  token included). This is a genuine choice, not a shortcut: the user was
  asked whether to fake it with a mailto-only form or wire the real backend,
  and chose the real backend, understanding it only actually delivers leads
  once this page is deployed same-origin with the Next.js app — verified live
  in this build's own preview, where the fetch correctly reaches
  `/api/leads` and 404s (no such route on the static preview server) rather
  than silently doing nothing, and the UI falls back to showing the
  email/phone line beneath the form.
  - The Cloudflare Turnstile widget is wired in with the site key already in
    this repo's `.env` (`1x00000000000000000000AA`), which is Cloudflare's
    published **test** key, not a production one — it always passes and is
    safe to expose client-side, but must be swapped for the real site key
    before this page goes live. Verified rendering and auto-passing live in
    the build's own preview.
  - The close section's own CTA changed from a direct `mailto:` link to
    `href="#join"`, now pointing at the real form instead of bypassing it.
- **Acts: 4 → 6.** The Loadout's plate count is read live off the DOM, so
  "Set N of 6" needed no code change.

## 11. Fingerprint gate

Registry at `scrollcraft/FINGERPRINTS.md` was empty (first build in this
workspace). No prior rows to clear. Updated post-revision to record 6 acts —
one merged scrub (hero + trust) plus five flow/pan/pin acts, two of which
(schedule, booking) are real functional content rather than pure marketing.

## Authored silence

Superseded twice over: the original Recognition act (three lines, near-empty
dark stage) was removed in an earlier revision, and the two-act boundary that
briefly separated the hero from the trust section is gone now too, folded
into one clip. The authored silence on the page today lives *inside* the
merged act itself: the untexted 0.38–0.55 stretch mid-lift, and the untexted
0.88–1.0 stretch as the dumbbell settles before the pan section arrives.
