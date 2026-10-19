import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { isSlotOpen } from "@/lib/availability";
import { encryptJson } from "@/lib/crypto";
import { sendCoachNotification, sendConfirmation } from "@/lib/notify";
import { bookingSchema } from "@/lib/schema";
import { clientIp, json, rateLimit, sameOriginJson, verifyTurnstile } from "@/lib/security";
import { getStore, type Booking } from "@/lib/store";
import { isValidTimezone } from "@/lib/time";

export const dynamic = "force-dynamic";

/** POST /api/bookings  -> 200 { ok, slotStart } | 400 | 403 | 409 { error: "slot_taken" } | 429 */
export async function POST(req: NextRequest) {
  if (!sameOriginJson(req)) return json({ error: "forbidden" }, 403);
  const ip = clientIp(req);
  if (!rateLimit(`book:${ip}`, 5, 10 * 60_000)) return json({ error: "rate_limited" }, 429);

  const raw = await req.text();
  if (raw.length > 8_000) return json({ error: "too_large" }, 413);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  // Honeypot: pretend success so bots learn nothing.
  if (typeof body === "object" && body && "website" in body && (body as { website?: unknown }).website) {
    return json({ ok: true, slotStart: 0 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) return json({ error: "invalid", fields: parsed.error.issues.map((i) => String(i.path[0])) }, 400);
  const d = parsed.data;
  if (!isValidTimezone(d.tz)) return json({ error: "invalid", fields: ["tz"] }, 400);
  if (!(await verifyTurnstile(d.turnstileToken, ip))) return json({ error: "captcha" }, 403);

  const store = getStore();
  // Idempotent replay (double click, retry): answer with the original booking, send nothing again.
  const prior = await store.getByIdempotencyKey(d.idempotencyKey);
  if (prior) return json({ ok: true, slotStart: prior.slotStart });

  // Re-check the slot on the server, never trust the browser.
  if (!(await isSlotOpen(d.slotStart))) return json({ error: "slot_taken" }, 409);

  const booking: Booking = {
    id: randomUUID(),
    idempotencyKey: d.idempotencyKey,
    slotStart: d.slotStart,
    name: d.name,
    email: d.email,
    whatsapp: d.whatsapp ? d.whatsapp : null,
    goal: d.goal,
    gender: d.gender,
    health: encryptJson({ conditions: d.conditions, notes: d.notes ?? "" }),
    visitorTz: d.tz,
    consentAt: Date.now(),
    status: "confirmed",
    reminderSent: false,
    createdAt: Date.now(),
  };

  const res = await store.insert(booking);
  if (!res.ok) return json({ error: "slot_taken" }, 409);
  if (res.existing) return json({ ok: true, slotStart: res.booking.slotStart }); // idempotent replay: no second email

  try {
    await sendConfirmation(booking);
    await sendCoachNotification(booking);
  } catch (e) {
    // The booking is saved. Log only the error message, never the payload.
    console.error("[booking] notification failed:", e instanceof Error ? e.message : "unknown");
  }
  return json({ ok: true, slotStart: booking.slotStart });
}
