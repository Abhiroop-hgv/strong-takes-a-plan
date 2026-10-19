"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { content, type Client } from "@/content";
import { ApplyLink } from "./ApplyLink";
import { BeforeAfter } from "./BeforeAfter";
import { CloseIcon } from "./Icons";
import { Reveal } from "./Motion";

export function Results() {
  const r = content.results;
  const [openId, setOpenId] = useState<string | null>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const open = r.clients.find((c) => c.id === openId) ?? null;

  const close = useCallback(() => {
    const id = openId;
    setOpenId(null);
    if (id) requestAnimationFrame(() => triggerRefs.current[id]?.focus());
  }, [openId]);

  return (
    <section id="results" className="bg-ground">
      <div className="wrap flex flex-col gap-5 pb-10 pt-[72px] lg:pb-14 lg:pt-[120px]">
        <Reveal className="flex flex-col gap-5">
          <div className="label text-accent-text">{r.label}</div>
          <h2 className="h-section max-w-[820px]">{r.headline}</h2>
        </Reveal>
      </div>

      <Strip
        clients={r.clients}
        openId={openId}
        onOpen={setOpenId}
        setRef={(id, el) => (triggerRefs.current[id] = el)}
      />

      <div className="wrap flex flex-wrap items-center justify-between gap-6 pb-[72px] pt-8 lg:pb-[120px] lg:pt-10">
        <p className="max-w-[560px] text-base text-muted">{r.disclaimer}</p>
        <ApplyLink where="results" className="btn btn-primary">
          {r.cta}
        </ApplyLink>
      </div>

      <AnimatePresence>{open && <CaseStudy key={open.id} client={open} onClose={close} />}</AnimatePresence>
    </section>
  );
}

/**
 * Desktop (no reduced motion): the section pins and vertical scroll drives the cards sideways (GSAP ScrollTrigger,
 * loaded on demand). Everywhere else: a native swipe row with scroll-snap, a peeking next card and arrow buttons.
 */
function Strip({
  clients,
  openId,
  onOpen,
  setRef,
}: {
  clients: Client[];
  openId: string | null;
  onOpen: (id: string) => void;
  setRef: (id: string, el: HTMLButtonElement | null) => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const stRef = useRef<{ start: number; end: number } | null>(null);
  const [pinned, setPinned] = useState(false);
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    let revert: (() => void) | undefined;
    let cancelled = false;

    const teardown = () => {
      revert?.();
      revert = undefined;
      stRef.current = null;
      setPinned(false);
    };

    const setup = async () => {
      if (!mq.matches || cancelled) return;
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled || !mq.matches) return;
      gsap.registerPlugin(ScrollTrigger);
      setPinned(true);
      await new Promise((r) => setTimeout(r, 60)); // let React apply the pinned classes first
      const stage = stageRef.current;
      const viewport = viewportRef.current;
      const list = listRef.current;
      if (cancelled || !stage || !viewport || !list) return;
      const dist = () => Math.max(0, list.scrollWidth - viewport.clientWidth);
      if (dist() <= 0) {
        setPinned(false); // everything fits: nothing to scroll
        return;
      }
      const ctx = gsap.context(() => {
        gsap.to(list, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: stage,
            start: "top top+=96",
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 0.4,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: (self) => (stRef.current = { start: self.start, end: self.end }),
            onUpdate: (self) => {
              if (barRef.current) barRef.current.style.transform = `scaleX(${self.progress})`;
            },
          },
        });
      }, stage);
      revert = () => ctx.revert();
    };

    void setup();
    const onChange = () => {
      teardown();
      void setup();
    };
    mq.addEventListener("change", onChange);
    return () => {
      cancelled = true;
      mq.removeEventListener("change", onChange);
      teardown();
    };
  }, []);

  // Native mode: track scroll edges for the arrow buttons.
  useEffect(() => {
    const v = viewportRef.current;
    if (!v || pinned) return;
    const update = () => setEdge({ start: v.scrollLeft <= 4, end: v.scrollLeft + v.clientWidth >= v.scrollWidth - 4 });
    update();
    v.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      v.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pinned]);

  const nudge = (dir: 1 | -1) => {
    const v = viewportRef.current;
    if (!v) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    v.scrollBy({ left: dir * Math.max(300, v.clientWidth * 0.8), behavior: smooth ? "smooth" : "auto" });
  };

  // Keyboard: tabbing to an off-screen card in pinned mode scrolls the page to reveal it.
  const onFocusCapture = (e: React.FocusEvent) => {
    const st = stRef.current;
    const list = listRef.current;
    const viewport = viewportRef.current;
    if (!pinned || !st || !list || !viewport) return;
    const li = (e.target as HTMLElement).closest("li");
    if (!li) return;
    const dist = list.scrollWidth - viewport.clientWidth;
    const p = Math.min(1, Math.max(0, (li.offsetLeft - 64) / dist));
    window.scrollTo({ top: st.start + p * (st.end - st.start) });
  };

  return (
    <div ref={stageRef} className="mx-auto max-w-[1440px]">
      <div
        ref={viewportRef}
        className={`hide-scrollbar scroll-pl-5 lg:scroll-pl-16 ${pinned ? "overflow-hidden" : "snap-x snap-mandatory overflow-x-auto"}`}
        onFocusCapture={onFocusCapture}
      >
        <ul
          ref={listRef}
          aria-label="Client results. Scroll sideways for more."
          className="flex w-max min-w-full gap-5 px-5 pb-6 will-change-transform lg:gap-6 lg:px-16"
        >
          {clients.map((c) => (
            <li key={c.id} className="w-[78vw] shrink-0 snap-start sm:w-[340px] lg:w-[420px]">
              <ClientCard client={c} hidden={openId === c.id} onOpen={() => onOpen(c.id)} setRef={(el) => setRef(c.id, el)} />
            </li>
          ))}
          <li aria-hidden="true" className="w-1 shrink-0 lg:w-8" />
        </ul>
      </div>

      {pinned ? (
        <div className="px-5 pt-2 lg:px-16" aria-hidden="true">
          <div className="h-1 overflow-hidden rounded-full bg-line">
            <div ref={barRef} className="h-full origin-left scale-x-0 bg-accent" />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4 px-5 pt-2 lg:px-16">
          <span className="font-mono text-xs tracking-[0.12em] text-muted">SWIPE OR USE THE ARROWS</span>
          <div className="flex gap-2">
            <button type="button" aria-label="Previous results" disabled={edge.start} onClick={() => nudge(-1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-outline transition-colors hover:bg-tint disabled:cursor-not-allowed disabled:opacity-40">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            <button type="button" aria-label="Next results" disabled={edge.end} onClick={() => nudge(1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-outline transition-colors hover:bg-tint disabled:cursor-not-allowed disabled:opacity-40">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ClientCard({
  client: c,
  hidden,
  onOpen,
  setRef,
}: {
  client: Client;
  hidden: boolean;
  onOpen: () => void;
  setRef: (el: HTMLButtonElement | null) => void;
}) {
  return (
    <m.article
      layoutId={`card-${c.id}`}
      className="card lift overflow-hidden"
      style={{ opacity: hidden ? 0 : 1, borderRadius: 24 }}
    >
      <BeforeAfter client={c} heightClass="h-[360px] lg:h-[420px]" />
      <button
        type="button"
        ref={setRef}
        onClick={onOpen}
        aria-haspopup="dialog"
        className="flex w-full flex-col gap-3 p-6 text-left"
      >
        <span className="text-xl font-bold">
          {c.firstName}, {c.age}
        </span>
        <span className="text-[15px] text-muted">{c.job}</span>
        <span className="font-mono text-[22px] font-medium text-accent-text">{c.keyResult}</span>
        <span className="text-base">“{c.quote}”</span>
        <span className="mt-1 text-sm font-semibold text-accent-text">Read the case study →</span>
      </button>
    </m.article>
  );
}

function CaseStudy({ client: c, onClose }: { client: Client; onClose: () => void }) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = `cs-title-${c.id}`;

  useEffect(() => {
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const f = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60]" role="presentation">
      <m.div
        className="absolute inset-0 bg-ink/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduce ? 0 : 0.3 }}
        onClick={onClose}
      />
      <m.div
        ref={panelRef}
        layoutId={`card-${c.id}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-0 overflow-y-auto bg-surface"
        style={{ borderRadius: 0 }}
        transition={{ duration: reduce ? 0 : 0.4, ease: [0.32, 0.72, 0, 1] }}
      >
        <m.div
          className="grid min-h-full lg:grid-cols-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: reduce ? 0 : 0.25, duration: 0.2 } }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
        >
          <BeforeAfter client={c} heightClass="h-[60vh] lg:h-full lg:min-h-screen" />
          <div className="flex flex-col gap-6 p-6 pb-12 lg:p-16">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id={titleId} className="wide text-3xl font-bold leading-tight lg:text-[44px]">
                  {c.firstName}, {c.age}
                </h3>
                <p className="text-muted">
                  {c.job} · <span className="font-mono text-sm">{c.duration}</span>
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close case study"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-outline hover:bg-tint"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <dl className="grid grid-cols-2 gap-4">
              {c.keyNumbers.map((n, i) => (
                <div key={i} className="rounded-card-sm border border-line bg-ground p-5">
                  <dt className="label text-xs text-muted">{i === 0 ? "Key number" : "Key number"} {i + 1}</dt>
                  <dd className="mt-1 font-mono text-[28px] font-medium text-accent-text">{n}</dd>
                </div>
              ))}
            </dl>

            <Block title="Starting point" text={c.startingPoint} />
            <Block title="What changed in the plan" text={c.whatChanged} />
            <Block title="Result" text={c.result} />
            <blockquote className="wide border-l-4 border-accent pl-5 text-xl font-semibold leading-snug">“{c.longQuote}”</blockquote>

            <ApplyLink where="case-study" onNavigate={onClose} className="btn btn-primary mt-2 self-start">
              Apply for 1:1 Coaching
            </ApplyLink>
          </div>
        </m.div>
      </m.div>
    </div>
  );
}

function Block({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h4 className="label text-muted">{title}</h4>
      <p>{text}</p>
    </div>
  );
}
