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
    <section id="contact" className="relative scroll-mt-10 overflow-hidden border-t border-line px-5 pt-28 sm:px-8 md:pt-44 lg:px-[8%]">
      {/* soft ice horizon */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ice/60 to-transparent" />
      <WaveLines className="inset-x-0 top-0 h-3/4 opacity-60" />
      <div className="relative mx-auto max-w-[90rem]">
        <ChromeAccent variant="saturn" className="absolute right-0 top-24 hidden h-72 w-72 md:block lg:h-[26rem] lg:w-[26rem]" />
        <SectionLabel index="05" label="CONTACT" />
        <SplitLines
          className="display mt-12 text-[clamp(3rem,10.5vw,10.5rem)] lg:mt-20"
          lines={["Let's Build", <span key="n" className="text-mute">What&apos;s Next.</span>]}
        />
        <Reveal className="mt-8 max-w-md text-lg leading-relaxed text-mute">
          Open to meaningful engineering opportunities and collaborations.
        </Reveal>

        <ul className="mt-16 border-t border-ink/80 lg:mt-24">
          {links.map((l, i) => (
            <Reveal key={l.label} delay={i * 0.08}>
              <li className="border-b border-line">
                <div className="flex items-center">
                  <a
                    href={l.href}
                    {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group relative flex min-h-[4.5rem] flex-1 flex-col justify-center gap-1 overflow-hidden py-4 sm:flex-row sm:items-center sm:gap-10 sm:py-7"
                  >
                    <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 bg-white transition-transform duration-700 ease-premium group-hover:scale-y-100" />
                    <span className="eyebrow relative w-28 shrink-0 sm:pl-0">{l.label}</span>
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
                      className="relative ml-2 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:border-ink"
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
          <div className="flex flex-col justify-between gap-3 border-t border-line/0 pb-6 sm:flex-row">
            <p className="eyebrow">© 2026 Hae Eun Lee — {profile.location}</p>
            <p className="eyebrow">AI &amp; Software Engineer</p>
          </div>
          <p aria-hidden className="display -mb-[0.14em] select-none whitespace-nowrap text-center text-[clamp(3rem,13.2vw,15rem)] leading-[0.8] tracking-[-0.06em] text-ink/[0.06]">
            HAE EUN LEE
          </p>
        </footer>
      </div>
    </section>
  );
}
