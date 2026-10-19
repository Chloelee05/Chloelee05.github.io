"use client";

import dynamic from "next/dynamic";
import type { AccentVariant } from "./ChromeAccentScene";

const Scene = dynamic(() => import("./ChromeAccentScene"), { ssr: false });

/** Decorative chrome 3D sculpture. Size/position are controlled by `className`. */
export function ChromeAccent({ variant, className = "" }: { variant: AccentVariant; className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none ${className.includes("absolute") ? "" : "relative"} ${className}`}>
      <Scene variant={variant} />
    </div>
  );
}
