import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { formatMoney, formatPercent, parseMoney } from "@/lib/calc/number";
import {
  computeUsPayroll,
  PAYROLL_YEARS,
  PAYROLL_YEAR_ORDER,
  SELF_EMPLOYMENT_NET_EARNINGS_FACTOR,
  type FilingStatus,
} from "@/lib/calc/us-payroll";
import { US_PAYROLL_TAX as C } from "@/content/calculators/us-payroll-tax";

const D = C.form.defaults;

/** The component's own parse and wiring, reproduced — docs §6. */
function shipped() {
  return {
    wages: parseMoney(D.wages)!,
    filingStatus: D.status as FilingStatus,
    year: Number(D.year),
    // Widened deliberately. The defaults object is `as const`, so
    // `D.employment === "selfEmployed"` is a literal-type comparison tsc
    // rejects; the component compares form STATE, which is a plain string.
    // String() reproduces what the component actually does.
    selfEmployed: String(D.employment) === "selfEmployed",
  };
}

function payroll(over: Partial<ReturnType<typeof shipped>> = {}) {
  const input = { ...shipped(), ...over };
  const result = computeUsPayroll(input);
  if (!result) throw new Error("computeUsPayroll returned null");
  return { input, result };
}

/**
 * The page's own money formatting. `usd()` in the component is
 * `formatMoney(value, 2)`, but the prose writes round figures without cents,
 * so both shapes are needed and each assertion says which it means.
 */
const usd = (v: number) => formatMoney(v);
const usdCents = (v: number) => formatMoney(v, 2);

const HEADER_COMMENT = (() => {
  const file = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "us-payroll-tax.ts",
  );
  const source = readFileSync(file, "utf8");
  return source.slice(0, source.indexOf("export const"));
})();

describe("thue-luong-hoa-ky at its shipped defaults", () => {
  it("parses every default with the parser its field kind needs", () => {
    expect(shipped()).toEqual({
      wages: 100_000,
      filingStatus: "single",
      year: 2026,
      selfEmployed: false,
    });
    // "100.000" through parseDecimal would be 100 — a 1000x error, and the
    // page would open on 7,65 USD of FICA. docs §4.
    expect(shipped().wages).toBe(100_000);
  });

  it("opens on a year the model actually has, and on every year it offers", () => {
    // An unknown year returns null, so a select option the table does not
    // cover would render a page of blanks with no explanation.
    expect(PAYROLL_YEARS[shipped().year]).toBeDefined();
    for (const year of PAYROLL_YEAR_ORDER) {
      expect(
        computeUsPayroll({ ...shipped(), year }),
        `the year select offers ${year}, which computeUsPayroll rejects`,
      ).not.toBeNull();
    }
  });

  it("derives the wage base in the prose from the constant, not from a typed figure", () => {
    // docs §8 defect 8 and 19: a statutory figure written into a sentence is
    // a test fixture that has not been written yet. Bumping
    // PAYROLL_YEARS[2026].socialSecurityWageBase without editing this
    // sentence must be a red test, which is what row 55 already does for its
    // earnings-test amounts (us-social-security-payout.test.ts).
    //
    // The figure is asserted through formatMoney, NOT String(): the prose
    // correctly writes the Vietnamese-grouped "184.500", while
    // String(184500) is "184500" and appears nowhere on the page. Money goes
    // through the formatter; only a YEAR is safe to assert with String().
    const p = PAYROLL_YEARS[2026];
    expect(C.regressiveNotice).toContain(usd(p.socialSecurityWageBase));
    expect(C.regressiveNotice).toContain(String(p.year));
    // And the year in the sentence is the year the page opens on.
    expect(String(shipped().year)).toBe(String(p.year));
  });

  it("derives every surtax threshold in the prose from the constant", () => {
    // Four filing statuses, three distinct thresholds, all fixed in statute
    // since 2013. The sentence names them, so it has to move if they do.
    const thresholds = PAYROLL_YEARS[2026].additionalMedicareThreshold;
    const named = C.formula.body[2];
    for (const status of Object.keys(thresholds) as FilingStatus[]) {
      expect(
        named,
        `the surtax paragraph is missing the ${status} threshold`,
      ).toContain(usd(thresholds[status]));
    }
    // The non-indexation is the point of naming them at all.
    expect(named).toContain("2013");
    expect(C.regressiveNotice).toContain("2013");
  });

  it("quotes the 7,65% case the lede and the notice are built on", () => {
    const { result } = payroll();
    expect(usd(result.socialSecurityTax)).toBe("6.200");
    expect(usd(result.medicareTax)).toBe("1.450");
    expect(result.additionalMedicareTax).toBe(0);
    expect(usd(result.employeeTotal)).toBe("7.650");
    expect(formatPercent(result.effectiveRatePercent!, 2)).toBe("7,65%");
    expect(formatPercent(result.marginalRatePercent, 2)).toBe("7,65%");
  });

  it("quotes the falling marginal rate, which is the page's whole claim", () => {
    const below = payroll({ wages: 150_000 }).result;
    const above = payroll({ wages: 190_000 }).result;
    expect(formatPercent(below.marginalRatePercent, 2)).toBe("7,65%");
    expect(formatPercent(above.marginalRatePercent, 2)).toBe("1,45%");
    // Both figures the regressive notice puts side by side, and the
    // inequality it asserts between them.
    expect(above.marginalRatePercent).toBeLessThan(below.marginalRatePercent);
    for (const figure of [
      usd(150_000),
      usd(190_000),
      formatPercent(below.marginalRatePercent, 2),
      formatPercent(above.marginalRatePercent, 2),
    ]) {
      expect(
        C.regressiveNotice,
        `the regressive notice is missing ${figure}`,
      ).toContain(figure);
    }
  });

  it("quotes the high earner, capped, with the surtax on top", () => {
    const { result } = payroll({ wages: 300_000 });
    const base = PAYROLL_YEARS[2026].socialSecurityWageBase;
    expect(result.socialSecurityWages).toBe(base);
    expect(usd(result.socialSecurityTax)).toBe("11.439");
    expect(usd(result.medicareTax)).toBe("4.350");
    expect(usd(result.additionalMedicareWages)).toBe("100.000");
    expect(usd(result.additionalMedicareTax)).toBe("900");
    expect(usd(result.employeeTotal)).toBe("16.689");
    expect(formatPercent(result.effectiveRatePercent!, 2)).toBe("5,56%");
    // The cap is worth the Social Security tax on everything above it.
    expect(result.cappedSaving).toBeCloseTo((300_000 - base) * 0.062, 6);
  });

  it("backs the FAQ's 500.000-versus-100.000 effective-rate claim", () => {
    // FAQ 1 states it as a fact about the two rates, so assert the fact
    // rather than a formatted string: a wording change must not be able to
    // outlive the arithmetic.
    const rich = payroll({ wages: 500_000 }).result;
    const mid = payroll().result;
    expect(rich.employeeTotal).toBeGreaterThan(mid.employeeTotal);
    expect(rich.effectiveRatePercent!).toBeLessThan(mid.effectiveRatePercent!);
    const a = C.faq.items[0].a;
    expect(a).toContain(usd(500_000));
    expect(a).toContain(usd(100_000));
  });

  it("backs the FAQ's married-filing-separately surprise", () => {
    const separate = payroll({
      wages: 240_000,
      filingStatus: "marriedSeparate",
    }).result;
    const joint = payroll({ wages: 240_000, filingStatus: "married" }).result;
    expect(usd(separate.additionalMedicareWages)).toBe("115.000");
    // The claim that the joint filer owes no surtax at the same wage.
    expect(joint.additionalMedicareWages).toBe(0);
    expect(joint.additionalMedicareTax).toBe(0);
    const a = C.faq.items[1].a;
    for (const figure of [usd(240_000), usd(115_000)]) {
      expect(a, `FAQ 2 is missing ${figure}`).toContain(figure);
    }
    // And the threshold it says is lower than the single filer's really is.
    const t = PAYROLL_YEARS[2026].additionalMedicareThreshold;
    expect(t.marriedSeparate).toBeLessThan(t.single);
    expect(t.marriedSeparate).toBe(t.married / 2);
  });

  it("quotes the self-employed figure off the 92,35% base, not off 15,3%", () => {
    const { result } = payroll({ wages: 100_000, selfEmployed: true });
    expect(result.taxBase).toBeCloseTo(
      100_000 * SELF_EMPLOYMENT_NET_EARNINGS_FACTOR,
      6,
    );
    expect(usdCents(result.employeeTotal)).toBe("14.129,55");
    // 15,3% of the whole profit would be 15.300 — the error the paragraph
    // exists to head off.
    expect(result.employeeTotal).toBeLessThan(100_000 * 0.153);
    // A self-employed filer has already paid both halves.
    expect(result.employerTotal).toBe(0);
    const a = C.faq.items[2].a;
    expect(a).toContain(usdCents(result.employeeTotal));
    expect(a).toContain("92,35%");
  });

  it("does not claim to have recorded a source it does not show", () => {
    // The FAQ explaining why an unknown year is refused said the table holds
    // only the years "mà chúng tôi đã ghi rõ nguồn" — a claim that a citation
    // is recorded, made when no URL existed anywhere reachable from the page.
    // A `sources` block now exists and the route passes it, so the claim
    // would today be TRUE; the wording still stays out, because the sentence
    // is about the parameter table and the block cites the documents rather
    // than every year's figure. What the answer does instead is point at the
    // block, which is checkable, and the assertion below pins that pointer.
    const a = C.faq.items[4].a;
    expect(a).not.toContain("ghi rõ nguồn");
    expect(a).toContain("phần nguồn cuối trang");
    // The useful half — where to look up a year the table lacks — survives.
    expect(a).toContain("Cơ quan An sinh Xã hội Hoa Kỳ");
  });

  it("says out loud that it is FICA only, not a take-home-pay tool", () => {
    // The stated misuse risk for this row: a Vietnamese reader could take it
    // for a payslip calculator. There is no net-pay output to misread, and
    // the last paragraph of the method says so.
    expect(C.formula.body[5]).toContain("chỉ tính FICA");
    expect(C.formula.body[5]).toContain("không phải toàn bộ số thuế");
    expect(C.pageTitle).toContain("Hoa Kỳ");
  });
});

describe("thue-luong-hoa-ky's citations", () => {
  it("gives every source a real, openable https url with a note", () => {
    // The point of the slot: a reader can open it. A `sources` block whose
    // items carry an empty or relative url is a "Nguồn" heading over nothing,
    // which docs §3 says is worse than no heading. Notes are not optional on
    // THIS row: there is no rate field, so the note is the only place that
    // says which figure each document backs.
    expect(C.sources.items.length).toBeGreaterThanOrEqual(1);
    for (const item of C.sources.items) {
      expect(item.url.startsWith("https://")).toBe(true);
      expect(item.label.trim().length).toBeGreaterThan(10);
      expect(
        (item.note ?? "").trim().length,
        `${item.url} carries no note saying what it backs`,
      ).toBeGreaterThan(20);
    }
    // `CalculatorPage` keys the list on `item.url`, so a duplicate href is a
    // duplicate React key AND two lines a reader cannot tell apart.
    const urls = C.sources.items.map((item) => item.url);
    expect(new Set(urls).size).toBe(urls.length);
    // Primary bodies only: no aggregator, no blog, no news write-up.
    for (const url of urls) {
      expect(url, `${url} is not an irs.gov or ssa.gov document`).toMatch(
        /^https:\/\/www\.(irs|ssa)\.gov\//,
      );
    }
  });

  it("is actually passed to the route, so the citations render", () => {
    // The "content but no slot" failure: a declared block the page never
    // passes renders nothing at all — content/calculators/sources-wiring.test.ts
    // sweeps the whole suite for it, and this pins it for this row.
    const page = readFileSync(
      path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "../../app/cong-cu/thue-luong-hoa-ky/page.tsx",
      ),
      "utf8",
    );
    expect(page, "the route never passes sources").toContain(
      "sources={C.sources}",
    );
  });

  it("names the issuing body in the copy, not only in a href", () => {
    // A bare link is not an attribution: the reader should be able to tell
    // WHO publishes the figure without opening anything. Both bodies are
    // named because they do different jobs here — SSA publishes the annual
    // wage base, and the documents actually read were IRS ones.
    for (const text of [C.form.yearHelp, C.sources.intro]) {
      expect(text).toContain("Cơ quan An sinh Xã hội Hoa Kỳ");
      expect(text).toContain("Cơ quan Thuế vụ Hoa Kỳ");
      expect(text).toContain("IRS");
    }
  });

  it("puts each year's wage base where the year is chosen, derived from the table", () => {
    // The wage base is reachable through the bound `year` select, so the help
    // text on that select is where the figure belongs. Derived from
    // PAYROLL_YEARS, not typed: bumping a base without editing this sentence
    // has to go red, the same contract the regressive notice already has.
    for (const year of PAYROLL_YEAR_ORDER) {
      const base = PAYROLL_YEARS[year].socialSecurityWageBase;
      expect(
        C.form.yearHelp,
        `the year select's help text is missing ${year}'s wage base`,
      ).toContain(usd(base));
      expect(C.form.yearHelp).toContain(String(year));
      expect(
        C.sources.intro,
        `the sources intro is missing ${year}'s wage base`,
      ).toContain(usd(base));
    }
  });

  it("cites the document behind every figure that has no field", () => {
    const notes = C.sources.items
      .map((item) => `${item.label} ${item.note ?? ""}`)
      .join(" ");
    // The four rates, each in the exact string the page renders elsewhere.
    for (const rate of ["92,35%", "0,9%", "1,45%", "6,2%"]) {
      expect(
        `${notes} ${C.sources.intro}`,
        `no citation copy names the ${rate} the model applies`,
      ).toContain(rate);
    }
    // The three surtax thresholds, derived from the model rather than typed.
    const thresholds = PAYROLL_YEARS[2026].additionalMedicareThreshold;
    for (const status of Object.keys(thresholds) as FilingStatus[]) {
      expect(
        notes,
        `no source note carries the ${status} surtax threshold`,
      ).toContain(usd(thresholds[status]));
    }
    // And the documents themselves, by the names a reader can look up.
    for (const document of [
      "Topic no. 751",
      "Schedule SE",
      "Form 8959",
      "Publication 926",
    ]) {
      expect(notes, `no source names ${document}`).toContain(document);
    }
  });

  it("states the provenance limit rather than implying completeness", () => {
    // docs §3: `intro` is where the limit goes, because a list of official
    // links implies a completeness no page here has earned.
    const intro = C.sources.intro;
    expect(intro).toContain("rà soát nguồn của dự án");
    expect(intro).toContain("16/09/2026");
    expect(intro).toContain("không phải do trang tự tra lại");
    expect(intro).toContain("không phải danh sách đầy đủ");
    expect(intro).toContain("không phải tư vấn thuế");
    // The scope limit that matters most on this row: FICA only.
    expect(intro).toContain("chỉ tính FICA");
  });

  it("says which link was NOT read, on the link itself", () => {
    // ssa.gov refused every automated fetch during the review (HTTP 403), so
    // both wage bases were checked on IRS documents. A link that was not read
    // must not borrow the confidence of the ones that were — the same rule
    // `statutory-parameters.ts` applies to its own `provenance` field.
    const unread = C.sources.items.filter((item) =>
      item.url.startsWith("https://www.ssa.gov/"),
    );
    expect(unread.length).toBe(1);
    expect(unread[0].note).toContain("KHÔNG được đọc");
    expect(unread[0].note).toContain("403");
    // And the intro says the same thing, so a reader who skips the list sees it.
    expect(C.sources.intro).toContain("từ chối truy cập tự động");
  });
});

/**
 * THE RATES THIS ROW SHIPS, IN THE FORM THE STATUTORY REGISTRY NEEDS.
 *
 * `content/calculators/statutory-parameters.ts` has a single writer while
 * several rows are being cited in parallel, so this unit did not edit it.
 * What this block does is prove the `shipped` expressions proposed for that
 * file resolve and agree with the values checked against the IRS documents in
 * `C.sources`. The registry's own test asserts `shipped() === verified`; this
 * asserts the pair it will land with, and — the row-specific half — that each
 * value is a string the page really renders.
 *
 * `shipped` reads `lib/calc/us-payroll.ts` rather than a form default BECAUSE
 * these rates have no field, and it reads the year the page OPENS on, so a
 * change of default year cannot leave a citation describing rates the reader
 * is not being shown.
 */
describe("thue-luong-hoa-ky — the statutory rates a registry entry would quote", () => {
  const openYear = PAYROLL_YEARS[Number(C.form.defaults.year)];

  const proposed: readonly {
    label: string;
    shipped: () => string;
    verified: string;
  }[] = [
    {
      label: "Thuế suất Social Security (OASDI), mỗi bên",
      shipped: () => formatPercent(openYear.socialSecurityRate, 1),
      verified: "6,2%",
    },
    {
      label: "Thuế suất Medicare, mỗi bên",
      shipped: () => formatPercent(openYear.medicareRate, 2),
      verified: "1,45%",
    },
    {
      label: "Phụ thu Medicare, chỉ người lao động",
      shipped: () => formatPercent(openYear.additionalMedicareRate, 1),
      verified: "0,9%",
    },
    {
      label: "Hệ số thu nhập ròng của Schedule SE",
      shipped: () =>
        formatPercent(SELF_EMPLOYMENT_NET_EARNINGS_FACTOR * 100, 2),
      verified: "92,35%",
    },
  ];

  it.each(proposed.map((p) => [p.label, p] as const))(
    "%s reads the shipped constant and matches the checked value",
    (_label, parameter) => {
      expect(parameter.shipped()).toBe(parameter.verified);
      expect(parameter.shipped().length).toBeGreaterThan(0);
    },
  );

  it("renders every one of those values somewhere a reader can see", () => {
    // The pairing is only worth anything if the value is on the page. Each
    // rate appears in the citation copy and in the method or a field label,
    // so a rate change that skipped one of them still goes red.
    const visible = [
      C.sources.intro,
      C.sources.items.map((item) => item.note ?? "").join(" "),
      C.formula.body.join(" "),
      JSON.stringify(C.form),
    ].join(" ");
    for (const { verified } of proposed) {
      expect(visible, `${verified} is applied but never shown`).toContain(
        verified,
      );
    }
  });

  it("offers exactly the years its wage-base citations cover", () => {
    // A year in the select with no cited base is the gap this row was on the
    // uncited list for. 2025 is cited from the 2025 Schedule SE, 2026 from
    // Topic no. 751 and Publication 926 — so the select must not grow a third
    // year without a third citation.
    const notes = C.sources.items.map((item) => item.note ?? "").join(" ");
    for (const year of PAYROLL_YEAR_ORDER) {
      expect(notes, `no source note covers ${year}`).toContain(String(year));
    }
    expect([...PAYROLL_YEAR_ORDER]).toEqual([2026, 2025]);
  });
});

describe("thue-luong-hoa-ky — provenance header", () => {
  it("records every figure the prose quotes", () => {
    const mid = payroll().result;
    const high = payroll({ wages: 300_000 }).result;
    const below = payroll({ wages: 150_000 }).result;
    const above = payroll({ wages: 190_000 }).result;
    for (const figure of [
      usd(mid.socialSecurityTax),
      usd(mid.medicareTax),
      usd(mid.employeeTotal),
      formatPercent(mid.effectiveRatePercent!, 2),
      usd(high.socialSecurityTax),
      usd(high.medicareTax),
      usd(high.additionalMedicareWages),
      usd(high.additionalMedicareTax),
      usd(high.employeeTotal),
      formatPercent(high.effectiveRatePercent!, 2),
      usd(PAYROLL_YEARS[2026].socialSecurityWageBase),
      formatPercent(below.marginalRatePercent, 2),
      formatPercent(above.marginalRatePercent, 2),
    ]) {
      expect(HEADER_COMMENT, `header comment is missing ${figure}`).toContain(
        figure,
      );
    }
  });
});
