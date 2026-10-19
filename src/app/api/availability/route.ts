import { NextRequest } from "next/server";
import { slotsForVisitorDay } from "@/lib/availability";
import { schedule } from "@/lib/config";
import { clientIp, json, rateLimit } from "@/lib/security";
import { dayRangeUtc, isValidTimezone } from "@/lib/time";

export const dynamic = "force-dynamic";

/** GET /api/availability?date=YYYY-MM-DD&tz=Area/City  ->  { slots: [{ start, available }] } (start = UTC ms) */
export async function GET(req: NextRequest) {
  if (!rateLimit(`avail:${clientIp(req)}`, 60, 60_000)) return json({ error: "rate_limited" }, 429);
  const date = req.nextUrl.searchParams.get("date") ?? "";
  const tz = req.nextUrl.searchParams.get("tz") ?? schedule.timezone;
  if (!isValidTimezone(tz) || !dayRangeUtc(tz, date)) return json({ error: "bad_request" }, 400);
  const slots = await slotsForVisitorDay(date, tz);
  return json({ slots, slotMinutes: schedule.slotMinutes }, 200, { "Cache-Control": "private, max-age=15" });
}
