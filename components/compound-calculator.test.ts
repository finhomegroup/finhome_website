/**
 * Rendered-markup contracts for /cong-cu/lai-kep/ — ORIGINAL ROW 16.
 *
 * Three things this page had to change, and each is pinned below:
 *
 * 1. The example is a HOME FUND, and the visual splits the balance into the
 *    money that was there at the start, the money added afterwards, and the
 *    interest — as stacked bands over real elapsed time.
 * 2. A fractional term stops where the last completed compounding period
 *    stops. Labelling that "Năm 2" claimed a year that never happened.
 * 3. The dense always-expanded table of pre-formatted đồng strings is gone:
 *    the chart's own typed table is the single reading path.
 *
 * Server-rendered with `renderToStaticMarkup`. Nothing here is a visual check.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { COMPOUND } from "@/content/calculators/compound";
import { MAX_COMPOUND_YEARS } from "@/lib/calc/compound";

const CONTENT = "@/content/calculators/compound";

type FormPatch = Partial<Record<keyof typeof COMPOUND.form, string>>;

async function render(patch?: FormPatch): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/compound")
      >(CONTENT);
      return {
        COMPOUND: {
          ...actual.COMPOUND,
          form: { ...actual.COMPOUND.form, ...patch },
        },
      };
    });
  }
  try {
    const loaded = await import("@/components/compound-calculator");
    return renderToStaticMarkup(createElement(loaded.CompoundCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

const C = COMPOUND.form;

describe("the home-fund example and the three bands", () => {
  it("answers at the shipped defaults", async () => {
    // 100 triệu + 8 triệu/tháng at 6% for 10 years.
    const html = await render();
    expect(html).toContain(C.futureValueLabel);
    expect(html).toContain("1.492.974.448 ₫");
    expect(html).toContain("1.060.000.000 ₫");
    expect(html).toContain("432.974.448 ₫");
  });

  it("names all three bands and states their sum", async () => {
    const html = await render();
    expect(html).toContain(COMPOUND.chart.title);
    expect(html).toContain(COMPOUND.chart.initial);
    expect(html).toContain(COMPOUND.chart.contributions);
    expect(html).toContain(COMPOUND.chart.interest);
    expect(html).toContain("Sau 10 năm (120 kỳ ghép lãi đã hoàn thành)");
    expect(html).toContain(COMPOUND.chart.rateNote);
  });

  it("renders the bands as a stacked area, not as overlapping lines", async () => {
    const html = await render();
    // Three closed, filled paths — the band geometry. A filled LINE series
    // would carry `fill-opacity="0.12"` and a stroke dash instead.
    const filled = html.match(/fill-opacity="0.55"/g) ?? [];
    expect(filled.length).toBe(3);
  });

  it("keeps ONE reading path: no dense duplicate table", async () => {
    const html = await render();
    // The chart's own table is inside the figure's disclosure; there is no
    // second always-expanded table of formatted đồng below it.
    const tables = html.match(/<table/g) ?? [];
    expect(tables.length).toBe(1);
    expect(html).toContain(COMPOUND.chart.tableCaption);
    expect(html).toContain("<details");
  });

  it("keeps exactly one live results region", async () => {
    const html = await render();
    expect((html.match(/data-results-live="true"/g) ?? []).length).toBe(1);
  });
});

describe("a fractional term", () => {
  const HALF: FormPatch = {
    defaultPrincipal: "100.000.000",
    defaultRate: "6",
    defaultYears: "1,5",
    defaultCompounding: "semiannually",
    defaultContribution: "10.000.000",
  };

  it("credits three periods and says 1,5 năm, never Năm 2", async () => {
    const html = await render(HALF);
    expect(html).toContain("140.181.700 ₫");
    expect(html).toContain("Sau 1,5 năm (3 kỳ ghép lãi đã hoàn thành)");
    expect(html).toContain("1,5 năm");
    expect(html).toContain(COMPOUND.chart.partialNote);
    // The old defect: a final row labelled "Năm 2" for a 1,5-year term.
    expect(html).not.toContain(">Năm 2<");
  });

  it("marks where the credited term actually ends", async () => {
    const html = await render(HALF);
    expect(html).toContain("Kết thúc ở 1,5 năm");
  });

  it("does not call an exact three periods a non-whole number of periods", async () => {
    // 1,5 năm ghép nửa năm IS exactly 3 periods. The note used to say the
    // term was not a whole number of compounding periods — a different claim,
    // and false here. It may only say the checkpoint is not a whole YEAR.
    const html = await render(HALF);
    expect(html).toContain(COMPOUND.chart.partialNote);
    expect(COMPOUND.chart.partialNote).not.toContain("không tròn số kỳ");
    expect(html).not.toContain("Kỳ hạn bạn nhập còn dư");
  });

  it("says so when the term really does leave a period uncredited", async () => {
    // 2,5 năm ghép hằng năm credits 2 and leaves half a period, which earns
    // nothing — and that IS the other claim.
    const html = await render({
      defaultYears: "2,5",
      defaultCompounding: "annually",
      defaultContribution: "0",
    });
    expect(html).toContain("còn dư 0,5 kỳ ghép lãi chưa hoàn thành");
    expect(html).toContain("Năm 2");
  });
});

/**
 * ORIGINAL ROW 16's short-horizon counterexample, on the rendered page: daily
 * compounding over an entered 0,01 năm — three completed days — with 100 triệu
 * and 10 triệu a day at 6%. The balance was right and the time axis read
 * "0,0 năm" on the summary, the marker, the table and every tick.
 */
describe("a horizon shorter than a year", () => {
  const DAILY: FormPatch = {
    defaultPrincipal: "100.000.000",
    defaultRate: "6",
    defaultYears: "0,01",
    defaultCompounding: "daily",
    defaultContribution: "10.000.000",
  };

  it("keeps the balance and reads the time in days", async () => {
    const html = await render(DAILY);
    expect(html).toContain("130.054.255 ₫");
    expect(html).toContain("Sau 3 ngày (3 kỳ ghép lãi đã hoàn thành)");
    expect(html).toContain(COMPOUND.chart.xAxisDays);
    expect(html).toContain("Kết thúc ở 3 ngày");
    expect(html).toContain(">3 ngày<");
  });

  it("never renders the elapsed time as 0,0 năm", async () => {
    const html = await render(DAILY);
    expect(html).not.toContain("0,0 năm");
    expect(html).not.toContain(COMPOUND.chart.xAxis);
    // The ticks are distinguishable rather than five identical zeroes.
    for (const tick of ["0,8", "1,5", "2,3"]) {
      expect(html, tick).toContain(tick);
    }
  });
});

describe("the term bound and its recovery", () => {
  it("refuses a term past the bound and names the field", async () => {
    const html = await render({ defaultYears: String(MAX_COMPOUND_YEARS + 1) });
    expect(html).toContain(C.yearsInvalid);
    expect(C.yearsInvalid).toContain("100");
    // No figures, and the chart says what to change.
    expect(html).not.toContain("1.492.974.448 ₫");
    expect(html).toContain(COMPOUND.chart.unavailableRecovery);
  });

  it("accepts the bound itself", async () => {
    const html = await render({ defaultYears: String(MAX_COMPOUND_YEARS) });
    expect(html).not.toContain(C.yearsInvalid);
  });
});
