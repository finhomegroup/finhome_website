/**
 * VISUAL FIRST, INSIDE THE RESULT (2026-09-29, the user's latest correction)
 * for `vay-mua-nha` and `vay-mua-xe` only: form left, result card right, the
 * ONE living infographic at the top of that card, then the numeric summary,
 * then actions/charts/detail. "Xem kết quả" lands on the card's TOP. No
 * appearance is checked here — DOM order, regions and the scroll call only.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ResultGroup } from "@/components/calc/result-group";
import { focusAndScroll, jumpToAnswer } from "@/components/calc/result-cta";
import { markupRegion } from "@/lib/markup-region";

const count = (html: string, needle: string) => html.split(needle).length - 1;

async function render(route: "home" | "auto"): Promise<string> {
  vi.resetModules();
  const props = {
    actions: createElement("div", { "data-test": "actions" }),
    nextSteps: createElement("div", { "data-test": "next-steps" }),
  };
  if (route === "home") {
    const { LoanCalculator } = await import("@/components/loan-calculator");
    return renderToStaticMarkup(createElement(LoanCalculator, props));
  }
  const { AutoLoanCalculator } = await import("@/components/auto-loan-calculator");
  return renderToStaticMarkup(createElement(AutoLoanCalculator, props));
}

const ROUTES = [
  { route: "home", id: "vay-mua-nha-ket-qua", panel: 'data-mortgage-learning="true"', rows: 'data-results-live="true"' },
  { route: "auto", id: "vay-mua-xe-ket-qua", panel: 'data-auto-learning="true"', rows: 'data-calc-rows="true"' },
] as const;

describe.each(ROUTES)("$route: the visual leads the result card", ({ route, id, panel, rows }) => {
  it("form → result card (heading → ONE visual → summary rows) → actions → next steps; detail after the card", async () => {
    const html = await render(route);
    const form = html.indexOf('data-calc-region="form"');
    const result = html.indexOf('data-calc-region="result"');
    const at = html.indexOf(panel);
    expect(form).toBeGreaterThan(-1);
    expect(result).toBeGreaterThan(form);
    // No detached hook above both columns, and exactly one scene.
    expect(at).toBeGreaterThan(result);
    expect(count(html, panel)).toBe(1);
    expect(count(html, 'data-result-visual="true"')).toBe(1);
    expect(count(html, "data-infographic-art=")).toBe(1);
    expect(html).not.toContain("data-auto-hook");
    // INSIDE the anchored result group — the card surface — not a sibling of it.
    const group = markupRegion(html, `id="${id}"`);
    if (group === null) throw new Error(`no result group #${id}`);
    // markupRegion returns the region from its OPENING tag; find that tag.
    const groupStart = html.lastIndexOf("<div", html.indexOf(`id="${id}"`));
    expect(html.slice(groupStart, groupStart + group.length)).toBe(group);
    expect(group).toContain(panel);
    expect(group.indexOf(`id="${id}-title"`)).toBeLessThan(group.indexOf(panel));
    expect(group.indexOf(panel)).toBeLessThan(group.indexOf(rows));
    expect(group.indexOf(panel)).toBeLessThan(group.indexOf("md:text-3xl"));
    // Then the rest of the result column, in the old order.
    const groupEnd = groupStart + group.length;
    expect(html.indexOf('data-test="actions"')).toBeGreaterThan(groupEnd);
    expect(html.indexOf('data-test="next-steps"')).toBeGreaterThan(html.indexOf('data-test="actions"'));
    expect(html.indexOf('data-calc-region="detail"')).toBeGreaterThan(groupEnd);
  });

  it("one live region, and the visual's controls are outside it", async () => {
    const html = await render(route);
    expect(count(html, 'data-results-live="true"')).toBe(1);
    const live = markupRegion(html, 'data-results-live="true"');
    if (live === null) throw new Error("no live region");
    expect(live.length).toBeGreaterThan(0);
    expect(live).not.toContain(panel);
    expect(live).not.toContain("data-learning-try=");
    expect(live).not.toContain("<button");
    const section = markupRegion(html, panel, "section");
    if (section === null) throw new Error("no panel section");
    expect(section).toContain("data-learning-try=");
    expect(section).not.toMatch(/aria-live|data-results-live/);
  });

  it("no nested card: the panel brings no border/background/padding of its own; h3 under the group h2", async () => {
    const html = await render(route);
    const tag = html.match(new RegExp(`<section[^>]*${panel}[^>]*>`))?.[0] ?? "";
    expect(tag).not.toMatch(/border|bg-white|p-4|rounded-2xl/);
    const section = markupRegion(html, panel, "section");
    if (section === null) throw new Error("no panel section");
    expect(section).toMatch(/^<section[^>]*>\s*<h3 /);
    expect(section).not.toContain("<h2");
    // The group tightens its side padding below sm only when it holds a visual.
    expect(html).toMatch(new RegExp(`<div id="${id}"[^>]*max-sm:px-3`));
  });

  it("Xem kết quả points at the one labelled group and opts in to start alignment", async () => {
    const html = await render(route);
    expect(count(html, `id="${id}"`)).toBe(1);
    const cta = markupRegion(html, 'data-calc-cta="true"');
    if (cta === null) throw new Error("no CTA");
    expect(html).toMatch(/data-calc-cta="true" data-calc-cta-align="start"/);
    expect(cta).toContain(`aria-controls="${id}"`);
    expect(html).toMatch(new RegExp(`<div id="${id}" tabindex="-1" aria-labelledby="${id}-title"`));
  });
});

describe("auto: the early entry control stays in the scene and targets the real form", () => {
  it("one 'Nhập số của bạn' at the scene's top; the form's first input is the car price", async () => {
    const html = await render("auto");
    const section = markupRegion(html, 'data-auto-learning="true"', "section");
    if (section === null) throw new Error("no panel section");
    expect(count(html, 'data-learning-open-form="top"')).toBe(1);
    expect(section).toContain('data-learning-open-form="top"');
    const form = markupRegion(html, 'data-calc-region="form"');
    if (form === null) throw new Error("no form region");
    // formJumpTarget falls back to the first input, select or textarea in the form.
    const first = form.match(/<(?:input|select|textarea)[^>]*>/)?.[0] ?? "";
    expect(first).toContain('data-calc-field="price"');
  });
});

describe("ResultGroup `visual` is opt-in", () => {
  it("absent: markup exactly as before (no visual wrapper, no padding change)", () => {
    // Children as createElement's third argument, not a `children` prop
    // (react/no-children-prop) — the project pattern of result-status-render.test.ts.
    const html = renderToStaticMarkup(
      createElement(ResultGroup, { title: "T", anchorId: "x" } as ComponentProps<typeof ResultGroup>, "rows"),
    );
    expect(html).not.toContain("data-result-visual");
    expect(html).not.toContain("max-sm:px-3");
  });
  it("present: under the heading, before status, outside the live rows", () => {
    const html = renderToStaticMarkup(
      createElement(ResultGroup, {
        title: "T",
        anchorId: "x",
        visual: createElement("p", { "data-v": "1" }),
        status: createElement("p", { "data-s": "1" }),
      } as ComponentProps<typeof ResultGroup>, createElement("p", { "data-r": "1" })),
    );
    expect(html.indexOf("</h2>")).toBeLessThan(html.indexOf('data-v="1"'));
    expect(html.indexOf('data-v="1"')).toBeLessThan(html.indexOf('data-s="1"'));
    const live = markupRegion(html, 'data-results-live="true"');
    if (live === null) throw new Error("no live region");
    expect(live).toContain('data-r="1"');
    expect(live).not.toContain('data-v="1"');
  });
});

describe("the CTA's scroll: opt-in start alignment, invalid path unchanged", () => {
  afterEach(() => vi.unstubAllGlobals());

  function fake() {
    return { parentElement: null, scrollIntoView: vi.fn(), focus: vi.fn() };
  }
  function stub(targets: Record<string, unknown>, reduce = false) {
    vi.stubGlobal("window", { matchMedia: () => ({ matches: reduce }) });
    vi.stubGlobal("document", { getElementById: (key: string) => targets[key] ?? null });
  }

  it("valid, align start: the result top is scrolled to 'start' and focused without a second scroll", () => {
    const target = fake();
    stub({ form: { querySelector: () => null }, result: target });
    jumpToAnswer("form", "result", "start");
    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    expect(target.focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it("reduced motion: asks for an EXPLICIT 'instant' scroll (not 'auto', which inherits the global smooth scroll-behavior)", () => {
    // The CALL contract only; whether a browser honours it under an OS
    // reduced-motion setting is a browser observation, not tested here.
    const target = fake();
    stub({ form: { querySelector: () => null }, result: target }, true);
    jumpToAnswer("form", "result", "start");
    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: "instant", block: "start" });
    const field = fake();
    stub({ form: { querySelector: () => field }, result: fake() }, true);
    jumpToAnswer("form", "result", "start");
    expect(field.scrollIntoView).toHaveBeenCalledWith({ behavior: "instant", block: "center" });
  });

  it("invalid: the first bad field is centred and focused; the visual is NOT the destination", () => {
    const field = fake();
    const target = fake();
    stub({ form: { querySelector: () => field }, result: target });
    jumpToAnswer("form", "result", "start");
    expect(field.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
    expect(field.focus).toHaveBeenCalled();
    expect(target.scrollIntoView).not.toHaveBeenCalled();
  });

  it("defaults stay centred for every other route", () => {
    const target = fake();
    stub({ form: { querySelector: () => null }, result: target });
    jumpToAnswer("form", "result");
    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
    const el = fake();
    focusAndScroll(el as unknown as HTMLElement);
    expect(el.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "center" });
  });
});
