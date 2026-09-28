/**
 * The simplified site navigation (2026-09-27, local preview).
 *
 * Server-rendered markup in the plain `node` runner, plus the pure disclosure
 * transitions the header applies on click / Escape / outside click / link
 * choice. There is no jsdom here, so a real key press, focus movement or
 * pointer event is NOT exercised: `navMenuTransition` is the logic those
 * handlers call, and the browser pass has to confirm the wiring.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PRIMARY_NAV, UTILITY_NAV, type NavGroup } from "@/content/site";

const nav = vi.hoisted(() => ({ path: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => nav.path }));

import { navMenuTransition, SiteHeader } from "@/components/site-header";

const render = (path: string) => {
  nav.path = path;
  return renderToStaticMarkup(createElement(SiteHeader));
};

const groups = PRIMARY_NAV.filter((e): e is NavGroup => e.kind === "group");
const tools = groups.find((g) => g.id === "cong-cu")!;
const about = groups.find((g) => g.id === "ve-finhome")!;

/** The markup of one element by id, bounded by its own tag nesting. */
function elementById(html: string, id: string): string {
  const start = html.indexOf(`id="${id}"`);
  if (start < 0) return "";
  const open = html.lastIndexOf("<", start);
  const tag = /^<([a-z]+)/.exec(html.slice(open))![1];
  let depth = 0;
  const re = new RegExp(`<${tag}\\b|</${tag}>`, "g");
  re.lastIndex = open;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    depth += m[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return html.slice(open, m.index + m[0].length);
  }
  return "";
}

/** The desktop `<nav>` only. */
const desktopNav = (html: string) => elementById(html, "finhome-primary-nav");

beforeEach(() => {
  nav.path = "/";
});

describe("the primary order", () => {
  it("is Công cụ, Bài viết, Về FinHome — with Hỗ trợ as a secondary link after it", () => {
    expect(PRIMARY_NAV.map((e) => e.label)).toEqual(["Công cụ", "Bài viết", "Về FinHome"]);
    expect(UTILITY_NAV).toEqual([{ label: "Hỗ trợ", href: "#hotro" }]);
    const html = render("/cong-cu/");
    const order = ["Công cụ", "Bài viết", "Về FinHome", "Hỗ trợ"].map((l) => html.indexOf(`>${l}<`));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    // Hỗ trợ is outside the primary <nav>.
    expect(desktopNav(html)).not.toContain(">Hỗ trợ<");
  });

  it("links Bài viết directly to the blog, not through a disclosure", () => {
    const html = desktopNav(render("/"));
    expect(html).toMatch(/<a\b[^>]*href="\/blog\/?"[^>]*>Bài viết<\/a>/);
  });
});

describe("the disclosures", () => {
  it("are buttons with aria-expanded and aria-controls, pointing at a hidden panel", () => {
    const html = render("/blog/");
    for (const group of groups) {
      const panelId = `finhome-nav-${group.id}`;
      const trigger = new RegExp(
        `<button[^>]*aria-expanded="false"[^>]*aria-controls="${panelId}"[^>]*>`,
      );
      expect(html, group.label).toMatch(trigger);
      const panel = elementById(html, panelId);
      expect(panel, group.label).not.toBe("");
      // Closed ⇒ `hidden` ⇒ display:none ⇒ its links are not in the tab order.
      expect(panel.slice(0, panel.indexOf(">"))).toMatch(/\shidden=""/);
    }
  });

  it("renders every closed child link ONLY inside a hidden panel", () => {
    const html = render("/blog/");
    const hiddenPanels = [...groups.map((g) => `finhome-nav-${g.id}`), ...groups.map((g) => `finhome-mobile-nav-${g.id}`)]
      .map((id) => elementById(html, id));
    let outside = html;
    for (const panel of hiddenPanels) {
      expect(panel.slice(0, panel.indexOf(">"))).toMatch(/\shidden=""/);
      outside = outside.replace(panel, "");
    }
    for (const link of tools.links) {
      expect(outside, link.href).not.toContain(link.href.replace(/\/$/, ""));
    }
    expect(outside).not.toContain("/vision");
  });

  it("uses no application-menu ARIA for ordinary links", () => {
    const html = render("/");
    expect(html).not.toMatch(/role="(menu|menubar|menuitem)"/);
  });

  it("offers a small set of real tools and the full catalogue last", () => {
    expect(tools.links.length).toBeGreaterThanOrEqual(3);
    expect(tools.links.length).toBeLessThanOrEqual(6);
    expect(tools.allLink).toEqual({ label: "Tất cả công cụ", href: "/cong-cu/" });
    const panel = elementById(render("/"), "finhome-nav-cong-cu");
    expect(panel.lastIndexOf("Tất cả công cụ")).toBeGreaterThan(
      panel.lastIndexOf(tools.links[tools.links.length - 1].label),
    );
  });
});

describe("hash destinations", () => {
  it("stay same-page on the homepage and become /#section elsewhere", () => {
    const home = render("/");
    const blog = render("/blog/");
    for (const link of about.links.filter((l) => l.href.startsWith("#"))) {
      expect(home).toContain(`href="${link.href}"`);
      expect(blog).toContain(`href="/${link.href}"`);
    }
    expect(home).toContain('href="#hotro"');
    expect(blog).toContain('href="/#hotro"');
  });
});

describe("the tool CTA", () => {
  it("is not on calculator detail routes, the tool hub or the blog", () => {
    for (const path of ["/cong-cu/vay-mua-xe/", "/cong-cu/", "/blog/", "/vision/"]) {
      expect(render(path), path).not.toContain("Thử ngay");
    }
  });

  it("stays on the homepage as the tools shortcut, saying 'Mở công cụ' up front", () => {
    const html = render("/");
    // Visible WITHOUT hover: the header no longer uses the Thử ngay → Mở công
    // cụ swap, so the only label rendered is the descriptive one.
    expect(html).not.toContain("Thử ngay");
    expect(html).toMatch(/<a\b[^>]*href="\/cong-cu\/?"[^>]*>[\s\S]*?Mở công cụ/);
    expect(html).toMatch(/href="\/cong-cu\/?"/);
  });
});

describe("active states", () => {
  it("marks Công cụ and the exact tool on a calculator route", () => {
    const html = render("/cong-cu/vay-mua-xe/");
    expect(html).toMatch(/<button[^>]*data-active="true"[^>]*aria-controls="finhome-nav-cong-cu"/);
    expect(elementById(html, "finhome-nav-cong-cu")).toMatch(
      /<a[^>]*aria-current="page"[^>]*href="\/cong-cu\/vay-mua-xe\/?"|<a[^>]*href="\/cong-cu\/vay-mua-xe\/?"[^>]*aria-current="page"/,
    );
    expect(html).not.toMatch(/<button[^>]*data-active="true"[^>]*aria-controls="finhome-nav-ve-finhome"/);
  });

  it("marks Bài viết as the page on /blog/ and as the section on an article", () => {
    expect(desktopNav(render("/blog/"))).toMatch(/aria-current="page"[^>]*>Bài viết</);
    expect(desktopNav(render("/blog/some-article/"))).toMatch(/aria-current="true"[^>]*>Bài viết</);
  });

  it("marks Về FinHome and Tầm nhìn & sứ mệnh on /vision/", () => {
    const html = render("/vision/");
    expect(html).toMatch(/<button[^>]*data-active="true"[^>]*aria-controls="finhome-nav-ve-finhome"/);
    expect(elementById(html, "finhome-nav-ve-finhome")).toMatch(/aria-current="page"[^>]*>[\s\S]*Tầm nhìn &amp; sứ mệnh/);
  });

  it("does not mark Công cụ on a non-tool route", () => {
    expect(render("/blog/")).not.toMatch(/data-active="true"[^>]*aria-controls="finhome-nav-cong-cu"/);
  });
});

describe("desktop panels on a short viewport", () => {
  it("cap their height to the viewport and scroll inside themselves", () => {
    const html = render("/");
    for (const group of groups) {
      const panel = elementById(html, `finhome-nav-${group.id}`);
      const openTag = panel.slice(0, panel.indexOf(">"));
      expect(openTag, group.id).toMatch(/max-h-\[calc\(100dvh-/);
      expect(openTag, group.id).toContain("overflow-y-auto");
      expect(openTag, group.id).toContain("overscroll-contain");
    }
  });
});

describe("mobile menu", () => {
  it("is a hamburger with aria-expanded/aria-controls over a hidden, scrollable panel", () => {
    const html = render("/cong-cu/");
    expect(html).toMatch(/<button[^>]*aria-expanded="false"[^>]*aria-controls="finhome-mobile-menu"/);
    const menu = elementById(html, "finhome-mobile-menu");
    const openTag = menu.slice(0, menu.indexOf(">"));
    expect(openTag).toMatch(/\shidden=""/);
    expect(openTag).toContain("overflow-y-auto");
    expect(openTag).toMatch(/max-h-\[/);
  });

  it("keeps the same primary order, then Hỗ trợ, with accordion buttons", () => {
    const menu = elementById(render("/cong-cu/"), "finhome-mobile-menu");
    const order = ["Công cụ", "Bài viết", "Về FinHome", "Hỗ trợ"].map((l) => menu.indexOf(`>${l}<`));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    for (const group of groups) {
      expect(menu).toMatch(
        new RegExp(`<button[^>]*aria-expanded="false"[^>]*aria-controls="finhome-mobile-nav-${group.id}"`),
      );
    }
    // 44 px touch targets on the rows.
    expect(menu).toContain("min-h-11");
  });
});

describe("app mode", () => {
  it("keeps the site-chrome marker on the white-pill shell on every route", () => {
    for (const path of ["/", "/blog/", "/cong-cu/vay-mua-xe/"]) {
      expect(render(path), path).toContain('data-finhome-site-chrome="header"');
    }
  });
});

describe("the shared white-pill header (every public route, 2026-09-28)", () => {
  // Home, the blog index, an education article, the tool hub, a calculator,
  // the vision page and a legal page: ONE header, the former homepage one.
  const ROUTES = ["/", "/blog/", "/blog/mua-nha-bang-con-so/", "/cong-cu/", "/cong-cu/vay-mua-xe/", "/vision/", "/privacy-policy/"];

  it("floats a centred WHITE pill on the light-GRAY shell, with even space above and below", () => {
    // App semantic tokens (finhome_reactnative theme, read-only):
    // bg #F2F2F7 → shell, surface #FFFFFF → pill, border #E5E5EA → pill edge.
    for (const path of ROUTES) {
      const html = render(path);
      expect(html, path).toMatch(/<header class="[^"]*bg-header-shell/);
      expect(html, path).toMatch(/rounded-full[^"]*border-header-border[^"]*bg-header-surface/);
      // 56 px pill; 16 px above/below on mobile, 24 px from xl.
      expect(html, path).toContain("h-14");
      expect(html, path).toContain('class="container-fh py-4 xl:py-6"');
      // The in-flow spacer is EXACTLY shell + pill + shell, so nothing collides.
      expect(html, path).toContain('class="relative h-[88px] xl:h-[104px]" data-finhome-site-chrome="header"');
    }
    expect(16 + 56 + 16).toBe(88);
    expect(24 + 56 + 24).toBe(104);
  });

  it("insets Hỗ trợ from the pill's right edge like the logo's left, but keeps the homepage CTA and mobile hamburger at 7px", () => {
    const pill = (path: string) => /<div class="([^"]*rounded-full[^"]*bg-header-surface[^"]*)"/.exec(render(path))![1].split(" ");
    for (const path of ROUTES) {
      const classes = pill(path);
      // Logo inset on the left, and the unchanged base (mobile / md) right inset.
      expect(classes, path).toContain("pl-5");
      expect(classes, path).toContain("pr-[7px]");
      if (path === "/") {
        // The homepage ends with the CTA pill, which needs the tight 7px inset.
        expect(classes, path).not.toContain("xl:pr-5");
      } else {
        // Off the homepage desktop ends with the Hỗ trợ text link.
        expect(classes, path).toContain("xl:pr-5");
      }
    }
  });

  it("does not bring back the old floating capsule anywhere", () => {
    for (const path of ROUTES) {
      const html = render(path);
      for (const old of ["h-[87px]", "pt-[37px]", "bg-transparent", "h-[50px]", "shadow-[0_1px_20px_rgba(0,0,0,0.03)]"]) {
        expect(html, `${path} ${old}`).not.toContain(old);
      }
    }
  });

  it("carries the same navigation, order, disclosures and homepage CTA", () => {
    const bar = render("/");
    for (const label of ["Công cụ", "Bài viết", "Về FinHome", "Hỗ trợ", "Mở công cụ"]) {
      expect(bar, label).toContain(`>${label}<`);
    }
    for (const id of ["finhome-nav-cong-cu", "finhome-nav-ve-finhome", "finhome-mobile-menu"]) {
      expect(bar, id).toContain(`aria-controls="${id}"`);
    }
    // The route semantics are unchanged: off the homepage the tools shortcut
    // stays away and hash links become /#section (tested above too).
    expect(render("/blog/")).not.toContain(">Mở công cụ<");
  });
});

describe("app mode (default header)", () => {
  it("keeps the site-chrome marker the native shell hides", () => {
    expect(render("/cong-cu/vay-mua-xe/")).toContain('data-finhome-site-chrome="header"');
  });
});

describe("navMenuTransition — what click, Escape, outside click and a link choice do", () => {
  const closed = { mobileOpen: false, expanded: null };

  it("toggles one desktop disclosure at a time", () => {
    const a = navMenuTransition(closed, { type: "toggleGroup", id: "cong-cu" });
    expect(a.state).toEqual({ mobileOpen: false, expanded: "cong-cu" });
    const b = navMenuTransition(a.state, { type: "toggleGroup", id: "ve-finhome" });
    expect(b.state.expanded).toBe("ve-finhome");
    expect(navMenuTransition(b.state, { type: "toggleGroup", id: "ve-finhome" }).state).toEqual(closed);
  });

  it("closes an open disclosure on Escape and returns focus to its trigger", () => {
    const r = navMenuTransition({ mobileOpen: false, expanded: "cong-cu" }, { type: "escape" });
    expect(r.state).toEqual(closed);
    expect(r.focus).toEqual({ kind: "trigger", id: "cong-cu" });
  });

  it("closes the mobile menu on Escape and returns focus to the hamburger", () => {
    const r = navMenuTransition({ mobileOpen: true, expanded: "ve-finhome" }, { type: "escape" });
    expect(r.state).toEqual(closed);
    expect(r.focus).toEqual({ kind: "hamburger" });
  });

  it("does nothing on Escape when nothing is open", () => {
    expect(navMenuTransition(closed, { type: "escape" })).toEqual({ state: closed, focus: null });
  });

  it("closes everything on an outside click or a link choice, without moving focus", () => {
    for (const type of ["outside", "navigate"] as const) {
      const r = navMenuTransition({ mobileOpen: true, expanded: "cong-cu" }, { type });
      expect(r).toEqual({ state: closed, focus: null });
    }
  });

  it("collapses any accordion when the mobile menu closes", () => {
    const r = navMenuTransition({ mobileOpen: true, expanded: "cong-cu" }, { type: "toggleMobile" });
    expect(r.state).toEqual(closed);
    expect(navMenuTransition(closed, { type: "toggleMobile" }).state).toEqual({ mobileOpen: true, expanded: null });
  });
});
