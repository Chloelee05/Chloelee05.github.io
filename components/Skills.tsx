"use client";

import dynamic from "next/dynamic";
import { Reveal, SectionLabel, SplitLines } from "./Reveal";
import { skills } from "@/lib/content";

const ChromeSea = dynamic(() => import("./ChromeSeaScene"), { ssr: false });

const spans = [
  "lg:col-span-7 lg:row-span-2",
  "lg:col-span-5",
  "lg:col-span-5",
  "lg:col-span-6",
  "lg:col-span-6",
];

export function Skills() {
  return (
    <section id="skills" className="relative isolate scroll-mt-10 overflow-hidden border-t border-line bg-[#eef0f3] px-5 py-28 sm:px-8 md:py-44 lg:px-[8%]">
      <div aria-hidden className="absolute inset-0 -z-10">
        <ChromeSea />
        {/* keep the headline zone bright; let the metal take over below */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-white via-white/80 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/70 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-[90rem]">
        <SectionLabel index="04" label="CAPABILITIES" />
        <SplitLines className="display mt-12 text-[clamp(2.2rem,5.6vw,5.4rem)] lg:mt-20" lines={["The toolkit", "behind the work."]} />

        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:mt-24 lg:grid-cols-12 lg:gap-4">
          {skills.map((cat, i) => (
            <Reveal key={cat.title} delay={(i % 3) * 0.08} className={`${spans[i]} ${i === 4 ? "sm:col-span-2" : ""}`}>
              <div className="group relative h-full overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/70 p-6 shadow-[0_20px_60px_-30px_rgba(20,24,32,0.45),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl backdrop-saturate-150 transition-[background-color,box-shadow] duration-700 ease-premium hover:bg-white/85 hover:shadow-[0_30px_80px_-30px_rgba(20,24,32,0.55),inset_0_1px_0_#fff] sm:p-8">
                <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-ice opacity-0 blur-3xl transition-opacity duration-1000 group-hover:opacity-80" />
                <div className="relative flex items-start justify-between">
                  <h3 className="text-xl tracking-tight sm:text-2xl">{cat.title}</h3>
                  <span className="eyebrow">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <ul className={`relative mt-8 flex flex-wrap gap-2 ${i === 0 ? "lg:mt-24" : ""}`}>
                  {cat.items.map((item) => (
                    <li
                      key={item}
                      className={`cursor-default rounded-full border border-ink/10 bg-white/90 px-4 py-2 text-sm tracking-tight transition-all duration-500 ease-premium hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-white ${i === 0 ? "lg:px-6 lg:py-3 lg:text-lg" : ""}`}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
