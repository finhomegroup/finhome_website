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
    expect(C.formula.body[3]).toContain(formatMoney(r.monthlyContribution));
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
    expect(formatMoney(wait5.monthlyContribution)).toBe("2.757.284");
    expect(C.faq.items[3].a).toContain(formatMoney(wait5.monthlyContribution));
  });
});

describe("education-savings copy — the interest row's definition", () => {
  it("states the identity that holds in the default, under-funded state", () => {
    const r = plan();
    expect(r.alreadyFunded).toBe(false);
    // "số cần có trừ đi mọi thứ bạn bỏ vào — cả tiền có sẵn và tổng các khoản
    // góp". Exact float subtraction, so an exact reference is fair here.
    expect(r.interestEarned).toBe(
      r.targetAtStart - DEFAULTS.currentSavings - r.totalContributions,
    );
    expect(INTEREST_PARAGRAPH).toContain(formatMoney(r.interestEarned));
    expect(formatMoney(r.interestEarned)).toBe("285.107.899");
    // "hơn 40% mục tiêu" — 40,69%.
    expect(r.interestEarned / r.targetAtStart).toBeGreaterThan(0.4);
    expect(r.interestEarned / r.targetAtStart).toBeLessThan(0.41);
  });

  it("does NOT state that identity unconditionally, because the module floors it", () => {
    // The floor: today's savings already exceed the target outright, so no
    // contribution is needed and the raw difference would be a large negative.
    // This is the case the copy used to describe wrongly.
    const overfunded = plan({ currentSavings: 3_000_000_000 });
    const raw =
      overfunded.targetAtStart - 3_000_000_000 - overfunded.totalContributions;
    expect(overfunded.alreadyFunded).toBe(true);
    expect(overfunded.interestEarned).toBe(0);
    expect(formatMoney(raw)).toBe("-2.299.398.621");
    // So the paragraph must carry the exception, and must not stop at the
    // identity.
    expect(INTEREST_PARAGRAPH).toContain("Ngoại lệ");
    expect(INTEREST_PARAGRAPH).toContain("0 ₫");
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

  it("quotes the still-positive share of a partly over-funded plan", () => {
    const partly = plan({ currentSavings: 600_000_000 });
    expect(partly.alreadyFunded).toBe(true);
    // 600 triệu is below the 700.601.379 ₫ target and only passes it after ten
    // years of growth, so the floor is inactive and the share stays positive.
    expect(600_000_000).toBeLessThan(partly.targetAtStart);
    expect(partly.currentSavingsAtStart).toBeGreaterThan(partly.targetAtStart);
    expect(formatMoney(partly.interestEarned)).toBe("100.601.379");
    expect(INTEREST_PARAGRAPH).toContain(formatMoney(partly.interestEarned));
  });

  it("floors the row exactly when already funded AND savings today beat the target", () => {
    // This is the condition the copy names ("số tiền bạn đã có ngay hôm nay
    // còn lớn hơn cả mục tiêu, nên không phải góp thêm đồng nào"). Swept so
    // that "ngoại lệ duy nhất" is a measured claim rather than a guess.
    for (const investmentReturnPercent of [-50, -20, -5, 0, 3, 7, 15]) {
      for (const currentSavings of [
        0, 200_000_000, 600_000_000, 700_601_379, 700_601_380, 900_000_000,
        3_000_000_000,
      ]) {
        const r = plan({ currentSavings, investmentReturnPercent });
        const raw = r.targetAtStart - currentSavings - r.totalContributions;
        const floored = r.interestEarned === 0 && raw < 0;
        expect(
          floored,
          `return ${investmentReturnPercent}%, savings ${currentSavings}`,
        ).toBe(r.alreadyFunded && currentSavings > r.targetAtStart);
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
      formatMoney(r.monthlyContribution),
      formatMoney(r.interestEarned),
      formatMoney(r.years[0].tuition),
      formatMoney(r.years[3].tuition),
      formatMoney(plan({ investmentReturnPercent: -5 }).interestEarned),
      formatMoney(plan({ currentSavings: 600_000_000 }).interestEarned),
      formatMoney(plan({ yearsUntilStart: 5 }).monthlyContribution),
    ]) {
      expect(HEADER_COMMENT, `header comment is missing ${figure}`).toContain(
        figure,
      );
    }
  });
});
