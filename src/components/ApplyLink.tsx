"use client";

import type { ReactNode } from "react";
import { track } from "@/lib/analytics";

/** Link to #apply that records an apply_click event. */
export function ApplyLink({
  children,
  className,
  where,
  onNavigate,
}: {
  children: ReactNode;
  className?: string;
  where: string;
  onNavigate?: () => void;
}) {
  return (
    <a
      href="#apply"
      className={className}
      onClick={() => {
        track("apply_click", { where });
        onNavigate?.();
      }}
    >
      {children}
    </a>
  );
}
