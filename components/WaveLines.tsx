"use client";

import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";

/** Flowing contour lines (white-line landing-page vibe). Pure SVG, deterministic, very light. */
export function WaveLines({
  className = "",
  lines = 38,
  flip = false,
}: {
  className?: string;
  lines?: number;
  flip?: boolean;
}) {
  const reduce = useReducedMotion();
  const paths = useMemo(
    () =>
      Array.from({ length: lines }, (_, i) => {
        const pts: string[] = [];
        for (let x = -40; x <= 1240; x += 20) {
          const y =
            300 +
            i * 7 +
            Math.sin(x / 190 + i * 0.16) * (70 + i * 2.4) +
            Math.sin(x / 90 - i * 0.1) * 18;
          pts.push(`${x === -40 ? "M" : "L"}${x},${y.toFixed(1)}`);
        }
        return pts.join(" ");
      }),
    [lines],
  );
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute ${className}`}
      style={{
        maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000 30%, transparent 78%)",
        WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000 30%, transparent 78%)",
        transform: flip ? "scaleX(-1)" : undefined,
      }}
    >
      <motion.svg
        viewBox="0 0 1200 700"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        animate={reduce ? undefined : { x: [0, -24, 0], y: [0, 10, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      >
        <g fill="none" stroke="#9aa3ad" strokeWidth="0.6">
          {paths.map((d, i) => (
            <path key={i} d={d} opacity={0.25 + (i / lines) * 0.5} />
          ))}
        </g>
      </motion.svg>
    </div>
  );
}
