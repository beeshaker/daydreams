import type { Testimonial } from "@/lib/daydreams/types";

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {testimonials.map((testimonial) => (
        <blockquote
          key={testimonial.id}
          className="flex flex-col justify-between rounded-xl border border-brand-ink/10 bg-white p-5 zone-dark:border-white/10 zone-dark:bg-white/5"
        >
          <p className="text-sm italic text-brand-ink/90 zone-dark:text-white/80">&ldquo;{testimonial.quote}&rdquo;</p>
          <footer className="mt-3 text-xs font-semibold text-brand-ink/60 zone-dark:text-white/50">
            {testimonial.author} — {testimonial.relation}
          </footer>
        </blockquote>
      ))}
    </div>
  );
}
