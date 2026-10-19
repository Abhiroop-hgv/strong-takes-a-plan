"use client";

type Plausible = (event: string, opts?: { props?: Record<string, string> }) => void;

/** Events: apply_click, form_start, step2_reached, booking_confirmed. No personal data is ever sent. */
export function track(event: string, props?: Record<string, string>) {
  try {
    const p = (window as unknown as { plausible?: Plausible }).plausible;
    p?.(event, props ? { props } : undefined);
  } catch {
    /* analytics must never break the page */
  }
}
