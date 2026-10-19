"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Reveal, SectionLabel, SplitLines } from "./Reveal";
import { experience } from "@/lib/content";

export function Experience() {
  const list = useRef<HTMLOListElement>(null);
  const line = useRef<HTMLSpanElement>(null);

  // GSAP ScrollTrigger: the timeline spine draws itself as you read.
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      gsap.set(line.current, { scaleY: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        line.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top",
          scrollTrigger: { trigger: list.current, start: "top 70%", end: "bottom 60%", scrub: 0.6 },
        },
      );
    }, list);
    return () => ctx.revert();
  }, []);

  return (
    <section id="experience" className="relative scroll-mt-10 border-t border-line bg-white px-5 py-28 sm:px-8 md:py-44 lg:px-[8%]">
      <div className="mx-auto max-w-[90rem]">
        <SectionLabel index="02" label="EXPERIENCE" />
        <SplitLines
          className="display mt-12 text-[clamp(2.2rem,5.6vw,5.4rem)] lg:mt-20"
          lines={["Where the work", "gets done."]}
        />

        <ol ref={list} className="relative mt-16 lg:mt-28">
          {/* spine */}
          <span aria-hidden className="absolute bottom-0 left-[7px] top-2 w-px bg-line lg:left-[calc(33.333%-1px)]" />
          <span ref={line} aria-hidden className="absolute bottom-0 left-[7px] top-2 w-px origin-top bg-ink lg:left-[calc(33.333%-1px)]" style={{ transform: "scaleY(0)" }} />

          {experience.map((job, i) => (
            <li key={job.company} className="relative grid gap-6 pb-16 pl-9 last:pb-0 lg:grid-cols-12 lg:gap-12 lg:pb-28 lg:pl-0">
              {/* node */}
              <span aria-hidden className="absolute left-0 top-1.5 grid h-[15px] w-[15px] place-items-center rounded-full border border-ink bg-white lg:left-[calc(33.333%-8px)]">
                <span className="h-1.5 w-1.5 rounded-full bg-ink" />
              </span>

              <Reveal className="lg:col-span-4 lg:pr-16">
                <p className="eyebrow">{String(i + 1).padStart(2, "0")} · {job.period}</p>
                <h3 className="display mt-4 text-[clamp(2rem,4vw,3.4rem)]">{job.company}</h3>
                <p className="mt-2 text-base text-mute">{job.role}</p>
              </Reveal>

              <Reveal delay={0.1} className="lg:col-span-8 lg:pl-8">
                <article className="group rounded-[1.75rem] border border-line bg-paper p-6 transition-[border-color,background-color,transform] duration-700 ease-premium hover:-translate-y-1 hover:border-ink/25 hover:bg-white sm:p-9">
                  <p className="text-xl leading-snug tracking-tight sm:text-2xl">{job.summary}</p>
                  <ul className="mt-7 space-y-3.5">
                    {job.bullets.map((b) => (
                      <li key={b} className="flex gap-4 text-[0.95rem] leading-relaxed text-mute">
                        <span aria-hidden className="mt-[0.7em] h-px w-4 shrink-0 bg-ink/40 transition-all duration-500 group-hover:w-6 group-hover:bg-ink" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <ul className="mt-8 flex flex-wrap gap-2" aria-label="Technologies">
                    {job.tags.map((t) => (
                      <li key={t} className="rounded-full border border-line bg-white px-3 py-1.5 font-mono text-[0.68rem] tracking-wide text-mute">
                        {t}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
