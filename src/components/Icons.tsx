import type { ReactNode } from "react";

type P = { size?: number; className?: string };

function Svg({ size = 24, className, children, sw = 1.8 }: P & { children: ReactNode; sw?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export const DocumentIcon = (p: P) => (
  <Svg {...p}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M9 8h6M9 12h6M9 16h3" />
  </Svg>
);
export const ChatIcon = (p: P) => (
  <Svg {...p}>
    <path d="M4 5h16v11H9l-5 4V5z" />
    <path d="M8 10h8M8 13h5" />
  </Svg>
);
export const SlidersIcon = (p: P) => (
  <Svg {...p}>
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="8" cy="17" r="2" />
  </Svg>
);
export const ClockIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);
export const TrendingIcon = (p: P) => (
  <Svg {...p}>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M15 7h6v6" />
  </Svg>
);
export const BadgeIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="9" r="6" />
    <path d="M8.5 14L7 21l5-3 5 3-1.5-7" />
  </Svg>
);
export const InstagramIcon = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
  </Svg>
);
export const YoutubeIcon = (p: P) => (
  <Svg {...p}>
    <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
    <path d="M10 9.5v5l4.5-2.5-4.5-2.5z" />
  </Svg>
);
export const TiktokIcon = (p: P) => (
  <Svg {...p}>
    <path d="M14 3v11.5a3.5 3.5 0 11-3.5-3.5" />
    <path d="M14 3c.4 2.6 2 4.2 5 4.5" />
  </Svg>
);
export const WhatsappIcon = (p: P) => (
  <Svg {...p}>
    <path d="M4 20l1.3-4.2A8 8 0 1112 20a8 8 0 01-3.9-1L4 20z" />
    <path d="M9 9c.2 2.4 2.6 4.8 6 6l1.2-1.4-2-1-1 .6c-.8-.4-1.6-1.2-2-2l.6-1-1-2L9 9z" />
  </Svg>
);
export const CheckIcon = (p: P) => (
  <Svg {...p} sw={2.4}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);
export const ArrowsIcon = (p: P) => (
  <Svg {...p} sw={2}>
    <path d="M8 6l-6 6 6 6M16 6l6 6-6 6" />
  </Svg>
);
export const CloseIcon = (p: P) => (
  <Svg {...p} sw={2}>
    <path d="M5 5l14 14M19 5L5 19" />
  </Svg>
);
