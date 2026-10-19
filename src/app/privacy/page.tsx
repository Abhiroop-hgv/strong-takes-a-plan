import type { Metadata } from "next";
import { content } from "@/content";

export const metadata: Metadata = {
  title: `Privacy Policy | ${content.site.coachName}`,
  description: "What information is collected when you book a call, how it is used, and how to have it deleted.",
  alternates: { canonical: "/privacy" },
};

/**
 * Starting point, not legal advice. Have a lawyer review it for your country
 * (GDPR, India DPDP Act, etc.) and replace the [BRACKETS] before launch.
 */
export default function Privacy() {
  return (
    <main id="main" className="mx-auto flex max-w-[760px] flex-col gap-8 px-5 py-16 lg:py-24">
      <a href="/" className="text-sm font-semibold text-accent-text underline">
        ← Back to the site
      </a>
      <h1 className="wide text-4xl font-extrabold leading-tight">Privacy Policy</h1>
      <p className="text-muted">Last updated: [DATE]. Controller: {content.site.coachName}, {content.site.cityCountry}. Contact: {content.site.email}.</p>

      <Section title="What I collect when you apply">
        <ul className="list-disc space-y-1 pl-6">
          <li>Name and email address (needed to book your call and send your confirmation).</li>
          <li>WhatsApp number, only if you choose to give it, for your confirmation and reminder.</li>
          <li>Your goal and gender, to prepare for the call.</li>
          <li>
            <strong>Health information:</strong> any chronic issues you select (for example diabetes, thyroid or obesity) and anything you write in
            &ldquo;Tell me more&rdquo;. This is sensitive data and is collected only with your consent, given by ticking the box on the form.
          </li>
          <li>The time you picked and your timezone.</li>
        </ul>
      </Section>

      <Section title="How it is used">
        <p>
          Only to run your free intro call and, if you become a client, to coach you. I use it to prepare for the call, send your confirmation and a reminder 24
          hours before, and contact you about your booking. I do not sell it and I do not use it for advertising.
        </p>
      </Section>

      <Section title="How health information is protected">
        <p>
          Health answers are encrypted before they are stored, are readable only by me, are never written to logs and are never sent to analytics. The only
          place they appear in plain text is the notification email sent to me when you book.
        </p>
      </Section>

      <Section title="Who processes it for me">
        <p>[List your providers: e.g. hosting, database, email delivery (Resend), WhatsApp Business (Meta), scheduling/video provider. Name the country each stores data in.]</p>
      </Section>

      <Section title="Analytics">
        <p>
          This site uses privacy-friendly analytics ([Plausible or Umami]) that set no cookies and do not track you across sites. Events counted: clicks on
          &ldquo;Apply&rdquo;, starting the form, reaching the calendar step and confirming a booking. No personal information is included.
        </p>
      </Section>

      <Section title="Keeping and deleting your data">
        <p>
          I keep booking details for [N months] after your call unless you become a client. You can have everything deleted at any time: use the &ldquo;Delete my
          data&rdquo; link in your confirmation email, or write to {content.site.email}. Deletion is permanent. You can also ask to see a copy of your data or
          correct it.
        </p>
      </Section>

      <Section title="Medical disclaimer">
        <p>{content.footer.disclaimer}</p>
      </Section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="wide text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}
