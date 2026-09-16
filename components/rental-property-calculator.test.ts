/**
 * Rendered-markup contracts for /cong-cu/bat-dong-san-cho-thue/ (row 15).
 *
 * `renderToStaticMarkup` in the runner's plain `node` environment — the
 * pattern `components/calc/chart/chart-render.test.ts` documents.
 *
 * WHAT ONLY A RENDER CAN CHECK HERE. The NQ43 relief is a DECLARATION, and
 * the default is off. Whether the page applies a tax reduction nobody claimed
 * is a question about a default and about conditional rows — which is where
 * docs §6 says three of this suite's five worst defects lived, invisible to a
 * green module run.
 */
import { describe, expect, it, vi } from "vitest";
import { markupRegion } from "@/lib/markup-region";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RENTAL_PROPERTY } from "@/content/calculators/rental-property";

type Loose = Record<string, unknown>;

async function render(formOverrides?: Record<string, string>) {
  const contentPath = "@/content/calculators/rental-property";
  vi.resetModules();
  if (formOverrides) {
    vi.doMock(contentPath, async () => {
      const actual = (await vi.importActual(contentPath)) as {
        RENTAL_PROPERTY: Loose;
      };
      const original = actual.RENTAL_PROPERTY;
      return {
        RENTAL_PROPERTY: {
          ...original,
          form: { ...(original.form as Loose), ...formOverrides },
        },
      };
    });
  }
  try {
    const loaded = (await import(
      "@/components/rental-property-calculator"
    )) as Record<string, ComponentType>;
    return renderToStaticMarkup(
      createElement(loaded.RentalPropertyCalculator),
    );
  } finally {
    vi.doUnmock(contentPath);
    vi.resetModules();
  }
}

const F = RENTAL_PROPERTY.form;
const S = RENTAL_PROPERTY.scenarios;

describe("the tax relief is declared, and off by default", () => {
  it("offers the declaration with 'no' selected", async () => {
    const html = await render();
    expect(html).toContain(F.reliefLegend);
    expect(html).toContain(F.reliefNo);
    expect(html).toContain(F.reliefYes);
    // The radio the page ships with is the no-relief one. React emits
    // `checked=""` BEFORE `value`, so the assertion reads in that order.
    expect(html).toMatch(/checked=""\s+value="no"/);
    expect(html).not.toMatch(/checked=""\s+value="yes"/);
  });

  it("renders no relief rows at all until it is declared", async () => {
    // An optional row is NOT MOUNTED, not nulled: a dash beside "giảm 30%"
    // would claim a reduction nobody asked for.
    const html = await render();
    expect(html).not.toContain(F.pitReliefLabel);
    expect(html).not.toContain(F.pitAfterReliefLabel);
    expect(html).not.toContain(F.taxBeforeReliefLabel);
  });

  it("shows the before and after figures once it IS declared", async () => {
    // 90 triệu/tháng of rent with the 1 tỷ PIT deduction — the reviewed
    // fixture: 54 triệu of VAT, 4 triệu of PIT, 1,2 triệu of relief.
    const html = await render({
      defaultRent: "90.000.000",
      defaultVacancy: "0",
      defaultPitThreshold: "1.000.000.000",
      defaultRelief: "yes",
    });
    expect(html).toContain(F.pitReliefLabel);
    expect(html).toContain("54.000.000 ₫");
    expect(html).toContain("4.000.000 ₫");
    expect(html).toContain("1.200.000 ₫");
    expect(html).toContain("2.800.000 ₫");
    // Both totals, so the two are never read as one figure.
    expect(html).toContain("56.800.000 ₫");
    expect(html).toContain("58.000.000 ₫");
    // And never the wrong arithmetic — 58 × 70%.
    expect(html).not.toContain("40.600.000 ₫");
  });

  it("reports the two taxes crossing their own thresholds", async () => {
    // Over the 1 tỷ VAT cliff, and over a SMALLER allocated PIT deduction —
    // the case that exists because one landlord's PIT deduction is shared
    // across their rental contracts.
    const html = await render({
      defaultRent: "90.000.000",
      defaultVacancy: "0",
      defaultPitThreshold: "500.000.000",
    });
    expect(html).toContain(F.taxableLabel);
    expect(html).toContain(F.pitAppliesLabel);
    expect(html).toContain(F.pitThresholdLabel);
    expect(html).toContain("54.000.000 ₫");
    expect(html).toContain("29.000.000 ₫");
  });

  it("charges a 900 triệu let nothing, at the current defaults", async () => {
    // The repair the source review required: the superseded 500 triệu
    // default showed this qualifying rental 65 triệu of tax it does not owe.
    const html = await render({
      defaultRent: "75.000.000",
      defaultVacancy: "0",
    });
    expect(html).toContain("1.000.000.000");
    expect(html).not.toContain("65.000.000 ₫");
    // Both "có phải nộp" rows read "Không".
    expect(html).toContain(F.taxableLabel);
    expect(html).toContain(F.pitAppliesLabel);
  });
});

describe("the scenario view", () => {
  it("renders four named scenarios, baseline first", async () => {
    const html = await render();
    expect(html).toContain(S.title);
    const order = [S.baseName, S.vacancyName, S.expensesName, S.bothName].map(
      (name) => html.indexOf(name),
    );
    for (const at of order) expect(at).toBeGreaterThan(-1);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("states the assumptions each row ran on", async () => {
    const html = await render();
    // The extra empty month, as percentage points of a year.
    expect(html).toContain("13,33%");
    // And the raised running cost.
    expect(html).toContain("3.000.000 ₫");
  });

  it("names the already-negative case on the shipped defaults", async () => {
    const html = await render();
    expect(html).toContain(S.alreadyNegativeNotice);
    expect(html).not.toContain(S.flipsNegativeNotice);
  });

  it("warns when a scenario turns a positive plan negative", async () => {
    const html = await render({ defaultDown: "1.800.000.000" });
    expect(html).toContain(S.flipsNegativeNotice);
    expect(html).not.toContain(S.alreadyNegativeNotice);
  });

  it("keeps the scenario table OUT of every live region", async () => {
    const html = await render();
    // docs §4's hard rule. One live region on the page, and no table inside
    // it — the table markup starts after that region closes.
    expect((html.match(/data-results-live="true"/g) ?? []).length).toBe(1);
    const live = html.indexOf('data-results-live="true"');
    const caption = html.indexOf(S.caption);
    expect(caption).toBeGreaterThan(live);
    // `markupRegion` counts depth. The previous bound was the first
    // `</div>` after the marker, which closes the first NESTED div rather
    // than the region — so this negative assertion under-checked and would
    // have missed a table further inside.
    const liveRegion = markupRegion(html, 'data-results-live="true"');
    expect(liveRegion).not.toBeNull();
    expect(liveRegion).not.toContain("<table");
  });
});

describe("the waterfall", () => {
  it("DRAWS the deficit rather than truncating at zero", async () => {
    const html = await render();
    const chart = RENTAL_PROPERTY.chart;
    expect(html).toContain(chart.title);
    expect(html).toContain(chart.vacancyStep);
    expect(html).toContain(chart.debtStep);
    // The defaults are cash-negative. The closing bar is the DEFICIT, on the
    // same axis as the rent bar, with its own legend entry — the repair the
    // review required after measuring a bar clamped at zero with the 47,34
    // triệu that decides the question living only in prose.
    expect(html).toContain(chart.deficitBar);
    expect(html).toContain(chart.deficitSegment);
    expect(html).toContain(chart.uncoveredSegment);
    expect(html).toContain("47.340.806 ₫");
    expect(html).not.toContain(chart.netBar);
    // And the old excuse is gone from the copy.
    expect(html).not.toContain("một cột không có phần âm");
    // The three reconciling figures are in the summary.
    expect(html).toContain("147.000.000 ₫");
    expect(html).toContain("194.340.806 ₫");
  });

  it("says principal is cash OUT, not an omitted cost", async () => {
    const html = await render();
    expect(html).not.toContain("không tính phần gốc bạn trả dần");
    expect(html).toContain("Khoản trả nợ gồm cả gốc");
  });

  it("closes with the answer when the year is cash-positive", async () => {
    const html = await render({ defaultDown: "2.800.000.000" });
    expect(html).toContain(RENTAL_PROPERTY.chart.netBar);
    expect(html).not.toContain("Tiền thuê KHÔNG đủ trả nợ");
  });
});
