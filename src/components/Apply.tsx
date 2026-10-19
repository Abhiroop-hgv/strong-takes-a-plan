import { content } from "@/content";
import { BookingCard } from "./BookingCard";
import { Reveal } from "./Motion";

export function Apply() {
  const a = content.apply;
  return (
    <section id="apply" aria-labelledby="apply-title" className="border-t border-line bg-surface">
      <div className="wrap section grid items-start gap-10 lg:grid-cols-2 lg:gap-20">
        <Reveal className="flex flex-col gap-6 lg:sticky lg:top-28">
          <div className="label text-accent-text">{a.label}</div>
          <h2 id="apply-title" className="wide text-[32px] font-extrabold leading-[1.02] tracking-[-0.01em] lg:text-[56px]">
            {a.headline}
          </h2>
          <p className="max-w-[480px] text-muted">{a.paragraph}</p>
        </Reveal>
        <div className="min-w-0">
          <BookingCard />
        </div>
      </div>
    </section>
  );
}
