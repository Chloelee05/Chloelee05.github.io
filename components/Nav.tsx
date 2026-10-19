"use client";

import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navItems, profile } from "@/lib/content";

export function Nav() {
  const [active, setActive] = useState<string>("home");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const els = navItems.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:pt-5">
      <motion.nav
        aria-label="Primary"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto w-full max-w-[44rem] overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/65 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_10px_40px_-18px_rgba(17,17,17,0.18)] ring-1 ring-line/80 backdrop-blur-xl md:rounded-full"
      >
        <div className="flex h-12 items-center justify-between pl-5 pr-1.5">
          <a href="#home" className="flex items-center gap-2 text-[0.8125rem] font-semibold tracking-[0.04em]" aria-label="Hae Eun — home">
            <span aria-hidden className="chrome h-2.5 w-2.5 rounded-full ring-1 ring-ink/10" />
            {profile.wordmark}
          </a>

          <ul className="hidden items-center md:flex">
            {navItems.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  aria-current={active === n.id ? "true" : undefined}
                  className={`relative block rounded-full px-3.5 py-2 text-[0.78rem] transition-colors duration-300 ${
                    active === n.id ? "text-ink" : "text-mute hover:text-ink"
                  }`}
                >
                  {active === n.id && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-white shadow-[0_0_0_1px_#eaeaea,0_4px_14px_-6px_rgba(17,17,17,0.18)]"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  )}
                  <span className="relative">{n.label}</span>
                </a>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full text-ink md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.ul
              id="mobile-menu"
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden md:hidden"
            >
              {navItems.map((n, i) => (
                <motion.li
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.04 }}
                  className="border-t border-line/80"
                >
                  <a
                    href={`#${n.id}`}
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 items-center justify-between px-5 text-base tracking-tight"
                  >
                    <span className={active === n.id ? "text-ink" : "text-mute"}>{n.label}</span>
                    <span className="eyebrow">{String(i + 1).padStart(2, "0")}</span>
                  </a>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  );
}
