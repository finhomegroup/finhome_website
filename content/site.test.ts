import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SiteFooter } from "@/components/site-footer";
import { FOOTER, NAV_ITEMS } from "@/content/site";

describe("site navigation", () => {
  it("links the calculator suite from the main menu", () => {
    expect(NAV_ITEMS).toContainEqual({
      label: "Công cụ",
      href: "/cong-cu/",
    });
  });

  it("links the existing vision page directly from the shared desktop/mobile menu", () => {
    expect(NAV_ITEMS.filter((item) => item.href === "/vision/")).toEqual([
      { label: "Về FinHome", href: "/vision/" },
    ]);
    expect(existsSync(fileURLToPath(new URL("../app/vision/page.tsx", import.meta.url)))).toBe(true);
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
