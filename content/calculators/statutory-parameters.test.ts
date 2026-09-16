import { describe, it, expect } from "vitest";
import {
  STATUTORY_PARAMETERS,
  STATUTORY_UNDECLARED,
  describeProblem,
  statutoryProblems,
  statutoryStatus,
  type StatutoryParameter,
} from "@/content/calculators/statutory-parameters";
import { getCalculator } from "@/content/calculators/registry";
import { TIP } from "@/content/calculators/tip";
import { PRICE_ADJUST } from "@/content/calculators/price-adjust";
import { AUTO_LEASE } from "@/content/calculators/auto-lease";
import { BUSINESS_FORECAST } from "@/content/calculators/business-forecast";
import { WACC } from "@/content/calculators/wacc";
import { STOCK_RETURN } from "@/content/calculators/stock-return";

/**
 * The dated half of "is this number right?".
 *
 * A `sources` block proves a value WAS correct when someone read the
 * instrument. It cannot notice the instrument running out, and the VAT
 * reduction to 8% does run out — 31/12/2026, written into Điều 2 khoản 1 of
 * Nghị định 174/2025/NĐ-CP. Two routes prefill that 8 and a third explains it.
 *
 * THE CLOCK IS QUARANTINED. `statutoryStatus` takes the date as an argument, so
 * everything below is deterministic except the single block marked LIVE, which
 * reads the real clock on purpose. That block is the time bomb detector.
 *
 * And it fails on EXPIRED ONLY. An earlier draft failed on "expiring within 90
 * days", which would have turned `pnpm gate` red from 02/10/2026 — blocking
 * every deploy for a rate that stays correct until 31/12. A gate that cries
 * three months early is a gate someone mutes. The reader is protected in the
 * meantime by "states its own expiry in the copy" below, which is what actually
 * matters to someone reading the page.
 */

const MODULE_COPY: Record<string, string> = {
  "tinh-tien-tip": JSON.stringify(TIP),
  "giam-gia-va-thue": JSON.stringify(PRICE_ADJUST),
  "thue-mua-xe": JSON.stringify(AUTO_LEASE),
  "du-bao-kinh-doanh": JSON.stringify(BUSINESS_FORECAST),
  wacc: JSON.stringify(WACC),
  "loi-nhuan-co-phieu": JSON.stringify(STOCK_RETURN),
};

/** `2026-12-31` -> `31/12/2026`, the form the Vietnamese copy uses. */
function vnDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const dated = STATUTORY_PARAMETERS.filter((p) => p.validUntil !== null);
const openEnded = STATUTORY_PARAMETERS.filter((p) => p.validUntil === null);

/**
 * "Names a numbered document a reader can look up", in either jurisdiction.
 *
 * Built as alternatives rather than one clever expression so that adding a
 * third jurisdiction is an obvious edit. What it must keep rejecting is the
 * thing it was written for: a citation that says only "theo quy định hiện
 * hành" or "per current IRS guidance" and leaves the reader nowhere to go.
 */
const NUMBERED_INSTRUMENT = new RegExp(
  [
    String.raw`\d+\/\d{4}\/[A-ZĐ]`, // Vietnamese: 174/2025/NĐ-CP, 109/2025/QH15
    String.raw`§\s*\d`, // § 223(f)(4), § 3101(a), § 1(h)
    String.raw`(?:U\.S\.C\.|IRC|Pub\.\s*L\.)\s*\d`, // 26 U.S.C. 3101, Pub. L. 119-21
    String.raw`(?:Rev\.\s*Proc\.|Notice)\s*\d{4}-\d`, // Rev. Proc. 2025-19
    String.raw`(?:Topic no\.|Publication|Pub\.|Form|Schedule)\s*\w*\s*\d`, // Topic no. 751
  ].join("|"),
);

describe("statutoryStatus — pure, against fixed dates", () => {
  const vat: StatutoryParameter = {
    slug: "x",
    label: "x",
    shipped: () => "8",
    verified: "8",
    instrument: "x",
    effectiveFrom: "2025-07-01",
    validUntil: "2026-12-31",
    onExpiry: "x",
    sourceUrl: "https://example.test/",
    provenance: "x",
  };

  it("reports a value that has not started yet", () => {
    expect(statutoryStatus(vat, "2025-06-30")).toBe("not-yet-effective");
  });

  it("is current on the first day and well inside the window", () => {
    expect(statutoryStatus(vat, "2025-07-01")).toBe("current");
    expect(statutoryStatus(vat, "2026-06-01")).toBe("current");
  });

  it("treats validUntil as INCLUSIVE, the way the instrument is written", () => {
    // "đến hết ngày 31 tháng 12 năm 2026" — the rate is still 8% on 31/12.
    // An exclusive bound would report the last valid day as expired, which is
    // an off-by-one that would have the gate red while the page was right.
    //
    // The claim is NOT EXPIRED, which is the safety-relevant one. This first
    // asserted `toBe("current")` on the final day with a zero lead, and that
    // expectation was simply wrong: zero days left satisfies "ending within
    // the lead window", so the honest answer is "expiring" — still valid, ends
    // today. Asserting both halves says what the boundary really does instead
    // of loosening the implementation to match a guess.
    expect(statutoryStatus(vat, "2026-12-31", 0)).not.toBe("expired");
    expect(statutoryStatus(vat, "2026-12-31", 0)).toBe("expiring");
    expect(statutoryStatus(vat, "2027-01-01", 0)).toBe("expired");
  });

  it("warns inside the lead window, and the boundary is the lead day itself", () => {
    expect(statutoryStatus(vat, "2026-10-02", 90)).toBe("expiring");
    // 91 days out with a 90-day lead is still merely current.
    expect(statutoryStatus(vat, "2026-10-01", 90)).toBe("current");
    // The lead is a parameter, not a constant: a wider lead catches it sooner.
    expect(statutoryStatus(vat, "2026-06-01", 365)).toBe("expiring");
  });

  it("never expires an open-ended parameter, however far out the date", () => {
    const exemption = { ...vat, validUntil: null };
    expect(statutoryStatus(exemption, "2099-01-01")).toBe("open-ended");
  });

  it("rejects a malformed date instead of silently reading NaN", () => {
    // `Date.parse` returns NaN for junk, and every comparison against NaN is
    // false — so a typo'd `validUntil` would make a parameter look permanently
    // current. That is the failure this throw exists to prevent.
    expect(() => statutoryStatus({ ...vat, validUntil: "31/12/2026" }, "2026-01-01")).toThrow(
      /not an ISO/,
    );
    expect(() => statutoryStatus(vat, "hôm nay")).toThrow(/not an ISO/);
  });
});

describe("the declared parameters describe what the suite actually ships", () => {
  it("has entries at all, of both kinds, so the sweeps cannot pass vacuously", () => {
    expect(STATUTORY_PARAMETERS.length).toBeGreaterThan(4);
    expect(dated.length, "no dated parameter left to guard").toBeGreaterThan(0);
    expect(openEnded.length, "no open-ended parameter to prove the other branch").toBeGreaterThan(0);
  });

  it("still rejects a citation a reader cannot look up", () => {
    // The widening that let US instruments through could have been done by
    // deleting the assertion. This is the control proving it was not: vague
    // authority still fails, in both languages.
    for (const vague of [
      "theo quy định hiện hành",
      "per current IRS guidance",
      "Luật Thuế giá trị gia tăng",
      "Internal Revenue Code",
      "SSA",
    ]) {
      expect(NUMBERED_INSTRUMENT.test(vague), `"${vague}" should not count`).toBe(false);
    }
    for (const real of [
      "Nghị định 174/2025/NĐ-CP, Điều 2 khoản 1",
      "Luật Thuế thu nhập cá nhân 109/2025/QH15, Điều 13 khoản 2",
      "Internal Revenue Code § 223(f)(4)",
      "26 U.S.C. § 3101(a)",
      "Rev. Proc. 2025-19",
      "IRS Topic no. 751",
      "Pub. L. 119-21",
    ]) {
      expect(NUMBERED_INSTRUMENT.test(real), `"${real}" should count`).toBe(true);
    }
  });

  it.each(STATUTORY_PARAMETERS.map((p) => [`${p.slug} — ${p.label}`, p] as const))(
    "%s quotes the value its page really prefills",
    (_name, parameter) => {
      // The pairing guard. `shipped` reads the content module live, so if a
      // default moves without the citation moving, this is what goes red —
      // rather than the page quietly rendering a number the citation does not
      // cover.
      expect(parameter.shipped()).toBe(parameter.verified);
      expect(parameter.shipped().length).toBeGreaterThan(0);
    },
  );

  it.each(STATUTORY_PARAMETERS.map((p) => [`${p.slug} — ${p.label}`, p] as const))(
    "%s points at a live row and a checkable instrument",
    (_name, parameter) => {
      expect(getCalculator(parameter.slug), `${parameter.slug} is not in the registry`).toBeDefined();
      expect(parameter.sourceUrl.startsWith("https://")).toBe(true);
      // An instrument a reader cannot look up is not a citation. Every entry
      // names a numbered document, not "quy định hiện hành".
      //
      // THIS PATTERN WAS VIETNAM-ONLY AND WRONG. It read
      // `/\d+\/\d{4}\/[A-ZĐ]/`, which is the shape of a Vietnamese decree
      // number — 174/2025/NĐ-CP. The intent was "names a numbered document";
      // what it actually asserted was "names a Vietnamese one". No US citation
      // can satisfy it: `26 U.S.C. § 3101(a)`, `IRC § 1402(a)`,
      // `Rev. Proc. 2025-19` and `Pub. L. 111-152` all fail. Three agents
      // citing IRS and SSA sources hit it simultaneously, which is how it
      // surfaced — the suite is a parity build of a United States reference
      // site, so roughly a third of its statutory parameters are US ones and
      // the guard excluded all of them by construction.
      expect(parameter.instrument).toMatch(NUMBERED_INSTRUMENT);
      expect(parameter.onExpiry.length).toBeGreaterThan(40);
      expect(parameter.provenance.length).toBeGreaterThan(40);
    },
  );

  it("makes every dated parameter state its own expiry on the page", () => {
    // THIS is the reader-facing guarantee, and it is why the live check below
    // can afford to fail only on real expiry: someone reading the page is told
    // the end date today, months before anything lapses.
    for (const parameter of dated) {
      const copy = MODULE_COPY[parameter.slug];
      expect(copy, `no copy wired for ${parameter.slug}`).toBeDefined();
      const shown = vnDate(parameter.validUntil!);
      // Asserted as a BOOLEAN, not `expect(copy).toContain(...)`. Staging a
      // failure to prove this guard fires showed why: `copy` is the whole
      // content module stringified, so a `toContain` failure printed every
      // string on the page — several thousand characters — and buried the one
      // fact the reader needs. A failure message is part of the guard.
      expect(
        copy.includes(shown),
        `/cong-cu/${parameter.slug}/ prefills ${parameter.label} at ` +
          `"${parameter.shipped()}", which expires on ${parameter.validUntil}, ` +
          `and no copy on the page states "${shown}"`,
      ).toBe(true);
    }
  });

  it("keeps the declared and undeclared lists disjoint", () => {
    // A row cannot be both cited-with-an-expiry and recorded-as-uncited. One
    // row may appear twice among the declared parameters — loi-nhuan-co-phieu
    // prefills two different statutory rates — so duplicates are compared
    // across the lists, not within them.
    const declared = new Set(STATUTORY_PARAMETERS.map((p) => p.slug));
    const overlap = STATUTORY_UNDECLARED.filter((u) => declared.has(u.slug)).map((u) => u.slug);
    expect(overlap, "recorded as uncited while also carrying a dated citation").toEqual([]);
  });

  it("records each uncited row against a real slug, with an actionable reason", () => {
    // NO NON-VACUITY FLOOR HERE, unlike every other sweep in this file, and
    // that is deliberate: an EMPTY list is the goal state. This assertion read
    // `expect(STATUTORY_UNDECLARED.length).toBeGreaterThan(0)` while seven rows
    // were still uncited, and it went red the moment the last one was cited —
    // punishing the work for being finished. A guard on a backlog has to allow
    // the backlog to reach zero; what it must keep checking is that whatever
    // REMAINS is actionable.
    for (const entry of STATUTORY_UNDECLARED) {
      expect(getCalculator(entry.slug), `${entry.slug} is not in the registry`).toBeDefined();
      // Long enough to say WHAT is uncited and why it has not been done, so the
      // next owner does not have to re-derive the gap.
      expect(entry.reason.length, `${entry.slug}'s reason is too thin to act on`).toBeGreaterThan(
        120,
      );
    }
  });
});

describe("LIVE — reads the real clock on purpose", () => {
  /** Today, UTC, as `YYYY-MM-DD`. The one non-deterministic line in this file. */
  const today = new Date().toISOString().slice(0, 10);

  it("ships no statutory value whose instrument has already run out", () => {
    const problems = statutoryProblems(today);
    const expired = problems.filter((p) => p.status === "expired");
    expect(
      expired.map(describeProblem).join("\n\n"),
      "a prefilled statutory value is past its instrument's end date",
    ).toBe("");

    const notYet = problems.filter((p) => p.status === "not-yet-effective");
    expect(
      notYet.map(describeProblem).join("\n\n"),
      "a prefilled statutory value is not in force yet",
    ).toBe("");
  });

  it("names anything inside the lead window without failing the gate for it", () => {
    // Deliberately not an expectation about the count. This surfaces the next
    // expiry while the value is still correct; turning it into a failure is
    // what an earlier draft got wrong.
    const expiring = statutoryProblems(today).filter((p) => p.status === "expiring");
    if (expiring.length > 0) {
      console.warn(
        `\n[statutory] ${expiring.length} prefilled value(s) expire within 90 days:\n` +
          expiring.map(describeProblem).join("\n\n"),
      );
    }
    // What IS asserted: the helper stays usable, so this block cannot rot into
    // a no-op that silently stops reporting.
    expect(Array.isArray(expiring)).toBe(true);
    for (const problem of expiring) {
      expect(describeProblem(problem)).toContain(problem.parameter.slug);
      expect(describeProblem(problem)).toContain("Căn cứ:");
    }
  });
});
