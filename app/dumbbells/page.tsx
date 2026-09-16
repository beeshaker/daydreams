import type { Metadata } from "next";
import Script from "next/script";

/**
 * The premium scroll-driven Dumbbells page, built with the scroll-craft
 * skill (see scrollcraft/builds/dumbbells-premium/ for the source build,
 * BRIEF.md and lab/ verification screenshots). This replaces the previous
 * card-and-section version of this route.
 *
 * The page is a single self-contained document (its own engine, its own
 * CSS tokens) rather than a normal composition of this app's shared
 * section components, so it's wired in here via resource-hoisted <link>/
 * <style> tags and raw HTML rather than converted into JSX piece by piece —
 * that conversion would risk drifting from the verified build. The static
 * assets (video, images, the scrollcraft engine) live in
 * public/dumbbells-premium/, copied from the build folder; edit the build
 * folder first, then re-copy, rather than editing the strings below by hand
 * for anything more than a copy tweak.
 *
 * The booking form below posts to this same app's /api/leads route (see
 * app/api/leads/route.ts) — now that this page is served from this app,
 * that submission is live, using the TURNSTILE_SITE_KEY committed in this
 * repo's .env, which is Cloudflare's public *test* key. Swap it for the
 * real production site key before this goes live for real visitors.
 */

export const metadata: Metadata = {
  title: "Dumbbells — Your journey starts now",
  description:
    "Strength training for people with a life outside the gym. Real coaches, real classes, one honest place to start.",
};

const PAGE_STYLE = `
  :root {
    --sc-canvas:     #0b0908;
    --sc-surface:    #17110f;
    --sc-ink:        #f5efe7;
    --sc-ink-soft:   #b3a89d;
    --sc-accent:     #c4214b;
    --sc-accent-ink: #150506;
    --sc-font-display: "Archivo", system-ui, sans-serif;
    --sc-font-text:    "Geist", system-ui, sans-serif;
    --sc-shadow-color: 350 45% 3%;
  }

  /* ---------------------------------------------------------------- bar */
  .bar {
    position: fixed; inset: 0 0 auto 0; z-index: var(--sc-z-chrome);
    display: flex; align-items: center; justify-content: space-between;
    padding: clamp(.9rem, 2vw, 1.4rem) var(--sc-gutter);
    background: linear-gradient(to bottom, color-mix(in oklab, var(--sc-canvas) 78%, transparent), transparent);
  }
  .bar__mark {
    font-family: var(--sc-font-display); font-weight: 800; font-size: var(--sc-t-base);
    letter-spacing: var(--sc-track-wide); text-transform: uppercase; color: var(--sc-ink);
    text-decoration: none;
  }
  .bar__cta {
    font-family: var(--sc-font-text); font-weight: 600; font-size: var(--sc-t-sm);
    color: var(--sc-accent-ink); background: var(--sc-accent);
    padding: .6rem 1.2rem; border-radius: var(--sc-r-pill); text-decoration: none;
    transition: transform var(--sc-d-base) var(--sc-ease-out), filter var(--sc-d-base) var(--sc-ease-out);
  }
  .bar__cta:hover { filter: brightness(1.08); transform: translateY(-1px); }
  .bar__cta:active { transform: translateY(0) scale(.97); }
  .bar__cta:focus-visible { outline: 2px solid var(--sc-ink); outline-offset: 3px; }

  /* ------------------------------------------------------------- hero */
  .hero-stage { background: radial-gradient(120% 90% at 72% 30%, #241413 0%, #0b0908 62%); overflow: hidden; }
  .hero-glow {
    position: absolute; inset: -20% -10%;
    background: radial-gradient(38% 46% at 68% 38%, color-mix(in oklab, var(--sc-accent) 26%, transparent), transparent 70%);
    will-change: transform;
  }
  .hero-scrim {
    background: linear-gradient(to top right,
      color-mix(in oklab, var(--sc-canvas) 96%, transparent) 0%,
      color-mix(in oklab, var(--sc-canvas) 82%, transparent) 32%,
      color-mix(in oklab, var(--sc-canvas) 45%, transparent) 56%,
      transparent 78%);
  }
  .hero-copy .eyebrow {
    display: block; font-family: var(--sc-font-text); font-weight: 600; font-size: var(--sc-t-sm);
    letter-spacing: var(--sc-track-wide); text-transform: uppercase; color: var(--sc-accent);
    margin-bottom: var(--sc-4);
  }
  .hero-copy h1 { max-width: 13ch; }
  .hero-copy p.sc-body { margin-top: var(--sc-5); font-size: var(--sc-t-lg); max-width: 34ch; }
  .hero-actions { margin-top: var(--sc-7); display: flex; gap: var(--sc-4); align-items: center; flex-wrap: wrap; }
  .btn-primary {
    font-family: var(--sc-font-text); font-weight: 600; font-size: var(--sc-t-base);
    color: var(--sc-accent-ink); background: var(--sc-accent); padding: .95rem 1.8rem;
    border-radius: var(--sc-r-pill); text-decoration: none; box-shadow: var(--sc-e2);
    transition: transform var(--sc-d-base) var(--sc-ease-out), filter var(--sc-d-base) var(--sc-ease-out);
  }
  .btn-primary:hover { filter: brightness(1.08); transform: translateY(-1px); }
  .btn-primary:active { transform: scale(.97); }
  .btn-primary:focus-visible { outline: 2px solid var(--sc-ink); outline-offset: 3px; }
  .btn-ghost {
    font-family: var(--sc-font-text); font-weight: 600; font-size: var(--sc-t-base); color: var(--sc-ink);
    padding: .95rem 1.6rem; border-radius: var(--sc-r-pill); border: 1px solid var(--sc-hairline-strong);
    text-decoration: none; transition: background var(--sc-d-base) var(--sc-ease-out);
  }
  .btn-ghost:hover { background: color-mix(in oklab, var(--sc-ink) 8%, transparent); }
  .btn-ghost:focus-visible { outline: 2px solid var(--sc-ink); outline-offset: 3px; }

  /* -------------------------------------------------------- peak/turn */
  .turn-copy { max-width: 30rem; }
  .turn-copy .eyebrow {
    display: block; font-family: var(--sc-font-text); font-weight: 600; font-size: var(--sc-t-sm);
    letter-spacing: var(--sc-track-wide); text-transform: uppercase; color: var(--sc-accent);
    margin-bottom: var(--sc-4);
  }
  .turn-quote {
    margin-top: var(--sc-6); padding-top: var(--sc-5); border-top: 1px solid var(--sc-hairline-strong);
    font-size: var(--sc-t-base); color: var(--sc-ink-soft);
  }
  .turn-quote cite { display: block; margin-top: var(--sc-3); font-style: normal; color: var(--sc-ink); font-weight: 600; }

  /* ------------------------------------------------------------- pan */
  .rail { display: flex; align-items: center; gap: var(--sc-6); padding-inline: var(--sc-gutter); height: 100%; }
  .rail__lead { flex: 0 0 clamp(16rem, 30vw, 24rem); display: flex; flex-direction: column; justify-content: center; }
  .rail__lead h2 { margin: 0 0 var(--sc-4); }
  .item {
    flex: 0 0 clamp(15rem, 24vw, 19rem); display: flex; flex-direction: column; gap: var(--sc-4);
  }
  .item__frame {
    position: relative; border-radius: var(--sc-r-lg); overflow: hidden; aspect-ratio: 3/4;
    box-shadow: var(--sc-e2); background: var(--sc-surface);
  }
  .item__frame img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .item h3 { font-family: var(--sc-font-display); font-size: var(--sc-t-lg); font-weight: 700; margin: 0; color: var(--sc-ink); }
  .item p { margin: 0; color: var(--sc-ink-soft); font-size: var(--sc-t-sm); }
  .rail__note { flex: 0 0 clamp(14rem, 22vw, 18rem); display: flex; flex-direction: column; justify-content: center; }
  .rail__note p { margin: 0 0 var(--sc-4); }

  /* -------------------------------------------------------- warmth */
  .quotes { display: grid; gap: var(--sc-8); grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); }
  .quote blockquote { margin: 0; font-family: var(--sc-font-display); font-size: var(--sc-t-xl); font-weight: 600; line-height: var(--sc-leading-tight); color: var(--sc-ink); }
  .quote cite { display: block; margin-top: var(--sc-4); font-style: normal; font-size: var(--sc-t-sm); color: var(--sc-ink-soft); }

  /* -------------------------------------------------------------- close */
  .close-stage { background: linear-gradient(120deg, #0b0908 0%, #17100f 60%, #0b0908 100%); }
  .close__inner { max-width: 30rem; }
  .close__inner .sc-body { margin-top: var(--sc-4); }
  .close-panel {
    margin-top: var(--sc-7); display: flex; flex-direction: column; gap: var(--sc-4);
    padding-top: var(--sc-6); border-top: 1px solid var(--sc-hairline-strong);
  }
  .close-panel__row { display: flex; justify-content: space-between; gap: var(--sc-4); font-size: var(--sc-t-sm); color: var(--sc-ink-soft); }
  .close-panel__row strong { color: var(--sc-ink); font-weight: 600; }
  .cta { margin-top: var(--sc-7); display: inline-block; }
  .foot {
    position: absolute; left: var(--sc-gutter); right: var(--sc-gutter); bottom: var(--sc-4);
    display: flex; justify-content: space-between; gap: var(--sc-4); flex-wrap: wrap;
    font-size: var(--sc-t-xs); color: var(--sc-ink-soft);
  }
  .foot a { color: inherit; }

  /* ----------------------------------------------------------- schedule */
  .schedule-list {
    margin-top: var(--sc-8); max-width: 34rem; list-style: none; padding: 0;
    border-top: 1px solid var(--sc-hairline);
  }
  .schedule-list li {
    display: flex; justify-content: space-between; gap: var(--sc-4);
    padding: var(--sc-4) 0; border-bottom: 1px solid var(--sc-hairline);
    font-size: var(--sc-t-base);
  }
  .schedule-time { color: var(--sc-accent); font-weight: 600; font-variant-numeric: tabular-nums; }
  .schedule-activity { color: var(--sc-ink-soft); text-align: right; }

  /* ---------------------------------------------------------- lead form */
  .lead-form { margin-top: var(--sc-8); max-width: 40rem; }
  .lead-form__hp { position: absolute; left: -9999px; }
  .lead-form__grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sc-5); }
  .lead-form label {
    display: flex; flex-direction: column; gap: var(--sc-2);
    font-size: var(--sc-t-sm); font-weight: 600; color: var(--sc-ink);
  }
  .lead-form label span { font-weight: 400; color: var(--sc-ink-soft); }
  .lead-form input[type="text"], .lead-form input[type="email"], .lead-form input[type="tel"], .lead-form textarea {
    font-family: var(--sc-font-text); font-size: var(--sc-t-base); font-weight: 400; color: var(--sc-ink);
    background: color-mix(in oklab, var(--sc-surface) 70%, transparent);
    border: 1px solid var(--sc-hairline-strong); border-radius: var(--sc-r-md);
    padding: var(--sc-3) var(--sc-4); resize: vertical;
    transition: border-color var(--sc-d-base) var(--sc-ease-out);
  }
  .lead-form input:focus-visible, .lead-form textarea:focus-visible {
    outline: 2px solid var(--sc-accent); outline-offset: 2px; border-color: var(--sc-accent);
  }
  .lead-form__message { margin-top: var(--sc-5); }
  .lead-form__consent {
    margin-top: var(--sc-5); flex-direction: row !important; align-items: flex-start; gap: var(--sc-3) !important;
    font-weight: 400 !important; font-size: var(--sc-t-sm); color: var(--sc-ink-soft);
  }
  .lead-form__consent input { margin-top: 3px; accent-color: var(--sc-accent); width: 1.1rem; height: 1.1rem; flex-shrink: 0; }
  .lead-form__turnstile { margin-top: var(--sc-5); }
  .lead-form__actions { margin-top: var(--sc-6); display: flex; align-items: center; gap: var(--sc-5); flex-wrap: wrap; }
  .lead-form__status { margin: 0; font-size: var(--sc-t-sm); color: var(--sc-ink-soft); }
  .lead-form__status[data-state="success"] { color: var(--sc-accent); }
  .lead-form__status[data-state="error"] { color: #ff8a7a; }
  .lead-form__fallback { margin-top: var(--sc-6); font-size: var(--sc-t-sm); color: var(--sc-ink-soft); }
  .lead-form__fallback a { color: var(--sc-ink); }
  @media (max-width: 640px) {
    .lead-form__grid { grid-template-columns: 1fr; }
    .schedule-activity { text-align: right; max-width: 60%; }
  }

  /* --------------------------------------------------- The Loadout */
  .loadout {
    position: fixed; left: var(--sc-4); bottom: var(--sc-4); z-index: var(--sc-z-chrome);
    display: flex; align-items: center; gap: var(--sc-3);
    padding: .6rem .9rem; border-radius: var(--sc-r-pill);
    background: color-mix(in oklab, var(--sc-surface) 82%, transparent);
    border: 1px solid var(--sc-hairline);
    backdrop-filter: blur(6px);
    box-shadow: var(--sc-e2);
  }
  .loadout__bar { display: flex; align-items: center; }
  .loadout__plate {
    width: 7px; height: 22px; border-radius: 2px; margin-right: 3px;
    border: 1.5px solid color-mix(in oklab, var(--sc-ink) 30%, transparent);
    background: transparent;
    transition: background var(--sc-d-slow) var(--sc-ease-out), border-color var(--sc-d-slow) var(--sc-ease-out), transform var(--sc-d-base) var(--sc-ease-out);
  }
  .loadout__plate.is-loaded {
    background: var(--sc-accent); border-color: var(--sc-accent);
    transform: scaleY(1.15);
  }
  .loadout__rod { width: 20px; height: 3px; background: color-mix(in oklab, var(--sc-ink) 40%, transparent); margin-inline: 2px; border-radius: 2px; }
  .loadout__label { font-family: var(--sc-font-text); font-size: var(--sc-t-xs); color: var(--sc-ink-soft); white-space: nowrap; }
  @media (max-width: 640px) {
    .loadout__label { display: none; }
    .loadout { padding: .5rem .6rem; }
  }
  @media (prefers-reduced-motion: reduce) {
    .loadout__plate { transition: background var(--sc-d-fast), border-color var(--sc-d-fast); }
  }

  /* ------------------------------------------------------------ misc */
  .sc-copy--trail-hi { top: clamp(3rem, 14vh, 8rem); bottom: auto; }
  @media (max-width: 860px) {
    .hero-copy h1 { max-width: 11ch; font-size: var(--sc-t-3xl); }
    .rail__lead, .rail__note { flex-basis: 16rem; }
    .turn-quote { font-size: var(--sc-t-sm); }
    .close-scrim {
      background: linear-gradient(to top,
        color-mix(in oklab, var(--sc-canvas) 97%, transparent) 0%,
        color-mix(in oklab, var(--sc-canvas) 88%, transparent) 50%,
        color-mix(in oklab, var(--sc-canvas) 50%, transparent) 80%,
        transparent 98%);
    }
    .hero-scrim {
      background: linear-gradient(to top,
        color-mix(in oklab, var(--sc-canvas) 98%, transparent) 0%,
        color-mix(in oklab, var(--sc-canvas) 92%, transparent) 40%,
        color-mix(in oklab, var(--sc-canvas) 60%, transparent) 72%,
        transparent 94%);
    }
  }
`;

const PAGE_BODY = `
<span data-sc-progress></span>
<div class="sc-grain" aria-hidden="true"></div>

<header class="bar">
  <a class="bar__mark" href="#top">Dumbbells</a>
  <a class="bar__cta" href="#join">Book a Session</a>
</header>

<div class="loadout" aria-hidden="true">
  <div class="loadout__bar">
    <div class="loadout__plate" data-plate></div>
    <div class="loadout__plate" data-plate></div>
    <div class="loadout__plate" data-plate></div>
    <div class="loadout__rod"></div>
    <div class="loadout__plate" data-plate></div>
    <div class="loadout__plate" data-plate></div>
    <div class="loadout__plate" data-plate></div>
  </div>
  <span class="loadout__label" data-loadout-label>Ready</span>
</div>

<main id="top">

  <!-- 1 · CONFIDENCE -> TRUST : one continuous scrub, two copy moments -->
  <section data-sc-act="scrub" data-sc-span="5.4" data-sc-dwell="0.26" data-sc-drift="#0b0908">
    <div data-sc-stage class="hero-stage">
      <img class="sc-stage__poster" src="/dumbbells-premium/assets/hero-snatch-poster.webp" alt="">
      <video data-sc-scrub data-sc-src="/dumbbells-premium/assets/hero-snatch.mp4" data-sc-src-mobile="/dumbbells-premium/assets/hero-snatch-m.mp4" playsinline muted
             aria-label="A woman performing a dumbbell snatch, pulling the weight from the floor to a locked-out overhead catch, then lowering and dropping it to the floor as chalk bursts on impact, one continuous take"></video>
      <div class="hero-glow" data-sc-parallax="-1.1" aria-hidden="true"></div>
      <div class="sc-scrim sc-scrim--lead hero-scrim" aria-hidden="true"></div>

      <div class="sc-copy sc-copy--lead hero-copy" data-sc-cue="0 0.38 0">
        <span class="eyebrow">Dumbbells &middot; strength &amp; fitness</span>
        <h1 class="sc-display sc-display--xl" data-sc-kinetic="lines">Your journey starts now.</h1>
        <p class="sc-body">Strength training for people with a life outside the gym. Real coaches. Real classes. One honest place to start.</p>
        <div class="hero-actions">
          <a class="btn-primary" href="#join" data-sc-magnet="0.22">Book a Session</a>
          <a class="btn-ghost" href="#range">See the classes</a>
        </div>
      </div>

      <div class="sc-copy sc-copy--lead turn-copy" data-sc-cue="0.55 0.88">
        <span class="eyebrow">The difference</span>
        <h2 class="sc-display sc-display--lg" data-sc-kinetic="lines">That's what one real rep sounds like.</h2>
        <div class="turn-quote">
          <p>The weight comes down loud when it was actually heavy. Nobody here is going to look over.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- 4 · CURIOSITY : pan -->
  <section id="range" data-sc-act="pan" data-sc-span="4.4" data-sc-drift="#120e0c">
    <div data-sc-stage>
      <div class="rail" data-sc-pan="0.06">
        <div class="rail__lead sc-stack">
          <h2 class="sc-display sc-display--md">Pick your set.</h2>
          <p class="sc-body">Four classes, run by four coaches who actually know your name.</p>
        </div>

        <article class="item">
          <div class="item__frame" data-sc-tilt="6"><img src="/dumbbells-premium/assets/class-sunrise.webp" alt="A stationary bike lit by early morning window light in an empty studio"></div>
          <h3>Sunrise Spin</h3>
          <p>Rhythm-driven cardio to start the day right. 6:00 AM.</p>
        </article>

        <article class="item">
          <div class="item__frame" data-sc-tilt="6"><img src="/dumbbells-premium/assets/class-hiit.webp" alt="Battle ropes frozen mid-slam in a dark gym"></div>
          <h3>HIIT Bootcamp</h3>
          <p>High-energy intervals that build full-body power in 45 minutes. 5:30 PM.</p>
        </article>

        <article class="item">
          <div class="item__frame" data-sc-tilt="6"><img src="/dumbbells-premium/assets/class-strength.webp" alt="A loaded barbell resting in a squat rack" style="object-position: 30% 55%;"></div>
          <h3>Strength Foundations</h3>
          <p>Barbell basics, coached one rep at a time. 7:00 AM.</p>
        </article>

        <article class="item">
          <div class="item__frame" data-sc-tilt="6"><img src="/dumbbells-premium/assets/class-mobility.webp" alt="A foam roller and towel resting on a gym mat"></div>
          <h3>Mobility &amp; Recovery</h3>
          <p>Slow down, stretch out, move better. 7:30 PM.</p>
        </article>

        <div class="rail__note sc-stack">
          <p class="sc-body">Seven classes run every weekday, mornings through evenings.</p>
          <a class="btn-ghost" href="#schedule">See the full week</a>
        </div>
      </div>
    </div>
  </section>

  <!-- SCHEDULE : flow. Logistics, not experience, so it stays short and unpinned. -->
  <section id="schedule" class="sc-section" data-sc-act="flow" data-sc-drift="#100d0c">
    <div class="sc-wrap">
      <div class="sc-stack" data-sc-in data-sc-stagger="60">
        <h2 class="sc-display sc-display--md">This week.</h2>
        <p class="sc-body">Same seven classes, every weekday.</p>
      </div>
      <ul class="schedule-list" data-sc-in data-sc-stagger="30">
        <li><span class="schedule-time">6:00 AM</span><span class="schedule-activity">Sunrise Spin</span></li>
        <li><span class="schedule-time">7:00 AM</span><span class="schedule-activity">Strength Foundations</span></li>
        <li><span class="schedule-time">9:00 AM</span><span class="schedule-activity">Mobility &amp; Recovery</span></li>
        <li><span class="schedule-time">12:00 PM</span><span class="schedule-activity">HIIT Bootcamp (Lunch Express)</span></li>
        <li><span class="schedule-time">5:30 PM</span><span class="schedule-activity">HIIT Bootcamp</span></li>
        <li><span class="schedule-time">6:30 PM</span><span class="schedule-activity">Strength Foundations</span></li>
        <li><span class="schedule-time">7:30 PM</span><span class="schedule-activity">Mobility &amp; Recovery</span></li>
      </ul>
    </div>
  </section>

  <!-- 5 · WARMTH : flow, quieter than the peak -->
  <section class="sc-section" data-sc-act="flow" data-sc-drift="#0e0b0a">
    <div class="sc-wrap">
      <div class="sc-stack" data-sc-in data-sc-stagger="60">
        <h2 class="sc-display sc-display--md">Real members. Real weeks.</h2>
      </div>
      <div class="quotes" data-sc-in data-sc-stagger="80" style="margin-top: var(--sc-8);">
        <div class="quote">
          <blockquote>&ldquo;Dropping my kid off next door and walking straight into a 6am spin class is the only reason I still work out.&rdquo;</blockquote>
          <cite>Priya S. &middot; Member &amp; Daydreams parent</cite>
        </div>
        <div class="quote">
          <blockquote>&ldquo;Strength Foundations took me from intimidated by the squat rack to actually enjoying leg day.&rdquo;</blockquote>
          <cite>Marcus T. &middot; Member, 1 year</cite>
        </div>
        <div class="quote">
          <blockquote>&ldquo;I've tried four gyms in this city and this is the first one where the coaches actually watch your form instead of just counting reps.&rdquo;</blockquote>
          <cite>Jordan K. &middot; Member, 8 months</cite>
        </div>
      </div>
    </div>
  </section>

  <!-- BOOK : flow. Real form, posts to the same /api/leads the live site uses. -->
  <section id="join" class="sc-section" data-sc-act="flow" data-sc-drift="#0b0908">
    <div class="sc-wrap">
      <div class="sc-stack" data-sc-in data-sc-stagger="60">
        <h2 class="sc-display sc-display--md">Book a session.</h2>
        <p class="sc-body">Tell us a bit about you and we'll reach out to get you started.</p>
      </div>

      <form id="lead-form" class="lead-form" data-sc-in novalidate>
        <div class="lead-form__hp" aria-hidden="true">
          <label for="lf-company">Company website</label>
          <input type="text" id="lf-company" name="companyWebsite" tabindex="-1" autocomplete="off">
        </div>

        <div class="lead-form__grid">
          <label>Name<input type="text" name="parentName" required autocomplete="name"></label>
          <label>Email<input type="email" name="email" required autocomplete="email"></label>
          <label>Phone <span>(optional)</span><input type="tel" name="phone" autocomplete="tel"></label>
          <label>Preferred contact <span>(optional)</span><input type="text" name="preferredContact" placeholder="Call, text, or email"></label>
        </div>

        <label class="lead-form__message">Anything else? <span>(optional)</span><textarea name="message" rows="3"></textarea></label>

        <label class="lead-form__consent">
          <input type="checkbox" name="consent" required>
          <span>I agree to be contacted about booking a session.</span>
        </label>

        <div id="turnstile-container" class="lead-form__turnstile"></div>

        <div class="lead-form__actions">
          <button type="submit" class="btn-primary">Book a Session</button>
          <p class="lead-form__status" role="status" aria-live="polite"></p>
        </div>

        <p class="lead-form__fallback">Prefer email or a call? <a href="mailto:daydreamsanddumbbells@gmail.com?subject=Book%20a%20Session">daydreamsanddumbbells@gmail.com</a> &middot; <a href="tel:+254180117040">0180 117040</a></p>
      </form>
    </div>
  </section>

  <!-- 6 · RESOLVE : pin + pointer. last element on the page. -->
  <section data-sc-act="pin" data-sc-span="1.3" data-sc-drift="#0b0908">
    <div data-sc-stage class="close-stage" data-sc-spotlight>
      <img src="/dumbbells-premium/assets/close-bg.webp" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position: 30% center;">
      <div class="sc-scrim sc-scrim--lead close-scrim" aria-hidden="true"></div>

      <div class="sc-copy sc-copy--lead close__inner" data-sc-cue="0.06">
        <h2 class="sc-display sc-display--lg" data-sc-kinetic="lines">Your journey starts now. For real this time.</h2>
        <p class="sc-body">Come in for a session. Meet your coach. See what a gym feels like when the coaching is actually good.</p>

        <div class="close-panel">
          <div class="close-panel__row"><span>Mon &ndash; Fri</span><strong>8:30 AM &ndash; 6:00 PM</strong></div>
          <div class="close-panel__row"><span>Saturday</span><strong>9:00 AM &ndash; 1:00 PM</strong></div>
          <div class="close-panel__row"><span>41 Gurviellia Grove, Nairobi</span><strong>0180 117040</strong></div>
        </div>

        <a class="cta btn-primary" href="#join" data-sc-magnet="0.24" data-sc-rise="0">Book a Session</a>
      </div>

      <footer class="foot">
        <span>&copy; Dumbbells</span>
        <a href="tel:+254180117040">0180 117040</a>
      </footer>
    </div>
  </section>

</main>
`;

const LOADOUT_SCRIPT = `
(function () {
  var acts = Array.prototype.slice.call(document.querySelectorAll('main > [data-sc-act]'));
  var plates = Array.prototype.slice.call(document.querySelectorAll('[data-plate]'));
  var label = document.querySelector('[data-loadout-label]');
  var total = acts.length;
  var ticking = false;

  function update() {
    ticking = false;
    var reached = 0;
    var vh = window.innerHeight;
    for (var i = 0; i < acts.length; i++) {
      var r = acts[i].getBoundingClientRect();
      if (r.top <= vh * 0.55) reached = i + 1;
    }
    for (var p = 0; p < plates.length; p++) {
      plates[p].classList.toggle('is-loaded', p < reached);
    }
    if (label) {
      label.textContent = reached === 0 ? 'Ready' : 'Set ' + reached + ' of ' + total;
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
`;

const LEAD_FORM_SCRIPT = `
(function () {
  var TURNSTILE_SITE_KEY = '1x00000000000000000000AA';
  var turnstileToken = '';

  var form = document.getElementById('lead-form');
  if (!form) return;
  var statusEl = form.querySelector('.lead-form__status');
  var submitBtn = form.querySelector('button[type="submit"]');

  if (TURNSTILE_SITE_KEY) {
    var s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    s.async = true;
    s.defer = true;
    s.onload = function () {
      var container = document.getElementById('turnstile-container');
      if (container && window.turnstile) {
        window.turnstile.render(container, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: function (token) { turnstileToken = token; }
        });
      }
    };
    document.head.appendChild(s);
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var data = new FormData(form);
    var consentEl = form.querySelector('input[name="consent"]');

    var payload = {
      leadType: 'gym-interest',
      source: 'traditional-site',
      parentName: String(data.get('parentName') || ''),
      email: String(data.get('email') || ''),
      phone: String(data.get('phone') || '') || undefined,
      preferredContact: String(data.get('preferredContact') || '') || undefined,
      message: String(data.get('message') || '') || undefined,
      consent: !!(consentEl && consentEl.checked),
      companyWebsite: String(data.get('companyWebsite') || ''),
      turnstileToken: turnstileToken || undefined
    };

    submitBtn.disabled = true;
    statusEl.textContent = 'Sending…';
    statusEl.removeAttribute('data-state');

    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json().then(function (body) { return { ok: res.ok, body: body }; });
      })
      .then(function (result) {
        submitBtn.disabled = false;
        if (result.ok && result.body && result.body.success) {
          statusEl.textContent = "Thanks — we've got your info. We'll reach out soon.";
          statusEl.setAttribute('data-state', 'success');
          form.reset();
        } else {
          statusEl.textContent = (result.body && result.body.error) || 'Something went wrong. Please try the email or phone below instead.';
          statusEl.setAttribute('data-state', 'error');
        }
      })
      .catch(function () {
        submitBtn.disabled = false;
        statusEl.textContent = "Couldn't reach the booking system from here. Please use the email or phone below instead.";
        statusEl.setAttribute('data-state', 'error');
      });
  });
})();
`;

export default function DumbbellsPage() {
  return (
    <>
      <link
        rel="icon"
        href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7' fill='%230b0908'/><rect x='7' y='14' width='18' height='4' rx='1.5' fill='%23c4214b'/><rect x='4' y='11' width='4' height='10' rx='1' fill='%23c4214b'/><rect x='24' y='11' width='4' height='10' rx='1' fill='%23c4214b'/></svg>"
      />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Geist:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/dumbbells-premium/scrollcraft.css" />
      <style dangerouslySetInnerHTML={{ __html: PAGE_STYLE }} />

      <div dangerouslySetInnerHTML={{ __html: PAGE_BODY }} />

      {/* A plain <Script src> here races the mount call below (Next loads
          external afterInteractive scripts asynchronously, so execution
          order between separate Script tags isn't guaranteed). Load and
          mount from one inline script instead, sequenced with onload. */}
      <Script id="scrollcraft-boot" strategy="afterInteractive">
        {`
          (function () {
            var s = document.createElement('script');
            s.src = '/dumbbells-premium/scrollcraft.js';
            s.onload = function () { window.ScrollCraft.mount(document.body); };
            document.head.appendChild(s);
          })();
        `}
      </Script>
      <Script id="loadout" strategy="afterInteractive">
        {LOADOUT_SCRIPT}
      </Script>
      <Script id="lead-form" strategy="afterInteractive">
        {LEAD_FORM_SCRIPT}
      </Script>
    </>
  );
}
