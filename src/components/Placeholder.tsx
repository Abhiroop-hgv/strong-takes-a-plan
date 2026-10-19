import type { ReactNode } from "react";

/** Labeled drop-in box with the exact aspect ratio, for media you have not supplied yet. */
export function Placeholder({
  ratio,
  children,
  className = "",
  rounded = "rounded-card",
}: {
  ratio: string;
  children: ReactNode;
  className?: string;
  rounded?: string;
}) {
  return (
    <div
      role="img"
      aria-label={typeof children === "string" ? children : "Image placeholder"}
      className={`placeholder-box flex items-center justify-center p-6 text-center font-mono text-sm ${rounded} ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {children}
    </div>
  );
}
