"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";
import { Button } from "@/components/ui/button";
import { img } from "@/lib/images";
import {
  NAV_ITEMS,
  CTA_HOVER_LABEL,
  CTA_LABEL,
  CTA_HREF,
  LOGO,
} from "@/content/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-transparent">
      <Container className="pt-[37px]">
        <div className="mx-auto flex h-[50px] max-w-[1076px] items-center justify-between rounded-full bg-white pl-5 pr-[7px] shadow-[0_1px_20px_rgba(0,0,0,0.03)]">
        <Link href="/" className={cn("flex items-center", FH_POINTER)} aria-label="FinHome">
          <img
            src={img(LOGO.header)}
            alt="FinHome"
            className="h-auto w-[104px] md:w-[116px]"
          />
        </Link>

        <div className="hidden items-center gap-9 lg:flex">
          <nav className="flex items-center gap-[34px]">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "font-display text-[17px] font-medium text-ink-2/80 transition-colors hover:text-ink",
                  FH_POINTER,
                )}
              >
                {item.label}
              </a>
            ))}
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
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-3 text-sm text-ink-2 transition-colors hover:bg-ink/5 hover:text-ink",
                  FH_POINTER,
                )}
              >
                {item.label}
              </a>
            ))}
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
  );
}
