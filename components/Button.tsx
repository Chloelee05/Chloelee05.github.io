import type { ReactNode } from "react";
import { Magnetic } from "./Magnetic";

export function Button({
  href,
  children,
  variant = "primary",
  external,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  external?: boolean;
}) {
  const base =
    "group relative inline-flex h-12 items-center gap-3 overflow-hidden rounded-full px-6 text-[0.8125rem] font-medium tracking-tight transition-colors duration-500";
  const styles =
    variant === "primary"
      ? "bg-ink text-white hover:bg-[#2a2a2a]"
      : "border border-ink/15 bg-white/60 text-ink backdrop-blur hover:border-ink/50";
  return (
    <Magnetic>
      <a
        href={href}
        className={`${base} ${styles}`}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    </Magnetic>
  );
}
