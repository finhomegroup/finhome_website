/**
 * The split between the two next-step blocks, on rendered markup.
 *
 * WHAT THIS FILE CAN ESTABLISH: that the near-answer block emits at most the
 * agreed number of destinations, that it carries the no-transfer sentence, and
 * that promoting those destinations LOSES NOTHING — the further link, the
 * education seam and the retention panel all still render below the figure.
 *
 * WHAT IT CANNOT: that the block is actually within a screen of the answer at
 * 390×844. That was a browser measurement (1101,9 px past the answer, behind
 * an 805,2 px plot) and only a browser can say it improved.
 */
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ResultActions } from "@/components/calc/result-actions";
import { ToolNextSteps } from "@/components/calc/tool-next-steps";
import {
  NEAR_ANSWER_ACTIONS,
  TOOL_NEXT_STEPS,
  furtherSteps,
  nearAnswerSteps,
} from "@/content/calculators/next-steps";
import { getCalculator } from "@/content/calculators/registry";
import { TOOL_SHELL as C } from "@/content/calculators/tool-shell";

const SLUG = "lai-suat-tha-noi";

const near = (slug: string) =>
  renderToStaticMarkup(createElement(ResultActions, { slug }));

const further = (slug: string) =>
  renderToStaticMarkup(createElement(ToolNextSteps, { slug, promoted: true }));

const count = (html: string, needle: string): number =>
  html.split(needle).length - 1;

/**
 * Whether the markup links to a calculator, with or without a trailing slash.
 *
 * `next/link` emits the href as written here; the export's `trailingSlash`
 * normalisation happens in the framework, not in `renderToStaticMarkup`. So
 * the slash is optional in the pattern and the closing quote is what anchors
 * it — `/cong-cu/vay-mua-nha` must not satisfy a check for a longer slug.
 */
const linksTo = (html: string, slug: string): boolean =>
  new RegExp(`href="/cong-cu/${slug}/?"`).test(html);

describe("the near-answer actions", () => {
  it("emits no more than the agreed number of links, for every entry", () => {
    for (const slug of Object.keys(TOOL_NEXT_STEPS)) {
      const html = near(slug);
      expect(
        count(html, "<li>"),
        `${slug} renders ${count(html, "<li>")} actions beside the answer`,
      ).toBeLessThanOrEqual(NEAR_ANSWER_ACTIONS);
    }
  });

  it("names the destination and the question it answers", () => {
    const html = near(SLUG);
    for (const step of nearAnswerSteps(SLUG)) {
      expect(html).toContain(step.why);
      expect(html).toContain(getCalculator(step.slug)!.title);
      expect(linksTo(html, step.slug), `no link to ${step.slug}`).toBe(true);
    }
  });

  it("repeats that no figure travels with the reader", () => {
    // The truth the whole pattern rests on: these are links, not a handoff.
    // A reader who clicks re-enters everything, and the block says so where
    // they are about to click rather than in a paragraph below a plot.
    expect(near(SLUG)).toContain(C.nextSteps.actionsNote);
  });

  it("lets a two-mode tool replace the framing sentence and nothing else", () => {
    // Why the override exists: `next-steps.ts` holds ONE intro per slug, and a
    // tool with two mutually exclusive purposes has two different answers on
    // screen. The destinations stay right in both; only the sentence is wrong.
    const OWN = "Một câu dẫn riêng cho chế độ này:";
    const html = renderToStaticMarkup(
      createElement(ResultActions, { slug: SLUG, intro: OWN }),
    );
    expect(html).toContain(OWN);
    expect(html).not.toContain(TOOL_NEXT_STEPS[SLUG].intro);
    for (const step of nearAnswerSteps(SLUG)) {
      expect(html).toContain(step.why);
      expect(linksTo(html, step.slug), `lost the link to ${step.slug}`).toBe(
        true,
      );
    }
    expect(html).toContain(C.nextSteps.actionsNote);
    // And a route that passes nothing is untouched.
    expect(near(SLUG)).toContain(TOOL_NEXT_STEPS[SLUG].intro);
  });

  it("renders nothing at all for a tool with no entry", () => {
    // A library or United States tool gets no block, not an empty heading.
    expect(near("tinh-tien-tip")).toBe("");
  });
});

describe("promoting the first actions loses nothing", () => {
  it("keeps the further destination below the figure", () => {
    const rest = furtherSteps(SLUG);
    expect(rest.length).toBeGreaterThan(0);
    const html = further(SLUG);
    for (const step of rest) {
      expect(linksTo(html, step.slug), `lost the link to ${step.slug}`).toBe(
        true,
      );
      expect(html).toContain(step.why);
    }
    expect(html).toContain(C.nextSteps.furtherTitle);
  });

  it("does not show the promoted links a second time", () => {
    // Two cards with the same destination on one screen is the failure mode of
    // "just copy them up": the reader cannot tell which is the real one.
    const html = further(SLUG);
    for (const step of nearAnswerSteps(SLUG)) {
      expect(
        linksTo(html, step.slug),
        `${step.slug} appears in both blocks`,
      ).toBe(false);
    }
  });

  it("keeps the education seam and the retention panel", () => {
    const html = further(SLUG);
    const article = TOOL_NEXT_STEPS[SLUG].education!;
    expect(html).toContain(article.href.replace(/\/$/, ""));
    expect(html).toContain(article.label);
    expect(html).toContain(C.nextSteps.saveTitle);
    expect(html).toContain(TOOL_NEXT_STEPS[SLUG].saveBody ?? C.nextSteps.saveBody);
  });

  it("still renders the whole list when the route did NOT promote", () => {
    // The default is unchanged, which is what keeps the routes outside this
    // repair — and B2's remaining tools — working as they did.
    const html = renderToStaticMarkup(
      createElement(ToolNextSteps, { slug: SLUG }),
    );
    for (const step of TOOL_NEXT_STEPS[SLUG].tools) {
      expect(linksTo(html, step.slug), `${step.slug} missing`).toBe(true);
    }
    expect(html).toContain(TOOL_NEXT_STEPS[SLUG].intro);
  });
});
