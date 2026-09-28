"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/cn";
import { FH_POINTER } from "@/lib/interaction-styles";
import { useActiveSection } from "@/lib/use-active-section";
import { Button } from "@/components/ui/button";

import {
  PRIMARY_NAV, UTILITY_NAV, NAV_LINKS, type NavGroup,
  CTA_HOVER_LABEL,
  type NavLink,
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

// Only home-page hash links participate in section observation.

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

  /*
   * THE 2026-09-27 SIMPLIFIED NAVIGATION starts here.
   *
   * Everything ABOVE this comment keeps its line position on purpose:
   * `scripts/check-lint-baseline.mjs` keys two pre-existing
   * `react-hooks/set-state-in-effect` problems by LINE (52 and 83). Those are
   * preserved, not fixed — this change is the approved header, not a lint
   * cleanup — so new code goes below. The effect just above is also the
   * ROUTE-CHANGE close: a new pathname closes the mobile menu and any open
   * disclosure (`expandedNav` now serves both, since the desktop row and the
   * mobile panel are never shown at the same width).
   */
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>());

  /*
   * Escape and outside click, only while something is open. The transition
   * itself is `navMenuTransition` below, which the tests exercise; this only
   * wires it to the document and moves focus where it says.
   */
  useEffect(() => {
    if (!open && expandedNav === null) return;
    const run = (action: NavMenuAction) => {
      const next = navMenuTransition({ mobileOpen: open, expanded: expandedNav }, action);
      setOpen(next.state.mobileOpen);
      setExpandedNav(next.state.expanded);
      if (next.focus?.kind === "hamburger") menuButtonRef.current?.focus();
      if (next.focus?.kind === "trigger") {
        triggerRefs.current.get(next.focus.id)?.focus();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") run({ type: "escape" });
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      // Inside an open disclosure, its trigger, the hamburger or the mobile
      // panel is not "outside".
      if (target instanceof Element && target.closest("[data-nav-keep-open]")) return;
      run({ type: "outside" });
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, expandedNav]);

  /** Close everything after a link is chosen — a same-page hash changes no route. */
  const chose = () => {
    setOpen(false);
    setExpandedNav(null);
  };
  const toggleGroup = (id: string) =>
    setExpandedNav((current) => (current === id ? null : id));

  const linkCurrent = (href: string, exactOnly = false) =>
    href.startsWith("#")
      ? onHome && activeId === sectionIdFromHref(href)
        ? "true"
        : undefined
      : pathCurrent(href, pathname, exactOnly);

  const groupActive = (group: NavGroup) =>
    group.activePaths.some((path) => pathCurrent(path, pathname) !== undefined) ||
    (onHome && activeId !== null && (group.activeSections ?? []).includes(activeId));

  const primaryClass = (active: boolean) =>
    cn(
      "font-display text-[17px] font-medium transition-colors",
      FH_POINTER,
      active ? "text-ink" : "text-ink-2/80 hover:text-ink",
    );

  /** One destination; a path goes through `Link`, a homepage hash is a plain anchor. */
  const destination = (
    link: NavLink,
    className: string,
    content: React.ReactNode,
    exactOnly = false,
  ) => {
    const current = linkCurrent(link.href, exactOnly);
    return link.href.startsWith("#") ? (
      <a
        href={resolveNavHref(link.href, pathname)}
        className={className}
        aria-current={current}
        onClick={chose}
      >
        {content}
      </a>
    ) : (
      <Link href={link.href} className={className} aria-current={current} onClick={chose}>
        {content}
      </Link>
    );
  };

  return (
    // THE shared header on every public route (2026-09-28; homepage-only
    // from 2026-09-27): a centred WHITE pill (56 px) on the light-GRAY shell
    // — the page's own `page-bg`, aliased as `header-shell`, so it is
    // continuous with the page — with the same space above and below it:
    // 16 px on mobile, 24 px from xl. The in-flow spacer is EXACTLY that
    // height (88 / 104 px), so content starts below it with no collision; the
    // shell stays opaque so the fixed-on-scroll-up header covers the page.
    // The spacing is our choice, not a platform mandate. The old transparent
    // floating capsule is gone; navigation, disclosures, keyboard and
    // app-mode behaviour are unchanged.
    <div className="relative h-[88px] xl:h-[104px]" data-finhome-site-chrome="header">
      <header
        ref={headerRef}
        className={cn(
          "inset-x-0 top-0 z-50 bg-header-shell",
          // Upstream ebee1dc: the re-shown header slides in, motion-safe only.
          fixed ? "fixed motion-safe:animate-[fh-header-in_180ms_ease-out]" : "absolute",
        )}
      >
        <Container className="py-4 xl:py-6">
          <div className={`relative mx-auto flex h-14 max-w-[1076px] items-center justify-between rounded-full border border-header-border bg-header-surface pl-5 pr-[7px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] md:max-xl:justify-center${onHome ? "" : " xl:pr-5"}`}>
            <Link
              href={onHome ? "#trangchu" : "/"}
              className={cn("flex items-center", FH_POINTER)}
              aria-label="finhome.group"
              onClick={(e) => {
                if (!onHome) return;
                e.preventDefault();
                chose();
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
                src={LOGO.header}
                alt="finhome.group"
                className="block h-[19px] w-auto md:h-5"
              />
            </Link>

            <div className="hidden items-center gap-7 xl:flex">
              <nav
                id="finhome-primary-nav"
                aria-label="Điều hướng chính"
                className="flex items-center gap-[34px]"
              >
                {PRIMARY_NAV.map((entry) => {
                  if (entry.kind === "link") {
                    const current = linkCurrent(entry.href);
                    return (
                      <Link
                        key={entry.href}
                        href={entry.href}
                        className={primaryClass(current !== undefined)}
                        aria-current={current}
                      >
                        {entry.label}
                      </Link>
                    );
                  }
                  const expanded = expandedNav === entry.id;
                  const panelId = `finhome-nav-${entry.id}`;
                  return (
                    <div
                      key={entry.id}
                      className="relative"
                      data-nav-keep-open=""
                      // Tabbing out of an open disclosure closes it.
                      onBlur={(event) => {
                        const next = event.relatedTarget;
                        if (next instanceof Node && event.currentTarget.contains(next)) return;
                        setExpandedNav((current) => (current === entry.id ? null : current));
                      }}
                    >
                      <button
                        type="button"
                        data-active={groupActive(entry) ? "true" : undefined}
                        aria-expanded={expanded}
                        aria-controls={panelId}
                        ref={(element) => {
                          if (element) triggerRefs.current.set(entry.id, element);
                          else triggerRefs.current.delete(entry.id);
                        }}
                        onClick={() => toggleGroup(entry.id)}
                        className={cn(
                          primaryClass(groupActive(entry)),
                          "flex items-center gap-1 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-green-ink",
                        )}
                      >
                        {entry.label}
                        <Chevron open={expanded} />
                      </button>
                      {/* `hidden` while closed: display:none, so none of its
                          links is in the tab order or the accessibility tree. */}
                      <div
                        id={panelId}
                        hidden={!expanded}
                        // Capped to the viewport and scrolling inside itself,
                        // so the last link stays reachable on a short screen
                        // (e.g. 1280×500) — the same rule as the mobile panel.
                        className="absolute left-1/2 top-full z-50 mt-3 max-h-[calc(100dvh-7.5rem)] w-[360px] -translate-x-1/2 overflow-y-auto overscroll-contain rounded-2xl bg-white p-3 shadow-[0_16px_40px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.05]"
                      >
                        <ul className="space-y-0.5">
                          {entry.links.map((link) => (
                            <li key={link.href}>
                              {destination(
                                link,
                                cn(
                                  "block rounded-xl p-2.5 transition-colors hover:bg-bg-soft focus-visible:bg-bg-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-green-ink",
                                  FH_POINTER,
                                ),
                                <>
                                  <span className="block font-display text-[15px] font-medium text-ink">
                                    {link.label}
                                  </span>
                                  {link.description ? (
                                    <span className="mt-0.5 block text-[13px] leading-snug text-ink-2">
                                      {link.description}
                                    </span>
                                  ) : null}
                                </>,
                                true,
                              )}
                            </li>
                          ))}
                        </ul>
                        {entry.allLink ? (
                          <div className="mt-2 border-t border-ink-4/20 pt-2">
                            {destination(
                              entry.allLink,
                              cn(
                                "block rounded-xl p-2.5 font-display text-[15px] font-medium text-brand-green-ink transition-colors hover:bg-bg-soft focus-visible:bg-bg-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-green-ink",
                                FH_POINTER,
                              ),
                              entry.allLink.label,
                              true,
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </nav>
              {/* Secondary: support, set apart from the three primary entries. */}
              <ul className="flex items-center gap-5 border-l border-ink-4/30 pl-7">
                {UTILITY_NAV.map((link) => (
                  <li key={link.href}>
                    {destination(
                      link,
                      cn(
                        "text-[15px] transition-colors",
                        FH_POINTER,
                        linkCurrent(link.href) ? "text-ink" : "text-ink-2 hover:text-ink",
                      ),
                      link.label,
                    )}
                  </li>
                ))}
              </ul>
              {/* The tools shortcut on the HOMEPAGE only. Everywhere else the
                  "Công cụ" disclosure reaches the tools, and a calculator
                  route keeps its own "Xem kết quả" as its one action.
                  Labelled with what it DOES, visibly and without a hover
                  swap; the shared `CTA_LABEL` stays for the homepage steps. */}
              {onHome ? (
                <Button href={CTA_HREF} size="lg">
                  {CTA_HOVER_LABEL}
                </Button>
              ) : null}
            </div>

            <button
              ref={menuButtonRef}
              type="button"
              aria-label={open ? "Đóng menu" : "Mở menu"}
              aria-expanded={open}
              aria-controls="finhome-mobile-menu"
              data-nav-keep-open=""
              onClick={() => {
                const next = navMenuTransition(
                  { mobileOpen: open, expanded: expandedNav },
                  { type: "toggleMobile" },
                );
                setOpen(next.state.mobileOpen);
                setExpandedNav(next.state.expanded);
              }}
              className={cn(
                "-mr-1 inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink transition-colors hover:bg-ink/5 xl:hidden",
                "md:max-xl:absolute md:max-xl:right-[7px] md:max-xl:top-1/2 md:max-xl:-translate-y-1/2 md:max-xl:mr-0",
                FH_POINTER,
              )}
            >
              <span className="sr-only">Menu</span>
              {open ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>

          {/* MOBILE: the same three entries in the same order, then support.
              Scrolls inside itself on a short screen rather than running off
              it. `hidden` while closed, so nothing inside is focusable. */}
          <div
            id="finhome-mobile-menu"
            hidden={!open}
            data-nav-keep-open=""
            className="mt-2 max-h-[calc(100dvh-7.5rem)] overflow-y-auto overscroll-contain rounded-2xl bg-white/95 p-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04] backdrop-blur-md xl:hidden"
          >
            <nav aria-label="Điều hướng chính">
              <ul className="flex flex-col gap-1">
                {PRIMARY_NAV.map((entry) => {
                  if (entry.kind === "link") {
                    const current = linkCurrent(entry.href);
                    return (
                      <li key={entry.href}>
                        <Link
                          href={entry.href}
                          onClick={chose}
                          aria-current={current}
                          className={mobileRowClass(current !== undefined)}
                        >
                          {entry.label}
                        </Link>
                      </li>
                    );
                  }
                  const expanded = expandedNav === entry.id;
                  const panelId = `finhome-mobile-nav-${entry.id}`;
                  return (
                    <li key={entry.id}>
                      <button
                        type="button"
                        data-active={groupActive(entry) ? "true" : undefined}
                        aria-expanded={expanded}
                        aria-controls={panelId}
                        onClick={() => toggleGroup(entry.id)}
                        className={cn(
                          mobileRowClass(groupActive(entry)),
                          "w-full justify-between gap-2 text-left",
                        )}
                      >
                        {entry.label}
                        <Chevron open={expanded} />
                      </button>
                      <ul id={panelId} hidden={!expanded} className="pb-1 pl-3">
                        {[...entry.links, ...(entry.allLink ? [entry.allLink] : [])].map(
                          (link) => (
                            <li key={link.href}>
                              {destination(
                                link,
                                cn(
                                  "flex min-h-11 flex-col justify-center rounded-lg px-3 py-2 transition-colors hover:bg-ink/5",
                                  FH_POINTER,
                                  link === entry.allLink ? "text-brand-green-ink" : "text-ink-2",
                                ),
                                <>
                                  <span className="block text-sm">{link.label}</span>
                                  {link.description ? (
                                    <span className="mt-0.5 block text-xs text-ink-3">
                                      {link.description}
                                    </span>
                                  ) : null}
                                </>,
                                true,
                              )}
                            </li>
                          ),
                        )}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <ul className="mt-1 border-t border-ink-4/20 pt-1">
              {UTILITY_NAV.map((link) => (
                <li key={link.href}>
                  {destination(
                    link,
                    mobileRowClass(linkCurrent(link.href) !== undefined),
                    link.label,
                  )}
                </li>
              ))}
            </ul>
            {onHome ? (
              <div className="mt-2 px-1 pb-1">
                <Button href={CTA_HREF} className="w-full">
                  {CTA_HOVER_LABEL}
                </Button>
              </div>
            ) : null}
          </div>
        </Container>
      </header>
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
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
      focusable="false"
      className={cn(
        "mt-px shrink-0 text-ink-3 transition-transform duration-150",
        open && "rotate-180",
      )}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

/** A mobile row: at least 44 px tall, so it is a usable touch target. */
function mobileRowClass(active: boolean): string {
  return cn(
    "flex min-h-11 items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-ink/5",
    FH_POINTER,
    active ? "font-medium text-ink" : "text-ink-2 hover:text-ink",
  );
}

/** Every homepage section the header links to, observed for its active state. */
const SECTION_IDS = NAV_LINKS.filter((link) => link.href.startsWith("#")).map(
  (link) => sectionIdFromHref(link.href),
);

/**
 * `aria-current` for a path destination: `"page"` on that exact route,
 * `"true"` inside it (an article under "Bài viết"), else nothing.
 * `exactOnly` is for links INSIDE a panel, so the catalogue link and the tool
 * being viewed are not both marked current. Trailing slashes are ignored —
 * the export uses them, `usePathname` may not.
 */
function pathCurrent(
  href: string,
  pathname: string,
  exactOnly = false,
): "page" | "true" | undefined {
  const base = href.replace(/\/+$/, "") || "/";
  const here = pathname.replace(/\/+$/, "") || "/";
  if (here === base) return "page";
  if (!exactOnly && base !== "/" && here.startsWith(`${base}/`)) return "true";
  return undefined;
}

/** What the header's disclosures hold open. */
export type NavMenuState = { mobileOpen: boolean; expanded: string | null };

export type NavMenuAction =
  | { type: "toggleGroup"; id: string }
  | { type: "toggleMobile" }
  | { type: "escape" }
  | { type: "outside" }
  | { type: "navigate" };

/**
 * The disclosure behaviour, as a pure transition — what click, Escape,
 * outside click and a link choice do, and where focus goes.
 *
 * - One group open at a time; toggling the open one closes it.
 * - Escape closes the open disclosure and returns focus to ITS trigger; with
 *   the mobile menu open it closes the menu and returns focus to the
 *   hamburger. With nothing open it does nothing.
 * - An outside click or a chosen link closes everything and moves no focus.
 * - Closing the mobile menu collapses any accordion inside it.
 */
export function navMenuTransition(
  state: NavMenuState,
  action: NavMenuAction,
): {
  state: NavMenuState;
  focus: { kind: "trigger"; id: string } | { kind: "hamburger" } | null;
} {
  const closed: NavMenuState = { mobileOpen: false, expanded: null };
  switch (action.type) {
    case "toggleGroup":
      return {
        state: { ...state, expanded: state.expanded === action.id ? null : action.id },
        focus: null,
      };
    case "toggleMobile":
      return {
        state: state.mobileOpen ? closed : { mobileOpen: true, expanded: null },
        focus: null,
      };
    case "escape":
      if (state.mobileOpen) return { state: closed, focus: { kind: "hamburger" } };
      if (state.expanded !== null) {
        return { state: closed, focus: { kind: "trigger", id: state.expanded } };
      }
      return { state, focus: null };
    case "outside":
    case "navigate":
      return { state: closed, focus: null };
  }
}
