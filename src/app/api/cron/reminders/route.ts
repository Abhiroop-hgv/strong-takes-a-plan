import { NextRequest } from "next/server";
import { sendReminder } from "@/lib/notify";
import { json } from "@/lib/security";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * Call hourly (Vercel Cron, GitHub Actions, cron-job.org) with `Authorization: Bearer $CRON_SECRET`.
 * Sends a reminder for every confirmed call starting 23 to 25 hours from now.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return json({ error: "unauthorized" }, 401);
  const store = getStore();
  const now = Date.now();
  const due = await store.dueReminders(now + 23 * 3600_000, now + 25 * 3600_000);
  let sent = 0;
  for (const b of due) {
    try {
      await sendReminder(b);
      await store.markReminded(b.id);
      sent++;
    } catch (e) {
      console.error("[reminder] failed:", e instanceof Error ? e.message : "unknown");
    }
  }
  return json({ due: due.length, sent });
}
