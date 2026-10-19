"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/** Counts a numeric value up once, on enter. Non-numeric placeholders like "[N]" render as-is. */
export function CountUp({ value }: { value: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const match = value.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  const [shown, setShown] = useState(match ? (reduce ? match[2] : "0") : "");

  useEffect(() => {
    if (!match || reduce) return;
    const target = parseFloat(match[2]);
    const decimals = (match[2].split(".")[1] ?? "").length;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / 1200, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          setShown((target * eased).toFixed(decimals));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduce]);

  if (!match) return <div ref={ref}>{value}</div>;
  return (
    <div ref={ref} aria-label={value}>
      <span aria-hidden="true">
        {match[1]}
        {shown}
        {match[3]}
      </span>
    </div>
  );
}
