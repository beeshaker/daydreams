"use client";

import { useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import type { LeadType } from "@/lib/daydreams/types";
import { submitLead } from "@/lib/leads/submit";
import { trackEvent } from "@/lib/analytics";
import { Turnstile } from "@/components/shared/Turnstile";

/**
 * The general "get in touch" form on the combined pages (home, café). Posts
 * to the same /api/leads route as the brand forms. Daycare and gym topics
 * become those lead types; everything else is a general enquiry, with the
 * topic prefixed to the message so it's visible in the admin leads list.
 *
 * Buttons elsewhere link here with ?topic=<value>#contact (e.g. "Ask about a
 * date" -> ?topic=events) to preselect the topic.
 */

export const CONTACT_TOPICS = [
  { value: "daycare", label: "Daydreams daycare", leadType: "daycare-interest" },
  { value: "gym", label: "Dumbbells gym & classes", leadType: "gym-interest" },
  { value: "events", label: "Parties & events", leadType: "general-enquiry" },
  { value: "treatment", label: "Recovery room treatments", leadType: "general-enquiry" },
  { value: "general", label: "Something else", leadType: "general-enquiry" },
] as const satisfies readonly { value: string; label: string; leadType: LeadType }[];

export type ContactTopic = (typeof CONTACT_TOPICS)[number]["value"];

function isTopic(value: string | null): value is ContactTopic {
  return CONTACT_TOPICS.some((topic) => topic.value === value);
}

type Status = "idle" | "submitting" | "success" | "error";

const inputClass = "rounded-md border border-brand-ink/20 bg-white px-3 py-2 text-base";

export function ContactForm({ turnstileSiteKey, defaultTopic = "general" }: { turnstileSiteKey: string; defaultTopic?: ContactTopic }) {
  const searchParams = useSearchParams();
  const topicParam = searchParams.get("topic");
  const [topic, setTopic] = useState<ContactTopic>(isTopic(topicParam) ? topicParam : defaultTopic);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const turnstileTokenRef = useRef<string>("");

  // A same-page link (e.g. "Ask about a date" on the home page) changes the
  // query without remounting the form, so follow it here (adjusting state
  // during render, React's recommended alternative to a syncing effect).
  const [lastTopicParam, setLastTopicParam] = useState(topicParam);
  if (topicParam !== lastTopicParam) {
    setLastTopicParam(topicParam);
    if (isTopic(topicParam)) setTopic(topicParam);
  }

  const selected = CONTACT_TOPICS.find((t) => t.value === topic) ?? CONTACT_TOPICS[CONTACT_TOPICS.length - 1];
  const asksChildAge = topic === "daycare" || topic === "events";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const form = event.currentTarget;
    const data = new FormData(form);
    const message = String(data.get("message") ?? "").trim();

    const result = await submitLead({
      leadType: selected.leadType,
      source: "traditional-site",
      parentName: String(data.get("parentName") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? "") || undefined,
      childAge: String(data.get("childAge") ?? "") || undefined,
      preferredContact: String(data.get("preferredContact") ?? "") || undefined,
      message: `[${selected.label}]${message ? ` ${message}` : ""}`,
      consent: data.get("consent") === "on",
      companyWebsite: String(data.get("companyWebsite") ?? ""),
      turnstileToken: turnstileTokenRef.current || undefined,
    });

    if (result.success) {
      setStatus("success");
      trackEvent("lead_submitted", { leadType: selected.leadType, topic, source: "contact-form" });
      form.reset();
    } else {
      setStatus("error");
      setErrorMessage(result.error);
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-2xl bg-brand-lavender/20 p-6 text-brand-ink">
        <p className="font-semibold">Thanks — your message is on its way!</p>
        <p className="mt-1 text-sm">A member of our team will get back to you soon.</p>
        <button type="button" onClick={() => setStatus("idle")} className="mt-4 text-sm font-semibold underline underline-offset-4">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-4" noValidate>
      {/* Honeypot — hidden from real visitors, visible to bots that fill every field. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="contact-companyWebsite">Company website</label>
        <input type="text" id="contact-companyWebsite" name="companyWebsite" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-brand-ink">
        What can we help with?
        <select name="topic" value={topic} onChange={(e) => setTopic(e.target.value as ContactTopic)} className={inputClass}>
          {CONTACT_TOPICS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-brand-ink">
          Your name
          <input type="text" name="parentName" required autoComplete="name" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-brand-ink">
          Email
          <input type="email" name="email" required autoComplete="email" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-brand-ink">
          Phone (optional)
          <input type="tel" name="phone" autoComplete="tel" className={inputClass} />
        </label>
        {asksChildAge ? (
          <label className="flex flex-col gap-1 text-sm font-medium text-brand-ink">
            Child&apos;s age (optional)
            <input type="text" name="childAge" placeholder="e.g. 2 years" className={inputClass} />
          </label>
        ) : (
          <label className="flex flex-col gap-1 text-sm font-medium text-brand-ink">
            Preferred contact (optional)
            <select name="preferredContact" defaultValue="" className={inputClass}>
              <option value="">No preference</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="text">Text</option>
            </select>
          </label>
        )}
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-brand-ink">
        Message
        <textarea
          name="message"
          rows={4}
          placeholder={topic === "events" ? "The occasion, a date you have in mind, and roughly how many guests" : undefined}
          className={inputClass}
        />
      </label>

      <label className="flex items-start gap-2 text-sm text-brand-ink">
        <input type="checkbox" name="consent" required className="mt-1" />
        <span>I agree to Daydreams &amp; Dumbbells contacting me about my enquiry.</span>
      </label>

      <Turnstile
        siteKey={turnstileSiteKey}
        onVerify={(token) => {
          turnstileTokenRef.current = token;
        }}
      />

      {status === "error" && errorMessage && (
        <p role="alert" className="text-sm text-red-600">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-full bg-brand-pink-strong px-6 py-3 font-bold text-white transition hover:brightness-95 disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
