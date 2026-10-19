import { schedule } from "./config";
import { coachDay, dayRangeUtc, zonedToUtc } from "./time";
import { getStore } from "./store";

/**
 * Calendar provider interface. The default provider derives free slots from the working hours
 * in config.ts minus bookings already stored. To use Google Calendar free/busy or Cal.com
 * instead, implement `busyIntervals` against that API and keep the rest.
 */
export interface CalendarProvider {
  /** Busy [start, end) UTC ms intervals overlapping the range. */
  busyIntervals(fromMs: number, toMs: number): Promise<[number, number][]>;
}

export const bookingsCalendar: CalendarProvider = {
  async busyIntervals(fromMs, toMs) {
    const rows = await getStore().listBetween(fromMs - 3600_000, toMs + 3600_000);
    return rows.map((b) => [b.slotStart, b.slotStart + schedule.slotMinutes * 60_000] as [number, number]);
  },
};

export function getCalendar(): CalendarProvider {
  return bookingsCalendar;
}

const STEP = (schedule.slotMinutes + schedule.bufferMinutes) * 60_000;

/** Every slot start (UTC ms) the coach could work on a given coach-local day, ignoring bookings. */
function candidateStarts(y: number, mo: number, d: number, weekday: number, dateStr: string): number[] {
  const hrs = schedule.hours[weekday];
  if (!hrs || schedule.daysOff.includes(dateStr)) return [];
  const start = zonedToUtc(schedule.timezone, y, mo, d, hrs[0]);
  const end = zonedToUtc(schedule.timezone, y, mo, d, hrs[1]);
  const out: number[] = [];
  for (let t = start; t + schedule.slotMinutes * 60_000 <= end; t += STEP) out.push(t);
  return out;
}

/** Is `slotStart` a genuine, currently open slot? Used by both the availability API and booking. */
export async function isSlotOpen(slotStart: number, now = Date.now()): Promise<boolean> {
  if (slotStart < now + schedule.minNoticeHours * 3600_000) return false;
  if (slotStart > now + (schedule.windowDays + 1) * 86400_000) return false;
  const c = coachDay(schedule.timezone, slotStart);
  if (!candidateStarts(c.y, c.mo, c.d, c.weekday, c.date).includes(slotStart)) return false;
  const busy = await getCalendar().busyIntervals(slotStart, slotStart + schedule.slotMinutes * 60_000);
  const end = slotStart + schedule.slotMinutes * 60_000;
  // Treat the buffer as part of an existing call.
  return !busy.some(([s, e]) => slotStart < e + schedule.bufferMinutes * 60_000 && end + schedule.bufferMinutes * 60_000 > s);
}

export type Slot = { start: number; available: boolean };

/** Slots whose start falls on `date` in the *visitor's* timezone `tz`. */
export async function slotsForVisitorDay(date: string, tz: string, now = Date.now()): Promise<Slot[]> {
  const range = dayRangeUtc(tz, date);
  if (!range) return [];
  const [from, to] = range;
  // Walk the coach-local days that overlap the visitor's day.
  const starts = new Set<number>();
  for (let t = from - 86400_000; t < to + 86400_000; t += 86400_000) {
    const c = coachDay(schedule.timezone, t);
    for (const s of candidateStarts(c.y, c.mo, c.d, c.weekday, c.date)) starts.add(s);
  }
  const inDay = [...starts].filter((s) => s >= from && s < to).sort((a, b) => a - b);
  const busy = await getCalendar().busyIntervals(from, to);
  const buf = schedule.bufferMinutes * 60_000;
  const len = schedule.slotMinutes * 60_000;
  return inDay.map((start) => {
    const noticeOk = start >= now + schedule.minNoticeHours * 3600_000;
    const windowOk = start <= now + (schedule.windowDays + 1) * 86400_000;
    const free = !busy.some(([s, e]) => start < e + buf && start + len + buf > s);
    return { start, available: noticeOk && windowOk && free };
  });
}
