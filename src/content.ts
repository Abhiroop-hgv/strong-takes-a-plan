/**
 * ALL site copy and lists live here. Edit this file; you should not need to
 * touch any component. Everything in [BRACKETS] is a placeholder: replace it
 * with real facts. Never publish results, certifications or clients you
 * cannot show.
 */

export type Client = {
  id: string;
  firstName: string;
  age: string;
  job: string;
  /** One key result in mono, shown on the card. */
  keyResult: string;
  /** One-line quote on the card. */
  quote: string;
  /** Optional photo paths in /public (same pose, light and framing). */
  beforeSrc?: string;
  afterSrc?: string;
  beforeAlt: string;
  afterAlt: string;
  /** Case-study overlay */
  duration: string;
  keyNumbers: [string, string];
  startingPoint: string;
  whatChanged: string;
  result: string;
  longQuote: string;
};

export type Testimonial = { quote: string; name: string; age: string; job: string };
export type Recipe = {
  tags: [string, string];
  name: string;
  macros: string;
  href: string;
  imageSrc?: string;
  imageAlt: string;
};
export type Qualification = {
  tag: "CERTIFICATION" | "DIPLOMA" | "SPECIALIZATION";
  name: string;
  issuerYear: string;
  verifyLabel: string;
  verifyHref: string;
  imageSrc?: string;
  imageAlt: string;
};
export type Social = {
  platform: "INSTAGRAM" | "YOUTUBE" | "TIKTOK" | "WHATSAPP";
  handle: string;
  line: string;
  href: string;
};

const clientBase = {
  beforeAlt: "[Describe the before photo for screen readers]",
  afterAlt: "[Describe the after photo for screen readers]",
  duration: "[Y weeks]",
  startingPoint: "[Where this client started: schedule, habits, goal.]",
  whatChanged: "[What changed in the plan, in two or three sentences.]",
  result: "[The result, with the real numbers.]",
  longQuote: "[A longer quote in the client's own words.]",
};

export const content = {
  site: {
    coachName: "[YOUR NAME]",
    cityCountry: "[CITY/COUNTRY]",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    description:
      "1:1 online fitness coaching: training, nutrition and daily support, built around your real week. Book a free 20-minute call.",
    email: "coach@example.com",
    privacyUrl: "/privacy",
  },

  nav: {
    links: [
      { label: "Results", href: "#results" },
      { label: "Method", href: "#how" },
      { label: "About", href: "#about" },
      { label: "Recipes", href: "#recipes" },
    ],
    cta: "Apply",
  },

  hero: {
    label: "1:1 ONLINE COACHING",
    headline: "STRONG TAKES A PLAN.",
    sub: "1:1 online coaching for busy people who are done starting over. By [YOUR NAME].",
    cta: "Apply for 1:1 Coaching",
    note: "Free 20-minute call. No obligation.",
    /** Drop files in /public/media and set these. Leave empty to show the placeholder. */
    posterSrc: "" as string,
    posterAlt: "[YOUR NAME] coaching a client",
    videoMp4: "" as string,
    videoWebm: "" as string,
    placeholderText: "[ HERO VIDEO LOOP: you training or coaching, 16:9, muted ]",
  },

  stats: [
    { value: "[N]", label: "clients coached" },
    { value: "[N]", label: "years coaching" },
    { value: "[XX]", label: "median client result" },
  ],

  philosophy: {
    label: "HOW I COACH",
    headline: "The plan has to survive a bad week.",
    beliefs: [
      { title: "Built around your schedule", text: "[One or two sentences in your own words.]" },
      { title: "Data over motivation", text: "[One or two sentences in your own words.]" },
      { title: "Food you actually eat", text: "[One or two sentences in your own words.]" },
    ],
    imageSrc: "" as string,
    imageAlt: "[YOUR NAME] mid-session",
    placeholderText: "[ CANDID PORTRAIT: you mid-session, 4:5 ]",
  },

  results: {
    label: "RESULTS",
    headline: "Real people. Real jobs. Real timelines.",
    clients: [
      { ...clientBase, id: "c1", firstName: "[First name]", age: "[age]", job: "[Job]", keyResult: "[X kg] in [Y weeks]", quote: "[One-line quote in the client's words.]", keyNumbers: ["[X kg]", "[Y weeks]"] },
      { ...clientBase, id: "c2", firstName: "[First name]", age: "[age]", job: "[Job]", keyResult: "[Lift A] to [Lift B]", quote: "[One-line quote in the client's words.]", keyNumbers: ["[Lift A]", "[Lift B]"] },
      { ...clientBase, id: "c3", firstName: "[First name]", age: "[age]", job: "[Job]", keyResult: "[X kg] in [Y weeks]", quote: "[One-line quote in the client's words.]", keyNumbers: ["[X kg]", "[Y weeks]"] },
      { ...clientBase, id: "c4", firstName: "[First name]", age: "[age]", job: "[Job]", keyResult: "[X kg] in [Y weeks]", quote: "[One-line quote in the client's words.]", keyNumbers: ["[X kg]", "[Y weeks]"] },
    ] as Client[],
    disclaimer: "Results vary. My median client [REAL NUMBER]. Shown with written permission.",
    cta: "Apply for 1:1 Coaching",
  },

  roadmap: {
    label: "WHAT TO EXPECT",
    headline: "Your first weeks, step by step.",
    steps: [
      { icon: "document", title: "Apply online", text: "Five short questions about your goal and your week. It takes about two minutes." },
      { icon: "chat", title: "A free 20-minute call", text: "We talk, and we both check it is a fit. No pressure, just clarity." },
      { icon: "sliders", title: "I build your plan", text: "Training and food built around your real schedule, travel and tastes." },
      { icon: "clock", title: "We check in every day", text: "You message me. I review your training and your food and answer fast." },
      { icon: "trending", title: "We adjust until it sticks", text: "Every week we review and change the plan to match how you respond." },
    ] as { icon: "document" | "chat" | "sliders" | "clock" | "trending"; title: string; text: string }[],
    mediaSrc: "" as string,
    mediaAlt: "Screenshot of a real coaching chat",
    placeholderText: "[ REAL SCREENSHOT OR SCREEN RECORDING OF YOUR COACHING CHAT ]",
  },

  coach: {
    label: "MEET YOUR COACH",
    headline: "I was [your real starting point]. Now I coach people out of it.",
    paragraphs: [
      "[Why you started: two or three sentences, in your own words.]",
      "[What you believe about coaching.] [How you work with clients day to day.] [Who you work best with.]",
    ],
    credentials: "[ONE QUIET CREDENTIALS LINE]",
    cta: "Apply for 1:1 Coaching",
    imageSrc: "" as string,
    imageAlt: "Portrait of [YOUR NAME]",
    placeholderText: "[ LARGE PORTRAIT OF YOU, 4:5 ]",
  },

  qualifications: {
    label: "QUALIFICATIONS",
    headline: "Trained properly. Happy to show it.",
    sentence: "[One sentence on your training and why it matters to how you coach.]",
    items: [
      { tag: "CERTIFICATION", name: "[Personal training certification]", issuerYear: "[ISSUING BODY] · [YEAR]", verifyLabel: "[LINK OR CERTIFICATE ID]", verifyHref: "#", imageAlt: "Scan of the personal training certificate" },
      { tag: "DIPLOMA", name: "[Diploma or degree name]", issuerYear: "[INSTITUTION] · [YEAR]", verifyLabel: "[LINK OR CERTIFICATE ID]", verifyHref: "#", imageAlt: "Scan of the diploma" },
      { tag: "SPECIALIZATION", name: "[Nutrition or other course]", issuerYear: "[ISSUING BODY] · [YEAR]", verifyLabel: "[LINK OR CERTIFICATE ID]", verifyHref: "#", imageAlt: "Scan of the specialization certificate" },
    ] as Qualification[],
    placeholderText: "[ SCAN OF YOUR CERTIFICATE ]",
  },

  fit: {
    headline: "This works if you'll show up. It doesn't if you won't.",
    worksLabel: "WORKS WELL IF",
    works: ["You will check in daily.", "You want a plan that fits your week.", "[Add your own.]"],
    notLabel: "NOT A FIT IF",
    not: ["You want a four-week miracle.", "You won't log or message.", "[Add your own.]"],
    goalLead: "My goal is",
    goals: [
      { id: "fat-loss", label: "Fat loss", line: "[One line: how coaching works for fat loss, using your real process.]" },
      { id: "muscle", label: "Muscle", line: "[One line: how coaching works for building muscle.]" },
      { id: "consistency", label: "Consistency", line: "[One line: how coaching works for people who just want to stay consistent.]" },
    ],
  },

  testimonials: {
    /** First four are the main carousel (dots). The rest appear under "View more". */
    items: [
      { quote: "[A real client quote, trimmed lightly. Their words, not yours.]", name: "[NAME]", age: "[AGE]", job: "[JOB]" },
      { quote: "[Another real client quote, in their words.]", name: "[NAME]", age: "[AGE]", job: "[JOB]" },
      { quote: "[Another real client quote, in their words.]", name: "[NAME]", age: "[AGE]", job: "[JOB]" },
      { quote: "[Another real client quote, in their words.]", name: "[NAME]", age: "[AGE]", job: "[JOB]" },
      { quote: "[Another real client quote, in their words.]", name: "[NAME]", age: "[AGE]", job: "[JOB]" },
      { quote: "[Another real client quote, in their words.]", name: "[NAME]", age: "[AGE]", job: "[JOB]" },
      { quote: "[Another real client quote, in their words.]", name: "[NAME]", age: "[AGE]", job: "[JOB]" },
    ] as Testimonial[],
    featuredCount: 4,
    moreLabel: "View more",
    lessLabel: "Show less",
  },

  recipes: {
    label: "RECIPES",
    headline: "Food you'll actually eat.",
    sentence:
      "[One or two sentences: your clients eat real meals, not boiled chicken. Every recipe comes with its numbers.]",
    allLabel: "See all recipes",
    allHref: "[RECIPES URL]",
    items: [
      { tags: ["[TAG]", "[TAG]"], name: "[RECIPE NAME]", macros: "[XXX] kcal · [XX] g protein · [XX] min", href: "#", imageAlt: "[Describe the dish]" },
      { tags: ["[TAG]", "[TAG]"], name: "[RECIPE NAME]", macros: "[XXX] kcal · [XX] g protein · [XX] min", href: "#", imageAlt: "[Describe the dish]" },
      { tags: ["[TAG]", "[TAG]"], name: "[RECIPE NAME]", macros: "[XXX] kcal · [XX] g protein · [XX] min", href: "#", imageAlt: "[Describe the dish]" },
    ] as Recipe[],
    placeholderText: "[ RECIPE PHOTO, 4:3 ]",
  },

  follow: {
    label: "FOLLOW ALONG",
    headline: "See how I coach, every week.",
    sentence:
      "[One or two sentences: what people get by following you. Training clips, meals, client check-ins.]",
    items: [
      { platform: "INSTAGRAM", handle: "[@YOURHANDLE]", line: "[What you post here, in one line.]", href: "https://instagram.com/YOURHANDLE" },
      { platform: "YOUTUBE", handle: "[@YOURHANDLE]", line: "[What you post here, in one line.]", href: "https://youtube.com/@YOURHANDLE" },
      { platform: "TIKTOK", handle: "[@YOURHANDLE]", line: "[What you post here, in one line.]", href: "https://tiktok.com/@YOURHANDLE" },
      { platform: "WHATSAPP", handle: "[+00 00000 00000]", line: "[Message me directly with a question.]", href: "https://wa.me/0000000000" },
    ] as Social[],
  },

  faq: {
    headline: "Fair questions.",
    items: [
      { q: "I've tried before and failed. What's different?", a: "[Your honest answer in two or three sentences.]" },
      { q: "Do I need experience?", a: "[Your honest answer in two or three sentences.]" },
      { q: "What if I travel or get injured?", a: "[Your honest answer in two or three sentences.]" },
      { q: "How fast will I see results?", a: "[Your honest answer in two or three sentences. Describe your process, do not promise a number.]" },
      { q: "What does it cost?", a: "[Starting price, minimum term, pause and cancel rules, in plain words.]" },
      { q: "What happens on the call?", a: "[Your honest answer in two or three sentences.]" },
    ],
    whatsappLabel: "Message me on WhatsApp",
    whatsappHref: "https://wa.me/0000000000",
  },

  apply: {
    label: "APPLY",
    headline: "If this sounds right, tell me where you're starting.",
    paragraph: "Share a few details, then pick a time that suits you. We talk for 20 minutes, free.",
  },

  footer: {
    links: [
      { label: "Instagram", href: "https://instagram.com/YOURHANDLE" },
      { label: "WhatsApp", href: "https://wa.me/0000000000" },
      { label: "Email", href: "mailto:coach@example.com" },
      { label: "Privacy", href: "/privacy" },
    ],
    disclaimer: "Not medical advice. Consult a doctor before starting.",
  },

  sticky: { label: "Book a free call" },

  booking: {
    goals: ["Fat loss", "Muscle gain", "Strength", "General fitness", "Other"],
    genders: ["Female", "Male", "Other", "Prefer not to say"],
    conditions: ["None", "Diabetes", "Thyroid", "Obesity", "Other"],
  },
};

export type Content = typeof content;
