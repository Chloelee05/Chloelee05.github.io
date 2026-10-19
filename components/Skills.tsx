"use client";

import { Reveal, SectionLabel, SplitLines } from "./Reveal";
import { skills } from "@/lib/content";

const spans = [
  "lg:col-span-7 lg:row-span-2",
  "lg:col-span-5",
  "lg:col-span-5",
  "lg:col-span-6",
  "lg:col-span-6",
];

export function Skills() {
  return (
    <section id="skills" className="relative scroll-mt-10 border-t border-line bg-white px-5 py-28 sm:px-8 md:py-44 lg:px-[8%]">
      <div className="mx-auto max-w-[90rem]">
        <SectionLabel index="04" label="CAPABILITIES" />
        <SplitLines className="display mt-12 text-[clamp(2.2rem,5.6vw,5.4rem)] lg:mt-20" lines={["The toolkit", "behind the work."]} />

        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:mt-24 lg:grid-cols-12 lg:gap-4">
          {skills.map((cat, i) => (
            <Reveal key={cat.title} delay={(i % 3) * 0.08} className={`${spans[i]} ${i === 4 ? "sm:col-span-2" : ""}`}>
              <div className="group relative h-full overflow-hidden rounded-[1.75rem] border border-line bg-paper p-6 transition-[border-color,background-color] duration-700 ease-premium hover:border-ink/25 hover:bg-white sm:p-8">
                {/* hover wash */}
                <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-ice opacity-0 blur-3xl transition-opacity duration-1000 group-hover:opacity-80" />
                <div className="relative flex items-start justify-between">
                  <h3 className="text-xl tracking-tight sm:text-2xl">{cat.title}</h3>
                  <span className="eyebrow">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <ul className={`relative mt-8 flex flex-wrap gap-2 ${i === 0 ? "lg:mt-24" : ""}`}>
                  {cat.items.map((item) => (
                    <li
                      key={item}
                      className={`cursor-default rounded-full border border-line bg-white px-4 py-2 text-sm tracking-tight transition-all duration-500 ease-premium hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-white ${i === 0 ? "lg:px-6 lg:py-3 lg:text-lg" : ""}`}
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
