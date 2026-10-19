"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { Reveal, SectionLabel, SplitLines } from "./Reveal";
import { about } from "@/lib/content";

export function About() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rot = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const rise = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : 60, reduce ? 0 : -60]);

  return (
    <section id="about" ref={ref} className="relative scroll-mt-10 px-5 py-28 sm:px-8 md:py-44 lg:px-[8%]">
      <div className="mx-auto max-w-[90rem]">
        <SectionLabel index="01" label="ABOUT" />

        <div className="mt-12 grid gap-14 lg:mt-20 lg:grid-cols-12 lg:gap-8">
          <SplitLines
            className="display text-[clamp(2.2rem,5.6vw,5.4rem)] lg:col-span-8"
            lines={["Building intelligent", "systems that", "make an impact."]}
          />

          {/* chrome ring ornament */}
          <motion.div
            aria-hidden
            style={{ rotate: rot, y: rise }}
            className="relative hidden aspect-square w-40 justify-self-end lg:col-span-4 lg:block xl:w-56"
          >
            <div className="chrome absolute inset-0 rounded-full" />
            <div className="absolute inset-[14%] rounded-full bg-paper shadow-[inset_0_8px_24px_rgba(17,17,17,0.18)]" />
            <div className="absolute inset-[34%] rounded-full bg-ice/70 ring-1 ring-white" />
          </motion.div>

          <div className="lg:col-span-5 lg:col-start-1 lg:row-start-2">
            <Reveal>
              <p className="eyebrow mb-4">Profile</p>
              {about.body.map((p, i) => (
                <p key={i} className="mb-5 max-w-[34rem] text-[1.05rem] leading-[1.7] text-mute last:mb-0 sm:text-lg">
                  {i === 0 ? (
                    <>
                      I&apos;m a <span className="text-ink">Computer Science graduate</span> from the{" "}
                      <span className="text-ink">University of Wollongong</span> with a double specialization in{" "}
                      <span className="text-ink">Big Data</span> and <span className="text-ink">Cybersecurity</span>.
                    </>
                  ) : (
                    p
                  )}
                </p>
              ))}
            </Reveal>
          </div>

          <div className="lg:col-span-5 lg:col-start-8 lg:row-start-2">
            <Reveal delay={0.1}>
              <p className="eyebrow mb-4">Practical experience</p>
              <ul className="border-t border-line">
                {about.practice.map((item, i) => (
                  <li
                    key={item}
                    className="group flex items-center justify-between border-b border-line py-4 text-lg tracking-tight transition-[padding] duration-500 ease-premium hover:pl-3"
                  >
                    <span>{item}</span>
                    <span className="eyebrow transition-colors group-hover:text-ink">{String(i + 1).padStart(2, "0")}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>

        {/* proof strip — only genuine figures */}
        <dl className="mt-20 grid grid-cols-2 border-y border-line lg:mt-32 lg:grid-cols-4">
          {about.facts.map((f, i) => (
            <Reveal key={f.label} delay={i * 0.08} className={`px-0 py-8 lg:px-8 ${i % 2 === 1 ? "pl-5 sm:pl-8" : ""} ${i > 0 ? "lg:border-l lg:border-line" : ""} ${i === 1 ? "border-l border-line" : ""} ${i === 3 ? "border-l border-line" : ""} ${i > 1 ? "border-t border-line lg:border-t-0" : ""}`}>
              <dt className="order-2 mt-3 max-w-[11rem] text-[0.8rem] leading-snug text-mute">{f.label}</dt>
              <dd className="display text-[clamp(2.2rem,4.5vw,4rem)]">{f.value}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
