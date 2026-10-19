"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { content } from "@/content";
import { track } from "@/lib/analytics";
import { detailsSchema, type Details } from "@/lib/schema";
import { CheckIcon } from "./Icons";

type Step = "details" | "time" | "confirm" | "done";
type Slot = { start: number; available: boolean };
type Errors = Partial<Record<keyof Details | "form", string>>;

const WINDOW_DAYS = 7;
const TURNSTILE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const empty: Details = { name: "", email: "", whatsapp: "", goal: "" as never, gender: "" as never, conditions: [], notes: "", consent: false as never };

function localDateStr(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function BookingCard() {
  const tz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC", []);
  const [step, setStep] = useState<Step>("details");
  const [form, setForm] = useState<Details>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [honeypot, setHoneypot] = useState("");
  const [days, setDays] = useState<Date[]>([]);
  const [dayIdx, setDayIdx] = useState(0);
  const [slotsByDay, setSlotsByDay] = useState<Record<string, Slot[] | "error">>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [chosen, setChosen] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [token, setToken] = useState<string | undefined>();
  const started = useRef(false);
  const idemKey = useRef<string>("");
  const cardRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const turnstileEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const now = new Date();
    setDays(Array.from({ length: WINDOW_DAYS }, (_, i) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)));
  }, []);

  const set = <K extends keyof Details>(k: K, v: Details[K]) => {
    if (!started.current) {
      started.current = true;
      track("form_start");
    }
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  /* ---------------- Step 1 ---------------- */
  const submitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const r = detailsSchema.safeParse(form);
    if (!r.success) {
      const errs: Errors = {};
      for (const i of r.error.issues) {
        const k = i.path[0] as keyof Details;
        errs[k] ??= i.message;
      }
      setErrors(errs);
      setNotice(`Please fix ${Object.keys(errs).length} ${Object.keys(errs).length === 1 ? "field" : "fields"} to continue.`);
      const first = Object.keys(errs)[0];
      requestAnimationFrame(() => cardRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus());
      return;
    }
    setErrors({});
    setNotice("");
    goTo("time");
  };

  const goTo = useCallback((s: Step) => {
    setStep(s);
    if (s === "time") track("step2_reached");
    requestAnimationFrame(() => headingRef.current?.focus());
  }, []);

  /* ---------------- Step 2: availability ---------------- */
  const loadDay = useCallback(
    async (d: Date): Promise<Slot[] | "error"> => {
      const key = localDateStr(d);
      try {
        const res = await fetch(`/api/availability?date=${key}&tz=${encodeURIComponent(tz)}`);
        if (!res.ok) throw new Error(String(res.status));
        const j = (await res.json()) as { slots: Slot[] };
        return j.slots;
      } catch {
        return "error";
      }
    },
    [tz],
  );

  const loadAll = useCallback(async () => {
    if (!days.length) return;
    setLoadingSlots(true);
    const results = await Promise.all(days.map(loadDay));
    const map: Record<string, Slot[] | "error"> = {};
    days.forEach((d, i) => (map[localDateStr(d)] = results[i]));
    setSlotsByDay(map);
    const firstOpen = results.findIndex((r) => r !== "error" && r.some((s) => s.available));
    setDayIdx(firstOpen >= 0 ? firstOpen : 0);
    setLoadingSlots(false);
  }, [days, loadDay]);

  useEffect(() => {
    if (step === "time") void loadAll();
  }, [step, loadAll]);

  const day = days[dayIdx];
  const daySlots = day ? slotsByDay[localDateStr(day)] : undefined;

  const fmtTime = (ms: number) => new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(ms));
  const fmtDay = (ms: number) => new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }).format(new Date(ms));
  const chosenFull = chosen ? `${fmtDay(chosen)} · ${fmtTime(chosen)}` : "";
  const monthLabel = day ? new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(day) : "";

  /* ---------------- Step 3: confirm + submit ---------------- */
  useEffect(() => {
    if (step !== "confirm" || !TURNSTILE_KEY || !turnstileEl.current) return;
    const render = () => {
      const w = window as unknown as { turnstile?: { render: (el: HTMLElement, o: object) => void } };
      if (w.turnstile && turnstileEl.current && !turnstileEl.current.hasChildNodes())
        w.turnstile.render(turnstileEl.current, { sitekey: TURNSTILE_KEY, callback: (t: string) => setToken(t) });
    };
    if (document.getElementById("turnstile-script")) return render();
    const s = document.createElement("script");
    s.id = "turnstile-script";
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = render;
    document.head.appendChild(s);
  }, [step]);

  const book = async () => {
    if (!chosen || sending) return;
    if (TURNSTILE_KEY && !token) {
      setNotice("Please complete the check above, then try again.");
      return;
    }
    setSending(true);
    setNotice("");
    idemKey.current ||= crypto.randomUUID();
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, slotStart: chosen, tz, idempotencyKey: idemKey.current, website: honeypot, turnstileToken: token }),
      });
      if (res.status === 409) {
        setChosen(null);
        idemKey.current = "";
        setNotice("That time was just booked. Please pick another.");
        goTo("time");
        return;
      }
      if (res.status === 429) {
        setNotice("Too many attempts. Please wait a few minutes and try again.");
        return;
      }
      if (res.status === 400) {
        setNotice("Something in your details needs a second look. Please go back and check them.");
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      track("booking_confirmed");
      goTo("done");
    } catch {
      setNotice("We could not complete the booking. Please check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  const restart = () => {
    setForm(empty);
    setErrors({});
    setChosen(null);
    setToken(undefined);
    setNotice("");
    idemKey.current = "";
    started.current = false;
    goTo("details");
  };

  const toggleCondition = (c: string) => {
    const has = form.conditions.includes(c as never);
    let next: string[];
    if (c === "None") next = has ? [] : ["None"];
    else next = (has ? form.conditions.filter((x) => x !== c) : [...form.conditions.filter((x) => x !== "None"), c]) as string[];
    set("conditions", next as never);
  };

  const stepNo = step === "details" ? 1 : step === "done" ? 2 : 2;
  const progressLabel = step === "details" ? "STEP 1 OF 2 / YOUR DETAILS" : step === "done" ? "DONE" : "STEP 2 OF 2 / PICK A TIME";

  return (
    <div ref={cardRef} className="flex flex-col gap-6 rounded-card border border-line bg-ground p-5 sm:p-8">
      {/* progress */}
      <div className="flex flex-col gap-3">
        <div className="font-mono text-xs tracking-[0.12em] text-muted">{progressLabel}</div>
        <div className="flex gap-2" aria-hidden="true">
          <div className="h-1 flex-1 rounded-full bg-accent" />
          <div className={`h-1 flex-1 rounded-full transition-colors duration-300 ${stepNo === 2 ? "bg-accent" : "bg-line"}`} />
        </div>
      </div>

      <div role="status" aria-live="polite" className={notice ? "rounded-input border border-accent-text bg-white p-3 text-sm text-accent-text" : "sr-only"}>
        {notice}
      </div>

      {step === "details" && (
        <form noValidate onSubmit={submitDetails} className="flex flex-col gap-5" aria-label="Your details">
          <h3 ref={headingRef} tabIndex={-1} className="sr-only">
            Your details
          </h3>
          <Field label="Name" name="name" error={errors.name}>
            <input id="f-name" name="name" type="text" autoComplete="name" className="field" value={form.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? "e-name" : undefined} required />
          </Field>
          <Field label="Email" name="email" error={errors.email}>
            <input id="f-email" name="email" type="email" autoComplete="email" inputMode="email" className="field" value={form.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? "e-email" : undefined} required />
          </Field>
          <Field label="WhatsApp number" hint="(optional, for your confirmation)" name="whatsapp" error={errors.whatsapp}>
            <input id="f-whatsapp" name="whatsapp" type="tel" autoComplete="tel" inputMode="tel" className="field" value={form.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value)} aria-invalid={!!errors.whatsapp} aria-describedby={errors.whatsapp ? "e-whatsapp" : undefined} />
          </Field>
          <Field label="What are you looking for?" name="goal" error={errors.goal}>
            <select id="f-goal" name="goal" className="field" value={form.goal} onChange={(e) => set("goal", e.target.value as never)} aria-invalid={!!errors.goal} aria-describedby={errors.goal ? "e-goal" : undefined} required>
              <option value="" disabled>
                Choose one
              </option>
              {content.booking.goals.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </Field>
          <Field label="Gender" name="gender" error={errors.gender}>
            <select id="f-gender" name="gender" className="field" value={form.gender} onChange={(e) => set("gender", e.target.value as never)} aria-invalid={!!errors.gender} aria-describedby={errors.gender ? "e-gender" : undefined} required>
              <option value="" disabled>
                Choose one
              </option>
              {content.booking.genders.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </Field>

          <fieldset className="flex flex-col gap-2.5">
            <legend className="mb-2.5 text-sm font-semibold">
              Any chronic issues? <span className="font-normal text-muted">Select all that apply.</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {content.booking.conditions.map((c) => (
                <button key={c} type="button" className="chip chip-dark" aria-pressed={form.conditions.includes(c as never)} onClick={() => toggleCondition(c)}>
                  {c}
                </button>
              ))}
            </div>
            <p className="text-[13px] text-muted">For example diabetes, thyroid or obesity. Used only to help your coach prepare for the call.</p>
          </fieldset>

          <Field label="Tell me more" hint="(optional)" name="notes" error={errors.notes}>
            <textarea id="f-notes" name="notes" rows={4} maxLength={1000} className="field" value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} aria-describedby="h-notes" />
            <p id="h-notes" className="text-[13px] text-muted">
              What you need and what you expect from coaching. This helps your coach prepare for the call.
            </p>
          </Field>

          {/* Honeypot: invisible to people, tempting to bots */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Website
              <input type="text" name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                name="consent"
                checked={!!form.consent}
                onChange={(e) => set("consent", e.target.checked as never)}
                aria-invalid={!!errors.consent}
                aria-describedby={errors.consent ? "e-consent" : undefined}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--accent)]"
              />
              <span>
                I agree to my details, including the health information above, being used to prepare for my call, as described in the{" "}
                <a href={content.site.privacyUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-text underline">
                  privacy policy
                </a>
                .
              </span>
            </label>
            {errors.consent && (
              <p id="e-consent" className="text-sm text-accent-text">
                {errors.consent}
              </p>
            )}
          </div>

          <button type="submit" className="btn btn-primary">
            Next: choose a time
          </button>
        </form>
      )}

      {step === "time" && (
        <div className="flex flex-col gap-6">
          <div>
            <h3 ref={headingRef} tabIndex={-1} className="wide text-2xl font-bold leading-tight outline-none" style={{ fontStretch: "115%" }}>
              Pick a time for your free call
            </h3>
            <p className="mt-1 text-[15px] text-muted">
              20 minutes. {monthLabel}. Times shown in your timezone ({tz}).
            </p>
          </div>

          <div role="group" aria-label="Choose a day" className="flex flex-wrap gap-2">
            {days.map((d, i) => {
              const sel = i === dayIdx;
              return (
                <button
                  key={i}
                  type="button"
                  aria-pressed={sel}
                  aria-label={new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(d)}
                  onClick={() => {
                    setDayIdx(i);
                    setChosen(null);
                  }}
                  className={`flex min-h-[68px] w-[60px] flex-col items-center justify-center gap-0.5 rounded-2xl border transition-colors duration-150 ${sel ? "border-accent bg-accent text-white" : "border-outline bg-white text-ink"}`}
                >
                  <span className="text-xs font-semibold tracking-[0.04em]">{new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(d)}</span>
                  <span className="font-mono text-xl font-medium">{d.getDate()}</span>
                </button>
              );
            })}
          </div>

          <div aria-busy={loadingSlots} className="min-h-[96px]">
            {loadingSlots && <p className="text-sm text-muted">Loading times…</p>}
            {!loadingSlots && daySlots === "error" && (
              <p className="text-sm text-accent-text">We could not load times. Please check your connection and go back, then try again.</p>
            )}
            {!loadingSlots && Array.isArray(daySlots) && daySlots.length === 0 && <p className="text-sm text-muted">No calls on this day. Please choose another.</p>}
            {!loadingSlots && Array.isArray(daySlots) && daySlots.length > 0 && (
              <div role="group" aria-label="Available times" className="flex flex-wrap gap-2">
                {daySlots.map((s) => {
                  const sel = chosen === s.start;
                  return (
                    <button
                      key={s.start}
                      type="button"
                      disabled={!s.available}
                      aria-pressed={sel}
                      onClick={() => setChosen(s.start)}
                      className={`min-h-12 rounded-input border px-5 font-mono text-sm font-medium transition-colors duration-150 ${
                        !s.available
                          ? "cursor-not-allowed border-line bg-tint text-muted line-through"
                          : sel
                            ? "border-accent bg-accent text-white"
                            : "border-outline bg-white text-ink"
                      }`}
                    >
                      {fmtTime(s.start)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <p className="text-sm text-muted">{chosen ? `Selected: ${chosenFull}` : "Choose a day and an available time."}</p>

          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn btn-secondary" onClick={() => goTo("details")}>
              Back
            </button>
            <button type="button" className="btn btn-primary flex-1" disabled={!chosen} onClick={() => chosen && goTo("confirm")}>
              Book
            </button>
          </div>
        </div>
      )}

      {step === "confirm" && (
        <div className="flex flex-col gap-6 rounded-card-sm border border-line bg-white p-6 sm:p-7">
          <h3 ref={headingRef} tabIndex={-1} className="wide text-2xl font-bold leading-tight outline-none" style={{ fontStretch: "115%" }}>
            Confirm your booking?
          </h3>
          <div className="font-mono text-lg font-medium text-accent-text">{chosenFull}</div>
          <p className="text-[15px] text-muted">
            Free 20-minute call. We will send your confirmation by email{form.whatsapp ? ", and on WhatsApp since you shared your number" : ""}.
          </p>
          {TURNSTILE_KEY && <div ref={turnstileEl} />}
          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn btn-primary flex-1" disabled={sending} onClick={book}>
              {sending ? "Booking…" : "Yes, book it"}
            </button>
            <button type="button" className="btn btn-secondary" disabled={sending} onClick={() => goTo("time")}>
              No, change time
            </button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="flex flex-col items-start gap-5">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white">
            <CheckIcon size={28} />
          </span>
          <h3 ref={headingRef} tabIndex={-1} className="wide text-[28px] font-bold leading-tight outline-none" style={{ fontStretch: "115%" }}>
            You&apos;re booked.
          </h3>
          <div className="font-mono text-lg font-medium text-accent-text">{chosenFull}</div>
          <p className="text-muted">
            We&apos;ve sent a confirmation to your email{form.whatsapp ? ", and on WhatsApp" : ""}. Your coach will read your details before the call.
          </p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={restart}>
            Start over
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, hint, name, error, children }: { label: string; hint?: string; name: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={`f-${name}`} className="text-sm font-semibold">
        {label} {hint && <span className="font-normal text-muted">{hint}</span>}
      </label>
      {children}
      {error && (
        <p id={`e-${name}`} className="text-sm text-accent-text">
          {error}
        </p>
      )}
    </div>
  );
}
