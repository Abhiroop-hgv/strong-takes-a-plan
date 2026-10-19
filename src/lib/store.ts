import { promises as fs } from "node:fs";
import path from "node:path";
import { isLive } from "./config";

export type Booking = {
  id: string;
  idempotencyKey: string;
  /** UTC ms of the call start */
  slotStart: number;
  name: string;
  email: string;
  whatsapp: string | null;
  goal: string;
  gender: string;
  /** Encrypted JSON: { conditions: string[], notes: string } */
  health: string;
  visitorTz: string;
  consentAt: number;
  status: "confirmed" | "cancelled";
  reminderSent: boolean;
  createdAt: number;
};

export type InsertResult =
  | { ok: true; booking: Booking; existing: boolean }
  | { ok: false; reason: "slot_taken" };

export interface Store {
  insert(b: Booking): Promise<InsertResult>;
  get(id: string): Promise<Booking | null>;
  getByIdempotencyKey(key: string): Promise<Booking | null>;
  /** Confirmed bookings with slotStart in [from, to). */
  listBetween(from: number, to: number): Promise<Booking[]>;
  dueReminders(from: number, to: number): Promise<Booking[]>;
  markReminded(id: string): Promise<void>;
  cancel(id: string): Promise<boolean>;
  /** Permanently erase everything stored about this booking. */
  erase(id: string): Promise<boolean>;
}

/* ------------------------- File store (test mode) ------------------------- */

const FILE = path.join(process.cwd(), ".data", "bookings.json");
let chain: Promise<unknown> = Promise.resolve();

function locked<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.catch(() => undefined);
  return run;
}

async function readAll(): Promise<Booking[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Booking[];
  } catch {
    return [];
  }
}
async function writeAll(rows: Booking[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(rows, null, 2));
}

const fileStore: Store = {
  insert: (b) =>
    locked(async () => {
      const rows = await readAll();
      const dup = rows.find((r) => r.idempotencyKey === b.idempotencyKey);
      if (dup) return { ok: true as const, booking: dup, existing: true };
      if (rows.some((r) => r.status === "confirmed" && r.slotStart === b.slotStart))
        return { ok: false as const, reason: "slot_taken" as const };
      rows.push(b);
      await writeAll(rows);
      return { ok: true as const, booking: b, existing: false };
    }),
  get: async (id) => (await readAll()).find((r) => r.id === id) ?? null,
  getByIdempotencyKey: async (key) => (await readAll()).find((r) => r.idempotencyKey === key) ?? null,
  listBetween: async (from, to) =>
    (await readAll()).filter((r) => r.status === "confirmed" && r.slotStart >= from && r.slotStart < to),
  dueReminders: async (from, to) =>
    (await readAll()).filter((r) => r.status === "confirmed" && !r.reminderSent && r.slotStart >= from && r.slotStart < to),
  markReminded: (id) =>
    locked(async () => {
      const rows = await readAll();
      const r = rows.find((x) => x.id === id);
      if (r) {
        r.reminderSent = true;
        await writeAll(rows);
      }
    }),
  cancel: (id) =>
    locked(async () => {
      const rows = await readAll();
      const r = rows.find((x) => x.id === id);
      if (!r) return false;
      r.status = "cancelled";
      await writeAll(rows);
      return true;
    }),
  erase: (id) =>
    locked(async () => {
      const rows = await readAll();
      const next = rows.filter((x) => x.id !== id);
      if (next.length === rows.length) return false;
      await writeAll(next);
      return true;
    }),
};

/* ------------------------ Postgres store (live mode) ----------------------- */

type PgPool = {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[]; rowCount: number | null }>;
};
let pool: PgPool | null = null;
let ready: Promise<void> | null = null;

async function db(): Promise<PgPool> {
  if (!pool) {
    const { Pool } = await import("pg");
    pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 }) as unknown as PgPool;
  }
  if (!ready) {
    ready = pool
      .query(
        `create table if not exists bookings (
           id text primary key,
           idempotency_key text not null unique,
           slot_start bigint not null,
           name text not null,
           email text not null,
           whatsapp text,
           goal text not null,
           gender text not null,
           health text not null,
           visitor_tz text not null,
           consent_at bigint not null,
           status text not null default 'confirmed',
           reminder_sent boolean not null default false,
           created_at bigint not null
         );
         create unique index if not exists bookings_slot_confirmed on bookings (slot_start) where status = 'confirmed';`,
      )
      .then(() => undefined);
  }
  await ready;
  return pool;
}

function fromRow(r: Record<string, unknown>): Booking {
  return {
    id: r.id as string,
    idempotencyKey: r.idempotency_key as string,
    slotStart: Number(r.slot_start),
    name: r.name as string,
    email: r.email as string,
    whatsapp: (r.whatsapp as string | null) ?? null,
    goal: r.goal as string,
    gender: r.gender as string,
    health: r.health as string,
    visitorTz: r.visitor_tz as string,
    consentAt: Number(r.consent_at),
    status: r.status as Booking["status"],
    reminderSent: r.reminder_sent as boolean,
    createdAt: Number(r.created_at),
  };
}

const pgStore: Store = {
  async insert(b) {
    const p = await db();
    const existing = await p.query("select * from bookings where idempotency_key = $1", [b.idempotencyKey]);
    if (existing.rows[0]) return { ok: true, booking: fromRow(existing.rows[0]), existing: true };
    try {
      await p.query(
        `insert into bookings (id, idempotency_key, slot_start, name, email, whatsapp, goal, gender, health, visitor_tz, consent_at, status, reminder_sent, created_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
        [b.id, b.idempotencyKey, b.slotStart, b.name, b.email, b.whatsapp, b.goal, b.gender, b.health, b.visitorTz, b.consentAt, b.status, b.reminderSent, b.createdAt],
      );
      return { ok: true, booking: b, existing: false };
    } catch (e) {
      if ((e as { code?: string }).code === "23505") return { ok: false, reason: "slot_taken" };
      throw e;
    }
  },
  async get(id) {
    const r = await (await db()).query("select * from bookings where id = $1", [id]);
    return r.rows[0] ? fromRow(r.rows[0]) : null;
  },
  async getByIdempotencyKey(key) {
    const r = await (await db()).query("select * from bookings where idempotency_key = $1", [key]);
    return r.rows[0] ? fromRow(r.rows[0]) : null;
  },
  async listBetween(from, to) {
    const r = await (await db()).query("select * from bookings where status = 'confirmed' and slot_start >= $1 and slot_start < $2", [from, to]);
    return r.rows.map(fromRow);
  },
  async dueReminders(from, to) {
    const r = await (await db()).query(
      "select * from bookings where status = 'confirmed' and reminder_sent = false and slot_start >= $1 and slot_start < $2",
      [from, to],
    );
    return r.rows.map(fromRow);
  },
  async markReminded(id) {
    await (await db()).query("update bookings set reminder_sent = true where id = $1", [id]);
  },
  async cancel(id) {
    const r = await (await db()).query("update bookings set status = 'cancelled' where id = $1", [id]);
    return (r.rowCount ?? 0) > 0;
  },
  async erase(id) {
    const r = await (await db()).query("delete from bookings where id = $1", [id]);
    return (r.rowCount ?? 0) > 0;
  },
};

export function getStore(): Store {
  return isLive() ? pgStore : fileStore;
}
