/**
 * Rendered-markup contracts for `/cong-cu/gop-401k/` — plan row 48.
 *
 * WHAT THE ROW ASKED FOR: "Nhấn mạnh phần đối ứng bị bỏ lại; giữ các điều
 * kiện trước phần dự phóng." Half of the first clause was already true — the
 * group has led with the forfeited match since the page shipped — so this
 * pass added the `emphasis` and moved the five condition notices from BELOW
 * the statutory ladder, the horizon group and a seven-column table to
 * directly under the answer.
 *
 * WHAT MUST NOT CHANGE: `computeUs401k` is untouched, and so is the table's
 * measured `mobileCards` decision. Figures are derived from the engine, not
 * transcribed.
 *
 * NOT A VISUAL CHECK. `renderToStaticMarkup` in the runner's plain `node`
 * environment; no width, no layout, no browser.
 */
import { describe, expect, it, vi } from "vitest";
import { createElement, type ComponentType, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { markupRegion } from "@/lib/markup-region";
import { US_401K } from "@/content/calculators/us-401k";
import { TOOL_SHELL } from "@/content/calculators/tool-shell";
import { formatMoney, parseDecimal, parseMoney } from "@/lib/calc/number";
import { computeUs401k, type Us401kResult } from "@/lib/calc/us-401k";

const CONTENT_PATH = "@/content/calculators/us-401k";

const FORM_ID = "gop-401k-nhap";
const RESULT_ID = "gop-401k-ket-qua";

const F = US_401K.form;

type Defaults = Partial<Record<keyof typeof F.defaults, string>>;

/** Same `vi.doMock` lever as the other U-group render tests. */
async function render(
  defaults?: Defaults,
  props?: { actions?: ReactNode },
): Promise<string> {
  vi.resetModules();
  if (defaults !== undefined) {
    vi.doMock(CONTENT_PATH, async () => {
      const actual = (await vi.importActual(CONTENT_PATH)) as {
        US_401K: typeof US_401K;
      };
      return {
        US_401K: {
          ...actual.US_401K,
          form: {
            ...actual.US_401K.form,
            defaults: { ...actual.US_401K.form.defaults, ...defaults },
          },
        },
      };
    });
  }
  try {
    const loaded = (await import("@/components/us-401k-calculator")) as Record<
      string,
      ComponentType<{ actions?: ReactNode }>
    >;
    return renderToStaticMarkup(
      createElement(loaded.Us401kCalculator, props ?? null),
    );
  } finally {
    vi.doUnmock(CONTENT_PATH);
    vi.resetModules();
  }
}

/** The engine, fed exactly what the component feeds it. */
function compute(defaults: Defaults = {}): Us401kResult {
  const v = { ...F.defaults, ...defaults };
  const result = computeUs401k({
    year: Number(v.year),
    age: parseMoney(v.age) as number,
    annualSalary: parseMoney(v.salary) as number,
    priorYearWages: parseMoney(v.priorYearWages) as number,
    deferralPercent: parseDecimal(v.deferral) as number,
    employerMatchPercent: parseDecimal(v.matchPercent) as number,
    employerMatchLimitPercent: parseDecimal(v.matchLimit) as number,
    employerExtraPercent: parseDecimal(v.extra) as number,
    marginalRatePercent: parseDecimal(v.marginal) as number,
    returnPercent: parseDecimal(v.returnPercent) as number,
    years: parseMoney(v.years) as number,
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

describe("row 48 gets the shell contracts it never had", () => {
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
    // CORRECTED. The refusal this replaced argued that `.fh-cta-pin`'s
    // ≥1024×900 gate is where the split already keeps the answer beside the
    // form; `lg:items-start` holds the result column at the top of the grid,
    // so it does not. The measured precedent and the shelf-wide pinned /
    // unpinned table are in `components/u-long-form-cta.test.ts`.
    const html = await render();
    expect(html).toContain("fh-cta-pin");
    expect(html).toContain('data-calc-answer="true"');
  });
});

describe("the near-answer action slot", () => {
  /**
   * The route's reciprocal `toi-da-401k` link used to be `afterCalculator`,
   * which renders BELOW the full-width detail band — an independently measured
   * 2611,5 px (mobile) and 2286,5 px (desktop) past the end of the result
   * region. It is now passed into this slot. A stand-in node is used because
   * the link's copy is the route's, not the component's; what this file owns is
   * the POSITION the component gives whatever it is handed.
   */
  const MARKER = 'data-test="near-answer"';
  const actions = () =>
    createElement("div", { "data-test": "near-answer" }, "x");

  it("renders the slot inside the result column, above the detail band", async () => {
    const html = await render(undefined, { actions: actions() });
    expect(count(html, MARKER)).toBe(1);
    expect(resultRegion(html)).toContain(MARKER);
    expect(detailRegion(html)).not.toContain(MARKER);
  });

  it("puts it after the answer it acts on, not before it", async () => {
    const html = await render(undefined, { actions: actions() });
    const result = resultRegion(html);
    expect(result.indexOf(F.unclaimedLabel)).toBeLessThan(
      result.indexOf(MARKER),
    );
  });

  it("keeps it out of the live region, so it announces nothing", async () => {
    const html = await render(undefined, { actions: actions() });
    const live = markupRegion(html, 'data-results-live="true"');
    expect(live).not.toBeNull();
    expect(live!).not.toContain(MARKER);
    // Still ONE announcement, which is what `check:markup` enforces.
    expect(count(html, 'data-results-live="true"')).toBe(1);
  });

  it("renders nothing extra when the slot is empty", async () => {
    const html = await render();
    expect(html).not.toContain(MARKER);
    expect(regionOrder(html)).toEqual(["form", "result", "detail"]);
  });
});

describe("the forfeited match is the answer, not the first of four rows", () => {
  it("emphasises it, once, in the one live region", async () => {
    const html = await render();
    const r = compute();
    expect(r.unclaimedMatch).toBeGreaterThan(0);
    expect(count(html, "md:text-3xl")).toBe(1);
    expect(count(html, 'data-results-live="true"')).toBe(1);
    const result = resultRegion(html);
    expect(result).toContain(usdCents(r.unclaimedMatch));
    // The emphasised row is the forfeited one, not the match received — the
    // two figures are EQUAL on the shipped defaults, so position is the only
    // thing that distinguishes them.
    expect(r.employerMatch).toBe(r.unclaimedMatch);
    expect(result.indexOf(F.unclaimedLabel)).toBeLessThan(
      result.indexOf(F.matchLabel),
    );
    const emphasised = result.slice(
      result.indexOf(F.unclaimedLabel),
      result.indexOf(F.unclaimedHorizonLabel),
    );
    expect(emphasised).toContain("md:text-3xl");
  });

  it("keeps the horizon value of the forfeit right under it", async () => {
    const html = await render();
    const r = compute();
    const result = resultRegion(html);
    expect(result).toContain(usd(r.unclaimedMatchAtHorizon));
    expect(result.indexOf(F.unclaimedHorizonLabel)).toBeLessThan(
      result.indexOf(F.matchLabel),
    );
  });

  it("keeps the cost of claiming it beside the answer", async () => {
    const html = await render();
    const r = compute();
    const result = resultRegion(html);
    expect(result).toContain(F.yourMoneyTitle);
    expect(result).toContain(usdCents(r.netCostOfDeferral));
    // The percent that claims all of it: the one number the reader changes.
    expect(result).toContain(usdCents(r.matchThresholdAmount));
  });
});

describe("the conditions come before the projection, not after it", () => {
  it("puts all five notices above the detail region", async () => {
    const html = await render();
    expect(resultRegion(html)).toContain(F.unclaimedNotice);
    expect(html.indexOf(F.unclaimedNotice)).toBeLessThan(
      html.indexOf('data-calc-region="detail"'),
    );
    // And specifically above the horizon group they qualify.
    expect(html.indexOf(F.unclaimedNotice)).toBeLessThan(
      html.indexOf(F.horizonTitle),
    );
  });

  it("swaps to the full-match notice at the threshold", async () => {
    const r = compute({ deferral: "6" });
    expect(r.unclaimedMatch).toBe(0);
    const html = await render({ deferral: "6" });
    expect(html).toContain(F.fullMatchNotice);
    expect(html).not.toContain(F.unclaimedNotice);
  });

  it("names a capped deferral ahead of the projection it changes", async () => {
    const r = compute({ deferral: "60" });
    expect(r.deferralCapped).toBe(true);
    const html = await render({ deferral: "60" });
    expect(resultRegion(html)).toContain(F.cappedNotice);
    expect(html.indexOf(F.cappedNotice)).toBeLessThan(
      html.indexOf(F.projectedLabel),
    );
    // A deferral above the statutory ceiling is NOT an invalid field: the
    // tool answers with the maximum allowed and says so.
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).not.toContain(F.invalidNotice);
  });

  it("names the compensation cap, the least known of the four", async () => {
    const r = compute({ salary: "500.000" });
    expect(r.compensationCapped).toBe(true);
    const html = await render({ salary: "500.000" });
    expect(resultRegion(html)).toContain(F.compCappedNotice);
    expect(html).not.toContain('aria-invalid="true"');
    // The match stops at 6% of the plan ceiling, while the reader's own
    // deferral is NOT blocked by it.
    expect(detailRegion(html)).toContain(usd(r.planCompensation));
  });

  it("says nothing extra when the defaults hit no ceiling", async () => {
    const html = await render();
    expect(html).not.toContain(F.cappedNotice);
    expect(html).not.toContain(F.compCappedNotice);
    expect(html).not.toContain(F.excessNotice);
    expect(html).not.toContain(F.invalidNotice);
  });
});

describe("the statutory ladder and the comparison are disclosed", () => {
  it("puts the four ceilings behind their own summary", async () => {
    const html = await render();
    const r = compute();
    const detail = detailRegion(html);
    expect(detail).toContain(F.limitsDisclosureTitle);
    expect(detail).toContain(F.limitTitle);
    expect(count(detail, "<details")).toBe(1);
    expect(detail).toContain(usd(r.deferralLimit));
    expect(detail).toContain(usd(r.params.annualAdditions));
    expect(resultRegion(html)).not.toContain(F.limitTitle);
  });

  it("keeps the table's assumption with the table, both disclosed", async () => {
    const html = await render();
    const detail = detailRegion(html);
    expect(detail).toContain(F.table.intro);
    expect(detail).toContain(F.table.caption);
    // The measured mobile decision survives.
    expect(detail).toContain("md:hidden");
    // The threshold row is always present, so the column that reaches zero
    // is always visible: 6% is the shipped match limit.
    expect(detail).toContain("6%");
  });

  it("withholds every figure on an unusable year count, and says why", async () => {
    const html = await render({ years: "" });
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain(F.invalidNotice);
    expect(html).toContain(TOOL_SHELL.cta.invalidNote);
    expect(html).not.toContain(usdCents(compute().unclaimedMatch));
    // The table disappears rather than showing a grid of dashes, but the
    // regions and their order do not change.
    expect(html).not.toContain(F.table.caption);
    expect(regionOrder(html)).toEqual(["form", "result", "detail"]);
    expect(html).toContain("—");
  });

  it("treats a zero deferral as valid, and forfeits the whole match", async () => {
    const d = { deferral: "0" };
    const r = compute(d);
    expect(r.employerMatch).toBe(0);
    expect(r.unclaimedMatch).toBeGreaterThan(0);
    const html = await render(d);
    expect(html).not.toContain('aria-invalid="true"');
    expect(html).not.toContain(F.invalidNotice);
    expect(html).toContain(F.unclaimedNotice);
    expect(resultRegion(html)).toContain(usdCents(r.unclaimedMatch));
  });
});
