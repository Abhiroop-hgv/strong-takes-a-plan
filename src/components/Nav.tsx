"use client";

import { useEffect, useState } from "react";
import { content } from "@/content";
import { ApplyLink } from "./ApplyLink";

export function Nav() {
  const [open, setOpen] = useState(false);
  const { coachName } = content.site;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ground">
      <nav aria-label="Main" className="wrap flex items-center justify-between gap-4 py-4 lg:py-5">
        <a href="#top" className="wide text-xl font-extrabold tracking-[0.02em]">
          {coachName}
        </a>
        <ul className="hidden items-center gap-8 text-base font-medium text-muted lg:flex">
          {content.nav.links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="hover:text-ink">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <ApplyLink where="nav" className="btn btn-primary btn-sm hidden lg:inline-flex">
            {content.nav.cta}
          </ApplyLink>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-outline lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M4 4l12 12M16 4L4 16" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-[73px] z-50 flex flex-col justify-between bg-ground px-5 pb-8 pt-8 lg:hidden"
        >
          <ul className="flex flex-col gap-2">
            {content.nav.links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="wide block border-b border-line py-4 text-3xl font-bold"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <ApplyLink where="menu" onNavigate={() => setOpen(false)} className="btn btn-primary w-full">
            {content.nav.cta}
          </ApplyLink>
        </div>
      )}
    </header>
  );
}
