"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";
import { useActiveSection } from "@/lib/use-active-section";
import { Button } from "@/components/ui/button";
import { img } from "@/lib/images";
import {
  NAV_ITEMS,
  CTA_HOVER_LABEL,
  CTA_LABEL,
  CTA_HREF,
  LOGO,
} from "@/content/site";

/** Hash links only work on the home page; elsewhere point at `/#section`. */
function resolveNavHref(href: string, pathname: string): string {
  if (!href.startsWith("#")) return href;
  const onHome = pathname === "/" || pathname === "";
  return onHome ? href : `/${href}`;
}

function sectionIdFromHref(href: string): string {
  return href.replace(/^#/, "");
}

const SECTION_IDS = NAV_ITEMS.map((item) => sectionIdFromHref(item.href));

const TOP_PX = 12;
const DIR_PX = 6;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  /** Which mobile-menu item's children are expanded (by href), if any. */
  const [expandedNav, setExpandedNav] = useState<string | null>(null);
  /**
   * Static at top and while scrolling down.
   * Fixed only while scrolling back up (toward top).
   */
  const [fixed, setFixed] = useState(false);
  const lastY = useRef(0);
  const pathname = usePathname() ?? "/";
  const onHome = pathname === "/" || pathname === "";
  const activeId = useActiveSection(onHome ? SECTION_IDS : []);

  useEffect(() => {
    lastY.current = window.scrollY;
    setFixed(false);

    const sync = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      lastY.current = y;

      // Resting at top → always static.
      if (y <= TOP_PX) {
        setFixed(false);
        return;
      }

      if (delta < -DIR_PX) {
        // Scrolling up / back toward top → fixed.
        setFixed(true);
      } else if (delta > DIR_PX) {
        // Scrolling down → static (scrolls away with page).
        setFixed(false);
        setOpen(false);
      }
    };

    window.addEventListener("scroll", sync, { passive: true });

    return () => {
      window.removeEventListener("scroll", sync);
    };
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
    setFixed(false);
    setExpandedNav(null);
  }, [pathname]);

  const navLinkClassName = (href: string, mobile = false) => {
    const isActive = activeId === sectionIdFromHref(href);
    if (mobile) {
      return cn(
        "rounded-lg px-3 py-3 text-sm transition-colors hover:bg-ink/5",
        FH_POINTER,
        isActive ? "text-ink" : "text-ink-2 hover:text-ink",
      );
    }
    return cn(
      "font-display text-[17px] font-medium transition-colors",
      FH_POINTER,
      isActive ? "text-ink" : "text-ink-2/80 hover:text-ink",
    );
  };

  return (
    <div className="relative h-[87px]">
      <header
        className={cn(
          "inset-x-0 top-0 z-50 bg-transparent",
          fixed ? "fixed" : "absolute",
        )}
      >
        <Container className="pt-[37px] pb-0">
          <div className="relative mx-auto flex h-[50px] max-w-[1076px] items-center justify-between rounded-full bg-white pl-5 pr-[7px] shadow-[0_1px_20px_rgba(0,0,0,0.03)] md:max-xl:justify-center">
            <Link
              href={onHome ? "#trangchu" : "/"}
              className={cn("flex items-center", FH_POINTER)}
              aria-label="FinHome"
              onClick={(e) => {
                if (!onHome) return;
                e.preventDefault();
                setOpen(false);
                setFixed(false);
                document
                  .getElementById("trangchu")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
                if (window.location.hash) {
                  history.replaceState(null, "", "/");
                }
              }}
            >
              <img
                src={img(LOGO.header)}
                alt="FinHome"
                className="h-auto w-[104px] md:w-[116px]"
              />
            </Link>

            <div className="hidden items-center gap-6 xl:flex xl:gap-9">
              <nav className="flex items-center gap-5 xl:gap-[34px]">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeId === sectionIdFromHref(item.href);
                  if (item.children?.length) {
                    return (
                      <div key={item.href} className="group relative">
                        <a
                          href={resolveNavHref(item.href, pathname)}
                          className={cn(
                            navLinkClassName(item.href),
                            "flex items-center gap-1",
                          )}
                          aria-current={isActive ? "true" : undefined}
                        >
                          {item.label}
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            className="mt-px text-ink-3 transition-transform duration-150 group-hover:rotate-180 group-focus-within:rotate-180"
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </a>
                        {/* Zero-gap hit area bridging the trigger and the panel, so the
                            pointer never leaves `.group` while moving toward it. Visibility
                            is never toggled — only opacity/pointer-events — so child links
                            stay tab-focusable even before hover/focus reveals the panel. */}
                        <div className="absolute left-1/2 top-full z-50 w-[360px] -translate-x-1/2 pt-3">
                          <div
                            className={cn(
                              "origin-top scale-95 rounded-2xl bg-white p-3 opacity-0 shadow-[0_16px_40px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.05] transition-[opacity,transform] duration-150 ease-out",
                              "pointer-events-none group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100",
                              "group-focus-within:pointer-events-auto group-focus-within:scale-100 group-focus-within:opacity-100",
                            )}
                          >
                            {item.eyebrow && (
                              <p className="px-2.5 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wide text-ink-3">
                                {item.eyebrow}
                              </p>
                            )}
                            {item.children.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={cn(
                                  "block rounded-xl p-2.5 outline-none transition-colors hover:bg-bg-soft focus-visible:bg-bg-soft",
                                  FH_POINTER,
                                )}
                              >
                                <span className="block font-display text-[15px] font-medium text-ink">
                                  {child.label}
                                </span>
                                <span className="mt-0.5 block text-[13px] leading-snug text-ink-2">
                                  {child.description}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <a
                      key={item.href}
                      href={resolveNavHref(item.href, pathname)}
                      className={navLinkClassName(item.href)}
                      aria-current={isActive ? "true" : undefined}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </nav>
              <Button href={CTA_HREF} size="lg" hoverLabel={CTA_HOVER_LABEL}>
                {CTA_LABEL}
              </Button>
            </div>

            <button
              type="button"
              aria-label="Mở menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className={cn(
                "-mr-1 inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-ink/5 xl:hidden",
                "md:max-xl:absolute md:max-xl:right-[7px] md:max-xl:top-1/2 md:max-xl:-translate-y-1/2 md:max-xl:mr-0",
                FH_POINTER,
              )}
            >
              <span className="sr-only">Menu</span>
              {open ? (
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>

          {open && (
            <div className="mt-2 flex flex-col gap-1 rounded-2xl bg-white/95 p-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04] backdrop-blur-md xl:hidden">
              {NAV_ITEMS.map((item) => {
                const isActive = activeId === sectionIdFromHref(item.href);
                return (
                  <div key={item.href}>
                    {item.children?.length ? (
                      <button
                        type="button"
                        aria-expanded={expandedNav === item.href}
                        onClick={() =>
                          setExpandedNav((v) =>
                            v === item.href ? null : item.href,
                          )
                        }
                        className={cn(
                          navLinkClassName(item.href, true),
                          "flex w-full items-center justify-between gap-2",
                        )}
                        aria-current={isActive ? "true" : undefined}
                      >
                        {item.label}
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className={cn(
                            "shrink-0 text-ink-3 transition-transform duration-150",
                            expandedNav === item.href && "rotate-180",
                          )}
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                    ) : (
                      <a
                        href={resolveNavHref(item.href, pathname)}
                        onClick={() => setOpen(false)}
                        className={navLinkClassName(item.href, true)}
                        aria-current={isActive ? "true" : undefined}
                      >
                        {item.label}
                      </a>
                    )}
                    {item.children?.length && expandedNav === item.href
                      ? item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "block rounded-lg p-2.5 pl-6 transition-colors hover:bg-ink/5",
                              FH_POINTER,
                            )}
                          >
                            <span className="block text-sm text-ink-2">
                              {child.label}
                            </span>
                            <span className="mt-0.5 block text-xs text-ink-3">
                              {child.description}
                            </span>
                          </Link>
                        ))
                      : null}
                  </div>
                );
              })}
              <div className="mt-1 px-1 pb-1">
                <Button
                  href={CTA_HREF}
                  className="w-full"
                  hoverLabel={CTA_HOVER_LABEL}
                >
                  {CTA_LABEL}
                </Button>
              </div>
            </div>
          )}
        </Container>
      </header>
    </div>
  );
}
