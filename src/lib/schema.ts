import { z } from "zod";
import { content } from "@/content";

const goals = content.booking.goals as [string, ...string[]];
const genders = content.booking.genders as [string, ...string[]];
const conditions = content.booking.conditions as [string, ...string[]];

/** Step 1 fields. Shared by the browser form and the server, so the rules cannot drift apart. */
export const detailsSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100, "That name is too long."),
  email: z.string().trim().min(1, "Please enter your email.").max(200).email("That email does not look right."),
  whatsapp: z
    .string()
    .trim()
    .max(20, "That number is too long.")
    .regex(/^(\+?[0-9][0-9 ()-]{6,19})?$/, "Use digits, with the country code if you can.")
    .optional()
    .or(z.literal("")),
  goal: z.enum(goals, { error: "Please choose what you are looking for." }),
  gender: z.enum(genders, { error: "Please choose an option." }),
  conditions: z.array(z.enum(conditions)).max(conditions.length),
  notes: z.string().trim().max(1000, "Please keep this under 1000 characters.").optional().or(z.literal("")),
  consent: z.literal(true, { error: "Please tick the box to continue." }),
});
export type Details = z.infer<typeof detailsSchema>;

export const bookingSchema = detailsSchema.extend({
  slotStart: z.number().int().positive(),
  tz: z.string().max(64),
  idempotencyKey: z.string().uuid(),
  /** Honeypot: real people never see or fill this. */
  website: z.string().max(0).optional(),
  turnstileToken: z.string().max(4096).optional(),
});
export type BookingInput = z.infer<typeof bookingSchema>;
