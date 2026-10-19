"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "motion/react";
import { Button } from "./Button";
import { SplitLines } from "./Reveal";
import { profile } from "@/lib/content";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

/** Static CSS orb: used while 3D loads, when WebGL is unavailable. */
function FallbackOrb() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div
        className="aspect-square w-[min(70%,26rem)] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 32% 28%, #fff 0%, #eaf3fb 22%, #c4cdd6 52%, #7f8893 78%, #dcecf8 100%)",
          boxShadow: "inset -20px -30px 60px rgba(17,17,17,0.12), 0 40px 80px -40px rgba(17,17,17,0.25)",
          animation: "orb-fallback 8s ease-in-out infinite",
        }}
      />
    </div>
  );
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [gl, setGl] = useState<boolean | null>(null);

  useEffect(() => {
    setGl(hasWebGL());
  }, []);

  // GSAP ScrollTrigger: text drifts up & fades as the hero hands over to the next section.
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.to(content.current, {
        yPercent: -14,
        opacity: 0.0,
        ease: "none",
        scrollTrigger: { trigger: section.current, start: "top top", end: "bottom 15%", scrub: true },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section id="home" ref={section} className="relative isolate min-h-[100svh] overflow-hidden">
      {/* 3D stage — right on desktop, behind headline on mobile */}
      <div className="absolute inset-x-0 top-[8svh] h-[42svh] lg:inset-y-0 lg:left-[32%] lg:right-0 lg:top-0 lg:h-auto">
        {gl === null ? <FallbackOrb /> : gl ? <HeroSceneWrap /> : <FallbackOrb />}
        {/* soft floor shadow */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-[10%] left-[58%] h-8 w-[30%] -translate-x-1/2 rounded-[50%] bg-ink/10 blur-2xl lg:bottom-[15%]"
        />
      </div>

      {/* architectural hairlines */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-[1] hidden lg:block">
        <div className="absolute inset-y-0 left-[8%] w-px bg-line/70" />
        <div className="absolute inset-y-0 right-[8%] w-px bg-line/70" />
        <div className="absolute inset-x-0 bottom-[14%] h-px bg-line/70" />
      </div>

      <div ref={content} className="relative z-10 mx-auto flex min-h-[100svh] max-w-[90rem] flex-col justify-end px-5 pb-8 pt-28 sm:px-8 lg:justify-center lg:px-[8%] lg:pb-24">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="eyebrow mb-6 lg:mb-8"
        >
          HAE EUN LEE — PORTFOLIO / 2026
        </motion.p>

        <SplitLines
          as="h1"
          delay={0.55}
          className="display text-[clamp(2.9rem,9.4vw,8.6rem)] lg:max-w-[62rem]"
          lines={["Engineering", "Intelligence.", <span key="d" className="text-mute">Designing</span>, <span key="p" className="text-mute">Possibilities.</span>]}
        />

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 max-w-[28rem] text-[0.98rem] leading-relaxed text-mute sm:text-base lg:mt-10"
        >
          AI &amp; Software Engineer specializing in intelligent systems, full-stack development, and scalable digital experiences.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <Button href="#projects">
            Explore My Work <ArrowDown size={15} className="transition-transform duration-500 group-hover:translate-y-0.5" />
          </Button>
          <Button href="#contact" variant="ghost">
            Get in Touch <ArrowUpRight size={15} className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Button>
        </motion.div>
      </div>

      {/* meta bar */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden items-end justify-between px-[8%] pb-7 lg:flex">
        <span className="eyebrow">{profile.location} · 1.3521° N, 103.8198° E</span>
        <span className="eyebrow flex items-center gap-3">
          Scroll
          <span aria-hidden className="relative block h-8 w-px overflow-hidden bg-line">
            <span className="absolute inset-0 bg-ink" style={{ animation: "scroll-cue 2.2s var(--ease-premium) infinite" }} />
          </span>
        </span>
      </div>
    </section>
  );
}

function HeroSceneWrap() {
  return <HeroScene />;
}
