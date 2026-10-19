import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/crypto";
import { clientIp, rateLimit } from "@/lib/security";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * Cancel / delete-my-data links from the confirmation email.
 * GET only shows a confirm button (mail scanners prefetch links, so GET must never change data).
 * POST performs the action.
 */

const page = (title: string, body: string, status = 200) =>
  new Response(
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title>
<body style="font-family:system-ui,sans-serif;background:#f4f5f2;color:#101214;display:grid;place-items:center;min-height:100vh;margin:0;padding:20px">
<main style="max-width:440px;background:#fff;border:1px solid #d5d8d2;border-radius:24px;padding:32px">
<h1 style="font-size:24px;margin:0 0 12px">${title}</h1>${body}</main></body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } },
  );

const btn = "min-height:56px;padding:0 28px;border:0;border-radius:999px;background:#d22f11;color:#fff;font-weight:600;font-size:16px;cursor:pointer";

function parse(token: string | null, action: string | null) {
  const id = token ? verifyToken(token) : null;
  if (!id || (action !== "cancel" && action !== "erase")) return null;
  return { id, action };
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const p = parse(token, req.nextUrl.searchParams.get("action"));
  if (!p) return page("Link not valid", "<p>This link is invalid or has expired.</p>", 400);
  const text =
    p.action === "cancel"
      ? "Cancel your call? You can book a new time on the website afterwards."
      : "Permanently delete everything stored about your booking, including your health answers? This cannot be undone.";
  return page(
    p.action === "cancel" ? "Cancel your booking" : "Delete my data",
    `<p>${text}</p><form method="post"><input type="hidden" name="token" value="${encodeURIComponent(token!)}"><input type="hidden" name="action" value="${p.action}"><button style="${btn}">Yes, ${p.action === "cancel" ? "cancel it" : "delete my data"}</button></form>`,
  );
}

export async function POST(req: NextRequest) {
  if (!rateLimit(`manage:${clientIp(req)}`, 20, 10 * 60_000)) return page("Slow down", "<p>Please try again in a few minutes.</p>", 429);
  const form = await req.formData();
  const token = decodeURIComponent(String(form.get("token") ?? ""));
  const p = parse(token, String(form.get("action") ?? ""));
  if (!p) return page("Link not valid", "<p>This link is invalid or has expired.</p>", 400);
  const store = getStore();
  const done = p.action === "cancel" ? await store.cancel(p.id) : await store.erase(p.id);
  if (!done) return page("Nothing to change", "<p>This booking was already cancelled or deleted.</p>");
  return page(
    p.action === "cancel" ? "Booking cancelled" : "Your data is deleted",
    p.action === "cancel" ? "<p>Your call is cancelled. You are welcome to book another time.</p>" : "<p>Everything stored about your booking has been permanently deleted.</p>",
  );
}
