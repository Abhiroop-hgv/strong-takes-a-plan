import { ImageResponse } from "next/og";
import { content } from "@/content";

export const alt = `${content.site.coachName} | Online Fitness Coaching`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#F4F5F2", color: "#101214", padding: 72 }}>
        <div style={{ fontSize: 28, letterSpacing: 4, color: "#B3260C" }}>1:1 ONLINE COACHING</div>
        <div style={{ fontSize: 148, fontWeight: 800, lineHeight: 0.95, letterSpacing: -4 }}>STRONG TAKES A PLAN.</div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 32 }}>
          <span>{content.site.coachName}</span>
          <span style={{ background: "#D22F11", color: "#fff", padding: "12px 32px", borderRadius: 999 }}>Free 20-minute call</span>
        </div>
      </div>
    ),
    size,
  );
}
