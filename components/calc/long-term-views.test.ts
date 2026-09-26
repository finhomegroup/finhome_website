/**
 * The four-view control's rendered contracts.
 *
 * `LongTermViews` is what makes the merge of original plan rows 44, 45, 48 and
 * 50 visible: four retained URLs, one plan. The contracts worth asserting are
 * the ones a reader or a screen reader would notice if they broke — that all
 * four questions are offered, that the current page is not a link to itself,
 * and that it is marked `aria-current`. Rendered rather than inferred from
 * JSX, with `renderToStaticMarkup` in the runner's plain `node` environment.
 *
 * Appearance is NOT checked here and must not be reported as checked.
 */
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LongTermViews } from "@/components/calc/long-term-views";
import { LONG_TERM_PLAN as L } from "@/content/calculators/long-term-plan";
import { calculatorPath, getCalculator } from "@/content/calculators/registry";
import type { LongTermView } from "@/lib/calc/long-term-plan";

const render = (current: LongTermView) =>
  renderToStaticMarkup(createElement(LongTermViews, { current }));

const count = (html: string, needle: string | RegExp): number =>
  typeof needle === "string"
    ? html.split(needle).length - 1
    : (html.match(needle) ?? []).length;

/**
 * How many times this markup links to a slug.
 *
 * The trailing slash is optional in the pattern on purpose. `next.config.ts`
 * sets `trailingSlash: true`, so the BUILT pages carry
 * `href="/cong-cu/tinh-huu-tri/"` — but `next/link` rendered through bare
 * `renderToStaticMarkup`, with no router or config in scope, normalises the
 * same element to `href="/cong-cu/tinh-huu-tri"`. Pinning either spelling
 * would make this test a statement about the test environment rather than
 * about the component. The closing quote is what keeps `thu-nhap-huu-tri` from
 * matching inside `phan-tich-thu-nhap-huu-tri`.
 */
const linksTo = (html: string, slug: string): number =>
  count(html, new RegExp(`href="${calculatorPath(slug)}/?"`, "g"));

describe("the long-term plan's four-view control", () => {
  it("names all four questions on every view", () => {
    for (const item of L.views.items) {
      const html = render(item.view);
      for (const other of L.views.items) {
        expect(html, `${item.view} omits ${other.slug}`).toContain(
          other.question,
        );
      }
    }
  });

  it("marks the current view and does NOT link it to itself", () => {
    for (const item of L.views.items) {
      const html = render(item.view);
      expect(count(html, 'aria-current="page"')).toBe(1);
      // A link to the page you are on is a focusable control that reloads it.
      expect(linksTo(html, item.slug), `${item.slug} links to itself`).toBe(0);
      // And the other three ARE reachable.
      for (const other of L.views.items) {
        if (other.slug === item.slug) continue;
        expect(
          linksTo(html, other.slug),
          `${item.view} cannot reach ${other.slug}`,
        ).toBe(1);
      }
    }
  });

  it("covers the four views exactly once each, against the registry", () => {
    // A view added to the union without a URL here would silently drop a
    // quarter of the plan from every one of the four pages.
    const views = L.views.items.map((item) => item.view);
    expect(new Set(views).size).toBe(views.length);
    const expected: LongTermView[] = [
      "trajectory",
      "contribution",
      "gap",
      "withdrawal",
    ];
    expect([...views].sort()).toEqual([...expected].sort());
    for (const item of L.views.items) {
      const entry = getCalculator(item.slug);
      expect(entry, `${item.slug} is not in the registry`).toBeDefined();
      expect(entry!.status).toBe("live");
      // The merged plan models no country's law; a US-rules notice above a
      // đồng-denominated household plan is the flag this slice removed.
      expect(
        entry!.usRules,
        `${item.slug} still carries usRules`,
      ).toBeUndefined();
    }
  });

  it("gives the control an accessible name", () => {
    const html = render("trajectory");
    expect(html).toContain(`<nav aria-label="${L.views.title}"`);
  });

  it("tells the reader their figures are re-entered on the next page", () => {
    // Measured 2026-09-26: a balance changed to 600.000.000 ₫ on one view met
    // the 500.000.000 ₫ default on the next. The intro may promise a shared
    // formula — that is true — but it must not imply the numbers travel, and
    // nothing stores or carries them.
    expect(L.views.intro).toContain("nhập lại");
    expect(L.views.intro).not.toContain("không thể đưa ra");
    // On every view, not just the trajectory's: the control is shared.
    for (const item of L.views.items) {
      expect(render(item.view), item.view).toContain(L.views.intro);
    }
  });

  it("reads the same on all four views: no sibling named, no 'trang còn lại' counted", () => {
    // The intro renders on all four routes. A sentence listing "the other
    // three" from the trajectory's point of view was wrong on the other
    // three; the current page is marked by the control, not by the prose.
    expect(L.views.intro).not.toContain("ba trang");
    expect(L.views.intro).not.toContain("còn lại");
    for (const item of L.views.items) {
      expect(L.views.intro, item.label).not.toContain(item.label);
    }
    for (const item of L.views.items) {
      const html = render(item.view);
      expect(count(html, L.views.currentLabel)).toBe(1);
      expect(html).toContain(L.views.intro);
    }
  });
});
