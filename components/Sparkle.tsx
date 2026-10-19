import { useId } from "react";

/** Chrome four-point sparkle glyph. */
export function Sparkle({ size = 14, className = "" }: { size?: number; className?: string }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className={className}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.35" stopColor="#8f98a2" />
          <stop offset="0.6" stopColor="#f3f5f7" />
          <stop offset="1" stopColor="#6e7882" />
        </linearGradient>
      </defs>
      <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0Z" fill={`url(#${id})`} />
    </svg>
  );
}
