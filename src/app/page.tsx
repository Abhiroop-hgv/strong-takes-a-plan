import { content } from "@/content";
import { Apply } from "@/components/Apply";
import { Faq, Fit, StickyBar, Testimonials } from "@/components/Interactive";
import { Hero } from "@/components/Hero";
import { Nav } from "@/components/Nav";
import { Results } from "@/components/Results";
import { Coach, Follow, Footer, Philosophy, ProofStrip, Qualifications, Recipes, Roadmap } from "@/components/Sections";

export default function Home() {
  const { site } = content;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: site.coachName,
        url: site.url,
        jobTitle: "Online fitness coach",
        description: site.description,
        sameAs: content.follow.items.filter((s) => s.platform !== "WHATSAPP").map((s) => s.href),
      },
      {
        "@type": "ProfessionalService",
        name: `${site.coachName} | Online Fitness Coaching`,
        url: site.url,
        description: site.description,
        areaServed: "Worldwide",
        provider: { "@type": "Person", name: site.coachName },
        serviceType: "1:1 online fitness coaching",
      },
    ],
  };

  return (
    <>
      <span id="top" />
      <Nav />
      <main id="main">
        <Hero />
        <ProofStrip />
        <Philosophy />
        <Results />
        <Roadmap />
        <Coach />
        <Qualifications />
        <Fit />
        <Testimonials />
        <Recipes />
        <Follow />
        <Faq />
        <Apply />
      </main>
      <Footer />
      <StickyBar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
