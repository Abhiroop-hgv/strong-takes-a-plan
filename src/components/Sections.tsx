import Image from "next/image";
import { content } from "@/content";
import { ApplyLink } from "./ApplyLink";
import { CountUp } from "./CountUp";
import { Reveal } from "./Motion";
import { Placeholder } from "./Placeholder";
import {
  BadgeIcon,
  ChatIcon,
  ClockIcon,
  DocumentIcon,
  InstagramIcon,
  SlidersIcon,
  TiktokIcon,
  TrendingIcon,
  WhatsappIcon,
  YoutubeIcon,
} from "./Icons";

/* ---------- 3. Proof strip ---------- */
export function ProofStrip() {
  return (
    <section aria-label="Results at a glance" className="border-y border-line bg-ground">
      <div className="wrap grid gap-8 py-10 sm:grid-cols-3 lg:gap-12 lg:py-14">
        {content.stats.map((s) => (
          <div key={s.label}>
            <div className="font-mono text-[32px] font-medium leading-[1.1] text-accent-text lg:text-[64px]">
              <CountUp value={s.value} />
            </div>
            <div className="text-base text-muted">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- 4. Philosophy ---------- */
export function Philosophy() {
  const p = content.philosophy;
  return (
    <section id="method" className="bg-tint">
      <div className="wrap section grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="flex flex-col gap-8 lg:gap-10">
          <Reveal className="flex flex-col gap-5">
            <div className="label text-muted">{p.label}</div>
            <h2 className="h-section">{p.headline}</h2>
          </Reveal>
          <ol className="flex flex-col gap-7">
            {p.beliefs.map((b, i) => (
              <Reveal as="li" key={b.title} delay={i * 0.06} className="flex gap-6">
                <span className="font-mono text-lg text-muted">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div className="text-[22px] font-bold">{b.title}</div>
                  <p className="text-[#3f443f]">{b.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
        <div className="mx-auto w-full max-w-[520px]">
          {p.imageSrc ? (
            <Image src={p.imageSrc} alt={p.imageAlt} width={800} height={1000} sizes="(min-width: 1024px) 520px, 90vw" className="aspect-[4/5] w-full rounded-card object-cover" />
          ) : (
            <Placeholder ratio="4 / 5">{p.placeholderText}</Placeholder>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- 6. Roadmap ---------- */
const stepIcons = { document: DocumentIcon, chat: ChatIcon, sliders: SlidersIcon, clock: ClockIcon, trending: TrendingIcon };

export function Roadmap() {
  const r = content.roadmap;
  return (
    <section id="how" className="border-y border-line bg-surface">
      <div className="wrap section flex flex-col gap-12 lg:gap-[72px]">
        <Reveal className="flex flex-col items-start gap-5 lg:items-center lg:text-center">
          <div className="label text-accent-text">{r.label}</div>
          <h2 className="h-section max-w-[820px]">{r.headline}</h2>
        </Reveal>

        <ol className="relative flex flex-col gap-10 lg:gap-14">
          <div
            aria-hidden="true"
            className="absolute bottom-7 left-7 top-7 w-1 -translate-x-1/2 bg-line lg:bottom-11 lg:left-1/2 lg:top-11"
          />
          {r.steps.map((s, i) => {
            const Icon = stepIcons[s.icon];
            const right = i % 2 === 1;
            return (
              <Reveal as="li" key={s.title} className="relative grid grid-cols-[56px_1fr] items-center gap-x-5 lg:grid-cols-[1fr_88px_1fr] lg:gap-x-10">
                <div
                  className="z-10 flex h-14 w-14 items-center justify-center rounded-full border-[6px] border-surface bg-accent text-white shadow-[0_0_0_2px_var(--accent)] lg:col-start-2 lg:row-start-1 lg:h-[88px] lg:w-[88px] lg:border-8"
                  aria-hidden="true"
                >
                  <Icon size={28} />
                </div>
                <div
                  className={`flex flex-col gap-2 lg:row-start-1 ${
                    right ? "lg:col-start-3 lg:text-left" : "lg:col-start-1 lg:items-end lg:text-right"
                  }`}
                >
                  <div className="font-mono text-[13px] tracking-[0.12em] text-accent-text">
                    STEP {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="wide text-[22px] font-bold leading-[1.15] lg:text-[28px]">{s.title}</h3>
                  <p className="max-w-[420px] text-base text-muted lg:text-[17px]">{s.text}</p>
                </div>
              </Reveal>
            );
          })}
        </ol>

        <div className="mx-auto w-full max-w-[1000px]">
          {r.mediaSrc ? (
            <Image src={r.mediaSrc} alt={r.mediaAlt} width={1600} height={900} sizes="(min-width: 1024px) 1000px, 90vw" className="aspect-video w-full rounded-card object-cover" />
          ) : (
            <Placeholder ratio="16 / 9">{r.placeholderText}</Placeholder>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- 7. Meet your coach ---------- */
export function Coach() {
  const c = content.coach;
  return (
    <section id="about" className="bg-ground">
      <div className="wrap section grid items-center gap-12 lg:grid-cols-[minmax(0,520px)_1fr] lg:gap-20">
        <div className="w-full max-w-[520px]">
          {c.imageSrc ? (
            <Image src={c.imageSrc} alt={c.imageAlt} width={800} height={1000} sizes="(min-width: 1024px) 520px, 90vw" className="aspect-[4/5] w-full rounded-card object-cover" />
          ) : (
            <Placeholder ratio="4 / 5">{c.placeholderText}</Placeholder>
          )}
        </div>
        <Reveal className="flex flex-col items-start gap-6">
          <div className="label text-accent-text">{c.label}</div>
          <h2 className="h-section">{c.headline}</h2>
          {c.paragraphs.map((t) => (
            <p key={t} className="max-w-[560px]">
              {t}
            </p>
          ))}
          <p className="font-mono text-sm text-muted">{c.credentials}</p>
          <ApplyLink where="coach" className="btn btn-primary">
            {c.cta}
          </ApplyLink>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- 8. Qualifications ---------- */
export function Qualifications() {
  const q = content.qualifications;
  return (
    <section id="credentials" className="border-y border-line bg-tint">
      <div className="wrap section flex flex-col gap-12">
        <Reveal className="flex max-w-[820px] flex-col gap-5">
          <div className="label text-accent-text">{q.label}</div>
          <h2 className="h-section">{q.headline}</h2>
          <p className="text-muted">{q.sentence}</p>
        </Reveal>
        <ul className="grid gap-6 lg:grid-cols-3">
          {q.items.map((it, i) => (
            <Reveal as="li" key={it.tag} delay={i * 0.06} className="card flex flex-col gap-4 p-6 lg:p-8">
              {it.imageSrc ? (
                <Image src={it.imageSrc} alt={it.imageAlt} width={800} height={600} sizes="(min-width: 1024px) 400px, 90vw" className="aspect-[4/3] w-full rounded-[16px] object-cover" />
              ) : (
                <Placeholder ratio="4 / 3" rounded="rounded-[16px]">
                  {q.placeholderText}
                </Placeholder>
              )}
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white">
                  <BadgeIcon size={20} />
                </span>
                <span className="font-mono text-[13px] tracking-[0.12em] text-accent-text">{it.tag}</span>
              </div>
              <h3 className="wide text-xl font-bold leading-[1.2] lg:text-2xl">{it.name}</h3>
              <div className="font-mono text-sm font-medium text-muted">{it.issuerYear}</div>
              <a href={it.verifyHref} className="text-[15px] font-semibold text-accent-text underline-offset-4 hover:underline">
                Verify: {it.verifyLabel} →
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- 11. Recipes ---------- */
export function Recipes() {
  const r = content.recipes;
  const allHref = r.allHref.includes("[") ? "#recipes" : r.allHref;
  return (
    <section id="recipes" className="bg-ground">
      <div className="wrap section flex flex-col gap-10 lg:gap-12">
        <Reveal className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="flex max-w-[760px] flex-col gap-5">
            <div className="label text-accent-text">{r.label}</div>
            <h2 className="h-section">{r.headline}</h2>
            <p className="text-muted">{r.sentence}</p>
          </div>
          <a href={allHref} className="btn btn-secondary btn-sm shrink-0">
            {r.allLabel}
          </a>
        </Reveal>
        <ul className="hide-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-0">
          {r.items.map((it, i) => (
            <li key={i} className="card lift w-[78%] shrink-0 snap-start overflow-hidden sm:w-[55%] lg:w-auto">
              {it.imageSrc ? (
                <Image src={it.imageSrc} alt={it.imageAlt} width={800} height={600} sizes="(min-width: 1024px) 420px, 78vw" className="aspect-[4/3] w-full object-cover" />
              ) : (
                <Placeholder ratio="4 / 3" rounded="rounded-none">
                  {r.placeholderText}
                </Placeholder>
              )}
              <div className="flex flex-col gap-3 p-6">
                <div className="flex gap-2">
                  {it.tags.map((t, j) => (
                    <span key={j} className="rounded-full border border-outline px-3 py-0.5 font-mono text-xs">
                      {t}
                    </span>
                  ))}
                </div>
                <h3 className="wide text-lg font-bold lg:text-xl">{it.name}</h3>
                <div className="font-mono text-sm text-muted">{it.macros}</div>
                <a href={it.href} className="text-[15px] font-semibold text-accent-text underline-offset-4 hover:underline">
                  See the recipe →
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- 12. Follow along ---------- */
const socialIcons = { INSTAGRAM: InstagramIcon, YOUTUBE: YoutubeIcon, TIKTOK: TiktokIcon, WHATSAPP: WhatsappIcon };

export function Follow() {
  const f = content.follow;
  return (
    <section id="follow" className="border-y border-line bg-surface">
      <div className="wrap section flex flex-col gap-10 lg:gap-12">
        <Reveal className="flex max-w-[760px] flex-col gap-5">
          <div className="label text-accent-text">{f.label}</div>
          <h2 className="h-section">{f.headline}</h2>
          <p className="text-muted">{f.sentence}</p>
        </Reveal>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {f.items.map((s, i) => {
            const Icon = socialIcons[s.platform];
            return (
              <Reveal as="li" key={s.platform} delay={i * 0.05} className="contents">
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card lift flex flex-col gap-3 bg-ground p-6"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white">
                    <Icon size={24} />
                  </span>
                  <span className="font-mono text-[13px] tracking-[0.12em] text-muted">{s.platform}</span>
                  <span className="wide text-lg font-bold">{s.handle}</span>
                  <span className="text-[15px] text-muted">{s.line}</span>
                </a>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ---------- 15. Footer ---------- */
export function Footer() {
  const f = content.footer;
  return (
    <footer className="border-t border-line bg-ground pb-24 lg:pb-0">
      <div className="wrap flex flex-col items-start justify-between gap-6 py-12 text-sm text-muted lg:flex-row lg:items-center">
        <div className="wide text-lg font-extrabold text-ink">{content.site.coachName}</div>
        <ul className="flex flex-wrap gap-6">
          {f.links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="hover:text-ink"
                {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="max-w-[420px]">{f.disclaimer}</p>
      </div>
    </footer>
  );
}
