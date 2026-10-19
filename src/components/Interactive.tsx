"use client";

import { useEffect, useState } from "react";
import { content } from "@/content";
import { ApplyLink } from "./ApplyLink";
import { Reveal } from "./Motion";

/* ---------- 9. Is this for you? ---------- */
export function Fit() {
  const f = content.fit;
  const [goal, setGoal] = useState(f.goals[0].id);
  const current = f.goals.find((g) => g.id === goal) ?? f.goals[0];
  return (
    <section className="border-y border-line bg-surface">
      <div className="wrap section flex flex-col gap-10 lg:gap-12">
        <Reveal>
          <h2 className="h-section max-w-[860px] lg:!text-5xl">{f.headline}</h2>
        </Reveal>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card flex flex-col gap-4 bg-ground p-8 lg:p-10">
            <h3 className="label text-accent-text">{f.worksLabel}</h3>
            {f.works.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
          <div className="card flex flex-col gap-4 bg-ground p-8 lg:p-10">
            <h3 className="label text-muted">{f.notLabel}</h3>
            {f.not.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div role="group" aria-label={f.goalLead} className="flex flex-wrap items-center gap-3">
            <span className="mr-2 text-[15px] text-muted">{f.goalLead}</span>
            {f.goals.map((g) => (
              <button key={g.id} type="button" className="chip" aria-pressed={goal === g.id} onClick={() => setGoal(g.id)}>
                {g.label}
              </button>
            ))}
          </div>
          {/* key re-mounts the node so the 0.25s fade replays on every change */}
          <p key={current.id} aria-live="polite" className="max-w-[640px] animate-[fadein_0.25s_ease-out]">
            {current.line}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- 10. Testimonials ---------- */
export function Testimonials() {
  const t = content.testimonials;
  const featured = t.items.slice(0, t.featuredCount);
  const more = t.items.slice(t.featuredCount);
  const [i, setI] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const q = featured[i];
  return (
    <section className="bg-ground">
      <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-8 px-5 py-[72px] text-center lg:px-16 lg:py-[120px]">
        <figure key={i} className="flex animate-[fadein_0.3s_ease-out] flex-col items-center gap-8" aria-live="polite">
          <blockquote className="wide text-2xl font-semibold leading-[1.2] lg:text-[40px]" style={{ fontStretch: "110%" }}>
            “{q.quote}”
          </blockquote>
          <figcaption className="font-mono text-sm tracking-[0.08em] text-muted">
            {q.name} · {q.age} · {q.job}
          </figcaption>
        </figure>

        <div role="group" aria-label="Choose a testimonial" className="flex gap-1">
          {featured.map((_, n) => (
            <button
              key={n}
              type="button"
              aria-label={`Testimonial ${n + 1} of ${featured.length}`}
              aria-current={n === i}
              onClick={() => setI(n)}
              className="flex h-11 w-8 items-center justify-center"
            >
              <span className={`block h-2.5 w-2.5 rounded-full transition-colors duration-150 ${n === i ? "bg-accent" : "bg-outline"}`} />
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          aria-expanded={showMore}
          aria-controls="more-testimonials"
          onClick={() => setShowMore((v) => !v)}
        >
          {showMore ? t.lessLabel : t.moreLabel}
        </button>

        <div id="more-testimonials" hidden={!showMore} className="w-full">
          <ul className="grid gap-5 text-left sm:grid-cols-2 lg:grid-cols-3">
            {more.map((x, n) => (
              <li key={n} className="card flex flex-col gap-4 p-6">
                <p className="text-lg font-semibold leading-snug">“{x.quote}”</p>
                <p className="mt-auto font-mono text-[13px] tracking-[0.08em] text-muted">
                  {x.name} · {x.age} · {x.job}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- 13. FAQ ---------- */
export function Faq() {
  const f = content.faq;
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-ground">
      <div className="mx-auto flex max-w-[900px] flex-col gap-10 px-5 py-[72px] lg:px-16 lg:py-[120px]">
        <Reveal>
          <h2 className="h-section">{f.headline}</h2>
        </Reveal>
        <div className="border-b border-line">
          {f.items.map((it, n) => {
            const isOpen = open === n;
            return (
              <div key={n} className="border-t border-line">
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${n}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${n}`}
                    onClick={() => setOpen(isOpen ? null : n)}
                    className="flex min-h-14 w-full items-center justify-between gap-6 py-6 text-left text-lg font-semibold lg:text-xl"
                  >
                    <span>{it.q}</span>
                    <span aria-hidden="true" className="font-mono text-muted">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-a-${n}`}
                  role="region"
                  aria-labelledby={`faq-q-${n}`}
                  className="grid transition-[grid-template-rows] duration-200 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="pb-6 text-muted" inert={!isOpen}>
                      {it.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div>
          <a href={f.whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
            {f.whatsappLabel}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- 16. Mobile sticky bar ---------- */
export function StickyBar() {
  const [heroGone, setHeroGone] = useState(false);
  const [applyVisible, setApplyVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero");
    const apply = document.getElementById("apply");
    if (!hero || !apply) return;
    const a = new IntersectionObserver(([e]) => setHeroGone(!e.isIntersecting));
    const b = new IntersectionObserver(([e]) => setApplyVisible(e.isIntersecting));
    a.observe(hero);
    b.observe(apply);
    return () => {
      a.disconnect();
      b.disconnect();
    };
  }, []);

  const show = heroGone && !applyVisible;
  return (
    <div
      inert={!show}
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ground/95 p-3 backdrop-blur transition-[opacity,transform] duration-200 lg:hidden ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      }`}
    >
      <ApplyLink where="sticky" className="btn btn-primary w-full">
        {content.sticky.label}
      </ApplyLink>
    </div>
  );
}
