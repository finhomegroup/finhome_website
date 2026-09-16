import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { computeEducationSavings } from "@/lib/calc/education-savings";
import { formatMoney } from "@/lib/calc/number";
import { EDUCATION_SAVINGS as C } from "@/content/calculators/education-savings";

// The page's default state, i.e. the form defaults this same file publishes.
// Every figure quoted in the copy is re-derived from the module here rather
// than pinned as a literal, so a change to the module cannot leave the prose
// behind.
const DEFAULTS = {
  annualTuitionToday: 80_000_000,
  yearsUntilStart: 10,
  yearsOfStudy: 4,
  tuitionInflationPercent: 8,
  currentSavings: 200_000_000,
  investmentReturnPercent: 7,
};

function plan(over: Partial<typeof DEFAULTS> = {}) {
  const result = computeEducationSavings({ ...DEFAULTS, ...over });
  if (!result) throw new Error("computeEducationSavings returned null");
  return result;
}

/**
 * Prose writes a negative with the typographic minus U+2212 ("−280.396.228"),
 * while `formatMoney` emits the ASCII hyphen the page renders. Compare on a
 * common form instead of asserting one of the two spellings.
 */
function normalize(text: string): string {
  return text.replace(/−/g, "-");
}

const INTEREST_PARAGRAPH = C.formula.body.find((line) =>
  line.startsWith("Phần do lãi đóng góp"),
);

const HEADER_COMMENT = (() => {
  const file = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "education-savings.ts",
  );
  const source = readFileSync(file, "utf8");
  return normalize(source.slice(0, source.indexOf("export const")));
})();

describe("education-savings copy — figures reproduce from the module", () => {
  it("quotes the default target, nominal total and contribution", () => {
    const r = plan();
    const target = formatMoney(r.targetAtStart);
    const nominal = formatMoney(r.totalTuitionNominal);

    expect(target).toBe("700.601.379");
    expect(nominal).toBe("778.268.627");
    expect(C.streamNotice).toContain(target);
    expect(C.streamNotice).toContain(nominal);
    expect(C.form.table.intro).toContain(nominal);
    expect(C.formula.body[1]).toContain(target);
    expect(C.formula.body[2]).toContain(formatMoney(r.currentSavingsAtStart));
    expect(C.formula.body[2]).toContain(formatMoney(r.shortfallAtStart));
    expect(C.formula.body[3]).toContain(formatMoney(r.monthlyContribution!));
  });

  it("quotes the first and last year's tuition", () => {
    const r = plan();
    expect(C.formula.body[0]).toContain(formatMoney(r.years[0].tuition));
    expect(C.formula.body[0]).toContain(formatMoney(r.years[3].tuition));
    expect(C.streamNotice).toContain(formatMoney(r.years[0].tuition));
  });

  it("gives the last year of study the 13-year earning horizon it claims", () => {
    // Tuition is paid at the START of each year of study, so on the defaults
    // the money for year 4 is spent at t=13, not t=14. The FAQ used to say
    // "14 năm" by adding the 10-year wait to the 4-year course.
    const r = plan();
    expect(Math.max(...r.years.map((y) => y.yearsFromNow))).toBe(13);
    expect(C.faq.items[3].a).toContain("13 năm");
  });

  it("quotes the monthly contribution a 5-year wait produces", () => {
    const wait5 = plan({ yearsUntilStart: 5 });
    expect(formatMoney(wait5.monthlyContribution!)).toBe("2.757.284");
    expect(C.faq.items[3].a).toContain(formatMoney(wait5.monthlyContribution!));
  });
});

describe("education-savings copy — the interest row's definition", () => {
  it("states the identity that holds in the default, under-funded state", () => {
    const r = plan();
    expect(r.alreadyFunded).toBe(false);
    // "số kế hoạch SẼ CÓ vào ngày nhập học, trừ mọi đồng bạn bỏ vào". On a
    // solvable plan `fundedAtStart` is the target, so the figure the copy
    // quotes is unchanged — what changed is that the definition also holds
    // on the unfundable and over-funded states.
    expect(r.interestEarned).toBe(
      r.fundedAtStart - DEFAULTS.currentSavings - r.totalContributions,
    );
    expect(r.fundedAtStart).toBeCloseTo(r.targetAtStart, 4);
    expect(INTEREST_PARAGRAPH).toContain(formatMoney(r.interestEarned));
    expect(formatMoney(r.interestEarned)).toBe("285.107.899");
    // "hơn 40% mục tiêu" — 40,69%.
    expect(r.interestEarned / r.targetAtStart).toBeGreaterThan(0.4);
    expect(r.interestEarned / r.targetAtStart).toBeLessThan(0.41);
  });

  it("needs no exception on a heavily over-funded plan", () => {
    // The case that used to need a floor. Measured against the TARGET the
    // raw difference is −2.299.398.621 ₫, which is why the old definition had
    // to clamp; measured against what the plan HOLDS it is simply the growth
    // on 3 tỷ, and no clamp exists any more.
    const overfunded = plan({ currentSavings: 3_000_000_000 });
    expect(overfunded.alreadyFunded).toBe(true);
    expect(
      formatMoney(
        overfunded.targetAtStart - 3_000_000_000 - overfunded.totalContributions,
      ),
    ).toBe("-2.299.398.621");
    expect(overfunded.interestEarned).toBeCloseTo(
      3_000_000_000 * 1.07 ** 10 - 3_000_000_000,
      4,
    );
    expect(overfunded.interestEarned).toBeGreaterThan(0);
    // And the paragraph describes the definition without an exception clause.
    expect(INTEREST_PARAGRAPH).toContain("SẼ CÓ");
    expect(INTEREST_PARAGRAPH).not.toContain("Ngoại lệ");
  });

  it("reports NO interest, and the gap separately, with no time to save", () => {
    // The live-page defect: 314.513.997 ₫ of unfunded shortfall was rendered
    // as "Phần do lãi đóng góp" with zero months elapsed.
    const now = plan({ yearsUntilStart: 0, currentSavings: 10_000_000 });
    expect(now.noTimeToSave).toBe(true);
    expect(now.monthlyContribution).toBeNull();
    expect(now.interestEarned).toBe(0);
    expect(formatMoney(now.fundingGapAtStart)).toBe("314.513.997");
    // The copy says both of those things where the reader will be.
    expect(INTEREST_PARAGRAPH).toContain("chưa tháng nào trôi qua");
    expect(C.form.noTimeNotice).toContain("để trống");
    expect(C.form.noTimeNotice).toContain("phần do lãi bằng 0");
  });

  it("quotes the negative the copy promises at a −5% return", () => {
    const losing = plan({ investmentReturnPercent: -5 });
    expect(losing.alreadyFunded).toBe(false);
    expect(losing.interestEarned).toBeLessThan(0);
    expect(formatMoney(losing.interestEarned)).toBe("-280.396.228");
    expect(normalize(INTEREST_PARAGRAPH ?? "")).toContain(
      formatMoney(losing.interestEarned),
    );
  });

  it("quotes the growth a partly over-funded plan actually earns", () => {
    const partly = plan({ currentSavings: 600_000_000 });
    expect(partly.alreadyFunded).toBe(true);
    // 600 triệu is below the 700.601.379 ₫ target and only passes it after
    // ten years of growth. The figure is that growth — 580.290.814 ₫ — not
    // the 100.601.379 ₫ of the target it happened to cover.
    expect(600_000_000).toBeLessThan(partly.targetAtStart);
    expect(partly.currentSavingsAtStart).toBeGreaterThan(partly.targetAtStart);
    expect(formatMoney(partly.interestEarned)).toBe("580.290.814");
    expect(INTEREST_PARAGRAPH).toContain(formatMoney(partly.interestEarned));
  });

  it("holds the identity across every state, with no special case left", () => {
    // Swept, because the old definition needed a clamp whose condition the
    // copy had to describe. This one is `fundedAtStart − principal in`
    // everywhere, and its SIGN follows the return rather than the funding
    // state.
    for (const investmentReturnPercent of [-50, -20, -5, 0, 3, 7, 15]) {
      for (const currentSavings of [
        0, 200_000_000, 600_000_000, 700_601_379, 700_601_380, 900_000_000,
        3_000_000_000,
      ]) {
        for (const yearsUntilStart of [0, 1, 10]) {
          const r = plan({
            currentSavings,
            investmentReturnPercent,
            yearsUntilStart,
          });
          const label = `return ${investmentReturnPercent}%, savings ${currentSavings}, wait ${yearsUntilStart}`;
          expect(r.interestEarned, label).toBeCloseTo(
            r.fundedAtStart - currentSavings - r.totalContributions,
            6,
          );
          // Nothing elapsed means nothing earned, whatever the return.
          if (yearsUntilStart === 0) {
            expect(r.interestEarned, label).toBe(0);
          }
          // A non-negative return can never report negative growth.
          if (investmentReturnPercent >= 0) {
            expect(r.interestEarned, label).toBeGreaterThanOrEqual(0);
          }
        }
      }
    }
  });
});

describe("education-savings copy — provenance header", () => {
  it("records the figures the prose quotes", () => {
    const r = plan();
    for (const figure of [
      formatMoney(r.targetAtStart),
      formatMoney(r.totalTuitionNominal),
      formatMoney(r.currentSavingsAtStart),
      formatMoney(r.shortfallAtStart),
      formatMoney(r.monthlyContribution!),
      formatMoney(r.interestEarned),
      formatMoney(r.years[0].tuition),
      formatMoney(r.years[3].tuition),
      formatMoney(plan({ investmentReturnPercent: -5 }).interestEarned),
      formatMoney(plan({ currentSavings: 600_000_000 }).interestEarned),
      formatMoney(plan({ yearsUntilStart: 5 }).monthlyContribution!),
    ]) {
      expect(HEADER_COMMENT, `header comment is missing ${figure}`).toContain(
        figure,
      );
    }
  });
});
