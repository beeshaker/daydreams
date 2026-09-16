import type { Metadata } from "next";
import Link from "next/link";

/**
 * Lightweight, static legal page — not part of the scrollcraft build (see
 * app/dumbbells/page.tsx), since it has no scroll effects, just a Privacy
 * Policy to read. Styled with the same dark/crimson tokens as the main
 * Dumbbells page for visual consistency, kept local to this file rather
 * than importing the whole scrollcraft stylesheet.
 */

export const metadata: Metadata = {
  title: "Privacy Policy — Dumbbells",
  description: "How Dumbbells collects, uses, and protects the information you share with us.",
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

export default function DumbbellsPrivacyPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="legal">
        <div className="legal__wrap">
          <Link href="/dumbbells" className="legal__back">
            ← Back to Dumbbells
          </Link>
          <h1>Privacy Policy</h1>
          <p className="legal__updated">Last updated: September 2026</p>

          <p>
            This policy explains what information Dumbbells collects when you use this website, why we collect
            it, and how we handle it. It applies to daydreamsanddumbbells.com and the booking form on this page.
          </p>

          <h2>Information we collect</h2>
          <p>When you submit the booking form, we collect:</p>
          <ul>
            <li>Your name and email address (required)</li>
            <li>Your phone number and preferred contact method, if you provide them</li>
            <li>Anything else you choose to tell us in the message field</li>
          </ul>
          <p>
            We do not collect payment information through this website — membership and payment are handled in
            person at the gym. We use Cloudflare Turnstile to help prevent spam submissions; Cloudflare processes
            some technical data (like your IP address) for that purpose under its own privacy policy.
          </p>

          <h2>How we use your information</h2>
          <p>We use the information you submit to:</p>
          <ul>
            <li>Respond to your booking request and get in touch to schedule a session</li>
            <li>Answer questions you've sent us</li>
            <li>Send you occasional updates about classes or schedule changes, only if you've agreed to be contacted</li>
          </ul>
          <p>We don&rsquo;t sell your information, and we don&rsquo;t share it with third parties for their own marketing.</p>

          <h2>How long we keep it</h2>
          <p>
            We keep booking submissions for as long as reasonably needed to follow up with you and maintain our
            own records, and delete or anonymize older inquiries periodically.
          </p>

          <h2>Your rights</h2>
          <p>
            You can ask us what information we hold about you, ask us to correct it, or ask us to delete it, at
            any time — just email us at{" "}
            <a href="mailto:daydreamsanddumbbells@gmail.com">daydreamsanddumbbells@gmail.com</a>.
          </p>

          <h2>Children&rsquo;s privacy</h2>
          <p>
            This form is intended for adults booking their own gym sessions. We don&rsquo;t knowingly collect
            information from children through it.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            If we make material changes to how we handle your information, we&rsquo;ll update this page and
            change the date above.
          </p>

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
