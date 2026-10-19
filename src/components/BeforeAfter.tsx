"use client";

import Image from "next/image";
import { useId, useState } from "react";
import type { Client } from "@/content";
import { ArrowsIcon } from "./Icons";

/**
 * Before/after slider. A transparent native range input covers the whole frame, so mouse,
 * touch and arrow keys all work with correct semantics.
 */
export function BeforeAfter({
  client,
  className = "",
  heightClass = "h-[420px]",
}: {
  client: Pick<Client, "firstName" | "beforeSrc" | "afterSrc" | "beforeAlt" | "afterAlt">;
  className?: string;
  heightClass?: string;
}) {
  const [pos, setPos] = useState(50);
  const id = useId();
  return (
    <div className={`relative isolate overflow-hidden focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-accent ${heightClass} ${className}`}>
      {/* AFTER (base layer) */}
      <div className="absolute inset-0 flex items-end justify-end bg-[#d9dcd6] p-4 font-mono text-xs tracking-[0.1em] text-muted">
        {client.afterSrc ? (
          <Image src={client.afterSrc} alt={client.afterAlt} fill sizes="(min-width: 1024px) 50vw, 340px" className="object-cover" />
        ) : (
          <span>AFTER</span>
        )}
      </div>
      {/* BEFORE (clipped) */}
      <div
        className="absolute inset-0 flex items-end bg-placeholder p-4 font-mono text-xs tracking-[0.1em] text-muted"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        {client.beforeSrc ? (
          <Image src={client.beforeSrc} alt={client.beforeAlt} fill sizes="(min-width: 1024px) 50vw, 340px" className="object-cover" />
        ) : (
          <span>BEFORE</span>
        )}
      </div>
      {/* Divider + handle */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-accent" style={{ left: `${pos}%` }} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-white"
        style={{ left: `${pos}%` }}
      >
        <ArrowsIcon size={20} />
      </div>
      <label htmlFor={id} className="sr-only">
        Before and after comparison for {client.firstName}. Use left and right arrow keys to reveal more of the before or after photo.
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-valuetext={`${pos}% before, ${100 - pos}% after`}
        className="sr-only-input"
      />
    </div>
  );
}
