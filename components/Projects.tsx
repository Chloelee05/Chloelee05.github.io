"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { ProjectVisual } from "./ProjectVisual";
import { Reveal, SectionLabel, SplitLines } from "./Reveal";
import { projects, type Project } from "@/lib/content";

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const flip = index % 2 === 1;

  // subtle parallax on the artwork
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const artY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-36, 36]);
  const bigNum = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [50, -50]);

  // pointer tilt
  const rx = useSpring(0, { stiffness: 120, damping: 18 });
  const ry = useSpring(0, { stiffness: 120, damping: 18 });

  return (
    <article ref={ref} className="relative grid gap-10 py-16 lg:grid-cols-12 lg:items-center lg:gap-12 lg:py-28">
      {/* oversized index */}
      <motion.span
        aria-hidden
        style={{ y: bigNum }}
        className={`display pointer-events-none absolute top-6 select-none text-[clamp(8rem,22vw,20rem)] text-ink/[0.035] lg:top-1/2 lg:-translate-y-1/2 ${flip ? "right-0" : "left-0"}`}
      >
        {project.number}
      </motion.span>

      {/* visual */}
      <Reveal className={`relative lg:col-span-7 ${flip ? "lg:order-2" : ""}`} y={50}>
        <motion.div
          onPointerMove={(e) => {
            if (reduce || e.pointerType !== "mouse") return;
            const r = e.currentTarget.getBoundingClientRect();
            ry.set(((e.clientX - r.left) / r.width - 0.5) * 5);
            rx.set(-((e.clientY - r.top) / r.height - 0.5) * 5);
          }}
          onPointerLeave={() => {
            rx.set(0);
            ry.set(0);
          }}
          style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
          className="group relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-line bg-white sm:aspect-[16/11]"
        >
          <div aria-hidden className="grid-paper absolute inset-0 opacity-60" />
          <motion.div style={{ y: artY }} className="absolute inset-[-8%] transition-transform duration-[1400ms] ease-premium group-hover:scale-[1.04]">
            <ProjectVisual variant={project.variant} />
          </motion.div>

          {/* UI chrome */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-5">
            <span className="eyebrow rounded-full border border-line bg-white/80 px-3 py-1.5 backdrop-blur">Project {project.number}</span>
            <span className="eyebrow rounded-full border border-dashed border-silver bg-white/80 px-3 py-1.5 backdrop-blur">Placeholder</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 sm:p-5">
            <span className="eyebrow max-w-[14rem] text-[0.62rem] leading-relaxed">Visual placeholder — genuine screenshots to be supplied</span>
            <span aria-hidden className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white/80 backdrop-blur transition-all duration-500 group-hover:bg-ink group-hover:text-white">
              <ArrowUpRight size={16} />
            </span>
          </div>
        </motion.div>
      </Reveal>

      {/* copy */}
      <div className={`relative lg:col-span-5 ${flip ? "lg:order-1 lg:pr-8" : "lg:pl-8"}`}>
        <Reveal>
          <p className="eyebrow">{project.number} — {project.kicker}</p>
          <h3 className="display mt-4 text-[clamp(2.6rem,5.4vw,5rem)]">{project.title}</h3>
          <p className="mt-6 max-w-[30rem] text-[1.05rem] leading-relaxed text-mute sm:text-lg">{project.description}</p>
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="mt-8 flex flex-wrap gap-2" aria-label={`${project.title} technologies`}>
            {project.tech.map((t) => (
              <li key={t} className="rounded-full border border-line bg-white px-3 py-1.5 font-mono text-[0.68rem] tracking-wide text-ink/80">
                {t}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.18}>
          <p className="eyebrow mt-10">Key contributions</p>
          <ul className="mt-3 border-t border-line">
            {project.contributions.map((c, i) => (
              <li key={c} className="group/c flex gap-4 border-b border-line py-3.5 text-[0.95rem] leading-snug transition-[padding] duration-500 ease-premium hover:pl-2">
                <span className="font-mono text-[0.68rem] text-mute">{String(i + 1).padStart(2, "0")}</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {project.links.map((l) =>
              l.href ? (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="group/l inline-flex items-center gap-1.5 border-b border-ink pb-0.5 text-sm">
                  {l.label} <ArrowUpRight size={14} className="transition-transform group-hover/l:-translate-y-0.5 group-hover/l:translate-x-0.5" />
                </a>
              ) : (
                <span key={l.label} aria-disabled="true" className="inline-flex items-center gap-2 text-sm text-mute/80">
                  {l.label}
                  <span className="eyebrow rounded-full border border-dashed border-silver px-2 py-0.5 text-[0.58rem]">Link coming soon</span>
                </span>
              ),
            )}
          </div>
        </Reveal>
      </div>
    </article>
  );
}

export function Projects() {
  return (
    <section id="projects" className="relative scroll-mt-10 overflow-hidden border-t border-line px-5 py-28 sm:px-8 md:py-44 lg:px-[8%]">
      <div className="mx-auto max-w-[90rem]">
        <SectionLabel index="03" label="SELECTED WORK" />
        <div className="mt-12 flex flex-col justify-between gap-8 lg:mt-20 lg:flex-row lg:items-end">
          <SplitLines className="display text-[clamp(2.2rem,5.6vw,5.4rem)]" lines={["Selected", "work."]} />
          <Reveal className="max-w-xs text-[0.95rem] leading-relaxed text-mute">
            Three projects spanning conversational AI, full-stack platforms and applied machine intelligence.
          </Reveal>
        </div>
        <div className="mt-10 divide-y divide-line lg:mt-16">
          {projects.map((p, i) => (
            <ProjectRow key={p.title} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
