"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";

type NavChapter = { anchor: string; number: string; label: string };

/**
 * The five chapter links on the collection index.
 *
 * ANCHORS, NOT TABS. Every chapter is rendered on the page in full; these are
 * ordinary `href="#…"` links, so without JavaScript they still jump, the
 * browser's Back button returns through each jump, and nothing is hidden.
 * JavaScript only adds the current-location marker: it follows the URL hash
 * and, while scrolling, whichever chapter crosses the upper part of the
 * viewport. Smooth scrolling is the page's CSS, which turns itself off under
 * `prefers-reduced-motion`.
 */
export function ChapterNav({
  chapters,
  label,
}: {
  chapters: readonly NavChapter[];
  label: string;
}) {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const anchors = new Set(chapters.map((c) => c.anchor));
    const fromHash = () => {
      // Chapter anchors are plain ASCII, so the raw hash is compared as is;
      // decoding a malformed "%…" sequence would throw inside this effect.
      const hash = window.location.hash.slice(1);
      if (anchors.has(hash)) setCurrent(hash);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    // Older Safari has no IntersectionObserver; the hash marker still works.
    if (typeof IntersectionObserver === "undefined") {
      return () => window.removeEventListener("hashchange", fromHash);
    }

    // A band across the upper third of the viewport: the chapter whose
    // section overlaps it is the one being read.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setCurrent(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    for (const { anchor } of chapters) {
      const section = document.getElementById(anchor);
      if (section) observer.observe(section);
    }
    return () => {
      window.removeEventListener("hashchange", fromHash);
      observer.disconnect();
    };
  }, [chapters]);

  return (
    <nav aria-label={label} className="relative mt-6 md:mt-7">
      <ol
        className={cn(
          // Scrolls sideways on a narrow screen instead of widening the page;
          // the fade at the right edge shows there is more to reach.
          "-mx-5 flex gap-7 overflow-x-auto px-5 pb-px [scrollbar-width:none] sm:-mx-8 sm:px-8 md:mx-0 md:gap-10 md:overflow-visible md:px-0 lg:gap-11",
          "max-md:[mask-image:linear-gradient(to_right,#000_85%,transparent)] max-md:pr-12",
        )}
      >
        {chapters.map((chapter) => {
          const active = current === chapter.anchor;
          return (
            <li key={chapter.anchor} className="shrink-0">
              <a
                href={`#${chapter.anchor}`}
                aria-current={active ? "location" : undefined}
                className={cn(
                  "group inline-flex min-h-11 items-center gap-2.5 border-b-2 text-[15px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green md:text-base",
                  FH_POINTER,
                  active
                    ? "border-brand-green-ink text-ink"
                    : "border-transparent text-ink-2 hover:text-ink",
                )}
              >
                <span
                  className={cn(
                    "font-bold tabular-nums",
                    active ? "text-brand-green-ink" : "text-ink-3",
                  )}
                >
                  {chapter.number}
                </span>
                <span className="whitespace-nowrap">{chapter.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
      <div aria-hidden="true" className="border-t border-ink-4/40" />
    </nav>
  );
}
