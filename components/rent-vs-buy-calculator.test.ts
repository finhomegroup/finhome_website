/**
 * The rent/buy tool as RENDERED — original row 8's UI contracts.
 *
 * Why these have to be render tests. Four of them are about states the module
 * tests cannot see, because they live in the component's own field validation
 * and in which sentence it chooses:
 *
 * - a term or horizon past the engine's 1.200-month bound used to clear the
 *   result and both charts with NO field marked invalid, so the chart's
 *   recovery sentence pointed at an errored field that did not exist;
 * - a rental deposit above the upfront cash is refused by the engine, and the
 *   field has to say WHY — "nhập một số từ 0 trở lên" beside a positive
 *   number is an instruction a reader cannot follow;
 * - an exact tie must not render as a win for renting;
 * - a break-even month of null has two different meanings and must not be
 *   described with the sentence for the other one.
 *
 * Server-rendered with `react-dom/server` in the runner's plain `node`
 * environment, which is also the right fidelity: the page is prerendered at
 * these defaults and must hydrate byte-identically. Appearance is not checked
 * here and nothing in this file is a visual observation.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RENT_VS_BUY } from "@/content/calculators/rent-vs-buy";
import { MAX_RENT_BUY_MONTHS } from "@/lib/calc/rent-vs-buy";
import { fill } from "@/lib/calc/charts/labels";

const CONTENT = "@/content/calculators/rent-vs-buy";
const F = RENT_VS_BUY.form;
const LIMIT = { limit: "1.200" };

/** Render the calculator, optionally patching some of its defaults. */
async function render(
  patch?: Record<string, string>,
): Promise<string> {
  vi.resetModules();
  if (patch) {
    vi.doMock(CONTENT, async () => {
      const actual = await vi.importActual<
        typeof import("@/content/calculators/rent-vs-buy")
      >(CONTENT);
      return {
        RENT_VS_BUY: {
          ...actual.RENT_VS_BUY,
          form: { ...actual.RENT_VS_BUY.form, ...patch },
        },
      };
    });
  }
  try {
    const loaded = await import("@/components/rent-vs-buy-calculator");
    return renderToStaticMarkup(createElement(loaded.RentVsBuyCalculator));
  } finally {
    vi.doUnmock(CONTENT);
    vi.resetModules();
  }
}

describe("the shipped defaults, as rendered", () => {
  it("answers, scopes the verdict and names the crossing", async () => {
    const html = await render();
    expect(html).toContain(F.verdictBuy);
    expect(html).toContain("120 tháng");
    expect(html).toContain("32 tháng");
    // Both figures, and the assumption scope beside the verdict.
    expect(html.split("<figure").length - 1).toBe(2);
    expect(html).toContain("giả định giá nhà 5%/năm");
  });

  it("names the supported horizon in the two month fields", async () => {
    const html = await render();
    expect(html).toContain(fill(F.termHelp, LIMIT));
    expect(html).toContain(fill(F.horizonHelp, LIMIT));
    expect(String(MAX_RENT_BUY_MONTHS)).toBe("1200");
  });
});

describe("recovery a reader can actually act on", () => {
  it("marks the horizon field when it exceeds the engine's bound", async () => {
    const html = await render({ defaultHorizon: "1201" });
    expect(html).toContain(fill(F.horizonInvalid, LIMIT));
    expect(html).toContain('aria-invalid="true"');
    // The result and both drawings are cleared, and the charts' own recovery
    // sentence now points at a field that IS marked.
    expect(html).not.toContain("<svg");
    expect(html).toContain(RENT_VS_BUY.chart.unavailableRecovery);
    // The typed value survives, so it can be repaired rather than retyped.
    expect(html).toContain('value="1201"');
  });

  it("marks the term field when it exceeds the same bound", async () => {
    const html = await render({ defaultTerm: "1201" });
    expect(html).toContain(fill(F.termInvalid, LIMIT));
    expect(html).not.toContain("<svg");
    expect(html).toContain('value="1201"');
  });

  it("explains a deposit above the upfront cash", async () => {
    // 900 triệu + 100 triệu of upfront cash, and a 1,1 tỷ deposit: a positive
    // number the engine still refuses, because both sides of the comparison
    // start from the same cash.
    const html = await render({ defaultDeposit: "1.100.000.000" });
    expect(html).toContain(F.depositInvalid);
    expect(F.depositInvalid).toContain("không vượt số tiền mặt ban đầu");
    expect(html).toContain('aria-invalid="true"');
    expect(html).not.toContain("<svg");
    expect(html).toContain('value="1.100.000.000"');
  });

  it("keeps the two month bounds out of each other's message", async () => {
    // A bound named on the wrong field sends the reader to the wrong box.
    const html = await render({ defaultHorizon: "1201" });
    expect(html).toContain(fill(F.horizonInvalid, LIMIT));
    expect(html).toContain(fill(F.termHelp, LIMIT));
  });
});

describe("the two states a null break-even can mean", () => {
  it("says buying was never ahead when it never was", async () => {
    // Short horizon, no growth: the entry and exit costs are never recovered
    // and there is no month where buying is ahead.
    const html = await render({ defaultGrowth: "0", defaultHorizon: "24" });
    expect(html).toContain(F.noBreakEvenNotice);
    expect(html).toContain(RENT_VS_BUY.chart.noBreakEvenNote);
  });

  it("says the lead was reversed when it was", async () => {
    // The independent reversal fixture: ahead from month 90 to month 302, and
    // renting ahead again by month 360. "mua không lúc nào rẻ hơn" would be
    // false here, and false in the reader's favour.
    const html = await render({
      defaultPurchaseCosts: "60.000.000",
      defaultOwnerCosts: "2.500.000",
      defaultGrowth: "4",
      defaultSellingCost: "2",
      defaultRentGrowth: "4",
      defaultDeposit: "24.000.000",
      defaultInvestment: "10",
      defaultHorizon: "360",
    });
    expect(html).toContain(
      fill(F.reversedNotice, { first: "90", last: "302" }),
    );
    expect(html).not.toContain(F.noBreakEvenNotice);
    // And the chart says the same thing in its own summary.
    expect(html).toContain("tháng 90");
    expect(html).toContain("tháng 302");
  });
});

describe("an exact tie", () => {
  it("is not rendered as a win for renting", async () => {
    const html = await render({
      defaultDown: "3.000.000.000",
      defaultPurchaseCosts: "0",
      defaultRate: "0",
      defaultOwnerCosts: "0",
      defaultGrowth: "0",
      defaultSellingCost: "0",
      defaultRent: "0",
      defaultRentGrowth: "0",
      defaultDeposit: "0",
      defaultInvestment: "0",
      defaultHorizon: "12",
    });
    expect(html).toContain(F.verdictEqual);
    expect(html).toContain(F.tieNotice);
    expect(html).toContain("hai phương án tốn ngang nhau");
    // The verdict ROW specifically, rather than the whole document: "Thuê" is
    // also a chart column heading and a series label, so a document-wide
    // negative would be about the wrong strings.
    const verdictRow = html
      .slice(html.indexOf(fill(F.verdictLabel, { months: "12" })))
      .slice(0, 400);
    expect(verdictRow).toContain(F.verdictEqual);
    expect(verdictRow).not.toContain(`>${F.verdictRent}<`);
  });
});
