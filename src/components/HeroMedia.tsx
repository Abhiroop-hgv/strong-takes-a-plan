"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { content } from "@/content";

type Conn = { saveData?: boolean; effectiveType?: string };

/**
 * Poster first (it is the LCP element). The video only loads on a fast connection,
 * without Save-Data, and when reduced motion is off.
 */
export function HeroMedia() {
  const { posterSrc, posterAlt, videoMp4, videoWebm, placeholderText } = content.hero;
  const [playVideo, setPlayVideo] = useState(false);

  useEffect(() => {
    if (!videoMp4 && !videoWebm) return;
    const conn = (navigator as unknown as { connection?: Conn }).connection;
    const slow = conn?.saveData || (conn?.effectiveType && !["4g", "5g"].includes(conn.effectiveType));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!slow && !reduce) setPlayVideo(true);
  }, [videoMp4, videoWebm]);

  if (!posterSrc && !videoMp4 && !videoWebm) {
    return (
      <div
        role="img"
        aria-label={placeholderText}
        className="placeholder-box flex h-full min-h-[320px] w-full items-center justify-center p-6 text-center font-mono text-sm"
      >
        {placeholderText}
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden">
      {posterSrc && (
        <Image src={posterSrc} alt={posterAlt} fill priority sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" />
      )}
      {playVideo && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={posterSrc || undefined}
          aria-hidden="true"
        >
          {videoWebm && <source src={videoWebm} type="video/webm" />}
          {videoMp4 && <source src={videoMp4} type="video/mp4" />}
        </video>
      )}
    </div>
  );
}
