/**
 * Rendered-markup contracts for /cong-cu/tiet-kiem-hoc-phi/ (original row 25).
 *
 * `renderToStaticMarkup` in the runner's plain `node` environment — the
 * pattern `components/calc/chart/chart-render.test.ts` documents.
 *
 * WHAT THIS FILE EXISTS FOR. Both defects an independent review found on the
 * live page were in a DEFAULT and in presentation, which docs §6 records as
 * exactly where a green module run cannot see them:
 *
 * 1. With no time to save, the headline read "Cần góp mỗi tháng 0 ₫" beside a
 *    sentence saying the amount could not be calculated — and
 *    "Phần do lãi đóng góp 314.513.997 ₫", which was the unfunded shortfall
 *    with zero months elapsed.
 * 2. A 101-year wait cleared every result and both charts with no field
 *    marked invalid, and the figure explained the refusal as a plan too
 *    SHORT.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EDUCATION_SAVINGS } from "@/content/calculators/education-savings";
import { MAX_EDUCATION_YEARS } from "@/lib/calc/education-savings";

type Loose = Record<string, unknown>;

async function render(formOverrides?: Record<string, string>) {
  const contentPath = "@/content/calculators/education-savings";
  vi.resetModules();
  if (formOverrides) {
    vi.doMock(contentPath, async () => {
      const actual = (await vi.importActual(contentPath)) as {
        EDUCATION_SAVINGS: Loose;
      };
      const original = actual.EDUCATION_SAVINGS;
      return {
        EDUCATION_SAVINGS: {
          ...original,
          form: { ...(original.form as Loose), ...formOverrides },
        },
      };
    });
  }
  try {
    const loaded = (await import(
      "@/components/education-savings-calculator"
    )) as Record<string, ComponentType>;
    return renderToStaticMarkup(
      createElement(loaded.EducationSavingsCalculator),
    );
  } finally {
    vi.doUnmock(contentPath);
    vi.resetModules();
  }
}

const F = EDUCATION_SAVINGS.form;

describe("the shipped defaults still answer the question", () => {
  it("quotes the monthly contribution and the target", async () => {
    const html = await render();
    expect(html).toContain("1.795.779 ₫");
    expect(html).toContain("700.601.379 ₫");
    // No gap rows on a plan that funds itself.
    expect(html).not.toContain(F.unpaidTuitionLabel);
  });
});

describe("study starting NOW, with too little money", () => {
  const NOW = { defaultYearsUntil: "0", defaultCurrentSavings: "10.000.000" };

  it("withholds the monthly figure instead of rendering 0 ₫", async () => {
    const html = await render(NOW);
    const row = html.slice(
      html.indexOf(F.monthlyLabel),
      html.indexOf(F.targetLabel),
    );
    // `ResultRow` renders a dash for a null value.
    expect(row).toContain("—");
    expect(row).not.toContain("0 ₫");
  });

  it("reports the gap and the unpayable tuition as their own rows", async () => {
    const html = await render(NOW);
    expect(html).toContain(F.fundingGapLabel);
    expect(html).toContain(F.heldAtStartLabel);
    expect(html).toContain(F.unpaidTuitionLabel);
    expect(html).toContain("314.513.997 ₫");
  });

  it("never labels the unfunded gap as earned interest", async () => {
    const html = await render(NOW);
    const interest = html.slice(
      html.indexOf(F.interestLabel),
      html.indexOf(F.totalContributionsLabel),
    );
    expect(interest).toContain("0 ₫");
    expect(interest).not.toContain("314.513.997");
  });

  it("does not claim the first tuition was paid", async () => {
    const html = await render(NOW);
    // The chart's underfunded sentence, not the funded one.
    expect(html).toContain("chưa có nguồn");
    expect(html).not.toContain("Mức góp cần thiết là");
    expect(html).toContain(F.noTimeNotice);
  });

  it("does not list a monthly contribution among the figure's assumptions", async () => {
    const html = await render(NOW);
    const chart = EDUCATION_SAVINGS.chart;
    expect(html).toContain(chart.immediateFundAssumption);
    expect(html).not.toContain(chart.contributionAssumption);
    // The other four bullets stay.
    for (const bullet of chart.assumptions) {
      expect(html).toContain(bullet);
    }
  });
});

describe("study starting NOW with enough money", () => {
  it("solves 0 because none is NEEDED, and pays every year", async () => {
    const html = await render({
      defaultYearsUntil: "0",
      defaultCurrentSavings: "400.000.000",
    });
    const row = html.slice(
      html.indexOf(F.monthlyLabel),
      html.indexOf(F.targetLabel),
    );
    expect(row).toContain("0 ₫");
    expect(row).not.toContain("—");
    expect(html).toContain(F.alreadyFundedNotice);
    expect(html).not.toContain(F.unpaidTuitionLabel);
  });

  it("never shows the UNFUNDED no-time notice on a funded plan", async () => {
    // The defect: the notice was mounted on `noTimeToSave` alone, so a plan
    // with a monthly figure of 0 and no gap was told an amount was missing
    // and the result was blank. Reproduced by review at 500 triệu.
    const html = await render({
      defaultYearsUntil: "0",
      defaultCurrentSavings: "500.000.000",
    });
    expect(html).not.toContain(F.noTimeNotice);
    expect(html).toContain(F.noTimeFundedNotice);
    // And the chart's own behind/ahead note does not appear either way here.
    expect(html).toContain("80.000.000 ₫");
  });
});

describe("the 100-year bound exists in the FORM", () => {
  it("marks the year fields invalid and names the limit", async () => {
    const html = await render({ defaultYearsUntil: "101" });
    expect(MAX_EDUCATION_YEARS).toBe(100);
    // Both year fields are invalid, because either is a valid thing to fix.
    expect((html.match(/aria-invalid="true"/g) ?? []).length).toBeGreaterThanOrEqual(2);
    expect(html).toContain("không được vượt 100 năm");
    // And the chart's own recovery no longer describes a plan too SHORT.
    expect(html).not.toContain("kế hoạch dài hơn một năm");
    expect(html).toContain("từ 2 đến 100 năm");
  });

  it("states the bound in the field's help even when valid", async () => {
    const html = await render();
    expect(html).toContain("không vượt quá 100 năm");
    expect((html.match(/aria-invalid="true"/g) ?? []).length).toBe(0);
  });
});

describe("the example figures are labelled as the example's", () => {
  it("attributes 778.268.627 ₫ and the 77 triệu gap to the default plan", async () => {
    // The note sits under a table whose values move with the form, so the
    // hardcoded pair has to name itself as the example's rather than reading
    // as the current result.
    // Rendered by the ROUTE (`CalculatorPage`'s `intro`), not by this
    // component, so the assertion is on the string itself.
    const intro = F.table.intro;
    expect(intro).toContain("778.268.627");
    expect(intro).toContain("700.601.379");
    expect(intro).toContain("ví dụ điền sẵn");
    expect(intro).toContain("chỉ để minh họa");
    // The other site with the same pair, on the page-level notice.
    expect(EDUCATION_SAVINGS.streamNotice).toContain("ví dụ điền sẵn");
    // And 0% growth is described as an assumption, not a mistake.
    expect(EDUCATION_SAVINGS.streamNotice).toContain("một giả định rõ ràng");
    expect(F.inflationHelp).toContain("không phải một lỗi");
    expect(F.inflationHelp).not.toContain("hay bị để 0 nhất");
  });
});
