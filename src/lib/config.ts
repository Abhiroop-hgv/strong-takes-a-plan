/**
 * Server-side booking configuration. Edit the schedule here.
 * Secrets and switches come from environment variables (see .env.example).
 */
export const schedule = {
  /** IANA timezone the working hours below are written in. */
  timezone: process.env.COACH_TIMEZONE ?? "Asia/Kolkata",
  /** 0 = Sunday ... 6 = Saturday. Each entry is [startHour, endHour) in coach time, 24h clock. */
  hours: {
    0: null,
    1: [9, 18],
    2: [9, 18],
    3: [9, 18],
    4: [9, 18],
    5: [9, 18],
    6: [9, 13],
  } as Record<number, [number, number] | null>,
  /** Specific dates the coach is away, as YYYY-MM-DD in coach time. */
  daysOff: [] as string[],
  slotMinutes: 20,
  /** Gap kept free after every call. Slots start every (slotMinutes + bufferMinutes). */
  bufferMinutes: 10,
  /** Earliest bookable time from now. */
  minNoticeHours: 12,
  /** How many days ahead people can book (the picker shows this many days). */
  windowDays: 7,
};

export const env = {
  mode: (process.env.BOOKING_MODE === "live" ? "live" : "test") as "live" | "test",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  coachEmail: process.env.COACH_EMAIL ?? "coach@example.com",
  coachName: "[YOUR NAME]",
  meetingUrl: process.env.MEETING_URL ?? "https://meet.example.com/your-room",
  emailFrom: process.env.EMAIL_FROM ?? "Coach <bookings@example.com>",
  whatsappEnabled: process.env.WHATSAPP_ENABLED === "true",
};

export const isLive = () => env.mode === "live";
