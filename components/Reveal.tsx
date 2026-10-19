"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.9, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

/** Masked line-by-line headline reveal. Each string is one visual line. */
export function SplitLines({
  lines,
  className,
  delay = 0,
  as: Tag = "h2",
}: {
  lines: ReactNode[];
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p";
}) {
  const reduce = useReducedMotion();
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
          <motion.span
            className="block"
            initial={reduce ? false : { y: "110%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 1.1, delay: delay + i * 0.1, ease }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

export function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <Reveal className="flex items-center gap-4" y={12}>
      <span className="eyebrow text-ink">
        {index} / {label}
      </span>
      <span aria-hidden className="h-px w-16 bg-line" />
    </Reveal>
  );
}
