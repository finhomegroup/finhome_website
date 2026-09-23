/**
 * Rendered-markup contracts for `/cong-cu/lam-phat-hoa-ky/` — plan row 74.
 *
 * WHAT THE ROW ASKED FOR: "Giữ nhãn Hoa Kỳ và nguồn CPI; ưu tiên sức mua tương
 * đương; hé mở phần dạy về chuỗi CPI." Before this pass the route had no
 * `CalculatorLayout`, no CTA and no emphasised answer, the two modes shared one
 * undifferentiated caption, and the halving row could render a bare dash.
 *
 * WHAT MUST NOT CHANGE, and is asserted here rather than trusted:
 * `computeUsInflation` is untouched and every figure keeps its precision — two
 * decimals on the cumulative rate, FOUR on the average annual rate and on the
 * purchasing power of one dollar.
 *
 * NOT A VISUAL CHECK. `renderToStaticMarkup` in the runner's plain `node`
 * environment; no width, no layout, no browser.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { US_INFLATION } from "@/content/calculators/us-inflation";
import { TOOL_SHELL } from "@/content/calculators/tool-shell";
import { computeUsInflation } from "@/lib/calc/us-inflation";

const CONTENT_PATH = "@/content/calculators/us-inflation";

const FORM_ID = "lam-phat-hoa-ky-nhap";
const RESULT_ID = "lam-phat-hoa-ky-ket-qua";

const F = US_INFLATION.form;

/**
 * Render the calculator on patched defaults.
 *
 * Same lever as `components/percent-render.test.ts` and the row 76 test: the
 * component reads its opening values from the content module, so replacing
 * `form.defaults` is how a static render reaches a state other than the shipped
 * one. No jsdom in this runner, so this is not interaction — it is the same
 * component on a different opening state.
 */
async function render(
  // Not `Partial<typeof F.defaults>`: the content module is `as const`, so that
  // type would only accept the shipped literals back again.
  defaults?: Partial<Record<keyof typeof F.defaults, string>>,
): Promise<string> {
  vi.resetModules();
  if (defaults !== undefined) {
    vi.doMock(CONTENT_PATH, async () => {
      const actual = (await vi.importActual(CONTENT_PATH)) as {
        US_INFLATION: typeof US_INFLATION;
      };
      return {
        US_INFLATION: {
          ...actual.US_INFLATION,
          form: {
            ...actual.US_INFLATION.form,
            defaults: { ...actual.US_INFLATION.form.defaults, ...defaults },
          },
        },
      };
    });
  }
  try {
    const loaded = (await import(
      "@/components/us-inflation-calculator"
    )) as Record<string, ComponentType>;
    return renderToStaticMarkup(createElement(loaded.UsInflationCalculator));
  } finally {
    vi.doUnmock(CONTENT_PATH);
    vi.resetModules();
  }
}

const count = (html: string, needle: string): number =>
  html.split(needle).length - 1;

function regionOrder(html: string): string[] {
  return [...html.matchAll(/data-calc-region="([a-z]+)"/g)].map((m) => m[1]);
}

describe("row 74 gets the shell contracts it never had", () => {
  it("renders form, result and the CPI disclosure in that order", async () => {
    expect(regionOrder(await render())).toEqual(["form", "result", "detail"]);
  });

  it("drops the detail region in rate mode, where there is no series", async () => {
    // The disclosure explains a CPI chain. In rate mode there is no chain, so
    // an empty `<details>` would be a promise of content that is not there.
    const html = await render({ mode: "rate" });
    expect(regionOrder(html)).toEqual(["form", "result"]);
    expect(html).not.toContain(F.cpiSourceDetailTitle);
  });

  it("stays a compact single column", async () => {
    expect(await render()).not.toContain("lg:col-span-2");
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

  it("does not pin a current-answer block", async () => {
    // Five controls at most, against the six of the only form on this shelf
    // whose height has been measured — so this is a BOUNDARY row, named as one
    // in `components/u-long-form-cta.test.ts` along with the measurement and
    // the shelf-wide pinned / unpinned table. This form's own height has NOT
    // been measured; a browser pass could move it either way.
    const html = await render();
    expect(html).not.toContain("fh-cta-pin");
    expect(html).not.toContain('data-calc-answer="true"');
  });

  it("emphasises exactly one figure, and keeps one live region", async () => {
    const html = await render();
    expect(count(html, "md:text-3xl")).toBe(1);
    expect(count(html, 'data-results-live="true"')).toBe(1);
  });

  it("leads with the equivalent amount, at full precision", async () => {
    // 1.000 USD, CPI 172,2 → 320 over 25 years.
    const html = await render();
    const result = html.slice(html.indexOf('data-calc-region="result"'));
    expect(result.indexOf(F.equivalentLabel)).toBeLessThan(
      result.indexOf(F.cumulativeLabel),
    );
    expect(html).toContain("1.858,30 USD");
    expect(html).toContain("85,83%");
    // Four decimals on the annual rate and on the power of one dollar — the
    // shortened entry copy must not have shortened these.
    expect(html).toContain("2,5096%");
    expect(html).toContain("0,5381 USD");
    expect(html).toContain("46,19%");
    expect(html).toContain("27,96");
  });
});

describe("each mode says which question the answer belongs to", () => {
  it("cites the CPI source when the answer is a measurement", async () => {
    const html = await render();
    expect(html).toContain(F.cpiSourceNotice);
    expect(html).not.toContain(F.rateModeNotice);
    // Beside the figure, not after the long table.
    const result = html.slice(html.indexOf('data-calc-region="result"'));
    expect(result.indexOf(F.cpiSourceNotice)).toBeLessThan(
      result.indexOf(F.powerTitle),
    );
  });

  it("names the assumption when the answer is a forecast", async () => {
    const html = await render({ mode: "rate" });
    expect(html).toContain(F.rateModeNotice);
    expect(html).not.toContain(F.cpiSourceNotice);
    // 1.000 USD at 3% over 25 years.
    expect(html).toContain("2.093,78 USD");
    expect(html).toContain("109,38%");
    expect(html).toContain("3,0000%");
  });

  it("discloses the CPI-chain teaching rather than printing it at entry", async () => {
    const html = await render();
    // A `<details>` without its `summary` renders nothing readable, so the
    // title is asserted alongside the body.
    expect(html).toContain("<details");
    expect(html).toContain(F.cpiSourceDetailTitle);
    expect(html).toContain(F.cpiSourceDetail);
  });
});

describe("unavailable and boundary states are explained where they appear", () => {
  it("says why the halving row has no answer under deflation", async () => {
    const deflation = computeUsInflation({
      mode: "rate",
      amount: 1000,
      startCpi: 100,
      endCpi: 100,
      years: 25,
      ratePercent: -1,
    });
    // A negative rate is VALID input: the engine returns a result and only the
    // halving row inside it is empty.
    if (deflation === null) throw new Error("the engine refused a valid rate");
    expect(deflation.yearsToHalvePower).toBeNull();

    const html = await render({ mode: "rate", rate: "-1" });
    // A valid negative rate: no field is flagged and every other row computes.
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).not.toContain(F.invalidNotice);
    expect(html).toContain("777,82 USD");
    expect(html).toContain("-22,22%");
    // Never a bare dash where a valid entry simply has no such year.
    expect(html).toContain(F.neverHalves);
    expect(html).toContain(F.deflationNotice);
  });

  it("uses the same never-halves label at zero inflation, without the deflation note", async () => {
    // Zero is neither deflation nor a missing input: prices are flat, so the
    // halving question has no answer but nothing gained purchasing power.
    const html = await render({ mode: "rate", rate: "0" });
    expect(html).toContain(F.neverHalves);
    expect(html).not.toContain(F.deflationNotice);
    expect(html).toContain("1.000,00 USD");
  });

  it("withholds every figure on an unusable amount, and says why", async () => {
    const html = await render({ amount: "" });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(F.invalidNotice);
    expect(html).toContain(TOOL_SHELL.cta.invalidNote);
    expect(html).not.toContain("1.858,30 USD");
  });

  it("never flags the pair the active mode does not read", async () => {
    // The CTA's error branch reads `[aria-invalid="true"]` out of the form
    // region in document order, so a flagged inactive field would send the
    // reader to an input the answer ignores. In rate mode the CPI group is not
    // rendered at all; in CPI mode the rate field is not.
    const rateMode = await render({ mode: "rate", startCpi: "", endCpi: "" });
    expect(rateMode).not.toContain('aria-invalid="true"');
    expect(rateMode).not.toContain(F.startCpiLabel);
    expect(rateMode).toContain("2.093,78 USD");

    const cpiMode = await render({ rate: "" });
    expect(cpiMode).not.toContain('aria-invalid="true"');
    expect(cpiMode).not.toContain(F.rateLabel);
    expect(cpiMode).toContain("1.858,30 USD");
  });
});
