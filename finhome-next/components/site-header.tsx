"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { img } from "@/lib/images";
import { NAV_ITEMS, CTA_LABEL, CTA_HREF, LOGO } from "@/content/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-4/20 bg-white/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center" aria-label="FinHome">
          <img
            src={img(LOGO.header)}
            alt="FinHome"
            className="h-7 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-ink-2 transition-colors hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button href={CTA_HREF}>{CTA_LABEL}</Button>
        </div>

        <button
          type="button"
          aria-label="Mở menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-ink/5 md:hidden"
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
      </Container>

      {open && (
        <div className="border-t border-ink-4/20 bg-white/95 backdrop-blur-md md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-sm text-ink-2 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2">
              <Button href={CTA_HREF} className="w-full">
                {CTA_LABEL}
              </Button>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
