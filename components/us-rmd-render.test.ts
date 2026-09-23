/**
 * Rendered-markup contracts for `/cong-cu/rut-toi-thieu-bat-buoc/` — row 54.
 *
 * WHAT THE ROW ASKED FOR: keep the required withdrawal, its tax and the
 * reader's own intended withdrawal as separate figures; get the birth-year
 * grammar and the start-age logic right; and put a meaningful label where a
 * nullable divisor or percentage used to render a bare dash.
 *
 * THREE EMPTY-ROW CAUSES, reproduced one test each before their wording is
 * asserted:
 *
 *   age < startAge        → no divisor at all, so no percentage either
 *   prior balance = 0     → a divisor, but no denominator for the percentage
 *   projection shrinks    → no peak age to name
 *
 * A fourth state is a group-level failure rather than a field one: an end age
 * at or below the current age passes every field's own check and the engine
 * still refuses the case, so the explanation appears with no field flagged.
 *
 * WHAT MUST NOT CHANGE: `computeRmd` is untouched, as is the table's measured
 * `mobileCards` decision.
 *
 * NOT A VISUAL CHECK. `renderToStaticMarkup` in the runner's plain `node`
 * environment; no width, no layout, no browser.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { US_RMD } from "@/content/calculators/us-rmd";
import { TOOL_SHELL } from "@/content/calculators/tool-shell";
import {
  formatDecimal,
  formatMoney,
  parseCount,
  parseDecimal,
  parseMoney,
} from "@/lib/calc/number";
import { computeRmd, type RmdResult } from "@/lib/calc/us-rmd";

const CONTENT_PATH = "@/content/calculators/us-rmd";

const FORM_ID = "rut-toi-thieu-bat-buoc-nhap";
const RESULT_ID = "rut-toi-thieu-bat-buoc-ket-qua";

const F = US_RMD.form;
const T = F.table;

type Defaults = Partial<Record<keyof typeof F.defaults, string>>;

/** Same `vi.doMock` lever as the other U-group render tests. */
async function render(defaults?: Defaults): Promise<string> {
  vi.resetModules();
  if (defaults !== undefined) {
    vi.doMock(CONTENT_PATH, async () => {
      const actual = (await vi.importActual(CONTENT_PATH)) as {
        US_RMD: typeof US_RMD;
      };
      return {
        US_RMD: {
          ...actual.US_RMD,
          form: {
            ...actual.US_RMD.form,
            defaults: { ...actual.US_RMD.form.defaults, ...defaults },
          },
        },
      };
    });
  }
  try {
    const loaded = (await import("@/components/us-rmd-calculator")) as Record<
      string,
      ComponentType
    >;
    return renderToStaticMarkup(createElement(loaded.UsRmdCalculator));
  } finally {
    vi.doUnmock(CONTENT_PATH);
    vi.resetModules();
  }
}

/** The engine, fed exactly what the component feeds it. */
function compute(defaults: Defaults = {}): RmdResult {
  const v = { ...F.defaults, ...defaults };
  const result = computeRmd({
    birthYear: parseCount(v.birthYear) as number,
    currentAge: parseCount(v.currentAge) as number,
    balance: parseMoney(v.balance) as number,
    returnPercent: parseDecimal(v.returnPercent) as number,
    endAge: parseCount(v.endAge) as number,
    marginalRatePercent: parseDecimal(v.marginal) as number,
    plannedWithdrawal: parseMoney(v.planned) as number,
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

describe("row 54 gets the shell contracts it never had", () => {
  it("renders form, result and detail in that order", async () => {
    expect(regionOrder(await render())).toEqual(["form", "result", "detail"]);
  });

  it("takes the two-column split the row asked for", async () => {
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
    // `components/u-long-form-cta.test.ts`.
    const html = await render();
    expect(html).toContain("fh-cta-pin");
    expect(html).toContain('data-calc-answer="true"');
  });

  it("leads with the obligation, emphasised once", async () => {
    const html = await render();
    const r = compute();
    expect(count(html, "md:text-3xl")).toBe(1);
    expect(count(html, 'data-results-live="true"')).toBe(1);
    const result = resultRegion(html);
    expect(result).toContain(usdCents(r.required));
    const emphasised = result.slice(
      result.indexOf(F.requiredLabel),
      result.indexOf(F.requiredPercentLabel),
    );
    expect(emphasised).toContain("md:text-3xl");
  });
});

describe("the three quantities stay separate", () => {
  it("shows the requirement, the plan and the tax as their own rows", async () => {
    const html = await render();
    const r = compute();
    const result = resultRegion(html);
    expect(result).toContain(F.plannedResultLabel);
    // The planned figure is the reader's own input, echoed beside the
    // obligation so the shortfall below has both its operands on the page.
    expect(result).toContain(usdCents(parseMoney(F.defaults.planned) as number));
    expect(result).toContain(usdCents(r.shortfall));
    expect(result).toContain(usdCents(r.taxOnRequired));
    expect(result.indexOf(F.plannedResultLabel)).toBeLessThan(
      result.indexOf(F.shortfallLabel),
    );
  });

  it("keeps the penalty and the timing beside the answer", async () => {
    const html = await render();
    const r = compute();
    const result = resultRegion(html);
    expect(result).toContain(F.shortfallNotice);
    expect(result).toContain(usdCents(r.penalty));
    expect(result).toContain(formatDecimal(r.divisor!, 1));
    expect(result).toContain(F.timingTitle);
    expect(result).toContain(String(r.startAge));
    // The default reader is already past the start age, so the countdown
    // says so instead of rendering "0 năm".
    expect(r.alreadyRequired).toBe(true);
    expect(result).toContain(F.alreadyStartedValue);
    expect(result).not.toContain(`0 ${F.yearsUnit}`);
    expect(result).toContain(F.startAgeFromBirthYear);
  });

  it("keeps the projection and its table below", async () => {
    const html = await render();
    const r = compute();
    const detail = detailRegion(html);
    expect(detail).toContain(F.horizonTitle);
    expect(detail).toContain(usd(r.totalRequired));
    expect(detail).toContain(usd(r.finalBalance));
    expect(detail).toContain(String(r.peakAge));
    expect(detail).toContain(F.growingNotice);
    expect(detail).toContain(T.caption);
    expect(detail).toContain(T.intro);
    // The measured mobile-card decision survives the move.
    expect(detail).toContain("md:hidden");
    expect(resultRegion(html)).not.toContain(F.horizonTitle);
  });

  it("says the plan is met when it is", async () => {
    const html = await render({ planned: "40.000" });
    const r = compute({ planned: "40.000" });
    expect(r.planMeetsRequirement).toBe(true);
    const result = resultRegion(html);
    expect(result).toContain(F.metNotice);
    expect(result).not.toContain(F.shortfallNotice);
    expect(usdCents(r.penalty)).toBe("0,00 USD");
  });
});

describe("an empty row never stands unexplained", () => {
  it("names the not-yet-required state instead of two dashes", async () => {
    // Born in 1960, so the start age is 75 and a 73-year-old owes nothing —
    // even though the IRS table has a row for age 73.
    const r = compute({ birthYear: "1960" });
    expect(r.startAge).toBe(75);
    expect(r.alreadyRequired).toBe(false);
    expect(r.divisor).toBeNull();
    expect(r.requiredPercent).toBeNull();
    const result = resultRegion(await render({ birthYear: "1960" }));
    // Both rows carry the table's own words, not a dash.
    expect(count(result, T.notRequired)).toBe(2);
    expect(result).toContain(F.notRequiredNotice);
    expect(result).toContain(`${r.yearsUntilRequired} ${F.yearsUnit}`);
    expect(result).not.toContain(F.alreadyStartedValue);
  });

  it("separates a zero balance from a missing divisor", async () => {
    const r = compute({ balance: "0" });
    expect(r.divisor).not.toBeNull();
    expect(r.requiredPercent).toBeNull();
    const html = await render({ balance: "0" });
    const result = resultRegion(html);
    // A divisor exists, so the percentage's cause is the denominator.
    expect(result).toContain(F.noBalanceValue);
    expect(result).toContain(F.noBalanceNotice);
    expect(result).toContain(formatDecimal(r.divisor!, 1));
    expect(result).not.toContain(T.notRequired);
    // A valid zero is not a required-field error.
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).not.toContain(F.invalidNotice);
  });

  it("names a projection that never peaks", async () => {
    const r = compute({ returnPercent: "0" });
    expect(r.peakAge).toBeNull();
    const detail = detailRegion(await render({ returnPercent: "0" }));
    expect(detail).toContain(F.noPeakValue);
    expect(detail).toContain(F.decliningNotice);
    expect(detail).not.toContain(F.growingNotice);
  });

  it("explains a group-level refusal with no field flagged", async () => {
    // Every field is individually in range; the pair of ages is not.
    const html = await render({ endAge: "70" });
    expect(html).not.toContain('aria-invalid="true"');
    expect(resultRegion(html)).toContain(F.invalidNotice);
    expect(html).not.toContain(T.caption);
    expect(regionOrder(html)).toEqual(["form", "result", "detail"]);
  });

  it("marks a genuinely bad field", async () => {
    const html = await render({ birthYear: "" });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(F.yearInvalid);
    expect(resultRegion(html)).toContain(F.invalidNotice);
  });

  it("says nothing extra on the shipped defaults", async () => {
    const html = await render();
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).not.toContain(F.invalidNotice);
    expect(html).not.toContain(F.noBalanceNotice);
    expect(html).not.toContain(F.decliningNotice);
    expect(html).not.toContain(F.notRequiredNotice);
  });
});
