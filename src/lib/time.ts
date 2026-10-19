/** Timezone helpers built on Intl only, so there are no date libraries to ship. */

function parts(tz: string, ms: number) {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "short",
  });
  const o: Record<string, string> = {};
  for (const p of f.formatToParts(new Date(ms))) o[p.type] = p.value;
  return o;
}

/** Offset (ms) of `tz` from UTC at the instant `ms`. */
export function tzOffsetMs(tz: string, ms: number): number {
  const p = parts(tz, ms);
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return asUtc - Math.floor(ms / 1000) * 1000;
}

/** UTC instant for a wall-clock time in `tz`. */
export function zonedToUtc(tz: string, y: number, mo: number, d: number, h = 0, mi = 0): number {
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  let utc = guess - tzOffsetMs(tz, guess);
  utc = guess - tzOffsetMs(tz, utc); // second pass settles DST edges
  return utc;
}

export function parseDate(s: string): { y: number; mo: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const [y, mo, d] = [+m[1], +m[2], +m[3]];
  const check = new Date(Date.UTC(y, mo - 1, d));
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) return null;
  return { y, mo, d };
}

export function isValidTimezone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** [start, end) UTC ms of the calendar day `date` as seen in `tz`. */
export function dayRangeUtc(tz: string, date: string): [number, number] | null {
  const p = parseDate(date);
  if (!p) return null;
  const start = zonedToUtc(tz, p.y, p.mo, p.d);
  const next = new Date(Date.UTC(p.y, p.mo - 1, p.d + 1));
  const end = zonedToUtc(tz, next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate());
  return [start, end];
}

/** The coach-local calendar date (YYYY-MM-DD) and weekday (0-6) of a UTC instant. */
export function coachDay(tz: string, ms: number) {
  const p = parts(tz, ms);
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
  return { date: `${p.year}-${p.month}-${p.day}`, weekday: wd, y: +p.year, mo: +p.month, d: +p.day };
}

export function formatInTz(tz: string, ms: number, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: tz, ...opts }).format(new Date(ms));
}
