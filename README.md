# Coach site

Single-page marketing site with a working 2-step booking flow (details, then a calendar), built from the written spec in *Premium Coaching Website Concepts and Design Brief*, section H, using the reference HTML for layout and copy.

Next.js (App Router) · TypeScript · Tailwind CSS 4 · Framer Motion (LazyMotion) · zod · Postgres (live mode) · Resend · optional WhatsApp Cloud API.

## Run it

```bash
npm install
cp .env.example .env.local     # defaults already work in test mode
npm run dev                     # http://localhost:3000
```

**Test mode is the default** (`BOOKING_MODE=test`). Nothing leaves your machine:

- bookings are saved to `.data/bookings.json`
- confirmation, coach notification, reminder and WhatsApp messages are written as text files to `.data/outbox/`
- health answers are encrypted in the store and hidden in the outbox copy of the coach email

Other scripts: `npm run build`, `npm start`, `npm run lint` (type check).

## Edit the content

Everything lives in **`src/content.ts`**: headlines, stats, clients, testimonials, recipes, qualifications, FAQ, social links, form options. Every `[BRACKET]` is a placeholder to replace. Never publish a result, certificate or client you cannot show, and get written permission for every client photo.

The coach's name appears as `coachName` in `content.ts` and `coachName` in `src/lib/config.ts` (used in emails). Change both.

Visual tokens are CSS variables and Tailwind theme colors at the top of `src/app/globals.css`.

## Swap in real media

Put files in `public/media/` and set the path in `content.ts`; the labeled placeholder disappears automatically.

| Slot | Field | Ratio |
| --- | --- | --- |
| Hero poster (LCP image, preloaded) | `hero.posterSrc` | fills the right 58% |
| Hero video | `hero.videoMp4`, `hero.videoWebm` | 16:9, 6 to 10 s loop, 1080p max, under about 5 MB |
| Philosophy / Coach portraits | `philosophy.imageSrc`, `coach.imageSrc` | 4:5 |
| Chat screenshot | `roadmap.mediaSrc` | 16:9 |
| Before / after | `results.clients[n].beforeSrc / afterSrc` | same pose, light and framing |
| Certificate scans, recipe photos | `qualifications.items[n].imageSrc`, `recipes.items[n].imageSrc` | 4:3 |

The video only loads on a fast connection, without Save-Data and with reduced motion off. Posters and other images go through `next/image` (AVIF/WebP, lazy except the hero poster). Replace `src/app/icon.svg` with your favicon.

## Booking: how it works

- `GET /api/availability?date=YYYY-MM-DD&tz=Area/City` returns slots for that day in the visitor's timezone.
- `POST /api/bookings` validates with zod, **re-checks the slot on the server**, stores the booking, then sends emails. A taken slot returns `409` and the UI sends the visitor back to step 2 with "That time was just booked. Please pick another."
- The browser sends an idempotency key; a double click or retry returns the original booking and sends nothing twice.
- Confirmation email includes an `.ics` file, the video link, a cancel link (to reschedule: cancel, then book again) and a delete-my-data link. Links are signed and expire after 90 days; opening one only shows a confirm button, the action happens on POST.
- `GET /api/cron/reminders` sends the 24-hour reminder. Call it hourly with `Authorization: Bearer $CRON_SECRET`.

### Set your schedule

`src/lib/config.ts`: timezone, working hours per weekday, days off, slot length (20 min), buffer (10 min, so slots start every 30 min), minimum notice (12 h) and window (7 days).

### Calendar

Availability is working hours minus stored bookings. To read free/busy from **Google Calendar** or **Cal.com** instead, implement the one-method `CalendarProvider` interface in `src/lib/availability.ts` (`busyIntervals`) and return it from `getCalendar()`. Nothing else changes. Creating a calendar event with a generated video link is not built in; the `MEETING_URL` env var is put in the emails and `.ics` instead (a permanent Meet/Zoom room works well).

### Go live

1. Create a Postgres database (Neon or Supabase). The `bookings` table is created automatically on first use.
2. Set in your host's environment (see `.env.example`): `BOOKING_MODE=live`, `DATABASE_URL`, `HEALTH_DATA_KEY` (32 random bytes, base64), `SESSION_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM` (a domain verified in Resend), `COACH_EMAIL`, `MEETING_URL`, `NEXT_PUBLIC_SITE_URL`, `COACH_TIMEZONE`, `CRON_SECRET`.
3. Optional but recommended: Cloudflare Turnstile (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`).
4. **WhatsApp (optional):** set `WHATSAPP_ENABLED=true`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`. Create and get approved a template named `booking_confirmation` with three body variables: `{{1}}` name, `{{2}}` date, `{{3}}` time. Email still goes out if WhatsApp fails.
5. **Reminders:** schedule an hourly GET to `/api/cron/reminders` (Vercel Cron, GitHub Actions or cron-job.org).
6. **Analytics:** set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`. Events: `apply_click`, `form_start`, `step2_reached`, `booking_confirmed`. No personal data is sent.

### Deploy

Vercel: import the repo, add the environment variables, deploy. Any Node host works (`npm run build && npm start`). The in-memory rate limiter is per instance; switch `src/lib/security.ts` to a shared store (Upstash Redis) if you run several.

### Health data

Chronic issues and notes are AES-256-GCM encrypted before storage, never logged, never sent to analytics, and appear in plain text only in the coach notification email. Each confirmation email links to permanent erasure. The privacy page (`/privacy`) names what is collected; **have it reviewed for your country before launch** and fill its brackets.

## Quality

Lighthouse, mobile preset (simulated 4G / slowed CPU), production build, test mode: **Performance 90, Accessibility 100, Best Practices 100, SEO 100.** Report: `lighthouse/mobile.report.html`. CLS 0, TBT 290 ms, simulated LCP 2.8 s (the target is under 2.5 s; measured locally the real LCP is about 0.2 s, and it will change once the real hero poster is the LCP element, so re-run this with your media in).

## Assumptions and what does not match the spec

1. **No design screenshots existed**, so layout follows the written spec plus the reference HTML (copy, spacing, structure). Where the two differ I followed the spec.
2. **Results strip**: on desktop (reduced motion off) the section pins and vertical scroll moves the cards sideways (GSAP ScrollTrigger, loaded on demand, with a progress bar). On mobile, tablet and with reduced motion it is a native swipe row with scroll-snap, a peeking next card and arrow buttons. If every card fits on screen it simply stays a normal row.
3. **Clicking a result card opens the case study from its text area, not from the before/after slider**, so dragging the slider never opens it by accident.
4. **Hero**: video is skipped on slow connections / Save-Data / reduced motion. There is no hero zoom-on-scroll (not in section H).
5. **Booking days start from today** and the calendar auto-selects the first day with a free slot. The reference started tomorrow.
6. **Slots every 30 minutes** (20-minute call plus 10-minute buffer). Change in `config.ts`.
7. **Reschedule = cancel then rebook.** There is no separate reschedule page.
8. **Calendar events are not created automatically**; a fixed `MEETING_URL` plus `.ics` is used (see above).
9. **Privacy policy text is a draft**, not legal advice.
10. **Recipes "See all recipes"** links to `[RECIPES URL]` in `content.ts`; until you replace it the button scrolls to the section. No recipes page was built, per the spec.
11. Social and WhatsApp URLs are placeholders (`YOURHANDLE`, `0000000000`).
12. The OG/Twitter image (1200x630) is generated from the headline; replace `src/app/opengraph-image.tsx` with a real photo when you have one.

### Not verified

- **Live mode was not run**: the Postgres store, Resend delivery, WhatsApp Cloud API and Turnstile code paths are written but untested against real accounts. Test each with real credentials before launch.
- Tested in a browser in test mode: all sections on desktop and mobile widths, the case-study overlay (open, focus move, Escape, focus return), the full booking flow, inline validation, double booking (409), off-grid and past slots, honeypot, cross-origin rejection, idempotent replay (no duplicate emails), the signed delete link, and the unauthenticated cron request (401).
- Not tested: real screen readers, Safari/Firefox, a real phone, and the case-study layout animation on very slow devices.
