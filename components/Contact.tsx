"use client";

import dynamic from "next/dynamic";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { useRef, useState } from "react";
import { Reveal, SectionLabel, SplitLines } from "./Reveal";
import { profile } from "@/lib/content";

const LiquidChrome = dynamic(() => import("./LiquidChromeScene"), { ssr: false });

const links = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}`, external: false },
  { label: "GitHub", value: "github.com/Chloelee05", href: profile.github, external: true },
  { label: "LinkedIn", value: "linkedin.com/in/hae-eun-lee-169baa2b2", href: profile.linkedin, external: true },
];

const grain =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function Contact() {
  const section = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <section id="contact" ref={section} className="relative scroll-mt-10 overflow-hidden bg-[#050607] text-white">
      {/* ── stage: molten chrome sculpture ── */}
      <div className="relative h-[100svh] min-h-[640px] max-h-[1100px]">
        <LiquidChrome section={section} />

        {/* legibility + cinematic falloff */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050607] via-transparent to-[#050607]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050607] via-[#050607]/40 to-transparent md:bg-gradient-to-r md:from-[#050607]/90 md:via-[#050607]/30 md:to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay" style={{ backgroundImage: grain }} />

        <div className="relative z-10 mx-auto flex h-full max-w-[90rem] flex-col justify-between px-5 pb-12 pt-28 sm:px-8 md:pt-36 lg:px-[8%] lg:pb-20">
          <div className="flex items-start justify-between">
            <SectionLabel index="05" label="CONTACT" dark />
            <Reveal y={10} className="eyebrow hidden text-right md:block">
              {profile.location}
              <br />
              Open to opportunities
            </Reveal>
          </div>

          <div>
            <SplitLines
              className="display text-[clamp(3.2rem,10.5vw,10.5rem)] drop-shadow-[0_10px_40px_rgba(0,0,0,0.55)]"
              lines={["Let's Build", <span key="n" className="text-white/45">What&apos;s Next.</span>]}
            />
            <Reveal delay={0.2} className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <p className="max-w-md text-lg leading-relaxed text-white/60">
                Open to meaningful engineering opportunities and collaborations.
              </p>
              <a
                href={`mailto:${profile.email}`}
                className="group inline-flex h-14 w-fit items-center gap-3 rounded-full border border-white/25 bg-white/[0.06] px-7 text-sm tracking-tight backdrop-blur-md transition-colors duration-500 hover:border-white hover:bg-white hover:text-[#050607]"
              >
                Start a conversation
                <ArrowUpRight size={16} className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ── links + footer ── */}
      <div className="relative mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-[8%]">
        <ul className="border-t border-white/60">
          {links.map((l, i) => (
            <Reveal key={l.label} delay={i * 0.08}>
              <li className="border-b border-white/12">
                <div className="flex items-center">
                  <a
                    href={l.href}
                    {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group relative flex min-h-[4.5rem] flex-1 flex-col justify-center gap-1 overflow-hidden py-4 sm:flex-row sm:items-center sm:gap-10 sm:py-7"
                  >
                    <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 bg-gradient-to-r from-white/[0.08] via-white/[0.03] to-transparent transition-transform duration-700 ease-premium group-hover:scale-y-100" />
                    <span className="eyebrow relative w-28 shrink-0">{l.label}</span>
                    <span className="relative min-w-0 flex-1 break-words text-[clamp(1.1rem,3vw,2.6rem)] tracking-tight transition-transform duration-700 ease-premium group-hover:translate-x-3">
                      {l.value}
                    </span>
                    <ArrowUpRight className="relative mr-1 hidden shrink-0 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 sm:block" size={28} strokeWidth={1.25} />
                  </a>
                  {l.label === "Email" && (
                    <button
                      type="button"
                      onClick={copy}
                      aria-label="Copy email address"
                      className="relative ml-2 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/20 text-white transition-colors hover:border-white"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      <span role="status" className="sr-only">{copied ? "Email copied" : ""}</span>
                    </button>
                  )}
                </div>
              </li>
            </Reveal>
          ))}
        </ul>

        <footer className="mt-24 pb-6 lg:mt-36">
          <div className="flex flex-col justify-between gap-3 pb-6 sm:flex-row">
            <p className="eyebrow">© 2026 Hae Eun Lee — {profile.location}</p>
            <p className="eyebrow">AI &amp; Software Engineer</p>
          </div>
          <p aria-hidden className="chrome-text display select-none whitespace-nowrap pb-[0.12em] text-center text-[clamp(2.2rem,11.2vw,14rem)] leading-[0.85] tracking-[-0.06em] opacity-25">
            HAE EUN LEE
          </p>
        </footer>
      </div>
    </section>
  );
}
