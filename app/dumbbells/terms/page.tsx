import type { Metadata } from "next";
import Link from "next/link";

/**
 * Lightweight, static legal page — not part of the scrollcraft build (see
 * app/dumbbells/page.tsx), since it has no scroll effects, just Terms of
 * Service to read. Styled with the same dark/crimson tokens as the main
 * Dumbbells page for visual consistency, kept local to this file rather
 * than importing the whole scrollcraft stylesheet.
 */

export const metadata: Metadata = {
  title: "Terms of Service — Dumbbells",
  description: "The terms that apply to using this website and booking a session with Dumbbells.",
};

const STYLE = `
  .legal {
    --ink: #f5efe7; --ink-soft: #b3a89d; --canvas: #0b0908; --accent: #c4214b;
    background: var(--canvas); color: var(--ink);
    font-family: "Geist", system-ui, sans-serif;
    min-height: 100dvh;
  }
  .legal__wrap { max-width: 42rem; margin-inline: auto; padding: 3.5rem 1.5rem 6rem; }
  .legal__back { color: var(--ink-soft); text-decoration: none; font-size: .9rem; }
  .legal__back:hover { color: var(--ink); }
  .legal h1 { font-family: "Archivo", system-ui, sans-serif; font-weight: 800; font-size: clamp(1.9rem, 5vw, 2.6rem); margin: 1.5rem 0 .5rem; }
  .legal__updated { color: var(--ink-soft); font-size: .85rem; margin: 0 0 2.5rem; }
  .legal h2 { font-family: "Archivo", system-ui, sans-serif; font-weight: 700; font-size: 1.2rem; margin: 2.2rem 0 .75rem; }
  .legal p, .legal li { color: var(--ink-soft); line-height: 1.65; font-size: .98rem; }
  .legal ul { padding-left: 1.2rem; margin: .5rem 0; }
  .legal li { margin: .3rem 0; }
  .legal a { color: var(--accent); }
  .legal strong { color: var(--ink); }
`;

export default function DumbbellsTermsPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="legal">
        <div className="legal__wrap">
          <Link href="/dumbbells" className="legal__back">
            ← Back to Dumbbells
          </Link>
          <h1>Terms of Service</h1>
          <p className="legal__updated">Last updated: September 2026</p>

          <p>
            These terms cover your use of this website and the booking form on it. By submitting the form, you
            agree to them.
          </p>

          <h2>What this site is</h2>
          <p>
            This website is informational — it describes our classes, schedule, and coaches, and lets you submit
            your details so we can reach out about booking a session. It does not process payments or create a
            binding membership agreement on its own; membership terms, pricing, and any waivers are handled in
            person at the gym.
          </p>

          <h2>Using the booking form</h2>
          <p>When you submit the form, you agree to give us accurate contact information and to use the form for genuine booking inquiries, not spam or automated submissions.</p>

          <h2>Physical activity &amp; risk</h2>
          <p>
            Strength training and group fitness classes carry an inherent risk of injury. Nothing on this site is
            medical advice — if you have a health condition or are unsure whether a class is right for you,
            check with a doctor before training with us. When you visit in person, you may be asked to complete a
            separate liability waiver before participating in any class.
          </p>

          <h2>Cancellations &amp; scheduling</h2>
          <p>
            Class times, coaches, and availability shown on this site are current at time of writing but can
            change. We&rsquo;ll confirm specifics when we reach out after you submit a booking request.
          </p>

          <h2>Intellectual property</h2>
          <p>
            The text, photos, and design on this site belong to Dumbbells (or are used with permission) and
            shouldn&rsquo;t be copied or reused without asking us first.
          </p>

          <h2>Other websites</h2>
          <p>
            This site links to Daydreams, a separate business under the same roof. We&rsquo;re not responsible
            for content on that site beyond our own listing of it.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            We do our best to keep this site accurate and available, but it&rsquo;s provided as-is, without
            warranties, and we aren&rsquo;t liable for issues arising from your use of it beyond what&rsquo;s
            required by law.
          </p>

          <h2>Governing law</h2>
          <p>These terms are governed by the laws of Kenya.</p>

          <h2>Changes to these terms</h2>
          <p>If we update these terms, we&rsquo;ll change the date above.</p>

          <h2>Contact us</h2>
          <p>
            41 Gurviellia Grove, Nairobi
            <br />
            <a href="tel:+254180117040">0180 117040</a>
            <br />
            <a href="mailto:daydreamsanddumbbells@gmail.com">daydreamsanddumbbells@gmail.com</a>
          </p>
        </div>
      </div>
    </>
  );
}
