"use client";

import { useState } from "react";
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

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "/";
  const onHome = pathname === "/" || pathname === "";
  const activeId = useActiveSection(onHome ? SECTION_IDS : []);

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
    <>
      <header className="fixed inset-x-0 top-0 z-50 bg-transparent">
        <Container className="pt-[37px]">
          <div className="mx-auto flex h-[50px] max-w-[1076px] items-center justify-between rounded-full bg-white pl-5 pr-[7px] shadow-[0_1px_20px_rgba(0,0,0,0.03)]">
            <Link
              href="/"
              className={cn("flex items-center", FH_POINTER)}
              aria-label="FinHome"
            >
              <img
                src={img(LOGO.header)}
                alt="FinHome"
                className="h-auto w-[104px] md:w-[116px]"
              />
            </Link>

            <div className="hidden items-center gap-9 lg:flex">
              <nav className="flex items-center gap-[34px]">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeId === sectionIdFromHref(item.href);
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
                "-mr-1 inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-ink/5 lg:hidden",
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
            <div className="mt-2 flex flex-col gap-1 rounded-2xl bg-white/95 p-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04] backdrop-blur-md lg:hidden">
              {NAV_ITEMS.map((item) => {
                const isActive = activeId === sectionIdFromHref(item.href);
                return (
                  <a
                    key={item.href}
                    href={resolveNavHref(item.href, pathname)}
                    onClick={() => setOpen(false)}
                    className={navLinkClassName(item.href, true)}
                    aria-current={isActive ? "true" : undefined}
                  >
                    {item.label}
                  </a>
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
      <div aria-hidden className="h-[87px]" />
    </>
  );
}
