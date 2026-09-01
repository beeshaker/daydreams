"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { submitClassSignup } from "@/lib/classes/submit";
import { trackEvent } from "@/lib/analytics";

type Status = "idle" | "submitting" | "success" | "error";

export function ClassSignupForm({ occurrenceId }: { occurrenceId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const form = event.currentTarget;
    const data = new FormData(form);

    const result = await submitClassSignup({
      occurrenceId,
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      partySize: Number(data.get("partySize") ?? 1),
      // The checkbox is required, so this is true whenever a real user
      // submits — the server still enforces it independently via zod.
      consent: (data.get("consent") === "on") as true,
      companyWebsite: String(data.get("companyWebsite") ?? ""),
    });

    if (result.success) {
      setStatus("success");
      trackEvent("class_signup_submitted", { occurrenceId });
      form.reset();
      router.refresh();
    } else {
      setStatus("error");
      setErrorMessage(result.error);
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-lg bg-brand-mauve/15 p-6 text-brand-ink zone-dark:bg-white/10 zone-dark:text-white">
        <p className="font-semibold">You&apos;re signed up!</p>
        <p className="mt-1 text-sm">We&apos;ll see you there.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {/* Honeypot — hidden from real visitors, visible to bots that fill every field. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor={`class-signup-companyWebsite-${occurrenceId}`}>Company website</label>
        <input
          type="text"
          id={`class-signup-companyWebsite-${occurrenceId}`}
          name="companyWebsite"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-brand-ink zone-dark:text-white">
          Name
          <input
            type="text"
            name="name"
            required
            className="rounded-md border border-brand-ink/20 bg-white px-3 py-2 text-base zone-dark:border-white/20 zone-dark:bg-white/5 zone-dark:text-white"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-brand-ink zone-dark:text-white">
          Email
          <input
            type="email"
            name="email"
            required
            className="rounded-md border border-brand-ink/20 bg-white px-3 py-2 text-base zone-dark:border-white/20 zone-dark:bg-white/5 zone-dark:text-white"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-brand-ink zone-dark:text-white">
          Phone
          <input
            type="tel"
            name="phone"
            required
            className="rounded-md border border-brand-ink/20 bg-white px-3 py-2 text-base zone-dark:border-white/20 zone-dark:bg-white/5 zone-dark:text-white"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-brand-ink zone-dark:text-white">
          Party size
          <input
            type="number"
            name="partySize"
            min={1}
            defaultValue={1}
            required
            className="rounded-md border border-brand-ink/20 bg-white px-3 py-2 text-base zone-dark:border-white/20 zone-dark:bg-white/5 zone-dark:text-white"
          />
        </label>
      </div>

      <label className="flex items-start gap-2 text-sm text-brand-ink zone-dark:text-white/80">
        <input type="checkbox" name="consent" required className="mt-1" />
        <span>
          I consent to being contacted about this class sign-up, including reminders and
          schedule changes by email or WhatsApp.
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
        {status === "submitting" ? "Signing you up…" : "Confirm Sign Up"}
      </button>
    </form>
  );
}
