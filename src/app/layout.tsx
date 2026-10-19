import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { content } from "@/content";
import { MotionProvider } from "@/components/Motion";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
  adjustFontFallback: true,
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-jetbrains",
  display: "swap",
});

const title = `${content.site.coachName} | Online Fitness Coaching`;
const description = content.site.description.slice(0, 155);

export const metadata: Metadata = {
  metadataBase: new URL(content.site.url),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", title, description, siteName: content.site.coachName },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#F4F5F2", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const plausible = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  return (
    <html lang="en" className={`${archivo.variable} ${mono.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-white"
        >
          Skip to content
        </a>
        <MotionProvider>{children}</MotionProvider>
        {plausible && (
          <Script defer data-domain={plausible} src="https://plausible.io/js/script.tagged-events.js" strategy="afterInteractive" />
        )}
      </body>
    </html>
  );
}
