import type { ReactNode } from "react";
import type { SiteSettings } from "@/lib/daydreams/types";

export function SiteFAQs({
  settings,
  gettingStarted,
}: {
  settings: SiteSettings;
  gettingStarted: ReactNode;
}) {
  const questions = [
    {
      question: `What are ${settings.businessName}' opening hours?`,
      answer: (
        <ul className="space-y-1">
          {settings.hours.map((block) => (
            <li key={block.day}>
              {block.day}: {block.open === "Closed" ? "Closed" : `${block.open} – ${block.close}`}
            </li>
          ))}
        </ul>
      ),
    },
    { question: "How do I get started?", answer: gettingStarted },
    {
      question: `Where is ${settings.businessName}?`,
      answer: <p>You&apos;ll find us at {settings.address}.</p>,
    },
    {
      question: "How can I reach you directly?",
      answer: (
        <p>
          Call <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`} className="font-semibold underline">{settings.phone}</a>
          {" "}or email <a href={`mailto:${settings.email}`} className="break-words font-semibold underline">{settings.email}</a>.
        </p>
      ),
    },
  ];

  return (
    <section id="questions" className="mx-auto w-full max-w-3xl scroll-mt-40 px-6 py-20" aria-labelledby="questions-heading">
      <h2 id="questions-heading" className="font-baloo text-4xl text-brand-ink zone-dark:font-bebas zone-dark:uppercase zone-dark:tracking-wide zone-dark:text-white">
        Questions, answered.
      </h2>
      <div className="mt-6 divide-y divide-brand-ink/10 rounded-xl border border-brand-ink/10 bg-white zone-dark:divide-white/10 zone-dark:border-white/10 zone-dark:bg-white/5">
        {questions.map(({ question, answer }) => (
          <details key={question} className="group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-brand-ink marker:content-none zone-dark:text-white">
              {question}
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0 transition-transform group-open:rotate-45" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M10 4v12M4 10h12" strokeLinecap="round" />
              </svg>
            </summary>
            <div className="mt-3 text-sm text-brand-ink/70 zone-dark:text-white/70">{answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
