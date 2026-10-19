import { promises as fs } from "node:fs";
import path from "node:path";
import { env, isLive, schedule } from "./config";
import { decryptJson, signToken } from "./crypto";
import type { Booking } from "./store";
import { formatInTz } from "./time";

type Attachment = { filename: string; content: string; contentType: string };
type Mail = { to: string; subject: string; text: string; html: string; attachments?: Attachment[] };

/* ------------------------------ delivery ------------------------------ */

async function sendMail(kind: string, mail: Mail, redactForOutbox?: string) {
  if (!isLive()) {
    // Test mode: write to disk, never call a provider. Health answers are redacted here too.
    const dir = path.join(process.cwd(), ".data", "outbox");
    await fs.mkdir(dir, { recursive: true });
    const body = `To: ${mail.to}\nSubject: ${mail.subject}\n\n${redactForOutbox ?? mail.text}\n${
      mail.attachments?.length ? `\n[attachments: ${mail.attachments.map((a) => a.filename).join(", ")}]\n` : ""
    }`;
    await fs.writeFile(path.join(dir, `${Date.now()}-${kind}.txt`), body);
    return;
  }
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set.");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.emailFrom,
      to: [mail.to],
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      attachments: mail.attachments?.map((a) => ({ filename: a.filename, content: a.content, content_type: a.contentType })),
    }),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}`); // body deliberately not logged
}

async function sendWhatsapp(b: Booking, kind: "confirmation" | "reminder") {
  if (!b.whatsapp || !env.whatsappEnabled) return;
  const when = describe(b, b.visitorTz);
  if (!isLive()) {
    const dir = path.join(process.cwd(), ".data", "outbox");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      path.join(dir, `${Date.now()}-whatsapp-${kind}.txt`),
      `To: ${b.whatsapp}\nTemplate: ${process.env.WHATSAPP_TEMPLATE_NAME ?? "booking_confirmation"}\nParams: ${b.name} | ${when.date} | ${when.time}\n`,
    );
    return;
  }
  const id = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!id || !token) throw new Error("WhatsApp credentials are not set.");
  const res = await fetch(`https://graph.facebook.com/v21.0/${id}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: b.whatsapp.replace(/[^0-9]/g, ""),
      type: "template",
      template: {
        name: process.env.WHATSAPP_TEMPLATE_NAME ?? "booking_confirmation",
        language: { code: process.env.WHATSAPP_TEMPLATE_LANG ?? "en" },
        components: [
          {
            type: "body",
            parameters: [b.name, when.date, `${when.time} (${b.visitorTz})`].map((text) => ({ type: "text", text })),
          },
        ],
      },
    }),
  });
  if (!res.ok) throw new Error(`WhatsApp responded ${res.status}`);
}

/* ------------------------------- content ------------------------------ */

function describe(b: Booking, tz: string) {
  return {
    date: formatInTz(tz, b.slotStart, { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    time: formatInTz(tz, b.slotStart, { hour: "numeric", minute: "2-digit", hour12: true }),
  };
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const ics = (d: number) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

export function buildIcs(b: Booking): string {
  const end = b.slotStart + schedule.slotMinutes * 60_000;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Coach site//Booking//EN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${b.id}@${new URL(env.siteUrl).host}`,
    `DTSTAMP:${ics(Date.now())}`,
    `DTSTART:${ics(b.slotStart)}`,
    `DTEND:${ics(end)}`,
    `SUMMARY:${icsText(`Free intro call with ${env.coachName}`)}`,
    `DESCRIPTION:${icsText(`20-minute intro call.\nJoin: ${env.meetingUrl}`)}`,
    `LOCATION:${icsText(env.meetingUrl)}`,
    `URL:${env.meetingUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function manageLinks(b: Booking) {
  const t = signToken(b.id);
  const base = `${env.siteUrl}/api/bookings/manage?token=${encodeURIComponent(t)}`;
  return { cancel: `${base}&action=cancel`, erase: `${base}&action=erase` };
}

export async function sendConfirmation(b: Booking) {
  const { date, time } = describe(b, b.visitorTz);
  const links = manageLinks(b);
  const text = [
    `Hi ${b.name},`,
    "",
    "You're booked: a free 20-minute call.",
    `When: ${date}, ${time} (${b.visitorTz})`,
    `Join: ${env.meetingUrl}`,
    "",
    "Your coach will read your details before the call.",
    `Need a different time? Cancel here, then book again: ${links.cancel}`,
    `Want your data deleted? ${links.erase}`,
  ].join("\n");
  const html = `<p>Hi ${esc(b.name)},</p><p><strong>You're booked:</strong> a free 20-minute call.</p>
<p>${esc(date)}, ${esc(time)} (${esc(b.visitorTz)})<br><a href="${esc(env.meetingUrl)}">Join the call</a></p>
<p>Your coach will read your details before the call.</p>
<p><a href="${esc(links.cancel)}">Cancel or reschedule</a> (cancel, then book a new time) &middot; <a href="${esc(links.erase)}">Delete my data</a></p>`;
  await sendMail("confirmation", {
    to: b.email,
    subject: `You're booked: ${date}, ${time}`,
    text,
    html,
    attachments: [{ filename: "call.ics", content: Buffer.from(buildIcs(b)).toString("base64"), contentType: "text/calendar" }],
  });
  await sendWhatsapp(b, "confirmation").catch(() => undefined); // WhatsApp is best effort; email already went
}

export async function sendCoachNotification(b: Booking) {
  const h = decryptJson<{ conditions: string[]; notes: string }>(b.health);
  const when = describe(b, schedule.timezone);
  const lines = (withHealth: boolean) => [
    `New booking: ${b.name}`,
    `When: ${when.date}, ${when.time} (${schedule.timezone})`,
    `Visitor timezone: ${b.visitorTz}`,
    `Email: ${b.email}`,
    `WhatsApp: ${b.whatsapp ?? "not given"}`,
    `Goal: ${b.goal}`,
    `Gender: ${b.gender}`,
    withHealth ? `Chronic issues: ${h.conditions.join(", ") || "none given"}` : "Chronic issues: [hidden in test-mode outbox]",
    withHealth ? `Notes: ${h.notes || "none"}` : "Notes: [hidden in test-mode outbox]",
  ];
  await sendMail(
    "coach-notification",
    {
      to: env.coachEmail,
      subject: `New booking: ${b.name}, ${when.date} ${when.time}`,
      text: lines(true).join("\n"),
      html: `<pre style="font:inherit">${esc(lines(true).join("\n"))}</pre>`,
    },
    lines(false).join("\n"),
  );
}

export async function sendReminder(b: Booking) {
  const { date, time } = describe(b, b.visitorTz);
  await sendMail("reminder", {
    to: b.email,
    subject: `Reminder: your call is tomorrow, ${time}`,
    text: `Hi ${b.name},\n\nA reminder of your free 20-minute call: ${date}, ${time} (${b.visitorTz}).\nJoin: ${env.meetingUrl}`,
    html: `<p>Hi ${esc(b.name)},</p><p>A reminder of your free 20-minute call: ${esc(date)}, ${esc(time)} (${esc(b.visitorTz)}).<br><a href="${esc(env.meetingUrl)}">Join the call</a></p>`,
  });
  await sendWhatsapp(b, "reminder").catch(() => undefined);
}
