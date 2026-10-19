import type { Project } from "@/lib/content";

/** Abstract, clearly-marked placeholder art. NOT a screenshot of the product. */
export function ProjectVisual({ variant }: { variant: Project["variant"] }) {
  const stroke = "#9aa3ad";
  return (
    <svg viewBox="0 0 640 480" className="absolute inset-0 h-full w-full" aria-hidden preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id={`g-${variant}`} cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#dcecf8" />
          <stop offset="1" stopColor="#b8bfc7" />
        </radialGradient>
        <linearGradient id={`l-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cdd4db" />
        </linearGradient>
      </defs>
      {variant === "rings" && (
        <g fill="none" stroke={stroke} strokeWidth="1">
          {[40, 80, 120, 160, 200, 240].map((r, i) => (
            <ellipse key={r} cx="320" cy="240" rx={r * 1.5} ry={r * 0.55 + i * 6} opacity={1 - i * 0.12} transform={`rotate(${-18 + i * 3} 320 240)`} />
          ))}
          <circle cx="320" cy="240" r="58" fill={`url(#g-rings)`} stroke="none" />
          <circle cx="302" cy="222" r="14" fill="#fff" stroke="none" opacity=".8" />
        </g>
      )}
      {variant === "planes" && (
        <g stroke={stroke} strokeWidth="1">
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={`M${180 + i * 12} ${300 - i * 34} l140 -70 l140 70 l-140 70 z`}
              fill={i === 4 ? `url(#l-planes)` : "#ffffff"}
              fillOpacity={i === 4 ? 1 : 0.55}
            />
          ))}
          <path d="M320 156 V90" strokeDasharray="3 5" />
          <circle cx="320" cy="84" r="6" fill="#dcecf8" />
        </g>
      )}
      {variant === "orbit" && (
        <g fill="none" stroke={stroke} strokeWidth="1">
          <circle cx="320" cy="240" r="190" strokeDasharray="2 6" />
          <circle cx="320" cy="240" r="130" />
          <circle cx="320" cy="240" r="70" fill={`url(#g-orbit)`} stroke="none" />
          <circle cx="450" cy="240" r="9" fill="#fff" />
          <circle cx="228" cy="334" r="6" fill="#dcecf8" />
          <circle cx="320" cy="50" r="5" fill="#fff" />
          <path d="M130 240 H510 M320 50 V430" opacity=".5" />
        </g>
      )}
    </svg>
  );
}
