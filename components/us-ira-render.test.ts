/**
 * Rendered-markup contracts for `/cong-cu/ira-truyen-thong-hay-roth/` — row 53.
 *
 * WHAT THE ROW ASKED FOR: replace the categorical "Nên chọn" with a
 * conditional reading at BOTH call sites of the verdict helper — the result
 * row and the table's last column — keep the applicability conditions beside
 * the answer, and preserve the deductibility limit, the break-even comparison
 * and the constrained capital-gains select.
 *
 * WHAT MUST NOT CHANGE, and is asserted here as a baseline rather than
 * assumed: the outcome still reverses at a 10% withdrawal rate with the signed
 * Roth-minus-traditional gap staying negative, and a contribution over the
 * statutory ceiling still COMPUTES with a warning instead of becoming an
 * invalid field. `computeUsIra` is untouched, as is the table's measured
 * `mobileCards` decision.
 *
 * Two empty rows have two different causes, so each is reproduced before its
 * wording is asserted: the break-even is unavailable when there is no balance
 * to compare, the pre-tax equivalent only at a 100% rate.
 *
 * NOT A VISUAL CHECK. `renderToStaticMarkup` in the runner's plain `node`
 * environment; no width, no layout, no browser.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { US_IRA } from "@/content/calculators/us-ira";
import { TOOL_SHELL } from "@/content/calculators/tool-shell";
import {
  formatMoney,
  formatPercent,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeUsIra, type UsIraResult } from "@/lib/calc/us-ira";

const CONTENT_PATH = "@/content/calculators/us-ira";

const FORM_ID = "ira-truyen-thong-hay-roth-nhap";
const RESULT_ID = "ira-truyen-thong-hay-roth-ket-qua";

const F = US_IRA.form;
const T = F.table;

type Defaults = Partial<Record<keyof typeof F.defaults, string>>;

/** Same `vi.doMock` lever as the other U-group render tests. */
async function render(defaults?: Defaults): Promise<string> {
  vi.resetModules();
  if (defaults !== undefined) {
    vi.doMock(CONTENT_PATH, async () => {
      const actual = (await vi.importActual(CONTENT_PATH)) as {
        US_IRA: typeof US_IRA;
      };
      return {
        US_IRA: {
          ...actual.US_IRA,
          form: {
            ...actual.US_IRA.form,
            defaults: { ...actual.US_IRA.form.defaults, ...defaults },
          },
        },
      };
    });
  }
  try {
    const loaded = (await import("@/components/us-ira-calculator")) as Record<
      string,
      ComponentType
    >;
    return renderToStaticMarkup(createElement(loaded.UsIraCalculator));
  } finally {
    vi.doUnmock(CONTENT_PATH);
    vi.resetModules();
  }
}

/** The engine, fed exactly what the component feeds it. */
function compute(defaults: Defaults = {}): UsIraResult {
  const v = { ...F.defaults, ...defaults };
  const result = computeUsIra({
    year: Number(v.year),
    age: parseCount(v.age) as number,
    annualContribution: parseMoney(v.contribution) as number,
    currentRatePercent: parseDecimal(v.currentRate) as number,
    retirementRatePercent: parseDecimal(v.retirementRate) as number,
    returnPercent: parseDecimal(v.returnPercent) as number,
    years: parseCount(v.years) as number,
    capitalGainsRatePercent: Number(v.capitalGains),
  });
  if (result === null) throw new Error("the engine refused a valid case");
  return result;
}

const usd = (value: number): string => `${formatMoney(value)} USD`;
const usdCents = (value: number): string => `${formatMoney(value, 2)} USD`;

const count = (html: string, needle: string): number =>
  html.split(needle).length - 1;

function regionOrder(html: string): string[] {
  return [...html.matchAll(/data-calc-region="([a-z]+)"/g)].map((m) => m[1]);
}

const resultRegion = (html: string): string =>
  html.slice(
    html.indexOf('data-calc-region="result"'),
    html.indexOf('data-calc-region="detail"'),
  );

const detailRegion = (html: string): string =>
  html.slice(html.indexOf('data-calc-region="detail"'));

describe("row 53 gets the shell contracts it never had", () => {
  it("renders form, result and detail in that order", async () => {
    expect(regionOrder(await render())).toEqual(["form", "result", "detail"]);
  });

  it("takes the grouped two-column split the row asked for", async () => {
    const html = await render();
    expect(html).toContain("lg:col-span-2");
    expect(html).toContain("lg:grid-cols-5");
  });

  it("puts the CTA in the form region, naming the answer", async () => {
    const html = await render();
    const form = html.slice(
      html.indexOf(`id="${FORM_ID}"`),
      html.indexOf('data-calc-region="result"'),
    );
    expect(form).toContain('data-calc-cta="true"');
    expect(form).toContain(`aria-controls="${RESULT_ID}"`);
    expect(html).toContain(TOOL_SHELL.cta.autoNote);
  });

  it("pins a short current answer, this form being a long one", async () => {
    // CORRECTED; the reason and the shelf-wide pinned / unpinned table are in
    // `components/u-long-form-cta.test.ts`. It carries the SIGNED difference,
    // not the verdict label: a pinned verdict would restate the
    // recommendation with its assumptions left behind.
    const html = await render();
    expect(html).toContain("fh-cta-pin");
    expect(html).toContain('data-calc-answer="true"');
  });

  it("leads with the size of the gap, emphasised once", async () => {
    const html = await render();
    const r = compute();
    expect(count(html, "md:text-3xl")).toBe(1);
    expect(count(html, 'data-results-live="true"')).toBe(1);
    const result = resultRegion(html);
    expect(result).toContain(usd(r.rothAdvantageEqualCost));
    // The emphasis is on the gap, not on the word above it: the conditional
    // reading must not be the largest type on the page.
    const emphasised = result.slice(
      result.indexOf(F.differenceLabel),
      result.indexOf(F.breakEvenLabel),
    );
    expect(emphasised).toContain("md:text-3xl");
    expect(result.indexOf(F.verdictLabel)).toBeLessThan(
      result.indexOf(F.differenceLabel),
    );
  });
});

describe("the verdict is conditional at both call sites", () => {
  it("labels the result row with the entered assumptions", async () => {
    const html = await render();
    const result = resultRegion(html);
    expect(result).toContain(F.verdictLabel);
    expect(result).toContain(F.verdictRoth);
    // The categorical form the row named is gone from the whole tool.
    expect(html).not.toContain("Nên chọn");
  });

  it("uses the same conditional strings in the table column", async () => {
    const html = await render();
    const detail = detailRegion(html);
    expect(detail).toContain(T.verdictColumn);
    // Every table row carries an outcome, so the shared helper's strings
    // appear more often in the table than the single result row above.
    expect(count(detail, F.verdictRoth)).toBeGreaterThan(1);
    expect(detail).toContain(F.verdictTraditional);
  });

  it("keeps the break-even rate beside the reading of the sign", async () => {
    const html = await render();
    const r = compute();
    const result = resultRegion(html);
    expect(result).toContain(
      formatPercent(r.breakEvenRetirementRatePercent!, 2),
    );
    expect(result).toContain(F.breakEvenLabel);
  });

  it("keeps the applicability conditions next to the answer", async () => {
    const html = await render();
    const result = resultRegion(html);
    // Moved up from below the table: the deductibility and Roth-eligibility
    // assumptions bind in every case, so they are not disclosed.
    expect(result).toContain(F.deductibilityNotice);
    expect(detailRegion(html)).not.toContain(F.deductibilityNotice);
  });
});

describe("the two comparisons stay distinct", () => {
  it("keeps the equal-cost rows beside the answer", async () => {
    const html = await render();
    const r = compute();
    const result = resultRegion(html);
    expect(result).toContain(F.equalCostTitle);
    expect(result).toContain(usd(r.rothAfterTax));
    expect(result).toContain(usd(r.traditionalTotalEqualCost));
    expect(result).toContain(usdCents(r.netCostRoth));
  });

  it("keeps the other framing and the reference figures below", async () => {
    const html = await render();
    const r = compute();
    const detail = detailRegion(html);
    expect(detail).toContain(F.sameContribTitle);
    expect(detail).toContain(usd(r.rothAdvantageSameContribution));
    expect(detail).toContain(usdCents(r.rothAsPreTaxContribution!));
    expect(resultRegion(html)).not.toContain(F.sameContribTitle);
    // One summary only, and it holds the statutory ceiling — not the table.
    expect(count(detail, "<details")).toBe(1);
    expect(detail).toContain(F.detailDisclosureTitle);
    expect(detail).toContain(usd(r.contributionLimit));
  });

  it("leaves the rate table unclicked, with its assumption line", async () => {
    const html = await render();
    const detail = detailRegion(html);
    expect(detail).toContain(T.caption);
    expect(detail).toContain(T.intro);
    // The measured mobile-card decision survives the move.
    expect(detail).toContain("md:hidden");
    // The table's own intro says it is what to read instead of one number,
    // so it must sit above the one summary rather than inside it.
    expect(detail.indexOf(T.caption)).toBeLessThan(detail.indexOf("<details"));
  });
});

describe("the preserved baselines", () => {
  it("reverses at a 10% withdrawal rate, gap still signed", async () => {
    const r = compute({ retirementRate: "10" });
    expect(r.verdict).toBe("traditional");
    expect(r.rothAdvantageEqualCost).toBeLessThan(0);
    const result = resultRegion(await render({ retirementRate: "10" }));
    expect(result).toContain(F.verdictTraditional);
    expect(result).toContain(usd(r.rothAdvantageEqualCost));
    // Signed, not flipped into a positive "truyền thống hơn" figure: the
    // baseline is that the gap stays Roth-minus-traditional.
    expect(usd(r.rothAdvantageEqualCost).startsWith("-")).toBe(true);
  });

  it("still computes an over-limit contribution, with a warning", async () => {
    const html = await render({ contribution: "20.000" });
    const r = compute({ contribution: "20.000" });
    expect(r.excessContribution).toBeGreaterThan(0);
    const result = resultRegion(html);
    expect(result).toContain(F.excessNotice);
    expect(result).toContain(usd(r.rothAdvantageEqualCost));
    // A warning, not an invalid field: the CTA must not send the reader to a
    // box the answer above was computed from.
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).not.toContain(F.invalidNotice);
  });

  it("keeps the capital-gains rate a three-value select", async () => {
    const html = await render();
    expect(html).toContain('value="0"');
    expect(html).toContain('value="15"');
    expect(html).toContain('value="20"');
    expect(html).toContain(F.capitalGainsOptions.fifteen);
  });

  it("says nothing extra on the shipped defaults", async () => {
    const html = await render();
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).not.toContain(F.invalidNotice);
    expect(html).not.toContain(F.excessNotice);
    expect(html).not.toContain(F.noBreakEvenNotice);
    expect(html).not.toContain(F.noPreTaxEquivalentNotice);
  });
});

describe("an empty row never stands unexplained", () => {
  it("explains the missing break-even when there is no balance", async () => {
    const r = compute({ contribution: "0" });
    expect(r.breakEvenRetirementRatePercent).toBeNull();
    expect(r.balanceAtHorizon).toBe(0);
    const html = await render({ contribution: "0" });
    const result = resultRegion(html);
    expect(result).toContain(F.noBreakEvenNotice);
    expect(result).toContain("—");
    // A valid zero is not a required-field error.
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).not.toContain(F.invalidNotice);
  });

  it("explains the missing pre-tax equivalent at a 100% rate", async () => {
    const r = compute({ currentRate: "100" });
    expect(r.rothAsPreTaxContribution).toBeNull();
    const html = await render({ currentRate: "100" });
    // The row it explains is in the detail region, so the sentence is too.
    expect(detailRegion(html)).toContain(F.noPreTaxEquivalentNotice);
    expect(resultRegion(html)).not.toContain(F.noPreTaxEquivalentNotice);
    expect(html).not.toContain('aria-invalid="true"');
  });

  it("marks a genuinely bad input and drops the table", async () => {
    const html = await render({ age: "" });
    expect(html).toContain('aria-invalid="true"');
    expect(resultRegion(html)).toContain(F.invalidNotice);
    expect(html).not.toContain(T.caption);
    // The regions themselves do not move when there is no answer.
    expect(regionOrder(html)).toEqual(["form", "result", "detail"]);
  });
});
