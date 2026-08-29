"use client";

import { useState, type FormEvent } from "react";
import type { LeadSource } from "@/lib/daydreams/types";
import { submitLead } from "@/lib/leads/submit";
import { trackEvent } from "@/lib/analytics";

type Status = "idle" | "submitting" | "success" | "error";

export function BookAVisitForm({ source }: { source: LeadSource }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const form = event.currentTarget;
    const data = new FormData(form);

    const result = await submitLead({
      leadType: "daycare-interest",
      source,
      parentName: String(data.get("parentName") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? "") || undefined,
      childAge: String(data.get("childAge") ?? "") || undefined,
      preferredContact: String(data.get("preferredContact") ?? "") || undefined,
      message: String(data.get("message") ?? "") || undefined,
      consent: data.get("consent") === "on",
      companyWebsite: String(data.get("companyWebsite") ?? ""),
    });

    if (result.success) {
      setStatus("success");
      trackEvent("lead_submitted", { leadType: "daycare-interest", source });
      form.reset();
    } else {
      setStatus("error");
      setErrorMessage(result.error);
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-lg bg-brand-mauve/15 p-6 text-brand-ink">
        <p className="font-semibold">Thanks — we&apos;ve got your info!</p>
        <p className="mt-1 text-sm">
          A member of our team will reach out soon to help you book a visit.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {/* Honeypot — hidden from real visitors, visible to bots that fill every field. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="companyWebsite">Company website</label>
        <input
          type="text"
          id="companyWebsite"
          name="companyWebsite"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-brand-ink">
          Parent/guardian name
          <input
            type="text"
            name="parentName"
            required
            className="rounded-md border border-brand-ink/20 bg-white px-3 py-2 text-base"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-brand-ink">
          Email
          <input
            type="email"
            name="email"
            required
            className="rounded-md border border-brand-ink/20 bg-white px-3 py-2 text-base"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-brand-ink">
          Phone (optional)
          <input
            type="tel"
            name="phone"
            className="rounded-md border border-brand-ink/20 bg-white px-3 py-2 text-base"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-brand-ink">
          Child&apos;s age (optional)
          <input
            type="text"
            name="childAge"
            placeholder="e.g. 2 years"
            className="rounded-md border border-brand-ink/20 bg-white px-3 py-2 text-base"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-brand-ink">
        Preferred contact method (optional)
        <select
          name="preferredContact"
          defaultValue=""
          className="rounded-md border border-brand-ink/20 bg-white px-3 py-2 text-base"
        >
          <option value="">No preference</option>
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="text">Text</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-brand-ink">
        Message (optional)
        <textarea
          name="message"
          rows={3}
          className="rounded-md border border-brand-ink/20 bg-white px-3 py-2 text-base"
        />
      </label>

      <label className="flex items-start gap-2 text-sm text-brand-ink">
        <input type="checkbox" name="consent" required className="mt-1" />
        <span>
          I consent to Daydreams contacting me about enrollment. This form only registers
          interest — it does not complete enrollment.
        </span>
      </label>

      {status === "error" && errorMessage && (
        <p role="alert" className="text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-md bg-brand-pink-strong px-5 py-2.5 font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Book a Visit"}
      </button>
    </form>
  );
}
