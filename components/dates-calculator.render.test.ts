/**
 * Rendered-markup contracts for /cong-cu/tinh-ngay/ — audit row 72, "Gom ngày
 * bắt đầu/kết thúc thành hai nhóm ngắn; đặt nút xem số ngày cuối form, giữ quy
 * tắc ngày lễ cạnh kết quả."
 *
 * Separate from `dates-calculator.test.ts` on purpose: that file imports the
 * client module and deliberately NEVER renders, because it pins `readDate`'s
 * per-field blame as a pure function. Rendering in the same file would mix two
 * kinds of claim, and the blame sweep there runs 864 cases.
 *
 * WHAT THIS FILE CAN ESTABLISH: that the two date trios are two short groups,
 * that a CTA exists at the end of the form and names the mode's own output,
 * that the counting rule (including "không loại ngày lễ") is inside the
 * result region rather than only in the prose far below, that the inactive
 * mode's fields are UNMOUNTED rather than hidden, and that the emphasised row
 * follows the mode.
 *
 * WHAT IT CANNOT: appearance, focus order, and whether the CTA is reachable
 * without scrolling at any viewport.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { DATES } from "@/content/calculators/dates";

const CONTENT = "@/content/calculators/dates";

type FormPatch = Partial<Record<keyof typeof DATES.form, string>>;

async function render(
  patch?: FormPatch,
  props?: { actions?: ReactNode; nextSteps?: ReactNode },
): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual =
        await vi.importActual<typeof import("@/content/calculators/dates")>(
          CONTENT,
        );
      return {
        DATES: { ...actual.DATES, form: { ...actual.DATES.form, ...patch } },
      };
    });
  }
  try {
    const loaded = await import("@/components/dates-calculator");
    return renderToStaticMarkup(
      createElement(loaded.DatesCalculator, props ?? null),
    );
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = DATES.form;

/** The `emphasis` treatment `ResultRow` owns. */
const HEADLINE = "md:text-3xl";

describe("the difference mode, which is the default", () => {
  it("keeps the pre-implementation figures for 1/1/2026 → 31/12/2026", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    // 2026 is not a leap year, and the count is half-open: 364, not 365.
    expect(live!).toContain(`364 ${C.daysUnit}`);
    // "Tương đương" 11 tháng 30 ngày — clamped month addition, not borrowing.
    expect(live!).toContain(C.componentsLabel);
  });

  it("emphasises the day count, which is what the mode was asked for", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(C.daysLabel);
  });

  it("puts the counting rule, holidays included, beside the figures", async () => {
    const html = await render();
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).toContain(C.countingRuleLabel);
    expect(live!).toContain(C.countingRuleDifference);
    // The sentence the review asked to preserve, in the announced region.
    expect(live!).toContain("không loại ngày lễ");
  });

  it("moves the five secondary figures into a non-announced detail region", async () => {
    const html = await render();
    const detail = markupRegion(html, 'data-calc-region="detail"');
    expect(detail).not.toBeNull();
    for (const label of [
      C.detailTitle,
      C.weeksLabel,
      C.totalMonthsLabel,
      C.weekendDaysLabel,
      C.fromWeekdayLabel,
      C.toWeekdayLabel,
    ]) {
      expect(detail!, `detail lost "${label}"`).toContain(label);
    }
    expect(html.split('data-results-live="true"').length - 1).toBe(1);
  });
});

describe("the two date trios are two short groups", () => {
  it("renders the start group and the end group, both labelled", async () => {
    const html = await render();
    const form = markupRegion(html, 'data-calc-region="form"');
    expect(form).not.toBeNull();
    expect(form!).toContain(C.fromGroup);
    expect(form!).toContain(C.toGroup);
    // The start group comes first, and the "today" button belongs to it.
    expect(form!.indexOf(C.fromGroup)).toBeLessThan(form!.indexOf(C.toGroup));
    expect(form!.indexOf(C.todayLabel)).toBeLessThan(form!.indexOf(C.toGroup));
  });

  it("unmounts the offset mode's fields rather than hiding them", async () => {
    const html = await render();
    // A `display:none` input can still take focus in some engines; the review
    // requires the inactive mode's fields not to be reachable at all.
    expect(html).not.toContain(C.offsetGroup);
    // `offsetLabel` is "Số ngày", the SAME string as the result row's
    // `daysLabel` — asserting its absence would fail on the answer, so the
    // field's own help text is what identifies the input here.
    expect(html).not.toContain(C.offsetHelp);
    expect(html).not.toContain(C.skipWeekendsLegend);
  });

  it("unmounts the end-date trio in offset mode, and its blame with it", async () => {
    // An impossible "to" date the reader cannot see must not withhold an
    // answer they can: `dateInvalid` scopes the `to` trio behind the mode.
    const html = await render({ defaultMode: "offset", defaultToDay: "31", defaultToMonth: "2" });
    expect(html).not.toContain(C.toGroup);
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).toContain(C.offsetGroup);
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).toContain(C.resultDateLabel);
  });
});

describe("the CTA at the end of the form names the mode's own output", () => {
  it("says it will show a day count in difference mode", async () => {
    const html = await render();
    expect(html).toContain('id="tinh-ngay-nhap" data-calc-region="form"');
    expect(html).toContain('data-calc-cta="true"');
    expect(html).toContain('aria-controls="tinh-ngay-ket-qua"');
    expect(html).toContain(C.ctaDifference);
    expect(html).not.toContain(C.ctaOffset);
    // The CTA sits after the whole form, not between the two date groups.
    expect(html.indexOf(C.toGroup)).toBeLessThan(
      html.indexOf('data-calc-cta="true"'),
    );
  });

  it("says it will show a date in offset mode", async () => {
    const html = await render({ defaultMode: "offset" });
    expect(html).toContain(C.ctaOffset);
    expect(html).not.toContain(C.ctaDifference);
  });

  it("stays a compact single column with no chart and no pinned CTA", async () => {
    const html = await render();
    expect(html).not.toContain("lg:grid-cols-5");
    expect(html).not.toContain("<svg");
    expect(html).not.toContain("fh-cta-pin");
  });
});

describe("the offset mode", () => {
  it("emphasises the resulting date and keeps its own counting rule", async () => {
    const html = await render({ defaultMode: "offset" });
    const live = markupRegion(html, 'data-results-live="true"');
    // 1/1/2026 + 90 ngày, tính mọi ngày.
    expect(live!).toContain("1/4/2026");
    expect(live!.split(HEADLINE).length - 1).toBe(1);
    expect(live!.slice(0, live!.indexOf(HEADLINE))).toContain(
      C.resultDateLabel,
    );
    expect(live!).toContain(C.countingRuleOffset);
    expect(live!).toContain(C.resultWeekdayLabel);
  });

  it("drops the difference-only detail region, rather than emptying it", async () => {
    const html = await render({ defaultMode: "offset" });
    expect(markupRegion(html, 'data-calc-region="detail"')).toBeNull();
    expect(html).not.toContain(C.detailTitle);
  });

  it("refuses a fractional offset and explains it on the offset field", async () => {
    const html = await render({ defaultMode: "offset", defaultOffset: "1,5" });
    expect(html).toContain(C.offsetInvalid);
    expect(html.split('aria-invalid="true"').length - 1).toBe(1);
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).not.toContain(C.weekdayNames[0]);
  });

  it("accepts a negative offset, which is how the tool counts backwards", async () => {
    const html = await render({ defaultMode: "offset", defaultOffset: "-30" });
    expect(html).not.toContain('aria-invalid="true"');
    const live = markupRegion(html, 'data-results-live="true"');
    // 1/1/2026 − 30 ngày.
    expect(live!).toContain("2/12/2025");
  });
});

describe("an impossible date withholds the figures and says why", () => {
  it("explains the blank beside where the figure would be", async () => {
    // 29 February 2026 does not exist; 2026 is not a leap year.
    const html = await render({ defaultToMonth: "2", defaultToDay: "29" });
    expect(html).toContain(C.invalidNotice);
    expect(html).toContain(C.dayInvalid);
    expect(html.split('aria-invalid="true"').length - 1).toBe(1);
    const live = markupRegion(html, 'data-results-live="true"');
    // The labels and the rule stay; the numbers do not appear.
    expect(live!).toContain(C.daysLabel);
    expect(live!).toContain(C.countingRuleLabel);
    // "ngày" on its own is in the counting rule prose, so the absence has to
    // be asserted on a FIGURE carrying the unit, not on the word.
    expect(live!).not.toMatch(/\d+ ngày/);
    // The notice belongs beside the answer, not in the form.
    const form = markupRegion(html, 'data-calc-region="form"');
    expect(form!).not.toContain(C.invalidNotice);
  });

  it("does not show the notice while everything is valid", async () => {
    const html = await render();
    expect(html).not.toContain(C.invalidNotice);
  });
});

describe("the actions sit after the answer", () => {
  it("places them outside the live region and before the detail", async () => {
    const html = await render(undefined, {
      actions: createElement("div", { "data-test": "actions" }),
      nextSteps: createElement("div", { "data-test": "next-steps" }),
    });
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live!).not.toContain('data-test="actions"');
    expect(html.indexOf('data-test="actions"')).toBeLessThan(
      html.indexOf('data-test="next-steps"'),
    );
    expect(html.indexOf('data-test="next-steps"')).toBeLessThan(
      html.indexOf('data-calc-region="detail"'),
    );
  });
});
