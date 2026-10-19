"use client";

import { ArrowUpRight, Check, Copy } from "lucide-react";
import { useState } from "react";
import { Reveal, SectionLabel, SplitLines } from "./Reveal";
import { profile } from "@/lib/content";
import { ChromeAccent } from "./ChromeAccent";
import { WaveLines } from "./WaveLines";

const links = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}`, external: false },
  { label: "GitHub", value: "github.com/Chloelee05", href: profile.github, external: true },
  { label: "LinkedIn", value: "linkedin.com/in/hae-eun-lee-169baa2b2", href: profile.linkedin, external: true },
];

export function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <section id="contact" className="relative scroll-mt-10 overflow-hidden bg-[#050607] px-5 pt-28 text-white sm:px-8 md:pt-44 lg:px-[8%]">
      <WaveLines stroke="#5d6772" className="inset-x-0 top-0 h-full opacity-40" />

      <div className="relative mx-auto max-w-[90rem]">
        <SectionLabel index="05" label="CONTACT" dark />

        {/* stage: chrome thorn frame + chrome web behind the headline */}
        <div className="relative mt-10 lg:mt-16">
          <ChromeAccent tone="dark" variant="frame" className="absolute -inset-x-4 -inset-y-6 z-0 hidden md:block lg:-inset-x-10 lg:-inset-y-10" />
          <ChromeAccent tone="dark" variant="web" className="absolute -bottom-6 -right-8 z-0 h-72 w-80 opacity-90 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:-right-6 md:h-[30rem] md:w-[34rem] lg:-right-24 lg:h-[34rem] lg:w-[38rem]" />

          <div className="relative z-10 pb-64 pt-10 md:pb-24 md:pt-24 md:px-14 lg:px-24 lg:py-32">
            <SplitLines
              className="display text-[clamp(3rem,10.5vw,10.5rem)]"
              lines={["Let's Build", <span key="n" className="text-mute">What&apos;s Next.</span>]}
            />
            <Reveal className="mt-8 max-w-md text-lg leading-relaxed text-mute">
              Open to meaningful engineering opportunities and collaborations.
            </Reveal>
          </div>
        </div>

        <ul className="mt-16 border-t border-white/70 lg:mt-24">
          {links.map((l, i) => (
            <Reveal key={l.label} delay={i * 0.08}>
              <li className="border-b border-white/15">
                <div className="flex items-center">
                  <a
                    href={l.href}
                    {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group relative flex min-h-[4.5rem] flex-1 flex-col justify-center gap-1 overflow-hidden py-4 sm:flex-row sm:items-center sm:gap-10 sm:py-7"
                  >
                    <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 bg-white/[0.07] transition-transform duration-700 ease-premium group-hover:scale-y-100" />
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

        {/* oversized footer */}
        <footer className="mt-24 lg:mt-36">
          <div className="flex flex-col justify-between gap-3 pb-6 sm:flex-row">
            <p className="eyebrow">© 2026 Hae Eun Lee — {profile.location}</p>
            <p className="eyebrow">AI &amp; Software Engineer</p>
          </div>
          <p aria-hidden className="display -mb-[0.14em] select-none whitespace-nowrap text-center text-[clamp(3rem,13.2vw,15rem)] leading-[0.8] tracking-[-0.06em] text-white/[0.07]">
            HAE EUN LEE
          </p>
        </footer>
      </div>
    </section>
  );
}
