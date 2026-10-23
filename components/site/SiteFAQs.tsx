import type { ReactNode } from "react";
import type { SiteSettings } from "@/lib/daydreams/types";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd } from "@/lib/seo";

/**
 * Each question carries a plain-text `answerText` alongside the rendered
 * `answer`, so the FAQPage structured data always matches what's on screen.
 */
export type FaqItem = { question: string; answer: ReactNode; answerText: string };

function formatHours(block: SiteSettings["hours"][number]) {
  return `${block.day}: ${block.open === "Closed" ? "Closed" : `${block.open} – ${block.close}`}`;
}

/** The hours / location / contact questions every site shares, built from SiteSettings. */
export function contactFaqs(settings: SiteSettings): FaqItem[] {
  return [
    {
      question: `What are ${settings.businessName}' opening hours?`,
      answerText: settings.hours.map(formatHours).join(". ") + ".",
      answer: (
        <ul className="space-y-1">
          {settings.hours.map((block) => (
            <li key={block.day}>{formatHours(block)}</li>
          ))}
        </ul>
      ),
    },
    {
      question: `Where is ${settings.businessName}?`,
      answerText: `You'll find us at ${settings.address}, Kenya.`,
      answer: <p>You&apos;ll find us at {settings.address}.</p>,
    },
    {
      question: "How can I reach you directly?",
      answerText: `Call ${settings.phones.join(" or ")}, or email ${settings.email}.`,
      answer: (
        <p>
          Call{" "}
          {settings.phones.map((phone, i) => (
            <span key={phone}>
              {i > 0 && " or "}
              <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="font-semibold underline">{phone}</a>
            </span>
          ))}
          , or email <a href={`mailto:${settings.email}`} className="break-words font-semibold underline">{settings.email}</a>.
        </p>
      ),
    },
  ];
}

export function SiteFAQs({ questions, id = "questions" }: { questions: FaqItem[]; id?: string }) {
  return (
    <section id={id} className="mx-auto w-full max-w-3xl scroll-mt-40 px-6 py-20" aria-labelledby={`${id}-heading`}>
      <JsonLd data={faqJsonLd(questions)} />
      <h2 id={`${id}-heading`} className="font-baloo text-4xl text-brand-ink zone-dark:font-bebas zone-dark:uppercase zone-dark:tracking-wide zone-dark:text-white">
        Questions, answered.
      </h2>
      <div className="mt-6 space-y-2">
        {questions.map(({ question, answer }) => (
          <details key={question} className="group rounded-2xl bg-white p-5 zone-dark:bg-white/5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-lg font-semibold text-brand-ink marker:content-none zone-dark:text-white">
              {question}
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 shrink-0 transition-transform group-open:rotate-45" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M10 4v12M4 10h12" strokeLinecap="round" />
              </svg>
            </summary>
            <div className="mt-3 text-brand-ink/85 zone-dark:text-white/80">{answer}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
