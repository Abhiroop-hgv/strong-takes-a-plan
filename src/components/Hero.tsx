import { content } from "@/content";
import { ApplyLink } from "./ApplyLink";
import { HeroMedia } from "./HeroMedia";
import { RiseWords } from "./Motion";

export function Hero() {
  const h = content.hero;
  return (
    <section id="hero" className="relative bg-surface lg:min-h-[760px]">
      {/* Media: on top on mobile, right 58% full height on desktop */}
      <div className="h-[320px] sm:h-[420px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[58%]">
        <HeroMedia />
      </div>
      <div className="wrap relative flex flex-col justify-center gap-6 pb-20 pt-10 lg:min-h-[760px] lg:gap-8 lg:pb-24 lg:pt-[120px]">
        <div className="label text-accent-text">{h.label}</div>
        <RiseWords
          text={h.headline}
          className="wide max-w-[760px] text-[44px] font-extrabold leading-[0.95] tracking-[-0.02em] lg:text-[112px]"
        />
        <p className="max-w-[520px] text-lg lg:text-xl">{h.sub}</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <ApplyLink where="hero" className="btn btn-primary">
            {h.cta}
          </ApplyLink>
          <span className="text-[15px] text-muted">{h.note}</span>
        </div>
        <div className="label absolute bottom-8 left-5 hidden text-xs text-muted lg:left-16 lg:block">SCROLL</div>
      </div>
    </section>
  );
}
