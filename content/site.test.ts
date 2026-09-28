import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SiteFooter } from "@/components/site-footer";
import { FOOTER, NAV_LINKS, PRIMARY_NAV, UTILITY_NAV, type NavGroup } from "@/content/site";
import { getCalculator } from "@/content/calculators/registry";
import { readFileSync, readdirSync } from "node:fs";

const groupNamed = (label: string) =>
  PRIMARY_NAV.find((e): e is NavGroup => e.kind === "group" && e.label === label);

describe("site navigation", () => {
  // 2026-09-27 simplified navigation: "Tin tức" became "Bài viết" and the flat
  // seven-item list became three primary entries plus "Hỗ trợ". Each contract
  // below is the old one restated on the new shape, not dropped.
  it("opens the blog directly from a primary link instead of a homepage section", () => {
    expect(PRIMARY_NAV.filter((item) => item.label === "Bài viết")).toEqual([
      { kind: "link", label: "Bài viết", href: "/blog/" },
    ]);
    expect(existsSync(fileURLToPath(new URL("../app/blog/page.tsx", import.meta.url)))).toBe(true);
  });

  it("links the calculator suite from the main menu, and only to live tools", () => {
    const tools = groupNamed("Công cụ");
    expect(tools?.allLink).toEqual({ label: "Tất cả công cụ", href: "/cong-cu/" });
    for (const link of tools!.links) {
      const slug = /^\/cong-cu\/([a-z0-9-]+)\/$/.exec(link.href)?.[1];
      expect(slug, link.href).toBeDefined();
      expect(getCalculator(slug!)?.status, link.href).toBe("live");
      expect(
        existsSync(fileURLToPath(new URL(`../app/cong-cu/${slug}/page.tsx`, import.meta.url))),
        link.href,
      ).toBe(true);
    }
  });

  it("links the existing vision page from the Về FinHome group of the shared menu", () => {
    expect(NAV_LINKS.filter((item) => item.href === "/vision/")).toEqual([
      expect.objectContaining({ label: "Tầm nhìn & sứ mệnh", href: "/vision/" }),
    ]);
    expect(groupNamed("Về FinHome")?.links[0].href).toBe("/vision/");
    expect(existsSync(fileURLToPath(new URL("../app/vision/page.tsx", import.meta.url)))).toBe(true);
  });

  it("points every homepage hash in the menu at a section the homepage renders", () => {
    const sections = readdirSync(fileURLToPath(new URL("../components/sections/", import.meta.url)))
      .map((f) => readFileSync(fileURLToPath(new URL(`../components/sections/${f}`, import.meta.url)), "utf8"))
      .join("\n");
    const hashes = NAV_LINKS.filter((l) => l.href.startsWith("#")).map((l) => l.href.slice(1));
    // + the app section's heading anchor (navigation map N04, 2026-09-28).
    expect(hashes.sort()).toEqual(["app-download-title", "hotro", "nentang", "tinhnang", "trainghiem"]);
    for (const id of hashes) expect(sections, id).toContain(`id="${id}"`);
    expect(UTILITY_NAV.map((l) => l.href)).toEqual(["#hotro"]);
  });

  it("gives the company footer a real vision destination rather than a placeholder", () => {
    const company = FOOTER.columns.find((column) => column.title === "FinHome");
    expect(company?.links).toContainEqual({
      label: "Tầm nhìn & Sứ mệnh",
      href: "/vision/",
    });
    expect(company?.links.some((link) => link.href === "#")).toBe(false);
  });

  it("renders the vision footer link as a navigable anchor", () => {
    const html = renderToStaticMarkup(createElement(SiteFooter));
    // Next's isolated renderer may normalize the trailing slash; both forms
    // resolve to the same route. The production export is checked separately.
    expect(html).toMatch(/<a\b[^>]*href="\/vision\/?"[^>]*>Tầm nhìn &amp; Sứ mệnh<\/a>/);
  });
});
